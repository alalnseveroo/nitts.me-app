
'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsCardProps {
    viewCount: number | null
    period: 'today' | '7d' | '30d'
    onPeriodChange: (period: 'today' | '7d' | '30d') => void
}

const periods = [
    { label: 'Hoje', value: 'today' as const },
    { label: '7 dias', value: '7d' as const },
    { label: '30 dias', value: '30d' as const },
]

export default function AnalyticsCard({ viewCount, period, onPeriodChange }: AnalyticsCardProps) {
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        const activeTabIndex = periods.findIndex(p => p.value === period);
        const activeTab = tabsRef.current[activeTabIndex];
        
        if (activeTab) {
            setIndicatorStyle({
                left: activeTab.offsetLeft,
                width: activeTab.offsetWidth,
            });
        }
    }, [period]);

    return (
        <Card className="shadow-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Análise de dados</CardTitle>
                <div className="relative flex items-center gap-1 bg-muted p-1 rounded-lg">
                    {periods.map((p, index) => (
                       <button
                            key={p.value}
                            ref={el => tabsRef.current[index] = el}
                            onClick={() => onPeriodChange(p.value)}
                            className={cn(
                                'relative z-10 h-7 px-3 text-xs rounded-md transition-colors',
                                period === p.value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                            )}
                            type="button"
                        >
                           {p.label}
                       </button>
                    ))}
                    <div 
                        className="absolute bg-background shadow-sm rounded-md h-7 transition-all duration-300 ease-in-out"
                        style={indicatorStyle}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{viewCount ?? '-'}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                   <Eye className="h-3 w-3" />
                   Visualizações de página
                </p>
            </CardContent>
        </Card>
    )
}
