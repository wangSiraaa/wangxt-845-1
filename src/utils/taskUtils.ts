import { RiskLevel } from '../types';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays === -1) return '昨天';
  if (diffDays > 0 && diffDays < 7) return `${diffDays}天后`;
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)}天前`;

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
};

export const getRiskColor = (level: RiskLevel): string => {
  const colors: Record<RiskLevel, string> = {
    none: 'bg-slate-100 text-slate-600',
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };
  return colors[level];
};

export const getRiskBorderColor = (level: RiskLevel): string => {
  const colors: Record<RiskLevel, string> = {
    none: 'border-slate-200',
    low: 'border-blue-200',
    medium: 'border-amber-300',
    high: 'border-orange-400',
    critical: 'border-red-500',
  };
  return colors[level];
};

export const getRiskLabel = (level: RiskLevel): string => {
  const labels: Record<RiskLevel, string> = {
    none: '无风险',
    low: '低风险',
    medium: '中风险',
    high: '高风险',
    critical: '严重风险',
  };
  return labels[level];
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    project_manager: '项目经理',
    designer: '设计师',
    constructor: '施工方',
    acceptor: '验收方',
  };
  return labels[role] || role;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
