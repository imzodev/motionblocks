import { z } from "zod";
import type { ReactNode } from "react";

export type SlotType = "file" | "text" | "number" | "data-table" | "color";

export interface TemplateSlot {
  id: string;
  name: string;
  type: SlotType;
  description?: string;
  required?: boolean;
}

export interface RenderProps<T = unknown> {
  frame: number;
  duration: number;
  assets: Record<string, unknown>; // Mapped by slot ID
  props: T;
}

export type RenderComponent<T = unknown> = (
  props: RenderProps<T>
) => ReactNode;

export interface AnimationTemplate {
  id: string;
  name: string;
  slots: TemplateSlot[];
  propsSchema: z.ZodType<unknown>;
  render: RenderComponent<unknown>;
}