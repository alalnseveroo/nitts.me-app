'use client'

import { useEffect, useState, ChangeEvent, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, Bug, BarChart2, Share, Laptop, Smartphone, Upload, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import GridLayout from '@/components/ui/grid-layout'

type Profile = {
  username: string | null
  name: string | null
  bio: string | null
  avatar_url: string | null
  layout_config: any | null // Adicionando layout_config
}
export default function EditPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [cardCount, setCardCount] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter()
  const params = useParams()
  const pageUsername = params.username as string

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`username, name, bio, avatar_url, layout_config`) // Incluindo layout_config na busca
        .eq('id', session.user.id)
        .single()

      if (profileError || !profileData) {
        console.error('Error fetching profile:', profileError)
        // This might happen if profile creation failed. Let's not sign out, but handle gracefully.
        // Maybe redirect to a profile setup page or show an error.
        // For now, we'll just log it and show a limited state.
      } else {
         if (profileData.username !== pageUsername) {
            // If the user is logged in but trying to edit someone else's page
            router.push(`/${profileData.username}/edit`);
            return;
         }
         setProfile(profileData as Profile)
      }

      setLoading(false)
    }

    fetchSessionAndProfile()
  }, [router, pageUsername])

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
      alert('Erro ao atualizar o perfil.')
      console.error(error);
    } else {
      alert('Perfil atualizado com sucesso!')
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
        alert('Erro ao fazer upload do avatar.')
        console.error(error);
    } finally {
        setUploading(false)
    }
  }

  // Modificando addNewCard para receber user como argumento
  const addNewCard = async (currentUser: User, type: string, extraData: Record<string, any> = {}) => {
    const finalData = {
        user_id: currentUser.id,
        type: type,
        title: `Novo ${type}`,
        ...extraData
    };

    const { error } = await supabase.from('cards').insert(finalData);

    if(error) {
        alert('Erro ao criar novo card.');
        console.error('Card creation error:', error);
        return;
    }

    setCardCount(prev => prev + 1);
  }

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

        // Passando user para addNewCard
        if (user) await addNewCard(user, 'image', { background_image: publicUrl, title: 'Nova Imagem' });
    } catch (error) {
        alert('Falha no upload da imagem.');
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

            {user && <GridLayout key={cardCount} userId={user.id} onAddCard={(type) => user && addNewCard(user, type)} onLayoutChange={handleLayoutChange} initialLayout={profile?.layout_config}/>} {/* Passando onLayoutChange e initialLayout */}

        </div>
      </main>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm p-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex justify-around items-center p-2">
            <Button title="Adicionar Imagem" variant="ghost" size="icon" className="rounded-full" onClick={() => imageInputRef.current?.click()} disabled={isUploadingImage}>
                {isUploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : '🖼️'}
            </Button>
            <Button title="Adicionar Título" variant="ghost" size="icon" className="rounded-full" onClick={() => user && addNewCard(user, 'title')}>T</Button>
            <Button title="Adicionar Nota" variant="ghost" size="icon" className="rounded-full" onClick={() => user && addNewCard(user, 'note')}>📝</Button>
            <Button title="Adicionar Link" variant="ghost" size="icon" className="rounded-full" onClick={() => user && addNewCard(user, 'link')}>🔗</Button>
            <Button title="Adicionar Mapa" variant="ghost" size="icon" className="rounded-full" onClick={() => user && addNewCard(user, 'map')}>🗺️</Button>
        </div>
      </footer>
    </div>
  )
}
