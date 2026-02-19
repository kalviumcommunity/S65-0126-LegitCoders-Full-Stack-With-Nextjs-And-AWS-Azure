import { z } from 'zod';

// District Schemas
export const DistrictCreateSchema = z.object({
  name: z.string().min(1, 'District name is required'),
  state: z.string().min(1, 'State is required'),
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
});

export const DistrictQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

// Weather Data Schemas
export const WeatherDataCreateSchema = z.object({
  districtId: z.string().min(1, 'District ID is required'),
  rainfall: z.number().min(0, 'Rainfall cannot be negative'),
  temperature: z.number(),
  humidity: z.number().min(0).max(100, 'Humidity must be between 0-100'),
  windSpeed: z.number().min(0, 'Wind speed cannot be negative'),
  recordedAt: z.string().datetime(),
});

// Risk Assessment Schemas
export const RiskAssessmentSchema = z.object({
  districtId: z.string().min(1, 'District ID is required'),
});

// Alert Schemas
export const AlertQuerySchema = z.object({
  districtId: z.string().optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export const AlertDeactivateSchema = z.object({
  id: z.string().min(1, 'Alert ID is required'),
});

// Type exports
export type District = z.infer<typeof DistrictCreateSchema>;
export type WeatherData = z.infer<typeof WeatherDataCreateSchema>;
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;
export type Alert = z.infer<typeof AlertDeactivateSchema>;
