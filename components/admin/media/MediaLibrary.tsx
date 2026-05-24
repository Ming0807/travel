"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { UploadSimple, Trash, WarningCircle, CheckCircle, Image as ImageIcon } from "@phosphor-icons/react";

export type MediaAsset = {
  id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  category: string;
  created_at: string;
  url: string;
};

const CATEGORIES = ["All", "General", "Homepage", "Badges", "Certificates", "Attractions"];

type MediaLibraryProps = {
  mode?: "manage" | "pick";
  onSelect?: (url: string) => void;
};

export function MediaLibrary({ mode = "manage", onSelect }: MediaLibraryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, [category]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media?category=${category}`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      } else {
        setError("Failed to fetch media assets");
      }
    } catch (err) {
      setError("An error occurred while fetching media");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Please upload JPEG, PNG, WebP or SVG.`);
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(`File is too large (max 10MB)`);
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category === "All" ? "General" : category);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAssets([data.asset, ...assets]);
      } else {
        const data = await res.json();
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Upload failed due to network error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent select trigger if in pick mode
    if (!confirm("Are you sure you want to delete this image? It might break pages where it's used.")) return;

    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAssets(assets.filter(a => a.id !== id));
      } else {
        alert("Failed to delete media");
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                category === c
                  ? "bg-ink text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {uploading ? (
               <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <UploadSimple size={18} weight="bold" />
            )}
            Upload Image
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-sm">
          <WarningCircle size={18} weight="fill" />
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal" />
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <ImageIcon size={48} weight="duotone" className="mb-3 text-slate-300" />
            <p>No media found in {category}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {assets.map((asset) => (
              <div 
                key={asset.id} 
                onClick={() => mode === "pick" && onSelect && onSelect(asset.url)}
                className={`group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
                  mode === "pick" ? "cursor-pointer hover:border-teal hover:ring-2 hover:ring-teal/20" : ""
                }`}
              >
                <div className="aspect-square relative bg-slate-100 flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.url}
                    alt={asset.file_name}
                    className="max-w-full max-h-full object-contain drop-shadow-sm rounded"
                  />
                  
                  {/* Overlay Actions */}
                  <div className={`absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 ${mode === "pick" ? "" : "backdrop-blur-sm"}`}>
                    {mode === "pick" ? (
                      <div className="bg-teal text-white rounded-full p-2 shadow-lg">
                        <CheckCircle size={24} weight="fill" />
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => window.open(asset.url, '_blank')}
                          className="bg-white/20 text-white hover:bg-white hover:text-ink p-2 rounded-full transition-colors"
                          title="View Original"
                        >
                          <ImageIcon size={18} weight="bold" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(asset.id, e)}
                          className="bg-red-500/80 text-white hover:bg-red-500 p-2 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash size={18} weight="bold" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 truncate" title={asset.file_name}>
                    {asset.file_name}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                    <span>{asset.category}</span>
                    <span>{formatSize(asset.size_bytes)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
