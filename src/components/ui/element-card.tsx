
'use client'

import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Link as LinkIconLucide, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CardData } from '@/lib/types';
import { SubstackIcon } from './substack-icon';
import { YoutubeIcon } from './youtube-icon';
import { TiktokIcon } from './tiktok-icon';
import { FacebookIcon } from './facebook-icon';
import { InstagramIcon } from './instagram-icon';
import { DiscordIcon } from './discord-icon';
import { Button } from './button';

interface ElementCardProps {
    data: CardData;
    source?: string;
}

const getDomainIcon = (link: string | null) => {
    if (!link) return <LinkIconLucide className="h-8 w-8" />;
    
    try {
        const url = new URL(link);
        const domain = url.hostname.replace('www.', '');

        if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
            return <YoutubeIcon className="h-10 w-10 text-red-600" />;
        }
        if (domain.includes('tiktok.com')) {
            return <TiktokIcon className="h-10 w-10" />;
        }
        if (domain.includes('substack.com')) {
            return <SubstackIcon className="h-10 w-10 text-orange-600" />;
        }
        if (domain.includes('instagram.com')) {
            return <InstagramIcon className="h-10 w-10" />;
        }
        if (domain.includes('discord')) {
            return <DiscordIcon className="h-10 w-10 text-indigo-500" />;
        }
        if (domain.includes('facebook.com')) {
            return <FacebookIcon className="h-10 w-10 text-blue-600" />;
        }


        return <LinkIconLucide className="h-8 w-8" />;

    } catch (error) {
        return <LinkIconLucide className="h-8 w-8" />;
    }
}

const CardWrapper = ({ data, children, source }: { data: CardData, children: React.ReactNode, source?: string, onClick?: (e: React.MouseEvent) => void }) => {
    
    const handleLinkClick = async (e: React.MouseEvent) => {
        if (!data.link) return;
        e.preventDefault();

        try {
            await supabase.from('link_clicks').insert({
                profile_id: data.user_id,
                card_id: data.id,
                source: source,
                destination_url: data.link,
            });
        } catch (error) {
            console.error('Error logging link click:', error);
        } finally {
            window.open(data.link, '_blank');
        }
    };
    
    const content = (
        <div className="relative w-full h-full">
            {children}
            {data.link && (
                 <div className="absolute top-2 right-2 p-1 bg-black/10 dark:bg-white/10 rounded-full backdrop-blur-sm">
                    <ArrowUpRight className="h-4 w-4" />
                </div>
            )}
             {data.tag && (
                <div 
                    className="absolute top-2 left-2 z-10 text-xs font-bold px-2 py-1 rounded-lg shadow-md pointer-events-none"
                    style={{
                        backgroundColor: data.tag_bg_color || '#F97316',
                        color: data.tag_text_color || '#FFFFFF',
                    }}
                >
                    {data.tag}
                </div>
            )}
        </div>
    );

    if (data.link) {
        return (
            <a href={data.link} onClick={handleLinkClick} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                {content}
            </a>
        )
    }
    return <>{content}</>;
}

export const ElementCard = ({ data, source }: ElementCardProps) => {
    const handleCardClick = async (e: React.MouseEvent) => {
        if (!data.link) return;
        e.preventDefault();

        try {
            await supabase.from('link_clicks').insert({
                profile_id: data.user_id,
                card_id: data.id,
                source: source,
                destination_url: data.link,
            });
        } catch (error) {
            console.error('Error logging link click:', error);
        } finally {
            window.open(data.link, '_blank');
        }
    };


    switch (data.type) {
        case 'link': {
            const Icon = getDomainIcon(data.link);
            const isYoutube = data.link?.includes('youtube.com') || data.link?.includes('youtu.be');
            
            return (
                <Card 
                    asChild 
                    className={cn(
                        "w-full h-full transition-colors",
                        !data.background_color && "bg-card hover:bg-secondary/50"
                    )}
                    style={{ backgroundColor: data.background_color ?? undefined }}
                >
                    <a href={data.link || '#'} onClick={handleCardClick} target="_blank" rel="noopener noreferrer" className="flex flex-col items-start justify-center text-left p-4 gap-2 h-full relative">
                         {data.tag && (
                            <div 
                                className="absolute top-2 left-2 z-10 text-xs font-bold px-2 py-1 rounded-lg shadow-md"
                                style={{
                                    backgroundColor: data.tag_bg_color || '#F97316',
                                    color: data.tag_text_color || '#FFFFFF',
                                }}
                            >
                                {data.tag}
                            </div>
                        )}
                         <div className="flex-shrink-0 pt-6" style={{ color: data.text_color ?? 'currentColor' }}>
                            {Icon}
                        </div>
                        <div className="flex-grow flex flex-col items-start justify-center">
                             <h3 className="font-bold text-lg break-words w-full whitespace-pre-wrap" style={{ color: data.text_color ?? 'currentColor' }}>
                                {data.title || data.link}
                            </h3>
                            {isYoutube ? (
                                <div className='text-left mt-2'>
                                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full">
                                        Subscribe
                                    </Button>
                                    <p className="text-sm font-semibold text-neutral-800">466K</p>
                                </div>
                            ) : (
                                data.link && <p className="text-sm break-all w-full opacity-60" style={{ color: data.text_color ?? 'currentColor' }}>{data.link.replace(/^(https?:\/\/)?(www\.)?/, '')}</p>
                            )}
                        </div>
                    </a>
                </Card>
            );
        }
        case 'title':
            return (
                <CardWrapper data={data} source={source}>
                    <div className="w-full h-full flex items-center justify-start p-2">
                        <h3 className="text-2xl font-bold">{data.title}</h3>
                    </div>
                </CardWrapper>
            );
        case 'note':
            return (
                 <CardWrapper data={data} source={source}>
                    <Card
                        className="w-full h-full p-4 flex items-center justify-center text-center relative"
                        style={{ 
                            backgroundColor: data.background_color ?? '#FFFFFF',
                            color: data.text_color ?? '#000000'
                        }}
                    >
                        <p className="text-xl font-medium whitespace-pre-wrap">{data.content}</p>
                    </Card>
                 </CardWrapper>
            );
        case 'image':
            return (
                 <CardWrapper data={data} source={source}>
                    <Card className="w-full h-full overflow-hidden relative">
                        <img 
                            src={data.background_image || 'https://placehold.co/400x400.png'} 
                            alt={data.title || 'image'} 
                            className="w-full h-full object-cover" 
                            data-ai-hint="abstract background"
                        />
                        {data.title && (
                            <div className="absolute bottom-2 left-2 bg-white text-black rounded-lg shadow-md px-3 py-1.5">
                                <p className="text-sm font-medium">{data.title}</p>
                            </div>
                        )}
                    </Card>
                </CardWrapper>
            );
        case 'map':
            return (
                <CardWrapper data={data} source={source}>
                    <Card className="w-full h-full p-4 flex items-center justify-center">
                        <p className="text-sm text-center text-muted-foreground">🗺️ Mapa (WIP)</p>
                    </Card>
                </CardWrapper>
            );
        default:
            return (
                <Card className="w-full h-full p-4 flex items-center justify-center">
                    <p className="text-sm text-center text-muted-foreground">Elemento desconhecido</p>
                </Card>
            );
    }
};
