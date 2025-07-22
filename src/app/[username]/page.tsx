'use client'

// Importações
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useToast } from "@/hooks/use-toast"
import { WidthProvider, Responsive, Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Componentes UI
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Share, Edit } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ElementCard } from '@/components/ui/element-card'
import Link from 'next/link'

const ResponsiveGridLayout = WidthProvider(Responsive);

// Tipos
type Profile = { 
  id: string; 
  username: string | null; 
  name: string | null; 
  bio: string | null; 
  avatar_url: string | null; 
  layout_config: Layout[] | null;
}

type Card = { 
  id: string; 
  user_id: string; 
  type: string; 
  title: string | null; 
  link?: string | null; 
  content?: string | null; 
  background_image?: string | null;
}

export default function UnifiedUserPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [layout, setLayout] = useState<Layout[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const username = params.username as string;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Fetch profile data based on username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*, layout_config')
        .eq('username', username)
        .single();
      
      if (profileError || !profileData) { 
        setError('Usuário não encontrado.'); 
        setLoading(false); 
        return; 
      }
      setProfile(profileData);
      
      // Fetch cards for the profile
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', profileData.id);
      
      if (cardsError) {
        setCards([]);
      } else {
        setCards(cardsData || []);
      }

      // Initialize layout from profile or create default
      const finalLayout = (cardsData || []).map(card => {
        const existingLayout = profileData.layout_config?.find(l => l.i === card.id);
        if (existingLayout) return existingLayout;
        return { i: card.id, x: 0, y: 0, w: 1, h: 2 }; // Default size
      });
      setLayout(finalLayout);
      
      // Check if the current user is the owner of the profile
      const { data: { session } } = await supabase.auth.getSession();
      setIsOwner(session?.user?.id === profileData.id);

      setLoading(false);
    };
    if (username) fetchData();
  }, [username]);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${username}`);
    toast({ title: "Link Copiado!", description: "O link para sua página foi copiado." });
  };

  if (loading) return (
    <div className="w-full min-h-screen p-8">
        <div className="grid grid-cols-12 gap-6">
            <aside className="col-span-12 md:col-span-3 py-8">
                 <div className="sticky top-8">
                    <Skeleton className="h-32 w-32 rounded-full mb-4" />
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-8 w-32 mt-4" />
                </div>
            </aside>
            <main className="col-span-12 md:col-span-9">
                <Skeleton className="h-[600px] w-full" />
            </main>
        </div>
    </div>
  );
  if (error) return <div className="flex flex-col justify-center items-center h-screen text-center p-4"><h1>{error}</h1> <Link href="/"><Button variant="link">Voltar para a página inicial</Button></Link></div>;

  return (
    <div className="w-full min-h-screen p-8 relative">
        {isOwner && (
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <Button asChild variant="default" className="bg-primary text-primary-foreground">
                <Link href={`/${username}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Editar Página
                </Link>
                </Button>
            </div>
        )}
        <div className="grid grid-cols-12 gap-8">
            <header className="col-span-12 md:col-span-3 py-8">
                <div className="sticky top-8">
                    <Avatar className="w-32 h-32 mb-4">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-4xl font-bold">{profile?.name || `@${profile?.username}`}</h1>
                    <p className="text-muted-foreground mt-2">{profile?.bio}</p>
                     <Button onClick={handleShare} variant="ghost" size="sm" className="mt-4 -ml-4"><Share className="mr-2 h-4 w-4" /> Compartilhar</Button>
                </div>
            </header>

            <main className="col-span-12 md:col-span-9">
                {cards.length > 0 ? (
                <ResponsiveGridLayout
                    layouts={{ lg: layout }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
                    rowHeight={100}
                    isDraggable={false}
                    isResizable={false}
                    compactType="vertical"
                    margin={[20, 20]}
                    containerPadding={[0, 0]}
                >
                    {cards.map(card => (
                        <div key={card.id} data-grid={layout.find(l => l.i === card.id)}>
                            <ElementCard data={card} />
                        </div>
                    ))}
                </ResponsiveGridLayout>
                ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">
                          {isOwner ? "Seu canvas está vazio. Adicione alguns cards!" : "Este perfil ainda não tem cards."}
                        </p>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
}
