export async function getAdminNfcEvidenceInventoryAction(input: { afterAssetId?: string }) {
  const states = ["none", "pending", "acknowledged"] as const;
  return { success: true as const, enabled: true as const, rows: states.map((state, index) => ({
    asset_id: `40000000-0000-4000-8000-00000000000${index + (input.afterAssetId ? 4 : 1)}`, created_at: "2026-09-14T00:00:00Z",
    provider: index === 1 ? "cloudinary" as const : "supabase" as const, attached: index === 0,
    has_intent: index === 0, cleanup_state: state,
  })), nextAfterAssetId: input.afterAssetId ? null : "40000000-0000-4000-8000-000000000003" };
}
