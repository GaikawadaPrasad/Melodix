import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import TrackRow from './TrackRow';

export default function SortableTrackRow({ track, index, queue, playlistId, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center group">
      <button
        {...attributes}
        {...listeners}
        className="p-2 text-muted opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing touch-none"
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>
      <div className="flex-1">
        <TrackRow track={track} index={index} queue={queue} playlistId={playlistId} onRemove={onRemove} />
      </div>
    </div>
  );
}
