import React from 'react';
import { Moon, Sun, Save, Download, HelpCircle, Plus, Play } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { ProjectState } from '@/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  state: ProjectState;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function Header({ state, onGenerate, isGenerating }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 overflow-hidden rounded-lg flex items-center justify-center bg-white border border-border">
          <img 
            src="https://w.ladicdn.com/s250x250/64ef6b7f0b7ff20012403c07/phucuong-20260404132826-ddeul.jpg" 
            alt="PHÚ CƯỜNG Logo" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="font-bold text-lg tracking-tight hidden sm:block text-teal-700 uppercase">PHÚ CƯỜNG COMPANY</h1>
        <div className="h-4 w-px bg-border mx-2 hidden sm:block" />
        <span className="text-sm text-muted-foreground font-medium truncate max-w-[200px]">
          {state.name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        <div className="h-6 w-px bg-border mx-1" />
        
        <Button variant="outline" size="sm" className="hidden md:flex gap-2">
          <Plus className="w-4 h-4" />
          Dự án mới
        </Button>
        
        <Button variant="outline" size="sm" className="hidden md:flex gap-2">
          <Save className="w-4 h-4" />
          Lưu
        </Button>

        <Button 
          onClick={onGenerate} 
          disabled={isGenerating || !state.currentPhoto}
          className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
          size="sm"
        >
          <Play className={cn("w-4 h-4", isGenerating && "animate-pulse")} />
          {isGenerating ? "Đang tạo..." : "Tạo ảnh hoàn thiện"}
        </Button>
      </div>
    </header>
  );
}
