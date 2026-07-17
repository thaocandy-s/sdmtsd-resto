"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  status: string;
  createdAt: string;
}

export default function ContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filterStatus) params.set("status", filterStatus);
      const res = await api.get<{ data: Contact[] }>(`/api/contact?${params}`);
      setContacts(res.data || []);
    } catch (error) {
      console.error("Load contacts error:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewContact = async (contact: Contact) => {
    setSelectedContact(contact);
    if (!contact.isRead) {
      try {
        await api.put(`/api/contact/${contact.id}`, { status: contact.status, isRead: true });
        loadData();
      } catch (error) {
        console.error("Mark read error:", error);
      }
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/contact/${id}`, { status });
      loadData();
      setSelectedContact(null);
    } catch (error) {
      console.error("Update status error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/api/contact/${id}`);
      loadData();
      setSelectedContact(null);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/20 text-blue-400";
      case "IN_PROGRESS":
        return "bg-yellow-500/20 text-yellow-400";
      case "RESOLVED":
        return "bg-green-500/20 text-green-400";
      case "CLOSED":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Messages</h2>
          <p className="text-foreground-secondary mt-1">Manage contact form submissions</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        >
          <option value="">All Status</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
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
      ) : contacts.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
          <p className="text-foreground-secondary">No messages found</p>
        </div>
      ) : (
        <div className="bg-background-secondary border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">From</th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Subject</th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Date</th>
                <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-background-tertiary/50 ${!c.isRead ? "bg-gold-500/5" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {!c.isRead && <span className="w-2 h-2 bg-blue-400 rounded-full" />}
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-foreground-secondary">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary truncate max-w-[200px]">
                    {c.subject}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary text-sm">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => viewContact(c)}
                      className="text-gold-400 hover:text-gold-300 text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedContact && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Message Details</h3>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-foreground-secondary hover:text-foreground"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground-secondary">From</p>
                <p className="text-foreground font-medium">{selectedContact.name}</p>
                <p className="text-foreground-secondary text-sm">{selectedContact.email}</p>
              </div>
              {selectedContact.phone && (
                <div>
                  <p className="text-sm text-foreground-secondary">Phone</p>
                  <p className="text-foreground">{selectedContact.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-foreground-secondary">Subject</p>
                <p className="text-foreground">{selectedContact.subject}</p>
              </div>
              <div>
                <p className="text-sm text-foreground-secondary">Message</p>
                <p className="text-foreground whitespace-pre-wrap">{selectedContact.message}</p>
              </div>
              <div>
                <p className="text-sm text-foreground-secondary">Received</p>
                <p className="text-foreground">
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <select
                  value={selectedContact.status}
                  onChange={(e) => updateStatus(selectedContact.id, e.target.value)}
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <button
                  onClick={() => handleDelete(selectedContact.id)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
