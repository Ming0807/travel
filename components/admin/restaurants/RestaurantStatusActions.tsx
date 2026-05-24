"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeSlash, CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";

import {
  toggleRestaurantPublishAction,
  toggleRestaurantActiveAction,
} from "@/app/actions/admin-restaurant-actions";

type RestaurantStatusActionsProps = {
  restaurantId: number;
  isPublished: boolean;
  isActive: boolean;
};

export function RestaurantStatusActions({ restaurantId, isPublished, isActive }: RestaurantStatusActionsProps) {
  const router = useRouter();

  const handlePublishToggle = async () => {
    const result = await toggleRestaurantPublishAction(restaurantId);
    if (result.success) router.refresh();
  };

  const handleActiveToggle = async () => {
    const result = await toggleRestaurantActiveAction(restaurantId);
    if (result.success) router.refresh();
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handlePublishToggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition"
        title={isPublished ? "Unpublish" : "Publish"}
      >
        {isPublished ? <Eye size={16} weight="fill" /> : <EyeSlash size={16} weight="fill" />}
      </button>
      <button
        onClick={handleActiveToggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-green-600 transition"
        title={isActive ? "Deactivate" : "Activate"}
      >
        {isActive ? <CheckCircle size={16} weight="fill" /> : <XCircle size={16} weight="fill" />}
      </button>
    </div>
  );
}
