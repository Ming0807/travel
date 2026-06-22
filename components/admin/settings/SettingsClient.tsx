"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  Circle,
  EnvelopeSimple,
  FloppyDisk,
  Gear,
  GlobeHemisphereWest,
  ImageSquare,
  MagnifyingGlass,
  ToggleRight,
  WarningCircle,
  XCircle,
  Users,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import { HomepageFeaturedEditor } from "@/components/admin/content/HomepageFeaturedEditor";
import { HomepageRoutePicker } from "@/components/admin/content/HomepageRoutePicker";
import {
  SITE_SETTING_DEFAULTS,
  SITE_SETTING_KEYS,
  type SiteSettingKey,
} from "@/lib/config/site-settings";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";

type SiteSettingRow = {
  setting_key: string;
  setting_value: unknown;
  description: string | null;
  updated_at: string;
};

type MutableSettingValue<T> =
  T extends string ? string :
  T extends number ? number :
  T extends boolean ? boolean :
  T extends readonly (infer U)[] ? MutableSettingValue<U>[] :
  T extends object ? { -readonly [K in keyof T]: MutableSettingValue<T[K]> } :
  T;

type SettingsState = {
  [K in SiteSettingKey]: MutableSettingValue<(typeof SITE_SETTING_DEFAULTS)[K]>;
};

type TeamMember = { name: string; role: string; imageUrl: string };

type SettingsGroupId = "homepage" | "publicPages" | "contact" | "seo" | "system" | "about";

type PickerTarget = {
  key: SiteSettingKey;
  field: string;
  index?: number;
} | null;

const GROUPS: {
  id: SettingsGroupId;
  label: string;
  description: string;
  icon: typeof Gear;
}[] = [
  {
    id: "homepage",
    label: "หน้าแรก",
    description: "ภาพ Hero, สถานที่ยอดนิยม, highlight blocks",
    icon: GlobeHemisphereWest,
  },
  {
    id: "publicPages",
    label: "หน้าสาธารณะ",
    description: "ส่วนหัวของหน้า Attractions, Stories, Routes, Restaurants",
    icon: ImageSquare,
  },
  {
    id: "contact",
    label: "ติดต่อและส่วนท้าย",
    description: "ช่องทางติดต่อ, ลิงก์ social, ข้อความท้ายเว็บ",
    icon: EnvelopeSimple,
  },
  {
    id: "seo",
    label: "SEO",
    description: "Meta title, meta description, รูปตอนแชร์ลิงก์",
    icon: MagnifyingGlass,
  },
  {
    id: "system",
    label: "ระบบ",
    description: "เปิด/ปิดโมดูลหลัก และข้อความปิดปรับปรุง",
    icon: ToggleRight,
  },
  {
    id: "about",
    label: "เกี่ยวกับเรา",
    description: "วิสัยทัศน์ และทีมงาน",
    icon: Users,
  },
];

const GROUP_KEYS: Record<SettingsGroupId, SiteSettingKey[]> = {
  homepage: ["homepage_hero", "homepage_featured_attractions", "homepage_stories", "homepage_featured_routes", "homepage_how_it_works", "homepage_highlights", "homepage_cta"],
  publicPages: ["attractions_page_hero", "attractions_page_banner", "stories_page_hero", "stories_page_cta", "routes_page_hero", "restaurants_page_hero", "restaurants_page_feature", "restaurants_page_cta"],
  contact: ["general_info", "social_media", "footer_info"],
  seo: ["seo_settings"],
  system: ["feature_toggles", "maintenance_info"],
  about: ["about_vision", "about_team"],
};

function setSettingValue<K extends SiteSettingKey>(settings: SettingsState, key: K, value: SettingsState[K]) {
  settings[key] = value;
}

function createInitialSettings(rows: SiteSettingRow[]) {
  const settings = structuredClone(SITE_SETTING_DEFAULTS) as unknown as SettingsState;

  for (const row of rows) {
    if (!SITE_SETTING_KEYS.includes(row.setting_key as SiteSettingKey)) continue;
    const key = row.setting_key as SiteSettingKey;
    if (row.setting_value && typeof row.setting_value === "object" && !Array.isArray(row.setting_value)) {
      const mergedValue = {
        ...settings[key],
        ...(row.setting_value as Record<string, unknown>),
      } as SettingsState[typeof key];
      setSettingValue(settings, key, mergedValue);
    } else if (row.setting_value !== null && row.setting_value !== undefined) {
      setSettingValue(settings, key, row.setting_value as SettingsState[typeof key]);
    }
  }

  const heroImages = settings.homepage_hero.images ?? [];
  settings.homepage_hero.images = [heroImages[0] || "", heroImages[1] || "", heroImages[2] || ""];

  return settings;
}

function imagePreviewUrl(path: string) {
  const siteMediaUrl = siteMediaImageUrl(path);
  if (siteMediaUrl) return siteMediaUrl;
  if (!path) return "";
  return `/api/admin/media/preview?bucket=southern-border-tourism&path=${encodeURIComponent(path)}`;
}

function isSettingsGroupId(value: unknown): value is SettingsGroupId {
  return typeof value === "string" && GROUPS.some((group) => group.id === value);
}

// Static mapping from setting key to settings group — defined outside component
const KEY_TO_GROUP: Record<string, SettingsGroupId> = {
  homepage_hero: "homepage",
  homepage_featured_attractions: "homepage",
  homepage_stories: "homepage",
  homepage_featured_routes: "homepage",
  homepage_how_it_works: "homepage",
  homepage_highlights: "homepage",
  homepage_cta: "homepage",
  attractions_page_hero: "publicPages",
  attractions_page_banner: "publicPages",
  stories_page_hero: "publicPages",
  stories_page_cta: "publicPages",
  routes_page_hero: "publicPages",
  restaurants_page_hero: "publicPages",
  restaurants_page_feature: "publicPages",
  restaurants_page_cta: "publicPages",
  general_info: "contact",
  social_media: "contact",
  footer_info: "contact",
  seo_settings: "seo",
  feature_toggles: "system",
  maintenance_info: "system",
};

function computeDirtyCountPerGroup(dirtyKeys: Set<string>): Partial<Record<SettingsGroupId, number>> {
  const counts: Partial<Record<SettingsGroupId, number>> = {};
  for (const key of dirtyKeys) {
    const groupId = KEY_TO_GROUP[key] ?? "homepage";
    counts[groupId] = (counts[groupId] ?? 0) + 1;
  }
  return counts;
}

export function SettingsClient({
  initialSettings,
  initialGroup,
}: {
  initialSettings: SiteSettingRow[];
  initialGroup?: string;
}) {
  const [activeGroup, setActiveGroup] = useState<SettingsGroupId>(isSettingsGroupId(initialGroup) ? initialGroup : "homepage");
  const [settings, setSettings] = useState<SettingsState>(() => createInitialSettings(initialSettings));
  const [dirtyKeys, setDirtyKeys] = useState<Set<SiteSettingKey>>(new Set());
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info" | null; message: string }>({
    type: null,
    message: "",
  });
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const activeGroupMeta = useMemo(() => GROUPS.find((group) => group.id === activeGroup) ?? GROUPS[0], [activeGroup]);

  // Compute dirty count per group — derived from dirtyKeys
  const dirtyCountPerGroup = useMemo(() => computeDirtyCountPerGroup(dirtyKeys), [dirtyKeys]);

  useEffect(() => {
    return () => {
      if (transitionRef.current) clearTimeout(transitionRef.current);
    };
  }, []);

  function handleGroupChange(newGroup: SettingsGroupId) {
    if (newGroup === activeGroup) return;
    setIsTransitioning(true);
    if (transitionRef.current) clearTimeout(transitionRef.current);
    transitionRef.current = setTimeout(() => {
      setActiveGroup(newGroup);
      setIsTransitioning(false);
      transitionRef.current = undefined;
    }, 150);
  }

  function resetGroupToDefaults(groupId: SettingsGroupId) {
    const keys = GROUP_KEYS[groupId];
    const defaults = SITE_SETTING_DEFAULTS;
    setSettings((current) => {
      const updated = { ...current };
      for (const key of keys) {
        setSettingValue(updated, key, structuredClone(defaults[key]) as SettingsState[typeof key]);
      }
      return updated;
    });
    setDirtyKeys((current) => {
      const next = new Set(current);
      for (const key of keys) next.add(key);
      return next;
    });
    setStatus({ type: "info", message: `รีเซ็ตค่ากลุ่ม \"${groupId}\" เป็นค่าเริ่มต้นแล้ว กดบันทึกเพื่อยืนยัน` });
  }

  function markDirty(key: SiteSettingKey) {
    setDirtyKeys((current) => {
      const next = new Set(current);
      next.add(key);
      return next;
    });
  }

  function updateSettingObject(key: SiteSettingKey, patch: Record<string, unknown>) {
    setSettings((current) => ({
      ...current,
      [key]: {
        ...current[key],
        ...patch,
      },
    }));
    markDirty(key);
  }

  function updateSettingFull(key: SiteSettingKey, value: SettingsState[SiteSettingKey]) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    markDirty(key);
  }

  function updateHeroImage(index: number, value: string) {
    setSettings((current) => {
      const images = [...(current.homepage_hero.images ?? ["", "", ""])];
      images[index] = value;
      return {
        ...current,
        homepage_hero: {
          ...current.homepage_hero,
          images,
        },
      };
    });
    markDirty("homepage_hero");
  }

  async function saveChanges() {
    if (dirtyKeys.size === 0) {
      setStatus({ type: "info", message: "ยังไม่มีการเปลี่ยนแปลงที่ต้องบันทึก" });
      return;
    }

    setSaving(true);
    setStatus({ type: null, message: "" });

    try {
      const keys = Array.from(dirtyKeys);
      const results = await Promise.all(
        keys.map(async (key) => {
          const response = await fetch("/api/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, value: settings[key] }),
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            throw new Error(payload.error || `Failed to save ${key}`);
          }

          return key;
        })
      );

      setDirtyKeys(new Set());
      setStatus({ type: "success", message: `บันทึกสำเร็จ ${results.length} รายการ` });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "บันทึกไม่สำเร็จ กรุณาลองใหม่",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleMediaSelect(url: string) {
    if (!pickerTarget) return;

    if (pickerTarget.key === "homepage_hero" && pickerTarget.field === "images" && pickerTarget.index !== undefined) {
      updateHeroImage(pickerTarget.index, url);
      return;
    }

    if (pickerTarget.key === "about_team" && pickerTarget.field === "imageUrl" && pickerTarget.index !== undefined) {
      setSettings((current) => {
        const team = [...(current.about_team ?? [])];
        team[pickerTarget.index!] = { ...team[pickerTarget.index!], imageUrl: url };
        return {
          ...current,
          about_team: team,
        };
      });
      markDirty("about_team");
      return;
    }

    updateSettingObject(pickerTarget.key, { [pickerTarget.field]: url });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System Settings"
        title="Settings Console"
        description="จัดการข้อความ รูปภาพ SEO และ feature toggle ที่กระทบหน้า public จากจุดเดียว โดยบันทึกเฉพาะหมวดที่ถูกแก้ไข"
        actions={
          <button
            type="button"
            onClick={saveChanges}
            disabled={saving || dirtyKeys.size === 0}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#073F37] px-4 py-2 text-sm font-black text-white transition hover:bg-[#0A6B62] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FloppyDisk size={18} weight="bold" />
            {saving ? "กำลังบันทึก..." : dirtyKeys.size ? `บันทึก ${dirtyKeys.size} รายการ` : "บันทึกสำเร็จ"}
          </button>
        }
      />

      {status.type ? (
        <div
          role="alert"
          className={`flex gap-3 rounded-lg border p-4 text-sm font-bold ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : status.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="mt-0.5 shrink-0" size={20} weight="fill" />
          ) : status.type === "error" ? (
            <XCircle className="mt-0.5 shrink-0" size={20} weight="fill" />
          ) : (
            <WarningCircle className="mt-0.5 shrink-0" size={20} weight="fill" />
          )}
          {status.message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <nav className="space-y-2 lg:sticky lg:top-6 lg:self-start">
          {GROUPS.map((group) => {
            const Icon = group.icon;
            const isActive = group.id === activeGroup;
            return (
              <button
                type="button"
                key={group.id}
                onClick={() => handleGroupChange(group.id)}
                className={`relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-[#0A6B62] bg-[#E6F4EF] text-[#073F37]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon className="mt-0.5 shrink-0" size={20} weight={isActive ? "fill" : "regular"} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="block text-sm font-black">{group.label}</span>
                    {dirtyCountPerGroup[group.id] ? (
                      <Circle
                        className="shrink-0 animate-pulse text-[#F3704C]"
                        size={8}
                        weight="fill"
                        aria-label="มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก"
                      />
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">{group.description}</span>
                </span>
                {dirtyCountPerGroup[group.id] ? (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#F3704C] text-xs font-black text-white shadow-sm">
                    {dirtyCountPerGroup[group.id]! > 9 ? "9+" : dirtyCountPerGroup[group.id]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="space-y-5">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#F3704C]">หมวดที่กำลังแก้ไข</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-800">{activeGroupMeta.label}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">{activeGroupMeta.description}</p>
              </div>
              <button
                type="button"
                onClick={() => resetGroupToDefaults(activeGroup)}
                className="min-h-10 shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 transition hover:bg-amber-100 active:scale-[0.97]"
                title="รีเซ็ตค่าทั้งหมดในกลุ่มนี้กลับเป็นค่าเริ่มต้น"
              >
                รีเซ็ตเป็นค่าเริ่มต้น
              </button>
            </div>
          </div>

          <div
            className={`transition-all duration-200 ${
              isTransitioning ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            {activeGroup === "homepage" ? (
              <HomepageSettings
                settings={settings}
                updateSettingObject={updateSettingObject}
                updateHeroImage={updateHeroImage}
                openPicker={setPickerTarget}
              />
            ) : null}

            {activeGroup === "publicPages" ? (
              <PublicPageSettings
                settings={settings}
                updateSettingObject={updateSettingObject}
                openPicker={setPickerTarget}
              />
            ) : null}

            {activeGroup === "contact" ? (
              <ContactSettings settings={settings} updateSettingObject={updateSettingObject} />
            ) : null}

            {activeGroup === "seo" ? (
              <SeoSettings
                settings={settings}
                updateSettingObject={updateSettingObject}
                openPicker={setPickerTarget}
              />
            ) : null}

            {activeGroup === "system" ? (
              <SystemSettings settings={settings} updateSettingObject={updateSettingObject} />
            ) : null}

            {activeGroup === "about" ? (
              <AboutSettings settings={settings} updateSettingObject={updateSettingObject} updateSettingFull={updateSettingFull} openPicker={setPickerTarget} />
            ) : null}
          </div>

        </div>
      </div>

      {/* Fixed bottom save bar when there are dirty changes */}
      {dirtyKeys.size > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-6 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <Circle className="text-[#F3704C]" size={8} weight="fill" />
              {dirtyKeys.size === 1
                ? "มีการเปลี่ยนแปลง 1 รายการที่ยังไม่ได้บันทึก"
                : `มีการเปลี่ยนแปลง ${dirtyKeys.size} รายการที่ยังไม่ได้บันทึก`}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDirtyKeys(new Set())}
                className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-50"
              >
                ยกเลิกทั้งหมด
              </button>
              <button
                type="button"
                onClick={saveChanges}
                disabled={saving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#073F37] px-5 py-2 text-sm font-black text-white transition hover:bg-[#0A6B62] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FloppyDisk size={18} weight="bold" />
                {saving ? "กำลังบันทึก..." : `บันทึกทั้งหมด (${dirtyKeys.size})`}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <MediaPickerModal
        isOpen={!!pickerTarget}
        onClose={() => setPickerTarget(null)}
        onSelect={(url) => {
          handleMediaSelect(url);
          setPickerTarget(null);
        }}
        title="เลือกภาพจาก Media Library"
      />
      {/* Spacer for fixed bottom save bar */}
      {dirtyKeys.size > 0 ? <div className="h-20" /> : null}
    </div>
  );
}

function HomepageSettings({
  settings,
  updateSettingObject,
  updateHeroImage,
  openPicker,
}: {
  settings: SettingsState;
  updateSettingObject: (key: SiteSettingKey, patch: Record<string, unknown>) => void;
  updateHeroImage: (index: number, value: string) => void;
  openPicker: (target: PickerTarget) => void;
}) {
  return (
    <>
      <SettingsSection title="ภาพหลักหน้าแรก (Hero)" description="ข้อความและภาพชุดแรกของหน้าแรก">
        <TextInput label="หัวข้อหลัก" value={settings.homepage_hero.title} onChange={(value) => updateSettingObject("homepage_hero", { title: value })} />
        <TextInput label="หัวข้อย่อย" value={settings.homepage_hero.subtitle} onChange={(value) => updateSettingObject("homepage_hero", { subtitle: value })} />
        <TextArea label="คำอธิบาย" value={settings.homepage_hero.description} onChange={(value) => updateSettingObject("homepage_hero", { description: value })} rows={3} />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <ImageField
              key={index}
              label={`Hero image ${index + 1}`}
              value={settings.homepage_hero.images?.[index] ?? ""}
              onRemove={() => updateHeroImage(index, "")}
              onPick={() => openPicker({ key: "homepage_hero", field: "images", index })}
            />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="สถานที่ยอดนิยม" description="เลือกสถานที่ท่องเที่ยวที่ต้องการล็อกให้ขึ้นหน้าแรก (ลากวางเพื่อสลับตำแหน่ง)">
        <HomepageFeaturedEditor
          slugs={settings.homepage_featured_attractions.slugs ?? []}
          onChange={(slugs) => updateSettingObject("homepage_featured_attractions", { slugs })}
        />
        <div className="mt-4 rounded-lg border border-[#0A6B62]/20 bg-[#E6F4EF] p-4 text-sm leading-6 text-[#073F37]">
          <p className="font-bold">ต้องการแก้ไขเนื้อหาสถานที่?</p>
          <p className="mt-1">
            เนื้อหา รูปภาพ และตำแหน่งของสถานที่ จะดึงมาจากระบบจัดการสถานที่โดยตรง{" "}
            <Link href="/admin/content" className="font-black text-[#0A6B62] underline hover:text-[#075049]">
              ไปที่ศูนย์จัดการเนื้อหา (Content Hub)
            </Link>
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="เรื่องราวนักเดินทาง" description="ข้อความและจำนวนบทความที่แสดงในส่วน Stories ของหน้าแรก">
        <TextInput label="หัวข้อ" value={settings.homepage_stories.title} onChange={(value) => updateSettingObject("homepage_stories", { title: value })} />
        <TextInput label="หัวข้อย่อย" value={settings.homepage_stories.subtitle} onChange={(value) => updateSettingObject("homepage_stories", { subtitle: value })} />
        <TextInput label="ข้อความปุ่ม" value={settings.homepage_stories.buttonText} onChange={(value) => updateSettingObject("homepage_stories", { buttonText: value })} />
        <TextInput label="จำนวนที่แสดงสูงสุด" type="number" min="1" max="8" value={String(settings.homepage_stories.limit ?? 4)} onChange={(value) => updateSettingObject("homepage_stories", { limit: Math.max(1, Math.min(8, parseInt(value, 10) || 4)) })} />
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          บทความจะดึงจากตาราง travel_stories โดยอัตโนมัติ ใช้ฟิลเตอร์ status=published
        </div>
      </SettingsSection>

      <SettingsSection title="เส้นทางแนะนำ" description="เลือกเส้นทางที่ต้องการแสดงบนหน้าแรก (เรียงลำดับด้วยลูกศรขึ้นลง)">
        <TextInput label="หัวข้อ" value={settings.homepage_featured_routes.title} onChange={(value) => updateSettingObject("homepage_featured_routes", { title: value })} />
        <TextInput label="หัวข้อย่อย" value={settings.homepage_featured_routes.subtitle} onChange={(value) => updateSettingObject("homepage_featured_routes", { subtitle: value })} />
        <HomepageRoutePicker
          slugs={settings.homepage_featured_routes.slugs ?? []}
          onChange={(slugs) => updateSettingObject("homepage_featured_routes", { slugs })}
        />
        <div className="mt-4 rounded-lg border border-[#0A6B62]/20 bg-[#E6F4EF] p-4 text-sm leading-6 text-[#073F37]">
          <p className="font-bold">เนื้อหาเส้นทางจัดการที่ไหน?</p>
          <p className="mt-1">
            ชื่อ คำอธิบาย และรูปภาพของเส้นทาง ดึงจากระบบจัดการเส้นทางโดยตรง{" "}
            <Link href="/admin/routes" className="font-black text-[#0A6B62] underline hover:text-[#075049]">จัดการเส้นทาง</Link>
          </p>
        </div>
        <TextInput label="จำนวนที่แสดงสูงสุด" type="number" min="1" max="12" value={String(settings.homepage_featured_routes.limit ?? 3)} onChange={(value) => updateSettingObject("homepage_featured_routes", { limit: Math.max(1, Math.min(12, parseInt(value, 10) || 3)) })} />
      </SettingsSection>

      <SettingsSection title="วิธีการทำงาน" description="บล็อกอธิบาย QR, certificate, stamp แบบสั้น">
        <TextInput label="หัวข้อ" value={settings.homepage_how_it_works.title} onChange={(value) => updateSettingObject("homepage_how_it_works", { title: value })} />
        <TextInput label="หัวข้อย่อย" value={settings.homepage_how_it_works.subtitle} onChange={(value) => updateSettingObject("homepage_how_it_works", { subtitle: value })} />
        <TextArea label="คำอธิบาย" value={settings.homepage_how_it_works.description} onChange={(value) => updateSettingObject("homepage_how_it_works", { description: value })} rows={3} />
      </SettingsSection>

      <SettingsSection title="ไฮไลต์" description="เรื่องเล่าและภาพประกอบช่วงกลางหน้าแรก (ข้อความและภาพประกอบนี้จัดการโดยตรงจาก Settings — ไม่ได้เชื่อมกับ CMS)">
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          ข้อความคำคม ชื่อผู้เขียน และภาพประกอบในส่วนนี้ เป็นข้อความตั้งค่าที่แก้ไขโดยตรง ไม่ได้ดึงจากบทความหรือ CMS หากต้องการเปลี่ยนเนื้อหาหลักของไฮไลต์ กรุณาแก้ไขที่นี่
        </div>
        <TextInput label="หัวข้อ" value={settings.homepage_highlights.title} onChange={(value) => updateSettingObject("homepage_highlights", { title: value })} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="ชื่อผู้เขียน" value={settings.homepage_highlights.authorName} onChange={(value) => updateSettingObject("homepage_highlights", { authorName: value })} />
          <TextInput label="สถานที่" value={settings.homepage_highlights.location} onChange={(value) => updateSettingObject("homepage_highlights", { location: value })} />
        </div>
        <TextArea label="คำคม" value={settings.homepage_highlights.quote} onChange={(value) => updateSettingObject("homepage_highlights", { quote: value })} rows={4} />
        <div className="grid gap-4 md:grid-cols-2">
          <ImageField label="ภาพปกวิดีโอ" value={settings.homepage_highlights.videoCover} onRemove={() => updateSettingObject("homepage_highlights", { videoCover: "" })} onPick={() => openPicker({ key: "homepage_highlights", field: "videoCover" })} />
          <ImageField label="ภาพปก" value={settings.homepage_highlights.imageCover} onRemove={() => updateSettingObject("homepage_highlights", { imageCover: "" })} onPick={() => openPicker({ key: "homepage_highlights", field: "imageCover" })} />
        </div>
        <TextInput label="ชื่อภาพ" value={settings.homepage_highlights.imageTitle} onChange={(value) => updateSettingObject("homepage_highlights", { imageTitle: value })} />
      </SettingsSection>

      <SettingsSection title="CTA หน้าแรก" description="บล็อก call-to-action ท้ายหน้าแรก">
        <TextInput label="หัวข้อ" value={settings.homepage_cta.title} onChange={(value) => updateSettingObject("homepage_cta", { title: value })} />
        <TextInput label="หัวข้อย่อย" value={settings.homepage_cta.subtitle} onChange={(value) => updateSettingObject("homepage_cta", { subtitle: value })} />
        <TextArea label="คำอธิบาย" value={settings.homepage_cta.description} onChange={(value) => updateSettingObject("homepage_cta", { description: value })} rows={3} />
        <ImageField label="ภาพพื้นหลัง" value={settings.homepage_cta.bgImage} onRemove={() => updateSettingObject("homepage_cta", { bgImage: "" })} onPick={() => openPicker({ key: "homepage_cta", field: "bgImage" })} />
      </SettingsSection>
    </>
  );
}

function PublicPageSettings({
  settings,
  updateSettingObject,
  openPicker,
}: {
  settings: SettingsState;
  updateSettingObject: (key: SiteSettingKey, patch: Record<string, unknown>) => void;
  openPicker: (target: PickerTarget) => void;
}) {
  return (
    <>
      <SettingsSection title="หน้าสถานที่ท่องเที่ยว" description="ข้อความหัวและ banner ของหน้ารวมสถานที่">
        <TextInput label="หัวข้อ Hero" value={settings.attractions_page_hero.title} onChange={(value) => updateSettingObject("attractions_page_hero", { title: value })} />
        <TextArea label="คำอธิบาย Hero" value={settings.attractions_page_hero.description} onChange={(value) => updateSettingObject("attractions_page_hero", { description: value })} rows={3} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="หัวข้อ Banner" value={settings.attractions_page_banner.title} onChange={(value) => updateSettingObject("attractions_page_banner", { title: value })} />
          <TextInput label="หัวข้อย่อย Banner" value={settings.attractions_page_banner.subtitle} onChange={(value) => updateSettingObject("attractions_page_banner", { subtitle: value })} />
          <TextInput label="ข้อความปุ่ม" value={settings.attractions_page_banner.linkText} onChange={(value) => updateSettingObject("attractions_page_banner", { linkText: value })} />
          <TextInput label="URL ปุ่ม" value={settings.attractions_page_banner.linkUrl} onChange={(value) => updateSettingObject("attractions_page_banner", { linkUrl: value })} />
        </div>
        <ImageField label="ภาพ Banner" value={settings.attractions_page_banner.image} onRemove={() => updateSettingObject("attractions_page_banner", { image: "" })} onPick={() => openPicker({ key: "attractions_page_banner", field: "image" })} />
      </SettingsSection>

      <SettingsSection title="หน้าบทความ" description="ข้อความหัวและ CTA ของหน้าบทความ">
        <TextInput label="หัวข้อ Hero" value={settings.stories_page_hero.title} onChange={(value) => updateSettingObject("stories_page_hero", { title: value })} />
        <TextArea label="คำอธิบาย Hero" value={settings.stories_page_hero.description} onChange={(value) => updateSettingObject("stories_page_hero", { description: value })} rows={3} />
        <TextInput label="หัวข้อ CTA" value={settings.stories_page_cta.title} onChange={(value) => updateSettingObject("stories_page_cta", { title: value })} />
        <TextInput label="หัวข้อย่อย CTA" value={settings.stories_page_cta.subtitle} onChange={(value) => updateSettingObject("stories_page_cta", { subtitle: value })} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="ข้อความปุ่ม CTA" value={settings.stories_page_cta.linkText} onChange={(value) => updateSettingObject("stories_page_cta", { linkText: value })} />
          <TextInput label="URL CTA" value={settings.stories_page_cta.linkUrl} onChange={(value) => updateSettingObject("stories_page_cta", { linkUrl: value })} />
        </div>
        <ImageField label="ภาพ CTA" value={settings.stories_page_cta.image} onRemove={() => updateSettingObject("stories_page_cta", { image: "" })} onPick={() => openPicker({ key: "stories_page_cta", field: "image" })} />
      </SettingsSection>

      <SettingsSection title="หน้าเส้นทาง" description="ข้อความหัวหน้าเส้นทางท่องเที่ยว">
        <TextInput label="หัวข้อ Hero" value={settings.routes_page_hero.title} onChange={(value) => updateSettingObject("routes_page_hero", { title: value })} />
        <TextArea label="คำอธิบาย Hero" value={settings.routes_page_hero.description} onChange={(value) => updateSettingObject("routes_page_hero", { description: value })} rows={3} />
      </SettingsSection>

      <SettingsSection title="หน้าร้านอาหาร" description="ข้อความและภาพของหน้าร้านอาหาร">
        <TextInput label="หัวข้อ Hero" value={settings.restaurants_page_hero.title} onChange={(value) => updateSettingObject("restaurants_page_hero", { title: value })} />
        <TextArea label="คำอธิบาย Hero" value={settings.restaurants_page_hero.description} onChange={(value) => updateSettingObject("restaurants_page_hero", { description: value })} rows={3} />
        <TextInput label="หัวข้อ Feature" value={settings.restaurants_page_feature.title} onChange={(value) => updateSettingObject("restaurants_page_feature", { title: value })} />
        <TextInput label="หัวข้อย่อย Feature" value={settings.restaurants_page_feature.subtitle} onChange={(value) => updateSettingObject("restaurants_page_feature", { subtitle: value })} />
        <ImageField label="ภาพ Feature" value={settings.restaurants_page_feature.image} onRemove={() => updateSettingObject("restaurants_page_feature", { image: "" })} onPick={() => openPicker({ key: "restaurants_page_feature", field: "image" })} />
        <TextInput label="หัวข้อ CTA" value={settings.restaurants_page_cta.title} onChange={(value) => updateSettingObject("restaurants_page_cta", { title: value })} />
        <TextInput label="หัวข้อย่อย CTA" value={settings.restaurants_page_cta.subtitle} onChange={(value) => updateSettingObject("restaurants_page_cta", { subtitle: value })} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="ข้อความปุ่ม CTA" value={settings.restaurants_page_cta.linkText} onChange={(value) => updateSettingObject("restaurants_page_cta", { linkText: value })} />
          <TextInput label="URL CTA" value={settings.restaurants_page_cta.linkUrl} onChange={(value) => updateSettingObject("restaurants_page_cta", { linkUrl: value })} />
        </div>
        <ImageField label="ภาพ CTA" value={settings.restaurants_page_cta.image} onRemove={() => updateSettingObject("restaurants_page_cta", { image: "" })} onPick={() => openPicker({ key: "restaurants_page_cta", field: "image" })} />
      </SettingsSection>
    </>
  );
}

function ContactSettings({
  settings,
  updateSettingObject,
}: {
  settings: SettingsState;
  updateSettingObject: (key: SiteSettingKey, patch: Record<string, unknown>) => void;
}) {
  return (
    <>
      <SettingsSection title="ข้อมูลติดต่อทั่วไป" description="ข้อมูลติดต่อหลักของแพลตฟอร์ม">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="อีเมล" type="email" value={settings.general_info.email} onChange={(value) => updateSettingObject("general_info", { email: value })} />
          <TextInput label="เบอร์โทรศัพท์" value={settings.general_info.phone} onChange={(value) => updateSettingObject("general_info", { phone: value })} />
        </div>
        <TextArea label="ที่อยู่" value={settings.general_info.address} onChange={(value) => updateSettingObject("general_info", { address: value })} rows={3} />
      </SettingsSection>

      <SettingsSection title="ลิงก์โซเชียล" description="ลิงก์ social ที่ใช้ใน footer หรือหน้า public">
        <TextInput label="Facebook" type="url" value={settings.social_media.facebook} onChange={(value) => updateSettingObject("social_media", { facebook: value })} />
        <TextInput label="Instagram" type="url" value={settings.social_media.instagram} onChange={(value) => updateSettingObject("social_media", { instagram: value })} />
        <TextInput label="LINE" type="url" value={settings.social_media.line} onChange={(value) => updateSettingObject("social_media", { line: value })} />
      </SettingsSection>

      <SettingsSection title="ส่วนท้าย (Footer)" description="ข้อความท้ายเว็บไซต์">
        <TextInput label="ลิขสิทธิ์" value={settings.footer_info.copyright} onChange={(value) => updateSettingObject("footer_info", { copyright: value })} />
        <TextArea label="คำอธิบาย" value={settings.footer_info.description} onChange={(value) => updateSettingObject("footer_info", { description: value })} rows={3} />
      </SettingsSection>
    </>
  );
}

function SeoSettings({
  settings,
  updateSettingObject,
  openPicker,
}: {
  settings: SettingsState;
  updateSettingObject: (key: SiteSettingKey, patch: Record<string, unknown>) => void;
  openPicker: (target: PickerTarget) => void;
}) {
  return (
    <SettingsSection title="ค่าเริ่มต้น SEO" description="ค่าพื้นฐานสำหรับ title, description และภาพตอนแชร์ลิงก์">
      <TextInput label="Meta title" value={settings.seo_settings.metaTitle} onChange={(value) => updateSettingObject("seo_settings", { metaTitle: value })} />
      <TextArea label="Meta description" value={settings.seo_settings.metaDescription} onChange={(value) => updateSettingObject("seo_settings", { metaDescription: value })} rows={3} />
      <ImageField label="รูปภาพ OpenGraph" value={settings.seo_settings.ogImage} onRemove={() => updateSettingObject("seo_settings", { ogImage: "" })} onPick={() => openPicker({ key: "seo_settings", field: "ogImage" })} />
      <TextInput label="รหัส Google Analytics" value={settings.seo_settings.googleAnalyticsId} onChange={(value) => updateSettingObject("seo_settings", { googleAnalyticsId: value })} placeholder="G-XXXXXXXXXX" />
    </SettingsSection>
  );
}

function SystemSettings({
  settings,
  updateSettingObject,
}: {
  settings: SettingsState;
  updateSettingObject: (key: SiteSettingKey, patch: Record<string, unknown>) => void;
}) {
  return (
    <>
      <SettingsSection title="เปิด/ปิดฟีเจอร์" description="เปิดหรือปิดโมดูลหลักของระบบ">
        <ToggleField label="แสตมป์ดิจิทัล" checked={settings.feature_toggles.enableStamp} onChange={(checked) => updateSettingObject("feature_toggles", { enableStamp: checked })} />
        <ToggleField label="การออกใบประกาศ" checked={settings.feature_toggles.enableCertificate} onChange={(checked) => updateSettingObject("feature_toggles", { enableCertificate: checked })} />
        <ToggleField label="แบบสำรวจหลังเยี่ยมชม" checked={settings.feature_toggles.enableSurvey} onChange={(checked) => updateSettingObject("feature_toggles", { enableSurvey: checked })} />
      </SettingsSection>

      <SettingsSection title="การปิดปรับปรุง" description="ข้อความสำหรับโหมดปิดปรับปรุง">
        <ToggleField label="โหมดปิดปรับปรุง" checked={settings.maintenance_info.isMaintenanceMode} onChange={(checked) => updateSettingObject("maintenance_info", { isMaintenanceMode: checked })} tone="danger" />
        <TextArea label="ข้อความแจ้งเตือน" value={settings.maintenance_info.maintenanceMessage} onChange={(value) => updateSettingObject("maintenance_info", { maintenanceMessage: value })} rows={4} />
      </SettingsSection>
    </>
  );
}

function AboutSettings({
  settings,
  updateSettingObject,
  updateSettingFull,
  openPicker,
}: {
  settings: SettingsState;
  updateSettingObject: (key: SiteSettingKey, patch: Record<string, unknown>) => void;
  updateSettingFull: (key: SiteSettingKey, value: SettingsState[SiteSettingKey]) => void;
  openPicker: (target: PickerTarget) => void;
}) {
  const team = settings.about_team || [];

  return (
    <>
      <SettingsSection title="วิสัยทัศน์ (Vision)" description="ข้อความวิสัยทัศน์ในหน้าเกี่ยวกับเรา">
        <TextInput label="หัวข้อวิสัยทัศน์" value={settings.about_vision.title} onChange={(value) => updateSettingObject("about_vision", { title: value })} />
        <TextArea label="เนื้อหาวิสัยทัศน์" value={settings.about_vision.content} onChange={(value) => updateSettingObject("about_vision", { content: value })} rows={4} />
      </SettingsSection>

      <SettingsSection title="ทีมงาน (Team Members)" description="รายชื่อและข้อมูลทีมงาน">
        <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          <strong>หมายเหตุ:</strong> ในเวอร์ชันปัจจุบัน ข้อมูลทีมงานยังจัดการผ่าน Settings อยู่ ในอนาคตจะย้ายไปยังระบบจัดการเนื้อหา (Content Hub) เพื่อให้สามารถนำไปใช้ซ้ำในหน้าอื่นๆ ได้
        </div>
        <div className="space-y-4">
          {team.map((member: TeamMember, i: number) => (
            <div key={i} className="relative border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
              <button
                type="button"
                onClick={() => {
                  const newTeam = [...team];
                  newTeam.splice(i, 1);
                  updateSettingFull("about_team", newTeam);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                title="ลบทีมงาน"
              >
                <Trash size={20} />
              </button>
              
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <TextInput label="ชื่อ-นามสกุล" value={member.name} onChange={(val) => {
                  const newTeam = [...team];
                  newTeam[i] = { ...newTeam[i], name: val };
                  updateSettingFull("about_team", newTeam);
                }} />
                <TextInput label="ตำแหน่ง" value={member.role} onChange={(val) => {
                  const newTeam = [...team];
                  newTeam[i] = { ...newTeam[i], role: val };
                  updateSettingFull("about_team", newTeam);
                }} />
              </div>
              
              <ImageField 
                label="รูปภาพทีมงาน (อัตราส่วน 1:1 แนะนำขนาด 400x400px)" 
                value={member.imageUrl} 
                onRemove={() => {
                  const newTeam = [...team];
                  newTeam[i] = { ...newTeam[i], imageUrl: "" };
                  updateSettingFull("about_team", newTeam);
                }} 
                onPick={() => openPicker({ key: "about_team", field: "imageUrl", index: i })} 
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              updateSettingFull("about_team", [...team, { name: "ชื่อทีมงานใหม่", role: "ตำแหน่ง", imageUrl: "" }]);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-4 text-sm font-bold text-slate-500 hover:border-teal-500 hover:text-teal-600 transition-colors"
          >
            <Plus size={20} />
            เพิ่มสมาชิกทีมงาน
          </button>
        </div>
      </SettingsSection>
    </>
  );
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-800">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "url" | "number";
  placeholder?: string;
  min?: number | string;
  max?: number | string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <textarea
        value={value ?? ""}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
      />
    </label>
  );
}

function ImageField({
  label,
  value,
  onPick,
  onRemove,
}: {
  label: string;
  value: string;
  onPick: () => void;
  onRemove: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div>
      <p className="text-sm font-black text-slate-700">{label}</p>
      <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <div className="relative aspect-video bg-slate-100">
          {value ? (
            <>
              {/* Shimmer placeholder */}
              {!imageLoaded ? (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreviewUrl(value)}
                alt=""
                className={`h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
              ยังไม่ได้เลือกภาพ
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 p-3 sm:flex-row">
          <button
            type="button"
            onClick={onPick}
            className="min-h-10 flex-1 rounded-lg bg-[#073F37] px-3 py-2 text-sm font-black text-white transition hover:bg-[#0A6B62] active:scale-[0.97]"
          >
            เลือกภาพ
          </button>
          {value ? (
            <button
              type="button"
              onClick={onRemove}
              className="min-h-10 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-50 hover:text-rose-800 active:scale-[0.97]"
            >
              เอาออก
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
  tone = "normal",
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tone?: "normal" | "danger";
}) {
  const activeClass = tone === "danger" ? "bg-rose-600" : "bg-[#0A6B62]";

  return (
    <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50">
      {label}
      <span className={`relative h-7 w-12 rounded-full transition ${checked ? activeClass : "bg-slate-300"}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </label>
  );
}
