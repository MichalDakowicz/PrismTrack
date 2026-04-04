import { useState } from "react";
import {
  Settings2,
  Globe,
  Hash,
  Image,
  Save,
  Loader2,
  Check,
  FileText,
  TriangleAlert,
} from "lucide-react";
import { cn } from "../lib/utils";
import { SettingsHeader, SettingsSection } from "../components/SettingsPrimitives";

interface WorkspaceSettingsProps {
  workspaceName?: string;
  workspaceSlug?: string;
  workspaceAvatar?: string;
  workspaceDescription?: string;
}

export function WorkspaceSettings({
  workspaceName = "My Workspace",
  workspaceSlug = "my-workspace",
  workspaceAvatar = "",
  workspaceDescription = "Central workspace for cross-repository planning and delivery.",
}: WorkspaceSettingsProps) {
  const [name, setName] = useState(workspaceName);
  const [slug, setSlug] = useState(workspaceSlug);
  const [avatarSource, setAvatarSource] = useState(workspaceAvatar);
  const [description, setDescription] = useState(workspaceDescription);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [workspaceDeleted, setWorkspaceDeleted] = useState(false);

  const handleSlugChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    setSlug(sanitized);
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

  const handleDeleteWorkspace = async () => {
    if (deleteConfirmValue.trim() !== slug) {
      return;
    }

    setIsDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      setWorkspaceDeleted(true);
      setShowDeleteConfirm(false);
      setDeleteConfirmValue("");
    } finally {
      setIsDeleting(false);
    }
  };

  const canDelete = deleteConfirmValue.trim() === slug;

  return (
    <div className="flex flex-col h-full">
      <SettingsHeader title="Workspace Settings" description="Manage your workspace identity and preferences" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-8">
          <SettingsSection title="Workspace Avatar" icon={<Image className="w-4 h-4" />}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-surface-hover border border-border flex items-center justify-center overflow-hidden">
                {avatarSource ? (
                  <img src={avatarSource} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Settings2 className="w-8 h-8 text-text-dim" />
                )}
              </div>
              <div className="flex-1">
                <label htmlFor="workspace-avatar" className="block text-sm font-mono text-text-dim mb-1.5">
                  Avatar Source URL
                </label>
                <input
                  id="workspace-avatar"
                  type="url"
                  value={avatarSource}
                  onChange={(e) => {
                    setAvatarSource(e.target.value);
                    setSaved(false);
                  }}
                  placeholder="https://example.com/avatar.png"
                  className="w-full bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <p className="text-xs text-text-dim mt-2">Recommended: square image, at least 256x256px</p>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Basic Information" icon={<Globe className="w-4 h-4" />}>
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
                    className="flex-1 bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <p className="text-xs text-text-dim mt-2">This will be used in your workspace URL</p>
              </div>

              <div>
                <label htmlFor="workspace-description" className="block text-sm font-mono text-text-dim mb-1.5">
                  Workspace Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 w-4 h-4 text-text-dim" />
                  <textarea
                    id="workspace-description"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setSaved(false);
                    }}
                    rows={4}
                    className="w-full bg-surface-hover border border-border rounded-sm py-2 pl-9 pr-3 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Danger Zone"
            description="Deleting a workspace is irreversible and removes all associated configuration."
            icon={<TriangleAlert className="w-4 h-4 text-accent" />}
          >
            {workspaceDeleted ? (
              <p className="text-sm text-primary">Workspace deletion was requested.</p>
            ) : (
              <>
                <button
                  onClick={() => setShowDeleteConfirm((current) => !current)}
                  className="px-3 py-1.5 bg-accent/10 border border-accent/40 rounded-sm text-sm font-mono text-accent hover:bg-accent/20 transition-colors"
                >
                  Delete Workspace
                </button>

                {showDeleteConfirm && (
                  <div className="mt-4 p-4 border border-accent/40 bg-accent/5 rounded-sm space-y-3">
                    <p className="text-sm text-text-main">
                      Type <span className="font-mono">{slug}</span> to confirm workspace deletion.
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmValue}
                      onChange={(e) => setDeleteConfirmValue(e.target.value)}
                      className="w-full bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm font-mono text-text-main focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                      placeholder={slug}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteWorkspace}
                        disabled={!canDelete || isDeleting}
                        className={cn(
                          "px-3 py-1.5 rounded-sm text-sm font-mono text-white transition-all",
                          canDelete ? "bg-accent hover:bg-accent/90" : "bg-accent/40",
                          (isDeleting || !canDelete) && "cursor-not-allowed"
                        )}
                      >
                        {isDeleting ? "Deleting..." : "Confirm Delete"}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmValue("");
                        }}
                        className="px-3 py-1.5 border border-border rounded-sm text-sm font-mono text-text-main hover:bg-surface-hover transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </SettingsSection>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-text-dim">Last updated: Just now</div>
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