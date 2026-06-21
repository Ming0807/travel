import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export type AdminMediaReference = {
  entityType: string;
  entityId: number | null;
  name: string;
};

type EntityReferenceConfig = {
  entityType: string;
  entityId: number | null;
  tableName: string;
  idColumn: string;
  nameColumn: string;
};

function entityReferenceConfigs(row: Record<string, number | null>): EntityReferenceConfig[] {
  return [
    {
      entityType: "attraction",
      entityId: row.attraction_id,
      tableName: "attractions",
      idColumn: "attraction_id",
      nameColumn: "name_th",
    },
    {
      entityType: "restaurant",
      entityId: row.restaurant_id,
      tableName: "restaurants",
      idColumn: "restaurant_id",
      nameColumn: "name_th",
    },
    {
      entityType: "story",
      entityId: row.story_id,
      tableName: "travel_stories",
      idColumn: "story_id",
      nameColumn: "title",
    },
    {
      entityType: "route",
      entityId: row.route_id,
      tableName: "routes",
      idColumn: "route_id",
      nameColumn: "name_th",
    },
    {
      entityType: "accommodation",
      entityId: row.accommodation_id,
      tableName: "accommodations",
      idColumn: "accommodation_id",
      nameColumn: "name_th",
    },
  ];
}

export async function findAdminMediaReferences(storagePath: string): Promise<AdminMediaReference[]> {
  const supabase = createSupabaseServiceRoleClient();
  const references: AdminMediaReference[] = [];

  // 1. Check settings table
  const { data: settings } = await supabase.from("settings").select("setting_key, value");
  if (settings) {
    for (const setting of settings) {
      if (setting.value !== null && setting.value !== undefined) {
        const valStr = typeof setting.value === "string" ? setting.value : JSON.stringify(setting.value);
        if (valStr.includes(storagePath)) {
          references.push({
            entityType: "settings",
            entityId: null,
            name: `System Setting: ${setting.setting_key}`,
          });
        }
      }
    }
  }

  // 2. Check content_media table
  const { data: contentMediaRefs } = await supabase
    .from("content_media")
    .select("media_id, attraction_id, restaurant_id, story_id, route_id, accommodation_id")
    .eq("storage_path", storagePath);

  if (Array.isArray(contentMediaRefs) && contentMediaRefs.length > 0) {

  for (const contentMediaRef of contentMediaRefs as Record<string, number | null>[]) {
    for (const config of entityReferenceConfigs(contentMediaRef)) {
      if (config.entityId === null || config.entityId === undefined) continue;

      const { data: entity } = await supabase
        .from(config.tableName)
        .select(`${config.idColumn}, ${config.nameColumn}`)
        .eq(config.idColumn, config.entityId)
        .maybeSingle();

      if (entity) {
        const entityRecord = entity as unknown as Record<string, unknown>;
        const entityName = entityRecord[config.nameColumn];
        references.push({
          entityType: config.entityType,
          entityId: config.entityId,
          name: typeof entityName === "string" ? entityName : `${config.entityType} #${config.entityId}`,
        });
      }
    }
  }
  }

  return references;
}
