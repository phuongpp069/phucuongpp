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

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `phu-cuong-result-${state.id}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đang tải ảnh xuống...");
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
                    Gợi ý nhanh (Presets)
                  </Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_PROMPTS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setState(prev => ({ ...prev, selectedSpace: preset.space as any }))}
                      className="text-left px-3 py-2 rounded-lg border border-border bg-background hover:border-teal-600/50 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-all group"
                    >
                      <p className="text-[10px] font-bold text-teal-600 mb-0.5 uppercase tracking-tighter">
                        {preset.space.replace('_', ' ')}
                      </p>
                      <p className="text-xs font-medium line-clamp-1 group-hover:text-teal-700 dark:group-hover:text-teal-400">
                        {preset.name}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

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
                        <Button variant="link" className="h-auto p-0 text-[10px] text-teal-600 font-bold uppercase tracking-wider">
                          Dùng lại prompt này
                        </Button>
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
                    <p className="text-xs max-w-[200px]">Cấu hình và nhấn nút Tạo ảnh để xem phương án hoàn thiện</p>
                  </div>
                  <Button 
                    onClick={onGenerate} 
                    disabled={isGenerating || !state.currentPhoto}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Bắt đầu ngay
                  </Button>
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

      <div className="p-4 border-t border-border bg-background shrink-0">
        <Button 
          onClick={onGenerate} 
          disabled={isGenerating || !state.currentPhoto}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11 font-bold shadow-lg shadow-teal-600/20"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Đang xử lý AI...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Tạo ảnh hoàn thiện
            </div>
          )}
        </Button>
        <p className="text-[10px] text-center text-muted-foreground mt-3">
          Sử dụng 1 credit cho mỗi lần tạo. <a href="#" className="text-teal-600 font-bold">Nâng cấp gói</a>
        </p>
      </div>
    </div>
  );
}
