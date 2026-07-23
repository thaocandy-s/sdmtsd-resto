"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { ConfirmModal } from "@/shared/components/confirm-modal";

interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  date: string;
  time: string;
  guests: number;
  course: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filterStatus) params.set("status", filterStatus);
      const res = await api.get<{ data: Reservation[] }>(`/api/reservations?${params}`);
      setReservations(res.data || []);
    } catch (error) {
      console.error("Load reservations error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/reservations/${id}`, { status });
      loadData();
    } catch (error) {
      console.error("Update status error:", error);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/api/reservations/${deleteConfirmId}`);
      loadData();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400";
      case "CONFIRMED":
        return "bg-green-500/20 text-green-400";
      case "CANCELLED":
        return "bg-red-500/20 text-red-400";
      case "COMPLETED":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reservations</h2>
          <p className="text-foreground-secondary mt-1">Manage customer reservations</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background-secondary border border-border rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-background-tertiary rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
          <p className="text-foreground-secondary">No reservations found</p>
        </div>
      ) : (
        <div className="bg-background-secondary border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Name</th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Guests</th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-background-tertiary/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-foreground-secondary">{r.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {new Date(r.date).toLocaleDateString()} {r.time}
                  </td>
                  <td className="px-4 py-3 text-foreground">{r.guests}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirm</option>
                        <option value="CANCELLED">Cancel</option>
                        <option value="COMPLETED">Complete</option>
                      </select>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Delete Reservation"
        message="Are you sure you want to delete this reservation?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </>
  );
}
