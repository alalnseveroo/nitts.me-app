
import type { Layout } from 'react-grid-layout';

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
};

export type CardData = {
  id: string;
  user_id: string;
  type: string;
  title: string | null;
  content: string | null; // Usado para 'note', ou 'description' para 'document'
  link: string | null; // Usado para 'link', ou 'payment_link' para 'document'
  background_image: string | null; // Usado para 'image', ou 'cover_image' para 'document'
  background_color?: string | null;
  text_color?: string | null;
  created_at: string;
  // Campos específicos para 'document'
  price?: string | null;
  original_file_path?: string | null;
  processed_file_path?: string | null;
  obscuration_settings?: {
    percentage: number;
  } | null;
};
