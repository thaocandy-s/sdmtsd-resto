"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  module: string;
  entityId: string | null;
  details: unknown;
  ipAddress: string | null;
  createdAt: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "30" });
      if (moduleFilter) params.set("module", moduleFilter);
      if (actionFilter) params.set("action", actionFilter);
      const res = await api.get<{ data: AuditLog[]; meta: { total: number; totalPages: number } }>(
        `/api/audit-log?${params}`
      );
      setLogs(res.data || []);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setPage(1);
    loadData();
  };

  const actionColors: Record<string, string> = {
    create: "bg-green-500/20 text-green-400",
    update: "bg-blue-500/20 text-blue-400",
    delete: "bg-red-500/20 text-red-400",
    read: "bg-gray-500/20 text-gray-400",
    login: "bg-purple-500/20 text-purple-400",
  };

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Audit Log</h2>
          <p className="text-foreground-secondary mt-1">{total} entries</p>
        </div>
      </header>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          placeholder="Filter by module"
          className="w-40 bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground text-sm focus:outline-none focus:border-gold-500"
        />
        <input
          type="text"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          placeholder="Filter by action"
          className="w-40 bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground text-sm focus:outline-none focus:border-gold-500"
        />
        <button
          onClick={handleFilter}
          className="bg-background-secondary hover:bg-background-tertiary border border-border px-4 py-2 rounded-lg text-foreground text-sm transition-colors"
        >
          Filter
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-background-secondary rounded animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
          <p className="text-foreground-secondary">No audit logs</p>
        </div>
      ) : (
        <>
          <div className="bg-background-secondary border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-background-tertiary">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-secondary">
                    Time
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-secondary">
                    Action
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-secondary">
                    Module
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-secondary">
                    Entity ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-secondary">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-background-tertiary/50">
                    <td className="px-4 py-2 text-xs text-foreground-secondary whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${actionColors[log.action] || "bg-gray-500/20 text-gray-400"}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-foreground">{log.module}</td>
                    <td className="px-4 py-2 text-xs text-foreground-secondary font-mono truncate max-w-[120px]">
                      {log.entityId || "—"}
                    </td>
                    <td className="px-4 py-2 text-xs text-foreground-secondary">
                      {log.ipAddress || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-background-secondary border border-border rounded text-sm text-foreground disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1 text-sm text-foreground-secondary">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-background-secondary border border-border rounded text-sm text-foreground disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
