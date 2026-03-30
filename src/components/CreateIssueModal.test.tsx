import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreateIssueModal } from "./CreateIssueModal";
import { ProjectProvider } from "../contexts/ProjectContext";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, login: "testuser", avatar_url: "", name: "Test User" },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const mockRepos = [
  { id: 1, name: "repo1", full_name: "owner/repo1", owner: { id: 1, login: "owner", avatar_url: "", name: "Owner" }, private: false, html_url: "https://github.com/owner/repo1" },
  { id: 2, name: "repo2", full_name: "owner/repo2", owner: { id: 1, login: "owner", avatar_url: "", name: "Owner" }, private: false, html_url: "https://github.com/owner/repo2" },
];

describe("CreateIssueModal", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <ProjectProvider>
        <CreateIssueModal isOpen={false} onClose={() => {}} />
      </ProjectProvider>
    );

    expect(container.querySelector("form")).not.toBeInTheDocument();
  });

  it("renders modal when isOpen is true", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRepos),
    } as any);

    render(
      <ProjectProvider>
        <CreateIssueModal isOpen={true} onClose={() => {}} />
      </ProjectProvider>
    );

    expect(await screen.findByText("New Issue")).toBeInTheDocument();
  });

  it("fetches repos when modal opens", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRepos),
    } as any);

    render(
      <ProjectProvider>
        <CreateIssueModal isOpen={true} onClose={() => {}} />
      </ProjectProvider>
    );

    await screen.findByText("New Issue");
    expect(fetch).toHaveBeenCalledWith("/api/github/repos");
  });

  it("validates required fields before submission", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRepos),
    } as any);

    render(
      <ProjectProvider>
        <CreateIssueModal isOpen={true} onClose={() => {}} />
      </ProjectProvider>
    );

    await screen.findByText("New Issue");
    const submitButton = screen.getByText("Create Issue");
    expect(submitButton).toBeDisabled();
  });

  it("calls onClose when cancel is clicked", async () => {
    const onClose = vi.fn();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRepos),
    } as any);

    render(
      <ProjectProvider>
        <CreateIssueModal isOpen={true} onClose={onClose} />
      </ProjectProvider>
    );

    await screen.findByText("Cancel");
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });
});
