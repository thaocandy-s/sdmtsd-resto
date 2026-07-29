import { useTranslations } from "next-intl";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  status: string;
  createdAt: string;
}

interface MessageTableProps {
  contacts: Contact[];
  onView: (contact: Contact) => void;
  getStatusColor: (status: string) => string;
}

export function MessageTable({ contacts, onView, getStatusColor }: MessageTableProps) {
  const t = useTranslations("contact");

  const getLocalizedStatus = (status: string) => {
    switch (status) {
      case "NEW":
        return t("new");
      case "IN_PROGRESS":
        return t("inProgress");
      case "RESOLVED":
        return t("resolved");
      case "CLOSED":
        return t("closed");
      default:
        return status;
    }
  };

  return (
    <div className="bg-background-secondary border border-border rounded-lg overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr className="text-left">
              <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">
                {t("fromLabel")}
              </th>
              <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">
                {t("subjectLabel")}
              </th>
              <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">
                {t("statusLabel")}
              </th>
              <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">
                {t("dateLabel")}
              </th>
              <th className="px-4 py-3 text-sm font-medium text-foreground-secondary">
                {t("actionsLabel")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contacts.map((c) => (
              <tr
                key={c.id}
                className={`hover:bg-background-tertiary/50 ${!c.isRead ? "bg-gold-500/5" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {!c.isRead && (
                      <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-foreground-secondary">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground-secondary truncate max-w-[200px]">
                  {c.subject}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(c.status)}`}>
                    {getLocalizedStatus(c.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground-secondary text-sm">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onView(c)}
                    className="text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors"
                  >
                    {t("view")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden divide-y divide-border">
        {contacts.map((c) => (
          <div
            key={c.id}
            onClick={() => onView(c)}
            className={`p-4 hover:bg-background-tertiary/50 cursor-pointer flex flex-col gap-2 transition-colors ${
              !c.isRead ? "bg-gold-500/5 border-l-2 border-gold-500" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {!c.isRead && <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />}
                <div>
                  <p className="font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-foreground-secondary">{c.email}</p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded flex-shrink-0 ${getStatusColor(c.status)}`}
              >
                {getLocalizedStatus(c.status)}
              </span>
            </div>

            <div className="text-sm text-foreground-secondary line-clamp-1 font-medium">
              {c.subject}
            </div>

            <div className="text-xs text-foreground-tertiary">
              {new Date(c.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
