import { X, History, ArrowRight, MapPin, User, Clock } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { ZONES, USERS } from '../data/seed';
import { TaskHistory, HistoryActionType } from '../types';
import { formatDate, getRoleLabel } from '../utils/taskUtils';

interface TaskHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const actionLabels: Record<HistoryActionType, string> = {
  move_task: '移动任务',
  reorder_task: '调整顺序',
  accept_task: '验收通过',
  reject_task: '驳回任务',
  add_photo: '上传照片',
  remove_photo: '删除照片',
  update_task: '更新任务',
};

const actionColors: Record<HistoryActionType, string> = {
  move_task: 'bg-blue-100 text-blue-700',
  reorder_task: 'bg-purple-100 text-purple-700',
  accept_task: 'bg-emerald-100 text-emerald-700',
  reject_task: 'bg-red-100 text-red-700',
  add_photo: 'bg-green-100 text-green-700',
  remove_photo: 'bg-orange-100 text-orange-700',
  update_task: 'bg-slate-100 text-slate-700',
};

export default function TaskHistoryPanel({ isOpen, onClose }: TaskHistoryPanelProps) {
  const { getTaskHistory } = useTaskStore();
  const history = getTaskHistory();

  const getZoneName = (zoneId: string) => {
    const zone = ZONES.find((z) => z.id === zoneId);
    return zone?.name || zoneId;
  };

  const getUserName = (userId: string) => {
    const user = USERS.find((u) => u.id === userId);
    return user ? `${user.name}(${getRoleLabel(user.role)})` : userId;
  };

  const renderStateDiff = (entry: TaskHistory) => {
    const prev = entry.previousState;
    const next = entry.nextState;

    const diffs: { field: string; old: string; new: string }[] = [];

    if ('status' in prev && 'status' in next && prev.status !== next.status) {
      diffs.push({ field: '状态', old: prev.status || '', new: next.status || '' });
    }
    if ('order' in prev && 'order' in next && prev.order !== next.order) {
      diffs.push({
        field: '排序',
        old: `第${(prev.order ?? 0) + 1}位`,
        new: `第${(next.order ?? 0) + 1}位`,
      });
    }
    if ('photos' in prev && 'photos' in next) {
      const oldLen = Array.isArray(prev.photos) ? prev.photos.length : 0;
      const newLen = Array.isArray(next.photos) ? next.photos.length : 0;
      if (oldLen !== newLen) {
        diffs.push({ field: '照片数', old: `${oldLen}张`, new: `${newLen}张` });
      }
    }
    if ('notes' in prev && 'notes' in next && prev.notes !== next.notes) {
      diffs.push({ field: '备注', old: prev.notes || '(空)', new: next.notes || '(空)' });
    }

    return diffs;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      data-testid="history-panel"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <History size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">展区任务历史记录</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            data-testid="close-history-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History size={48} className="mx-auto mb-3 opacity-50" />
              <p>暂无操作记录</p>
              <p className="text-sm mt-1">所有任务操作都会自动记录在这里</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => {
                const diffs = renderStateDiff(entry);
                return (
                  <div
                    key={entry.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                    data-testid={`history-entry-${entry.id}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${actionColors[entry.action]}`}>
                          {actionLabels[entry.action]}
                        </span>
                        <span className="font-medium text-slate-800 text-sm">
                          {entry.taskTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
                        <Clock size={10} />
                        {formatDate(entry.performedAt)}
                      </div>
                    </div>

                    <div className="text-sm text-slate-600 mb-2">{entry.description}</div>

                    {diffs.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {diffs.map((diff, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs bg-white px-2 py-1 rounded"
                          >
                            <span className="text-slate-500 font-medium">{diff.field}：</span>
                            <span className="text-slate-600">{diff.old}</span>
                            <ArrowRight size={12} className="text-slate-300" />
                            <span className="text-blue-600 font-medium">{diff.new}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        {getZoneName(entry.zone)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={10} />
                        {getUserName(entry.performedBy)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
