import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    const filename = (await params).filename;
    if (!filename) {
        return new NextResponse("Filename is required", { status: 400 });
    }

    // Path to the videos directory
    const videoPath = path.join(process.cwd(), "videos", filename);

    if (!fs.existsSync(videoPath)) {
        return new NextResponse("Video not found", { status: 404 });
    }

    const fileStat = fs.statSync(videoPath);
    const fileSize = fileStat.size;
    const range = request.headers.get("range");

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
            return new NextResponse(null, {
                status: 416,
                headers: {
                    "Content-Range": `bytes */${fileSize}`,
                },
            });
        }

        const chunksize = end - start + 1;
        const file = fs.createReadStream(videoPath, { start, end });

        // Use a custom Response to handle the stream
        const stream = new ReadableStream({
            start(controller) {
                file.on("data", (chunk) => controller.enqueue(chunk));
                file.on("end", () => controller.close());
                file.on("error", (err) => controller.error(err));
            },
        });

        return new NextResponse(stream, {
            status: 206,
            headers: {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize.toString(),
                "Content-Type": "video/mp4",
            },
        });
    } else {
        const stream = new ReadableStream({
            start(controller) {
                const file = fs.createReadStream(videoPath);
                file.on("data", (chunk) => controller.enqueue(chunk));
                file.on("end", () => controller.close());
                file.on("error", (err) => controller.error(err));
            },
        });

        return new NextResponse(stream, {
            headers: {
                "Content-Length": fileSize.toString(),
                "Content-Type": "video/mp4",
            },
        });
    }
}
