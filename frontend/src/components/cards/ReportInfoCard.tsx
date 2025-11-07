// components/common/ReportInfoCard.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import type { Report } from "@/types/apiResponse";

export function ReportInfoCard({ report }: { report: Report }) {
  const item = report.type === "lost" ? report.lost_item : report.found_item;

  return (
      <div className="p-3 border rounded-md bg-muted/30">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium truncate">
            {item?.item_name || "Unnamed Item"}
          </p>
          <Badge
            variant={report.type === "lost" ? "outline" : "secondary"}
            className="capitalize text-[10px] px-2 py-0.5 text-foreground/75"
          >
            {report.type}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Category: {item?.category || "Unspecified"}
        </p>
        <p className="text-xs text-muted-foreground">Status: {report.status}</p>
        <p className="text-xs text-muted-foreground">
          Reported: {new Date(report.date_time).toLocaleString()}
        </p>
      </div>
  );
}
