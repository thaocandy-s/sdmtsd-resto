"use client";

import { type ReactNode } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

// Shared drag & drop list used by every ordered admin module.
// - Desktop: pointer drag (activates after a small distance to keep clicks working).
// - Mobile: long-press drag (250ms hold) so scrolling still works.
// - Keyboard accessible, auto-scroll near edges (dnd-kit default), vertical axis only.

export interface SortableItem {
  id: string;
}

interface SortableListProps<T extends SortableItem> {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, index: number, handle: ReactNode) => ReactNode;
  disabled?: boolean;
  className?: string;
}

export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
  disabled,
  className,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex).map((i) => i.id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
        disabled={disabled}
      >
        <div className={className}>
          {items.map((item, index) => (
            <SortableRow key={item.id} id={item.id} disabled={disabled}>
              {(handle) => renderItem(item, index, handle)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled?: boolean;
  children: (handle: ReactNode) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : undefined,
    position: "relative",
  };

  const handle = (
    <button
      type="button"
      aria-label="Drag to reorder"
      className={`touch-none flex items-center justify-center text-foreground-secondary hover:text-gold-500 transition-colors ${
        disabled ? "cursor-not-allowed opacity-40" : "cursor-grab active:cursor-grabbing"
      }`}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="w-5 h-5" />
    </button>
  );

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "shadow-2xl" : undefined}>
      {children(handle)}
    </div>
  );
}

/** Small "#N" badge shown on each ordered row/card. */
export function OrderBadge({ order }: { order: number }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[1.75rem] h-6 px-1.5 rounded-full bg-gold-500/15 text-gold-500 text-xs font-semibold tabular-nums">
      #{order}
    </span>
  );
}
