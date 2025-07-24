import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Layout } from 'react-grid-layout';

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Share, Edit } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ElementCard } from '@/components/ui/element-card'
import Link from 'next/link'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const ResponsiveGridLayout = WidthProvider(Responsive);

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
    const supabase = createSupabaseServerClient();
    
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
  
  const savedLayout = profile.layout_config || [];
  const layoutMap = new Map(savedLayout.map(l => [l.i, l]));

  const finalLayout = cards.map((card, index) => {
      const existingLayout = layoutMap.get(card.id);
      const cols = 4; // Assuming desktop view default for server render
      const mobileCols = 2;

      if (existingLayout) {
          return {
              ...existingLayout,
              i: String(existingLayout.i), 
              x: existingLayout.x ?? 0,
              y: existingLayout.y ?? index,
              w: existingLayout.w ?? (card.type === 'title' ? cols : 1),
              h: existingLayout.h ?? (card.type === 'title' ? 0.5 : 1),
          };
      }
      return { 
          i: card.id, 
          x: (index % cols), 
          y: Math.floor(index / cols), 
          w: card.type === 'title' ? cols : 1, 
          h: card.type === 'title' ? 0.5 : 1 
      };
  });
  
  const supabaseAuth = createSupabaseServerClient();
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
                {cards.length > 0 ? (
                <ResponsiveGridLayout
                    layouts={{ lg: finalLayout, sm: finalLayout }}
                    breakpoints={{ lg: 768, sm: 0 }}
                    cols={{ lg: 4, sm: 2 }}
                    rowHeight={100} // A static rowHeight is better for SSR
                    isDraggable={false}
                    isResizable={false}
                    compactType="vertical"
                    margin={[10, 10]}
                    containerPadding={[0, 0]}
                    className="min-h-[400px]"
                >
                    {cards.map(card => {
                        const layout = finalLayout.find(l => l.i === card.id) || {x:0, y:0, w:1, h:1, i: card.id };
                        return (
                            <div key={card.id} data-grid={layout}>
                                <ElementCard data={card} />
                            </div>
                        )
                    })}
                </ResponsiveGridLayout>
                ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">
                          Este perfil ainda não tem cards.
                        </p>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
}
