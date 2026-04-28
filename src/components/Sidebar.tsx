import React from 'react';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Layers, 
  Settings, 
  History, 
  Star, 
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dự án', active: true },
  { icon: ImageIcon, label: 'Ảnh hiện trạng' },
  { icon: Star, label: 'Mẫu preset' },
  { icon: Layers, label: 'Lịch sử' },
  { icon: Settings, label: 'Thiết lập' },
];

export function Sidebar() {
  return (
    <aside className="w-16 border-r border-border bg-background flex flex-col items-center py-4 gap-4 shrink-0">
      {NAV_ITEMS.map((item, index) => (
        <div key={index}>
          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "w-10 h-10 rounded-xl",
                item.active ? "bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ))}
      
      <div className="mt-auto flex flex-col gap-4">
        <Tooltip>
          <TooltipTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "text-muted-foreground"
            )}
          >
            <HelpCircle className="w-5 h-5" />
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Trợ giúp</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}
