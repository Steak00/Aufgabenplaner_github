// WORK IN PROGRESS

export interface EvaluationData {
  completedTasks: {
    count: number;
    total: number;
    percentageChange: number; // e.g., +12 for +12%
  };
  focusTime: {
    hours: number;
    minutes: number;
    percentageChange: number;
  };
  focusTimePerDay: {
    hours: number;
    minutes: number;
    percentageChange: number;
  };
  productivityOverTime: { day: number; value: number }[];
  taskDistribution: { status: string; label: string; percentage: number; colors: string[] }[];
}