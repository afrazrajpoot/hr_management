// Diagnostic endpoint to check database connections and locks
// Access: GET /api/diagnostics
// This helps identify connection pool exhaustion, blocking queries, and Node runtime pressure.

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import v8 from "v8";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

// Bump this string whenever you want to confirm prod is running the latest diagnostics.
const diagnosticsVersion = "2025-12-28T06:00Z";

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) =>
			setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
		),
	]);
}

export async function GET() {
	const startedAt = Date.now();

	const diagnostics: Record<string, any> = {
		diagnosticsVersion,
		timestamp: new Date().toISOString(),
		checks: {},
	};

	// 1) Basic connection test
	try {
		const t0 = Date.now();
		await withTimeout(prisma.$queryRaw`SELECT 1 as ok`, 5000, "basicConnection");
		diagnostics.checks.basicConnection = { status: "ok", latencyMs: Date.now() - t0 };
	} catch (error: any) {
		diagnostics.checks.basicConnection = { status: "error", error: error?.message || String(error) };
	}

	// 2) Connection counts (cast to int to avoid BigInt JSON issues)
	try {
		type ConnectionRow = {
			total: number;
			active: number;
			idle: number;
			idle_in_transaction: number;
			waiting_on_lock: number;
		};

		const connections = await withTimeout<ConnectionRow[]>(
			prisma.$queryRaw<ConnectionRow[]>`
				SELECT
					count(*)::int AS total,
					count(*) FILTER (WHERE state = 'active')::int AS active,
					count(*) FILTER (WHERE state = 'idle')::int AS idle,
					count(*) FILTER (WHERE state = 'idle in transaction')::int AS idle_in_transaction,
					count(*) FILTER (WHERE wait_event_type = 'Lock')::int AS waiting_on_lock
				FROM pg_stat_activity
				WHERE datname = current_database();
			`,
			5000,
			"connections"
		);

		const row = connections[0];
		diagnostics.checks.connections = { status: "ok", ...row };

		if (row.idle_in_transaction > 0 || row.waiting_on_lock > 0) {
			diagnostics.warnings = diagnostics.warnings || [];
			if (row.idle_in_transaction > 0) {
				diagnostics.warnings.push(
					`${row.idle_in_transaction} connections are "idle in transaction" (possible leak/stuck tx)`
				);
			}
			if (row.waiting_on_lock > 0) {
				diagnostics.warnings.push(`${row.waiting_on_lock} connections waiting on locks`);
			}
		}
	} catch (error: any) {
		diagnostics.checks.connections = { status: "error", error: error?.message || String(error) };
	}

	// 3) Long running queries
	try {
		type LongQueryRow = {
			pid: number;
			state: string;
			duration_seconds: number;
			wait_event_type: string | null;
			wait_event: string | null;
			query_preview: string;
		};

		const longQueries = await withTimeout<LongQueryRow[]>(
			prisma.$queryRaw<LongQueryRow[]>`
				SELECT
					pid,
					state,
					EXTRACT(EPOCH FROM (now() - query_start))::integer AS duration_seconds,
					wait_event_type,
					wait_event,
					LEFT(query, 100) AS query_preview
				FROM pg_stat_activity
				WHERE datname = current_database()
					AND state != 'idle'
					AND query_start < now() - interval '5 seconds'
				ORDER BY query_start
				LIMIT 5;
			`,
			5000,
			"longRunningQueries"
		);

		diagnostics.checks.longRunningQueries = {
			status: longQueries.length > 0 ? "warning" : "ok",
			count: longQueries.length,
			queries: longQueries.map((q) => ({
				pid: q.pid,
				state: q.state,
				durationSeconds: q.duration_seconds,
				waitEvent: q.wait_event_type ? `${q.wait_event_type}:${q.wait_event}` : null,
				queryPreview: q.query_preview,
			})),
		};

		if (longQueries.length > 0) {
			diagnostics.warnings = diagnostics.warnings || [];
			diagnostics.warnings.push(`${longQueries.length} queries running longer than 5 seconds`);
		}
	} catch (error: any) {
		diagnostics.checks.longRunningQueries = { status: "error", error: error?.message || String(error) };
	}

	// 4) Locks
	try {
		type LockRow = {
			blocked_pid: number;
			blocking_pid: number;
			blocked_query: string | null;
			blocking_query: string | null;
		};

		const locks = await withTimeout<LockRow[]>(
			prisma.$queryRaw<LockRow[]>`
				SELECT
					blocked_locks.pid AS blocked_pid,
					blocking_locks.pid AS blocking_pid,
					blocked_activity.query AS blocked_query,
					blocking_activity.query AS blocking_query
				FROM pg_catalog.pg_locks blocked_locks
				JOIN pg_catalog.pg_stat_activity blocked_activity
					ON blocked_activity.pid = blocked_locks.pid
				JOIN pg_catalog.pg_locks blocking_locks
					ON blocking_locks.locktype = blocked_locks.locktype
					AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
					AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
					AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
					AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
					AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
					AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
					AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
					AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
					AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
					AND blocking_locks.pid != blocked_locks.pid
				JOIN pg_catalog.pg_stat_activity blocking_activity
					ON blocking_activity.pid = blocking_locks.pid
				WHERE NOT blocked_locks.granted
				LIMIT 5;
			`,
			5000,
			"locks"
		);

		diagnostics.checks.locks = {
			status: locks.length > 0 ? "critical" : "ok",
			blockedQueries: locks.length,
			details: locks.map((l) => ({
				blockedPid: l.blocked_pid,
				blockingPid: l.blocking_pid,
				blockedQuery: l.blocked_query?.substring(0, 100) || null,
				blockingQuery: l.blocking_query?.substring(0, 100) || null,
			})),
		};

		if (locks.length > 0) {
			diagnostics.warnings = diagnostics.warnings || [];
			diagnostics.warnings.push(`${locks.length} queries are blocked waiting for locks`);
		}
	} catch (error: any) {
		diagnostics.checks.locks = { status: "error", error: error?.message || String(error) };
	}

	// 5) Node memory + runtime
	const memUsage = process.memoryUsage();
	const heapStats = v8.getHeapStatistics();

	diagnostics.checks.memory = {
		status: "ok",
		heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
		heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
		heapLimitMB: Math.round(heapStats.heap_size_limit / 1024 / 1024),
		rssMB: Math.round(memUsage.rss / 1024 / 1024),
		externalMB: Math.round(memUsage.external / 1024 / 1024),
	};

	diagnostics.checks.runtime = {
		status: "ok",
		nodeVersion: process.version,
		execArgv: process.execArgv,
		nodeOptions: process.env.NODE_OPTIONS || null,
		pid: process.pid,
		uptimeSeconds: Math.round(process.uptime()),
	};

	// Warning if heap is getting tight within the currently allocated heapTotal.
	// Note: heapTotal can grow up to heapLimitMB; this just flags GC pressure.
	if (memUsage.heapTotal > 0 && memUsage.heapUsed / memUsage.heapTotal > 0.9) {
		diagnostics.warnings = diagnostics.warnings || [];
		diagnostics.warnings.push("High heap usage (>90% of current heapTotal)");
		diagnostics.checks.memory.status = "warning";
	}

	diagnostics.totalTimeMs = Date.now() - startedAt;
	diagnostics.overallStatus = diagnostics.warnings?.length ? "issues_detected" : "healthy";

	return NextResponse.json(diagnostics);
}

// POST endpoint to kill stuck connections (use with caution!)
export async function POST(request: Request) {
	try {
		const { action, pid } = await request.json();

		if (action === "terminate" && pid) {
			const result = await withTimeout(
				prisma.$queryRaw`SELECT pg_terminate_backend(${pid}) as terminated`,
				5000,
				"terminate"
			);
			return NextResponse.json({ success: true, result, message: `Terminated PID ${pid}` });
		}

		if (action === "terminate_idle_in_transaction") {
			const result = await withTimeout(
				prisma.$queryRaw`
					SELECT pg_terminate_backend(pid) as terminated
					FROM pg_stat_activity
					WHERE datname = current_database()
						AND state = 'idle in transaction'
						AND query_start < now() - interval '5 minutes';
				`,
				5000,
				"terminate_idle_in_transaction"
			);
			return NextResponse.json({ success: true, result, message: "Terminated idle-in-transaction connections" });
		}

		return NextResponse.json({ error: "Invalid action" }, { status: 400 });
	} catch (error: any) {
		return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
	}
}
