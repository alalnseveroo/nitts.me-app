
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
import { Settings, Share, Upload, Loader2, LogOut, KeyRound, UserRound, Eye, Link as LinkIcon, ImageIcon, StickyNote, Map as MapIcon, Type } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from '@/components/ui/skeleton'
import GridLayoutComponent from '@/components/ui/grid-layout'
import { EditCardSheet } from '@/components/ui/edit-card-sheet'
import { CardEditControls } from '@/components/ui/card-edit-controls'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useIsMobile } from '@/hooks/use-mobile'
import { CardResizeControls } from '@/components/ui/card-resize-controls'
import { useDebounce } from '@/hooks/use-debounce'
import type { Profile as ProfileType, CardData } from '@/lib/types';
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import AnalyticsCard from '@/components/ui/analytics-card'

export default function EditUserPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentLayout, setCurrentLayout] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowHeight, setRowHeight] = useState(100);
  const [editingCard, setEditingCard] = useState<CardData | undefined>(undefined);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [viewCount, setViewCount] = useState<number | null>(null)
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'today' | '7d' | '30d'>('7d')
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast();
  const pageUsername = params.username as string
  const isMobile = useIsMobile();
  const isInitialMount = useRef(true);

  const debouncedProfile = useDebounce(profile, 500);
  const debouncedCards = useDebounce(cards, 500);
  const debouncedLayout = useDebounce(currentLayout, 500);
  const debouncedShowAnalytics = useDebounce(showAnalytics, 500);

  const autoSaveChanges = useCallback(async () => {
    if (!user || !profile || isInitialMount.current) return;
    setSaving(true);
    
    const validLayout = currentLayout.map(l => ({
        ...l, x: l.x ?? 0, y: l.y ?? 0, w: l.w ?? 1, h: l.h ?? 1,
    }));

    const cardsToUpsert = cards.map(c => ({
        id: c.id,
        user_id: c.user_id,
        type: c.type,
        title: c.title,
        content: c.content,
        link: c.link,
        background_image: c.background_image,
        background_color: c.background_color,
    }));
    
    const { error: cardsError } = await supabase.from('cards').upsert(cardsToUpsert);
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        name: profile.name, 
        bio: profile.bio, 
        layout_config: validLayout,
        show_analytics: showAnalytics,
      })
      .eq('id', user.id);
      
    if (profileError || cardsError) {
      const errorMessage = profileError?.message || cardsError?.message || 'Ocorreu um erro desconhecido.';
      toast({ title: 'Erro ao salvar', description: errorMessage, variant: 'destructive' });
      console.error("Save error:", profileError || cardsError);
    }
    setSaving(false);

  }, [user, profile, cards, currentLayout, toast, showAnalytics]);

  useEffect(() => {
    if (isInitialMount.current) {
        // On first load, don't save anything
        return;
    }
    autoSaveChanges();
  }, [debouncedProfile, debouncedCards, debouncedLayout, debouncedShowAnalytics, autoSaveChanges]);

  const fetchViewCount = useCallback(async (period: 'today' | '7d' | '30d', profileId: string) => {
      if (!profileId) return;
      
      let dateFilter = new Date();
      if (period === 'today') {
          dateFilter.setHours(0, 0, 0, 0);
      } else if (period === '7d') {
          dateFilter.setDate(dateFilter.getDate() - 7);
      } else if (period === '30d') {
          dateFilter.setDate(dateFilter.getDate() - 30);
      }

      const { count, error } = await supabase
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileId)
          .gte('created_at', dateFilter.toISOString());

      if (error) {
          console.error('Error fetching view count:', error);
          setViewCount(null);
      } else {
          setViewCount(count);
      }
  }, []);

  const handlePeriodChange = (period: 'today' | '7d' | '30d') => {
      setAnalyticsPeriod(period);
      if(profile?.id) {
        fetchViewCount(period, profile.id);
      }
  };


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
        const isControlClick = target.closest('[data-card-id]')?.contains(target);
        const isControlBarClick = target.closest('[data-card-edit-controls]');

        if (!isControlClick && !isControlBarClick) {
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

  const fetchPageData = useCallback(async (currentUser: User) => {
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
    
    if (currentUser.id !== profileData.id) {
        setError('Acesso não autorizado.');
        setLoading(false);
        router.push(`/${pageUsername}`);
        return;
    }

    setProfile(profileData as ProfileType);
    setShowAnalytics(profileData.show_analytics || false);
    if(profileData.show_analytics && profileData.id) {
      fetchViewCount('7d', profileData.id);
    }


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
    
    setLoading(false);
    setTimeout(() => {
      isInitialMount.current = false;
      updateRowHeight();
    }, 50);

  }, [pageUsername, isMobile, updateRowHeight, router, fetchViewCount]);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push(`/${pageUsername}`);
        return;
      }
      setUser(session.user)
      await fetchPageData(session.user);
    }
    fetchSessionAndProfile()
  }, [fetchPageData, pageUsername, router])

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/`);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/${pageUsername}`;
    navigator.clipboard.writeText(url);
  };
  
  const handleUpdateCard = useCallback((id: string, updates: Partial<CardData>) => {
    setCards(currentCards => 
        currentCards.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

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

    const finalData: Omit<CardData, 'id' | 'user_id' | 'created_at'> & { user_id: string } = {
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
  }

  const handleDeleteCard = useCallback(async (cardId: string) => {
    if (!user) return;
    
    setCards(prev => prev.filter(c => c.id !== cardId));
    setCurrentLayout(prev => prev.filter(l => l.i !== cardId));
    setSelectedCardId(null);

    const { error } = await supabase.from('cards').delete().eq('id', cardId);

    if (error) {
        toast({ title: 'Erro', description: 'Não foi possível deletar o card.', variant: 'destructive' });
        console.error("Error deleting card:", error);
        if (user) {
          fetchPageData(user);
        }
        return; 
    }
  }, [user, toast, fetchPageData]);

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
      const cardToEdit = cards.find(c => c.id === cardId);
      if (cardToEdit && cardToEdit.type !== 'note') {
        setEditingCard(cardToEdit);
        setIsEditSheetOpen(true);
      }
  }, [cards]);
  
  const selectedEditingCard = selectedCardId ? cards.find(c => c.id === selectedCardId) : undefined;

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

  return (
      <div className="flex flex-col min-h-screen bg-background">
          <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageFileSelected}
              className="hidden"
              accept="image/*"
          />
          
          <div className="grid grid-cols-12 md:gap-8 flex-1 px-6 md:px-8 py-4">
              <aside className="col-span-12 md:col-span-3 md:py-8">
                  <div className="sticky top-8">
                      <div className="flex items-start justify-between">
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

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><Settings/></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Opções</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem asChild>
                                <Link href={`/${pageUsername}`} target="_blank" className="cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4"/>
                                    <span>Ver Página Pública</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled><UserRound className="mr-2 h-4 w-4"/><span>Alterar Usuário</span></DropdownMenuItem>
                            <DropdownMenuItem disabled><KeyRound className="mr-2 h-4 w-4"/><span>Alterar Senha</span></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4"/><span>Sair</span></DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <Input
                      className="text-4xl font-bold border-none focus:ring-0 shadow-none p-0 h-auto mb-2 bg-transparent"
                      value={profile?.name || ''}
                      onChange={(e) => setProfile(p => p ? { ...p, name: e.target.value } : null)}
                      placeholder="Seu Nome"
                      />
                      <Textarea
                        ref={textareaRef}
                        className="text-muted-foreground mt-2 border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none resize-none p-0 bg-transparent overflow-hidden"
                        value={profile?.bio || ''}
                        onChange={(e) => {
                          setProfile(p => p ? { ...p, bio: e.target.value } : null)
                          adjustTextareaHeight();
                        }}
                        placeholder="Sua biografia..."
                        rows={1}
                      />
                      
                      {isMobile && (
                        <div className="flex items-center space-x-2 mt-4">
                            <Switch 
                                id="analytics-mode" 
                                checked={showAnalytics}
                                onCheckedChange={setShowAnalytics}
                            />
                            <Label htmlFor="analytics-mode">Análise de dados</Label>
                        </div>
                      )}
                  </div>
              </aside>
              
              <main className="col-span-12 md:col-span-9 mb-24 md:mb-0 mt-6 md:mt-0">
                  {user && (
                  <>
                    {showAnalytics && (
                        <div className="mb-6">
                            <AnalyticsCard 
                                viewCount={viewCount}
                                period={analyticsPeriod}
                                onPeriodChange={handlePeriodChange}
                            />
                        </div>
                    )}
                    <GridLayoutComponent
                        cards={cards}
                        layoutConfig={currentLayout}
                        onLayoutChange={handleLayoutChange}
                        onUpdateCard={handleUpdateCard}
                        onDeleteCard={handleDeleteCard}
                        onEditCard={handleEditCard}
                        isMobile={isMobile}
                        selectedCardId={selectedCardId}
                        onSelectCard={handleSelectCard}
                        rowHeight={rowHeight}
                    />
                  </>
                  )}
              </main>
          </div>

          {isMobile && !selectedCardId && (
            <footer className="fixed bottom-0 left-0 right-0 p-4 z-50">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border flex justify-between items-center p-1.5 gap-2 max-w-sm mx-auto">
                <div className="flex items-center gap-1">
                  <Button title="Adicionar Link" variant="ghost" size="icon" onClick={() => addNewCard('link')}><LinkIcon className="h-5 w-5" /></Button>
                  <Button title="Adicionar Imagem" variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()} disabled={isUploadingImage}>
                      {isUploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                  </Button>
                  <Button title="Adicionar Nota" variant="ghost" size="icon" onClick={() => addNewCard('note')}><StickyNote className="h-5 w-5" /></Button>
                  <Button title="Adicionar Mapa" variant="ghost" size="icon" onClick={() => addNewCard('map')}><MapIcon className="h-5 w-5" /></Button>
                  <Button title="Adicionar Título" variant="ghost" size="icon" onClick={() => addNewCard('title')}><Type className="h-5 w-5" /></Button>
                </div>
                <Button 
                    onClick={handleShare} 
                    disabled={saving}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 px-3 text-sm h-9"
                >
                    {saving ? 'Salvando...' : 'Copiar Link'}
                </Button>
              </div>
            </footer>
          )}

          {isMobile && selectedEditingCard && (
              <CardEditControls 
                  card={selectedEditingCard}
                  onUpdate={handleUpdateCard}
                  onResize={handleResizeCard}
                  onDone={() => setSelectedCardId(null)}
              />
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
