"use client";

import type { AdminAttractionRow } from "@/lib/repositories/admin-attraction.repository";

interface HiddenAttractionFieldsProps {
  attraction: AdminAttractionRow;
  // Use this to override specific fields that are being edited in the current form
  exclude?: string[];
}

export function HiddenAttractionFields({ attraction, exclude = [] }: HiddenAttractionFieldsProps) {
  const fields = [
    { name: "attractionId", value: attraction.attraction_id },
    { name: "provinceId", value: attraction.province_id },
    { name: "districtId", value: attraction.district_id },
    { name: "attractionTypeId", value: attraction.attraction_type_id },
    { name: "slug", value: attraction.slug },
    { name: "nameTh", value: attraction.name_th },
    { name: "nameEn", value: attraction.name_en },
    { name: "shortDescriptionTh", value: attraction.short_description_th },
    { name: "shortDescriptionEn", value: attraction.short_description_en },
    { name: "descriptionTh", value: attraction.description_th },
    { name: "descriptionEn", value: attraction.description_en },
    { name: "historyTh", value: attraction.history_th },
    { name: "historyEn", value: attraction.history_en },
    { name: "latitude", value: attraction.latitude },
    { name: "longitude", value: attraction.longitude },
    { name: "addressText", value: attraction.address_text },
    { name: "openingHours", value: attraction.opening_hours },
    { name: "contactInfo", value: attraction.contact_info },
    { name: "sustainabilityCategory", value: attraction.sustainability_category },
    { name: "estimatedCapacityPerDay", value: attraction.estimated_capacity_per_day },
    { name: "isPublished", value: attraction.is_published },
    { name: "isActive", value: attraction.is_active },
  ];

  return (
    <>
      {fields.map((f) => {
        if (exclude.includes(f.name)) return null;
        if (f.value === null || f.value === undefined) return <input key={f.name} type="hidden" name={f.name} value="" />;
        return <input key={f.name} type="hidden" name={f.name} value={String(f.value)} />;
      })}
    </>
  );
}
