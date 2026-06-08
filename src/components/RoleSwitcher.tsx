import { useTaskStore } from '../store/useTaskStore';
import { USERS } from '../data/seed';
import { getRoleLabel } from '../utils/taskUtils';
import { User, Shield } from 'lucide-react';

export default function RoleSwitcher() {
  const { currentUserId, setCurrentUser, getCurrentRole, hasPermission } = useTaskStore();

  const currentUser = USERS.find((u) => u.id === currentUserId);
  const currentRole = getCurrentRole();

  const roleDescriptions: Record<string, string> = {
    project_manager: '可查看所有任务，执行验收，编辑和删除任务',
    designer: '可查看所有任务，编辑设计相关任务',
    constructor: '可查看所有任务，编辑施工相关任务，上传照片',
    acceptor: '仅查看待验收和已完成任务，可执行验收',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-slate-600" />
            <span className="text-sm font-medium text-slate-700">当前身份：</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              <User size={18} />
            </div>
            <div>
              <div className="font-semibold text-slate-800">
                {currentUser?.name}
                <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  {getRoleLabel(currentRole)}
                </span>
              </div>
              <div className="text-xs text-slate-500">{roleDescriptions[currentRole]}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">切换身份：</span>
          <div className="flex gap-1">
            {USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  currentUserId === user.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={`${user.name} - ${getRoleLabel(user.role)}`}
              >
                {user.avatar}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          权限：
          {hasPermission('canAccept') && <span className="text-emerald-600">可验收</span>}
          {hasPermission('canEdit') && (
            <span className="text-blue-600">
              {hasPermission('canAccept') ? ' · ' : ''}
              可编辑
            </span>
          )}
          {hasPermission('canDelete') && (
            <span className="text-red-600">
              {hasPermission('canEdit') ? ' · ' : ''}
              可删除
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
