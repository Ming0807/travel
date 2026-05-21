import { z } from "zod";

export const localeSchema = z.enum(["th", "en"]).default("th");

export const checkinCodeSchema = z
  .string()
  .trim()
  .min(3)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/, "Check-in code must be URL-safe.");

export const displayNameSchema = z.string().trim().min(1).max(150);

export const uuidSchema = z.uuid();
