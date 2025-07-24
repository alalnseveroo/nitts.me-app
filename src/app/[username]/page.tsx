
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import type { Layout } from 'react-grid-layout';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import PublicProfileGrid from '@/components/ui/public-profile-grid';

export type CardData = {
    id: string;
    user_id: string;
    type: string;
    title: string | null;
    content: string | null;
    link: string | null;
    background_image: string | null;
    background_color?: string | null;
};

export type Profile = {
  id: string;
  username: string | null
  name: string | null
  bio: string | null
  avatar_url: string | null
  layout_config: Layout[] | null
}

async function fetchPageData(username: string) {
    const supabase = await createSupabaseServerClient();
    
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (profileError || !profileData) {
      return null;
    }
    
    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', profileData.id);

    return { profile: profileData as Profile, cards: (cardsData || []) as CardData[] };
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const pageUsername = params.username as string;
  const data = await fetchPageData(pageUsername);

  if (!data) {
    notFound();
  }

  const { profile, cards } = data;
  
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  const isOwner = user?.id === profile.id;

  if (isOwner) {
    redirect(`/${pageUsername}/edit`);
  }
  
  // RENDER PUBLIC VIEW
  return (
    <div className="w-full min-h-screen px-6 md:px-8 py-4 md:py-8 relative bg-background">
        <div className="grid grid-cols-12 md:gap-8">
            <header className="col-span-12 md:col-span-3 md:py-8">
                <div className="sticky top-8">
                    <Avatar className="w-32 h-32 mb-4">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-4xl font-bold">{profile?.name || `@${profile?.username}`}</h1>
                    <p className="text-muted-foreground mt-2">{profile?.bio}</p>
                </div>
            </header>

            <main className="col-span-12 md:col-span-9 mt-6 md:mt-0">
               <PublicProfileGrid cards={cards} layoutConfig={profile.layout_config} />
            </main>
        </div>
    </div>
  );
}
