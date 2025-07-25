
import type { Layout } from 'react-grid-layout';

export type Profile = {
  id: string;
  username: string | null;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  layout_config: Layout[] | null;
  show_analytics?: boolean | null;
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
  release_at?: string | null;
  expires_at?: string | null;
};

