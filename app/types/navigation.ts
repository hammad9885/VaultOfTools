import type { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
  icon?: ReactNode;
  children?: NavItem[];
}
