import type { AnalyticsReport, ReportLabels, DailyPoint, AnalyticsTopItem } from "./types";
import { countryFlag, countryName } from "./country";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

// Period-over-period change in percent (100% when growing from zero)
function changePercent(current: number, previous: number): number {
  if (previous > 0) return Math.round(((current - previous) / previous) * 100);
  return current > 0 ? 100 : 0;
}

function signed(percent: number): string {
  return `${percent >= 0 ? "+" : ""}${percent}%`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Display label for a top-list row (country lists resolve ISO code -> flag + name)
function itemLabel(item: AnalyticsTopItem, isCountry: boolean): string {
  if (!isCountry) return item.name;
  return `${countryFlag(item.key)} ${countryName(item.key)}`.trim();
}

// Escape HTML entities to keep the printable report safe from user-derived names
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// CSV export — all displayed dashboard data, grouped into labelled sections
// ---------------------------------------------------------------------------

function csvCell(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function csvRow(cells: (string | number)[]): string {
  return cells.map(csvCell).join(",");
}

function topListRows(
  items: AnalyticsTopItem[],
  labels: ReportLabels,
  { isCountry = false }: { isCountry?: boolean } = {}
): string[] {
  const active = items.filter((item) => item.count > 0);
  if (active.length === 0) return [csvRow([labels.noData])];

  const total = active.reduce((sum, item) => sum + item.count, 0);
  const header = isCountry
    ? [labels.rank, labels.country, labels.views, labels.share]
    : [labels.rank, labels.name, labels.views];

  const rows = active.map((item, index) => {
    const base = [index + 1, itemLabel(item, isCountry), item.count];
    if (isCountry) base.push(total > 0 ? `${Math.round((item.count / total) * 100)}%` : "0%");
    return csvRow(base);
  });

  return [csvRow(header), ...rows];
}

export function buildCsv(report: AnalyticsReport, labels: ReportLabels): string {
  const overview = report.overview;
  const visitors = overview?.visitors ?? 0;
  const pageViews = overview?.pageViews ?? 0;

  const lines: string[] = [
    csvRow([labels.title]),
    csvRow([labels.dateRange, `${formatDate(report.startDate)} - ${formatDate(report.endDate)}`]),
    "",
    // Summary
    csvRow([labels.metric, labels.value, labels.change]),
    csvRow([
      labels.visitors,
      visitors,
      signed(changePercent(visitors, overview?.prevVisitors ?? 0)),
    ]),
    csvRow([
      labels.pageViews,
      pageViews,
      signed(changePercent(pageViews, overview?.prevPageViews ?? 0)),
    ]),
    "",
    // Daily trend
    csvRow([labels.dailyTrend]),
    csvRow([labels.date, labels.visitors, labels.pageViews]),
    ...(report.daily.length > 0
      ? report.daily.map((day) => csvRow([day.date, day.visitors, day.pageViews]))
      : [csvRow([labels.noData])]),
    "",
    // Top categories
    csvRow([labels.topCategories]),
    ...topListRows(report.topCategories, labels),
    "",
    // Top dishes
    csvRow([labels.topDishes]),
    ...topListRows(report.topDishes, labels),
    "",
    // Top countries
    csvRow([labels.topCountries]),
    ...topListRows(report.topCountries, labels, { isCountry: true }),
  ];

  return lines.join("\r\n");
}

// ---------------------------------------------------------------------------
// PDF export — self-contained A4 HTML document printed via the browser
// ---------------------------------------------------------------------------

// Minimal inline SVG line chart of daily visitors (reuses the dashboard data)
function trendSvg(daily: DailyPoint[]): string {
  if (daily.length === 0) return "";

  const width = 760;
  const height = 220;
  const pad = { top: 16, right: 16, bottom: 28, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...daily.map((d) => d.visitors), 1);
  const stepX = daily.length > 1 ? innerW / (daily.length - 1) : 0;

  const point = (d: DailyPoint, i: number) => {
    const x = pad.left + stepX * i;
    const y = pad.top + innerH - (d.visitors / max) * innerH;
    return [x, y] as const;
  };

  const line = daily.map((d, i) => point(d, i).join(",")).join(" ");
  const [firstX] = point(daily[0], 0);
  const [lastX] = point(daily[daily.length - 1], daily.length - 1);
  const baseY = pad.top + innerH;
  const area = `${firstX},${baseY} ${line} ${lastX},${baseY}`;

  // Y-axis gridlines at 0 / 50% / max
  const gridlines = [0, 0.5, 1]
    .map((ratio) => {
      const y = pad.top + innerH - ratio * innerH;
      const label = Math.round(max * ratio);
      return `
        <line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#e5e0d5" stroke-width="1" />
        <text x="${pad.left - 6}" y="${y + 3}" text-anchor="end" font-size="10" fill="#8a8170">${label}</text>`;
    })
    .join("");

  // First / middle / last date labels to avoid clutter
  const tickIndexes = Array.from(new Set([0, Math.floor(daily.length / 2), daily.length - 1]));
  const dateTicks = tickIndexes
    .map((i) => {
      const [x] = point(daily[i], i);
      const label = new Date(daily[i].date).toLocaleDateString("ja-JP", {
        month: "numeric",
        day: "numeric",
      });
      return `<text x="${x}" y="${height - 8}" text-anchor="middle" font-size="10" fill="#8a8170">${label}</text>`;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" xmlns="http://www.w3.org/2000/svg">
      ${gridlines}
      <polygon points="${area}" fill="rgba(201,169,110,0.15)" />
      <polyline points="${line}" fill="none" stroke="#c9a96e" stroke-width="2" stroke-linejoin="round" />
      ${dateTicks}
    </svg>`;
}

function overviewCards(report: AnalyticsReport, labels: ReportLabels): string {
  const overview = report.overview;
  const visitors = overview?.visitors ?? 0;
  const pageViews = overview?.pageViews ?? 0;
  const cards = [
    {
      label: labels.visitors,
      value: visitors,
      change: changePercent(visitors, overview?.prevVisitors ?? 0),
    },
    {
      label: labels.pageViews,
      value: pageViews,
      change: changePercent(pageViews, overview?.prevPageViews ?? 0),
    },
  ];

  return cards
    .map(
      (card) => `
      <div class="card">
        <div class="card-label">${escapeHtml(card.label)}</div>
        <div class="card-value">${card.value.toLocaleString()}</div>
        <div class="card-change ${card.change >= 0 ? "up" : "down"}">
          ${card.change >= 0 ? "▲" : "▼"} ${signed(card.change)} ${escapeHtml(labels.vsPreviousPeriod)}
        </div>
      </div>`
    )
    .join("");
}

function topListTable(
  title: string,
  items: AnalyticsTopItem[],
  labels: ReportLabels,
  { isCountry = false }: { isCountry?: boolean } = {}
): string {
  const active = items.filter((item) => item.count > 0);
  const total = active.reduce((sum, item) => sum + item.count, 0);

  const body =
    active.length === 0
      ? `<tr><td colspan="${isCountry ? 4 : 3}" class="empty">${escapeHtml(labels.noData)}</td></tr>`
      : active
          .map((item, index) => {
            const share = total > 0 ? `${Math.round((item.count / total) * 100)}%` : "0%";
            return `
            <tr>
              <td class="rank">${index + 1}</td>
              <td>${escapeHtml(itemLabel(item, isCountry))}</td>
              <td class="num">${item.count.toLocaleString()}</td>
              ${isCountry ? `<td class="num">${share}</td>` : ""}
            </tr>`;
          })
          .join("");

  return `
    <section class="block">
      <h2>${escapeHtml(title)}</h2>
      <table>
        <thead>
          <tr>
            <th class="rank">${escapeHtml(labels.rank)}</th>
            <th>${escapeHtml(isCountry ? labels.country : labels.name)}</th>
            <th class="num">${escapeHtml(labels.views)}</th>
            ${isCountry ? `<th class="num">${escapeHtml(labels.share)}</th>` : ""}
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </section>`;
}

export function buildReportHtml(report: AnalyticsReport, labels: ReportLabels): string {
  const generatedAt = new Date().toLocaleString("ja-JP");
  const range = `${formatDate(report.startDate)} 〜 ${formatDate(report.endDate)}`;

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(labels.title)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Noto Sans JP", "Helvetica Neue", Arial, sans-serif;
    color: #1a1714; margin: 0; font-size: 12px; line-height: 1.5;
  }
  header { border-bottom: 2px solid #c9a96e; padding-bottom: 12px; margin-bottom: 20px; }
  header h1 { margin: 0; font-size: 20px; }
  header .subtitle { color: #6b6355; margin-top: 2px; }
  header .meta { color: #8a8170; font-size: 11px; margin-top: 8px; }
  .cards { display: flex; gap: 12px; margin-bottom: 20px; }
  .card { flex: 1; border: 1px solid #e5e0d5; border-radius: 8px; padding: 12px 14px; }
  .card-label { color: #6b6355; font-size: 11px; }
  .card-value { font-size: 24px; font-weight: 700; margin: 4px 0; }
  .card-change { font-size: 11px; }
  .card-change.up { color: #15803d; }
  .card-change.down { color: #b91c1c; }
  .block { margin-bottom: 20px; page-break-inside: avoid; }
  h2 { font-size: 14px; margin: 0 0 8px; border-left: 3px solid #c9a96e; padding-left: 8px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee7d9; }
  th { color: #6b6355; font-weight: 600; font-size: 11px; }
  td.num, th.num { text-align: right; }
  td.rank, th.rank { width: 40px; color: #8a8170; }
  td.empty { color: #8a8170; text-align: center; padding: 12px; }
  .chart { border: 1px solid #e5e0d5; border-radius: 8px; padding: 12px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <header>
    <h1>${escapeHtml(labels.title)}</h1>
    <div class="subtitle">${escapeHtml(labels.subtitle)}</div>
    <div class="meta">${escapeHtml(labels.dateRange)}: ${range} ・ ${escapeHtml(labels.generatedAt)}: ${escapeHtml(generatedAt)}</div>
  </header>

  <div class="cards">${overviewCards(report, labels)}</div>

  <section class="block">
    <h2>${escapeHtml(labels.dailyTrend)}</h2>
    <div class="chart">${trendSvg(report.daily) || `<p class="empty">${escapeHtml(labels.noData)}</p>`}</div>
  </section>

  ${topListTable(labels.topCategories, report.topCategories, labels)}
  ${topListTable(labels.topDishes, report.topDishes, labels)}
  ${topListTable(labels.topCountries, report.topCountries, labels, { isCountry: true })}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Browser triggers
// ---------------------------------------------------------------------------

function fileStamp(report: AnalyticsReport): string {
  return `analytics_${report.startDate}_${report.endDate}`;
}

export function downloadCsv(report: AnalyticsReport, labels: ReportLabels): void {
  // Prepend BOM so Excel opens the UTF-8 (Japanese) content correctly
  const blob = new Blob(["\uFEFF" + buildCsv(report, labels)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileStamp(report)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function printPdf(report: AnalyticsReport, labels: ReportLabels): boolean {
  const win = window.open("", "_blank", "width=900,height=1200");
  if (!win) return false; // popup blocked — caller surfaces a toast

  win.document.write(buildReportHtml(report, labels));
  win.document.close();
  win.document.title = fileStamp(report);

  // Wait for fonts/layout before invoking the print dialog
  win.onload = () => {
    win.focus();
    win.print();
  };

  return true;
}
