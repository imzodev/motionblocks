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
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-card border rounded-lg shadow-sm transition-all",
        isSelected ? "border-primary ring-1 ring-primary" : "border-border",
        isDragging && "opacity-50 scale-105 shadow-xl"
      )}
      onClick={onSelect}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate uppercase tracking-tight">
          {track.template}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          ID: {track.id} • Asset: {track.assetId}
        </p>
      </div>

      <div className="text-right text-xs tabular-nums text-muted-foreground px-2 border-l">
        {track.duration}f
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 hover:text-destructive transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
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
    <div className={cn("space-y-2", className)}>
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
        <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg">
          No animation blocks yet. Add an asset to start your sequence.
        </div>
      )}
    </div>
  );
}
