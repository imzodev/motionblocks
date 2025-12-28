import { z } from "zod";
import type { ReactNode } from "react";

export interface RenderProps<T = Record<string, any>> {
  frame: number;
  duration: number;
  asset: ReactNode;
  props: T;
}

export type RenderComponent<T = Record<string, any>> = (
  props: RenderProps<T>
) => ReactNode;

export interface AnimationTemplate {
  id: string;
  name: string;
  propsSchema: z.ZodSchema<any>;
  render: RenderComponent<any>;
}
