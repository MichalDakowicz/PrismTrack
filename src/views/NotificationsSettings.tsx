import { useState } from "react";
import { Bell, Mail, MessageSquare, Check, Loader2, Smartphone, CalendarDays } from "lucide-react";
import { cn } from "../lib/utils";
import { SettingsHeader, SettingsSection } from "../components/SettingsPrimitives";

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
  const [saved, setSaved] = useState(false);
  const [digest, setDigest] = useState<"off" | "daily" | "weekly">("daily");

  const toggleChannel = (channelId: string) => {
    setSaved(false);
    setSelectedChannels(channels =>
      channels.map(ch => ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch)
    );
  };

  const toggleNotificationChannel = (settingId: string, channelType: "email" | "slack" | "discord" | "webhook") => {
    setSaved(false);
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
      await new Promise(resolve => setTimeout(resolve, 250));
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SettingsHeader title="Notifications" description="Configure notification channels and preferences" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl space-y-8">
          <SettingsSection
            title="Notification Channels"
            description="Enable and configure your notification delivery methods"
            icon={<Bell className="w-4 h-4" />}
          >
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
          </SettingsSection>

          <SettingsSection
            title="Notification Preferences"
            description="Choose which events trigger notifications and how"
            icon={<Smartphone className="w-4 h-4" />}
          >

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

            <div className="mt-5 pt-4 border-t border-border">
              <label htmlFor="digest" className="block text-sm font-mono text-text-dim mb-1.5">
                Email Digest
              </label>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-text-dim" />
                <select
                  id="digest"
                  value={digest}
                  onChange={(e) => {
                    setDigest(e.target.value as "off" | "daily" | "weekly");
                    setSaved(false);
                  }}
                  className="bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="off">Off</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          </SettingsSection>

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
                  {saved ? "Saved" : "Save Preferences"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}