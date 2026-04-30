import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Hand, 
  Square, 
  Brush, 
  Eraser, 
  Undo, 
  Redo,
  MousePointer2,
  Scan,
  Lasso
} from 'lucide-react';
import { ProjectState } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MiddlePanelProps {
  state: ProjectState;
  setState: React.Dispatch<React.SetStateAction<ProjectState>>;
  activeTab: 'original' | 'mask' | 'result';
  setActiveTab: (tab: 'original' | 'mask' | 'result') => void;
}

const BeforeAfterSlider = ({ before, after }: { before: string, after: string }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, position)));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-ew-resize group/slider select-none"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      onTouchStart={(e) => { handleMove(e); e.stopPropagation(); }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Before Image (Base) */}
      <img 
        src={before} 
        alt="Before" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
      />
      
      {/* After Image Container (Clipped) - Shows on the right side */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      >
        <img 
          src={after} 
          alt="After" 
          className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
        />
        <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none">
          <p className="text-white/60 text-xs font-normal bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm text-center">
            Đây là bản vẽ concept tham khảo, không dùng để thi công!
          </p>
        </div>
      </div>

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
  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'rect' | 'brush' | 'erase' | 'lasso'>('select');
  const [dragAction, setDragAction] = useState<'pan' | 'draw' | 'none'>('none');
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const prevActiveTab = useRef(activeTab);

  useEffect(() => {
    if (activeTab === 'result' && prevActiveTab.current !== 'result') {
      setPanOffset({ x: 0, y: 0 });
      setZoom(100);
    }
    prevActiveTab.current = activeTab;
  }, [activeTab]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCurrentPoints([]);
        setDragAction('none');
      }
      if (e.key === 'r') setActiveTool('rect');
      if (e.key === 'b') setActiveTool('brush');
      if (e.key === 'e') setActiveTool('erase');
      if (e.key === 'l') setActiveTool('lasso');
      if (e.key === 'p') setActiveTool('pan');
      if (e.key === 'v') setActiveTool('select');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Chọn / Kéo' },
    { id: 'pan', icon: Hand, label: 'Kéo' },
    { id: 'rect', icon: Square, label: 'Vùng chọn (R)' },
    { id: 'brush', icon: Brush, label: 'Vẽ mask (B)' },
    { id: 'erase', icon: Eraser, label: 'Xóa mask (E)' },
    { id: 'lasso', icon: Lasso, label: 'Zic-zac (L)' },
  ];

  // Wheel zoom and pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // If pressing Ctrl or Cmd, zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomDelta = -e.deltaY * 0.5;
        setZoom(z => Math.max(10, Math.min(500, z + zoomDelta)));
      } else {
        // Pan
        e.preventDefault();
        setPanOffset(p => {
          const containerWidth = container.clientWidth || 800;
          const containerHeight = container.clientHeight || 600;
          const limitX = containerWidth * 0.3;
          const limitY = containerHeight * 0.3;

          return {
            x: Math.max(-limitX, Math.min(limitX, p.x - e.deltaX)),
            y: Math.max(-limitY, Math.min(limitY, p.y - e.deltaY))
          };
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Initialize or resize canvas when image loads
  useEffect(() => {
    if (imageRef.current && canvasRef.current) {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // If we have existing mask data, load it
      if (state.maskData) {
        const ctx = canvas.getContext('2d');
        const maskImg = new Image();
        maskImg.onload = () => ctx?.drawImage(maskImg, 0, 0);
        maskImg.src = state.maskData;
      }
    }
  }, [state.currentPhoto, state.maskData]);

  const getMousePos = (e: React.MouseEvent | MouseEvent): Point => {
    if (!canvasRef.current || !imageRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const isMaskTab = activeTab === 'mask';
    const isMiddleClick = 'button' in e && e.button === 1;
    const shouldPan = !isMaskTab || activeTool === 'pan' || activeTool === 'select' || isMiddleClick;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (shouldPan) {
      setDragAction('pan');
      setStartPoint({ x: clientX, y: clientY });
      return;
    }

    if (!isMaskTab) return;

    const pos = getMousePos({ clientX, clientY } as MouseEvent);
    setDragAction('draw');
    setStartPoint(pos);

    if (activeTool === 'lasso') {
      if (currentPoints.length > 0) {
        // Check if clicking near start point to close
        const dist = Math.hypot(pos.x - currentPoints[0].x, pos.y - currentPoints[0].y);
        if (dist < 15 / (zoom / 100)) {
          finishLasso();
          return;
        }
      }
      setCurrentPoints([...currentPoints, pos]);
    } else if (activeTool === 'brush' || activeTool === 'erase') {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 20;
        ctx.globalCompositeOperation = activeTool === 'erase' ? 'destination-out' : 'source-over';
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.8)';
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const pos = getMousePos({ clientX, clientY } as MouseEvent);
    setMousePos(pos);

    if (dragAction === 'none' && activeTool !== 'lasso') return;

    if (dragAction === 'pan' && startPoint) {
      const dx = clientX - startPoint.x;
      const dy = clientY - startPoint.y;
      
      // Constrain panning to keep image visibly on screen
      const containerWidth = containerRef.current?.clientWidth || 800;
      const containerHeight = containerRef.current?.clientHeight || 600;
      
      // Limit panning so the image center stays within the central 30% of the screen (stricter)
      const limitX = containerWidth * 0.3;
      const limitY = containerHeight * 0.3;

      setPanOffset({
        x: Math.max(-limitX, Math.min(limitX, panOffset.x + dx)),
        y: Math.max(-limitY, Math.min(limitY, panOffset.y + dy))
      });
      setStartPoint({ x: clientX, y: clientY });
      return;
    }

    if (dragAction === 'draw' && (activeTool === 'brush' || activeTool === 'erase')) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragAction === 'pan') {
      setDragAction('none');
      setStartPoint(null);
      return;
    }

    if (activeTool === 'rect' && startPoint && dragAction === 'draw') {
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
      const pos = getMousePos({ clientX, clientY } as MouseEvent);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(20, 184, 166, 0.5)';
        ctx.fillRect(
          Math.min(startPoint.x, pos.x),
          Math.min(startPoint.y, pos.y),
          Math.abs(pos.x - startPoint.x),
          Math.abs(pos.y - startPoint.y)
        );
      }
    }

    if (dragAction === 'draw' && activeTool !== 'lasso') {
      setDragAction('none');
      setStartPoint(null);
      saveMask();
    }
  };

  const finishLasso = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && currentPoints.length > 2) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(20, 184, 166, 0.5)';
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      currentPoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fill();
    }
    setCurrentPoints([]);
    setDragAction('none');
    setStartPoint(null);
    saveMask();
  };

  const saveMask = () => {
    if (canvasRef.current) {
      const data = canvasRef.current.toDataURL();
      setState(prev => ({ ...prev, maskData: data }));
    }
  };

  const clearMask = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveMask();
    }
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

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-md px-1">
            <Button variant="ghost" size="icon" className="w-7 h-7 sm:w-8 sm:h-8" onClick={() => setZoom(Math.max(10, zoom - 10))}>
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <span className="text-[9px] sm:text-[10px] font-medium w-6 sm:w-8 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" className="w-7 h-7 sm:w-8 sm:h-8" onClick={() => setZoom(Math.min(500, zoom + 10))}>
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="hidden sm:flex w-8 h-8" onClick={() => { setZoom(100); setPanOffset({x:0,y:0}); }}>
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
        onMouseLeave={() => {
          if (dragAction !== 'none') {
            setDragAction('none');
            setStartPoint(null);
          }
        }}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {(state.currentPhoto || (activeTab === 'result' && state.results.length > 0)) ? (
          <div 
            className="relative shadow-2xl transition-transform duration-200 ease-out"
            style={{ 
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`,
              cursor: activeTab !== 'mask' ? (dragAction === 'pan' ? 'grabbing' : 'grab') : (activeTool === 'pan' ? (dragAction === 'pan' ? 'grabbing' : 'grab') : 'crosshair'),
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
                {state.currentPhoto ? (
                  <img 
                    ref={imageRef}
                    src={state.currentPhoto} 
                    alt="Reference Base" 
                    className="max-w-full max-h-full object-contain opacity-0 pointer-events-none"
                    onLoad={() => {
                      // Trigger re-render to update imageRef.current
                      setState(prev => ({ ...prev }));
                    }}
                  />
                ) : (
                  <img 
                    ref={imageRef}
                    src={state.results[state.selectedResultIndex]} 
                    alt="Result Base" 
                    className="max-w-full max-h-full object-contain opacity-0 pointer-events-none"
                    onLoad={() => {
                      setState(prev => ({ ...prev }));
                    }}
                  />
                )}
                <div className="absolute inset-0">
                  {state.currentPhoto ? (
                    <BeforeAfterSlider 
                      before={state.currentPhoto} 
                      after={state.results[state.selectedResultIndex]} 
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full">
                      <img 
                        src={state.results[state.selectedResultIndex]} 
                        alt="Result" 
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10" 
                      />
                      <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none z-20">
                        <p className="text-white/60 text-xs font-normal bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm text-center">
                          Đây là bản vẽ concept tham khảo, không dùng để thi công!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <img 
                  ref={imageRef}
                  src={state.currentPhoto!} 
                  alt="Workspace" 
                  className="max-w-full max-h-full object-contain pointer-events-none"
                  onLoad={() => {
                    // Trigger canvas resize
                    setState(prev => ({ ...prev }));
                  }}
                />
                
                <canvas
                  ref={canvasRef}
                  className={cn(
                    "absolute inset-0 w-full h-full pointer-events-none",
                    activeTab === 'mask' ? "opacity-60" : "opacity-0"
                  )}
                  style={{ mixBlendMode: 'multiply' }}
                />
              </>
            )}

            {/* Lasso preview points and guide line */}
            {activeTab === 'mask' && activeTool === 'lasso' && currentPoints.length > 0 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {/* Visual guide line to closing point or current mouse */}
                <line 
                  x1={currentPoints[currentPoints.length - 1].x}
                  y1={currentPoints[currentPoints.length - 1].y}
                  x2={mousePos.x}
                  y2={mousePos.y}
                  stroke="white"
                  strokeWidth={1 / (zoom / 100)}
                  strokeDasharray="4"
                  opacity="0.6"
                />
                {/* Guide to first point to show it can be closed */}
                <line 
                  x1={currentPoints[0].x}
                  y1={currentPoints[0].y}
                  x2={mousePos.x}
                  y2={mousePos.y}
                  stroke="teal"
                  strokeWidth={1 / (zoom / 100)}
                  strokeDasharray="2"
                  opacity={Math.hypot(mousePos.x - currentPoints[0].x, mousePos.y - currentPoints[0].y) < 30 / (zoom / 100) ? "0.8" : "0"}
                />
                
                <polyline
                  points={currentPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="white"
                  strokeWidth={2 / (zoom / 100)}
                  strokeDasharray="4"
                />
                {currentPoints.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={(i === 0 ? 6 : 4) / (zoom / 100)}
                    fill={i === 0 ? (Math.hypot(mousePos.x - p.x, mousePos.y - p.y) < 15 / (zoom / 100) ? "#ef4444" : "teal") : "white"}
                    stroke="black"
                    strokeWidth={1 / (zoom / 100)}
                  />
                ))}
              </svg>
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

        {state.currentPhoto && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-md border border-border px-4 py-2 rounded-full shadow-xl flex items-center gap-4 pointer-events-none transition-opacity duration-300">
            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5"><Hand className="w-3.5 h-3.5" /> Kéo thả: Di chuyển</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5" /> Ctrl + Cuộn chuột: Thu phóng</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
