import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

export function AnalyticsPanel({ className, ...props }: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn("min-w-0 rounded-md border border-slate-200 bg-white", className)}
      {...props}
    />
  );
}
