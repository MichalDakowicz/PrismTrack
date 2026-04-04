import { type ReactNode } from "react";

interface SettingsHeaderProps {
  title: string;
  description: string;
}

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function SettingsHeader({ title, description }: SettingsHeaderProps) {
  return (
    <header className="shrink-0 border-b border-border bg-surface/80 backdrop-blur-md px-6 py-4">
      <h1 className="text-xl font-semibold text-text-main tracking-tight">{title}</h1>
      <p className="text-sm text-text-dim mt-1">{description}</p>
    </header>
  );
}

export function SettingsSection({ title, description, icon, children }: SettingsSectionProps) {
  return (
    <section className="bg-surface border border-border rounded-sm p-6">
      <h2 className="text-base font-semibold text-text-main mb-2 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {description && <p className="text-sm text-text-dim mb-4">{description}</p>}
      {children}
    </section>
  );
}
