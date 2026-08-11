import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MouseEventHandler, ReactNode } from "react";
import { UserNavMenu } from "@/components/account/UserNavMenu";
import { TouristAuthGate } from "@/components/auth/TouristAuthGate";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: vi.fn(),
}));

// Mock Link component from next/link
vi.mock("next/link", () => ({
  default: ({ children, href, className, onClick }: { children: ReactNode; href: string; className?: string; onClick?: MouseEventHandler<HTMLAnchorElement> }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

type MockSupabaseClient = {
  auth: {
    getUser?: ReturnType<typeof vi.fn>;
    onAuthStateChange?: ReturnType<typeof vi.fn>;
    signOut?: ReturnType<typeof vi.fn>;
    signInWithOAuth?: ReturnType<typeof vi.fn>;
  };
};

describe("UserNavMenu Component", () => {
  let mockSupabase: MockSupabaseClient;

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
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(mockSupabase as never);

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
    mockSupabase.auth.getUser!.mockResolvedValue({
      data: { user: { email: "test@example.com", user_metadata: { full_name: "Test User" } } },
    });

    render(<UserNavMenu />);
    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });
  });

  it("handles sign out", async () => {
    mockSupabase.auth.getUser!.mockResolvedValue({
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
  let mockSupabase: MockSupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      auth: {
        signInWithOAuth: vi.fn().mockResolvedValue({}),
      },
    };
    vi.mocked(createSupabaseBrowserClient).mockReturnValue(mockSupabase as never);

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
    expect(screen.getByRole("link", { name: "เงื่อนไขการใช้บริการ" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "นโยบายความเป็นส่วนตัว" })).toHaveAttribute("href", "/privacy");
  });

  it("shows a safe retryable error when OAuth cannot start", async () => {
    vi.mocked(mockSupabase.auth.signInWithOAuth!).mockRejectedValueOnce(new Error("provider secret"));
    render(<TouristAuthGate />);

    fireEvent.click(screen.getByRole("button", { name: /Google/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("ยังไม่สามารถเปิดหน้าล็อกอินได้ กรุณาลองใหม่");
    expect(screen.getByRole("alert")).not.toHaveTextContent("provider secret");
    expect(screen.getByRole("button", { name: /Google/ })).toBeEnabled();
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
