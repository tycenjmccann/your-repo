import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queryEventsForRange } from "@/services/metrics/queryBuilder";
import {
  computeDurations,
  computePerAgentMetrics,
  computePerWorkflowMetrics,
  computeSystemWideMetrics,
} from "@/services/metrics/aggregator";
import { MetricsResponse, TimeRange } from "@/services/metrics/types";

const rangeSchema = z.enum(["1h", "6h", "24h", "7d"]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range") ?? "24h";

    const parsed = rangeSchema.safeParse(rangeParam);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "INVALID_RANGE",
          message: "range must be one of: 1h, 6h, 24h, 7d",
        },
        { status: 400 }
      );
    }

    const range: TimeRange = parsed.data;
    const events = await queryEventsForRange(range);
    const durations = computeDurations(events);

    const response: MetricsResponse = {
      range,
      computedAt: new Date().toISOString(),
      perAgent: computePerAgentMetrics(events, durations),
      perWorkflow: computePerWorkflowMetrics(events, durations),
      systemWide: computeSystemWideMetrics(events, range),
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=60",
        "X-Metrics-Computed-At": response.computedAt,
      },
    });
  } catch (error) {
    console.error("[analytics/metrics] Failed to compute metrics:", error);

    const isThrottling =
      error instanceof Error &&
      (error.name === "ProvisionedThroughputExceededException" ||
        error.name === "ThrottlingException");

    if (isThrottling) {
      return NextResponse.json(
        {
          error: "SERVICE_UNAVAILABLE",
          message: "Metrics temporarily unavailable due to high load",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Failed to compute metrics",
      },
      { status: 500 }
    );
  }
}
