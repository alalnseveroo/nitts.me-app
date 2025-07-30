
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import PublicProfileGrid from '@/components/ui/public-profile-grid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Profile, CardData } from '@/lib/types';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { FacebookPixel } from '@/components/analytics/FacebookPixel';
import { CreateUsernameButton } from '@/components/ui/create-username-button';


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
    
    // Log page view
    await supabase.from('page_views').insert({ profile_id: profileData.id });

    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', profileData.id);

    return { profile: profileData as Profile, cards: (cardsData || []) as CardData[] };
}

export default async function PublicProfilePage({ params, searchParams }: { params: { username: string }, searchParams?: { [key: string]: string | string[] | undefined } }) {
  const pageUsername = params.username as string;
  const source = searchParams?.ref as string | undefined;

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
    <>
      {profile.ga_tracking_id && <GoogleAnalytics gaId={profile.ga_tracking_id} />}
      {profile.fb_pixel_id && <FacebookPixel pixelId={profile.fb_pixel_id} />}
      <div className="w-full min-h-screen px-6 md:px-8 py-4 md:py-8 relative bg-background flex flex-col">
          <div className="grid grid-cols-12 md:gap-8 flex-1">
              <header className="col-span-12 md:col-span-3 md:py-8">
                  <div className="sticky top-8">
                      <Avatar className="w-32 h-32 mb-4">
                          <AvatarImage src={profile?.avatar_url || ''} />
                          <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h1 className="text-4xl font-bold">{profile?.name || `@${profile?.username}`}</h1>
                      <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{profile?.bio}</p>
                  </div>
              </header>

              <main className="col-span-12 md:col-span-9 mt-6 md:mt-0">
                <PublicProfileGrid cards={cards} layoutConfig={profile.layout_config} source={source} />
              </main>
          </div>
          <footer className="w-full flex justify-center py-8 mt-auto">
            <CreateUsernameButton />
          </footer>
      </div>
    </>
  );
}
