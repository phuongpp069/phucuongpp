import React, { useState } from 'react';
import { Upload, X, Plus, Ghost, LayoutTemplate, Library, Link as LinkIcon, Loader2, Lightbulb } from 'lucide-react';
import { ProjectState, SpaceType, SurfaceType, MaterialType, MaterialLibraryItem } from '@/types';
import { SPACE_OPTIONS, SURFACE_OPTIONS, MATERIAL_OPTIONS, MATERIAL_LIBRARY, ROOM_PROMPTS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn, fileToBase64 } from '@/lib/utils';
import { toast } from 'sonner';

interface LeftPanelProps {
  state: ProjectState;
  setState: React.Dispatch<React.SetStateAction<ProjectState>>;
}

function MaterialSelector({ onSelect, label }: { onSelect: (url: string) => void, label: string }) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const b64 = await fileToBase64(file);
      onSelect(b64);
    }
  };

  const handleLinkAdd = () => {
    if (!linkUrl) return;
    try {
      new URL(linkUrl);
      onSelect(linkUrl);
      setLinkUrl('');
      setIsLinkOpen(false);
    } catch {
      toast.error('Link không hợp lệ');
    }
  };

  return (
    <div className="flex gap-1 justify-center w-full">
      <label className="flex-1 flex flex-col items-center justify-center py-2 rounded-md border border-dashed border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
        <Upload className="w-3.5 h-3.5 text-muted-foreground mb-1" />
        <span className="text-[9px] font-medium text-center leading-tight">Tải lên</span>
        <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
      </label>

      <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
        <DialogTrigger className="flex-1 flex flex-col items-center justify-center py-2 rounded-md border border-dashed border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
          <Library className="w-3.5 h-3.5 text-teal-600 mb-1" />
          <span className="text-[9px] font-medium text-center leading-tight">Thư viện</span>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thư viện mẫu vật liệu</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {MATERIAL_LIBRARY.map((item) => (
              <div 
                key={item.id} 
                className="group cursor-pointer rounded-lg border border-border overflow-hidden hover:border-teal-500 hover:ring-1 hover:ring-teal-500 transition-all"
                onClick={() => {
                  onSelect(item.imageUrl);
                  setIsLibraryOpen(false);
                }}
              >
                <div className="aspect-square bg-muted relative">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm" variant="secondary" className="text-xs">Chọn</Button>
                  </div>
                </div>
                <div className="p-2 space-y-1 bg-background">
                  <p className="text-[10px] font-bold text-teal-600">{item.code}</p>
                  <p className="text-xs font-medium line-clamp-1" title={item.name}>{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.size}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
        <DialogTrigger className="flex-1 flex flex-col items-center justify-center py-2 rounded-md border border-dashed border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
          <LinkIcon className="w-3.5 h-3.5 text-blue-600 mb-1" />
          <span className="text-[9px] font-medium text-center leading-tight">Link URL</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nhập Link Ảnh URL</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <Button type="button" onClick={handleLinkAdd} size="sm">
              Thêm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function LeftPanel({ state, setState }: LeftPanelProps) {
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const b64 = await fileToBase64(file);
      setState(prev => ({ ...prev, currentPhoto: b64 }));
    }
  };

  const handleReferencePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos: string[] = [];
      for (let i = 0; i < files.length; i++) {
        newPhotos.push(await fileToBase64(files[i]));
      }
      setState(prev => ({
        ...prev,
        referencePhotos: [...prev.referencePhotos, ...newPhotos]
      }));
    }
  };

  const removeReferencePhoto = (index: number) => {
    setState(prev => ({
      ...prev,
      referencePhotos: prev.referencePhotos.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <section>
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
          Ảnh hiện trạng
        </Label>
        {state.currentPhoto ? (
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border group">
            <img src={state.currentPhoto} alt="Current" className="w-full h-full object-cover" />
            <button 
              onClick={() => setState(prev => ({ ...prev, currentPhoto: null }))}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm font-medium">Tải ảnh công trình</span>
            <span className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG</span>
            <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
          </label>
        )}
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-6">
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Ảnh mẫu sản phẩm (Vật liệu)
          </Label>
          
          <div className="grid grid-cols-2 gap-2">
            {state.referencePhotos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-border group">
                <img src={photo} alt={`Sample ${index}`} className="w-full h-full object-cover" />
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-teal-600 text-white text-[9px] font-bold rounded shadow-sm">
                  MẪU {index + 1}
                </div>
                <button 
                  onClick={() => removeReferencePhoto(index)}
                  className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          <MaterialSelector 
            label="Thêm mẫu" 
            onSelect={(url) => setState(prev => ({ ...prev, referencePhotos: [...prev.referencePhotos, url] }))} 
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Mô tả chi tiết yêu cầu
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex shrink-0 items-center justify-center border border-transparent whitespace-nowrap focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 hover:bg-teal-50 hover:text-teal-700 aria-expanded:bg-teal-50 h-6 px-2 text-[10px] text-teal-600 font-medium rounded-[min(var(--radius-md),12px)] transition-all outline-none"
                title="Chọn gợi ý mẫu phòng chức năng"
              >
                <Lightbulb className="w-3 h-3 justify-center mr-1" />
                Gợi ý Prompt
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {ROOM_PROMPTS.map((rp, index) => (
                  <DropdownMenuItem 
                    key={index}
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      detailedDescription: rp.prompt 
                    }))}
                  >
                    {rp.roomName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Textarea 
            placeholder="Bạn muốn thay đổi những gì? Ví dụ: Lát nền bằng gạch mẫu 1, ốp tường bằng gạch mẫu 2..." 
            className="resize-none h-32 text-xs leading-relaxed"
            value={state.detailedDescription}
            onChange={(e) => setState(prev => ({ ...prev, detailedDescription: e.target.value }))}
          />
          <p className="text-[10px] text-muted-foreground italic">
            * Mẹo: Mô tả càng chi tiết vị trí ứng dụng cho từng mẫu ảnh sẽ cho kết quả tốt hơn.
          </p>
        </div>
      </section>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="constraints" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline font-semibold text-sm text-teal-700">
            Ràng buộc AI
          </AccordionTrigger>
          <AccordionContent className="pt-2 space-y-3">
            {Object.entries(state.constraints).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="text-xs font-normal cursor-pointer">
                  {key === 'preserveArchitecture' && 'Giữ nguyên kiến trúc gốc'}
                  {key === 'preservePerspective' && 'Giữ đúng phối cảnh'}
                  {key === 'preserveLighting' && 'Giữ nguyên ánh sáng thật'}
                  {key === 'preserveScale' && 'Giữ tỷ lệ thực tế sản phẩm'}
                  {key === 'noExtraObjects' && 'Không thêm vật thể lạ'}
                  {key === 'realisticPhoto' && 'Ưu tiên ảnh giống chụp thật'}
                </Label>
                <Checkbox 
                  id={key} 
                  checked={value as boolean} 
                  onCheckedChange={(checked) => setState(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, [key]: !!checked }
                  }))}
                />
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advanced" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline font-semibold text-sm text-teal-700">
            Thiết lập nâng cao
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <Label>Cường độ tuân theo mẫu</Label>
                <div className="flex items-center gap-1">
                  <Input 
                    type="number" 
                    value={state.advanced.intensity} 
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                      if (!isNaN(val)) {
                        const constrained = Math.max(0, Math.min(100, val));
                        setState(prev => ({ ...prev, advanced: { ...prev.advanced, intensity: constrained } }));
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        setState(prev => ({ ...prev, advanced: { ...prev.advanced, intensity: 50 } }));
                      }
                    }}
                    className="w-12 h-6 text-[10px] px-1 text-center"
                    min={0}
                    max={100}
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
              <Slider 
                value={[state.advanced.intensity]} 
                onValueChange={(v) => setState(prev => ({ ...prev, advanced: { ...prev.advanced, intensity: v[0] } }))}
                max={100} step={1} 
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <Label>Mức độ sáng tạo</Label>
                <div className="flex items-center gap-1">
                  <Input 
                    type="number" 
                    value={state.advanced.creativity} 
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                      if (!isNaN(val)) {
                        const constrained = Math.max(0, Math.min(100, val));
                        setState(prev => ({ ...prev, advanced: { ...prev.advanced, creativity: constrained } }));
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        setState(prev => ({ ...prev, advanced: { ...prev.advanced, creativity: 30 } }));
                      }
                    }}
                    className="w-12 h-6 text-[10px] px-1 text-center"
                    min={0}
                    max={100}
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
              <Slider 
                value={[state.advanced.creativity]} 
                onValueChange={(v) => setState(prev => ({ ...prev, advanced: { ...prev.advanced, creativity: v[0] } }))}
                max={100} step={1} 
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
