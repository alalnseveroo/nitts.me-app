
import type { Layout } from 'react-grid-layout';

export type UserRole = 
  | 'free'
  | 'weekly'
  | 'monthly'
  | 'annual'
  | 'lifetime'
  | 'guest'
  | 'ambassador';

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
  role?: UserRole | null;
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
