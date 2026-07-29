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

interface MessageDetailModalProps {
  contact: Contact;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export function MessageDetailModal({
  contact,
  onClose,
  onUpdateStatus,
  onDelete,
}: MessageDetailModalProps) {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">{t("messageDetails")}</h3>
          <button
            onClick={onClose}
            className="text-foreground-secondary hover:text-foreground text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-foreground-secondary">{t("fromLabel")}</p>
            <p className="text-foreground font-medium">{contact.name}</p>
            <p className="text-foreground-secondary text-sm">{contact.email}</p>
          </div>
          {contact.phone && (
            <div>
              <p className="text-sm text-foreground-secondary">{t("phoneLabel")}</p>
              <p className="text-foreground">{contact.phone}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-foreground-secondary">{t("subjectLabel")}</p>
            <p className="text-foreground">{contact.subject}</p>
          </div>
          <div>
            <p className="text-sm text-foreground-secondary">{t("messageLabel")}</p>
            <p className="text-foreground whitespace-pre-wrap">{contact.message}</p>
          </div>
          <div>
            <p className="text-sm text-foreground-secondary">{t("receivedLabel")}</p>
            <p className="text-foreground">{new Date(contact.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-3 pt-4 border-t border-border mt-6">
            <select
              value={contact.status}
              onChange={(e) => onUpdateStatus(contact.id, e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
            >
              <option value="NEW">{t("new")}</option>
              <option value="IN_PROGRESS">{t("inProgress")}</option>
              <option value="RESOLVED">{t("resolved")}</option>
              <option value="CLOSED">{t("closed")}</option>
            </select>
            <button
              onClick={() => onDelete(contact.id)}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
            >
              {tCommon("delete")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
