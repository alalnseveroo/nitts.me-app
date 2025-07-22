'use client'

import { useEffect, useState, ChangeEvent, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, Bug, BarChart2, Share, Laptop, Smartphone, Upload, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import GridLayout from '@/components/ui/grid-layout'
import { useToast } from '@/hooks/use-toast'

type Profile = {
  username: string | null
  name: string | null
  bio: string | null
  avatar_url: string | null
  layout_config: any | null
}

type Card = {
    id: string;
    user_id: string;
    type: string;
    title: string | null;
    content: string | null;
    link: string | null;
    background_image: string | null;
};

export default function EditPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter()
  const params = useParams()
  const { toast } = useToast();
  const pageUsername = params.username as string

  const fetchPageData = useCallback(async (currentUser: User) => {
    setLoading(true);
    const profilePromise = supabase
      .from('profiles')
      .select(`username, name, bio, avatar_url, layout_config`)
      .eq('id', currentUser.id)
      .single();

    const cardsPromise = supabase
      .from('cards')
      .select('*')
      .eq('user_id', currentUser.id);

    const [profileResult, cardsResult] = await Promise.all([profilePromise, cardsPromise]);

    const { data: profileData, error: profileError } = profileResult;
    const { data: cardsData, error: cardsError } = cardsResult;

    if (profileError || !profileData) {
      console.error('Error fetching profile:', profileError);
      // Fallback or error handling
    } else {
      if (profileData.username !== pageUsername) {
        router.push(`/${profileData.username}/edit`);
        return;
      }
      setProfile(profileData as Profile);
    }
    
    if (cardsError) {
        console.error('Error fetching cards:', cardsError);
    } else {
        setCards(cardsData || []);
    }

    setLoading(false);
  }, [pageUsername, router]);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      fetchPageData(session.user);
    }
    fetchSessionAndProfile()
  }, [router, fetchPageData])


  const handleUpdateProfile = async () => {
    if (!user || !profile) return

    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        bio: profile.bio,
      })
      .eq('id', user.id)

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao atualizar o perfil.', variant: 'destructive' });
      console.error(error);
    } else {
      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!' });
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
    } catch (error) {
        toast({ title: 'Erro', description: 'Erro ao fazer upload do avatar.', variant: 'destructive'});
        console.error(error);
    } finally {
        setUploading(false)
    }
  }

  const addNewCard = async (type: string, extraData: Record<string, any> = {}) => {
    if (!user) return;
    const finalData = {
        user_id: user.id,
        type: type,
        title: `Novo ${type}`,
        ...extraData
    };

    const { data, error } = await supabase.from('cards').insert(finalData).select().single();

    if(error || !data) {
        toast({ title: 'Erro', description: 'Erro ao criar novo card.', variant: 'destructive'});
        console.error('Card creation error:', error);
        return;
    }
    
    // Re-fetch data to update UI
    if (user) await fetchPageData(user);
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
        
        await addNewCard('image', { background_image: publicUrl, title: 'Nova Imagem' });
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

  const handleLayoutChange = async (newLayout: any) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ layout_config: newLayout })
      .eq('id', user.id);

    if (error) {
      console.error('Erro ao salvar layout:', error);
      toast({ title: 'Erro', description: 'Não foi possível salvar o layout.', variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Layout salvo!' });
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 p-4">
        <header className="flex justify-between items-center bg-white shadow-md p-4"><Skeleton className="h-8 w-32" /><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-32" /></header>
        <main className="flex-grow p-8 flex items-start justify-center">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8 space-y-6">
            <div className="flex flex-col items-center text-center"><Skeleton className="w-24 h-24 rounded-full mb-4" /><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-12 w-full" /></div>
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
        <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageFileSelected}
            className="hidden"
            accept="image/*"
        />

      <header className="flex justify-between items-center p-4 bg-white shadow-md sticky top-0 z-20">
        <div className="flex items-center space-x-2"><Button variant="ghost" size="icon"><Settings className="h-6 w-6" /></Button><Button variant="ghost" size="icon"><Bug className="h-6 w-6" /></Button><Button variant="ghost" size="icon"><BarChart2 className="h-6 w-6" /></Button></div>
        <div className="flex items-center space-x-2"><Button variant="outline" size="sm"><Laptop className="h-5 w-5 mr-2" /> Desktop</Button><Button variant="outline" size="sm"><Smartphone className="h-5 w-5 mr-2" /> Mobile</Button></div>
        <div className="flex items-center space-x-4"><Button onClick={handleUpdateProfile}>Salvar Perfil</Button><Button><Share className="mr-2 h-4 w-4" /> Compartilhar</Button></div>
      </header>

      <main className="flex-grow p-8">
        <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-24">
            <div className="flex flex-col items-center text-center mb-12">
                <div className="relative">
                    <Avatar className="w-24 h-24 mb-4"><AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || 'avatar'} /><AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                    <label htmlFor="avatar-upload" className="absolute bottom-4 -right-1 bg-gray-700 text-white rounded-full p-2 cursor-pointer hover:bg-gray-600 transition-all">{uploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Upload className="h-4 w-4" />}</label>
                    <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading}/>
                </div>
                <Input className="text-3xl font-bold text-center border-none focus:ring-0" value={profile?.name || ''} onChange={(e) => setProfile(p => p ? { ...p, name: e.target.value } : null)} placeholder="Seu Nome"/>
                <Textarea className="text-center text-gray-500 mt-2 border-none focus:ring-0 max-w-xl" value={profile?.bio || ''} onChange={(e) => setProfile(p => p ? { ...p, bio: e.target.value } : null)} placeholder="Uma breve biografia sobre você."/>
            </div>

            {user && (
              <GridLayout
                userId={user.id}
                cards={cards}
                layoutConfig={profile?.layout_config}
                onLayoutChange={handleLayoutChange}
                onDeleteCard={handleDeleteCard}
              />
            )}

        </div>
      </main>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm p-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex justify-around items-center p-2">
            <Button title="Adicionar Imagem" variant="ghost" size="icon" className="rounded-full" onClick={() => imageInputRef.current?.click()} disabled={isUploadingImage}>
                {isUploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : '🖼️'}
            </Button>
            <Button title="Adicionar Título" variant="ghost" size="icon" className="rounded-full" onClick={() => addNewCard('title')}>T</Button>
            <Button title="Adicionar Nota" variant="ghost" size="icon" className="rounded-full" onClick={() => addNewCard('note')}>📝</Button>
            <Button title="Adicionar Link" variant="ghost" size="icon" className="rounded-full" onClick={() => addNewCard('link')}>🔗</Button>
            <Button title="Adicionar Mapa" variant="ghost" size="icon" className="rounded-full" onClick={() => addNewCard('map')}>🗺️</Button>
        </div>
      </footer>
    </div>
  )
}

    