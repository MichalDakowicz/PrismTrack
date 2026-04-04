import { Activity, CalendarDays } from "lucide-react";
import { PulseRow, intensityClass } from "../../lib/pulse";

interface PulseHeatmapProps {
  rows: PulseRow[];
  globalMax: number;
}

export function PulseHeatmap({ rows, globalMax }: PulseHeatmapProps) {
  if (rows.length === 0 || rows.every((row) => row.total === 0)) {
    return (
      <div className="border border-dashed border-border bg-surface p-10 text-center">
        <Activity className="w-8 h-8 text-text-dim mx-auto mb-3" />
        <h3 className="text-lg font-medium text-text-main">No activity for selected metric</h3>
        <p className="text-sm text-text-dim mt-2">Try composite mode or a wider date range.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <section key={row.name} className="border border-border bg-surface p-4 rounded-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text-main">{row.name}</h3>
            <span className="text-xs font-mono text-text-dim">{row.total} points</span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="inline-flex gap-1 min-w-max">
              {row.cells.map((cell) => (
                <div
                  key={`${row.name}-${cell.dayKey}`}
                  title={`${cell.dayKey}: ${cell.count}`}
                  className={`h-3.5 w-3.5 rounded-xs border border-border/40 ${intensityClass(cell.count, globalMax)}`}
                  aria-label={`${row.name} ${cell.dayKey} ${cell.count}`}
                />
              ))}
            </div>
          </div>
        </section>
      ))}

      <div className="flex items-center gap-2 text-xs font-mono text-text-dim">
        <CalendarDays className="w-3.5 h-3.5" />
        <span>Lower</span>
        <span className="h-3.5 w-3.5 rounded-xs border border-border/40 bg-surface-hover" />
        <span className="h-3.5 w-3.5 rounded-xs border border-border/40 bg-primary/25" />
        <span className="h-3.5 w-3.5 rounded-xs border border-border/40 bg-primary/45" />
        <span className="h-3.5 w-3.5 rounded-xs border border-border/40 bg-primary/70" />
        <span className="h-3.5 w-3.5 rounded-xs border border-border/40 bg-primary" />
        <span>Higher</span>
      </div>
    </div>
  );
}
