"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FloppyDisk, ImageSquare, TextAa, Layout, CheckCircle, XCircle, GlobeHemisphereWest, Users, PaperPlaneTilt, Envelope, Phone, MapPinLine, MagnifyingGlass, ToggleRight, Wrench } from "@phosphor-icons/react";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

type Tab = "homepage" | "general" | "social" | "footer" | "seo" | "features" | "maintenance";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });
  const [activeTab, setActiveTab] = useState<Tab>("homepage");
  
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [currentPickingIndex, setCurrentPickingIndex] = useState<number | null>(null);
  
  // States for different setting keys
  const [heroSettings, setHeroSettings] = useState({ title: "", subtitle: "", description: "", images: ["", "", ""] });
  const [generalInfo, setGeneralInfo] = useState({ email: "", phone: "", address: "" });
  const [socialMedia, setSocialMedia] = useState({ facebook: "", instagram: "", line: "" });
  const [footerInfo, setFooterInfo] = useState({ copyright: "", description: "" });
  const [seoSettings, setSeoSettings] = useState({ metaTitle: "", metaDescription: "", ogImage: "", googleAnalyticsId: "" });
  const [featureToggles, setFeatureToggles] = useState({ enableStamp: true, enableCertificate: true, enableSurvey: true });
  const [maintenanceInfo, setMaintenanceInfo] = useState({ isMaintenanceMode: false, maintenanceMessage: "" });
  
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json(); // Array of { setting_key, setting_value }
        
        data.forEach((item: any) => {
          if (item.setting_key === "homepage_hero" && item.setting_value) {
            const fetchedImages = item.setting_value.images || [];
            const images = [fetchedImages[0] || "", fetchedImages[1] || "", fetchedImages[2] || ""];
            setHeroSettings({ ...item.setting_value, images });
          }
          if (item.setting_key === "general_info" && item.setting_value) {
            setGeneralInfo({ email: "", phone: "", address: "", ...item.setting_value });
          }
          if (item.setting_key === "social_media" && item.setting_value) {
            setSocialMedia({ facebook: "", instagram: "", line: "", ...item.setting_value });
          }
          if (item.setting_key === "footer_info" && item.setting_value) {
            setFooterInfo({ copyright: "", description: "", ...item.setting_value });
          }
          if (item.setting_key === "seo_settings" && item.setting_value) {
            setSeoSettings({ metaTitle: "", metaDescription: "", ogImage: "", googleAnalyticsId: "", ...item.setting_value });
          }
          if (item.setting_key === "feature_toggles" && item.setting_value) {
            setFeatureToggles({ enableStamp: true, enableCertificate: true, enableSurvey: true, ...item.setting_value });
          }
          if (item.setting_key === "maintenance_info" && item.setting_value) {
            setMaintenanceInfo({ isMaintenanceMode: false, maintenanceMessage: "", ...item.setting_value });
          }
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: null, message: "" });
    
    const settingsToSave = [
      {
        key: "homepage_hero",
        value: { ...heroSettings, images: heroSettings.images.filter(img => img.trim() !== "") }
      },
      { key: "general_info", value: generalInfo },
      { key: "social_media", value: socialMedia },
      { key: "footer_info", value: footerInfo },
      { key: "seo_settings", value: seoSettings },
      { key: "feature_toggles", value: featureToggles },
      { key: "maintenance_info", value: maintenanceInfo }
    ];

    try {
      // Save them all sequentially (could be parallelized)
      let allSuccess = true;
      for (const setting of settingsToSave) {
        const response = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(setting)
        });
        if (!response.ok) allSuccess = false;
      }

      if (allSuccess) {
        setStatus({ type: 'success', message: "All settings saved successfully! The changes are now live." });
        setTimeout(() => setStatus({ type: null, message: "" }), 5000);
      } else {
        setStatus({ type: 'error', message: "Some settings failed to save. Please try again." });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setStatus({ type: 'error', message: "An unexpected error occurred." });
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...heroSettings.images];
    newImages[index] = value;
    setHeroSettings({ ...heroSettings, images: newImages });
  };

  const handleOgImageChange = (url: string) => {
    setSeoSettings({ ...seoSettings, ogImage: url });
  };

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto pb-20 h-full flex flex-col">
        <div className="shrink-0">
          <AdminPageHeader
            title="Site Settings"
            description="Manage dynamic content, texts, and layouts for the public website."
          />

          {status.type && (
            <div className={`mt-6 mb-2 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
              status.type === 'success' ? 'bg-teal/10 text-teal-800 border border-teal/20' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle size={24} weight="fill" className="text-teal" />
              ) : (
                <XCircle size={24} weight="fill" className="text-red-500" />
              )}
              <p className="font-medium text-sm">{status.message}</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-teal" />
          </div>
        ) : (
          <div className="mt-8 flex flex-col md:flex-row gap-8 items-start">
            
            {/* Left Sidebar Tabs */}
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-2 sticky top-6">
              <button 
                onClick={() => setActiveTab("homepage")}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold text-left ${activeTab === "homepage" ? "bg-white text-teal shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}
              >
                <Layout size={20} weight={activeTab === "homepage" ? "fill" : "regular"} />
                Homepage Hero
              </button>
              <button 
                onClick={() => setActiveTab("general")}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold text-left ${activeTab === "general" ? "bg-white text-teal shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}
              >
                <GlobeHemisphereWest size={20} weight={activeTab === "general" ? "fill" : "regular"} />
                General Info
              </button>
              <button 
                onClick={() => setActiveTab("social")}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold text-left ${activeTab === "social" ? "bg-white text-teal shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}
              >
                <Users size={20} weight={activeTab === "social" ? "fill" : "regular"} />
                Social Media
              </button>
              <button 
                onClick={() => setActiveTab("footer")}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold text-left ${activeTab === "footer" ? "bg-white text-teal shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}
              >
                <PaperPlaneTilt size={20} weight={activeTab === "footer" ? "fill" : "regular"} />
                Footer
              </button>

              <div className="my-2 border-t border-slate-200"></div>

              <button 
                onClick={() => setActiveTab("seo")}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold text-left ${activeTab === "seo" ? "bg-white text-teal shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}
              >
                <MagnifyingGlass size={20} weight={activeTab === "seo" ? "fill" : "regular"} />
                SEO & Branding
              </button>
              <button 
                onClick={() => setActiveTab("features")}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold text-left ${activeTab === "features" ? "bg-white text-teal shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}
              >
                <ToggleRight size={20} weight={activeTab === "features" ? "fill" : "regular"} />
                Features Toggle
              </button>
              <button 
                onClick={() => setActiveTab("maintenance")}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold text-left ${activeTab === "maintenance" ? "bg-white text-coral shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}
              >
                <Wrench size={20} weight={activeTab === "maintenance" ? "fill" : "regular"} />
                Maintenance
              </button>

              <div className="mt-4 pt-6 border-t border-slate-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-ink/90 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ink/20 disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
                >
                  {saving ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <FloppyDisk size={20} weight="bold" />
                  )}
                  {saving ? "Saving..." : "Save All Changes"}
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 w-full space-y-8">
              
              {/* TAB: Homepage Hero */}
              {activeTab === "homepage" && (
                <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Layout size={20} className="text-ink" weight="duotone" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Homepage Hero Section</h3>
                      <p className="text-xs text-slate-500">Configure the main welcome area on the homepage</p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Texts */}
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">
                        <TextAa size={18} weight="bold" className="text-teal" /> Text Content
                      </h4>
                      
                      <div className="grid gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Badge Subtitle</label>
                          <input
                            type="text"
                            value={heroSettings.subtitle}
                            onChange={(e) => setHeroSettings({...heroSettings, subtitle: e.target.value})}
                            placeholder="e.g. ออกเดินทางสู่ดินแดนแห่งมนต์เสน่ห์"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Main Title</label>
                          <input
                            type="text"
                            value={heroSettings.title}
                            onChange={(e) => setHeroSettings({...heroSettings, title: e.target.value})}
                            placeholder="e.g. ค้นพบความมหัศจรรย์ที่ซ่อนเร้น"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Description Text</label>
                          <textarea
                            value={heroSettings.description}
                            onChange={(e) => setHeroSettings({...heroSettings, description: e.target.value})}
                            rows={3}
                            placeholder="Enter a short welcoming description..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Images */}
                    <div className="space-y-4 pt-4">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">
                        <ImageSquare size={18} weight="bold" className="text-coral" /> Hero Images
                      </h4>
                      <p className="text-xs text-slate-500">Provide exactly 3 image URLs for the overlapping collage on the right side of the hero section.</p>
                      
                      <div className="grid gap-4">
                        {[0, 1, 2].map((idx) => (
                          <div key={idx} className="flex gap-3 items-center">
                            <div className="flex-none flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm">
                              {idx + 1}
                            </div>
                            
                            {heroSettings.images[idx] ? (
                              <div className="flex-1 min-w-0 flex items-center gap-3 bg-slate-50/50 border border-slate-200 rounded-xl p-2 pr-4">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={heroSettings.images[idx]} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 truncate text-xs font-mono text-slate-600">
                                  {heroSettings.images[idx]}
                                </div>
                                <button
                                  onClick={() => {
                                    setCurrentPickingIndex(idx);
                                    setIsMediaPickerOpen(true);
                                  }}
                                  className="text-xs font-bold text-teal hover:text-teal/80 transition-colors whitespace-nowrap px-3 py-1.5 bg-teal/10 rounded-lg"
                                >
                                  Change
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setCurrentPickingIndex(idx);
                                  setIsMediaPickerOpen(true);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl px-4 py-4 text-sm text-slate-500 hover:border-teal hover:text-teal hover:bg-teal/5 transition-all"
                              >
                                <ImageSquare size={20} />
                                <span className="font-medium">Select Image {idx + 1}</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* TAB: General Info */}
              {activeTab === "general" && (
                <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <GlobeHemisphereWest size={20} className="text-ink" weight="duotone" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">General Information</h3>
                      <p className="text-xs text-slate-500">Contact details and general business info</p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                        <Envelope size={16} /> Support Email
                      </label>
                      <input
                        type="email"
                        value={generalInfo.email}
                        onChange={(e) => setGeneralInfo({...generalInfo, email: e.target.value})}
                        placeholder="contact@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                        <Phone size={16} /> Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={generalInfo.phone}
                        onChange={(e) => setGeneralInfo({...generalInfo, phone: e.target.value})}
                        placeholder="+66 123 456 789"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                        <MapPinLine size={16} /> Physical Address
                      </label>
                      <textarea
                        value={generalInfo.address}
                        onChange={(e) => setGeneralInfo({...generalInfo, address: e.target.value})}
                        rows={3}
                        placeholder="123 Tourism Street..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all resize-none"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* TAB: Social Media */}
              {activeTab === "social" && (
                <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Users size={20} className="text-ink" weight="duotone" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Social Media Links</h3>
                      <p className="text-xs text-slate-500">Links to your official social media profiles</p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Facebook URL</label>
                      <input
                        type="url"
                        value={socialMedia.facebook}
                        onChange={(e) => setSocialMedia({...socialMedia, facebook: e.target.value})}
                        placeholder="https://facebook.com/..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Instagram URL</label>
                      <input
                        type="url"
                        value={socialMedia.instagram}
                        onChange={(e) => setSocialMedia({...socialMedia, instagram: e.target.value})}
                        placeholder="https://instagram.com/..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">LINE Official Account</label>
                      <input
                        type="url"
                        value={socialMedia.line}
                        onChange={(e) => setSocialMedia({...socialMedia, line: e.target.value})}
                        placeholder="https://line.me/R/ti/p/..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* TAB: Footer Info */}
              {activeTab === "footer" && (
                <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <PaperPlaneTilt size={20} className="text-ink" weight="duotone" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Footer Content</h3>
                      <p className="text-xs text-slate-500">Configure the text shown at the bottom of the public website</p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Copyright Text</label>
                      <input
                        type="text"
                        value={footerInfo.copyright}
                        onChange={(e) => setFooterInfo({...footerInfo, copyright: e.target.value})}
                        placeholder="© 2026 Southern Border Tourism. All rights reserved."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Short Description (Footer)</label>
                      <textarea
                        value={footerInfo.description}
                        onChange={(e) => setFooterInfo({...footerInfo, description: e.target.value})}
                        rows={3}
                        placeholder="A brief blurb about the project shown in the footer..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all resize-none"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* TAB: SEO & Branding */}
              {activeTab === "seo" && (
                <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <MagnifyingGlass size={20} className="text-ink" weight="duotone" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">SEO & Branding</h3>
                      <p className="text-xs text-slate-500">Search engine optimization and brand assets</p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Meta Information</h4>
                      <div className="grid gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Default Meta Title</label>
                          <input
                            type="text"
                            value={seoSettings.metaTitle}
                            onChange={(e) => setSeoSettings({...seoSettings, metaTitle: e.target.value})}
                            placeholder="e.g. Southern Border Tourism Platform"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Default Meta Description</label>
                          <textarea
                            value={seoSettings.metaDescription}
                            onChange={(e) => setSeoSettings({...seoSettings, metaDescription: e.target.value})}
                            rows={3}
                            placeholder="Discover the beauty of the southern border..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h4 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Social Sharing (OpenGraph)</h4>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Default OG Image</label>
                        <p className="text-xs text-slate-500 mb-3">Image shown when users share your website on Facebook, LINE, etc. (Recommended size: 1200x630px)</p>
                        
                        {seoSettings.ogImage ? (
                          <div className="flex gap-3 bg-slate-50/50 border border-slate-200 rounded-xl p-3">
                            <div className="w-24 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={seoSettings.ogImage} alt="OG Default" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="truncate text-xs font-mono text-slate-600 mb-2">
                                {seoSettings.ogImage}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setCurrentPickingIndex(999);
                                    setIsMediaPickerOpen(true);
                                  }}
                                  className="text-xs font-bold text-teal hover:text-teal/80 transition-colors bg-teal/10 px-3 py-1.5 rounded-lg"
                                >
                                  Change Image
                                </button>
                                <button
                                  onClick={() => setSeoSettings({...seoSettings, ogImage: ""})}
                                  className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors bg-rose-50 px-3 py-1.5 rounded-lg"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setCurrentPickingIndex(999); // Special index for OG image
                              setIsMediaPickerOpen(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl px-4 py-8 text-sm text-slate-500 hover:border-teal hover:text-teal hover:bg-teal/5 transition-all"
                          >
                            <ImageSquare size={20} />
                            <span className="font-medium">Select OpenGraph Image</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h4 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Tracking & Analytics</h4>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Google Analytics Measurement ID</label>
                        <input
                          type="text"
                          value={seoSettings.googleAnalyticsId}
                          onChange={(e) => setSeoSettings({...seoSettings, googleAnalyticsId: e.target.value})}
                          placeholder="e.g. G-XXXXXXXXXX"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* TAB: Features Toggle */}
              {activeTab === "features" && (
                <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <ToggleRight size={20} className="text-ink" weight="duotone" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Features Toggle</h3>
                      <p className="text-xs text-slate-500">Enable or disable major system modules dynamically</p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800">QR Check-in & Digital Stamps</h4>
                        <p className="text-xs text-slate-500 mt-1">Allow tourists to scan QR codes and collect stamps at attractions.</p>
                      </div>
                      <div className="relative inline-block w-12 mr-2 align-middle select-none shrink-0">
                        <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-slate-200 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-6 checked:border-teal" checked={featureToggles.enableStamp} onChange={(e) => setFeatureToggles({...featureToggles, enableStamp: e.target.checked})} />
                        <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${featureToggles.enableStamp ? 'bg-teal' : 'bg-slate-200'}`}></label>
                      </div>
                    </label>

                    <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800">Digital Certificate Generation</h4>
                        <p className="text-xs text-slate-500 mt-1">Enable generating personalized certificates after check-in.</p>
                      </div>
                      <div className="relative inline-block w-12 mr-2 align-middle select-none shrink-0">
                        <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-slate-200 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-6 checked:border-teal" checked={featureToggles.enableCertificate} onChange={(e) => setFeatureToggles({...featureToggles, enableCertificate: e.target.checked})} />
                        <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${featureToggles.enableCertificate ? 'bg-teal' : 'bg-slate-200'}`}></label>
                      </div>
                    </label>

                    <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800">Post-Visit Surveys</h4>
                        <p className="text-xs text-slate-500 mt-1">Ask for feedback and expenses data after successful check-in.</p>
                      </div>
                      <div className="relative inline-block w-12 mr-2 align-middle select-none shrink-0">
                        <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-slate-200 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-6 checked:border-teal" checked={featureToggles.enableSurvey} onChange={(e) => setFeatureToggles({...featureToggles, enableSurvey: e.target.checked})} />
                        <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${featureToggles.enableSurvey ? 'bg-teal' : 'bg-slate-200'}`}></label>
                      </div>
                    </label>
                  </div>
                </section>
              )}

              {/* TAB: Maintenance */}
              {activeTab === "maintenance" && (
                <section className="rounded-3xl border border-red-100 bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-red-50/50 px-6 py-4 border-b border-red-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-red-100">
                      <Wrench size={20} className="text-red-500" weight="duotone" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-800">System Maintenance</h3>
                      <p className="text-xs text-red-600/70">Control access to the public website</p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className={`p-5 rounded-2xl border transition-colors ${maintenanceInfo.isMaintenanceMode ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                      <label className="flex items-start justify-between gap-4 cursor-pointer">
                        <div>
                          <h4 className={`font-bold ${maintenanceInfo.isMaintenanceMode ? 'text-red-800' : 'text-slate-800'}`}>Enable Maintenance Mode</h4>
                          <p className={`text-xs mt-1 ${maintenanceInfo.isMaintenanceMode ? 'text-red-600' : 'text-slate-500'}`}>
                            When active, regular users will see a maintenance page. Admins can still access the dashboard.
                          </p>
                        </div>
                        <div className="relative inline-block w-12 mr-2 align-middle select-none shrink-0 mt-1">
                          <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-slate-200 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-6 checked:border-red-500" checked={maintenanceInfo.isMaintenanceMode} onChange={(e) => setMaintenanceInfo({...maintenanceInfo, isMaintenanceMode: e.target.checked})} />
                          <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${maintenanceInfo.isMaintenanceMode ? 'bg-red-500' : 'bg-slate-200'}`}></label>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Maintenance Message</label>
                      <textarea
                        value={maintenanceInfo.maintenanceMessage}
                        onChange={(e) => setMaintenanceInfo({...maintenanceInfo, maintenanceMessage: e.target.value})}
                        rows={4}
                        placeholder="We are currently upgrading the system. Please come back later..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:bg-white focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/10 transition-all resize-none"
                      />
                      <p className="text-xs text-slate-500 mt-2">This message will be displayed to visitors while the system is in maintenance mode.</p>
                    </div>
                  </div>
                </section>
              )}

            </div>
          </div>
        )}
      </div>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          if (currentPickingIndex === 999) {
            handleOgImageChange(url);
          } else if (currentPickingIndex !== null) {
            handleImageChange(currentPickingIndex, url);
          }
        }}
        title="Select Hero Image"
      />
    </AdminShell>
  );
}
