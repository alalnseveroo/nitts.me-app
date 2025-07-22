
'use client'

import { Button } from '@/components/ui/button';
import { Square, RectangleHorizontal, RectangleVertical, Crop } from 'lucide-react';

interface CardResizeControlsProps {
    onResize: (w: number, h: number) => void;
}

export const CardResizeControls = ({ onResize }: CardResizeControlsProps) => {
    return (
        <div className="flex gap-1 items-center">
            {/* Quadrado (1x1) */}
            <Button title="Quadrado" variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-neutral-700 hover:text-white" onClick={() => onResize(1, 1)}>
                <Square className="h-4 w-4" />
            </Button>
            {/* Banner (2x1) */}
            <Button title="Banner" variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-neutral-700 hover:text-white" onClick={() => onResize(2, 1)}>
                <RectangleHorizontal className="h-4 w-4" />
            </Button>
            {/* Retangulo (1x2) */}
            <Button title="Retângulo" variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-neutral-700 hover:text-white" onClick={() => onResize(1, 2)}>
                <RectangleVertical className="h-4 w-4" />
            </Button>
            {/* Grande (2x2) */}
            <Button title="Grande" variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-neutral-700 hover:text-white" onClick={() => onResize(2, 2)}>
                <Crop className="h-4 w-4" />
            </Button>
        </div>
    );
};

    