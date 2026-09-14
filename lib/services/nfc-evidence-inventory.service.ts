import "server-only";
import { requirePermission } from "@/lib/auth/guards";
import { nfcEvidenceInventoryEnabled } from "@/lib/config/nfc-evidence";
import { listNfcEvidenceInventory } from "@/lib/repositories/nfc-evidence-inventory.repository";
import { nfcEvidenceInventoryFilters } from "@/lib/validation/nfc-evidence-inventory";
import { logAuditAction } from "@/lib/services/audit-log.service";

export async function getNfcEvidenceInventory(input: unknown) {
  const guard = await requirePermission("checkin_code.manage", { unauthenticated: "throw" });
  const filters = nfcEvidenceInventoryFilters.parse(input);
  if (!nfcEvidenceInventoryEnabled()) return { enabled: false as const };
  const result = await listNfcEvidenceInventory(filters);
  await logAuditAction({ actor: guard.actor, action: "nfc_evidence.inventory_read", entityType: "nfc_tag", entityId: filters.tagId,
    metadata: { count: result.rows.length, hasMore: result.nextAfterAssetId !== null } });
  return { enabled: true as const, ...result };
}
