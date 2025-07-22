'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
    
    const renderPublicView = () => {
        switch (data.type) {
            case 'link':
                return (
                    <Button asChild className="w-full h-full text-base">
                        <Link href={data.link || '#'} target="_blank" rel="noopener noreferrer">
                            {data.title || data.link}
                        </Link>
                    </Button>
                );
            case 'title':
                return <h2 className="text-2xl font-bold text-center p-2">{data.title}</h2>;
            case 'note':
                return <p className="text-sm text-gray-600 whitespace-pre-wrap p-4">{data.content}</p>;
            case 'image':
                 return (
                    <div className="aspect-square w-full h-full rounded-md overflow-hidden">
                        <img src={data.background_image || 'https://placehold.co/400x400.png'} alt={data.title || 'image'} className="w-full h-full object-cover" />
                    </div>
                );
             case 'map':
                return <p className="text-sm text-center text-gray-500">🗺️ Mapa (WIP)</p>;
            default:
                return <p className="text-sm text-center text-gray-500">Elemento desconhecido</p>;
        }
    };

    return (
        <Card className="w-full h-full">
            <CardContent className="p-0 flex justify-center items-center w-full h-full">
                {renderPublicView()}
            </CardContent>
        </Card>
    )
};
