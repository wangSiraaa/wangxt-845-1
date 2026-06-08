import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExhibitionTask, AcceptanceError } from '../types';
import { useTaskStore } from '../store/useTaskStore';
import { USERS, ZONES } from '../data/seed';
import { formatDate, getRiskColor, getRiskBorderColor, getRiskLabel, getRoleLabel } from '../utils/taskUtils';
import {
  Calendar,
  User,
  AlertTriangle,
  Image,
  ImageOff,
  CheckCircle,
  XCircle,
  Upload,
  X,
  Clock,
  MapPin,
  GripVertical,
} from 'lucide-react';

interface TaskCardProps {
  task: ExhibitionTask;
}

export default function TaskCard({ task }: TaskCardProps) {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showAcceptError, setShowAcceptError] = useState<AcceptanceError | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const {
    isOverdue,
    hasPermission,
    acceptTask,
    rejectTask,
    addPhoto,
    validateAcceptance,
    currentUserId,
  } = useTaskStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assignee = USERS.find((u) => u.id === task.assigneeId);
  const zone = ZONES.find((z) => z.id === task.zone);
  const overdue = isOverdue(task);
  const canAccept = hasPermission('canAccept') && task.status === 'review';
  const canEdit = hasPermission('canEdit');

  const handleAccept = () => {
    const error = validateAcceptance(task.id);
    if (error) {
      setShowAcceptError(error);
      return;
    }
    const result = acceptTask(task.id);
    if (!result.success && result.error) {
      setShowAcceptError(result.error);
    }
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      rejectTask(task.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  const handleAddPhoto = () => {
    const photoUrl = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 10000000)}?w=300&h=200&fit=crop`;
    addPhoto(task.id, {
      url: photoUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUserId,
      description: '现场布展照片',
    });
    setShowPhotoModal(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group bg-white rounded-lg border-2 p-4 shadow-sm hover:shadow-md transition-all ${
          getRiskBorderColor(task.riskLevel)
        } ${overdue ? 'ring-2 ring-red-400 ring-offset-1' : ''} ${
          task.status === 'done' ? 'opacity-75' : ''
        }`}
        data-testid={`task-card-${task.id}`}
      >
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical size={16} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3
                className={`font-medium text-slate-800 text-sm ${
                  overdue ? 'text-red-600' : ''
                } ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}
              >
                {task.title}
              </h3>
              {overdue && (
                <span
                  className="flex-shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full"
                  data-testid="overdue-badge"
                >
                  <AlertTriangle size={10} />
                  已超期
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                <MapPin size={10} />
                {zone?.name}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getRiskColor(task.riskLevel)}`}>
                <AlertTriangle size={10} />
                {getRiskLabel(task.riskLevel)}
              </span>
              {task.riskTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div
              className={`mb-3 border rounded-lg overflow-hidden ${
                task.photos.length === 0 ? 'border-dashed border-slate-300 bg-slate-50' : 'border-slate-200'
              }`}
              data-testid="photo-section"
            >
              {task.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-1 p-1">
                  {task.photos.slice(0, 3).map((photo) => (
                    <div key={photo.id} className="relative aspect-square">
                      <img
                        src={photo.url}
                        alt={photo.description || '布展照片'}
                        className="w-full h-full object-cover rounded"
                        data-testid="task-photo"
                      />
                    </div>
                  ))}
                  {task.photos.length > 3 && (
                    <div className="relative aspect-square bg-slate-100 rounded flex items-center justify-center text-xs text-slate-500">
                      +{task.photos.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowPhotoModal(true)}
                  disabled={!canEdit}
                  className="w-full p-3 flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="upload-photo-placeholder"
                >
                  <ImageOff size={20} />
                  <span className="text-xs">点击上传照片</span>
                  <span className="text-xs text-red-400">（验收必需）</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <div className="flex items-center gap-1">
                <Calendar size={12} className={overdue ? 'text-red-500' : ''} />
                <span className={overdue ? 'text-red-500 font-medium' : ''}>
                  截止：{formatDate(task.deadline)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>
                  {assignee?.name}
                  <span className="text-slate-400 ml-1">
                    ({assignee ? getRoleLabel(assignee.role) : ''})
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              {canEdit && task.status !== 'done' && (
                <>
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    data-testid="add-photo-btn"
                  >
                    <Image size={12} />
                    {task.photos.length > 0 ? '管理照片' : '上传照片'}
                  </button>
                  {task.photos.length > 0 && (
                    <span className="text-xs text-slate-400">({task.photos.length}张)</span>
                  )}
                </>
              )}

              {canAccept && (
                <>
                  <button
                    onClick={handleAccept}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                    data-testid="accept-btn"
                  >
                    <CheckCircle size={12} />
                    验收通过
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    data-testid="reject-btn"
                  >
                    <XCircle size={12} />
                    驳回
                  </button>
                </>
              )}
            </div>

            {task.notes && (
              <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-700 border border-amber-200">
                <span className="font-medium">备注：</span>
                {task.notes}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="photo-modal">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">布展照片 - {task.title}</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-slate-400 hover:text-slate-600"
                data-testid="close-modal-btn"
              >
                <X size={20} />
              </button>
            </div>

            {task.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {task.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt={photo.description || '布展照片'}
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                      <p className="text-white text-xs">{photo.description}</p>
                      <p className="text-white/70 text-xs">
                        <Clock size={10} className="inline mr-1" />
                        {formatDate(photo.uploadedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <ImageOff size={48} className="mx-auto mb-3" />
                <p>暂无布展照片</p>
                <p className="text-sm text-red-400 mt-1">上传照片后才能进行验收</p>
              </div>
            )}

            {canEdit && (
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  onClick={handleAddPhoto}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  data-testid="confirm-upload-btn"
                >
                  <Upload size={16} />
                  上传照片
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAcceptError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="accept-error-modal">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">无法验收</h3>
                <p className="text-sm text-slate-500">该任务不符合验收条件</p>
              </div>
            </div>
            <div
              className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4"
              data-testid="error-message"
            >
              {showAcceptError.message}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAcceptError(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                data-testid="close-error-btn"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="reject-modal">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">驳回任务</h3>
            <p className="text-sm text-slate-500 mb-4">请填写驳回原因，将退回给负责人处理</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请输入驳回原因..."
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={4}
              data-testid="reject-reason-input"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                data-testid="confirm-reject-btn"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
