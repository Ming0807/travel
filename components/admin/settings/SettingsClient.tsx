"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  CheckCircle,
  FloppyDisk,
  Gear,
  GlobeHemisphereWest,
  ImageSquare,
  MagnifyingGlass,
  ToggleRight,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import { HomepageFeaturedEditor } from "@/components/admin/content/HomepageFeaturedEditor";
import {
  SITE_SETTING_DEFAULTS,
  SITE_SETTING_KEYS,
  type SiteSettingKey,
} from "@/lib/config/site-settings";

type SiteSettingRow = {
  setting_key: string;
  setting_value: unknown;
  description: string | null;
  updated_at: string;
};

type SettingsState = Record<SiteSettingKey, any>;

type SettingsGroupId = "homepage" | "publicPages" | "contact" | "seo" | "system";

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
    label: "Homepage",
    description: "Hero, popular destination slots, highlight blocks",
    icon: GlobeHemisphereWest,
  },
  {
    id: "publicPages",
    label: "Public Pages",
    description: "Attractions, stories, routes, restaurants page headers",
    icon: ImageSquare,
  },
  {
    id: "contact",
    label: "Contact & Footer",
    description: "Contact channels, social links, footer copy",
    icon: Gear,
  },
  {
    id: "seo",
    label: "SEO",
    description: "Default meta title, description, sharing image",
    icon: MagnifyingGlass,
  },
  {
    id: "system",
    label: "System",
    description: "Feature toggles and maintenance message",
    icon: ToggleRight,
  },
];

function createInitialSettings(rows: SiteSettingRow[]) {
  const settings = structuredClone(SITE_SETTING_DEFAULTS) as SettingsState;

  for (const row of rows) {
    if (!SITE_SETTING_KEYS.includes(row.setting_key as SiteSettingKey)) continue;
    const key = row.setting_key as SiteSettingKey;
    if (row.setting_value && typeof row.setting_value === "object" && !Array.isArray(row.setting_value)) {
      settings[key] = {
        ...settings[key],
        ...(row.setting_value as Record<string, unknown>),
      };
    } else if (row.setting_value !== null && row.setting_value !== undefined) {
      settings[key] = row.setting_value;
    }
  }

  const heroImages = settings.homepage_hero.images ?? [];
  settings.homepage_hero.images = [heroImages[0] || "", heroImages[1] || "", heroImages[2] || ""];

  return settings;
}

function imagePreviewUrl(path: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `/api/admin/media/preview?bucket=southern-border-tourism&path=${encodeURIComponent(path)}`;
}

function isSettingsGroupId(value: unknown): value is SettingsGroupId {
  return typeof value === "string" && GROUPS.some((group) => group.id === value);
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

  const activeGroupMeta = useMemo(() => GROUPS.find((group) => group.id === activeGroup) ?? GROUPS[0], [activeGroup]);

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
            {saving ? "กำลังบันทึก..." : dirtyKeys.size ? `บันทึก ${dirtyKeys.size} รายการ` : "บันทึกแล้ว"}
          </button>
        }
      />

      {status.type ? (
        <div
          className={`flex gap-3 rounded-lg border p-4 text-sm font-bold ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : status.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-slate-50 text-slate-700"
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
                onClick={() => setActiveGroup(group.id)}
                className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-[#0A6B62] bg-[#E6F4EF] text-[#073F37]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon className="mt-0.5 shrink-0" size={20} weight={isActive ? "fill" : "regular"} />
                <span>
                  <span className="block text-sm font-black">{group.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">{group.description}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#F3704C]">Current Section</p>
            <h2 className="mt-1 text-xl font-black text-slate-800">{activeGroupMeta.label}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{activeGroupMeta.description}</p>
          </div>

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
        </div>
      </div>

      <MediaPickerModal
        isOpen={!!pickerTarget}
        onClose={() => setPickerTarget(null)}
        onSelect={(url) => {
          handleMediaSelect(url);
          setPickerTarget(null);
        }}
        title="เลือกภาพจาก Media Library"
      />
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
      <SettingsSection title="Homepage Hero" description="ข้อความและภาพชุดแรกของหน้าแรก">
        <TextInput label="Headline" value={settings.homepage_hero.title} onChange={(value) => updateSettingObject("homepage_hero", { title: value })} />
        <TextInput label="Subtitle / Eyebrow" value={settings.homepage_hero.subtitle} onChange={(value) => updateSettingObject("homepage_hero", { subtitle: value })} />
        <TextArea label="Description" value={settings.homepage_hero.description} onChange={(value) => updateSettingObject("homepage_hero", { description: value })} rows={3} />
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

      <SettingsSection title="Popular Destinations" description="เลือกสถานที่ท่องเที่ยวที่ต้องการล็อกให้ขึ้นหน้าแรก (ลากวางเพื่อสลับตำแหน่ง)">
        <HomepageFeaturedEditor
          slugs={settings.homepage_featured_attractions.slugs ?? []}
          onChange={(slugs) => updateSettingObject("homepage_featured_attractions", { slugs })}
        />
      </SettingsSection>

      <SettingsSection title="How It Works" description="บล็อกอธิบาย QR, certificate, stamp แบบสั้น">
        <TextInput label="Title" value={settings.homepage_how_it_works.title} onChange={(value) => updateSettingObject("homepage_how_it_works", { title: value })} />
        <TextInput label="Subtitle" value={settings.homepage_how_it_works.subtitle} onChange={(value) => updateSettingObject("homepage_how_it_works", { subtitle: value })} />
        <TextArea label="Description" value={settings.homepage_how_it_works.description} onChange={(value) => updateSettingObject("homepage_how_it_works", { description: value })} rows={3} />
      </SettingsSection>

      <SettingsSection title="Highlights" description="เรื่องเล่าและภาพประกอบช่วงกลางหน้าแรก">
        <TextInput label="Title" value={settings.homepage_highlights.title} onChange={(value) => updateSettingObject("homepage_highlights", { title: value })} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Author name" value={settings.homepage_highlights.authorName} onChange={(value) => updateSettingObject("homepage_highlights", { authorName: value })} />
          <TextInput label="Location" value={settings.homepage_highlights.location} onChange={(value) => updateSettingObject("homepage_highlights", { location: value })} />
        </div>
        <TextArea label="Quote" value={settings.homepage_highlights.quote} onChange={(value) => updateSettingObject("homepage_highlights", { quote: value })} rows={4} />
        <div className="grid gap-4 md:grid-cols-2">
          <ImageField label="Video cover" value={settings.homepage_highlights.videoCover} onRemove={() => updateSettingObject("homepage_highlights", { videoCover: "" })} onPick={() => openPicker({ key: "homepage_highlights", field: "videoCover" })} />
          <ImageField label="Image cover" value={settings.homepage_highlights.imageCover} onRemove={() => updateSettingObject("homepage_highlights", { imageCover: "" })} onPick={() => openPicker({ key: "homepage_highlights", field: "imageCover" })} />
        </div>
        <TextInput label="Image title" value={settings.homepage_highlights.imageTitle} onChange={(value) => updateSettingObject("homepage_highlights", { imageTitle: value })} />
      </SettingsSection>

      <SettingsSection title="Homepage CTA" description="บล็อก call-to-action ท้ายหน้าแรก">
        <TextInput label="Title" value={settings.homepage_cta.title} onChange={(value) => updateSettingObject("homepage_cta", { title: value })} />
        <TextInput label="Subtitle" value={settings.homepage_cta.subtitle} onChange={(value) => updateSettingObject("homepage_cta", { subtitle: value })} />
        <TextArea label="Description" value={settings.homepage_cta.description} onChange={(value) => updateSettingObject("homepage_cta", { description: value })} rows={3} />
        <ImageField label="Background image" value={settings.homepage_cta.bgImage} onRemove={() => updateSettingObject("homepage_cta", { bgImage: "" })} onPick={() => openPicker({ key: "homepage_cta", field: "bgImage" })} />
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
      <SettingsSection title="Attractions Page" description="ข้อความหัวหน้าและ banner ของหน้ารวมสถานที่">
        <TextInput label="Hero title" value={settings.attractions_page_hero.title} onChange={(value) => updateSettingObject("attractions_page_hero", { title: value })} />
        <TextArea label="Hero description" value={settings.attractions_page_hero.description} onChange={(value) => updateSettingObject("attractions_page_hero", { description: value })} rows={3} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Banner title" value={settings.attractions_page_banner.title} onChange={(value) => updateSettingObject("attractions_page_banner", { title: value })} />
          <TextInput label="Banner subtitle" value={settings.attractions_page_banner.subtitle} onChange={(value) => updateSettingObject("attractions_page_banner", { subtitle: value })} />
          <TextInput label="Button text" value={settings.attractions_page_banner.linkText} onChange={(value) => updateSettingObject("attractions_page_banner", { linkText: value })} />
          <TextInput label="Button URL" value={settings.attractions_page_banner.linkUrl} onChange={(value) => updateSettingObject("attractions_page_banner", { linkUrl: value })} />
        </div>
        <ImageField label="Banner image" value={settings.attractions_page_banner.image} onRemove={() => updateSettingObject("attractions_page_banner", { image: "" })} onPick={() => openPicker({ key: "attractions_page_banner", field: "image" })} />
      </SettingsSection>

      <SettingsSection title="Stories Page" description="ข้อความหัวหน้าและ CTA ของหน้าบทความ">
        <TextInput label="Hero title" value={settings.stories_page_hero.title} onChange={(value) => updateSettingObject("stories_page_hero", { title: value })} />
        <TextArea label="Hero description" value={settings.stories_page_hero.description} onChange={(value) => updateSettingObject("stories_page_hero", { description: value })} rows={3} />
        <TextInput label="CTA title" value={settings.stories_page_cta.title} onChange={(value) => updateSettingObject("stories_page_cta", { title: value })} />
        <TextInput label="CTA subtitle" value={settings.stories_page_cta.subtitle} onChange={(value) => updateSettingObject("stories_page_cta", { subtitle: value })} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="CTA button text" value={settings.stories_page_cta.linkText} onChange={(value) => updateSettingObject("stories_page_cta", { linkText: value })} />
          <TextInput label="CTA URL" value={settings.stories_page_cta.linkUrl} onChange={(value) => updateSettingObject("stories_page_cta", { linkUrl: value })} />
        </div>
        <ImageField label="CTA image" value={settings.stories_page_cta.image} onRemove={() => updateSettingObject("stories_page_cta", { image: "" })} onPick={() => openPicker({ key: "stories_page_cta", field: "image" })} />
      </SettingsSection>

      <SettingsSection title="Routes Page" description="ข้อความหัวหน้าเส้นทางท่องเที่ยว">
        <TextInput label="Hero title" value={settings.routes_page_hero.title} onChange={(value) => updateSettingObject("routes_page_hero", { title: value })} />
        <TextArea label="Hero description" value={settings.routes_page_hero.description} onChange={(value) => updateSettingObject("routes_page_hero", { description: value })} rows={3} />
      </SettingsSection>

      <SettingsSection title="Restaurants Page" description="ข้อความและภาพของหน้าร้านอาหาร">
        <TextInput label="Hero title" value={settings.restaurants_page_hero.title} onChange={(value) => updateSettingObject("restaurants_page_hero", { title: value })} />
        <TextArea label="Hero description" value={settings.restaurants_page_hero.description} onChange={(value) => updateSettingObject("restaurants_page_hero", { description: value })} rows={3} />
        <TextInput label="Feature title" value={settings.restaurants_page_feature.title} onChange={(value) => updateSettingObject("restaurants_page_feature", { title: value })} />
        <TextInput label="Feature subtitle" value={settings.restaurants_page_feature.subtitle} onChange={(value) => updateSettingObject("restaurants_page_feature", { subtitle: value })} />
        <ImageField label="Feature image" value={settings.restaurants_page_feature.image} onRemove={() => updateSettingObject("restaurants_page_feature", { image: "" })} onPick={() => openPicker({ key: "restaurants_page_feature", field: "image" })} />
        <TextInput label="CTA title" value={settings.restaurants_page_cta.title} onChange={(value) => updateSettingObject("restaurants_page_cta", { title: value })} />
        <TextInput label="CTA subtitle" value={settings.restaurants_page_cta.subtitle} onChange={(value) => updateSettingObject("restaurants_page_cta", { subtitle: value })} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="CTA button text" value={settings.restaurants_page_cta.linkText} onChange={(value) => updateSettingObject("restaurants_page_cta", { linkText: value })} />
          <TextInput label="CTA URL" value={settings.restaurants_page_cta.linkUrl} onChange={(value) => updateSettingObject("restaurants_page_cta", { linkUrl: value })} />
        </div>
        <ImageField label="CTA image" value={settings.restaurants_page_cta.image} onRemove={() => updateSettingObject("restaurants_page_cta", { image: "" })} onPick={() => openPicker({ key: "restaurants_page_cta", field: "image" })} />
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
      <SettingsSection title="General Contact" description="ข้อมูลติดต่อหลักของแพลตฟอร์ม">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Email" type="email" value={settings.general_info.email} onChange={(value) => updateSettingObject("general_info", { email: value })} />
          <TextInput label="Phone" value={settings.general_info.phone} onChange={(value) => updateSettingObject("general_info", { phone: value })} />
        </div>
        <TextArea label="Address" value={settings.general_info.address} onChange={(value) => updateSettingObject("general_info", { address: value })} rows={3} />
      </SettingsSection>

      <SettingsSection title="Social Links" description="ลิงก์ social ที่ใช้ใน footer หรือหน้า public">
        <TextInput label="Facebook URL" type="url" value={settings.social_media.facebook} onChange={(value) => updateSettingObject("social_media", { facebook: value })} />
        <TextInput label="Instagram URL" type="url" value={settings.social_media.instagram} onChange={(value) => updateSettingObject("social_media", { instagram: value })} />
        <TextInput label="LINE URL" type="url" value={settings.social_media.line} onChange={(value) => updateSettingObject("social_media", { line: value })} />
      </SettingsSection>

      <SettingsSection title="Footer" description="ข้อความท้ายเว็บไซต์">
        <TextInput label="Copyright" value={settings.footer_info.copyright} onChange={(value) => updateSettingObject("footer_info", { copyright: value })} />
        <TextArea label="Description" value={settings.footer_info.description} onChange={(value) => updateSettingObject("footer_info", { description: value })} rows={3} />
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
    <SettingsSection title="SEO Defaults" description="ค่าพื้นฐานสำหรับ title, description และภาพตอนแชร์ลิงก์">
      <TextInput label="Meta title" value={settings.seo_settings.metaTitle} onChange={(value) => updateSettingObject("seo_settings", { metaTitle: value })} />
      <TextArea label="Meta description" value={settings.seo_settings.metaDescription} onChange={(value) => updateSettingObject("seo_settings", { metaDescription: value })} rows={3} />
      <ImageField label="OpenGraph image" value={settings.seo_settings.ogImage} onRemove={() => updateSettingObject("seo_settings", { ogImage: "" })} onPick={() => openPicker({ key: "seo_settings", field: "ogImage" })} />
      <TextInput label="Google Analytics measurement ID" value={settings.seo_settings.googleAnalyticsId} onChange={(value) => updateSettingObject("seo_settings", { googleAnalyticsId: value })} placeholder="G-XXXXXXXXXX" />
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
      <SettingsSection title="Feature Toggles" description="เปิดหรือปิด module หลักของระบบ">
        <ToggleField label="Digital stamps" checked={settings.feature_toggles.enableStamp} onChange={(checked) => updateSettingObject("feature_toggles", { enableStamp: checked })} />
        <ToggleField label="Certificate generation" checked={settings.feature_toggles.enableCertificate} onChange={(checked) => updateSettingObject("feature_toggles", { enableCertificate: checked })} />
        <ToggleField label="Post-visit survey" checked={settings.feature_toggles.enableSurvey} onChange={(checked) => updateSettingObject("feature_toggles", { enableSurvey: checked })} />
      </SettingsSection>

      <SettingsSection title="Maintenance" description="ข้อความสำหรับโหมดปิดปรับปรุง">
        <ToggleField label="Maintenance mode" checked={settings.maintenance_info.isMaintenanceMode} onChange={(checked) => updateSettingObject("maintenance_info", { isMaintenanceMode: checked })} tone="danger" />
        <TextArea label="Maintenance message" value={settings.maintenance_info.maintenanceMessage} onChange={(value) => updateSettingObject("maintenance_info", { maintenanceMessage: value })} rows={4} />
      </SettingsSection>
    </>
  );
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-black text-[#073F37]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "url";
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
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
  return (
    <div>
      <p className="text-sm font-black text-slate-700">{label}</p>
      <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <div className="aspect-video bg-slate-100">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreviewUrl(value)} alt="" className="h-full w-full object-cover" />
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
            className="min-h-10 flex-1 rounded-lg bg-[#073F37] px-3 py-2 text-sm font-black text-white transition hover:bg-[#0A6B62]"
          >
            เลือกภาพ
          </button>
          {value ? (
            <button
              type="button"
              onClick={onRemove}
              className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
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
