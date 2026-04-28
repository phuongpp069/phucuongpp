import React from 'react';
import { Upload, X, Plus, Info } from 'lucide-react';
import { ProjectState, SpaceType, MaterialType, SurfaceType } from '@/types';
import { SPACE_OPTIONS, SURFACE_OPTIONS, MATERIAL_OPTIONS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface LeftPanelProps {
  state: ProjectState;
  setState: React.Dispatch<React.SetStateAction<ProjectState>>;
}

export function LeftPanel({ state, setState }: LeftPanelProps) {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setState(prev => ({ ...prev, currentPhoto: url }));
    }
  };

  const addAssignment = () => {
    const newAssignment = {
      id: Math.random().toString(36).substr(2, 9),
      surface: 'floor' as SurfaceType,
      material: 'floor_tile' as MaterialType,
      description: '',
      referencePhoto: null,
    };
    setState(prev => ({
      ...prev,
      materialAssignments: [...prev.materialAssignments, newAssignment]
    }));
  };

  const removeAssignment = (id: string) => {
    setState(prev => ({
      ...prev,
      materialAssignments: prev.materialAssignments.filter(a => a.id !== id)
    }));
  };

  const updateAssignment = (id: string, updates: Partial<any>) => {
    setState(prev => ({
      ...prev,
      materialAssignments: prev.materialAssignments.map(a => 
        a.id === id ? { ...a, ...updates } : a
      )
    }));
  };

  const handleAssignmentPhotoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateAssignment(id, { referencePhoto: url });
    }
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

      <section className="space-y-4">
        <div className="space-y-2">
          <Label>Loại không gian</Label>
          <Select 
            value={state.selectedSpace} 
            onValueChange={(v) => setState(prev => ({ ...prev, selectedSpace: v as SpaceType }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn không gian" />
            </SelectTrigger>
            <SelectContent>
              {SPACE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Thiết lập vật liệu & Bề mặt
            </Label>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-teal-600" onClick={addAssignment}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {state.materialAssignments.map((assignment, index) => (
            <div key={assignment.id} className="p-3 rounded-lg border border-border bg-muted/20 space-y-3 relative group">
              <button 
                onClick={() => removeAssignment(assignment.id)}
                className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase text-muted-foreground">Bề mặt {index + 1}</Label>
                  <Select 
                    value={assignment.surface} 
                    onValueChange={(v) => updateAssignment(assignment.id, { surface: v as SurfaceType })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SURFACE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase text-muted-foreground">Vật liệu</Label>
                  <Select 
                    value={assignment.material} 
                    onValueChange={(v) => updateAssignment(assignment.id, { material: v as MaterialType })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground">Ảnh mẫu sản phẩm</Label>
                {assignment.referencePhoto ? (
                  <div className="relative aspect-video rounded-md overflow-hidden border border-border group/photo">
                    <img src={assignment.referencePhoto} alt="Ref" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => updateAssignment(assignment.id, { referencePhoto: null })}
                      className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full opacity-0 group-hover/photo:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video rounded-md border border-dashed border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4 text-muted-foreground mb-1" />
                    <span className="text-[10px] font-medium">Tải ảnh mẫu</span>
                    <input type="file" className="hidden" onChange={(e) => handleAssignmentPhotoUpload(assignment.id, e)} accept="image/*" />
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground">Mô tả chi tiết</Label>
                <Textarea 
                  placeholder="Mô tả cho phần này..." 
                  className="resize-none h-16 text-xs"
                  value={assignment.description}
                  onChange={(e) => updateAssignment(assignment.id, { description: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="constraints" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline font-semibold text-sm">
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
          <AccordionTrigger className="py-2 hover:no-underline font-semibold text-sm">
            Thiết lập nâng cao
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <Label>Cường độ tuân theo mẫu</Label>
                <span className="text-muted-foreground">{state.advanced.intensity}%</span>
              </div>
              <Slider 
                value={[state.advanced.intensity]} 
                onValueChange={(v) => setState(prev => ({ ...prev, advanced: { ...prev.advanced, intensity: v[0] } }))}
                max={100} step={1} 
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <Label>Mức độ sáng tạo</Label>
                <span className="text-muted-foreground">{state.advanced.creativity}%</span>
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
