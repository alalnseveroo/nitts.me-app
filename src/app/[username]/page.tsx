'use client'

// Importações
import { useEffect, useState, ChangeEvent, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useToast } from "@/hooks/use-toast"

// Componentes UI
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Settings, LogOut, KeyRound, UserRound, Share, Upload, Loader2, Edit } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ElementCard } from '@/components/ui/element-card'
import Link from 'next/link'

// Tipos: Adicionando w e h aos cards
type Profile = { id: string; username: string | null; name: string | null; bio: string | null; avatar_url: string | null; }
type Card = { 
  id: string; 
  user_id: string; 
  type: string; 
  title: string | null; 
  url?: string | null; 
  content?: string | null; 
  background_image?: string | null;
  w: number; // Largura no grid
  h: number; // Altura no grid
}

export default function UnifiedUserPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
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
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('username', username).single();
      
      if (profileError || !profileData) { 
        setError('Usuário não encontrado.'); 
        setLoading(false); 
        return; 
      }
      setProfile(profileData);

      // Fetch cards for the profile
      const { data: cardsData } = await supabase.from('cards').select('*, w, h').eq('user_id', profileData.id);
      setCards(cardsData || []);
      
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Skeleton className="h-full w-full" /></div>;
  if (error) return <div className="flex flex-col justify-center items-center h-screen text-center p-4"><h1>{error}</h1> <Link href="/"><Button variant="link">Voltar para a página inicial</Button></Link></div>;

  // RENDERIZA A VISÃO PÚBLICA
  return (
    <main className="flex flex-col items-center min-h-screen bg-white p-4">
      {isOwner && (
        <div className="absolute top-4 right-4 flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Settings/></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel><DropdownMenuSeparator />
                <DropdownMenuItem disabled><UserRound className="mr-2 h-4 w-4"/><span>Alterar Usuário</span></DropdownMenuItem>
                <DropdownMenuItem disabled><KeyRound className="mr-2 h-4 w-4"/><span>Alterar Senha</span></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4"/><span>Sair</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild variant="outline">
              <Link href={`/${username}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Editar Página
              </Link>
            </Button>
        </div>
      )}
      <div className="w-full max-w-md mx-auto">
        <header className="flex flex-col items-center text-center py-8">
          <Avatar className="w-24 h-24 mb-4"><AvatarImage src={profile?.avatar_url || ''} /><AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback></Avatar>
          <h1 className="text-2xl font-bold">{profile?.name || `@${profile?.username}`}</h1>
          <p className="text-gray-500 mt-2">{profile?.bio}</p>
          <Button onClick={handleShare} variant="ghost" size="sm" className="mt-4"><Share className="mr-2 h-4 w-4" /> Compartilhar</Button>
        </header>
        <section className="space-y-4">
          {cards
            .sort((a, b) => a.position - b.position) // Assuming you add 'position' to cards
            .map(c => <ElementCard key={c.id} data={c} onUpdate={()=>{}} onDelete={()=>{}} isEditable={false} />)
          }
        </section>
      </div>
    </main>
  );
}
