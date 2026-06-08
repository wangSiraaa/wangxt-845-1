import { useTaskStore } from '../store/useTaskStore';
import { ZONES, USERS } from '../data/seed';
import { RiskLevel } from '../types';
import { getRiskLabel, getRoleLabel } from '../utils/taskUtils';
import { Search, Filter, X, RotateCcw } from 'lucide-react';

export default function FilterBar() {
  const { filters, setFilters, clearFilters, resetToSeed } = useTaskStore();

  const riskLevels: RiskLevel[] = ['none', 'low', 'medium', 'high', 'critical'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Filter size={18} />
          <span>筛选</span>
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={filters.zone || ''}
          onChange={(e) => setFilters({ zone: e.target.value || null })}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部展区</option>
          {ZONES.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>

        <select
          value={filters.riskLevel || ''}
          onChange={(e) => setFilters({ riskLevel: (e.target.value as RiskLevel) || null })}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部风险</option>
          {riskLevels.map((level) => (
            <option key={level} value={level}>
              {getRiskLabel(level)}
            </option>
          ))}
        </select>

        <select
          value={filters.assignee || ''}
          onChange={(e) => setFilters({ assignee: e.target.value || null })}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部负责人</option>
          {USERS.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({getRoleLabel(user.role)})
            </option>
          ))}
        </select>

        <button
          onClick={clearFilters}
          className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          清除筛选
        </button>

        <button
          onClick={resetToSeed}
          className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
          title="重置为初始数据"
        >
          <RotateCcw size={14} />
          重置
        </button>
      </div>
    </div>
  );
}
