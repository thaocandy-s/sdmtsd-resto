"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";

interface DashboardStats {
  totalFoods: number;
  totalDrinks: number;
  totalBuffets: number;
  totalReservations: number;
  pendingReservations: number;
  totalContacts: number;
  unreadContacts: number;
  todayPageViews: number;
  totalPageViews: number;
}

interface Reservation {
  id: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
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
  recentReservations: Reservation[];
  recentContacts: Contact[];
  popularFoods: Food[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: DashboardData }>("/api/dashboard/stats")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) {
    return (
      <>
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-foreground-secondary mt-1">Loading...</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
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

  const stats = data?.stats;

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-foreground-secondary mt-1">
          Welcome to the Restaurant Management System
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          href="/food-menu"
          className="bg-background-secondary border border-border rounded-lg p-6 hover:border-gold-500/30 transition-colors"
        >
          <p className="text-sm text-foreground-tertiary">Food Items</p>
          <p className="text-2xl font-bold text-gold-400 mt-2">{stats?.totalFoods ?? 0}</p>
        </Link>
        <Link
          href="/drink-menu"
          className="bg-background-secondary border border-border rounded-lg p-6 hover:border-gold-500/30 transition-colors"
        >
          <p className="text-sm text-foreground-tertiary">Drink Items</p>
          <p className="text-2xl font-bold text-gold-400 mt-2">{stats?.totalDrinks ?? 0}</p>
        </Link>
        <Link
          href="/reservations"
          className="bg-background-secondary border border-border rounded-lg p-6 hover:border-gold-500/30 transition-colors"
        >
          <p className="text-sm text-foreground-tertiary">Reservations</p>
          <p className="text-2xl font-bold text-gold-400 mt-2">{stats?.totalReservations ?? 0}</p>
          {stats && stats.pendingReservations > 0 && (
            <p className="text-xs text-yellow-400 mt-1">{stats.pendingReservations} pending</p>
          )}
        </Link>
        <Link
          href="/contact"
          className="bg-background-secondary border border-border rounded-lg p-6 hover:border-gold-500/30 transition-colors"
        >
          <p className="text-sm text-foreground-tertiary">Messages</p>
          <p className="text-2xl font-bold text-gold-400 mt-2">{stats?.totalContacts ?? 0}</p>
          {stats && stats.unreadContacts > 0 && (
            <p className="text-xs text-blue-400 mt-1">{stats.unreadContacts} unread</p>
          )}
        </Link>
      </div>

      {/* Page Views */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <p className="text-sm text-foreground-tertiary">Today&apos;s Views</p>
          <p className="text-3xl font-bold text-gold-400 mt-2">{stats?.todayPageViews ?? 0}</p>
        </div>
        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <p className="text-sm text-foreground-tertiary">Total Views</p>
          <p className="text-3xl font-bold text-gold-400 mt-2">{stats?.totalPageViews ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Reservations */}
        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Reservations</h3>
            <Link href="/reservations" className="text-sm text-gold-400 hover:text-gold-300">
              View all &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentReservations.length === 0 ? (
              <p className="text-sm text-foreground-tertiary">No reservations yet</p>
            ) : (
              data?.recentReservations.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{res.name}</p>
                    <p className="text-xs text-foreground-secondary">
                      {new Date(res.date).toLocaleDateString()} at {res.time} • {res.guests} guests
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(res.status)}`}>
                    {res.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Messages</h3>
            <Link href="/contact" className="text-sm text-gold-400 hover:text-gold-300">
              View all &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentContacts.length === 0 ? (
              <p className="text-sm text-foreground-tertiary">No messages yet</p>
            ) : (
              data?.recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    {!contact.isRead && <span className="w-2 h-2 bg-blue-400 rounded-full" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">{contact.name}</p>
                      <p className="text-xs text-foreground-secondary truncate max-w-[200px]">
                        {contact.subject}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(contact.status)}`}>
                    {contact.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Popular Foods */}
      <div className="bg-background-secondary border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Popular Foods</h3>
          <Link href="/food-menu" className="text-sm text-gold-400 hover:text-gold-300">
            Manage &rarr;
          </Link>
        </div>
        <div className="space-y-2">
          {data?.popularFoods.length === 0 ? (
            <p className="text-sm text-foreground-tertiary">No foods yet</p>
          ) : (
            data?.popularFoods.map((food, idx) => (
              <div
                key={food.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-foreground">{food.name}</span>
                </div>
                <span className="text-sm text-gold-400 font-medium">
                  ¥{food.price.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
