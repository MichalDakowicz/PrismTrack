import { DateRange, PulseGrouping, PulseMetric } from "../../lib/pulse";

interface PulseControlsProps {
  metric: PulseMetric;
  grouping: PulseGrouping;
  dateRange: DateRange;
  onMetricChange: (value: PulseMetric) => void;
  onGroupingChange: (value: PulseGrouping) => void;
  onDateRangeChange: (value: DateRange) => void;
}

export function PulseControls({
  metric,
  grouping,
  dateRange,
  onMetricChange,
  onGroupingChange,
  onDateRangeChange,
}: PulseControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <select
        aria-label="Pulse metric"
        value={metric}
        onChange={(event) => onMetricChange(event.target.value as PulseMetric)}
        className="px-3 py-1.5 bg-surface-hover border border-border rounded-sm text-sm"
      >
        <option value="composite">Composite score</option>
        <option value="commits">Commits</option>
        <option value="issues_closed">Issues closed</option>
        <option value="prs_merged">PRs merged</option>
      </select>

      <select
        aria-label="Pulse grouping"
        value={grouping}
        onChange={(event) => onGroupingChange(event.target.value as PulseGrouping)}
        className="px-3 py-1.5 bg-surface-hover border border-border rounded-sm text-sm"
      >
        <option value="team">Team row</option>
        <option value="contributors">Contributors</option>
      </select>

      <select
        aria-label="Pulse date range"
        value={dateRange}
        onChange={(event) => onDateRangeChange(event.target.value as DateRange)}
        className="px-3 py-1.5 bg-surface-hover border border-border rounded-sm text-sm"
      >
        <option value="90d">Last 90 days</option>
        <option value="180d">Last 180 days</option>
        <option value="365d">Last year</option>
      </select>
    </div>
  );
}
