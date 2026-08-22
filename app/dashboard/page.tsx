"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime, timeLeft } from "@/lib/format";

type ReturnRequest = {
  id: string;
  rmaId: string;
  orderId: string;
  customerName: string;
  item: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "AUTO_APPROVED";
  requestedAt: string;
  slaDeadline: string;
  decidedAt: string | null;
  decidedByType: "SELLER" | "SYSTEM" | null;
};

type AuditLog = {
  id: string;
  action: string;
  message: string;
  actorLabel: string;
  createdAt: string;
  returnRequest?: { rmaId: string } | null;
};

export default function DashboardPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<ReturnRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [rRes, lRes] = await Promise.all([
      fetch("/api/returns"),
      fetch("/api/audit-logs?limit=3"),
    ]);
    const rData = await rRes.json();
    const lData = await lRes.json();
    setReturns(rData.returns ?? []);
    setLogs(lData.logs ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // keep SLA countdowns / auto-approvals fresh
    return () => clearInterval(interval);
  }, []);

  const pending = useMemo(
    () =>
      returns
        .filter((r) => r.status === "PENDING")
        .filter(
          (r) =>
            !search ||
            r.rmaId.toLowerCase().includes(search.toLowerCase()) ||
            r.orderId.toLowerCase().includes(search.toLowerCase()) ||
            r.customerName.toLowerCase().includes(search.toLowerCase())
        ),
    [returns, search]
  );

  const counts = useMemo(() => {
    const c = { PENDING: 0, APPROVED: 0, REJECTED: 0, AUTO_APPROVED: 0 };
    for (const r of returns) c[r.status]++;
    return c;
  }, [returns]);

  const total = returns.length || 1;

  async function decide(ret: ReturnRequest, decision: "APPROVED" | "REJECTED", reason?: string) {
    setActionError(null);
    setBusyId(ret.id);
    const res = await fetch(`/api/returns/${ret.id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, reason }),
    });
    const data = await res.json();
    setBusyId(null);
    if (!res.ok) {
      setActionError(data.error || "Something went wrong. Please try again.");
      return;
    }
    setRejectTarget(null);
    setRejectReason("");
    load();
  }

  const recentDecisions = logs.filter((l) =>
    ["APPROVED", "REJECTED", "AUTO_APPROVED"].includes(l.action)
  );

  return (
    <div>
      <PageHeader title="Returns Dashboard" subtitle="Review and manage return requests" />

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon="📄" color="bg-orange-50 text-amazon-orange" value={counts.PENDING} label="Pending" hint="Need your action" />
        <StatCard icon="✓" color="bg-green-50 text-green-600" value={counts.APPROVED} label="Approved" hint="This month" />
        <StatCard icon="✕" color="bg-red-50 text-red-600" value={counts.REJECTED} label="Rejected" hint="This month" />
        <StatCard icon="🕐" color="bg-blue-50 text-blue-600" value={counts.AUTO_APPROVED} label="Auto-Approved" hint="This month" />
      </div>

      {/* Pending table */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold">Pending Return Requests</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, RMA ID or Customer"
            className="w-80 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
          />
        </div>

        {actionError && (
          <div className="mx-5 mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {actionError}
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase">
              <th className="px-5 py-3 font-medium">RMA ID</th>
              <th className="px-5 py-3 font-medium">Order ID</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Item</th>
              <th className="px-5 py-3 font-medium">Reason</th>
              <th className="px-5 py-3 font-medium">Requested On</th>
              <th className="px-5 py-3 font-medium">Time Left</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-gray-400">
                  Loading return requests…
                </td>
              </tr>
            )}
            {!loading && pending.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-gray-400">
                  No pending returns need your attention right now.
                </td>
              </tr>
            )}
            {pending.map((r) => {
              const tl = timeLeft(r.slaDeadline);
              return (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 font-semibold">{r.rmaId}</td>
                  <td className="px-5 py-3 text-gray-500">{r.orderId}</td>
                  <td className="px-5 py-3 font-semibold">{r.customerName}</td>
                  <td className="px-5 py-3">{r.item}</td>
                  <td className="px-5 py-3">{r.reason}</td>
                  <td className="px-5 py-3 text-gray-500">{formatDateTime(r.requestedAt)}</td>
                  <td className={`px-5 py-3 font-medium ${tl.overdue ? "text-red-500" : tl.urgent ? "text-red-500" : "text-green-600"}`}>
                    {tl.overdue && <span className="mr-1">●</span>}
                    {tl.label}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => decide(r, "APPROVED")}
                        disabled={busyId === r.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setRejectTarget(r);
                          setRejectReason("");
                          setActionError(null);
                        }}
                        disabled={busyId === r.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && (
          <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
            Showing 1 to {pending.length} of {pending.length} requests
          </div>
        )}
      </div>

      {/* Bottom widgets */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm flex items-center gap-2">🕐 SLA Auto-Approval</h3>
          <p className="text-xs text-gray-500 mt-2">
            If no action is taken within 48 hours, the return request will be auto-approved.
          </p>
          <div className="mt-4 text-xs text-gray-400">Average Response Time</div>
          <div className="text-xl font-bold">18h 24m</div>
          <div className="text-xs text-gray-400">(This month)</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm">Recent Decisions</h3>
          <div className="mt-3 space-y-3">
            {recentDecisions.length === 0 && (
              <p className="text-xs text-gray-400">No decisions yet.</p>
            )}
            {recentDecisions.map((l) => (
              <div key={l.id} className="text-xs border-b border-gray-50 pb-2 last:border-0">
                <div className="font-semibold">
                  {l.action === "AUTO_APPROVED"
                    ? "Auto-Approved"
                    : l.action === "APPROVED"
                    ? "Approved"
                    : "Rejected"}
                </div>
                <div className="text-gray-400">
                  {l.returnRequest?.rmaId} • {formatDateTime(l.createdAt)}
                </div>
                <div className="text-gray-400">by {l.actorLabel}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Decision Summary</h3>
            <span className="text-xs text-gray-400">This Month</span>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <SummaryRow color="bg-green-500" label="Approved" value={counts.APPROVED} total={total} />
            <SummaryRow color="bg-red-500" label="Rejected" value={counts.REJECTED} total={total} />
            <SummaryRow color="bg-blue-500" label="Auto-Approved" value={counts.AUTO_APPROVED} total={total} />
            <SummaryRow color="bg-amber-500" label="Pending" value={counts.PENDING} total={total} />
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm font-semibold">
            <span>Total Decisions</span>
            <span>{returns.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Audit Trail</h3>
            <a href="/dashboard/audit-logs" className="text-xs text-amazon-orange font-semibold">
              View all
            </a>
          </div>
          <div className="mt-3 space-y-3">
            {logs.slice(0, 3).map((l) => (
              <div key={l.id} className="text-xs">
                <div className="font-semibold">{l.returnRequest?.rmaId ?? "—"}</div>
                <div className="text-gray-500">{l.message}</div>
                <div className="text-gray-400">{formatDateTime(l.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg">Reject {rejectTarget.rmaId}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Tell the customer (and support) why this return is being rejected. This becomes
              part of the permanent audit trail.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="e.g. Return window has expired, item not eligible for return…"
              className="mt-3 w-full text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
            />
            {actionError && <p className="text-sm text-red-600 mt-2">{actionError}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => decide(rejectTarget, "REJECTED", rejectReason)}
                disabled={busyId === rejectTarget.id}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white font-semibold disabled:opacity-60"
              >
                {busyId === rejectTarget.id ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  color,
  value,
  label,
  hint,
}: {
  icon: string;
  color: string;
  value: number;
  label: string;
  hint: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-gray-400">{hint}</div>
      </div>
    </div>
  );
}

function SummaryRow({
  color,
  label,
  value,
  total,
}: {
  color: string;
  label: string;
  value: number;
  total: number;
}) {
  const pct = Math.round((value / total) * 100);
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color}`} /> {label}
      </span>
      <span className="font-semibold">
        {value} ({pct}%)
      </span>
    </div>
  );
}
