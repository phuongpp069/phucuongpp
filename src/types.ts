export type SpaceType = 
  | 'living_room' 
  | 'bedroom' 
  | 'kitchen' 
  | 'bathroom' 
  | 'garden' 
  | 'hallway' 
  | 'balcony' 
  | 'stairs' 
  | 'facade' 
  | 'terrace' 
  | 'other';

export type SurfaceType = 
  | 'floor' 
  | 'wall' 
  | 'ceiling' 
  | 'skirting' 
  | 'stair_step' 
  | 'decorative_panel' 
  | 'outdoor_area' 
  | 'sanitary_fixture';

export type MaterialType = 
  | 'floor_tile' 
  | 'wall_tile' 
  | 'stone' 
  | 'facade_stone' 
  | 'lavabo' 
  | 'toilet' 
  | 'shower' 
  | 'mirror' 
  | 'cabinet' 
  | 'other';

export interface MaterialAssignment {
  id: string;
  surface: SurfaceType;
  material: MaterialType;
  description: string;
  referencePhoto: string | null;
}

export interface MaterialLibraryItem {
  id: string;
  code: string;
  name: string;
  size: string;
  category: MaterialType;
  imageUrl: string;
}

export interface ProjectState {
  id: string;
  name: string;
  mode: 'structured' | 'manual';
  currentPhoto: string | null;
  selectedSpace: SpaceType;
  materialAssignments: MaterialAssignment[];
  referencePhotos: string[];
  detailedDescription: string;
  constraints: {
    preserveArchitecture: boolean;
    preservePerspective: boolean;
    preserveLighting: boolean;
    preserveScale: boolean;
    noExtraObjects: boolean;
    realisticPhoto: boolean;
  };
  advanced: {
    intensity: number;
    brightness: number;
    sharpness: number;
    creativity: number;
  };
  generatedPrompt: string;
  maskData: string | null; // Base64 mask image
  results: string[];
  selectedResultIndex: number | null;
  activeMiddleTab: 'original' | 'mask' | 'result';
  history: {
    timestamp: number;
    prompt: string;
    result: string;
  }[];
}
