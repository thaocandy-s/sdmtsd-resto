import { useTranslations } from "next-intl";
import { Buffet } from "./types";
import { ActionsMenu } from "./ActionsMenu";

interface BuffetCardProps {
  buffet: Buffet;
  onEdit: (buffet: Buffet) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (buffet: Buffet) => void;
}

export function BuffetCard({ buffet, onEdit, onDelete, onDuplicate }: BuffetCardProps) {
  const t = useTranslations("buffetMenu");
  const tc = useTranslations("common");

  const groupSizeText =
    buffet.minPeople || buffet.maxPeople
      ? buffet.minPeople && buffet.maxPeople
        ? t("groupSizeFormat", { min: buffet.minPeople!, max: buffet.maxPeople! })
        : buffet.minPeople
          ? t("minPeopleFormat", { min: buffet.minPeople! })
          : t("maxPeopleFormat", { max: buffet.maxPeople! })
      : "-";

  return (
    <div className="bg-background-secondary border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:border-border/80 transition-colors">
      {/* Top Row: Image + Name + Popular Badge + Actions Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-background-tertiary flex-shrink-0">
            {buffet.imageUrl ? (
              <img src={buffet.imageUrl} alt={buffet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground-tertiary text-xs">
                {t("noImage")}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground text-base leading-snug break-words">
                {buffet.name}
              </h3>
              {buffet.isPopular && (
                <span className="text-[10px] bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                  {t("popularLabel")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top-Right 3-Dot Actions Menu */}
        <div className="-mr-1 -mt-1 flex-shrink-0">
          <ActionsMenu
            onEdit={() => onEdit(buffet)}
            onDelete={() => onDelete(buffet.id)}
            onDuplicate={onDuplicate ? () => onDuplicate(buffet) : undefined}
          />
        </div>
      </div>

      {/* Middle Section: Short Description (max 2 lines) */}
      {buffet.description && (
        <p className="text-xs text-foreground-secondary line-clamp-2 leading-relaxed">
          {buffet.description}
        </p>
      )}

      {/* Information Section: Clean 2-Column Grid */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-3 border-t border-border/40 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-foreground-tertiary font-medium">{t("priceLabel")}</span>
          <span className="text-gold-400 font-semibold text-sm">
            ¥{buffet.price.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-foreground-tertiary font-medium">{t("durationLabel")}</span>
          <span className="text-foreground font-medium">
            {t("durationFormat", { duration: buffet.duration })}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-foreground-tertiary font-medium">{t("groupSize")}</span>
          <span className="text-foreground font-medium">{groupSizeText}</span>
        </div>

        <div className="flex flex-col gap-0.5 items-start">
          <span className="text-foreground-tertiary font-medium mb-0.5">{tc("status")}</span>
          <span
            className={`px-2 py-0.5 rounded font-medium text-[11px] ${
              buffet.status === "PUBLISHED"
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {buffet.status === "PUBLISHED" ? tc("published") : tc("draft")}
          </span>
        </div>
      </div>
    </div>
  );
}
