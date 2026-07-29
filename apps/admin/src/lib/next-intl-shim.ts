import ja from "../constants/ja";

export function useLocale() {
  return "ja";
}

type Values = Record<string, string | number | boolean>;

export function useTranslations(namespace?: string) {
  return (key: string, values?: Values) => {
    const path = namespace ? `${namespace}.${key}` : key;
    const parts = path.split(".");

    let current: any = ja;
    for (const part of parts) {
      if (current && typeof current === "object") {
        current = current[part];
      } else {
        current = undefined;
        break;
      }
    }

    let message = typeof current === "string" ? current : key;

    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        message = message.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }

    return message;
  };
}

export function NextIntlClientProvider({ children }: any) {
  return children;
}
