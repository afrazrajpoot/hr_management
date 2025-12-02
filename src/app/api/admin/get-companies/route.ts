// /app/api/users/hr-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Authorization - Only ADMIN can access
        if (session.user.role !== 'Admin') {
            return NextResponse.json(
                { error: 'Forbidden. Admin access required.' },
                { status: 403 }
            );
        }

        // Parse query parameters
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const department = searchParams.get('department');
        const hasCompany = searchParams.get('hasCompany');
        const companyId = searchParams.get('companyId');
        const isPaid = searchParams.get('paid');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            role: 'HR'
        };

        // Search filter
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { hrId: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Department filter
        if (department) {
            where.department = {
                has: department
            };
        }

        // Company filter (has hrId or not)
        if (hasCompany === 'true') {
            where.hrId = { not: null };
        } else if (hasCompany === 'false') {
            where.hrId = null;
        }

        // Paid filter
        if (isPaid === 'true') {
            where.paid = true;
        } else if (isPaid === 'false') {
            where.paid = false;
        }

        // Get specific company's HR IDs if filtering by company
        let companyUserIds: string[] = [];
        if (companyId) {
            const company = await prisma.company.findUnique({
                where: { id: companyId },
                select: { hrId: true }
            });

            if (company && company.hrId.length > 0) {
                companyUserIds = company.hrId; // This contains user IDs
                where.id = { in: companyUserIds };
            } else {
                return NextResponse.json({
                    success: true,
                    message: 'No HR users found for this company',
                    data: {
                        users: [],
                        companies: [],
                        groupedByCompany: {}
                    },
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        totalPages: 0
                    }
                }, { status: 200 });
            }
        }

        // Fetch HR users with pagination
        const [hrUsers, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    employee: {
                        select: {
                            id: true,
                            employeeId: true,
                            firstName: true,
                            lastName: true,
                            manager: true,
                            hireDate: true,
                            avatar: true
                        }
                    }
                },
                orderBy: {
                    [sortBy]: sortOrder
                },
                skip,
                take: limit
            }),
            prisma.user.count({ where })
        ]);

        // Count jobs and applications
        const usersWithCounts = await Promise.all(
            hrUsers.map(async (user) => {
                const [jobCount, applicationCount] = await Promise.all([
                    prisma.job.count({ where: { recruiterId: user.id } }),
                    prisma.application.count({ where: { userId: user.id } })
                ]);

                return {
                    ...user,
                    jobCount,
                    applicationCount
                };
            })
        );

        // Get all user IDs
        const userIds = usersWithCounts.map(user => user.id);

        // Fetch all companies
        const allCompanies = await prisma.company.findMany({
            select: {
                id: true,
                companyDetail: true,
                hrId: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Create a map of userId to company
        const userIdToCompanyMap = new Map<string, any>();
        allCompanies.forEach(company => {
            if (company.hrId && Array.isArray(company.hrId)) {
                company.hrId.forEach(userId => {
                    userIdToCompanyMap.set(userId, company);
                });
            }
        });

        // Combine user data with company info
        const usersWithCompany = usersWithCounts.map(user => {
            const company = userIdToCompanyMap.get(user.id);

            // Parse companyDetail
            let companyDetail = {};
            if (company?.companyDetail) {
                try {
                    companyDetail = typeof company.companyDetail === 'string'
                        ? JSON.parse(company.companyDetail)
                        : company.companyDetail;
                } catch (error) {
                    companyDetail = {};
                }
            }

            return {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                paid: user.paid,
                amount: user.amount,
                quota: user.quota,
                department: user.department,
                hrId: user.hrId,
                position: user.position,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                image: user.image,
                employee: user.employee,
                jobCount: user.jobCount,
                applicationCount: user.applicationCount,
                company: company ? {
                    id: company.id,
                    companyDetail: companyDetail,
                    name: companyDetail?.name || 'Unnamed Company',
                    hrIds: company.hrId,
                    createdAt: company.createdAt,
                    updatedAt: company.updatedAt
                } : null,
                hasCompany: !!company
            };
        });

        // Calculate HR user count for each company
        const companiesWithStats = allCompanies.map(company => {
            const hrUsersInCompany = usersWithCompany.filter(
                user => company.hrId && company.hrId.includes(user.id)
            );

            let companyDetail = {};
            if (company.companyDetail) {
                try {
                    companyDetail = typeof company.companyDetail === 'string'
                        ? JSON.parse(company.companyDetail)
                        : company.companyDetail;
                } catch (error) {
                    companyDetail = {};
                }
            }

            return {
                id: company.id,
                companyDetail: companyDetail,
                name: companyDetail?.name || 'Unnamed Company',
                hrIds: company.hrId,
                hrUserCount: hrUsersInCompany.length,
                createdAt: company.createdAt,
                updatedAt: company.updatedAt
            };
        });

        // Group users by company
        const usersByCompany: Record<string, any> = {};
        usersWithCompany.forEach(user => {
            if (user.company) {
                const companyId = user.company.id;
                if (!usersByCompany[companyId]) {
                    usersByCompany[companyId] = {
                        company: user.company,
                        users: [],
                        userCount: 0
                    };
                }
                usersByCompany[companyId].users.push(user);
                usersByCompany[companyId].userCount++;
            } else {
                if (!usersByCompany['no-company']) {
                    usersByCompany['no-company'] = {
                        company: null,
                        users: [],
                        userCount: 0
                    };
                }
                usersByCompany['no-company'].users.push(user);
                usersByCompany['no-company'].userCount++;
            }
        });

        // Statistics
        const statistics = {
            totalHrUsers: totalCount,
            currentPageCount: usersWithCompany.length,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            withCompany: usersWithCompany.filter(u => u.hasCompany).length,
            withoutCompany: usersWithCompany.filter(u => !u.hasCompany).length,
            paidUsers: usersWithCompany.filter(u => u.paid).length,
            unpaidUsers: usersWithCompany.filter(u => !u.paid).length,
            totalCompanies: companiesWithStats.length,
            totalJobs: usersWithCompany.reduce((sum, user) => sum + user.jobCount, 0),
            totalApplications: usersWithCompany.reduce((sum, user) => sum + user.applicationCount, 0)
        };

        // Current user info
        const currentUser = {
            id: session.user.id,
            name: session.user.name || `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim(),
            email: session.user.email || '',
            role: session.user.role
        };

        return NextResponse.json({
            success: true,
            requestedBy: currentUser,
            filters: {
                search,
                department,
                hasCompany,
                companyId,
                isPaid,
                sortBy,
                sortOrder
            },
            statistics,
            data: {
                users: usersWithCompany,
                companies: companiesWithStats
            },
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin HR users API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error.message
            },
            { status: 500 }
        );
    }
}

// PATCH endpoint to update user quota, amount, and paid status
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'Admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId, paid, amount, quota } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Validate input
        const updateData: any = {};
        if (typeof paid === 'boolean') updateData.paid = paid;
        if (typeof amount === 'number') updateData.amount = amount;
        if (typeof quota === 'number') updateData.quota = quota;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                paid: true,
                amount: true,
                quota: true,
                updatedAt: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        }, { status: 200 });

    } catch (error: any) {
        console.error('Update user error:', error);

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error.message
            },
            { status: 500 }
        );
    }
}