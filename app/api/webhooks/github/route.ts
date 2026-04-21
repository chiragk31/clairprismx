import { stat } from "fs";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = request.headers.get("X-GitHub-Event");
    if (event === "ping") {
      return NextResponse.json({ message: "pong" }, { status: 200 });
    }
    // Handle other events here
    return NextResponse.json({ message: "Event received" }, { status: 200 });
  } catch (error) {
    console.error("Error processing GitHub webhook:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
