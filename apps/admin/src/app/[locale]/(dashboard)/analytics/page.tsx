"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

interface AnalyticsData {
  totalViews: number;
  uniquePages: number;
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; count: number }[];
  topCountries: { country: string; count: number }[];
  recentViews: { id: string; path: string; createdAt: string; userAgent: string | null }[];
  popularFoods: { id: string; name: string; category: { name: string } }[];
  popularDrinks: { id: string; name: string; category: { name: string } }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: AnalyticsData }>(`/api/analytics?days=${days}`);
      setData(res.data);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-background-secondary rounded-lg animate-pulse" />
        ))}
      </div>
    );

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
          <p className="text-foreground-secondary mt-1">Page views and content performance</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <p className="text-foreground-secondary text-sm">Total Page Views</p>
          <p className="text-3xl font-bold text-foreground mt-2">{data?.totalViews || 0}</p>
        </div>
        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <p className="text-foreground-secondary text-sm">Unique Pages Visited</p>
          <p className="text-3xl font-bold text-foreground mt-2">{data?.uniquePages || 0}</p>
        </div>
        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <p className="text-foreground-secondary text-sm">Avg Views/Page</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {data?.uniquePages ? Math.round((data.totalViews || 0) / data.uniquePages) : 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Top Pages</h3>
          {!data?.topPages || data.topPages.length === 0 ? (
            <p className="text-foreground-secondary text-sm">No data</p>
          ) : (
            <div className="space-y-3">
              {data.topPages.map((p, i) => (
                <div key={p.path} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-foreground-secondary text-sm w-6">#{i + 1}</span>
                    <code className="text-sm text-foreground">{p.path}</code>
                  </div>
                  <span className="text-sm font-medium text-gold-400">{p.views}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Top Referrers</h3>
          {!data?.topReferrers || data.topReferrers.length === 0 ? (
            <p className="text-foreground-secondary text-sm">No data</p>
          ) : (
            <div className="space-y-3">
              {data.topReferrers.map((r) => (
                <div key={r.referrer || "direct"} className="flex items-center justify-between">
                  <span className="text-sm text-foreground truncate">{r.referrer || "Direct"}</span>
                  <span className="text-sm font-medium text-gold-400">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Popular Foods</h3>
          {!data?.popularFoods || data.popularFoods.length === 0 ? (
            <p className="text-foreground-secondary text-sm">No popular items</p>
          ) : (
            <div className="space-y-2">
              {data.popularFoods.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-foreground">{f.name}</span>
                  <span className="text-xs text-foreground-secondary">{f.category.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background-secondary border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Popular Drinks</h3>
          {!data?.popularDrinks || data.popularDrinks.length === 0 ? (
            <p className="text-foreground-secondary text-sm">No popular items</p>
          ) : (
            <div className="space-y-2">
              {data.popularDrinks.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-foreground">{d.name}</span>
                  <span className="text-xs text-foreground-secondary">{d.category.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data?.topCountries && data.topCountries.length > 0 && (
        <div className="bg-background-secondary border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Top Countries</h3>
          <div className="flex flex-wrap gap-4">
            {data.topCountries.map((c) => (
              <div
                key={c.country || "unknown"}
                className="bg-background-tertiary rounded-lg px-4 py-2"
              >
                <span className="text-sm text-foreground">{c.country || "Unknown"}</span>
                <span className="text-sm font-medium text-gold-400 ml-2">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-background-secondary border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Page Views</h3>
        {!data?.recentViews || data.recentViews.length === 0 ? (
          <p className="text-foreground-secondary text-sm">No recent views</p>
        ) : (
          <div className="space-y-2">
            {data.recentViews.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between py-1 border-b border-border last:border-0"
              >
                <div>
                  <code className="text-sm text-foreground">{v.path}</code>
                  <p className="text-xs text-foreground-secondary mt-0.5">
                    {new Date(v.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
