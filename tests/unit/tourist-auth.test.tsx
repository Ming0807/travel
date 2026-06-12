import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserNavMenu } from "@/components/account/UserNavMenu";
import { TouristAuthGate } from "@/components/auth/TouristAuthGate";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: vi.fn(),
}));

// Mock Link component from next/link
vi.mock("next/link", () => ({
  default: ({ children, href, className, onClick }: any) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

describe("UserNavMenu Component", () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
        signOut: vi.fn().mockResolvedValue({}),
      },
    };
    (createSupabaseBrowserClient as any).mockReturnValue(mockSupabase);
    
    // Mock window.location.reload
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { reload: vi.fn() },
    });
  });

  it("shows loading state initially", () => {
    mockSupabase.auth.getUser = vi.fn().mockReturnValue(new Promise(() => {}));
    const { container } = render(<UserNavMenu />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders login button when logged out", async () => {
    render(<UserNavMenu />);
    await waitFor(() => {
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/auth/login");
    });
  });

  it("renders user info when logged in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { email: "test@example.com", user_metadata: { full_name: "Test User" } } },
    });
    
    render(<UserNavMenu />);
    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });
  });

  it("handles sign out", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { email: "test@example.com", user_metadata: { full_name: "Test User" } } },
    });
    
    render(<UserNavMenu />);
    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
        // Need to find signout using icon or container
        // we can just find it by text content from the rendered component or the button element itself
    });
    
    const signOutBtn = screen.getAllByRole("button")[1]; // first is the toggle, second is sign out
    fireEvent.click(signOutBtn);
    
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    await waitFor(() => {
      expect(window.location.reload).toHaveBeenCalled();
    });
  });
});

describe("TouristAuthGate Component", () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      auth: {
        signInWithOAuth: vi.fn().mockResolvedValue({}),
      },
    };
    (createSupabaseBrowserClient as any).mockReturnValue(mockSupabase);
    
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { origin: "http://localhost:3000", pathname: "/stories/share" },
    });
  });

  it("renders both Google and LINE login buttons", () => {
    render(<TouristAuthGate />);
    
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toMatch(/Google/i);
    expect(buttons[1].textContent).toMatch(/LINE/i);
  });

  it("calls signInWithOAuth with 'google' when Google button is clicked", async () => {
    render(<TouristAuthGate />);
    
    const buttons = screen.getAllByRole("button");
    const googleBtn = buttons.find(b => b.textContent?.includes("Google"));
    if (googleBtn) fireEvent.click(googleBtn);
    
    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback?next=%2Fstories%2Fshare",
      },
    });
  });

  it("calls signInWithOAuth with 'line' when LINE button is clicked", async () => {
    render(<TouristAuthGate />);
    
    const buttons = screen.getAllByRole("button");
    const lineBtn = buttons.find(b => b.textContent?.includes("LINE"));
    if (lineBtn) fireEvent.click(lineBtn);
    
    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "line",
      options: {
        redirectTo: "http://localhost:3000/auth/callback?next=%2Fstories%2Fshare",
      },
    });
  });
});
