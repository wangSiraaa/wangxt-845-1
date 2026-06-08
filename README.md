# 展馆布展进度墙

Exhibition Progress Dashboard - 基于 React + TypeScript + Vite 的展馆布展任务管理看板。

## 功能特性

### 核心功能
- **看板视图**：四列拖拽式看板（待开始、进行中、待验收、已完成）
- **角色权限**：项目经理、设计师、施工方、验收方四种角色，权限和可见内容不同
- **风险等级**：任务按风险等级（无/低/中/高/严重）标识和筛选
- **展区管理**：按序厅、历史展区、科技展区、互动体验区、尾厅五个展区分类
- **验收拦截**：未上传照片的任务无法验收通过，高风险任务需先处理
- **离线存储**：所有数据自动保存到浏览器本地存储，支持离线使用

### 新增功能（撤销恢复流程）
- **撤销操作**：支持撤销最近 50 步操作，点击按钮或按 `Ctrl+Z`（Mac: `Cmd+Z`）
- **恢复操作**：支持恢复已撤销的操作，点击按钮或按 `Ctrl+Shift+Z` / `Ctrl+Y`（Mac: `Cmd+Shift+Z` / `Cmd+Y`）
- **展区任务历史记录**：所有任务操作自动记录，支持按展区查看完整变更轨迹
- **操作类型记录**：移动任务、调整顺序、验收通过、驳回任务、上传照片、删除照片、更新任务等 7 种操作类型
- **状态差异对比**：历史记录中展示每次操作前后的状态变化（状态、排序、照片数、备注等）
- **操作人追踪**：记录每个操作的执行人和执行时间
- **撤销恢复同步**：撤销/恢复操作时，历史记录同步回滚或重做

### 操作限制（保留）
- **未上传照片不能标记完成**：验收前必须上传布展照片作为证据
- **高风险任务拦截**：高/严重风险的任务需先排除风险才能验收
- **超期任务拦截**：已超期任务需要项目经理审批后才能验收

## 启动方式

### 开发环境
```bash
npm install
npm run dev
```

### 生产构建
```bash
npm run build
npm run preview
```

### Docker 部署
```bash
docker-compose up -d
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Z` / `Cmd+Z` | 撤销上一步操作 |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | 恢复已撤销的操作 |
| `Ctrl+Y` / `Cmd+Y` | 恢复已撤销的操作（备选） |

## 新增使用场景

### 场景 1：误操作撤销
**问题**：不小心把"科技展区互动装置"从"待验收"拖回了"进行中"。
**解决**：点击顶部"撤销"按钮，或按 `Ctrl+Z`，任务立即恢复到原来的位置和状态，历史记录也同步回滚。

### 场景 2：验收失误恢复
**问题**：误将有质量问题的任务点击了"验收通过"。
**解决**：按 `Ctrl+Z` 撤销验收操作，任务回到"待验收"状态，可以重新检查后再操作。

### 场景 3：对比多次调整
**问题**：想查看某个展区任务在过去一周的状态变化。
**解决**：点击"操作历史"按钮，打开历史记录面板，可以按时间顺序查看所有操作，包括状态变更、照片上传、驳回原因等详细信息。

### 场景 4：撤销后再恢复
**问题**：撤销了一个操作后发现原来的操作是正确的。
**解决**：点击"恢复"按钮，或按 `Ctrl+Shift+Z`，操作被重新应用，历史记录也同步更新。

### 场景 5：多展区操作追溯
**问题**：需要确认"历史展区灯光调试"这个任务是谁在什么时候标记为高风险的。
**解决**：打开操作历史面板，找到该任务的相关记录，可以看到操作人、操作时间、风险等级变更的具体内容。

## 技术栈

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 3
- Zustand（状态管理 + 持久化）
- @dnd-kit（拖拽排序）
- Lucide React（图标库）
- React Router（路由）

## 项目结构

```
src/
├── components/          # 组件
│   ├── Empty.tsx
│   ├── FilterBar.tsx
│   ├── KanbanColumn.tsx
│   ├── ProgressStats.tsx
│   ├── RoleSwitcher.tsx
│   ├── TaskCard.tsx
│   └── TaskHistoryPanel.tsx   # 新增：历史记录面板
├── data/
│   └── seed.ts          # 种子数据
├── hooks/
│   └── useTheme.ts
├── lib/
│   └── utils.ts
├── pages/
│   └── Home.tsx         # 主页面（已扩展撤销恢复）
├── store/
│   └── useTaskStore.ts  # 状态管理（已扩展撤销栈/重做栈/历史记录）
├── types/
│   └── index.ts         # 类型定义（已扩展历史记录类型）
├── utils/
│   └── taskUtils.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 数据存储说明

所有数据（任务列表、筛选条件、用户角色、撤销栈、重做栈、操作历史）自动保存到浏览器本地存储 `localStorage`，key 为 `exhibition-task-storage`。

- 撤销栈最多保存 50 步操作
- 历史记录最多保存 200 条记录
- 刷新页面后数据保留，可继续操作
- 撤销/恢复操作会同步回滚历史记录

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
