import { useEffect, useRef, useState } from "react";
import { useReports } from "@/hooks/useReports";
import FiltersBar from "../utils/FiltersBar";
import ReportsGrid from "../utils/ReportsGrid";
import { type Report } from "@/types/apiResponse";

export default function ReportsSection() {
  const [filters, setFilters] = useState<{
    type?: "lost" | "found";
    search?: string;
    category?: string;
    ordering?: "date_time" | "-date_time";
  }>({
    type: "lost",
    ordering: "-date_time",
  });

  const { reports, loading, fetchReports, hasMore } = useReports(filters);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  fetchReports(true); 
}, [filters]);



  // infinite scroll observer
  useEffect(() => {
    if (!bottomRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchReports();
        }
      },
      { threshold: 1.0 }
    );

    observerRef.current.observe(bottomRef.current);
    return () => observerRef.current?.disconnect();
  }, [bottomRef, hasMore, loading, fetchReports]);

  return (
    <section className="w-full max-w-7xl mx-auto p-4 min-w-xs">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Reports</h2>

      <FiltersBar
        onFilterChange={(newPart) =>
          setFilters((prev) => {
            const merged = { ...prev, ...newPart };

            Object.keys(merged).forEach((key) => {
              if (
                merged[key as keyof typeof merged] === "" ||
                merged[key as keyof typeof merged] === "all"
              ) {
                delete merged[key as keyof typeof merged];
              }
            });

            return merged;
          })
        }
        currentFilters={filters}
      />

      <ReportsGrid reports={reports as Report[]} loading={loading} />

      <div ref={bottomRef} className="h-10" />
    </section>
  );
}
