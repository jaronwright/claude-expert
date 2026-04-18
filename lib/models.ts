export const MODELS = {
  opus: {
    id: "claude-opus-4-7",
    label: "Claude Opus 4.7",
    description: "Flagship — deepest reasoning, 1M context",
  },
  sonnet: {
    id: "claude-sonnet-4-6",
    label: "Claude Sonnet 4.6",
    description: "Balanced — fast, very capable",
  },
  haiku: {
    id: "claude-haiku-4-5-20251001",
    label: "Claude Haiku 4.5",
    description: "Fastest, cheapest — great for simple questions",
  },
} as const;

export type ModelKey = keyof typeof MODELS;

export const DEFAULT_MODEL: ModelKey = "opus";

export const ALLOWED_MODEL_IDS = new Set<string>(
  Object.values(MODELS).map((m) => m.id),
);

export function resolveModelId(input: string | null | undefined): string {
  if (input && ALLOWED_MODEL_IDS.has(input)) return input;
  return MODELS[DEFAULT_MODEL].id;
}
