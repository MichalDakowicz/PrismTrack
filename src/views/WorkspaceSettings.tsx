import { useState } from "react";
import { Settings2, Globe, Hash, Image, Save, Loader2, Check } from "lucide-react";
import { cn } from "../lib/utils";

interface WorkspaceSettingsProps {
  workspaceName?: string;
  workspaceSlug?: string;
  workspaceAvatar?: string;
}

export function WorkspaceSettings({ 
  workspaceName = "My Workspace", 
  workspaceSlug = "my-workspace",
  workspaceAvatar = "" 
}: WorkspaceSettingsProps) {
  const [name, setName] = useState(workspaceName);
  const [slug, setSlug] = useState(workspaceSlug);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slugError, setSlugError] = useState("");

  const handleSlugChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    setSlug(sanitized);
    setSlugError("");
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 border-b border-border bg-surface/80 backdrop-blur-md px-6 py-4">
        <h1 className="text-xl font-semibold text-text-main tracking-tight">Workspace Settings</h1>
        <p className="text-sm text-text-dim mt-1">Manage your workspace identity and preferences</p>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-8">
          <section className="bg-surface border border-border rounded-sm p-6">
            <h2 className="text-base font-semibold text-text-main mb-4 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Workspace Avatar
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-surface-hover border border-border flex items-center justify-center overflow-hidden">
                {workspaceAvatar ? (
                  <img src={workspaceAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Settings2 className="w-8 h-8 text-text-dim" />
                )}
              </div>
              <div>
                <button className="px-3 py-1.5 bg-surface-hover hover:bg-border border border-border rounded-sm text-sm font-mono text-text-main transition-colors">
                  Upload Image
                </button>
                <p className="text-xs text-text-dim mt-2">Recommended: 256x256px</p>
              </div>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-sm p-6">
            <h2 className="text-base font-semibold text-text-main mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-text-dim mb-1.5">Workspace Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setSaved(false); }}
                  className="w-full bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-text-dim mb-1.5">Workspace Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-text-dim"> prismtrack.com/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className={cn(
                      "flex-1 bg-surface-hover border rounded-sm py-2 px-3 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all",
                      slugError ? "border-accent" : "border-border"
                    )}
                  />
                </div>
                {slugError && <p className="text-xs text-accent mt-1">{slugError}</p>}
                <p className="text-xs text-text-dim mt-2">This will be used in your workspace URL</p>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-text-dim">
              Last updated: Just now
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-mono transition-all",
                saved 
                  ? "bg-primary/20 text-primary"
                  : "bg-primary text-white hover:bg-primary/90",
                isSaving && "opacity-50 cursor-wait"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}