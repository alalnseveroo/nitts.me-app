
'use client'

import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import type { Layout } from 'react-grid-layout';
import type { CardData } from '@/app/[username]/page';
import { ElementCard } from '@/components/ui/element-card';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface PublicProfileGridProps {
    cards: CardData[];
    layoutConfig: Layout[] | null;
}

export default function PublicProfileGrid({ cards, layoutConfig }: PublicProfileGridProps) {
    if (cards.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Este perfil ainda não tem cards.
                </p>
            </div>
        );
    }
  
  const savedLayout = layoutConfig || [];
  const layoutMap = new Map(savedLayout.map(l => [l.i, l]));

  const finalLayout = cards.map((card, index) => {
      const existingLayout = layoutMap.get(card.id);
      const cols = 4; // Assuming desktop view default for server render
      const mobileCols = 2;

      if (existingLayout) {
          return {
              ...existingLayout,
              i: String(existingLayout.i), 
              x: existingLayout.x ?? 0,
              y: existingLayout.y ?? index,
              w: existingLayout.w ?? (card.type === 'title' ? cols : 1),
              h: existingLayout.h ?? (card.type === 'title' ? 0.5 : 1),
          };
      }
      return { 
          i: card.id, 
          x: (index % cols), 
          y: Math.floor(index / cols), 
          w: card.type === 'title' ? cols : 1, 
          h: card.type === 'title' ? 0.5 : 1 
      };
  });
  
  return (
    <ResponsiveGridLayout
        layouts={{ lg: finalLayout, sm: finalLayout }}
        breakpoints={{ lg: 768, sm: 0 }}
        cols={{ lg: 4, sm: 2 }}
        rowHeight={100} // A static rowHeight is better for SSR
        isDraggable={false}
        isResizable={false}
        compactType="vertical"
        margin={[10, 10]}
        containerPadding={[0, 0]}
        className="min-h-[400px]"
    >
        {cards.map(card => {
            const layout = finalLayout.find(l => l.i === card.id) || {x:0, y:0, w:1, h:1, i: card.id };
            return (
                <div key={card.id} data-grid={layout}>
                    <ElementCard data={card} />
                </div>
            )
        })}
    </ResponsiveGridLayout>
  );
}
