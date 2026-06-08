import { ExhibitionTask, User, ExhibitionZone, Column, UserRole } from '../types';

export const USERS: User[] = [
  {
    id: 'user-pm',
    name: '张经理',
    role: 'project_manager',
    avatar: 'PM',
  },
  {
    id: 'user-designer',
    name: '李设计师',
    role: 'designer',
    avatar: 'LS',
  },
  {
    id: 'user-constructor',
    name: '王施工',
    role: 'constructor',
    avatar: 'WS',
  },
  {
    id: 'user-acceptor',
    name: '赵验收',
    role: 'acceptor',
    avatar: 'ZY',
  },
];

export const ZONES: ExhibitionZone[] = [
  { id: 'zone-1', name: '序厅', description: '入口接待区域' },
  { id: 'zone-2', name: '历史展区', description: '企业发展历程展示' },
  { id: 'zone-3', name: '科技展区', description: '核心技术产品展示' },
  { id: 'zone-4', name: '互动体验区', description: '互动多媒体区域' },
  { id: 'zone-5', name: '尾厅', description: '出口及纪念品区' },
];

export const COLUMNS: Column[] = [
  { id: 'todo', title: '待开始', color: 'bg-slate-500' },
  { id: 'in_progress', title: '进行中', color: 'bg-blue-500' },
  { id: 'review', title: '待验收', color: 'bg-amber-500' },
  { id: 'done', title: '已完成', color: 'bg-emerald-500' },
];

export const RISK_TAGS = [
  '材料延迟',
  '设计变更',
  '施工难点',
  '预算超支',
  '技术风险',
  '安全隐患',
  '质量问题',
  '协调问题',
];

const PHOTO_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1581093588402-97559a952823?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1581092918056-befc4a63c282?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1581091011485-fb9b1b9c1b0a?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1504307651261-0e975952823?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37536e748d4d?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1497366811353-68f0f68f0f68?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1556761175-b453?w=300&h=200&fit=crop',
];

const today = new Date();
const pastDate = (daysAgo: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};
const futureDate = (daysLater: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysLater);
  return d.toISOString();
};

export const SEED_TASKS: ExhibitionTask[] = [
  {
    id: 'task-1',
    title: '序厅门头施工',
    description: '完成序厅入口门头安装及灯光调试',
    zone: 'zone-1',
    status: 'done',
    deadline: pastDate(5),
    assigneeId: 'user-constructor',
    riskLevel: 'low',
    riskTags: [],
    photos: [
      {
        id: 'photo-1',
        url: PHOTO_PLACEHOLDERS[0],
        uploadedAt: pastDate(6),
        uploadedBy: 'user-constructor',
        description: '门头安装完成',
      },
    ],
    order: 0,
    createdAt: pastDate(10),
    updatedAt: pastDate(5),
  },
  {
    id: 'task-2',
    title: '历史展区展板设计',
    description: '完成历史展区墙面展板平面设计',
    zone: 'zone-2',
    status: 'done',
    deadline: pastDate(3),
    assigneeId: 'user-designer',
    riskLevel: 'none',
    riskTags: [],
    photos: [
      {
        id: 'photo-2',
        url: PHOTO_PLACEHOLDERS[1],
        uploadedAt: pastDate(4),
        uploadedBy: 'user-designer',
        description: '展板设计稿',
      },
      {
        id: 'photo-3',
        url: PHOTO_PLACEHOLDERS[2],
        uploadedAt: pastDate(3),
        uploadedBy: 'user-designer',
        description: '现场安装照',
      },
    ],
    order: 0,
    createdAt: pastDate(15),
    updatedAt: pastDate(3),
  },
  {
    id: 'task-3',
    title: '科技展区互动装置',
    description: '科技展区互动多媒体设备安装调试',
    zone: 'zone-3',
    status: 'in_progress',
    deadline: futureDate(2),
    assigneeId: 'user-constructor',
    riskLevel: 'medium',
    riskTags: ['技术风险', '施工难点'],
    photos: [
      {
        id: 'photo-4',
        url: PHOTO_PLACEHOLDERS[3],
        uploadedAt: pastDate(1),
        uploadedBy: 'user-constructor',
        description: '设备进场',
      },
    ],
    order: 0,
    createdAt: pastDate(7),
    updatedAt: pastDate(1),
  },
  {
    id: 'task-4',
    title: '互动体验区VR内容',
    description: 'VR体验内容制作及设备调试',
    zone: 'zone-4',
    status: 'review',
    deadline: pastDate(1),
    assigneeId: 'user-designer',
    riskLevel: 'high',
    riskTags: ['技术风险', '材料延迟'],
    photos: [
      {
        id: 'photo-5',
        url: PHOTO_PLACEHOLDERS[4],
        uploadedAt: pastDate(2),
        uploadedBy: 'user-designer',
        description: 'VR场景截图',
      },
    ],
    order: 0,
    createdAt: pastDate(20),
    updatedAt: pastDate(1),
  },
  {
    id: 'task-5',
    title: '尾厅纪念品展柜',
    description: '尾厅纪念品展示柜制作安装',
    zone: 'zone-5',
    status: 'todo',
    deadline: futureDate(7),
    assigneeId: 'user-constructor',
    riskLevel: 'none',
    riskTags: [],
    photos: [],
    order: 0,
    createdAt: pastDate(3),
    updatedAt: pastDate(3),
  },
  {
    id: 'task-6',
    title: '历史展区灯光调试',
    description: '历史展区重点展项灯光效果调试',
    zone: 'zone-2',
    status: 'in_progress',
    deadline: pastDate(2),
    assigneeId: 'user-constructor',
    riskLevel: 'critical',
    riskTags: ['施工难点', '质量问题'],
    photos: [],
    order: 1,
    createdAt: pastDate(5),
    updatedAt: pastDate(2),
  },
  {
    id: 'task-7',
    title: '科技展区展品布置',
    description: '科技产品展品进场及固定',
    zone: 'zone-3',
    status: 'review',
    deadline: futureDate(1),
    assigneeId: 'user-constructor',
    riskLevel: 'low',
    riskTags: ['协调问题'],
    photos: [
      {
        id: 'photo-6',
        url: PHOTO_PLACEHOLDERS[5],
        uploadedAt: pastDate(1),
        uploadedBy: 'user-constructor',
        description: '展品进场照',
      },
    ],
    order: 1,
    createdAt: pastDate(8),
    updatedAt: pastDate(1),
  },
  {
    id: 'task-8',
    title: '序厅导视系统',
    description: '序厅导视牌设计制作',
    zone: 'zone-1',
    status: 'todo',
    deadline: futureDate(5),
    assigneeId: 'user-designer',
    riskLevel: 'none',
    riskTags: [],
    photos: [],
    order: 1,
    createdAt: pastDate(2),
    updatedAt: pastDate(2),
  },
  {
    id: 'task-9',
    title: '互动体验区地面互动投影',
    description: '地面互动投影系统安装调试',
    zone: 'zone-4',
    status: 'in_progress',
    deadline: futureDate(3),
    assigneeId: 'user-constructor',
    riskLevel: 'medium',
    riskTags: ['技术风险'],
    photos: [
      {
        id: 'photo-7',
        url: PHOTO_PLACEHOLDERS[6],
        uploadedAt: pastDate(1),
        uploadedBy: 'user-constructor',
        description: '投影设备安装',
      },
    ],
    order: 2,
    createdAt: pastDate(6),
    updatedAt: pastDate(1),
  },
  {
    id: 'task-10',
    title: '尾厅出口设计',
    description: '尾厅出口背景墙设计',
    zone: 'zone-5',
    status: 'review',
    deadline: futureDate(2),
    assigneeId: 'user-designer',
    riskLevel: 'none',
    riskTags: [],
    photos: [],
    order: 2,
    createdAt: pastDate(10),
    updatedAt: pastDate(1),
  },
];

export const ROLE_PERMISSIONS: Record<UserRole, { canAccept: boolean; canEdit: boolean; canDelete: boolean; visibleStatuses: string[] }> = {
  project_manager: {
    canAccept: true,
    canEdit: true,
    canDelete: true,
    visibleStatuses: ['todo', 'in_progress', 'review', 'done'],
  },
  designer: {
    canAccept: false,
    canEdit: true,
    canDelete: false,
    visibleStatuses: ['todo', 'in_progress', 'review', 'done'],
  },
  constructor: {
    canAccept: false,
    canEdit: true,
    canDelete: false,
    visibleStatuses: ['todo', 'in_progress', 'review', 'done'],
  },
  acceptor: {
    canAccept: true,
    canEdit: false,
    canDelete: false,
    visibleStatuses: ['review', 'done'],
  },
};
