import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Hand, 
  MousePointer2,
  Scan
} from 'lucide-react';
import { ProjectState } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MiddlePanelProps {
  state: ProjectState;
  setState: React.Dispatch<React.SetStateAction<ProjectState>>;
  activeTab: 'original' | 'result';
  setActiveTab: (tab: 'original' | 'result') => void;
}

const BeforeAfterSlider = ({ before, after }: { before: string, after: string }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, position)));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-ew-resize group/slider select-none"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      onTouchStart={handleMove}
    >
      {/* Before Image (Base) */}
      <img 
        src={before} 
        alt="Before" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
      />
      
      {/* After Image (Clipped) - Shows on the right side */}
      <img 
        src={after} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10" 
        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      />

      {/* Slider Handle Line */}
      <div 
        className="absolute top-0 bottom-0 z-20 w-1 bg-white/80 backdrop-blur-sm pointer-events-none shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      />

      {/* Slider Handle Circle */}
      <div 
        className="absolute top-1/2 z-30 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-2xl flex items-center justify-center border-2 border-teal-600 group-hover/slider:scale-110 transition-transform pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="flex gap-1">
          <div className="w-1 h-4 bg-teal-600 rounded-full" />
          <div className="w-1 h-4 bg-teal-600 rounded-full" />
        </div>
      </div>
      
      <div className="absolute top-6 left-6 z-30 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest pointer-events-none border border-white/10 shadow-lg">
        Hiện trạng
      </div>
      <div className="absolute top-6 right-6 z-30 bg-teal-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest pointer-events-none border border-white/10 shadow-lg">
        Hoàn thiện
      </div>
    </div>
  );
};

type Point = { x: number; y: number };

export function MiddlePanel({ state, setState, activeTab, setActiveTab }: MiddlePanelProps) {
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState<'select' | 'pan'>('select');
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Chọn' },
    { id: 'pan', icon: Hand, label: 'Kéo' },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'pan') {
      setIsPanning(true);
      setStartPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && startPoint && activeTool === 'pan') {
      setPanOffset({
        x: panOffset.x + (e.clientX - startPoint.x),
        y: panOffset.y + (e.clientY - startPoint.y)
      });
      setStartPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setStartPoint(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="h-12 border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto">
          <TabsList className="h-8">
            <TabsTrigger value="original" className="text-xs px-3">Ảnh gốc</TabsTrigger>
            {state.results.length > 0 && (
              <TabsTrigger value="result" className="text-xs px-3 bg-teal-600/10 text-teal-600 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                Kết quả {state.selectedResultIndex !== null ? `#${state.results.length - (state.selectedResultIndex || 0)}` : 'mới nhất'}
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1">
          <div className="flex items-center bg-muted rounded-md px-1 mr-2">
            {tools.map((tool) => (
              <div key={tool.id}>
                <Tooltip>
                  <TooltipTrigger
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "w-8 h-8 rounded-sm",
                      activeTool === tool.id ? "bg-background shadow-sm text-teal-600" : "text-muted-foreground"
                    )}
                    onClick={() => setActiveTool(tool.id as any)}
                  >
                    <tool.icon className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{tool.label}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-md px-1">
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setZoom(Math.max(10, zoom - 10))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-[10px] font-medium w-8 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setZoom(Math.min(500, zoom + 10))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { setZoom(100); setPanOffset({x:0,y:0}); }}>
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-neutral-900 flex items-center justify-center p-8 select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {(state.currentPhoto || (activeTab === 'result' && state.results.length > 0)) ? (
          <div 
            className="relative shadow-2xl transition-transform duration-200 ease-out"
            style={{ 
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`,
              cursor: activeTool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'default',
              aspectRatio: imageRef.current ? `${imageRef.current.naturalWidth}/${imageRef.current.naturalHeight}` : 'auto',
              width: imageRef.current ? 'auto' : '100%',
              height: imageRef.current ? 'auto' : '100%',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            {activeTab === 'result' && state.selectedResultIndex !== null ? (
              <div className="relative">
                {/* Use the original photo to drive the container size for consistent comparison */}
                <img 
                  ref={imageRef}
                  src={state.currentPhoto!} 
                  alt="Reference Base" 
                  className="max-w-full max-h-full object-contain opacity-0 pointer-events-none"
                  onLoad={() => {
                    // Trigger re-render to update imageRef.current
                    setState(prev => ({ ...prev }));
                  }}
                />
                <div className="absolute inset-0">
                  <BeforeAfterSlider 
                    before={state.currentPhoto!} 
                    after={state.results[state.selectedResultIndex]} 
                  />
                </div>
              </div>
            ) : (
              <img 
                ref={imageRef}
                src={state.currentPhoto!} 
                alt="Workspace" 
                className="max-w-full max-h-full object-contain pointer-events-none"
                onLoad={() => {
                  // Trigger re-render to update imageRef.current
                  setState(prev => ({ ...prev }));
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-neutral-500 gap-4">
            <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center">
              <Scan className="w-10 h-10 opacity-20" />
            </div>
            <p className="text-sm font-medium">Chưa có ảnh công trình để hiển thị</p>
            <p className="text-xs opacity-50">Tải ảnh ở cột bên trái để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}
