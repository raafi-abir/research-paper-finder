import { z } from "zod";

export const ResearchLevelEnum = z.enum([
  "UNDERGRADUATE",
  "GRADUATE",
  "PHD",
  "RESEARCHER",
  "PROFESSIONAL",
]);

export const DeliveryFrequencyEnum = z.enum([
  "EVERY_2_DAYS",
  "EVERY_3_DAYS",
  "WEEKLY",
]);

export const ProfileSubmissionSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Valid email is required"),
  academicField: z.string().min(1, "Academic field is required"),
  researchLevel: ResearchLevelEnum.default("GRADUATE"),
  researchContext: z.string().optional(),
  researchGoals: z.array(z.string()).optional(),
  deliveryFrequency: DeliveryFrequencyEnum.default("EVERY_3_DAYS"),
  papersPerDigest: z.number().int().min(1).max(20).default(5),
  interestSlugs: z.array(z.string()).min(1, "At least one interest topic must be selected"),
});

export type ProfileSubmissionPayload = z.infer<typeof ProfileSubmissionSchema>;
