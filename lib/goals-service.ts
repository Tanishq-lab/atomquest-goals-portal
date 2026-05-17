import { GoalSheetState, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateProgress, weightedCompletion } from "@/lib/progress";
import { cycleSchema, goalSheetSchema, checkInSchema, managerGoalEditSchema, sharedGoalSchema } from "@/lib/validations";
import { getDemoDashboardData, isDemoMode } from "@/lib/demo-data";

export async function getDashboardData(userId: string, role: Role) {
  if (isDemoMode()) return getDemoDashboardData(userId, role);

  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  const baseInclude = {
    employee: true,
    cycle: true,
    goals: { include: { updates: true, comments: { include: { author: true } } }, orderBy: { createdAt: "asc" as const } },
    comments: { include: { author: true }, orderBy: { createdAt: "desc" as const } }
  };

  if (role === "ADMIN") {
    const [users, sheets, auditLogs, cycles] = await Promise.all([
      prisma.user.findMany({ orderBy: { name: "asc" } }),
      prisma.goalSheet.findMany({ include: baseInclude, orderBy: { updatedAt: "desc" } }),
      prisma.auditLog.findMany({ include: { actor: true }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.cycle.findMany({ orderBy: [{ year: "desc" }, { createdAt: "desc" }] })
    ]);
    return { cycle, users, sheets, auditLogs, cycles, analytics: summarizeSheets(sheets) };
  }

  if (role === "MANAGER") {
    const sheets = await prisma.goalSheet.findMany({
      where: { employee: { managerId: userId } },
      include: baseInclude,
      orderBy: { updatedAt: "desc" }
    });
    return { cycle, sheets, analytics: summarizeSheets(sheets) };
  }

  const sheet = cycle
    ? await prisma.goalSheet.findUnique({ where: { employeeId_cycleId: { employeeId: userId, cycleId: cycle.id } }, include: baseInclude })
    : null;
  return { cycle, sheet, analytics: summarizeSheets(sheet ? [sheet] : []) };
}

export async function upsertGoalSheet(userId: string, payload: unknown) {
  if (isDemoMode()) return { ok: true, demo: true };
  const data = goalSheetSchema.parse(payload);
  const existing = await prisma.goalSheet.findUnique({ where: { employeeId_cycleId: { employeeId: userId, cycleId: data.cycleId } }, include: { goals: true } });
  if (existing && !["DRAFT", "REWORK_REQUESTED"].includes(existing.state)) {
    throw new Error("Only draft or rework-requested goal sheets can be edited.");
  }

  return prisma.$transaction(async (tx) => {
    const sheet =
      existing ??
      (await tx.goalSheet.create({
        data: { employeeId: userId, cycleId: data.cycleId, state: "DRAFT" }
      }));

    const incomingIds = data.goals.map((goal) => goal.id).filter(Boolean) as string[];
    await tx.goal.deleteMany({ where: { goalSheetId: sheet.id, sharedGoalId: null, id: { notIn: incomingIds } } });
    for (const goal of data.goals) {
      const existingGoal = goal.id ? await tx.goal.findFirst({ where: { id: goal.id, goalSheetId: sheet.id } }) : null;
      if (existingGoal?.sharedGoalId) {
        await tx.goal.update({ where: { id: existingGoal.id }, data: { weightage: goal.weightage } });
      } else if (existingGoal) {
        await tx.goal.update({
          where: { id: existingGoal.id },
          data: {
            thrustArea: goal.thrustArea,
            title: goal.title,
            description: goal.description,
            uomType: goal.uomType,
            progressType: goal.progressType,
            target: goal.target,
            weightage: goal.weightage,
            deadline: goal.deadline,
            status: goal.status
          }
        });
      } else {
        await tx.goal.create({
          data: {
            goalSheetId: sheet.id,
            thrustArea: goal.thrustArea,
            title: goal.title,
            description: goal.description,
            uomType: goal.uomType,
            progressType: goal.progressType,
            target: goal.target,
            weightage: goal.weightage,
            deadline: goal.deadline,
            status: goal.status,
            progress: 0
          }
        });
      }
    }

    await tx.auditLog.create({ data: { actorId: userId, goalSheetId: sheet.id, entityType: "GoalSheet", entityId: sheet.id, action: "UPSERT", newValue: data } });
    return tx.goalSheet.findUnique({ where: { id: sheet.id }, include: { goals: true } });
  });
}

export async function submitGoalSheet(userId: string, cycleId: string) {
  if (isDemoMode()) return { ok: true, demo: true, state: "SUBMITTED" };
  const sheet = await prisma.goalSheet.findUnique({ where: { employeeId_cycleId: { employeeId: userId, cycleId } }, include: { goals: true } });
  if (!sheet) throw new Error("Create a goal sheet before submitting.");
  goalSheetSchema.parse({ cycleId, goals: sheet.goals });
  return prisma.goalSheet.update({ where: { id: sheet.id }, data: { state: "SUBMITTED", submittedAt: new Date() } });
}

export async function runApproval(actorId: string, role: Role, input: { goalSheetId: string; action: string; comment?: string }) {
  if (isDemoMode()) return { ok: true, demo: true, state: input.action === "UNLOCK" ? "REWORK_REQUESTED" : input.action };
  const sheet = await prisma.goalSheet.findUnique({ where: { id: input.goalSheetId }, include: { employee: true } });
  if (!sheet) throw new Error("Goal sheet not found.");
  if (input.action === "UNLOCK" && role !== "ADMIN") throw new Error("Only Admin/HR can unlock approved or locked goal sheets.");
  if (input.action !== "UNLOCK" && !["MANAGER", "ADMIN"].includes(role)) throw new Error("Only managers and HR can approve goal sheets.");

  const nextState: Record<string, GoalSheetState> = {
    APPROVE: "APPROVED",
    REJECT: "REWORK_REQUESTED",
    RETURN: "REWORK_REQUESTED",
    LOCK: "LOCKED",
    UNLOCK: "REWORK_REQUESTED"
  };

  return prisma.$transaction(async (tx) => {
    const updated = await tx.goalSheet.update({
      where: { id: sheet.id },
      data: {
        state: nextState[input.action],
        approvedAt: input.action === "APPROVE" ? new Date() : sheet.approvedAt,
        lockedAt: input.action === "LOCK" ? new Date() : input.action === "UNLOCK" ? null : sheet.lockedAt
      }
    });
    if (input.comment) await tx.comment.create({ data: { authorId: actorId, goalSheetId: sheet.id, body: input.comment } });
    await tx.auditLog.create({
      data: {
        actorId,
        goalSheetId: sheet.id,
        entityType: "GoalSheet",
        entityId: sheet.id,
        action: input.action,
        field: "state",
        oldValue: sheet.state,
        newValue: updated.state
      }
    });
    await tx.notification.create({
      data: { userId: sheet.employeeId, title: `Goal sheet ${updated.state.replaceAll("_", " ").toLowerCase()}`, body: input.comment ?? "Your goal sheet status changed." }
    });
    return updated;
  });
}

export async function saveCheckIn(userId: string, role: Role, payload: unknown) {
  const data = checkInSchema.parse(payload);
  assertQuarterWindow(data.quarter);
  if (isDemoMode()) return { ok: true, demo: true, ...data };
  const goal = await prisma.goal.findUnique({ where: { id: data.goalId }, include: { goalSheet: { include: { employee: true } } } });
  if (!goal) throw new Error("Goal not found.");
  if (role === "EMPLOYEE" && goal.goalSheet.employeeId !== userId) throw new Error("You can update only your own goals.");
  if (role === "MANAGER" && goal.goalSheet.employee.managerId !== userId) throw new Error("Managers can check in only their own team members.");

  const progress = calculateProgress({ type: goal.progressType, target: goal.target, achievement: data.achievement, deadline: goal.deadline, completionDate: data.completionDate });
  return prisma.$transaction(async (tx) => {
    const update = await tx.quarterlyUpdate.upsert({
      where: { goalId_quarter: { goalId: goal.id, quarter: data.quarter } },
      update: { achievement: data.achievement, completionDate: data.completionDate, status: data.status, narrative: data.narrative, progress },
      create: { goalId: goal.id, employeeId: goal.goalSheet.employeeId, quarter: data.quarter, achievement: data.achievement, completionDate: data.completionDate, status: data.status, narrative: data.narrative, progress }
    });
    await tx.goal.update({ where: { id: goal.id }, data: { actualValue: data.achievement, completionDate: data.completionDate, status: data.status, progress } });
    if (goal.sharedGoalId) {
      await tx.goal.updateMany({
        where: { sharedGoalId: goal.sharedGoalId },
        data: { actualValue: data.achievement, completionDate: data.completionDate, status: data.status, progress }
      });
    }
    if (role !== "EMPLOYEE" && data.managerComment) {
      await tx.comment.create({ data: { authorId: userId, goalId: goal.id, quarterlyUpdateId: update.id, body: data.managerComment } });
    }
    await tx.auditLog.create({ data: { actorId: userId, goalSheetId: goal.goalSheetId, entityType: "QuarterlyUpdate", entityId: update.id, action: "UPSERT", newValue: data } });
    return update;
  });
}

export async function managerEditGoals(actorId: string, role: Role, payload: unknown) {
  const data = managerGoalEditSchema.parse(payload);
  if (isDemoMode()) return { ok: true, demo: true, ...data };
  if (!["MANAGER", "ADMIN"].includes(role)) throw new Error("Only managers and HR can edit submitted goals.");
  const sheet = await prisma.goalSheet.findUnique({ where: { id: data.goalSheetId }, include: { employee: true, goals: true } });
  if (!sheet) throw new Error("Goal sheet not found.");
  if (role === "MANAGER" && sheet.employee.managerId !== actorId) throw new Error("Managers can edit only their team goal sheets.");
  if (!["SUBMITTED", "REWORK_REQUESTED"].includes(sheet.state)) throw new Error("Inline edits are allowed only before approval.");

  return prisma.$transaction(async (tx) => {
    for (const item of data.goals) {
      const old = sheet.goals.find((goal) => goal.id === item.id);
      if (!old) continue;
      await tx.goal.update({ where: { id: item.id }, data: { target: old.sharedGoalId ? old.target : item.target, weightage: item.weightage } });
      await tx.auditLog.create({
        data: {
          actorId,
          goalSheetId: sheet.id,
          entityType: "Goal",
          entityId: item.id,
          action: "MANAGER_INLINE_EDIT",
          oldValue: { target: old.target, weightage: old.weightage },
          newValue: { target: old.sharedGoalId ? old.target : item.target, weightage: item.weightage }
        }
      });
    }
    return tx.goalSheet.findUnique({ where: { id: sheet.id }, include: { goals: true } });
  });
}

export async function pushSharedGoal(actorId: string, role: Role, payload: unknown) {
  if (!["MANAGER", "ADMIN"].includes(role)) throw new Error("Only managers and HR can push shared goals.");
  const data = sharedGoalSchema.parse(payload);
  if (isDemoMode()) return { ok: true, demo: true, ...data };
  const employees = await prisma.user.findMany({ where: { id: { in: data.employeeIds }, role: "EMPLOYEE" } });
  const allowedEmployees = role === "ADMIN" ? employees : employees.filter((employee) => employee.managerId === actorId);
  if (!allowedEmployees.length) throw new Error("No eligible employees selected.");

  return prisma.$transaction(async (tx) => {
    const shared = await tx.sharedGoal.create({
      data: {
        title: data.title,
        thrustArea: data.thrustArea,
        description: data.description,
        target: data.target,
        uomType: data.uomType,
        progressType: data.progressType,
        cycleId: data.cycleId,
        createdById: actorId
      }
    });
    for (const employee of allowedEmployees) {
      const sheet = await tx.goalSheet.upsert({
        where: { employeeId_cycleId: { employeeId: employee.id, cycleId: data.cycleId } },
        update: {},
        create: { employeeId: employee.id, cycleId: data.cycleId, state: "DRAFT" }
      });
      await tx.goal.create({
        data: {
          goalSheetId: sheet.id,
          sharedGoalId: shared.id,
          thrustArea: data.thrustArea,
          title: data.title,
          description: data.description,
          uomType: data.uomType,
          progressType: data.progressType,
          target: data.target,
          weightage: data.weightage,
          deadline: data.deadline,
          status: "NOT_STARTED",
          progress: 0
        }
      });
      await tx.notification.create({ data: { userId: employee.id, title: "Shared KPI assigned", body: `${data.title} was pushed to your goal sheet. You may adjust weightage only.` } });
    }
    await tx.auditLog.create({ data: { actorId, entityType: "SharedGoal", entityId: shared.id, action: "PUSH", newValue: { ...data, employeeIds: allowedEmployees.map((employee) => employee.id) } } });
    return shared;
  });
}

export async function createCycle(actorId: string, payload: unknown) {
  const data = cycleSchema.parse(payload);
  if (isDemoMode()) return { ok: true, demo: true, ...data };
  return prisma.$transaction(async (tx) => {
    if (data.isActive) await tx.cycle.updateMany({ data: { isActive: false } });
    const cycle = await tx.cycle.create({ data });
    await tx.auditLog.create({ data: { actorId, entityType: "Cycle", entityId: cycle.id, action: "CREATE", newValue: data } });
    return cycle;
  });
}

export function getActiveQuarterWindow(now = new Date()) {
  const month = now.getMonth() + 1;
  if (month === 5) return { quarter: "GOAL_SETTING" as const, label: "Goal Setting", message: "Goal creation, submission, and approval window is open." };
  if (month === 7) return { quarter: "Q1" as const, label: "Q1", message: "Q1 progress update window is open." };
  if (month === 10) return { quarter: "Q2" as const, label: "Q2", message: "Q2 progress update window is open." };
  if (month === 1) return { quarter: "Q3" as const, label: "Q3", message: "Q3 progress update window is open." };
  if (month === 3 || month === 4) return { quarter: "Q4" as const, label: "Q4 / Annual", message: "Final achievement capture window is open." };
  return null;
}

function assertQuarterWindow(quarter: "GOAL_SETTING" | "Q1" | "Q2" | "Q3" | "Q4") {
  const active = getActiveQuarterWindow();
  if (!active || active.quarter !== quarter) {
    throw new Error(active ? `Only ${active.label} updates are open right now.` : "Quarterly achievement capture is closed for the current month.");
  }
}

export function summarizeSheets(
  sheets: Array<{
    state: GoalSheetState;
    employee?: { department: string };
    goals: { weightage: number; progress: number; status: string; uomType: string }[];
  }>
) {
  const sheetCount = sheets.length;
  const completionRaw = sheetCount
    ? sheets.reduce((sum, sheet) => sum + weightedCompletion(sheet.goals), 0) / sheetCount
    : 0;

  // Guard against unexpected scale drift (e.g., returning 0..1 vs 0..100).
  // Keep completion within 0..100 for chart stability.
  const completion = Math.round(Math.min(100, Math.max(0, completionRaw)));

  const byStatus = countBy(sheets.flatMap((sheet) => sheet.goals.map((goal) => goal.status)));
  const byUom = countBy(sheets.flatMap((sheet) => sheet.goals.map((goal) => goal.uomType)));
  const byDepartment = countBy(sheets.map((sheet) => sheet.employee?.department ?? "Unknown"));
  const workflow = countBy(sheets.map((sheet) => sheet.state));
  return {
    completion,
    byStatus,
    byUom,
    byDepartment,
    workflow,
    sheets: sheets.length,
    goals: sheets.flatMap((sheet) => sheet.goals).length
  };
}


function countBy(values: string[]) {
  return Object.entries(values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name: name.replaceAll("_", " "), value }));
}
