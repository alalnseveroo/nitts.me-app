
import type { Layout } from 'react-grid-layout';

export type UserRole = 
  | 'free'
  | 'weekly'
  | 'monthly'
  | 'annual'
  | 'lifetime'
  | 'guest'
  | 'ambassador'
  | null;

export type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'past_due'
  | 'canceled'
  | null;

export type Profile = {
  id: string;
  username: string | null;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  layout_config: Layout[] | null;
  show_analytics: boolean | null;
  fb_pixel_id?: string | null;
  ga_tracking_id?: string | null;
  role?: UserRole;
  subscription_status?: SubscriptionStatus;
  subscription_ends_at?: string | null; // ISO 8601 date string
};

export type CardData = {
  id: string;
  user_id: string;
  type: string;
  title: string | null;
  content: string | null;
  link: string | null;
  background_image: string | null;
  background_color?: string | null;
  text_color?: string | null;
  created_at: string;
};
