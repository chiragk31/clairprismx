import { reviewPullRequest } from "@/module/ai/actions";
import { stat } from "fs";
import { NextResponse, NextRequest } from "next/server";
import { act } from "react";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = request.headers.get("X-GitHub-Event");
    if (event === "ping") {
      return NextResponse.json({ message: "pong" }, { status: 200 });
    }
    if (event === "pull_request") {
      const action = body.action;
      const repo = body.repository.full_name;
      const prNumber = body.number;
      const [owner, repoName] = repo.split("/");
      if (action === "opened" || action === "synchronize") {
        reviewPullRequest(owner, repoName, prNumber)
          .then(() => console.log(`Reviewed PR #${prNumber} in ${repo}`))
          .catch((error) =>
            console.error(`Error reviewing PR #${prNumber} in ${repo}:`, error),
          );
      }
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
