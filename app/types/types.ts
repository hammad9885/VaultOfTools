import { IconType } from "react-icons";
import { ComponentType } from "react";


export interface Category {
  icon: IconType;
  name: string;
  count: string;
  color: string;
}

export interface Tool {
  icon: ComponentType<{ size?: number; color?: string }>;
  iconBg: string;
  iconColor: string;
  name: string;
  tagline: string;
  desc: string;
  tags: string[];
  pricing: string;
  pricingClass: string;
  rating: number;
  reviews: string;
  updated: string;
  iconSize: number;
  sponsored: boolean;
  stars: number;
}

export interface TrendingItem {
  rank: number;
  icon: string;
  name: string;
  change: string;
  bg: string;
  up: boolean;
}

export interface QuickFilter {
  icon: string;
  label: string;
}

export interface Stat {
  num: string;
  lbl: string;
}
export interface PHProduct {
  rank: number;
  name: string;
  votes: number;
  tagline: string;
  thumbnail: string;
  website: string;
}