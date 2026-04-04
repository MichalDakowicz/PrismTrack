import { useState } from "react";
import { Users, UserPlus, Shield, Mail, Search, Loader2, Crown, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { SettingsHeader, SettingsSection } from "../components/SettingsPrimitives";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: "admin" | "member" | "viewer";
  invitedAt: string;
  status: "pending";
}

interface MembersSettingsProps {
  members?: Member[];
}

export function MembersSettings({ 
  members = [
    { id: "1", name: "John Doe", email: "john@example.com", avatar: "", role: "owner", joinedAt: "2024-01-01" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", avatar: "", role: "admin", joinedAt: "2024-02-15" },
    { id: "3", name: "Bob Wilson", email: "bob@example.com", avatar: "", role: "viewer", joinedAt: "2024-03-20" },
  ]
}: MembersSettingsProps) {
  const [memberList, setMemberList] = useState(members);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [inviteError, setInviteError] = useState("");
  const [inviteNotice, setInviteNotice] = useState("");

  const filteredMembers = memberList.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInvite = async () => {
    if (!inviteEmail) {
      setInviteError("Email is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setInviteError("Enter a valid email address.");
      return;
    }

    const alreadyMember = memberList.some((member) => member.email.toLowerCase() === inviteEmail.toLowerCase());
    const alreadyInvited = pendingInvitations.some((invite) => invite.email.toLowerCase() === inviteEmail.toLowerCase());
    if (alreadyMember || alreadyInvited) {
      setInviteError("This email already has workspace access or a pending invite.");
      return;
    }

    setInviteError("");
    setInviteNotice("");
    setInviting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 250));
      setPendingInvitations((current) => [
        {
          id: String(Date.now()),
          email: inviteEmail,
          role: inviteRole,
          invitedAt: new Date().toISOString().slice(0, 10),
          status: "pending",
        },
        ...current,
      ]);
      setInviteNotice(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } finally {
      setInviting(false);
    }
  };

  const updateMemberRole = (memberId: string, role: "admin" | "member" | "viewer") => {
    setMemberList((current) =>
      current.map((member) =>
        member.id === memberId
          ? {
              ...member,
              role,
            }
          : member
      )
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner": return "text-accent bg-accent/10 border-accent/20";
      case "admin": return "text-primary bg-primary/10 border-primary/20";
      case "viewer": return "text-text-dim bg-surface-hover border-border";
      default: return "text-text-dim bg-surface-hover border-border";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return Crown;
      case "admin": return Shield;
      default: return Users;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SettingsHeader title="Members" description="Manage workspace members and their access" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl space-y-6">
          <SettingsSection title="Invite Members" icon={<UserPlus className="w-4 h-4" />}>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label htmlFor="invite-email" className="block text-xs font-mono text-text-dim mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      setInviteError("");
                    }}
                    className="w-full bg-surface-hover border border-border rounded-sm py-2 pl-9 pr-3 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>
              <div className="w-40">
                <label htmlFor="invite-role" className="block text-xs font-mono text-text-dim mb-1.5">
                  Role
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "admin" | "member" | "viewer")}
                  className="w-full bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-sm text-sm font-mono transition-all",
                  (inviting || !inviteEmail) && "opacity-50 cursor-wait"
                )}
              >
                {inviting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Invite
              </button>
            </div>
            {inviteError && <p className="text-xs text-accent mt-3">{inviteError}</p>}
            {inviteNotice && <p className="text-xs text-primary mt-3">{inviteNotice}</p>}
          </SettingsSection>

          <SettingsSection title="Team Members" icon={<Users className="w-4 h-4" />}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-text-dim bg-surface-hover px-2 py-0.5 rounded-sm border border-border">
                {filteredMembers.length} members
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded-sm py-1.5 pl-9 pr-4 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <select
                aria-label="Member role filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-surface-hover border border-border rounded-sm text-sm font-mono text-text-main cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="space-y-2">
              {filteredMembers.map((member) => {
                const RoleIcon = getRoleIcon(member.role);
                return (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between py-3 px-3 -mx-3 rounded-sm hover:bg-surface-hover transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-hover border border-border flex items-center justify-center">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full" />
                        ) : (
                          <span className="text-sm font-mono text-text-dim">{member.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-main">{member.name}</span>
                          <span className={cn("px-2 py-0.5 rounded-sm text-[10px] font-mono border flex items-center gap-1", getRoleColor(member.role))}>
                            <RoleIcon className="w-3 h-3" />
                            {member.role}
                          </span>
                        </div>
                        <span className="text-xs text-text-dim">{member.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-dim font-mono">Joined {member.joinedAt}</span>
                      {member.role !== "owner" && (
                        <select
                          aria-label={`${member.name} role`}
                          value={member.role}
                          onChange={(e) => updateMemberRole(member.id, e.target.value as "admin" | "member" | "viewer")}
                          className="opacity-0 group-hover:opacity-100 bg-surface-hover border border-border rounded-sm px-2 py-1 text-xs font-mono text-text-main transition-all"
                        >
                          <option value="admin">admin</option>
                          <option value="member">member</option>
                          <option value="viewer">viewer</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-text-dim">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-mono">No members found</p>
              </div>
            )}
          </SettingsSection>

          <SettingsSection title="Pending Invitations" icon={<Clock className="w-4 h-4" />}>
            {pendingInvitations.length === 0 ? (
              <p className="text-sm text-text-dim">No pending invitations.</p>
            ) : (
              <div className="space-y-2">
                {pendingInvitations.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm text-text-main">{invite.email}</p>
                      <p className="text-xs text-text-dim">Invited {invite.invitedAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-sm border border-primary/20 bg-primary/10 text-primary text-[10px] font-mono">
                        {invite.role}
                      </span>
                      <span className="px-2 py-0.5 rounded-sm border border-border bg-surface-hover text-text-dim text-[10px] font-mono">
                        {invite.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}