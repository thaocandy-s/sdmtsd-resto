import type { ReactNode } from "react";

const fieldClassName =
  "w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 disabled:opacity-50";

export function TextInput({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  type = "text",
  placeholder,
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-foreground-secondary mb-1">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={fieldClassName}
      />
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  required = false,
  rows = 3,
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm text-foreground-secondary mb-1">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        rows={rows}
        className={fieldClassName}
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  children,
  required = false,
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-foreground-secondary mb-1">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={fieldClassName}
      >
        {children}
      </select>
    </div>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="rounded border-border"
      />
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}

export function UrlInput({
  label,
  value,
  onChange,
  required = false,
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <TextInput label={label} value={value} onChange={onChange} required={required} type="url" />
  );
}
