import { useState } from "react";
import { Github, Check, X, Loader2, Settings, RefreshCw, Save, Link } from "lucide-react";
import { cn } from "../lib/utils";
import { SettingsHeader, SettingsSection } from "../components/SettingsPrimitives";

interface GitHubAppSettingsProps {
  installed?: boolean;
  installationDate?: string;
  repositoriesCount?: number;
}

export function GitHubAppSettings({ 
  installed = false,
  installationDate = "2024-01-15",
  repositoriesCount = 0
}: GitHubAppSettingsProps) {
  const [isInstalled, setIsInstalled] = useState(installed);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://api.prismtrack.dev/webhooks/github");
  const [webhookSecret, setWebhookSecret] = useState("prismtrack_webhook_secret");
  const [webhookEvents, setWebhookEvents] = useState({
    issues: true,
    pullRequests: true,
    pushes: false,
  });
  const [permissions, setPermissions] = useState([
    { name: "Repository metadata", level: "read" as const, granted: true },
    { name: "Issues", level: "write" as const, granted: true },
    { name: "Pull requests", level: "write" as const, granted: true },
    { name: "Contents", level: "read" as const, granted: true },
    { name: "Webhooks", level: "write" as const, granted: true },
  ]);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsInstalled(true);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePermissionChange = (name: string, level: "none" | "read" | "write") => {
    setPermissions((current) =>
      current.map((permission) =>
        permission.name === name
          ? {
              ...permission,
              level,
              granted: level !== "none",
            }
          : permission
      )
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWebhookEvent = (eventName: keyof typeof webhookEvents) => {
    setWebhookEvents((current) => ({
      ...current,
      [eventName]: !current[eventName],
    }));
    setSaved(false);
  };

  return (
    <div className="flex flex-col h-full">
      <SettingsHeader title="GitHub App" description="Manage GitHub App installation and permissions" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          <SettingsSection title="Installation Status" icon={<Github className="w-4 h-4" />}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-background rounded-md flex items-center justify-center border border-border">
                  <Github className="w-6 h-6 text-text-main" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-text-main">PrismTrack GitHub App</h2>
                  <p className="text-sm text-text-dim">Connect your GitHub repositories</p>
                </div>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-sm text-xs font-mono border",
                isInstalled
                  ? "bg-primary/10 text-primary border-primary/20" 
                  : "bg-surface-hover text-text-dim border-border"
              )}>
                {isInstalled ? "Installed" : "Not Installed"}
              </div>
            </div>
          </SettingsSection>

          {isInstalled ? (
            <>
              <SettingsSection title="Installation Details" icon={<Settings className="w-4 h-4" />}>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-mono text-text-dim">Installation ID</span>
                    <span className="text-sm font-mono text-text-main">12345678</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-mono text-text-dim">Installed On</span>
                    <span className="text-sm font-mono text-text-main">{installationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-mono text-text-dim">Repositories</span>
                    <span className="text-sm font-mono text-text-main">{repositoriesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-mono text-text-dim">Permissions</span>
                    <span className="text-sm font-mono text-primary">Custom</span>
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Repository Permissions" description="Choose read or write levels for each GitHub scope.">
                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <div
                      key={permission.name}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <span className="text-sm text-text-main">{permission.name}</span>
                      <div className="flex items-center gap-2">
                        <select
                          aria-label={`${permission.name} permission`}
                          value={permission.level}
                          onChange={(e) =>
                            handlePermissionChange(permission.name, e.target.value as "none" | "read" | "write")
                          }
                          className="bg-surface-hover border border-border rounded-sm px-2 py-1 text-xs font-mono text-text-main"
                        >
                          <option value="none">none</option>
                          <option value="read">read</option>
                          <option value="write">write</option>
                        </select>
                        {permission.granted ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <X className="w-4 h-4 text-text-dim" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SettingsSection>

              <SettingsSection title="Webhook Configuration" icon={<Link className="w-4 h-4" />}>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="webhook-url" className="block text-xs font-mono text-text-dim mb-1.5">
                      Webhook URL
                    </label>
                    <input
                      id="webhook-url"
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => {
                        setWebhookUrl(e.target.value);
                        setSaved(false);
                      }}
                      className="w-full bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="webhook-secret" className="block text-xs font-mono text-text-dim mb-1.5">
                      Webhook Secret
                    </label>
                    <input
                      id="webhook-secret"
                      type="password"
                      value={webhookSecret}
                      onChange={(e) => {
                        setWebhookSecret(e.target.value);
                        setSaved(false);
                      }}
                      className="w-full bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-text-dim mb-2">Subscribed Events</p>
                    <div className="flex gap-2">
                      {([
                        ["issues", "Issues"],
                        ["pullRequests", "Pull Requests"],
                        ["pushes", "Pushes"],
                      ] as const).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => toggleWebhookEvent(key)}
                          className={cn(
                            "px-2.5 py-1 rounded-sm border text-xs font-mono transition-colors",
                            webhookEvents[key]
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-border bg-surface-hover text-text-dim"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SettingsSection>

              <div className="flex items-center gap-4 pt-2 border-t border-border">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 bg-surface-hover hover:bg-border border border-border rounded-sm text-sm font-mono text-text-main transition-colors",
                    isRefreshing && "opacity-50 cursor-wait"
                  )}
                >
                  {isRefreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-sm text-sm font-mono transition-colors",
                    isSaving && "opacity-50 cursor-wait"
                  )}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saved ? "Saved" : "Save Settings"}
                </button>
                <button className="px-3 py-1.5 text-sm font-mono text-accent hover:underline">
                  Uninstall
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-text-dim mb-4">Install the GitHub app to connect your repositories</p>
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-sm text-sm font-mono mx-auto transition-all",
                  isInstalling && "opacity-50 cursor-wait"
                )}
              >
                {isInstalling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4" />
                    Install GitHub App
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}