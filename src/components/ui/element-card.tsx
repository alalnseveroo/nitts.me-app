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
    isEditable?: boolean; // Mantido para diferenciar contextos, mas a lógica de edição fica em GridLayoutCard
}

export const ElementCard = ({ data }: ElementCardProps) => {
    
    // Renderiza a visualização pública do card, que será usada em ambos os contextos (público e edição)
    const renderPublicView = () => {
        switch (data.type) {
            case 'link':
                return (
                    <Button asChild className="w-full">
                        <Link href={data.link || '#'} target="_blank" rel="noopener noreferrer">
                            {data.title || data.link}
                        </Link>
                    </Button>
                );
            case 'title':
                return <h2 className="text-xl font-bold text-center">{data.title}</h2>;
            case 'note':
                return <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.content}</p>;
            case 'image':
                 return (
                    <div className="aspect-square w-full rounded-md overflow-hidden">
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
        <Card>
            <CardContent className="p-4 flex justify-center items-center">
                {renderPublicView()}
            </CardContent>
        </Card>
    )
};
