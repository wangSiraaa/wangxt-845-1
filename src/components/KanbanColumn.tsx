import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, ExhibitionTask, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  column: Column;
  tasks: ExhibitionTask[];
}

export default function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      className={`flex-1 min-w-[300px] max-w-[350px] bg-slate-50 rounded-xl p-3 transition-colors ${
        isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''
      }`}
      data-testid={`kanban-column-${column.id}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
          <h3 className="font-semibold text-slate-700">{column.title}</h3>
          <span className="text-xs px-2 py-0.5 bg-white rounded-full text-slate-500">
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="space-y-3 min-h-[100px]"
        data-testid={`column-tasks-${column.id}`}
      >
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <p>暂无任务</p>
            <p className="text-xs mt-1">拖拽任务到此处</p>
          </div>
        ) : (
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
