type Props = {
  title: string;
  subtitle?: string;
  sellerName: string;
  sellerCode: string;
};

export default function Topbar({ title, subtitle, sellerName, sellerCode }: Props) {
  const initials = sellerName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
          aria-label="Notifications"
        >
          🔔
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amazon-orange text-white flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
          <div className="text-sm">
            <div className="font-semibold leading-tight">{sellerName}</div>
            <div className="text-gray-400 text-xs leading-tight">Seller ID: {sellerCode}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
