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

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const INITIAL_STATE: ProjectState = {
  id: 'project-1',
  name: 'Dự án mới',
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
  results: [],
  selectedResultIndex: null,
  activeMiddleTab: 'original',
  history: [],
};

export default function App() {
  const [state, setState] = useState<ProjectState>(INITIAL_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'prompt' | 'results' | 'history'>('prompt');

  useEffect(() => {
    const prompt = generatePrompt(state);
    setState(prev => ({ ...prev, generatedPrompt: prompt }));
  }, [
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
          // Calculate watermark size (e.g., 15% of image width)
          const watermarkWidth = img.width * 0.2;
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
        watermark.src = "https://w.ladicdn.com/s250x250/64ef6b7f0b7ff20012403c07/phucuongcompany-20260404133408-ebufp.jpg";
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

      // Add reference photos from assignments
      const assignmentsWithPhotos = state.materialAssignments.filter(a => a.referencePhoto);
      if (assignmentsWithPhotos.length > 0) {
        toast.loading("Đang xử lý ảnh mẫu sản phẩm...", { id: loadingToast });
        
        for (const assignment of assignmentsWithPhotos) {
          if (!assignment.referencePhoto) continue;
          const refBlob = await fetch(assignment.referencePhoto).then(r => r.blob());
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
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <Header state={state} onGenerate={handleGenerate} isGenerating={isGenerating} />
            <main className="flex flex-1 overflow-hidden">
              <div className="flex flex-1 overflow-hidden divide-x divide-border">
                <div className="w-80 flex-shrink-0 overflow-y-auto bg-muted/30">
                  <LeftPanel state={state} setState={setState} />
                </div>
                <div className="flex-1 overflow-hidden bg-muted/10">
                  <MiddlePanel 
                    state={state} 
                    setState={setState} 
                    activeTab={state.activeMiddleTab} 
                    setActiveTab={(tab) => setState(prev => ({ ...prev, activeMiddleTab: tab }))} 
                  />
                </div>
                <div className="w-96 flex-shrink-0 overflow-y-auto bg-muted/30">
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
            </main>
          </div>
        </div>
        <Toaster position="top-center" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
