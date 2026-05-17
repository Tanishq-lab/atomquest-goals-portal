import { calculateProgress, weightedCompletion } from "@/lib/progress";

export const DEMO_PASSWORD = "Password123!";

export const demoUsers = [
  { id: "demo-admin", name: "Aarav HR", email: "admin@test.com", role: "ADMIN" as const, department: "People Success", designation: "HR Business Partner", managerId: null },
  { id: "demo-manager", name: "Maya Manager", email: "manager@test.com", role: "MANAGER" as const, department: "Engineering", designation: "Engineering Manager", managerId: null },
  { id: "demo-employee", name: "Riya Employee", email: "employee@test.com", role: "EMPLOYEE" as const, department: "Engineering", designation: "Frontend Engineer", managerId: "demo-manager" },
  { id: "demo-kabir", name: "Kabir Analyst", email: "kabir@test.com", role: "EMPLOYEE" as const, department: "Product", designation: "Product Analyst", managerId: "demo-manager" }
];

export const demoCycle = {
  id: "demo-cycle",
  name: "FY 2026 Goals",
  year: 2026,
  startsAt: new Date("2026-05-01"),
  endsAt: new Date("2027-04-30"),
  isActive: true,
  createdAt: new Date("2026-05-01")
};

const sharedGoalId = "demo-shared-kpi";

function makeGoals(sheetId: string) {
  if (sheetId === "demo-sheet-kabir") {
    return [
      {
        id: `${sheetId}-goal-1`,
        goalSheetId: sheetId,
        sharedGoalId: null,
        thrustArea: "Product Analytics",
        title: "Improve user retention analysis",
        description: "Develop a new dashboard to track user drop-offs and retention metrics.",
        uomType: "PERCENTAGE" as const,
        progressType: "MIN" as const,
        target: 100,
        weightage: 30,
        deadline: new Date("2027-03-31"),
        actualValue: 50,
        completionDate: null,
        status: "ON_TRACK" as const,
        progress: 50,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        updates: [
          {
            id: `${sheetId}-goal-1-q1`,
            goalId: `${sheetId}-goal-1`,
            employeeId: "demo-kabir",
            quarter: "Q1" as const,
            achievement: 50,
            completionDate: null,
            status: "ON_TRACK" as const,
            narrative: "Completed initial data pipeline setup.",
            progress: 50,
            createdAt: new Date(),
            updatedAt: new Date(),
            comments: []
          }
        ]
      },
      {
        id: `${sheetId}-goal-2`,
        goalSheetId: sheetId,
        sharedGoalId: sharedGoalId,
        thrustArea: "Customer Centricity",
        title: "Improve internal customer satisfaction",
        description: "Raise internal stakeholder CSAT for delivery quality and communication cadence.",
        uomType: "PERCENTAGE" as const,
        progressType: "MIN" as const,
        target: 90,
        weightage: 70,
        deadline: new Date("2027-03-31"),
        actualValue: 85,
        completionDate: null,
        status: "ON_TRACK" as const,
        progress: 94,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        updates: [
          {
            id: `${sheetId}-goal-2-q1`,
            goalId: `${sheetId}-goal-2`,
            employeeId: "demo-kabir",
            quarter: "Q1" as const,
            achievement: 85,
            completionDate: null,
            status: "ON_TRACK" as const,
            narrative: "Conducted CSAT survey and shared results.",
            progress: 94,
            createdAt: new Date(),
            updatedAt: new Date(),
            comments: []
          }
        ]
      }
    ];
  }

  const goals = [
    {
      id: `${sheetId}-goal-1`,
      goalSheetId: sheetId,
      sharedGoalId: null,
      thrustArea: "Delivery Excellence",
      title: "Ship roadmap commitments",
      description: "Deliver committed sprint and quarterly roadmap items with high quality.",
      uomType: "PERCENTAGE" as const,
      progressType: "MIN" as const,
      target: 95,
      weightage: 35,
      deadline: new Date("2027-03-31"),
      actualValue: 68,
      completionDate: null,
      status: "ON_TRACK" as const,
      progress: 0,
      comments: []
    },
    {
      id: `${sheetId}-goal-2`,
      goalSheetId: sheetId,
      sharedGoalId: null,
      thrustArea: "Operational Quality",
      title: "Reduce escaped defects",
      description: "Keep high-severity escaped defects below the agreed annual threshold.",
      uomType: "NUMERIC" as const,
      progressType: "MAX" as const,
      target: 3,
      weightage: 25,
      deadline: new Date("2027-03-31"),
      actualValue: 2,
      completionDate: null,
      status: "ON_TRACK" as const,
      progress: 0,
      comments: []
    },
    {
      id: `${sheetId}-goal-3`,
      goalSheetId: sheetId,
      sharedGoalId,
      thrustArea: "Customer Centricity",
      title: "Improve internal customer satisfaction",
      description: "Raise internal stakeholder CSAT for delivery quality and communication cadence.",
      uomType: "PERCENTAGE" as const,
      progressType: "MIN" as const,
      target: 90,
      weightage: 40,
      deadline: new Date("2027-03-31"),
      actualValue: 82,
      completionDate: null,
      status: "ON_TRACK" as const,
      progress: 0,
      comments: []
    }
  ];

  return goals.map((goal) => ({
    ...goal,
    progress: calculateProgress({ type: goal.progressType, target: goal.target, achievement: goal.actualValue, deadline: goal.deadline }),
    updates: [
      {
        id: `${goal.id}-q1`,
        goalId: goal.id,
        employeeId: sheetId.includes("employee") ? "demo-employee" : "demo-kabir",
        quarter: "Q1" as const,
        achievement: goal.actualValue,
        completionDate: null,
        status: goal.status,
        narrative: "Initial checkpoint captured from team operating metrics.",
        progress: calculateProgress({ type: goal.progressType, target: goal.target, achievement: goal.actualValue, deadline: goal.deadline }),
        createdAt: new Date(),
        updatedAt: new Date(),
        comments: []
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}

export const demoSheets = [
  {
    id: "demo-sheet-employee",
    employeeId: "demo-employee",
    cycleId: demoCycle.id,
    state: "SUBMITTED" as const,
    submittedAt: new Date("2026-05-12"),
    approvedAt: null,
    lockedAt: null,
    employee: demoUsers[2],
    cycle: demoCycle,
    goals: makeGoals("demo-sheet-employee"),
    comments: [{ id: "demo-comment-1", body: "Good goal coverage. Please keep quarterly evidence attached to each update.", authorId: "demo-manager", author: demoUsers[1], goalSheetId: "demo-sheet-employee", goalId: null, quarterlyUpdateId: null, createdAt: new Date() }],
    auditLogs: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "demo-sheet-kabir",
    employeeId: "demo-kabir",
    cycleId: demoCycle.id,
    state: "APPROVED" as const,
    submittedAt: new Date("2026-05-12"),
    approvedAt: new Date("2026-05-15"),
    lockedAt: null,
    employee: demoUsers[3],
    cycle: demoCycle,
    goals: makeGoals("demo-sheet-kabir"),
    comments: [],
    auditLogs: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const demoAuditLogs = [
  { id: "demo-audit-1", actorId: "demo-admin", actor: demoUsers[0], goalSheetId: null, entityType: "Cycle", entityId: demoCycle.id, action: "CREATE", field: null, oldValue: null, newValue: { name: demoCycle.name }, createdAt: new Date() }
];

export function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}

export function demoAnalytics(sheets = demoSheets) {
  const sheetCount = sheets.length || 1;
  const goals = sheets.flatMap((sheet) => sheet.goals);
  const countBy = (values: string[]) => Object.entries(values.reduce<Record<string, number>>((acc, value) => {
    acc[value.replaceAll("_", " ")] = (acc[value.replaceAll("_", " ")] ?? 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));
  return {
    completion: Math.round(sheets.reduce((sum, sheet) => sum + weightedCompletion(sheet.goals), 0) / sheetCount),
    byStatus: countBy(goals.map((goal) => goal.status)),
    byUom: countBy(goals.map((goal) => goal.uomType)),
    byDepartment: countBy(sheets.map((sheet) => sheet.employee.department)),
    workflow: countBy(sheets.map((sheet) => sheet.state)),
    sheets: sheets.length,
    goals: goals.length
  };
}

export function getDemoDashboardData(userId: string, role: "EMPLOYEE" | "MANAGER" | "ADMIN") {
  if (role === "ADMIN") {
    return { cycle: demoCycle, users: demoUsers, sheets: demoSheets, auditLogs: demoAuditLogs, cycles: [demoCycle], analytics: demoAnalytics(demoSheets) };
  }
  if (role === "MANAGER") {
    const sheets = demoSheets.filter((sheet) => sheet.employee.managerId === userId);
    return { cycle: demoCycle, sheets, analytics: demoAnalytics(sheets) };
  }
  const sheet = demoSheets.find((item) => item.employeeId === userId) ?? null;
  return { cycle: demoCycle, sheet, analytics: demoAnalytics(sheet ? [sheet] : []) };
}
