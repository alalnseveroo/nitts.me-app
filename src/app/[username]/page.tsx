
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
import { Settings, Share, Upload, Loader2, LogOut, KeyRound, UserRound } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from '@/components/ui/skeleton'
import GridLayoutComponent from '@/components/ui/grid-layout'
import { EditCardSheet } from '@/components/ui/edit-card-sheet'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { useIsMobile } from '@/hooks/use-mobile'
import { ElementCard } from '@/components/ui/element-card'

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

const AddLinkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.5 8.5C14.5 7.67157 13.8284 7 13 7H9C8.17157 7 7.5 7.67157 7.5 8.5V8.5C7.5 9.32843 8.17157 10 9 10H10.5M9.5 15.5C9.5 16.3284 10.1716 17 11 17H15C15.8284 17 16.5 16.3284 16.5 15.5V15.5C16.5 14.6716 15.8284 14 15 14H13.5" stroke="#18181B" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 12L12 12C10.8954 12 10 12.8954 10 14V15.5M14 8.5V10C14 11.1046 13.1046 12 12 12" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const AddImageIcon = () => (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="url(#paint0_linear_1_2)"/>
        <path d="M22 19L18.4354 15.4354C17.6543 14.6543 16.388 14.6331 15.5804 15.3908L12 18.5M10 20L11.7528 18.2472C12.553 17.447 13.8198 17.4191 14.655 18.1925L16.5 19.8333" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12.5" cy="12.5" r="2.5" fill="white"/>
        <defs>
        <linearGradient id="paint0_linear_1_2" x1="16" y1="0" x2="16" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5A623"/>
        <stop offset="1" stopColor="#D0021B"/>
        </linearGradient>
        </defs>
    </svg>
);
const AddTitleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M8.25 6C8.25 5.58579 8.58579 5.25 9 5.25H15C15.4142 5.25 15.75 5.58579 15.75 6V6.75H18.75V8.25H5.25V6.75H8.25V6ZM14.25 6.75H9.75V6.75H14.25V6.75Z" fill="#18181B"/>
        <path d="M6.75 9.75V18.75H17.25V9.75H6.75Z" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>

);
const AddNoteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#50E3C2"/>
        <path d="M12 13H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 18H18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);
const AddMapIcon = () => (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#4A90E2"/>
        <path d="M22 10C22 12.2091 20.2091 14 18 14C15.7909 14 14 12.2091 14 10C14 7.79086 15.7909 6 18 6C20.2091 6 22 7.79086 22 10Z" fill="white"/>
        <path d="M14.25 25L18 14L21.75 25C19.9167 26.3333 16.0833 26.3333 14.25 25Z" fill="#7ED321"/>
        <path d="M6 20C9.33333 18.3333 14.4 20.6 18 14L14.25 25C11.4 24.2 8.33333 22 6 20Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 14C21.6 17.2 24 16.5 26 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


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
  const [rowHeight, setRowHeight] = useState(100);
  const [editingCard, setEditingCard] = useState<CardData | undefined>(undefined);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isCardMenuOpen, setIsCardMenuOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast();
  const pageUsername = params.username as string
  const isMobile = useIsMobile();

  const updateRowHeight = useCallback(() => {
    if (typeof window === 'undefined') return;
    const container = document.querySelector('.react-grid-layout');
    if (!container) return;

    const containerWidth = container.clientWidth;
    const cols = isMobile ? 2 : 4;
    const margin: [number, number] = [10, 10];
    const calculatedRowHeight = (containerWidth - (margin[0] * (cols + 1))) / cols;
    
    setRowHeight(calculatedRowHeight > 0 ? calculatedRowHeight : 100);
  }, [isMobile]);

  const handleSelectCard = useCallback((cardId: string) => {
    if (isMobile) {
      setSelectedCardId(prevId => (prevId === cardId ? null : cardId));
    }
  }, [isMobile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-card-id]')) {
            setSelectedCardId(null);
        }
    };
    if (isMobile) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [profile?.bio, adjustTextareaHeight]);


  useEffect(() => {
    const timer = setTimeout(() => {
        updateRowHeight();
    }, 100);
    window.addEventListener('resize', updateRowHeight);
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateRowHeight);
    };
  }, [updateRowHeight]);


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
            const cols = isMobile ? 2 : 4;

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
            return { i: card.id, x: (index % cols), y: Math.floor(index / cols), w: card.type === 'title' ? cols : 1, h: card.type === 'title' ? 0.5 : 1 };
        });
        setCurrentLayout(finalLayout);
    }
    
    setIsOwner(currentUser?.id === profileData.id);
    setLoading(false);
    setTimeout(updateRowHeight, 100);

  }, [pageUsername, isMobile, updateRowHeight]);

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
  
  const handleUpdateCard = useCallback((id: string, updates: Partial<CardData>) => {
    setCards(currentCards => 
        currentCards.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const handleSaveChanges = async () => {
    if (!user || !profile) return
    setSaving(true);
    
    const validLayout = currentLayout.map(l => ({
        ...l, x: l.x ?? 0, y: l.y ?? 0, w: l.w ?? 1, h: l.h ?? 1,
    }));

    // Upsert all cards at once
    const { error: cardsError } = await supabase.from('cards').upsert(cards);
    
    // Update profile with layout
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ name: profile.name, bio: profile.bio, layout_config: validLayout })
      .eq('id', user.id);
      
    setSaving(false);
    if (profileError || cardsError) {
      toast({ title: 'Erro', description: `Erro ao salvar: ${profileError?.message || cardsError?.message}`, variant: 'destructive' });
      console.error(profileError || cardsError);
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
    
    const cols = isMobile ? 2 : 4;
    const w = type === 'title' ? cols : 1;
    const h = type === 'title' ? 0.5 : 1;

    const finalData: Omit<CardData, 'id' | 'user_id'> & { user_id: string } = {
        user_id: user.id,
        type: type,
        title: ``,
        content: null,
        link: null,
        background_image: null,
        ...extraData
    };
    if (type === 'title') {
      finalData.title = 'Novo Título';
    }
    if (type === 'link') {
      finalData.title = 'Novo Link';
    }
    if (type === 'note') {
      finalData.background_color = '#FFFFFF';
    }


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

  const handleDeleteCard = useCallback(async (cardId: string) => {
    if (!user) return;

    const { error } = await supabase.from('cards').delete().eq('id', cardId);

    if (error) {
        toast({ title: 'Erro', description: 'Não foi possível deletar o card.', variant: 'destructive' });
        console.error("Error deleting card:", error);
        return;
    }

    setCards(prev => prev.filter(c => c.id !== cardId));
    setCurrentLayout(prev => prev.filter(l => l.i !== cardId));
    toast({ title: 'Sucesso', description: 'Card deletado.' });

  }, [user, toast]);

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

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setCurrentLayout(newLayout);
  }, []);
  
  const handleResizeCard = useCallback((cardId: string, w: number, h: number) => {
      setCurrentLayout(prevLayout => {
          return prevLayout.map(item => {
              if (item.i === cardId) {
                  return { ...item, w, h };
              }
              return item;
          });
      });
  }, []);

  const handleEditCard = useCallback((cardId: string) => {
      setEditingCard(cards.find(c => c.id === cardId));
      setIsEditSheetOpen(true);
  }, [cards]);


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
            
            <div className="grid grid-cols-12 md:gap-8 flex-1 px-6 md:px-8 py-4">
                <aside className="col-span-12 md:col-span-3 md:py-8">
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
                          ref={textareaRef}
                          className="text-muted-foreground mt-2 border-none focus:ring-0 shadow-none resize-none p-0 bg-transparent overflow-hidden"
                          value={profile?.bio || ''}
                          onChange={(e) => {
                            setProfile(p => p ? { ...p, bio: e.target.value } : null)
                            adjustTextareaHeight();
                          }}
                          placeholder="Sua biografia..."
                          rows={1}
                        />
                    </div>
                </aside>

                <main className="col-span-12 md:col-span-9 mb-24 md:mb-0 mt-6 md:mt-0">
                    {user && (
                    <GridLayoutComponent
                        cards={cards}
                        layoutConfig={currentLayout}
                        onLayoutChange={handleLayoutChange}
                        onUpdateCard={handleUpdateCard}
                        onDeleteCard={handleDeleteCard}
                        onResizeCard={handleResizeCard}
                        onEditCard={handleEditCard}
                        onMenuStateChange={setIsCardMenuOpen}
                        isMobile={isMobile}
                        selectedCardId={selectedCardId}
                        onSelectCard={handleSelectCard}
                        rowHeight={rowHeight}
                    />
                    )}
                </main>
            </div>

            {!isCardMenuOpen && (
              <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-auto p-4 z-50">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border flex justify-around items-center p-1 gap-1">
                      <Button title="Adicionar Link" variant="ghost" size="icon" onClick={() => addNewCard('link')}><AddLinkIcon /></Button>
                      <Button title="Adicionar Imagem" variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()} disabled={isUploadingImage}>
                          {isUploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <AddImageIcon />}
                      </Button>
                      <Button title="Adicionar Nota" variant="ghost" size="icon" onClick={() => addNewCard('note')}><AddNoteIcon /></Button>
                      <Button title="Adicionar Mapa" variant="ghost" size="icon" onClick={() => addNewCard('map')}><AddMapIcon /></Button>
                      <Button title="Adicionar Título" variant="ghost" size="icon" onClick={() => addNewCard('title')}><AddTitleIcon /></Button>
                  </div>
              </footer>
            )}
            
            <EditCardSheet
                isOpen={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
                card={editingCard}
                onUpdate={handleUpdateCard}
            />
        </div>
    )
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
                     <Button onClick={handleShare} variant="ghost" size="sm" className="mt-4 -ml-4"><Share className="mr-2 h-4 w-4" /> Compartilhar</Button>
                </div>
            </header>

            <main className="col-span-12 md:col-span-9 mt-6 md:mt-0">
                {cards.length > 0 ? (
                <ResponsiveGridLayout
                    layouts={{ lg: currentLayout, sm: currentLayout }}
                    breakpoints={{ lg: 768, sm: 0 }}
                    cols={{ lg: 4, sm: 2 }}
                    rowHeight={rowHeight}
                    isDraggable={false}
                    isResizable={false}
                    compactType="vertical"
                    margin={[10, 10]}
                    containerPadding={[0, 0]}
                    className="min-h-[400px]"
                >
                    {cards.map(card => {
                        const layout = currentLayout.find(l => l.i === card.id) || {x:0, y:0, w:1, h:1, i: card.id };
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

    