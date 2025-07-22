'use client'

import { Button } from '@/components/ui/button';
import { Square, RectangleHorizontal, RectangleVertical, Crop } from 'lucide-react';

interface CardResizeControlsProps {
    onResize: (w: number, h: number) => void;
}

export const CardResizeControls = ({ onResize }: CardResizeControlsProps) => {
    return (
        <div className="flex gap-1">
            <Button title="Quadrado (1x1)" variant="ghost" size="icon" onClick={() => onResize(1, 1)}>
                <Square className="h-4 w-4" />
            </Button>
            <Button title="Retângulo (1x2)" variant="ghost" size="icon" onClick={() => onResize(1, 2)}>
                <RectangleVertical className="h-4 w-4" />
            </Button>
            <Button title="Banner (2x1)" variant="ghost" size="icon" onClick={() => onResize(2, 1)}>
                <RectangleHorizontal className="h-4 w-4" />
            </Button>
            <Button title="Grande (2x2)" variant="ghost" size="icon" onClick={() => onResize(2, 2)}>
                <Crop className="h-4 w-4" />
            </Button>
        </div>
    );
};
