const STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  AUTO_APPROVED: "bg-blue-50 text-blue-700",
};

const LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  AUTO_APPROVED: "Auto-Approved",
};

const DOT: Record<string, string> = {
  PENDING: "●",
  APPROVED: "✓",
  REJECTED: "✕",
  AUTO_APPROVED: "◷",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        STYLES[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      <span aria-hidden>{DOT[status]}</span>
      {LABELS[status] ?? status}
    </span>
  );
}
