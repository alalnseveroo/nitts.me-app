'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkIcon } from 'lucide-react';

type CardData = {
    id: string;
    type: string;
    title?: string | null;
    content?: string | null;
    link?: string | null;
    background_image?: string | null;
};

interface ElementCardProps {
    data: CardData;
}

export const ElementCard = ({ data }: ElementCardProps) => {
    
    switch (data.type) {
        case 'link':
            return (
                <Card asChild className="w-full h-full bg-card hover:bg-secondary/50 transition-colors">
                    <Link href={data.link || '#'} target="_blank" rel="noopener noreferrer" className="flex flex-col justify-between p-4">
                        <div>
                            <CardTitle className="text-base font-semibold">{data.title}</CardTitle>
                            <CardDescription className="text-sm truncate">{data.link}</CardDescription>
                        </div>
                        <LinkIcon className="h-4 w-4 text-muted-foreground self-end"/>
                    </Link>
                </Card>
            );
        case 'title':
            return (
                <div className="w-full h-full flex items-center justify-start p-2">
                     <h2 className="text-4xl font-bold">{data.title}</h2>
                </div>
            );
        case 'note':
            return (
                 <Card className="w-full h-full p-4 overflow-y-auto">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{data.content}</p>
                </Card>
            );
        case 'image':
            return (
                <Card className="w-full h-full overflow-hidden">
                    <img 
                        src={data.background_image || 'https://placehold.co/400x400.png'} 
                        alt={data.title || 'image'} 
                        className="w-full h-full object-cover" 
                        data-ai-hint="abstract background"
                    />
                </Card>
            );
        case 'map':
            return (
                <Card className="w-full h-full p-4 flex items-center justify-center">
                    <p className="text-sm text-center text-muted-foreground">🗺️ Mapa (WIP)</p>
                </Card>
            );
        default:
            return (
                <Card className="w-full h-full p-4 flex items-center justify-center">
                    <p className="text-sm text-center text-muted-foreground">Elemento desconhecido</p>
                </Card>
            );
    }
};
