export const routes = {
  // Public
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  // Dashboard
  dashboard: "/dashboard",

  // Workspace
  workspaces: "/workspaces",
  workspace: (workspaceId: string) => `/workspaces/${workspaceId}`,
  workspaceKanban: (workspaceId: string) => `/workspaces/${workspaceId}/kanban`,
  workspaceMembers: (workspaceId: string) => `/workspaces/${workspaceId}/members`,
  workspaceSettings: (workspaceId: string) => `/workspaces/${workspaceId}/settings`,

  // Board (legacy — board sekarang nested dalam workspace)
  boards: "/boards",
  board: (boardId: string) => `/board/${boardId}`,

  // Settings
  settings: "/settings",
  settingsProfile: "/settings/profile",
  settingsAccount: "/settings/account",
} as const;

// Helper: build route dengan params aman
export type StaticRoute = Extract<(typeof routes)[keyof typeof routes], string>;
