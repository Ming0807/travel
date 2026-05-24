"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FloppyDisk, ImageSquare, TextAa, Layout, CheckCircle, XCircle, GlobeHemisphereWest, Users, PaperPlaneTilt, Envelope, Phone, MapPinLine } from "@phosphor-icons/react";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

type Tab = "homepage" | "general" | "social" | "footer";

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
      { key: "footer_info", value: footerInfo }
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

              <div className="mt-6 pt-6 border-t border-slate-200">
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

            </div>
          </div>
        )}
      </div>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          if (currentPickingIndex !== null) {
            handleImageChange(currentPickingIndex, url);
          }
        }}
        title="Select Hero Image"
      />
    </AdminShell>
  );
}
