export type AdminOperationMetric = {
  id: string;
  label: string;
  value: number | null;
  href: string;
  description: string;
};

export type AdminPriorityItem = {
  id: string;
  label: string;
  description: string;
  count: number;
  href: string;
  actionLabel: string;
  severity: "critical" | "attention" | "info";
};

export type AdminContentReadiness = {
  id: string;
  label: string;
  description: string;
  total: number | null;
  ready: number | null;
  href: string;
};

export type AdminRecentActivity = {
  id: string;
  actionLabel: string;
  entityLabel: string;
  actorName: string;
  createdAt: string;
  href: string;
};

export type AdminQuickAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: "attraction" | "story" | "checkin" | "media" | "route";
};

export type AdminModuleDirectoryItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
};

export type AdminModuleDirectoryGroup = {
  id: string;
  label: string;
  items: AdminModuleDirectoryItem[];
};

export type AdminOperationsViewModel = {
  generatedAt: string;
  actionRequiredCount: number;
  unavailableCount: number;
  summaryMetrics: AdminOperationMetric[];
  todayMetrics: AdminOperationMetric[];
  priorityQueue: AdminPriorityItem[];
  contentReadiness: AdminContentReadiness[];
  recentActivity: AdminRecentActivity[];
  quickActions: AdminQuickAction[];
  modules: AdminModuleDirectoryGroup[];
};
