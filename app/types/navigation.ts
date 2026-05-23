import { ReactNode } from "react";

export interface NavChildItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
  icon?: ReactNode;
  children?: NavChildItem[];
}