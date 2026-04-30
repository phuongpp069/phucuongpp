import React, { useState } from 'react';
import { 
  Copy, 
  RefreshCw, 
  Download, 
  Share2, 
  History as HistoryIcon, 
  Check, 
  Sparkles,
  ChevronRight,
  Split
} from 'lucide-react';
import { ProjectState } from '@/types';
import { PRESET_PROMPTS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RightPanelProps {
  state: ProjectState;
  setState: React.Dispatch<React.SetStateAction<ProjectState>>;
  isGenerating: boolean;
  onGenerate: () => void;
  activeTab: 'prompt' | 'results' | 'history';
  setActiveTab: (tab: 'prompt' | 'results' | 'history') => void;
}

export function RightPanel({ 
  state, 
  setState, 
  isGenerating, 
  onGenerate,
  activeTab,
  setActiveTab
}: RightPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(state.generatedPrompt);
    setCopied(true);
    toast.success("Đã sao chép prompt vào bộ nhớ tạm");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (url: string, index: number) => {
    toast.info("Đang xử lý ảnh...");
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Setup watermark style
      const p = 8; // padding
      const fontSize = Math.max(12, Math.floor(img.width * 0.015)); // scalable font size
      
      // Text
      const text = "Đây là bản vẽ concept tham khảo, không dùng để thi công!";
      ctx.font = `400 ${fontSize}px sans-serif`;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;

      // Draw pill background
      const paddingX = fontSize * 0.8;
      const paddingY = fontSize * 0.4;
      const pillW = textWidth + paddingX * 2;
      const pillH = textHeight + paddingY * 2;
      const pillX = (img.width - pillW) / 2;
      const pillY = img.height - pillH - p;

      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
      ctx.fill();

      // Draw text
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, img.width / 2, pillY + pillH / 2);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `phu-cuong-result-${state.id}-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Đã tải ảnh xuống thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi khi tải ảnh xuống.");
      // Fallback
      const link = document.createElement('a');
      link.href = url;
      link.download = `phu-cuong-result-${state.id}-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async (url: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'PHÚ CƯỜNG COMPANY Result',
          text: 'Check out this AI-generated interior finish!',
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Đã sao chép liên kết ảnh");
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSelectResult = (index: number) => {
    setState(prev => ({
      ...prev,
      selectedResultIndex: index,
      activeMiddleTab: 'result'
    }));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="h-12 border-b border-border bg-background flex items-center px-4 shrink-0">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-full">
          <button 
            onClick={() => setActiveTab('prompt')}
            className={cn(
              "flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
              activeTab === 'prompt' ? "bg-background shadow-sm text-teal-600" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Prompt AI
          </button>
          <button 
            onClick={() => setActiveTab('results')}
            className={cn(
              "flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
              activeTab === 'results' ? "bg-background shadow-sm text-teal-600" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Kết quả
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
              activeTab === 'history' ? "bg-background shadow-sm text-teal-600" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Lịch sử
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {activeTab === 'prompt' && (
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Prompt tự động sinh
                  </Label>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                    {copied ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-teal-600/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-4 rounded-xl border border-teal-600/20 bg-teal-50/30 dark:bg-teal-950/10 font-mono text-[11px] leading-relaxed text-foreground min-h-[200px] whitespace-pre-wrap">
                    {state.generatedPrompt}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs gap-2">
                    <RefreshCw className="w-3 h-3" />
                    Làm mới
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs gap-2">
                    <Sparkles className="w-3 h-3" />
                    Tối ưu hóa
                  </Button>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              {state.results.length > 0 ? (
                <div className="space-y-4">
                  {state.results.map((url, i) => (
                    <div key={i} className="space-y-2">
                      <div 
                        className={cn(
                          "relative aspect-video rounded-xl overflow-hidden border group shadow-lg cursor-pointer transition-all",
                          state.selectedResultIndex === i && state.activeMiddleTab === 'result' ? "ring-2 ring-teal-600 border-transparent" : "border-border"
                        )}
                        onClick={() => handleSelectResult(i)}
                      >
                        <img src={url} alt={`Result ${i}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-1 flex justify-center pointer-events-none opacity-80 scale-75 origin-bottom">
                          <p className="text-white/70 text-[8px] font-normal bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm text-center">
                            Đây là bản vẽ concept tham khảo, không dùng để thi công!
                          </p>
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            className="rounded-full w-10 h-10"
                            onClick={(e) => { e.stopPropagation(); handleDownload(url, i); }}
                          >
                            <Download className="w-5 h-5" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            className="rounded-full w-10 h-10"
                            onClick={(e) => { e.stopPropagation(); handleSelectResult(i); }}
                          >
                            <Split className="w-5 h-5" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            className="rounded-full w-10 h-10"
                            onClick={(e) => { e.stopPropagation(); handleShare(url); }}
                          >
                            <Share2 className="w-5 h-5" />
                          </Button>
                        </div>
                        <Badge className="absolute top-3 left-3 bg-teal-600/90 backdrop-blur-sm border-none">
                          Phương án {state.results.length - i}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] text-muted-foreground font-medium">Tạo lúc: {new Date().toLocaleTimeString()}</span>
                        <div className="flex gap-2">
                          <Button 
                            variant="link" 
                            className="h-auto p-0 text-[10px] text-teal-600 font-bold uppercase tracking-wider"
                            onClick={() => {
                              setState(prev => ({
                                ...prev,
                                currentPhoto: url
                              }));
                              toast.success("Đã chuyển ảnh kết quả này thành ảnh hiện trạng!");
                            }}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Sửa tiếp
                          </Button>
                          <Button 
                            variant="link" 
                            className="h-auto p-0 text-[10px] text-teal-600 font-bold uppercase tracking-wider"
                            onClick={() => {
                              const histItem = state.history.find(h => h.result === url);
                              if (histItem) {
                                setState(prev => ({ ...prev, detailedDescription: histItem.prompt, mode: 'manual' }));
                                toast.success("Đã tải prompt vào form yêu cầu.");
                              }
                            }}
                          >
                            Dùng lại prompt
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Chưa có kết quả</p>
                    <p className="text-xs max-w-[200px]">Tính năng sẽ hiện kết quả sau khi AI xử lý xong</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {state.history.length > 0 ? (
                state.history.map((item, i) => (
                  <div 
                    key={i} 
                    className="flex gap-3 p-3 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      const resultIndex = state.results.indexOf(item.result);
                      if (resultIndex !== -1) {
                        handleSelectResult(resultIndex);
                      }
                    }}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border">
                      <img src={item.result} alt="History" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-600 uppercase">Version {state.history.length - i}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[11px] line-clamp-2 text-muted-foreground leading-relaxed">
                        {item.prompt}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 self-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-teal-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item.result, i);
                        }}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-50 space-y-2">
                  <HistoryIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs font-medium">Lịch sử trống</p>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
