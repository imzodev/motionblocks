"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import type { TextOverlay, MemeConfig } from "@/lib/admin/meme-types";
import { MEME_FONTS } from "@/lib/admin/meme-types";

interface MemeCanvasProps {
  config: MemeConfig;
  selectedTextId: string | null;
  onTextSelect: (id: string | null) => void;
  onTextMove: (id: string, x: number, y: number) => void;
  onExport: (dataUrl: string) => void;
}

const loadedFonts = new Set<string>();

async function loadFont(fontFamily: string): Promise<void> {
  if (loadedFonts.has(fontFamily)) return;
  
  const fontConfig = MEME_FONTS.find(f => f.value === fontFamily);
  if (!fontConfig?.url) {
    loadedFonts.add(fontFamily);
    return;
  }
  
  try {
    const font = new FontFace(fontFamily, `url(${fontConfig.url})`);
    const loadedFont = await font.load();
    document.fonts.add(loadedFont);
    loadedFonts.add(fontFamily);
  } catch (err) {
    console.warn(`Failed to load font ${fontFamily}:`, err);
    loadedFonts.add(fontFamily);
  }
}

export function MemeCanvas({
  config,
  selectedTextId,
  onTextSelect,
  onTextMove,
  onExport,
}: MemeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const loadAllFonts = async () => {
      const fontFamilies = config.textOverlays.map(o => o.fontFamily);
      const uniqueFonts = [...new Set(fontFamilies)];
      await Promise.all(uniqueFonts.map(loadFont));
      setFontsLoaded(true);
    };
    loadAllFonts();
  }, [config.textOverlays]);

  const drawCanvas = useCallback((showSelection: boolean = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imageRef.current && imageLoaded) {
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }

    config.textOverlays.forEach((overlay) => {
      const x = (overlay.x / 100) * canvas.width;
      const y = (overlay.y / 100) * canvas.height;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((overlay.rotation * Math.PI) / 180);

      ctx.font = `${overlay.italic ? "italic " : ""}${overlay.bold ? "bold " : ""}${overlay.fontSize}px ${overlay.fontFamily}`;
      ctx.textAlign = overlay.textAlign;
      ctx.textBaseline = "top";

      const displayText = overlay.uppercase ? overlay.text.toUpperCase() : overlay.text;

      if (overlay.strokeWidth > 0) {
        ctx.strokeStyle = overlay.strokeColor;
        ctx.lineWidth = overlay.strokeWidth * 2;
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.strokeText(displayText, 0, 0);
      }

      ctx.fillStyle = overlay.color;
      ctx.fillText(displayText, 0, 0);

      if (showSelection && selectedTextId === overlay.id) {
        const metrics = ctx.measureText(displayText);
        const textWidth = metrics.width;
        const textHeight = overlay.fontSize;

        let boxX = -textWidth / 2;
        if (overlay.textAlign === "left") boxX = 0;
        if (overlay.textAlign === "right") boxX = -textWidth;

        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(boxX - 5, -5, textWidth + 10, textHeight + 10);
        ctx.setLineDash([]);
      }

      ctx.restore();
    });
  }, [config, selectedTextId, imageLoaded, fontsLoaded]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.src = config.sourceAssetSrc;
  }, [config.sourceAssetSrc]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    if (imageLoaded && fontsLoaded) {
      drawCanvas(false);
      const canvas = canvasRef.current;
      if (canvas) {
        onExport(canvas.toDataURL("image/png"));
      }
      drawCanvas(true);
    }
  }, [imageLoaded, fontsLoaded, drawCanvas, onExport, config.textOverlays]);

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const findTextAtPosition = (x: number, y: number): TextOverlay | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    for (let i = config.textOverlays.length - 1; i >= 0; i--) {
      const overlay = config.textOverlays[i];
      const textX = (overlay.x / 100) * canvas.width;
      const textY = (overlay.y / 100) * canvas.height;

      ctx.font = `${overlay.italic ? "italic " : ""}${overlay.bold ? "bold " : ""}${overlay.fontSize}px ${overlay.fontFamily}`;
      const metrics = ctx.measureText(overlay.text);
      const textWidth = metrics.width;
      const textHeight = overlay.fontSize;

      let boxX = textX - textWidth / 2;
      if (overlay.textAlign === "left") boxX = textX;
      if (overlay.textAlign === "right") boxX = textX - textWidth;

      if (
        x >= boxX - 10 &&
        x <= boxX + textWidth + 10 &&
        y >= textY - 10 &&
        y <= textY + textHeight + 10
      ) {
        return overlay;
      }
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);
    const text = findTextAtPosition(coords.x, coords.y);

    if (text) {
      onTextSelect(text.id);
      setIsDragging(true);
      const canvas = canvasRef.current;
      if (canvas) {
        const textX = (text.x / 100) * canvas.width;
        const textY = (text.y / 100) * canvas.height;
        setDragOffset({ x: coords.x - textX, y: coords.y - textY });
      }
    } else {
      onTextSelect(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedTextId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getCanvasCoords(e);
    const newX = ((coords.x - dragOffset.x) / canvas.width) * 100;
    const newY = ((coords.y - dragOffset.y) / canvas.height) * 100;

    onTextMove(selectedTextId, Math.max(0, Math.min(100, newX)), Math.max(0, Math.min(100, newY)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-muted rounded-lg overflow-hidden"
      style={{ aspectRatio: `${config.width} / ${config.height}` }}
    >
      <canvas
        ref={canvasRef}
        width={config.width}
        height={config.height}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
