import { z } from "zod";

export const goalSchema = z.object({
  id: z.string().optional(),
  sharedGoalId: z.string().nullable().optional(),
  thrustArea: z.string().min(2, "Thrust area is required"),
  title: z.string().min(4, "Goal title must be descriptive"),
  description: z.string().min(10, "Description must explain the expected outcome"),
  uomType: z.enum(["NUMERIC", "PERCENTAGE", "TIMELINE", "ZERO_BASED"]),
  progressType: z.enum(["MIN", "MAX", "TIMELINE", "ZERO"]),
  target: z.coerce.number().positive("Target must be greater than zero"),
  weightage: z.coerce.number().int().min(10, "Each goal must carry at least 10% weightage").max(100),
  deadline: z.coerce.date(),
  status: z.enum(["NOT_STARTED", "ON_TRACK", "COMPLETED"]).default("NOT_STARTED")
});

export const goalSheetSchema = z.object({
  cycleId: z.string().min(1),
  goals: z.array(goalSchema).min(1, "Add at least one goal").max(8, "A goal sheet can contain at most 8 goals")
}).superRefine((value, ctx) => {
  const total = value.goals.reduce((sum, goal) => sum + goal.weightage, 0);
  if (total !== 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["goals"],
      message: `Total weightage must equal 100%. Current total is ${total}%.`
    });
  }
});

export const checkInSchema = z.object({
  goalId: z.string().min(1),
  quarter: z.enum(["GOAL_SETTING", "Q1", "Q2", "Q3", "Q4"]),
  achievement: z.coerce.number().optional(),
  completionDate: z.coerce.date().optional(),
  status: z.enum(["NOT_STARTED", "ON_TRACK", "COMPLETED"]),
  narrative: z.string().max(1000).optional(),
  managerComment: z.string().max(1000).optional()
});

export const approvalSchema = z.object({
  goalSheetId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "RETURN", "LOCK", "UNLOCK"]),
  comment: z.string().max(1000).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const managerGoalEditSchema = z.object({
  goalSheetId: z.string().min(1),
  goals: z.array(z.object({
    id: z.string().min(1),
    target: z.coerce.number().positive(),
    weightage: z.coerce.number().int().min(10).max(100)
  })).min(1)
}).superRefine((value, ctx) => {
  if (value.goals.reduce((sum, goal) => sum + goal.weightage, 0) !== 100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["goals"], message: "Total weightage must equal 100% after manager edits." });
  }
});

export const sharedGoalSchema = z.object({
  title: z.string().min(4),
  thrustArea: z.string().min(2),
  description: z.string().min(10),
  target: z.coerce.number().positive(),
  uomType: z.enum(["NUMERIC", "PERCENTAGE", "TIMELINE", "ZERO_BASED"]),
  progressType: z.enum(["MIN", "MAX", "TIMELINE", "ZERO"]),
  cycleId: z.string().min(1),
  employeeIds: z.array(z.string().min(1)).min(1),
  weightage: z.coerce.number().int().min(10).max(100),
  deadline: z.coerce.date()
});

export const cycleSchema = z.object({
  name: z.string().min(4),
  year: z.coerce.number().int().min(2020),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  isActive: z.boolean().default(false)
});
