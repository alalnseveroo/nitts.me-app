
'use client'

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Timeframe = 'today' | '7days' | '30days';

interface AnalyticsCardProps {
    viewCount: number;
    onTimeframeChange: (days: number) => void;
}

const timeframeMap: Record<Timeframe, number> = {
    today: 1,
    '7days': 7,
    '30days': 30,
};

const AnalyticsEyesIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="10" width="4" height="4" rx="2" fill="#4A4A4A"/>
        <rect x="15" y="10" width="4" height="4" rx="2" fill="#4A4A4A"/>
    </svg>
)

export function AnalyticsCard({ viewCount, onTimeframeChange }: AnalyticsCardProps) {
    const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('7days');

    const handleTimeframeClick = (timeframe: Timeframe) => {
        setActiveTimeframe(timeframe);
        onTimeframeChange(timeframeMap[timeframe]);
    };

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Análise de dados</h3>
                
                <div className="bg-muted p-1 rounded-lg flex justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => handleTimeframeClick('today')}
                        className={cn(
                            "flex-1 text-muted-foreground hover:bg-background",
                            activeTimeframe === 'today' && "bg-background text-foreground shadow-sm"
                        )}
                    >
                        Hoje
                    </Button>
                     <Button
                        variant="ghost"
                        onClick={() => handleTimeframeClick('7days')}
                        className={cn(
                            "flex-1 text-muted-foreground hover:bg-background",
                            activeTimeframe === '7days' && "bg-background text-foreground shadow-sm"
                        )}
                    >
                        7 dias
                    </Button>
                     <Button
                        variant="ghost"
                        onClick={() => handleTimeframeClick('30days')}
                        className={cn(
                            "flex-1 text-muted-foreground hover:bg-background",
                            activeTimeframe === '30days' && "bg-background text-foreground shadow-sm"
                        )}
                    >
                        30 dias
                    </Button>
                </div>

                <div className="border rounded-lg flex items-center p-2 gap-2">
                    <div className="bg-muted p-2 rounded-md">
                        <AnalyticsEyesIcon />
                    </div>
                    <span className="font-bold text-lg text-foreground">
                        {new Intl.NumberFormat('pt-BR').format(viewCount)} visualizações
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
