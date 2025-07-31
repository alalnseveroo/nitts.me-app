
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
import { Settings, Share, Upload, Loader2, LogOut, KeyRound, UserRound, Eye, Plus, FileText } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from '@/components/ui/skeleton'
import GridLayoutComponent from '@/components/ui/grid-layout'
import { EditCardSheet } from '@/components/ui/edit-card-sheet'
import { CardEditControls } from '@/components/ui/card-edit-controls'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useIsMobile } from '@/hooks/use-mobile'
import { useDebounce } from '@/hooks/use-debounce'
import type { Profile as ProfileType, CardData } from '@/lib/types';
import { Label } from '@/components/ui/label'
import AnalyticsCard from '@/components/ui/analytics-card'
import { AnalyticsToggle } from '@/components/ui/analytics-toggle'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { scrapeUrlMetadata } from "@/ai/flows/url-metadata-scraper-flow"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { LinkIcon, ImageIcon, NoteIcon, TitleIcon, MapIcon, DocIcon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { UpgradeModal } from '@/components/ui/upgrade-modal'
import { InviteCodeModal } from '@/components/ui/invite-code-modal'
import { EditDocumentSheet } from '@/components/ui/edit-document-sheet'

const getSocialConfig = (url: string) => {
    try {
        const hostname = new URL(url).hostname;
        const colorWithOpacity = (r: number, g: number, b: number) => ({
            color: `rgba(${r}, ${g}, ${b}, 0.1)`,
            textColor: `rgb(0, 0, 0)`
        });

        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            return colorWithOpacity(255, 0, 0); // Vermelho
        }
        if (hostname.includes('tiktok.com')) {
            return colorWithOpacity(0, 0, 0); // Preto
        }
        if (hostname.includes('substack.com')) {
            return colorWithOpacity(255, 103, 25); // Laranja
        }
        if (hostname.includes('instagram.com')) {
            return colorWithOpacity(228, 64, 95); // Rosa
        }
        if (hostname.includes('discord')) {
            return colorWithOpacity(88, 101, 242); // Azul Discord
        }
        if (hostname.includes('facebook.com')) {
            return colorWithOpacity(24, 119, 242); // Azul Facebook
        }
    } catch (e) {
        // Invalid URL
    }
    return null;
};


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
  const [isEditDocSheetOpen, setIsEditDocSheetOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [viewCount, setViewCount] = useState<number | null>(null)
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'today' | '7d' | '30d'>('7d')
  const [isAddCardPopoverOpen, setIsAddCardPopoverOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);


  
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

  useEffect(() => {
    const autoSaveChanges = async () => {
      if (!user || !profile || isInitialMount.current) return;
      setSaving(true);
      
      const validLayout = currentLayout.map(l => ({
          ...l, x: l.x ?? 0, y: l.y ?? 0, w: l.w ?? 1, h: l.h ?? 1,
      }));

      const cardsToUpsert = cards.map(c => {
        const baseCard: Partial<CardData> = {
          id: c.id,
          user_id: c.user_id,
          type: c.type,
          title: c.title,
          content: c.content,
          link: c.link,
          price: c.price,
          original_file_path: c.original_file_path,
          background_image: c.background_image,
          background_color: c.background_color,
          text_color: c.text_color,
          tag: c.tag,
          tag_bg_color: c.tag_bg_color,
          tag_text_color: c.tag_text_color,
        };
        // Remove undefined keys to avoid sending them in upsert
        Object.keys(baseCard).forEach(key => baseCard[key as keyof typeof baseCard] === undefined && delete baseCard[key as keyof typeof baseCard]);
        return baseCard;
      });
      
      const { error: cardsError } = await supabase.from('cards').upsert(cardsToUpsert);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          name: profile.name, 
          bio: profile.bio, 
          layout_config: validLayout,
          show_analytics: showAnalytics,
          fb_pixel_id: profile.fb_pixel_id,
          ga_tracking_id: profile.ga_tracking_id,
        })
        .eq('id', user.id);
        
      if (profileError || cardsError) {
        const errorMessage = profileError?.message || cardsError?.message || 'Ocorreu um erro desconhecido.';
        toast({ title: 'Erro ao salvar', description: errorMessage, variant: 'destructive' });
        console.error("Save error:", profileError || cardsError);
      }
      setSaving(false);
    };

    if (!isInitialMount.current) {
        autoSaveChanges();
    }
  }, [debouncedProfile, debouncedCards, debouncedLayout, debouncedShowAnalytics, user, toast]);

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
      const cardToEdit = cards.find(c => c.id === cardId);
      if(cardToEdit?.type === 'document') {
        setEditingCard(cardToEdit);
        setIsEditDocSheetOpen(true);
      } else {
        setEditingCard(cardToEdit);
        setSelectedCardId(prevId => (prevId === cardId ? null : cardId));
      }
    }
  }, [isMobile, cards]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const isControlClick = target.closest('[data-card-id]')?.contains(target);
        const isControlBarClick = target.closest('[data-card-edit-controls]');
        const isColorPopoverClick = target.closest('.color-popover-content');

        if (!isControlClick && !isControlBarClick && !isColorPopoverClick) {
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
  }, [pageUsername, router]);

  const fetchPageData = async (currentUser: User) => {
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
    } else {
        const fetchedCards = (cardsData || []) as CardData[];
        setCards(fetchedCards);

        // **VALIDATION AND CLEANUP LOGIC**
        const savedLayout = profileData.layout_config || [];
        const cardIds = new Set(fetchedCards.map(c => c.id));
        const cleanedLayout = savedLayout.filter(l => cardIds.has(l.i));
        
        setCurrentLayout(cleanedLayout);
    }
    
    setLoading(false);
    setTimeout(() => {
      isInitialMount.current = false;
      updateRowHeight();
    }, 50);

  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/`);
  };

  const handleShare = () => {
    const isFreeUser = !profile?.role || profile.role === 'free';
    
    if (isFreeUser) {
        setIsUpgradeModalOpen(true);
    } else {
        const url = `${window.location.origin}/${pageUsername}`;
        navigator.clipboard.writeText(url);
        toast({ title: 'Link copiado!', description: 'O link do seu perfil foi copiado para a área de transferência.' });
    }
  };
  
  const handleUpdateCard = useCallback(async (id: string, updates: Partial<CardData>) => {
    const originalCard = cards.find(c => c.id === id);
    if (!originalCard) return;

    let finalUpdates = { ...updates };

    const isLinkCardUpdate = (originalCard.type === 'link' || originalCard.type === 'note') && updates.link && updates.link !== originalCard.link;
    
    if (isLinkCardUpdate) {
        toast({ title: 'Importando dados...', description: 'Estamos buscando as informações do seu link.' });
        try {
            const result = await scrapeUrlMetadata({ url: updates.link as string });
            finalUpdates.title = result.title;
            
            const socialConfig = getSocialConfig(updates.link as string);
            if (socialConfig) {
                finalUpdates.background_color = socialConfig.color;
                finalUpdates.text_color = socialConfig.textColor;
            } else {
                 finalUpdates.background_color = null; 
                 finalUpdates.text_color = null;
            }
            if (result.imageUrl) {
                finalUpdates.background_image = result.imageUrl;
            }

            toast({ title: 'Sucesso!', description: 'Título do link atualizado.' });
        } catch (error) {
            console.error('Scraping error:', error);
            toast({ title: 'Erro de importação', description: 'Não foi possível buscar os dados. O link foi salvo.', variant: 'destructive' });
        }
    }
    
    setCards(currentCards => 
        currentCards.map(c => (c.id === id ? { ...c, ...finalUpdates } : c))
    );
  }, [cards, toast]);

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

  const addNewCard = async (type: 'link' | 'image' | 'note' | 'title' | 'map' | 'document', extraData: Partial<CardData> = {}) => {
    if (!user) return;
    setIsAddCardPopoverOpen(false);

    let newCardData: Omit<CardData, 'id' | 'created_at'>;

    const baseData = {
        user_id: user.id,
        type: type,
        title: null,
        content: null,
        link: null,
        background_image: null,
        background_color: null,
        text_color: null,
        tag: null,
        tag_bg_color: null,
        tag_text_color: null,
        price: null,
        original_file_path: null,
    };
    
    switch (type) {
        case 'title':
            newCardData = { ...baseData, title: 'Novo Título' };
            break;
        case 'link':
            newCardData = { ...baseData, title: 'Novo Link' };
            break;
        case 'note':
            newCardData = { ...baseData, content: 'Sua nota aqui', background_color: '#FFFFFF', text_color: '#000000' };
            break;
        case 'map':
            newCardData = { ...baseData, title: 'Mapa' };
            break;
        case 'document':
             newCardData = { ...baseData, title: 'Documento PDF', content: 'Descrição do seu documento aqui.' };
            break;
        case 'image':
             newCardData = { ...baseData, title: '', ...extraData };
            break;
        default:
             toast({ title: 'Erro', description: 'Tipo de card desconhecido.', variant: 'destructive'});
            return;
    }

    const { data: newCard, error } = await supabase.from('cards').insert([newCardData]).select().single();

    if(error || !newCard) {
        toast({ title: 'Erro ao criar card', description: error?.message || 'Não foi possível criar o card.', variant: 'destructive'});
        console.error('Card creation error:', error);
        return;
    }
    
    setCards(currentCards => [...currentCards, newCard as CardData]);
  }

  const handleDeleteCard = useCallback(async (cardId: string) => {
    if (!user) return;

    const { error } = await supabase.from('cards').delete().eq('id', cardId);

    if (error) {
        toast({ title: 'Erro', description: 'Não foi possível deletar o card.', variant: 'destructive' });
        console.error("Error deleting card:", error);
        // Force a full refresh from server data if deletion fails to avoid state mismatch
        fetchPageData(user);
    } else {
        setCards(prev => prev.filter(c => c.id !== cardId));
        setSelectedCardId(null);
    }
  }, [user, toast]);

  const handleImageFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
        return;
    }
    setIsAddCardPopoverOpen(false);

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
  
  // This effect syncs the layout state when cards are added or deleted.
  useEffect(() => {
    if (loading || isInitialMount.current) return;

    const layoutMap = new Map(currentLayout.map(l => [l.i, l]));
    const cardIds = new Set(cards.map(c => c.id));
    
    const newCards = cards.filter(card => !layoutMap.has(card.id));
    const validCurrentLayout = currentLayout.filter(l => cardIds.has(l.i));

    if (newCards.length > 0) {
      const cols = isMobile ? 2 : 4;
      let nextY = getNextY(validCurrentLayout);

      const newLayoutItems = newCards.map((card, index) => {
          let w, h;
          const isFullWidth = card.type === 'title' || card.type === 'document';

          if (isFullWidth) {
              w = cols;
              h = card.type === 'title' ? 0.5 : 1;
          } else if (card.type === 'image') {
              w = 1; h = 1;
          } else { // link, note, map
              w = isMobile ? 2 : 2;
              h = 1;
          }


          const layoutItem = {
              i: card.id,
              x: 0,
              y: nextY,
              w: w,
              h: h,
          };
          
          nextY += h;

          return layoutItem;
      });

      setCurrentLayout(prev => [...validCurrentLayout, ...newLayoutItems]);
    } else if (validCurrentLayout.length !== currentLayout.length) {
      // Handles deletion
      setCurrentLayout(validCurrentLayout);
    }
  }, [cards, loading, isMobile]);


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
    if (!cardToEdit) return;
    setEditingCard(cardToEdit);

    if (cardToEdit.type === 'document') {
      setIsEditDocSheetOpen(true);
    } else {
      setIsEditSheetOpen(true);
    }
  }, [cards]);
  
  const handleInviteSuccess = useCallback(async () => {
      if (!user) return;
      const { data, error } = await supabase.from('profiles').update({ role: 'guest' }).eq('id', user.id).select().single();
      
      if(error || !data) {
          toast({ title: "Erro", description: "Não foi possível atualizar seu status. Tente novamente.", variant: "destructive"});
          return;
      }

      setProfile(data as ProfileType);
      setIsInviteModalOpen(false);
      toast({ title: "Sucesso!", description: "Seu acesso foi liberado. Bem-vindo(a)!" });

  }, [user, toast]);
  

  const selectedEditingCard = selectedCardId ? cards.find(c => c.id === selectedCardId) : undefined;
  const isEditableCardSelected = selectedEditingCard && selectedEditingCard.type !== 'title' && selectedEditingCard.type !== 'map' && selectedEditingCard.type !== 'document';

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

  if (!isMobile) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <h1 className="text-2xl font-bold">Pegue seu Nits pelo celular</h1>
      </div>
    )
  }

  const addCardOptions = [
    { type: 'link', label: 'Link', icon: <LinkIcon />, action: () => addNewCard('link') },
    { type: 'image', label: 'Imagem', icon: <ImageIcon />, action: () => imageInputRef.current?.click() },
    { type: 'note', label: 'Nota', icon: <NoteIcon />, action: () => addNewCard('note') },
    { type: 'title', label: 'Título', icon: <TitleIcon />, action: () => addNewCard('title') },
    { type: 'map', label: 'Mapa', icon: <MapIcon />, action: () => addNewCard('map') },
    { type: 'document', label: 'Documento', icon: <DocIcon />, action: () => addNewCard('document') }
  ];

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
                      <div className="relative mb-4 w-36 h-36">
                          <Avatar className="w-36 h-36 text-lg">
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
                    className="text-4xl font-headline font-bold border-none focus:ring-0 shadow-none p-0 h-auto mb-2 bg-transparent"
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
                    
                    <div className="space-y-4 mt-6">
                       <div className="flex items-center space-x-2">
                          <AnalyticsToggle 
                              id="analytics-mode" 
                              checked={showAnalytics}
                              onCheckedChange={setShowAnalytics}
                          />
                          <Label htmlFor="analytics-mode">Análise de dados</Label>
                      </div>
                      <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>
                              <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4" />
                                  Integrações
                              </div>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                      <Label htmlFor="ga_tracking_id">Google Analytics ID</Label>
                                      <Input
                                          id="ga_tracking_id"
                                          placeholder="G-XXXXXXXXXX"
                                          value={profile?.ga_tracking_id || ''}
                                          onChange={(e) => setProfile(p => p ? { ...p, ga_tracking_id: e.target.value } : null)}
                                      />
                                  </div>
                                   <div className="space-y-2">
                                      <Label htmlFor="fb_pixel_id">Facebook Pixel ID</Label>
                                      <Input
                                          id="fb_pixel_id"
                                          placeholder="123456789012345"
                                          value={profile?.fb_pixel_id || ''}
                                          onChange={(e) => setProfile(p => p ? { ...p, fb_pixel_id: e.target.value } : null)}
                                      />
                                  </div>
                              </AccordionContent>
                          </AccordionItem>
                      </Accordion>
                    </div>
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
            <div className="flex justify-center items-center gap-2">
              <Popover open={isAddCardPopoverOpen} onOpenChange={setIsAddCardPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button className="group bg-white text-black hover:bg-white/90 h-12 w-12 hover:w-36 rounded-2xl shadow-lg p-0 transition-all duration-300 ease-in-out flex items-center justify-center">
                    <div className="flex items-center justify-center gap-2">
                       <div className="transition-transform duration-300 group-hover:-translate-x-5">
                          <Plus className="h-6 w-6 shrink-0"/>
                       </div>
                       <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-base font-medium -translate-x-full group-hover:translate-x-2.5">Adicionar</span>
                   </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 mb-2 rounded-2xl" side="top" align="center">
                   <div className="grid grid-cols-3 gap-4">
                      {addCardOptions.map((option) => (
                        <div key={option.type} className="flex flex-col items-center gap-2 cursor-pointer" onClick={option.action}>
                           <div
                              className="w-16 h-16 rounded-2xl bg-secondary border flex items-center justify-center"
                           >
                            {isUploadingImage && option.type === 'image' ? <Loader2 className="h-6 w-6 animate-spin"/> : option.icon}
                          </div>
                          <span className="text-xs text-center font-medium">{option.label}</span>
                        </div>
                      ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Button 
                  onClick={handleShare} 
                  disabled={saving}
                  className="bg-black text-white hover:bg-black/90 px-5 text-sm h-12 rounded-2xl shadow-lg"
              >
                  {saving ? 'Salvando...' : 'Copiar Link'}
              </Button>
            </div>
          </footer>
        )}

        {isMobile && isEditableCardSelected && (
            <CardEditControls 
                card={selectedEditingCard!}
                onUpdate={handleUpdateCard}
                onResize={handleResizeCard}
                onDone={() => setSelectedCardId(null)}
            />
        )}
        
        <EditCardSheet
            isOpen={isEditSheetOpen}
            onOpenChange={(isOpen) => {
              setIsEditSheetOpen(isOpen)
              if (!isOpen) setEditingCard(undefined)
            }}
            card={editingCard}
            onUpdate={handleUpdateCard}
        />
        <EditDocumentSheet
            isOpen={isEditDocSheetOpen}
            onOpenChange={(isOpen) => {
                setIsEditDocSheetOpen(isOpen)
                if (!isOpen) setEditingCard(undefined)
            }}
            card={editingCard}
            onUpdate={handleUpdateCard}
        />
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onOpenChange={setIsUpgradeModalOpen}
          onInviteClick={() => {
            setIsUpgradeModalOpen(false);
            setIsInviteModalOpen(true);
          }}
        />
        <InviteCodeModal
          isOpen={isInviteModalOpen}
          onOpenChange={setIsInviteModalOpen}
          onSuccess={handleInviteSuccess}
        />
    </div>
  );
}

    

    
