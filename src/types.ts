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

export interface ProjectState {
  id: string;
  name: string;
  currentPhoto: string | null;
  selectedSpace: SpaceType;
  materialAssignments: MaterialAssignment[];
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
  results: string[];
  selectedResultIndex: number | null;
  activeMiddleTab: 'original' | 'result';
  history: {
    timestamp: number;
    prompt: string;
    result: string;
  }[];
}
