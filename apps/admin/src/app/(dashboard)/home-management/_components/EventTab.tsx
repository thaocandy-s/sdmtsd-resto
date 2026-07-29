import { useTranslations } from "next-intl";

interface Event {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface EventTabProps {
  events: Event[];
  onDelete: (id: string) => void;
}

export function EventTab({ events, onDelete }: EventTabProps) {
  const t = useTranslations("homeManagement");
  const tCommon = useTranslations("common");

  if (events.length === 0) {
    return (
      <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
        <p className="text-foreground-secondary">{t("noEvents")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((e) => (
        <div
          key={e.id}
          className="bg-background-secondary border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <p className="font-medium text-foreground">{e.title}</p>
            <p className="text-sm text-foreground-secondary">
              {new Date(e.startDate).toLocaleDateString()} -{" "}
              {new Date(e.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0">
            <span
              className={`text-xs px-2 py-1 rounded ${
                e.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {e.isActive ? tCommon("active") : tCommon("inactive")}
            </span>
            <button
              onClick={() => onDelete(e.id)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              {tCommon("delete")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
