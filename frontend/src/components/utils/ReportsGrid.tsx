
import { type Report } from "@/types/apiResponse";
import { Skeleton } from "@/components/ui/skeleton";
import FoundItemCard from "../cards/FoundItemCard";
import LostItemCard from "../cards/LostItemCard";

interface ReportsGridProps {
  reports: Report[];
  loading: boolean;
}

export default function ReportsGrid({ reports, loading }: ReportsGridProps) {
  if (loading && reports.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl opacity-15 bg-foreground/25" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <p className="text-center text-muted-foreground mt-10">
        No approved reports found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {reports.map((report) =>
        report.type === "lost" ? (
          <LostItemCard key={report.id} report={report} />
        ) : (
          <FoundItemCard key={report.id} report={report} />
        )
      )}
    </div>
  );
}
