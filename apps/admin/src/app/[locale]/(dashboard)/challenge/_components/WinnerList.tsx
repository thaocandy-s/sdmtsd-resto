import { useTranslations } from "next-intl";
import { Winner } from "./types";

interface WinnerListProps {
  winners: Winner[];
  onEdit: (winner: Winner) => void;
  onDelete: (id: string) => void;
}

export function WinnerList({ winners, onEdit, onDelete }: WinnerListProps) {
  const t = useTranslations("challenge");
  const tc = useTranslations("common");

  if (winners.length === 0) {
    return (
      <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
        <p className="text-foreground-secondary">{t("noWinners")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {winners.map((w) => (
        <div
          key={w.id}
          className="bg-background-secondary border border-border rounded-lg p-4 flex gap-4"
        >
          <div className="w-20 h-20 bg-background-tertiary rounded-lg flex-shrink-0 overflow-hidden">
            {w.imageUrl && (
              <img
                src={w.imageUrl}
                alt={w.participantName}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{w.participantName}</h3>
            {w.challengeName && (
              <p className="text-sm text-foreground-secondary">{w.challengeName}</p>
            )}
            {w.discountAwarded && (
              <p className="text-xs text-gold-400 mt-1">
                {t("winnerAwardLabel")}: {w.discountAwarded}
              </p>
            )}
            <p className="text-xs text-foreground-secondary mt-1">
              {new Date(w.completedAt).toLocaleDateString()}
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => onEdit(w)}
                className="text-gold-400 hover:text-gold-300 text-xs font-medium transition-colors"
              >
                {tc("edit")}
              </button>
              <button
                onClick={() => onDelete(w.id)}
                className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
              >
                {tc("delete")}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
