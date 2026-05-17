import { PrismaClient, GoalStatus, GoalSheetState, ProgressType, UomType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calculateProgress } from "../lib/progress";

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.quarterlyUpdate.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.sharedGoal.deleteMany();
  await prisma.goalSheet.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.create({
    data: { name: "Aarav HR", email: "admin@test.com", passwordHash, role: "ADMIN", department: "People Success", designation: "HR Business Partner" }
  });
  const manager = await prisma.user.create({
    data: { name: "Maya Manager", email: "manager@test.com", passwordHash, role: "MANAGER", department: "Engineering", designation: "Engineering Manager" }
  });
  const employee = await prisma.user.create({
    data: { name: "Riya Employee", email: "employee@test.com", passwordHash, role: "EMPLOYEE", department: "Engineering", designation: "Frontend Engineer", managerId: manager.id }
  });
  const teammate = await prisma.user.create({
    data: { name: "Kabir Analyst", email: "kabir@test.com", passwordHash, role: "EMPLOYEE", department: "Product", designation: "Product Analyst", managerId: manager.id }
  });

  const cycle = await prisma.cycle.create({
    data: { name: "FY 2026 Goals", year: 2026, startsAt: new Date("2026-05-01"), endsAt: new Date("2027-04-30"), isActive: true }
  });

  const sharedGoal = await prisma.sharedGoal.create({
    data: {
      title: "Improve internal customer satisfaction",
      thrustArea: "Customer Centricity",
      description: "Raise internal stakeholder CSAT for delivery quality and communication cadence.",
      target: 90,
      uomType: UomType.PERCENTAGE,
      progressType: ProgressType.MIN,
      cycleId: cycle.id,
      createdById: admin.id
    }
  });

  for (const person of [employee, teammate]) {
    const sheet = await prisma.goalSheet.create({
      data: { employeeId: person.id, cycleId: cycle.id, state: person.id === employee.id ? GoalSheetState.SUBMITTED : GoalSheetState.APPROVED, submittedAt: new Date("2026-05-12") }
    });

    const goals = [
      {
        thrustArea: "Delivery Excellence",
        title: "Ship roadmap commitments",
        description: "Deliver committed sprint and quarterly roadmap items with high quality.",
        uomType: UomType.PERCENTAGE,
        progressType: ProgressType.MIN,
        target: 95,
        weightage: 35,
        deadline: new Date("2027-03-31"),
        actualValue: 68,
        status: GoalStatus.ON_TRACK
      },
      {
        thrustArea: "Operational Quality",
        title: "Reduce escaped defects",
        description: "Keep high-severity escaped defects below the agreed annual threshold.",
        uomType: UomType.NUMERIC,
        progressType: ProgressType.MAX,
        target: 3,
        weightage: 25,
        deadline: new Date("2027-03-31"),
        actualValue: 2,
        status: GoalStatus.ON_TRACK
      },
      {
        thrustArea: sharedGoal.thrustArea,
        title: sharedGoal.title,
        description: sharedGoal.description,
        uomType: sharedGoal.uomType,
        progressType: sharedGoal.progressType,
        target: sharedGoal.target,
        weightage: 40,
        deadline: new Date("2027-03-31"),
        actualValue: 82,
        sharedGoalId: sharedGoal.id,
        status: GoalStatus.ON_TRACK
      }
    ];

    for (const goal of goals) {
      const created = await prisma.goal.create({
        data: {
          ...goal,
          goalSheetId: sheet.id,
          progress: calculateProgress({ type: goal.progressType, target: goal.target, achievement: goal.actualValue, deadline: goal.deadline })
        }
      });
      await prisma.quarterlyUpdate.create({
        data: {
          goalId: created.id,
          employeeId: person.id,
          quarter: "Q1",
          achievement: goal.actualValue,
          status: goal.status,
          progress: created.progress,
          narrative: "Initial checkpoint captured from team operating metrics."
        }
      });
    }

    await prisma.comment.create({
      data: { authorId: manager.id, goalSheetId: sheet.id, body: "Good goal coverage. Please keep quarterly evidence attached to each update." }
    });
  }

  await prisma.auditLog.create({
    data: { actorId: admin.id, goalSheetId: null, entityType: "Cycle", entityId: cycle.id, action: "CREATE", newValue: { name: cycle.name } }
  });
}

main().finally(async () => prisma.$disconnect());
