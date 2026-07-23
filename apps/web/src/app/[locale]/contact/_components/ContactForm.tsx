import { useTranslations } from "next-intl";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
}

export function ContactForm({ formData, setFormData, onSubmit, loading, error }: ContactFormProps) {
  const t = useTranslations("contact");

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            {t("name")} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full h-10 rounded-md border border-border bg-background-secondary px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            {t("email")} *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full h-10 rounded-md border border-border bg-background-secondary px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            {t("phone")}
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full h-10 rounded-md border border-border bg-background-secondary px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            {t("subject")} *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
            className="w-full h-10 rounded-md border border-border bg-background-secondary px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            {t("message")} *
          </label>
          <textarea
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-900/20 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold-500 hover:bg-gold-600 text-background font-semibold h-12 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? t("sending") : t("sendMessage")}
        </button>
      </form>
    </main>
  );
}
