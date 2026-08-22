"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_SECTIONS = [
  {
    label: null,
    items: [{ href: "/dashboard", label: "Overview", icon: "🏠" }],
  },
  {
    label: "Returns",
    items: [
      { href: "/dashboard", label: "Return Requests", icon: "📄" },
      { href: "/dashboard/all-returns", label: "All Returns", icon: "☰" },
      { href: "/dashboard/auto-approved", label: "Auto-Approved", icon: "🕐" },
    ],
  },
  {
    label: "Decisions",
    items: [
      { href: "/dashboard/approved", label: "Approved", icon: "✓" },
      { href: "/dashboard/rejected", label: "Rejected", icon: "✕" },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/dashboard/support", label: "Customer Support View", icon: "ⓘ" },
      { href: "/dashboard/audit-logs", label: "Audit Logs", icon: "📄" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/dashboard/sla-settings", label: "SLA Settings", icon: "⚙" },
      { href: "/dashboard/profile", label: "Profile", icon: "👤" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between">
      <div>
        <div className="px-6 py-5 text-lg font-bold">
          amazon<span className="text-amazon-orange">.in</span>
        </div>
        <nav className="px-3 space-y-5">
          {NAV_SECTIONS.map((section, i) => (
            <div key={i}>
              {section.label && (
                <div className="px-3 text-[11px] font-semibold tracking-wide text-gray-400 mb-1">
                  {section.label}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                        active
                          ? "bg-orange-50 text-amazon-orange font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="w-4 text-center" aria-hidden>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="px-3 pb-6">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 w-full"
        >
          <span aria-hidden>↩</span> Logout
        </button>
      </div>
    </aside>
  );
}
