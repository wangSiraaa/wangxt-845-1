import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTaskStore } from '../store/useTaskStore';
import { COLUMNS, ROLE_PERMISSIONS } from '../data/seed';
import { TaskStatus } from '../types';
import KanbanColumn from '../components/KanbanColumn';
import ProgressStats from '../components/ProgressStats';
import FilterBar from '../components/FilterBar';
import RoleSwitcher from '../components/RoleSwitcher';
import { LayoutDashboard } from 'lucide-react';

export default function Home() {
  const {
    getTasksByStatus,
    getFilteredTasks,
    moveTask,
    reorderTask,
    getCurrentRole,
  } = useTaskStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const allTasks = useMemo(() => getFilteredTasks(), [getFilteredTasks]);

  const findColumnOfTask = (taskId: string): TaskStatus | null => {
    const task = allTasks.find((t) => t.id === taskId);
    return task?.status || null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    //
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnOfTask(activeId);
    const overColumn = COLUMNS.find((c) => c.id === overId)?.id;

    if (overColumn && activeColumn && overColumn !== activeColumn) {
      const tasksInOverColumn = getTasksByStatus(overColumn);
      moveTask(activeId, overColumn, tasksInOverColumn.length);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeColumn = findColumnOfTask(activeId);
    const overColumn = findColumnOfTask(overId);

    if (activeColumn && overColumn && activeColumn === overColumn) {
      const tasks = getTasksByStatus(activeColumn);
      const oldIndex = tasks.findIndex((t) => t.id === activeId);
      const newIndex = tasks.findIndex((t) => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        reorderTask(activeId, newIndex, activeColumn);
      }
    }
  };

  const currentRole = getCurrentRole();

  const visibleColumns = useMemo(() => {
    const permissions = ROLE_PERMISSIONS[currentRole];
    if (!permissions) return COLUMNS;
    return COLUMNS.filter((c) => permissions.visibleStatuses.includes(c.id));
  }, [currentRole]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <LayoutDashboard size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">展馆布展进度墙</h1>
                <p className="text-xs text-slate-500">Exhibition Progress Dashboard</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              数据自动保存到本地，支持离线使用
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 py-6 space-y-4">
        <RoleSwitcher />
        <ProgressStats />
        <FilterBar />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {visibleColumns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={getTasksByStatus(column.id)}
                />
              ))}
            </div>
          </DndContext>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-800 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>拖拽排序</strong>：拖拽卡片可调整顺序或移动到不同状态列</li>
            <li>• <strong>超期高亮</strong>：超过截止日期的任务会显示红色边框和超期标签</li>
            <li>• <strong>验收拦截</strong>：点击"验收通过"前必须上传布展照片，高风险任务也会被拦截</li>
            <li>• <strong>角色差异</strong>：切换右上角身份可查看不同角色的权限和可见内容</li>
            <li>• <strong>离线保存</strong>：所有操作自动保存到浏览器本地存储，刷新后数据保留</li>
            <li>• <strong>风险筛选</strong>：使用顶部筛选器按展区、风险等级、负责人筛选任务</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
