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
  reason: string;
  status: string;
  requestedAt: string;
  decidedAt: string | null;
  decisionReason: string | null;
};

type AuditLog = {
  id: string;
  action: string;
  message: string;
  actorLabel: string;
  createdAt: string;
};

type ReturnDetail = ReturnRequest & { auditLogs: AuditLog[] };

const STATUS_OPTIONS = ["All Statuses", "PENDING", "APPROVED", "REJECTED", "AUTO_APPROVED"];

export default function SupportViewPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReturnDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (statusFilter !== "All Statuses") qs.set("status", statusFilter);
    if (search) qs.set("search", search);
    const t = setTimeout(() => {
      fetch(`/api/returns?${qs.toString()}`)
        .then((r) => r.json())
        .then((data) => setReturns(data.returns ?? []))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    fetch(`/api/returns/${selectedId}`)
      .then((r) => r.json())
      .then((data) => setDetail(data.return ?? null));
  }, [selectedId]);

  return (
    <div>
      <PageHeader
        title="Customer Support View"
        subtitle="Read-only view of every return decision, for support agents"
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold">All Returns</h2>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Order ID, RMA ID or Customer"
                className="w-72 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "All Statuses" ? s : s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
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
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && returns.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    No returns match this search.
                  </td>
                </tr>
              )}
              {returns.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`border-t border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedId === r.id ? "bg-orange-50/60" : ""
                  }`}
                >
                  <td className="px-5 py-3 font-semibold">{r.rmaId}</td>
                  <td className="px-5 py-3 text-gray-500">{r.orderId}</td>
                  <td className="px-5 py-3 font-semibold">{r.customerName}</td>
                  <td className="px-5 py-3">{r.item}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3 text-gray-500">{formatDateTime(r.decidedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-6">
          {!detail && (
            <div className="text-center text-gray-400 py-10">
              <div className="text-2xl mb-3">ⓘ</div>
              <p className="text-sm">
                Select a return from the list to see full details, decision reason, and its audit
                trail — exactly what the seller saw.
              </p>
            </div>
          )}
          {detail && (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{detail.rmaId}</h3>
                <StatusBadge status={detail.status} />
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Order ID" value={detail.orderId} />
                <Row label="Customer" value={detail.customerName} />
                <Row label="Item" value={detail.item} />
                <Row label="Reason for return" value={detail.reason} />
                <Row label="Requested on" value={formatDateTime(detail.requestedAt)} />
                <Row label="Decided on" value={formatDateTime(detail.decidedAt)} />
                {detail.decisionReason && (
                  <Row label="Decision reason" value={detail.decisionReason} />
                )}
              </dl>

              <h4 className="mt-6 mb-2 text-sm font-bold">Audit Trail</h4>
              <div className="space-y-3 border-l-2 border-gray-100 pl-4">
                {detail.auditLogs.map((l) => (
                  <div key={l.id} className="text-xs relative">
                    <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-amazon-orange" />
                    <div className="font-semibold">{l.actorLabel}</div>
                    <div className="text-gray-500">{l.message}</div>
                    <div className="text-gray-400">{formatDateTime(l.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
