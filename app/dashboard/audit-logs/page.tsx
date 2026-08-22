"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { formatDateTime } from "@/lib/format";

type AuditLog = {
  id: string;
  action: string;
  message: string;
  actorLabel: string;
  createdAt: string;
  returnRequest?: { rmaId: string; customerName: string; item: string } | null;
};

const ACTION_STYLES: Record<string, string> = {
  REQUEST_CREATED: "bg-gray-100 text-gray-600",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  AUTO_APPROVED: "bg-blue-50 text-blue-700",
  SLA_SETTING_CHANGED: "bg-purple-50 text-purple-700",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit-logs?limit=200")
      .then((r) => r.json())
      .then((data) => setLogs(data.logs ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Full, immutable history of every action taken on every return"
      />

      <div className="bg-white rounded-xl border border-gray-200">
        {loading && <div className="px-5 py-8 text-center text-gray-400">Loading…</div>}
        {!loading && logs.length === 0 && (
          <div className="px-5 py-8 text-center text-gray-400">No activity yet.</div>
        )}
        <div className="divide-y divide-gray-100">
          {logs.map((l) => (
            <div key={l.id} className="px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      ACTION_STYLES[l.action] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {l.action.replace(/_/g, " ")}
                  </span>
                  {l.returnRequest && (
                    <span className="text-sm font-semibold">{l.returnRequest.rmaId}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{l.message}</p>
                <p className="text-xs text-gray-400 mt-1">by {l.actorLabel}</p>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {formatDateTime(l.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
