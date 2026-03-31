import { useState } from "react";
import { Users, UserPlus, MoreVertical, Shield, Mail, Search, Loader2, Check, X, Crown } from "lucide-react";
import { cn } from "../lib/utils";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

interface MembersSettingsProps {
  members?: Member[];
}

export function MembersSettings({ 
  members = [
    { id: "1", name: "John Doe", email: "john@example.com", avatar: "", role: "owner", joinedAt: "2024-01-01" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", avatar: "", role: "admin", joinedAt: "2024-02-15" },
    { id: "3", name: "Bob Wilson", email: "bob@example.com", avatar: "", role: "member", joinedAt: "2024-03-20" },
  ]
}: MembersSettingsProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setInviteEmail("");
    } finally {
      setInviting(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner": return "text-accent bg-accent/10 border-accent/20";
      case "admin": return "text-primary bg-primary/10 border-primary/20";
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
      <header className="shrink-0 border-b border-border bg-surface/80 backdrop-blur-md px-6 py-4">
        <h1 className="text-xl font-semibold text-text-main tracking-tight">Members</h1>
        <p className="text-sm text-text-dim mt-1">Manage workspace members and their access</p>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl space-y-6">
          <section className="bg-surface border border-border rounded-sm p-6">
            <h2 className="text-base font-semibold text-text-main mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Invite Members
            </h2>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-mono text-text-dim mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-surface-hover border border-border rounded-sm py-2 pl-9 pr-3 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>
              <div className="w-40">
                <label className="block text-xs font-mono text-text-dim mb-1.5">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                  className="w-full bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
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
          </section>

          <section className="bg-surface border border-border rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text-main flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members
              </h2>
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
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-surface-hover border border-border rounded-sm text-sm font-mono text-text-main cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
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
                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface-hover rounded-sm transition-all">
                          <MoreVertical className="w-4 h-4 text-text-dim" />
                        </button>
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
          </section>
        </div>
      </div>
    </div>
  );
}