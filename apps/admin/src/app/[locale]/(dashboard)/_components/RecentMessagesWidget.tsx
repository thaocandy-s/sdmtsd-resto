import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

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

interface RecentMessagesWidgetProps {
  contacts: Contact[];
  getStatusColor: (status: string) => string;
  onViewContact: (contact: Contact) => void;
}

export function RecentMessagesWidget({
  contacts,
  getStatusColor,
  onViewContact,
}: RecentMessagesWidgetProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  return (
    <div className="bg-background-secondary border border-border rounded-lg p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-foreground">{t("recentMessages")}</h3>
        <Link
          href={`/${locale}/contact`}
          className="text-sm text-gold-400 hover:text-gold-300 font-medium transition-colors"
        >
          {t("viewAll")} &rarr;
        </Link>
      </div>
      <div className="space-y-3 overflow-y-auto overflow-x-hidden flex-1 max-h-[300px]">
        {contacts.length === 0 ? (
          <p className="text-sm text-foreground-tertiary">{t("noMessages")}</p>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onViewContact(contact)}
              className="flex items-center justify-between py-2 border-b border-border/60 last:border-0 cursor-pointer hover:bg-background-tertiary/30 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                {!contact.isRead && (
                  <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{contact.name}</p>
                  <p className="text-xs text-foreground-secondary truncate max-w-[150px] sm:max-w-[200px]">
                    {contact.subject}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded flex-shrink-0 ${getStatusColor(contact.status)}`}
              >
                {contact.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
