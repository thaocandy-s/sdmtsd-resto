"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { MessageTable } from "./_components/MessageTable";
import { MessageDetailModal } from "./_components/MessageDetailModal";

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
  const t = useTranslations("contact");
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filterStatus, setFilterStatus] = useState("");

  const contactsQuery = useQuery({
    queryKey: ["contacts", { status: filterStatus }],
    queryFn: () => {
      const params = new URLSearchParams({ limit: "100" });
      if (filterStatus) params.set("status", filterStatus);
      return api.get<{ data: Contact[] }>(`/api/contact?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  const contacts = contactsQuery.data?.data ?? [];
  const loading = contactsQuery.isPending;

  // Contact mutations also refresh the dashboard widgets that show unread counts
  const invalidateContacts = () => {
    queryClient.invalidateQueries({ queryKey: ["contacts"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const viewContact = async (contact: Contact) => {
    setSelectedContact(contact);
    if (!contact.isRead) {
      try {
        await api.put(`/api/contact/${contact.id}`, { status: contact.status, isRead: true });
        invalidateContacts();
      } catch (error) {
        console.error("Mark read error:", error);
      }
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/contact/${id}`, { status });
      invalidateContacts();
      setSelectedContact(null);
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
      await api.delete(`/api/contact/${deleteConfirmId}`);
      invalidateContacts();
      setSelectedContact(null);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteConfirmId(null);
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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-foreground-secondary mt-1">{t("subtitle")}</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        >
          <option value="">{t("allStatus")}</option>
          <option value="NEW">{t("new")}</option>
          <option value="IN_PROGRESS">{t("inProgress")}</option>
          <option value="RESOLVED">{t("resolved")}</option>
          <option value="CLOSED">{t("closed")}</option>
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
          <p className="text-foreground-secondary">{t("noMessages")}</p>
        </div>
      ) : (
        <MessageTable contacts={contacts} onView={viewContact} getStatusColor={getStatusColor} />
      )}

      {selectedContact && (
        <MessageDetailModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onUpdateStatus={updateStatus}
          onDelete={handleDelete}
        />
      )}

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title={t("delete")}
        message={t("deleteConfirm")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </>
  );
}
