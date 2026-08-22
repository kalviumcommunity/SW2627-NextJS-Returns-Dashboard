"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";

type ReturnRequest = {
  id: string;
  rmaId: string;
  orderId: string;
  customerName: string;
  item: string;
  status: string;
  requestedAt: string;
  decidedAt: string | null;
  decisionReason: string | null;
};

export default function ReturnsList({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "AUTO_APPROVED";
}) {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (search) qs.set("search", search);
    const t = setTimeout(() => {
      fetch(`/api/returns?${qs.toString()}`)
        .then((r) => r.json())
        .then((data) => setReturns(data.returns ?? []))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [status, search]);

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold">{status ? title : "All Returns"}</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, RMA ID or Customer"
            className="w-80 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
          />
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase">
              <th className="px-5 py-3 font-medium">RMA ID</th>
              <th className="px-5 py-3 font-medium">Order ID</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Item</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Decided</th>
              <th className="px-5 py-3 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && returns.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                  Nothing here yet.
                </td>
              </tr>
            )}
            {returns.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-5 py-3 font-semibold">{r.rmaId}</td>
                <td className="px-5 py-3 text-gray-500">{r.orderId}</td>
                <td className="px-5 py-3 font-semibold">{r.customerName}</td>
                <td className="px-5 py-3">{r.item}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3 text-gray-500">{formatDateTime(r.decidedAt)}</td>
                <td className="px-5 py-3 text-gray-500 max-w-xs truncate" title={r.decisionReason ?? ""}>
                  {r.decisionReason ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && (
          <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
            Showing {returns.length} {returns.length === 1 ? "result" : "results"}
          </div>
        )}
      </div>
    </div>
  );
}
