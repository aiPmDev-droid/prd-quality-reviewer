import { NextRequest, NextResponse } from "next/server";
import { reviewPRD } from "@/lib/gemini";
import type { ReviewResponse, ReviewRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: ReviewRequest = await request.json();

    if (!body.prdText || body.prdText.trim().length < 50) {
      return NextResponse.json(
        {
          error: "PRD text is too short. Please paste a complete PRD (at least 50 characters).",
        },
        { status: 400 }
      );
    }

    const rawJson = await reviewPRD(body.prdText);

    // Parse the response — it may be wrapped in markdown fences or have extra text
    let parsed: ReviewResponse;
    try {
      // Strip markdown fences if present
      const cleaned = rawJson
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If parsing fails, return the raw text for debugging
      return NextResponse.json(
        {
          error: "Failed to parse Gemini response as JSON.",
          raw: rawJson,
        },
        { status: 500 }
      );
    }

    // Validate the parsed response has expected fields
    if (
      typeof parsed.overall !== "number" ||
      !parsed.smart ||
      typeof parsed.smart.specific?.score !== "number"
    ) {
      return NextResponse.json(
        {
          error: "Gemini returned an unexpected response format.",
          raw: rawJson,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}