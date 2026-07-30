import { useTranslations } from "next-intl";
import { Download, FileText } from "lucide-react";
import { Button } from "@resto-hub/ui";
import { showWarningToast } from "@/lib/toast";
import type { AnalyticsReport, ReportLabels } from "./types";
import { downloadCsv, printPdf } from "./report";

interface Props {
  report?: AnalyticsReport;
  disabled?: boolean;
}

// CSV / PDF export controls for the analytics dashboard. Operates purely on the
// data already fetched for the page — no extra requests, no recalculation.
export function ExportButtons({ report, disabled }: Props) {
  const t = useTranslations("analytics");

  // Localized labels handed to the i18n-free report builders
  const labels: ReportLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    dateRange: t("dateRange"),
    generatedAt: t("generatedAt"),
    visitors: t("visitors"),
    pageViews: t("pageViews"),
    vsPreviousPeriod: t("vsPreviousPeriod"),
    dailyTrend: t("dailyTrend"),
    topCategories: t("topCategories"),
    topDishes: t("topDishes"),
    topCountries: t("topCountries"),
    date: t("date"),
    metric: t("metric"),
    value: t("value"),
    change: t("change"),
    rank: t("rank"),
    name: t("name"),
    views: t("views"),
    share: t("share"),
    country: t("country"),
    noData: t("noData"),
  };

  const isDisabled = disabled || !report;

  const handleCsv = () => {
    if (report) downloadCsv(report, labels);
  };

  const handlePdf = () => {
    if (!report) return;
    const opened = printPdf(report, labels);
    if (opened === false) showWarningToast(t("popupBlocked"));
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleCsv} disabled={isDisabled}>
        <Download />
        {t("exportCsv")}
      </Button>
      <Button variant="outline" size="sm" onClick={handlePdf} disabled={isDisabled}>
        <FileText />
        {t("exportPdf")}
      </Button>
    </div>
  );
}
