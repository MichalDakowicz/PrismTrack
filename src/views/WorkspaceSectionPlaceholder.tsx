import { AppWindow } from "lucide-react";

interface WorkspaceSectionPlaceholderProps {
  title: string;
  description: string;
}

export function WorkspaceSectionPlaceholder({ title, description }: WorkspaceSectionPlaceholderProps) {
  return (
    <div className="p-8">
      <div className="border border-dashed border-border p-8 text-center bg-surface max-w-230 mx-auto">
        <AppWindow className="w-10 h-10 text-text-dim mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-text-main">{title}</h2>
        <p className="text-sm text-text-dim mt-2">{description}</p>
      </div>
    </div>
  );
}
