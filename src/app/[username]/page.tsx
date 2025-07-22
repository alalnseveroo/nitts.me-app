
'use client'

import { useEffect, useState, ChangeEvent, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Layout } from 'react-grid-layout';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, Share, Upload, Loader2, LogOut, KeyRound, UserRound, ArrowLeft, Image as ImageIcon, Type, Link as LinkIcon, Map as MapIcon, StickyNote, Edit } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from '@/components/ui/skeleton'
import GridLayoutComponent from '@/components/ui/grid-layout'
import { ElementCard } from '@/components/ui/element-card'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { Responsive, WidthProvider } from 'react-grid-layout'

const ResponsiveGridLayout = WidthProvider(Responsive);

type Profile = {
  id: string;
  username: string | null
  name: string | null
  bio: string | null
  avatar_url: string | null
  layout_config: Layout[] | null
}

type CardData = {
    id: string;
    user_id: string;
    type: string;
    title: string | null;
    content: string | null;
    link: string | null;
    background_image: string | null;
};

export default function UnifiedUserPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentLayout, setCurrentLayout] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast();
  const pageUsername = params.username as string

  const fetchPageData = useCallback(async (currentUser: User | null) => {
    setLoading(true);
    setError(null);

    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', pageUsername)
        .single();

    if (profileError || !profileData) {
      setError('Usuário não encontrado.');
      setLoading(false);
      return;
    }

    setProfile(profileData as Profile);

    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', profileData.id);

    if (cardsError) {
        console.error('Error fetching cards:', cardsError);
        setCards([]);
        setCurrentLayout([]);
    } else {
        const fetchedCards = cardsData || [];
        setCards(fetchedCards);

        const savedLayout = profileData.layout_config || [];
        const layoutMap = new Map(savedLayout.map(l => [l.i, l]));
        
        const finalLayout = fetchedCards.map((card, index) => {
            const existingLayout = layoutMap.get(card.id);
            if (existingLayout) {
                return {
                    i: String(existingLayout.i),
                    x: existingLayout.x ?? 0,
                    y: existingLayout.y ?? index, // Fallback y
                    w: existingLayout.w ?? 1,
                    h: existingLayout.h ?? 2,
                };
            }
            // Fallback for cards without a layout
            return { i: card.id, x: 0, y: index, w: 1, h: 2 };
        });
        setCurrentLayout(finalLayout);
    }
    
    setIsOwner(currentUser?.id === profileData.id);
    setLoading(false);

  }, [pageUsername]);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      await fetchPageData(session?.user ?? null);
    }
    fetchSessionAndProfile()
  }, [fetchPageData])

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOwner(false); 
    router.push(`/${pageUsername}`);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/${pageUsername}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copiado!", description: "A URL do seu perfil foi copiada para a área de transferência." });
  };

  const handleSaveChanges = async () => {
    if (!user || !profile) return
    setSaving(true);

    const profileUpdates = {
      name: profile.name,
      bio: profile.bio,
      layout_config: currentLayout,
    };

    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)
    
    setSaving(false);
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar as alterações.', variant: 'destructive' });
      console.error(error);
    } else {
      toast({ title: 'Sucesso', description: 'Alterações salvas com sucesso!' });
    }
  }

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return

    const file = event.target.files[0]
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${fileExt}`

    try {
        setUploading(true)
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
        const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
        if (updateError) throw updateError

        if (profile) setProfile({ ...profile, avatar_url: publicUrl })
        toast({ title: 'Sucesso', description: 'Avatar atualizado!' });
    } catch (error) {
        toast({ title: 'Erro', description: 'Erro ao fazer upload do avatar.', variant: 'destructive'});
        console.error(error);
    } finally {
        setUploading(false)
    }
  }
  
  const getNextY = (layout: Layout[]): number => {
    if (!layout || layout.length === 0) {
        return 0;
    }
    return layout.reduce((maxY, item) => Math.max(maxY, (item.y ?? 0) + (item.h ?? 0)), 0);
  };

  const addNewCard = async (type: string, extraData: Record<string, any> = {}) => {
    if (!user) return;
    
    const w = 1, h = 2; 

    const finalData = {
        user_id: user.id,
        type: type,
        title: ``,
        ...extraData
    };
    if (type === 'title') finalData.title = 'Novo Título';
    if (type === 'link') finalData.title = 'Novo Link';

    const { data: newCard, error } = await supabase.from('cards').insert(finalData).select().single();

    if(error || !newCard) {
        toast({ title: 'Erro', description: 'Erro ao criar novo card.', variant: 'destructive'});
        console.error('Card creation error:', error);
        return;
    }
    
    const newLayoutItem: Layout = { 
      i: newCard.id, 
      x: 0, 
      y: getNextY(currentLayout), 
      w, 
      h 
    };

    setCards(currentCards => [...currentCards, newCard]);
    setCurrentLayout(currentLayout => [...currentLayout, newLayoutItem]);

    toast({ title: 'Sucesso', description: 'Card adicionado!' });
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!user) return;
    const { error } = await supabase.from('cards').delete().eq('id', cardId);
    if (error) {
        toast({ title: 'Erro', description: 'Não foi possível deletar o card.', variant: 'destructive' });
        console.error("Error deleting card:", error);
    } else {
        setCards(prev => prev.filter(c => c.id !== cardId));
        setCurrentLayout(prev => prev.filter(l => l.i !== cardId));
        toast({ title: 'Sucesso', description: 'Card deletado.' });
    }
  };

  const handleImageFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
        return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    try {
        setIsUploadingImage(true);
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        
        await addNewCard('image', { background_image: publicUrl, title: '' });
    } catch (error) {
        toast({ title: 'Erro', description: 'Falha no upload da imagem.', variant: 'destructive' });
        console.error(error);
    } finally {
        setIsUploadingImage(false);
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    }
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    setCurrentLayout(newLayout);
  };
  
  const handleResizeCard = (cardId: string, w: number, h: number) => {
      setCurrentLayout(prevLayout => {
          return prevLayout.map(item => {
              if (item.i === cardId) {
                  return { ...item, w, h };
              }
              return item;
          });
      });
  };

  if (loading) {
    return (
     <div className="w-full min-h-screen p-8 bg-background">
        <div className="grid grid-cols-12 gap-8">
            <aside className="col-span-12 md:col-span-3 py-8">
                 <div className="sticky top-8">
                    <Skeleton className="h-32 w-32 rounded-full mb-4" />
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </aside>
            <main className="col-span-12 md:col-span-9">
                <Skeleton className="h-[600px] w-full" />
            </main>
        </div>
      </div>
    )
  }

  if (error) return <div className="flex flex-col justify-center items-center h-screen text-center p-4"><h1>{error}</h1> <Link href="/"><Button variant="link">Voltar para a página inicial</Button></Link></div>;

  // RENDER EDIT MODE
  if (isOwner) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageFileSelected}
                className="hidden"
                accept="image/*"
            />

            <header className="flex justify-between items-center p-4 sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                <div className="flex items-center space-x-2">
                     <Button onClick={handleShare} variant="ghost"><Share className="mr-2 h-4 w-4" /> Compartilhar</Button>
                </div>

                <div className="flex items-center space-x-2">
                <Button onClick={handleSaveChanges} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Salvar Alterações
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Settings/></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Opções</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled><UserRound className="mr-2 h-4 w-4"/><span>Alterar Usuário</span></DropdownMenuItem>
                    <DropdownMenuItem disabled><KeyRound className="mr-2 h-4 w-4"/><span>Alterar Senha</span></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4"/><span>Sair</span></DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
            </header>
            
            <div className="grid grid-cols-12 gap-8 flex-1 p-8">
                <aside className="col-span-12 md:col-span-3 py-8">
                    <div className="sticky top-24">
                        <div className="relative mb-4 w-32 h-32">
                            <Avatar className="w-32 h-32 text-lg">
                                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || 'avatar'} />
                                <AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-all">
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            </label>
                            <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading}/>
                        </div>
                        <Input
                        className="text-4xl font-bold border-none focus:ring-0 shadow-none p-0 h-auto mb-2 bg-transparent"
                        value={profile?.name || ''}
                        onChange={(e) => setProfile(p => p ? { ...p, name: e.target.value } : null)}
                        placeholder="Seu Nome"
                        />
                        <Textarea
                        className="text-muted-foreground mt-2 border-none focus:ring-0 shadow-none resize-none p-0 bg-transparent"
                        value={profile?.bio || ''}
                        onChange={(e) => setProfile(p => p ? { ...p, bio: e.target.value } : null)}
                        placeholder="Sua biografia..."
                        rows={5}
                        />
                    </div>
                </aside>

                <main className="col-span-12 md:col-span-9 mb-24">
                    {user && cards.length > 0 && currentLayout.length > 0 && (
                    <GridLayoutComponent
                        cards={cards}
                        layoutConfig={currentLayout}
                        onLayoutChange={handleLayoutChange}
                        onDeleteCard={handleDeleteCard}
                        onResizeCard={handleResizeCard}
                    />
                    )}
                     {user && cards.length === 0 && (
                        <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Seu canvas está vazio. Adicione um card abaixo!</p>
                        </div>
                    )}
                </main>
            </div>

            <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-auto p-4 z-50">
                <div className="bg-card/90 backdrop-blur-sm rounded-full shadow-lg border flex justify-around items-center p-2 gap-2">
                    <Button title="Adicionar Imagem" variant="ghost" size="icon" className="rounded-full" onClick={() => imageInputRef.current?.click()} disabled={isUploadingImage}>
                        {isUploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon />}
                    </Button>
                    <Button title="Adicionar Título" variant="ghost" size="icon" className="rounded-full" onClick={() => addNewCard('title')}><Type /></Button>
                    <Button title="Adicionar Nota" variant="ghost" size="icon" className="rounded-full" onClick={() => addNewCard('note')}><StickyNote /></Button>
                    <Button title="Adicionar Link" variant="ghost" size="icon" className="rounded-full" onClick={() => addNewCard('link')}><LinkIcon /></Button>
                    <Button title="Adicionar Mapa" variant="ghost" size="icon" className="rounded-full" onClick={() => addNewCard('map')}><MapIcon /></Button>
                </div>
            </footer>
        </div>
    )
  }

  // RENDER PUBLIC VIEW
  return (
    <div className="w-full min-h-screen p-8 relative bg-background">
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
                    layouts={{ lg: currentLayout }}
                    breakpoints={{ lg: 768, md: 768, sm: 0 }}
                    cols={{ lg: 4, md: 4, sm: 1 }}
                    rowHeight={100}
                    isDraggable={false}
                    isResizable={false}
                    compactType="vertical"
                    margin={[20, 20]}
                    containerPadding={[0, 0]}
                    className="min-h-[400px]"
                >
                    {cards.map(card => {
                        const layout = currentLayout.find(l => l.i === card.id) || {x:0, y:0, w:1, h:2, i: card.id };
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
                          {isOwner ? "Seu canvas está vazio. Adicione alguns cards!" : "Este perfil ainda não tem cards."}
                        </p>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
}

    