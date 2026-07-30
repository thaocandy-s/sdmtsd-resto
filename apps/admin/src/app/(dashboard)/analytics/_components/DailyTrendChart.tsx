import { useTranslations } from "next-intl";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { DailyPoint } from "./types";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip);

interface Props {
  dailyData?: DailyPoint[];
}

// Single line chart of daily visitors — the only chart on the page
export function DailyTrendChart({ dailyData }: Props) {
  const t = useTranslations("analytics");

  const labels = (dailyData ?? []).map((day) =>
    new Date(day.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
  );

  const chartData: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: t("visitors"),
        data: (dailyData ?? []).map((day) => day.visitors),
        borderColor: "#C9A96E", // gold-500
        backgroundColor: "rgba(201, 169, 110, 0.12)",
        fill: true,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: "#D4AE66", // gold-400
        tension: 0.3,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      tooltip: {
        backgroundColor: "#252119", // background-tertiary
        borderColor: "#3A3228", // border
        borderWidth: 1,
        titleColor: "#F5F0E8", // foreground
        bodyColor: "#F5F0E8",
        displayColors: false,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} ${t("visitors")}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#C8BFA8", // foreground-secondary
          maxTicksLimit: 8,
          maxRotation: 0,
        },
        border: { color: "#3A3228" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(58, 50, 40, 0.5)" },
        ticks: { color: "#C8BFA8", precision: 0 },
        border: { display: false },
      },
    },
  };

  return (
    <div className="bg-background-secondary border border-border rounded-lg p-6 mb-8">
      <h3 className="text-lg font-bold text-foreground mb-4">{t("dailyTrend")}</h3>
      {!dailyData || dailyData.length === 0 ? (
        <p className="text-foreground-secondary text-sm">{t("noData")}</p>
      ) : (
        <div className="h-56">
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
