
'use client'

import { Button } from '@/components/ui/button';
import { Square, RectangleHorizontal, RectangleVertical, Crop } from 'lucide-react';

interface CardResizeControlsProps {
    onResize: (w: number, h: number) => void;
}

export const CardResizeControls = ({ onResize }: CardResizeControlsProps) => {
    return (
        <div className="flex gap-1 items-center justify-center">
            <Button title="Quadrado (1x1)" variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:bg-white/20 hover:text-white" onClick={() => onResize(1, 1)}>
                <Square className="h-5 w-5" />
            </Button>
            <Button title="Banner (2x1)" variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:bg-white/20 hover:text-white" onClick={() => onResize(2, 1)}>
                <RectangleHorizontal className="h-5 w-5" />
            </Button>
            <Button title="Retângulo (1x2)" variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:bg-white/20 hover:text-white" onClick={() => onResize(1, 2)}>
                <RectangleVertical className="h-5 w-5" />
            </Button>
            <Button title="Grande (2x2)" variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:bg-white/20 hover:text-white" onClick={() => onResize(2, 2)}>
                <Crop className="h-5 w-5" />
            </Button>
        </div>
    );
};
