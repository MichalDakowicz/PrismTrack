import { useState } from "react";
import { Github, Check, X, Loader2, Settings, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";

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
  const [isInstalling, setIsInstalling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
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

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 border-b border-border bg-surface/80 backdrop-blur-md px-6 py-4">
        <h1 className="text-xl font-semibold text-text-main tracking-tight">GitHub App</h1>
        <p className="text-sm text-text-dim mt-1">Manage GitHub App installation and permissions</p>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          <section className="bg-surface border border-border rounded-sm p-6">
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
                installed 
                  ? "bg-primary/10 text-primary border-primary/20" 
                  : "bg-surface-hover text-text-dim border-border"
              )}>
                {installed ? "Installed" : "Not Installed"}
              </div>
            </div>
          </section>

          {installed ? (
            <>
              <section className="bg-surface border border-border rounded-sm p-6">
                <h2 className="text-base font-semibold text-text-main mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Installation Details
                </h2>
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
                    <span className="text-sm font-mono text-primary">Read/Write</span>
                  </div>
                </div>
              </section>

              <section className="bg-surface border border-border rounded-sm p-6">
                <h2 className="text-base font-semibold text-text-main mb-4">Permissions</h2>
                <div className="space-y-2">
                  {[
                    { name: "Repository metadata", status: "read", granted: true },
                    { name: "Issues", status: "read/write", granted: true },
                    { name: "Pull requests", status: "read/write", granted: true },
                    { name: "Contents", status: "read", granted: true },
                    { name: "Workflows", status: "read", granted: true },
                  ].map((perm) => (
                    <div key={perm.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm text-text-main">{perm.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-text-dim">{perm.status}</span>
                        {perm.granted ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <X className="w-4 h-4 text-text-dim" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex items-center gap-4">
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