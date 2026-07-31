// Query keys for TanStack Query
// Pattern: [entity, scope?, id?]

export const queryKeys = {
  // Board
  boards: {
    all: ["boards"] as const,
    byUser: (userId: string) => ["boards", "user", userId] as const,
    detail: (boardId: string) => ["boards", boardId] as const,
  },

  // Task
  tasks: {
    all: ["tasks"] as const,
    byBoard: (boardId: string) => ["tasks", "board", boardId] as const,
    detail: (taskId: string) => ["tasks", taskId] as const,
  },

  // Workspace
  workspaces: {
    all: ["workspaces"] as const,
    byUser: (userId: string) => ["workspaces", "user", userId] as const,
    detail: (workspaceId: string) => ["workspaces", workspaceId] as const,
  },
} as const;
