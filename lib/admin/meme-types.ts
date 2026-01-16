/**
 * Meme Creator Types
 * Single Responsibility: Type definitions for meme creation feature
 */

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number; // pixels
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  textAlign: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
  uppercase: boolean;
  rotation: number; // degrees
}

export interface MemeConfig {
  sourceAssetId: string;
  sourceAssetSrc: string;
  sourceAssetType: "image" | "video";
  textOverlays: TextOverlay[];
  width: number;
  height: number;
}

export interface SaveMemeParams {
  config: MemeConfig;
  imageData: string; // base64 data URL
  saveAs: "global" | "project";
  projectId?: string;
  metadata: {
    name: string;
    description?: string;
    whenToUse?: string;
    tags?: string[];
  };
}

export const DEFAULT_TEXT_OVERLAY: Omit<TextOverlay, "id"> = {
  text: "YOUR TEXT HERE",
  x: 50,
  y: 10,
  fontSize: 48,
  fontFamily: "Impact",
  color: "#FFFFFF",
  strokeColor: "#000000",
  strokeWidth: 2,
  textAlign: "center",
  bold: false,
  italic: false,
  uppercase: true,
  rotation: 0,
};

export interface MemeFont {
  value: string;
  label: string;
  url?: string; // URL for custom fonts that need to be loaded
}

export const MEME_FONTS: MemeFont[] = [
  { value: "Impact", label: "Impact (Classic Meme)" },
  { value: "Arial Black", label: "Arial Black" },
  { value: "Comic Sans MS", label: "Comic Sans" },
  { value: "Helvetica", label: "Helvetica" },
  { 
    value: "Bebas Neue", 
    label: "Bebas Neue",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/bebasneue/BebasNeue-Regular.ttf"
  },
  { 
    value: "Bangers", 
    label: "Bangers",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/bangers/Bangers-Regular.ttf"
  },
  { 
    value: "Lobster", 
    label: "Lobster",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/lobster/Lobster-Regular.ttf"
  },
  { 
    value: "Pacifico", 
    label: "Pacifico",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/pacifico/Pacifico-Regular.ttf"
  },
  { 
    value: "Orbitron", 
    label: "Orbitron",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/orbitron/Orbitron%5Bwght%5D.ttf"
  },
  { 
    value: "Press Start 2P", 
    label: "Press Start 2P",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/PressStart2P-Regular.ttf"
  },
  { 
    value: "Anton", 
    label: "Anton",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/anton/Anton-Regular.ttf"
  },
  { 
    value: "Abril Fatface", 
    label: "Abril Fatface",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/abrilfatface/AbrilFatface-Regular.ttf"
  },
];
