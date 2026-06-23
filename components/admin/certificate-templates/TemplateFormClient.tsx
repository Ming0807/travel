"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, UploadSimple, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

export function TemplateFormClient() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/admin/templates/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to upload template");
      }

      await response.json();
      
      // Need a server action to save the template record
      // Currently simulating success:
      router.push("/admin/certificate-templates");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload template");
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link 
          href="/admin/certificate-templates"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft weight="bold" />
          Back to Templates
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Add New Template</h2>
          <p className="text-sm text-slate-500">Upload a background image and configure layout.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              name="template_name"
              required
              className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g., Summer Campaign 2026"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Language
              </label>
              <select
                name="language"
                className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="th">Thai</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Theme Color
              </label>
              <select
                name="theme"
                className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="emerald-gold">Emerald & Gold</option>
                <option value="blue-silver">Blue & Silver</option>
                <option value="coral-white">Coral & White</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Background Image (A4 Landscape, High-Res)
            </label>
            <div className="relative flex justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-10 hover:border-indigo-400 transition-colors bg-slate-50">
              <div className="text-center">
                {previewUrl ? (
                  <div className="relative mb-4 aspect-[1.414/1] w-full max-w-sm mx-auto overflow-hidden rounded-lg shadow-sm border border-slate-200">
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <ImageIcon className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                )}
                <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 px-2 py-1"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      required
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1 py-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-slate-500">PNG, JPG, or WebP up to 10MB. The system optimizes it before saving.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isUploading ? (
                <>Processing...</>
              ) : (
                <>
                  <UploadSimple weight="bold" />
                  Save Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
