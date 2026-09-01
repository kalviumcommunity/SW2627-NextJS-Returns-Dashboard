/**
 * Formatting helpers shared across the dashboard UI.
 */

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type TimeLeft = {
  label: string;
  overdue: boolean;
  urgent: boolean;
};

/**
 * Given an SLA deadline, returns a human-readable countdown/overdue label.
 * `urgent` flags anything under 4 hours remaining; `overdue` flags anything past the deadline.
 */
export function timeLeft(deadline: string | Date | null | undefined): TimeLeft {
  if (!deadline) {
    return { label: "—", overdue: false, urgent: false };
  }

  const deadlineDate = typeof deadline === "string" ? new Date(deadline) : deadline;
  const diffMs = deadlineDate.getTime() - Date.now();

  if (diffMs <= 0) {
    return { label: "Overdue", overdue: true, urgent: true };
  }

  const diffMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  const label = hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
  const urgent = diffMs < 4 * 60 * 60 * 1000; // under 4 hours

  return { label, overdue: false, urgent };
}
