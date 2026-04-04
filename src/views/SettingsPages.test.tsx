import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { PopupProvider } from "../contexts/PopupContext";
import { ProjectProvider } from "../contexts/ProjectContext";
import { GitHubAppSettings } from "./GitHubAppSettings";
import { MembersSettings } from "./MembersSettings";
import { NotificationsSettings } from "./NotificationsSettings";
import { WorkspaceSettings } from "./WorkspaceSettings";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1,
      login: "octo",
      avatar_url: "https://example.com/avatar.png",
      name: "Octo",
    },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

function renderAppAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ProjectProvider>
        <PopupProvider>
          <App />
        </PopupProvider>
      </ProjectProvider>
    </MemoryRouter>
  );
}

describe("settings routes", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: true, json: async () => [] } as Response);
  });

  it.each([
    ["/settings/workspace", "Workspace Settings", "Workspace Name"],
    ["/settings/github-app", "GitHub App", "Webhook URL"],
    ["/settings/members", "Members", "Invite Members"],
    ["/settings/notifications", "Notifications", "Email Digest"],
  ])("renders functional controls for %s", async (path, heading, controlText) => {
    renderAppAt(path);

    const headings = await screen.findAllByRole("heading", { level: 1, name: heading });
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getByText(controlText)).toBeInTheDocument();
  });

  it("navigates from profile menu settings links to a functional settings page", async () => {
    renderAppAt("/");

    const profileTrigger = await screen.findByText("octo");
    fireEvent.click(profileTrigger.closest("button") as HTMLButtonElement);
    const workspaceLinks = await screen.findAllByRole("link", { name: "Workspace" });
    fireEvent.click(workspaceLinks[workspaceLinks.length - 1]);

    const headings = await screen.findAllByRole("heading", { level: 1, name: "Workspace Settings" });
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Workspace Description")).toBeInTheDocument();
  });
});

describe("settings page interactions", () => {
  it("requires explicit confirmation before workspace deletion", async () => {
    render(<WorkspaceSettings workspaceSlug="my-workspace" />);

    fireEvent.click(screen.getByRole("button", { name: "Delete Workspace" }));
    const confirmDeleteButton = screen.getByRole("button", { name: "Confirm Delete" });

    expect(confirmDeleteButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("my-workspace"), {
      target: { value: "my-workspace" },
    });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(screen.getByText("Workspace deletion was requested.")).toBeInTheDocument();
    });
  });

  it("supports member role updates and pending invitations", async () => {
    render(<MembersSettings />);

    fireEvent.change(screen.getByLabelText("Jane Smith role"), {
      target: { value: "viewer" },
    });
    expect((screen.getByLabelText("Jane Smith role") as HTMLSelectElement).value).toBe("viewer");

    fireEvent.change(screen.getByPlaceholderText("colleague@example.com"), {
      target: { value: "new.member@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "admin" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Invite" }));

    await waitFor(() => {
      expect(screen.getByText("Invitation sent to new.member@example.com")).toBeInTheDocument();
      expect(screen.getByText("new.member@example.com")).toBeInTheDocument();
      expect(screen.getByText("pending")).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("supports github app permission and webhook updates", async () => {
    render(<GitHubAppSettings installed={true} />);

    const issuesPermission = screen.getByLabelText("Issues permission") as HTMLSelectElement;
    fireEvent.change(issuesPermission, { target: { value: "none" } });
    expect(issuesPermission.value).toBe("none");

    fireEvent.change(screen.getByLabelText("Webhook URL"), {
      target: { value: "https://example.com/hooks" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Settings" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Saved" })).toBeInTheDocument();
    });
  });

  it("supports digest preference and notification save", async () => {
    render(<NotificationsSettings />);

    fireEvent.change(screen.getByLabelText("Email Digest"), {
      target: { value: "weekly" },
    });
    expect((screen.getByLabelText("Email Digest") as HTMLSelectElement).value).toBe("weekly");

    fireEvent.click(screen.getByRole("button", { name: "Save Preferences" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Saved" })).toBeInTheDocument();
    });
  });
});
