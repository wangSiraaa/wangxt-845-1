export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export type UserRole = 'project_manager' | 'designer' | 'constructor' | 'acceptor';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface TaskPhoto {
  id: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
}

export interface ExhibitionTask {
  id: string;
  title: string;
  description: string;
  zone: string;
  status: TaskStatus;
  deadline: string;
  assigneeId: string;
  riskLevel: RiskLevel;
  riskTags: string[];
  photos: TaskPhoto[];
  order: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  color: string;
}

export interface ExhibitionZone {
  id: string;
  name: string;
  description: string;
}

export interface TaskFilters {
  zone: string | null;
  riskLevel: RiskLevel | null;
  assignee: string | null;
  search: string;
}

export interface AcceptanceError {
  type: 'no_photos' | 'overdue' | 'risk_pending';
  message: string;
}
