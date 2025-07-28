
'use client'

import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIconLucide, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CardData } from '@/lib/types';
import { SubstackIcon } from './substack-icon';
import { YoutubeIcon } from './youtube-icon';
import { TiktokIcon } from './tiktok-icon';

interface ElementCardProps {
    data: CardData;
    source?: string;
}

const getDomainIcon = (link: string | null) => {
    if (!link) return <LinkIconLucide className="h-6 w-6" />;
    
    try {
        const url = new URL(link);
        const domain = url.hostname.replace('www.', '');

        if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
            return <YoutubeIcon className="h-6 w-6" />;
        }
        if (domain.includes('tiktok.com')) {
            return <TiktokIcon className="h-6 w-6" />;
        }
        if (domain.includes('substack.com')) {
            return <SubstackIcon className="h-6 w-6" />;
        }

        return <LinkIconLucide className="h-6 w-6" />;

    } catch (error) {
        return <LinkIconLucide className="h-6 w-6" />;
    }
}

const CardWrapper = ({ data, children, source }: { data: CardData, children: React.ReactNode, source?: string }) => {
    
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
    
    switch (data.type) {
        case 'link':
            const Icon = getDomainIcon(data.link);
            return (
                <Card asChild className="w-full h-full bg-card hover:bg-secondary/50 transition-colors">
                    <a href={data.link || '#'} onClick={handleLinkClick} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 gap-4">
                        <div className="flex-shrink-0">
                            {Icon}
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <CardTitle className="text-base font-semibold truncate">{data.title || data.link}</CardTitle>
                            {data.link && <CardDescription className="text-sm truncate text-muted-foreground">{data.link}</CardDescription>}
                        </div>
                    </a>
                </Card>
            );
        case 'title':
            return (
                <CardWrapper data={data} source={source}>
                    <div className="w-full h-full flex items-center justify-start p-2">
                        <h2 className="text-4xl font-bold">{data.title}</h2>
                    </div>
                </CardWrapper>
            );
        case 'note':
            return (
                 <CardWrapper data={data} source={source}>
                    <Card
                        className="w-full h-full p-4 flex items-center justify-center text-center"
                        style={{ backgroundColor: data.background_color ?? '#FFFFFF' }}
                    >
                        <p className="text-xl font-medium text-foreground whitespace-pre-wrap">{data.content}</p>
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
