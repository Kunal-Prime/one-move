import { z } from 'zod';
import { moves } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  moves: {
    create: {
      method: 'POST' as const,
      path: '/api/moves',
      input: z.object({
        brainDump: z.string().min(1, "Please enter what's on your mind"),
      }),
      responses: {
        201: z.custom<typeof moves.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/moves/:id',
      responses: {
        200: z.custom<typeof moves.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    complete: {
      method: 'PATCH' as const,
      path: '/api/moves/:id/complete',
      responses: {
        200: z.custom<typeof moves.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type MoveInput = z.infer<typeof api.moves.create.input>;
