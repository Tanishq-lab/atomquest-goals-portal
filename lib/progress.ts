import type { ProgressType } from "@prisma/client";

export function calculateProgress(input: {
  type: ProgressType;
  target: number;
  achievement?: number | null;
  deadline?: Date | string | null;
  completionDate?: Date | string | null;
}) {
  const target = Number(input.target);
  const achievement = Number(input.achievement ?? 0);

  if (input.type === "ZERO") return achievement === 0 ? 100 : 0;
  if (input.type === "MAX") return achievement > 0 ? clamp((target / achievement) * 100) : 0;
  if (input.type === "TIMELINE") {
    if (!input.deadline || !input.completionDate) return 0;
    const deadline = new Date(input.deadline).getTime();
    const completed = new Date(input.completionDate).getTime();
    return completed <= deadline ? 100 : clamp(100 - ((completed - deadline) / 86_400_000) * 3);
  }
  return target > 0 ? clamp((achievement / target) * 100) : 0;
}

function clamp(value: number) {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function weightedCompletion(goals: { weightage: number; progress: number }[]) {
  return Math.round(goals.reduce((sum, goal) => sum + (goal.weightage / 100) * goal.progress, 0));
}
