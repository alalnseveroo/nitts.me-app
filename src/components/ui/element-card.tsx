
'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkIcon, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CardData } from '@/app/[username]/page';

interface ElementCardProps {
    data: CardData;
}

const CardWrapper = ({ data, children }: { data: CardData, children: React.ReactNode }) => {
    const content = (
        <div className="relative w-full h-full">
            {children}
            {data.link && (
                <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-muted-foreground" />
            )}
        </div>
    );

    if (data.link) {
        return (
            <Link href={data.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                {content}
            </Link>
        )
    }
    return <>{content}</>;
}


export const ElementCard = ({ data }: ElementCardProps) => {
    
    switch (data.type) {
        case 'link':
            return (
                <Card asChild className="w-full h-full bg-card hover:bg-secondary/50 transition-colors">
                    <Link href={data.link || '#'} target="_blank" rel="noopener noreferrer" className="flex flex-col justify-between p-4">
                        <div>
                            <CardTitle className="text-base font-semibold">{data.title}</CardTitle>
                            {data.link && <CardDescription className="text-sm truncate">{data.link}</CardDescription>}
                        </div>
                        <LinkIcon className="h-4 w-4 text-muted-foreground self-end"/>
                    </Link>
                </Card>
            );
        case 'title':
            return (
                <CardWrapper data={data}>
                    <div className="w-full h-full flex items-center justify-start p-2">
                        <h2 className="text-4xl font-bold">{data.title}</h2>
                    </div>
                </CardWrapper>
            );
        case 'note':
            return (
                 <CardWrapper data={data}>
                    <Card
                        className="w-full h-full p-4 overflow-y-auto flex items-center justify-center text-center"
                        style={{ backgroundColor: data.background_color ?? '#FFFFFF' }}
                    >
                        <p className="text-sm text-foreground whitespace-pre-wrap">{data.content}</p>
                    </Card>
                 </CardWrapper>
            );
        case 'image':
            return (
                 <CardWrapper data={data}>
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
                <CardWrapper data={data}>
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
