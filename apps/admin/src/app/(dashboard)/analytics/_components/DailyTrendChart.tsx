import { useTranslations } from "next-intl";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { DailyPoint } from "./types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface Props {
  dailyData?: DailyPoint[];
}

export function DailyTrendChart({ dailyData }: Props) {
  const t = useTranslations("analytics");

  const labels = (dailyData ?? []).map((day) =>
    new Date(day.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
  );

  const chartData: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: t("views"),
        data: (dailyData ?? []).map((day) => day.pageViews),
        backgroundColor: "rgba(201, 169, 110, 0.8)", // gold-500/80
        hoverBackgroundColor: "#D4AE66", // gold-400
        borderRadius: { topLeft: 4, topRight: 4 },
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: "#252119", // background-tertiary
        borderColor: "#3A3228", // border
        borderWidth: 1,
        titleColor: "#F5F0E8", // foreground
        bodyColor: "#F5F0E8",
        displayColors: false,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} ${t("views")}`,
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
        <div className="h-48">
          <Bar data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
