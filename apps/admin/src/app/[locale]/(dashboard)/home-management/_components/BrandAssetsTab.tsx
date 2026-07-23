import { useTranslations } from "next-intl";
import { ImageUpload } from "@/shared/components/image-upload";

interface BrandAssetsTabProps {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  setLogoFile: (file: File | null) => void;
  faviconUrl: string;
  setFaviconUrl: (url: string) => void;
  setFaviconFile: (file: File | null) => void;
  logoSubtitle: string;
  setLogoSubtitle: (text: string) => void;
  restaurantName: string;
  setRestaurantName: (text: string) => void;
  handleSaveAssets: () => void;
  saving: boolean;
}

export function BrandAssetsTab({
  logoUrl,
  setLogoUrl,
  setLogoFile,
  faviconUrl,
  setFaviconUrl,
  setFaviconFile,
  logoSubtitle,
  setLogoSubtitle,
  restaurantName,
  setRestaurantName,
  handleSaveAssets,
  saving,
}: BrandAssetsTabProps) {
  const t = useTranslations("homeManagement");
  const tSettings = useTranslations("settings");

  return (
    <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-2xl">
      <h3 className="text-lg font-medium text-foreground mb-4 font-jp">{t("brandingTitle")}</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Restaurant Name</label>
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-gold-500"
            placeholder="e.g. 三代目土信田商店"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Logo Subtitle (Mobile Header Subtitle)
          </label>
          <input
            type="text"
            value={logoSubtitle}
            onChange={(e) => setLogoSubtitle(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-gold-500"
            placeholder="e.g. 鉄板・もんじゃ・居酒屋"
          />
        </div>

        <ImageUpload
          label={t("logoLabel")}
          value={logoUrl}
          onChange={(url, file) => {
            setLogoUrl(url);
            setLogoFile(file || null);
          }}
          folder="brand"
        />

        <ImageUpload
          label={t("faviconLabel")}
          value={faviconUrl}
          onChange={(url, file) => {
            setFaviconUrl(url);
            setFaviconFile(file || null);
          }}
          folder="brand"
        />

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSaveAssets}
            disabled={saving}
            className="bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-background font-semibold px-6 py-2 rounded-lg transition-colors cursor-pointer animate-none"
          >
            {saving ? tSettings("updating") : tSettings("saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}
