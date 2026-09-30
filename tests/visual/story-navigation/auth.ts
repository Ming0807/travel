// Synthetic identities only; this fixture never contacts Supabase.
export function createSupabaseBrowserClient() {
  const params = new URLSearchParams(window.location.search);
  const user = params.has("guest") ? null : { id: "fixture-user", user_metadata: { full_name: "นักเดินทางชื่อยาวมากสำหรับทดสอบการจัดวางเมนูบัญชีทุกขนาดหน้าจอ", ...(params.has("avatar") ? { avatar_url: "/site-media/homepage/yala-belonging-default.webp" } : {}) } };
  return { auth: {
    getUser: async () => ({ data: { user } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: async () => ({ error: null }),
  } };
}
