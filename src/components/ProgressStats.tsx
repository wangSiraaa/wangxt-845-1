import { useTaskStore } from '../store/useTaskStore';
import { getRiskLabel } from '../utils/taskUtils';
import { CheckCircle2, Clock, AlertTriangle, ImageOff, Wifi, WifiOff } from 'lucide-react';

export default function ProgressStats() {
  const { getProgressStats, getRiskStats, isOffline } = useTaskStore();
  const stats = getProgressStats();
  const riskStats = getRiskStats();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">项目进度</h2>
        <div className="flex items-center gap-2">
          {isOffline ? (
            <span className="flex items-center gap-1 text-amber-600 text-sm">
              <WifiOff size={16} />
              离线模式
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-600 text-sm">
              <Wifi size={16} />
              已同步
            </span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">总体完成度</span>
          <span className="font-semibold text-slate-800">{stats.percentage}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          <div className="text-xs text-slate-500">总任务</div>
        </div>
        <div className="text-center p-3 bg-emerald-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-emerald-600">
            <CheckCircle2 size={20} />
            {stats.done}
          </div>
          <div className="text-xs text-slate-500">已完成</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">
            <Clock size={20} />
            {stats.inProgress}
          </div>
          <div className="text-xs text-slate-500">进行中</div>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-lg">
          <div className="text-2xl font-bold text-amber-600">{stats.review}</div>
          <div className="text-xs text-slate-500">待验收</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-600">
            <AlertTriangle size={20} />
            {stats.overdue}
          </div>
          <div className="text-xs text-slate-500">已超期</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-600">
            <ImageOff size={20} />
            {stats.noPhotos}
          </div>
          <div className="text-xs text-slate-500">缺照片</div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <h3 className="text-sm font-medium text-slate-700 mb-3">风险分布</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(riskStats).map(([level, count]) => (
            <span
              key={level}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                count > 0
                  ? level === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : level === 'high'
                    ? 'bg-orange-100 text-orange-700'
                    : level === 'medium'
                    ? 'bg-amber-100 text-amber-700'
                    : level === 'low'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {getRiskLabel(level as any)}: {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
