import { z } from "zod";

export const ProductBriefSchema = z.object({
  productName: z.string().min(1),
  category: z.string().min(1),
  targetAudience: z.string().min(1),
  painPoint: z.string().min(1),
  mainBenefit: z.string().min(1),
  tone: z.string().min(1),
  cta: z.string().min(1),
  sourceUrl: z.string().url()
});

export const CreativePreferencesSchema = z.object({
  tone: z.string().min(1),
  audience: z.string().min(1),
  goal: z.string().min(1),
  extraInstructions: z.array(z.string()).default([])
});
