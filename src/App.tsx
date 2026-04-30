import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster, toast } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { LeftPanel } from '@/components/LeftPanel';
import { MiddlePanel } from '@/components/MiddlePanel';
import { RightPanel } from '@/components/RightPanel';
import { ProjectState } from './types';
import { generatePrompt } from './lib/promptGenerator';
import { GoogleGenAI } from "@google/genai";
import { Plus, Layers, Image as ImageIcon, RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import localforage from 'localforage';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const INITIAL_STATE: ProjectState = {
  id: 'project-1',
  name: 'Dự án mới',
  mode: 'manual',
  currentPhoto: null,
  selectedSpace: 'bathroom',
  materialAssignments: [
    {
      id: '1',
      surface: 'floor',
      material: 'floor_tile',
      description: 'Gạch lát sàn chống trơn',
      referencePhoto: null,
    },
    {
      id: '2',
      surface: 'wall',
      material: 'wall_tile',
      description: 'Gạch ốp tường bóng kiếng',
      referencePhoto: null,
    }
  ],
  referencePhotos: [],
  detailedDescription: '',
  constraints: {
    preserveArchitecture: true,
    preservePerspective: true,
    preserveLighting: true,
    preserveScale: true,
    noExtraObjects: true,
    realisticPhoto: true,
  },
  advanced: {
    intensity: 80,
    brightness: 50,
    sharpness: 70,
    creativity: 30,
  },
  generatedPrompt: '',
  maskData: null,
  results: [],
  selectedResultIndex: null,
  activeMiddleTab: 'original',
  history: [],
};

export default function App() {
  const [state, setState] = useState<ProjectState>(INITIAL_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'prompt' | 'results' | 'history'>('prompt');
  const [activeMobileView, setActiveMobileView] = useState<'config' | 'editor' | 'results'>('editor');

  // Load state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await localforage.getItem<ProjectState>('app_workspace_state');
        const savedHistory = await localforage.getItem<any[]>('app_history');
        const savedResults = await localforage.getItem<string[]>('app_results');
        
        if (savedState) {
          // Filter out temporary blob URLs from saved state so they don't break the UI
          if (savedState.currentPhoto?.startsWith('blob:')) savedState.currentPhoto = null;
          savedState.referencePhotos = savedState.referencePhotos.filter(p => !p.startsWith('blob:'));
          savedState.materialAssignments = savedState.materialAssignments.map(a => ({
            ...a,
            referencePhoto: a.referencePhoto?.startsWith('blob:') ? null : a.referencePhoto
          }));
          setState(savedState);
        } else if (savedHistory || savedResults) {
          setState(prev => ({
            ...prev,
            history: savedHistory || prev.history,
            results: savedResults || prev.results,
          }));
        }
      } catch (e) {
        console.error("Error loading state from localforage", e);
      }
    };
    
    loadState();
  }, []);

  // Save state on change
  useEffect(() => {
    // Debounce saving state to avoid excessive IndexedDB writes
    const timer = setTimeout(async () => {
      try {
        await localforage.setItem('app_workspace_state', state);
        await localforage.setItem('app_history', state.history); // keep old ones for backwards compat
        await localforage.setItem('app_results', state.results);
      } catch (e) {
        console.error("Error saving state to localforage", e);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    const prompt = generatePrompt(state);
    setState(prev => ({ ...prev, generatedPrompt: prompt }));
  }, [
    state.mode,
    state.detailedDescription,
    state.referencePhotos,
    state.selectedSpace,
    state.materialAssignments,
    state.constraints
  ]);

  const applyWatermark = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Load watermark
        const watermark = new Image();
        watermark.crossOrigin = "anonymous";
        watermark.onload = () => {
          // Calculate watermark size (e.g., 10% of image width)
          const watermarkWidth = img.width * 0.1;
          const watermarkHeight = (watermark.height / watermark.width) * watermarkWidth;
          
          // Position: bottom right with margin
          const margin = img.width * 0.03;
          const x = img.width - watermarkWidth - margin;
          const y = img.height - watermarkHeight - margin;

          // Draw watermark with opacity
          ctx.globalAlpha = 0.5;
          ctx.drawImage(watermark, x, y, watermarkWidth, watermarkHeight);
          ctx.globalAlpha = 1.0;

          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        watermark.onerror = () => resolve(imageUrl);
        watermark.src = "https://w.ladicdn.com/s250x250/64ef6b7f0b7ff20012403c07/phucuongtt-20260428105854-xcj9l.png";
      };
      img.onerror = () => resolve(imageUrl);
      img.src = imageUrl;
    });
  };

  const handleGenerate = async () => {
    if (!state.currentPhoto) {
      toast.error("Vui lòng tải ảnh hiện trạng trước khi tạo.");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("Đang phân tích không gian và áp vật liệu...");
    
    try {
      const prompt = generatePrompt(state);
      
      // Convert current photo to base64 and get dimensions
      const currentPhotoBlob = await fetch(state.currentPhoto).then(r => r.blob());
      const currentPhotoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(currentPhotoBlob);
      });

      // Get aspect ratio
      const img = new Image();
      img.src = state.currentPhoto;
      await img.decode();
      const ratio = img.width / img.height;
      let geminiAspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1";
      if (ratio > 1.5) geminiAspectRatio = "16:9";
      else if (ratio > 1.1) geminiAspectRatio = "4:3";
      else if (ratio < 0.6) geminiAspectRatio = "9:16";
      else if (ratio < 0.9) geminiAspectRatio = "3:4";

      const parts: any[] = [
        { text: prompt },
        { inlineData: { data: currentPhotoBase64, mimeType: currentPhotoBlob.type } }
      ];

      // Add mask data if available
      if (state.maskData) {
        const maskBase64 = state.maskData.split(',')[1];
        parts.push({ 
          inlineData: { 
            data: maskBase64, 
            mimeType: "image/png" 
          } 
        });
        // Adjust the text prompt to emphasize masking
        parts[0].text = `CHỈ thay đổi vật liệu trong vùng được đánh dấu bằng mặt nạ màu xanh trong ảnh mặt nạ đi kèm. Giữ nguyên toàn bộ các phần khác của ảnh gốc. Yêu cầu: ${prompt}`;
      }

      // Add reference photos
      const referencePhotosToProcess: string[] = [];
      if (state.mode === 'structured') {
        state.materialAssignments.forEach(a => {
          if (a.referencePhoto) referencePhotosToProcess.push(a.referencePhoto);
        });
      } else {
        referencePhotosToProcess.push(...state.referencePhotos);
      }

      if (referencePhotosToProcess.length > 0) {
        toast.loading("Đang xử lý ảnh mẫu sản phẩm...", { id: loadingToast });
        
        for (const photoUrl of referencePhotosToProcess) {
          const refBlob = await fetch(photoUrl).then(r => r.blob());
          const refBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(refBlob);
          });
          parts.push({ inlineData: { data: refBase64, mimeType: refBlob.type } });
        }
      }

      toast.loading("AI đang tạo ảnh hoàn thiện chân thực...", { id: loadingToast });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: geminiAspectRatio
          }
        }
      });

      let generatedImageUrl = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          generatedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!generatedImageUrl) {
        throw new Error("Không tìm thấy ảnh trong phản hồi từ AI.");
      }
      
      toast.loading("Đang đóng dấu bản quyền...", { id: loadingToast });
      const watermarkedImageUrl = await applyWatermark(generatedImageUrl);

      setState(prev => ({
        ...prev,
        results: [watermarkedImageUrl, ...prev.results],
        selectedResultIndex: 0,
        activeMiddleTab: 'result',
        history: [
          {
            timestamp: Date.now(),
            prompt: prompt,
            result: watermarkedImageUrl,
          },
          ...prev.history,
        ],
      }));
      
      setRightPanelTab('results');
      setActiveMobileView('results');
      toast.success("Đã tạo ảnh hoàn thiện thành công!", { id: loadingToast });
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Có lỗi xảy ra khi tạo ảnh. Vui lòng thử lại.", { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    // @ts-ignore - ThemeProvider children type mismatch in React 19
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
          <div className="flex flex-col flex-1 min-w-0">
            <Header state={state} onGenerate={handleGenerate} isGenerating={isGenerating} />
            <main className="flex flex-1 overflow-hidden relative">
              <div className="flex flex-1 overflow-hidden divide-x divide-border">
                {/* Left Panel: Configuration & Generate */}
                <div className={cn(
                  "w-full md:w-[340px] flex-shrink-0 flex flex-col bg-background absolute inset-0 z-20 md:relative md:inset-auto md:flex",
                  activeMobileView === 'config' ? "flex" : "hidden md:flex"
                )}>
                  <div className="flex-1 overflow-y-auto">
                    <LeftPanel state={state} setState={setState} />
                  </div>
                  <div className="p-4 border-t border-border bg-background shrink-0 mt-auto">
                    <Button 
                      onClick={handleGenerate} 
                      disabled={isGenerating || !state.currentPhoto}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 font-bold shadow-lg shadow-teal-600/20 text-[13px]"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <span className="animate-spin text-lg">⚙️</span>
                          Đang xử lý AI...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">✨</span>
                          Tạo ảnh hoàn thiện
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Middle Panel: Workspace */}
                <div className={cn(
                  "flex-1 flex flex-col overflow-hidden bg-neutral-900 absolute inset-0 md:relative md:inset-auto md:flex",
                  activeMobileView === 'editor' ? "flex" : "hidden md:flex"
                )}>
                  <MiddlePanel 
                    state={state} 
                    setState={setState} 
                    activeTab={state.activeMiddleTab} 
                    setActiveTab={(tab) => setState(prev => ({ ...prev, activeMiddleTab: tab }))} 
                  />
                </div>

                {/* Right Panel: Results & Prompts */}
                <div className={cn(
                  "w-full md:w-80 flex-shrink-0 flex flex-col bg-background absolute inset-0 z-20 md:relative md:inset-auto md:flex",
                  activeMobileView === 'results' ? "flex" : "hidden md:flex"
                )}>
                  <div className="flex-1 overflow-y-auto">
                    <RightPanel 
                      state={state} 
                      setState={setState} 
                      isGenerating={isGenerating} 
                      onGenerate={handleGenerate}
                      activeTab={rightPanelTab}
                      setActiveTab={setRightPanelTab}
                    />
                  </div>
                </div>
              </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden h-16 border-t border-border bg-background flex items-center justify-around px-2 shrink-0 z-30">
              <button 
                onClick={() => setActiveMobileView('config')}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
                  activeMobileView === 'config' ? "text-teal-600" : "text-muted-foreground"
                )}
              >
                <div className="p-1 rounded-md bg-muted/50">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">CÀI ĐẶT</span>
              </button>

              <button 
                onClick={() => setActiveMobileView('editor')}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
                  activeMobileView === 'editor' ? "text-teal-600" : "text-muted-foreground"
                )}
              >
                <div className="p-1 rounded-md bg-muted/50">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">BIÊN TẬP</span>
              </button>

              <button 
                onClick={() => setActiveMobileView('results')}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors relative",
                  activeMobileView === 'results' ? "text-teal-600" : "text-muted-foreground"
                )}
              >
                <div className="p-1 rounded-md bg-muted/50">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">KẾT QUẢ</span>
                {state.results.length > 0 && !isGenerating && activeMobileView !== 'results' && (
                  <span className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full animate-bounce" />
                )}
              </button>
            </div>
          </div>
        </div>
        <Toaster position="top-center" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
