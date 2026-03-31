import { useState } from "react";
import { Bell, Mail, MessageSquare, Check, Loader2, Smartphone, Monitor } from "lucide-react";
import { cn } from "../lib/utils";

interface NotificationChannel {
  id: string;
  name: string;
  type: "email" | "slack" | "discord" | "webhook";
  enabled: boolean;
  icon: typeof Mail;
}

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  channels: {
    email: boolean;
    slack: boolean;
    discord: boolean;
    webhook: boolean;
  };
}

interface NotificationsSettingsProps {
  channels?: NotificationChannel[];
  settings?: NotificationSetting[];
}

export function NotificationsSettings({ 
  channels = [
    { id: "1", name: "Email", type: "email", enabled: true, icon: Mail },
    { id: "2", name: "Slack", type: "slack", enabled: false, icon: MessageSquare },
  ],
  settings = [
    { id: "1", label: "New Issues", description: "When a new issue is created in linked repositories", channels: { email: true, slack: false, discord: false, webhook: false } },
    { id: "2", label: "Issue Updates", description: "When an issue is updated or commented on", channels: { email: true, slack: true, discord: false, webhook: false } },
    { id: "3", label: "Pull Requests", description: "When PRs are opened, updated, or merged", channels: { email: true, slack: true, discord: false, webhook: false } },
    { id: "4", label: "Mentions", description: "When you are mentioned in issues or PRs", channels: { email: true, slack: true, discord: true, webhook: false } },
    { id: "5", label: "Reviews Requested", description: "When a review is requested from you", channels: { email: true, slack: false, discord: false, webhook: false } },
  ]
}: NotificationsSettingsProps) {
  const [selectedChannels, setSelectedChannels] = useState(channels);
  const [notificationSettings, setNotificationSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  const toggleChannel = (channelId: string) => {
    setSelectedChannels(channels =>
      channels.map(ch => ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch)
    );
  };

  const toggleNotificationChannel = (settingId: string, channelType: "email" | "slack" | "discord" | "webhook") => {
    setNotificationSettings(settings =>
      settings.map(s => {
        if (s.id !== settingId) return s;
        const channelEnabled = s.channels[channelType];
        const hasChannel = selectedChannels.some(ch => ch.type === channelType && ch.enabled);
        if (channelEnabled && !hasChannel) return s;
        return {
          ...s,
          channels: {
            ...s.channels,
            [channelType]: !channelEnabled
          }
        };
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setSaving(false);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email": return Mail;
      case "slack": return MessageSquare;
      default: return Bell;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 border-b border-border bg-surface/80 backdrop-blur-md px-6 py-4">
        <h1 className="text-xl font-semibold text-text-main tracking-tight">Notifications</h1>
        <p className="text-sm text-text-dim mt-1">Configure notification channels and preferences</p>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl space-y-8">
          <section className="bg-surface border border-border rounded-sm p-6">
            <h2 className="text-base font-semibold text-text-main mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notification Channels
            </h2>
            <p className="text-sm text-text-dim mb-4">Enable and configure your notification delivery methods</p>
            
            <div className="space-y-3">
              {selectedChannels.map((channel) => {
                const ChannelIcon = channel.icon;
                return (
                  <div 
                    key={channel.id}
                    className="flex items-center justify-between py-3 px-3 -mx-3 rounded-sm hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-sm flex items-center justify-center",
                        channel.enabled ? "bg-primary/10 text-primary" : "bg-surface-hover text-text-dim"
                      )}>
                        <ChannelIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-text-main">{channel.name}</span>
                        <span className="text-xs text-text-dim ml-2 capitalize">{channel.type}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleChannel(channel.id)}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors",
                        channel.enabled ? "bg-primary" : "bg-border"
                      )}
                    >
                      <span className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                        channel.enabled ? "left-6" : "left-1"
                      )} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-surface border border-border rounded-sm p-6">
            <h2 className="text-base font-semibold text-text-main mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Notification Preferences
            </h2>
            <p className="text-sm text-text-dim mb-4">Choose which events trigger notifications and how</p>

            <div className="space-y-4">
              {notificationSettings.map((setting) => (
                <div key={setting.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-text-main">{setting.label}</h3>
                      <p className="text-xs text-text-dim mt-1">{setting.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(["email", "slack", "discord", "webhook"] as const).map((channelType) => {
                      const isEnabled = setting.channels[channelType];
                      const isAvailable = selectedChannels.some(ch => ch.type === channelType && ch.enabled);
                      return (
                        <button
                          key={channelType}
                          onClick={() => toggleNotificationChannel(setting.id, channelType)}
                          disabled={!isAvailable}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono border transition-all",
                            isEnabled && isAvailable
                              ? "bg-primary/10 text-primary border-primary/20"
                              : isAvailable 
                                ? "bg-surface-hover text-text-dim border-border hover:border-primary/30"
                                : "bg-surface-hover text-text-dim/50 border-border opacity-50 cursor-not-allowed",
                          )}
                        >
                          {isEnabled && <Check className="w-3 h-3" />}
                          {channelType}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-end pt-4 border-t border-border">
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-mono transition-all",
                saving ? "bg-primary/50 text-white" : "bg-primary text-white hover:bg-primary/90"
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}