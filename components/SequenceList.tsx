"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Track } from "@/types/timeline";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GripVertical, Trash2 } from "lucide-react";

interface SequenceListProps {
  tracks: Track[];
  onReorder: (tracks: Track[]) => void;
  onSelect?: (track: Track) => void;
  onDelete?: (id: string) => void;
  selectedId?: string;
  className?: string;
}

interface SortableItemProps {
  track: Track;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableItem({
  track,
  isSelected,
  onSelect,
  onDelete,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-row items-center justify-between gap-2 px-2 py-1 shadow-sm transition-all",
        isSelected ? "border-primary ring-1 ring-primary" : "border-border",
        isDragging && "opacity-50 scale-105 shadow-xl"
      )}
      onClick={onSelect}
    >
      <Button
        {...attributes}
        {...listeners}
        variant="ghost"
        size="icon"
        className="cursor-grab active:cursor-grabbing h-7 w-7 shrink-0"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </Button>

      <p className="flex-1 min-w-0 text-xs font-semibold truncate uppercase tracking-tight leading-none">
        {track.template}
      </p>

      <div className="shrink-0 flex items-center gap-1">
        <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
          {track.duration}f
        </Badge>
        <Badge
          variant="outline"
          className="tabular-nums font-mono text-[10px] px-2 py-0 leading-none text-muted-foreground"
          title={track.id}
        >
          {track.id.slice(-6)}
        </Badge>
      </div>

      <Button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0"
        aria-label="Delete block"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </Card>
  );
}

/**
 * SequenceList component provides a reorderable list of animation blocks.
 */
export function SequenceList({
  tracks,
  onReorder,
  onSelect,
  onDelete,
  selectedId,
  className,
}: SequenceListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex((t) => t.id === active.id);
      const newIndex = tracks.findIndex((t) => t.id === over.id);

      onReorder(arrayMove(tracks, oldIndex, newIndex));
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tracks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tracks.map((track) => (
            <SortableItem
              key={track.id}
              track={track}
              isSelected={selectedId === track.id}
              onSelect={() => onSelect?.(track)}
              onDelete={() => onDelete?.(track.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
      {tracks.length === 0 && (
        <Card className="py-10 text-center text-muted-foreground border border-dashed bg-card/60">
          No animation blocks yet. Add an asset to start your sequence.
        </Card>
      )}
    </div>
  );
}
