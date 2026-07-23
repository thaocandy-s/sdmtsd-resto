"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { ConfirmModal } from "@/shared/components/confirm-modal";
import { DashboardStatsGrid } from "./_components/DashboardStatsGrid";
import { DashboardPageViews } from "./_components/DashboardPageViews";
import { RecentMessagesWidget } from "./_components/RecentMessagesWidget";
import { PopularFoodsWidget } from "./_components/PopularFoodsWidget";
import { MessageDetailModal } from "./contact/_components/MessageDetailModal";

interface DashboardStats {
  totalFoods: number;
  totalDrinks: number;
  totalBuffets: number;
  totalReservations: number;
  pendingReservations: number;
  totalContacts: number;
  unreadContacts: number;
  todayPageViews: number;
  todayUniqueVisitors: number;
  weekPageViews: number;
  totalPageViews: number;
  totalUniqueVisitors: number;
}

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

interface Food {
  id: string;
  name: string;
  price: number;
  isPopular: boolean;
}

interface DashboardData {
  stats: DashboardStats;
  recentContacts: Contact[];
  popularFoods: Food[];
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tContact = useTranslations("contact");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const loadData = async () => {
    try {
      const res = await api.get<{ data: DashboardData }>("/api/dashboard/stats");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/20 text-blue-400";
      case "IN_PROGRESS":
        return "bg-yellow-500/20 text-yellow-400";
      case "RESOLVED":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
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

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/api/contact/${deleteConfirmId}`);
      loadData();
      setSelectedContact(null);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (loading) {
    return (
      <>
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-foreground-secondary mt-1">{t("loading")}</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background-secondary border border-border rounded-lg p-6 animate-pulse"
            >
              <div className="h-4 bg-background-tertiary rounded w-1/2 mb-2" />
              <div className="h-8 bg-background-tertiary rounded w-1/3" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        <p className="text-foreground-secondary mt-1">{t("welcome")}</p>
      </header>

      <DashboardStatsGrid stats={data?.stats} />

      <DashboardPageViews stats={data?.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RecentMessagesWidget
          contacts={data?.recentContacts || []}
          getStatusColor={getStatusColor}
          onViewContact={viewContact}
        />
        <PopularFoodsWidget foods={data?.popularFoods || []} />
      </div>

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
        title={tContact("delete")}
        message={tContact("deleteConfirm")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </>
  );
}
