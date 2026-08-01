import "server-only";

import {
  hasPermission,
  type AdminActor,
  type PermissionKey,
} from "@/lib/auth/guards";
import {
  adminOperationsRepository,
  type AdminOperationsRepository,
  type ContentReadinessCount,
} from "@/lib/repositories/admin-operations.repository";
import type {
  AdminContentReadiness,
  AdminModuleDirectoryGroup,
  AdminOperationMetric,
  AdminOperationsViewModel,
  AdminPriorityItem,
  AdminQuickAction,
  AdminRecentActivity,
} from "@/types/admin-operations";

type ServiceOptions = {
  now?: Date;
  repository?: AdminOperationsRepository;
};

type ModuleDefinition = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  requiredAny: PermissionKey[];
};

type ModuleGroupDefinition = {
  id: string;
  label: string;
  items: ModuleDefinition[];
};

const MODULE_GROUPS: ModuleGroupDefinition[] = [
  {
    id: "tourism-data",
    label: "ข้อมูลนักท่องเที่ยว",
    items: [
      { id: "analytics", label: "การวิเคราะห์", description: "ตัวชี้วัดและแนวโน้มเพื่อการวางแผน", href: "/admin/dashboard", icon: "analytics", requiredAny: ["dashboard.read"] },
      { id: "tourists", label: "นักท่องเที่ยว", description: "โปรไฟล์และข้อมูลที่นักท่องเที่ยวให้ไว้", href: "/admin/tourists", icon: "tourists", requiredAny: ["tourist.read"] },
      { id: "visits", label: "การเข้าชม", description: "ประวัติการเช็กอินและสถานะการเดินทาง", href: "/admin/visits", icon: "visits", requiredAny: ["visit.read"] },
      { id: "reviews", label: "รีวิว", description: "ตรวจและเผยแพร่ความคิดเห็นจากนักท่องเที่ยว", href: "/admin/reviews", icon: "reviews", requiredAny: ["review.read"] },
      { id: "surveys", label: "แบบสำรวจ", description: "พฤติกรรม ค่าใช้จ่าย และความพึงพอใจ", href: "/admin/surveys", icon: "surveys", requiredAny: ["survey.read"] },
    ],
  },
  {
    id: "content",
    label: "เนื้อหาและสถานที่",
    items: [
      { id: "attractions", label: "สถานที่ท่องเที่ยว", description: "ข้อมูลสถานที่สำหรับยะลาที่เปิดใช้งาน", href: "/admin/attractions", icon: "attractions", requiredAny: ["attraction.read"] },
      { id: "routes", label: "เส้นทางแนะนำ", description: "ลำดับจุดแวะและเส้นทางท่องเที่ยว", href: "/admin/routes", icon: "routes", requiredAny: ["route.read"] },
      { id: "stories", label: "เรื่องราว", description: "บทความ เรื่องเล่า และงานบรรณาธิการ", href: "/admin/stories", icon: "stories", requiredAny: ["story.read"] },
      { id: "restaurants", label: "ร้านอาหาร", description: "ร้านอาหารและของฝากในพื้นที่", href: "/admin/restaurants", icon: "restaurants", requiredAny: ["restaurant.read"] },
      { id: "accommodations", label: "ที่พัก", description: "ข้อมูลที่พักและสถานะการเผยแพร่", href: "/admin/accommodations", icon: "accommodations", requiredAny: ["attraction.read"] },
      { id: "media", label: "คลังสื่อ", description: "รูปภาพ คำอธิบาย และวงจรชีวิตสื่อ", href: "/admin/media", icon: "media", requiredAny: ["media.read"] },
      { id: "photo-spots", label: "จุดถ่ายภาพ", description: "จุดรับ QR ภายในสถานที่", href: "/admin/photo-spots", icon: "photo-spots", requiredAny: ["photo_spot.read"] },
    ],
  },
  {
    id: "engagement",
    label: "การมีส่วนร่วมและรางวัล",
    items: [
      { id: "checkin-codes", label: "QR เช็กอิน", description: "สร้าง ทดสอบ และควบคุมรหัสเช็กอิน", href: "/admin/checkin-codes", icon: "checkin", requiredAny: ["checkin_code.read"] },
      { id: "certificate-templates", label: "แม่แบบใบประกาศ", description: "ออกแบบและเปิดใช้ใบประกาศดิจิทัล", href: "/admin/certificate-templates", icon: "certificates", requiredAny: ["certificate.template_manage"] },
      { id: "badges", label: "เหรียญรางวัล", description: "เงื่อนไขและสถานะรางวัลดิจิทัล", href: "/admin/badges", icon: "badges", requiredAny: ["badge.read"] },
      { id: "leaderboard", label: "ตารางอันดับ", description: "ตรวจคะแนนและแรงจูงใจการมีส่วนร่วม", href: "/admin/leaderboard", icon: "leaderboard", requiredAny: ["leaderboard.read"] },
    ],
  },
  {
    id: "system",
    label: "ระบบและสิทธิ์",
    items: [
      { id: "users", label: "ผู้ดูแลระบบ", description: "บัญชีและสถานะผู้ดูแล", href: "/admin/users", icon: "users", requiredAny: ["user.read"] },
      { id: "roles", label: "บทบาทและสิทธิ์", description: "กำหนดสิทธิ์ตามหน้าที่", href: "/admin/roles", icon: "roles", requiredAny: ["role.read"] },
      { id: "audit", label: "บันทึกการใช้งาน", description: "ตรวจสอบกิจกรรมที่เกิดในระบบ", href: "/admin/audit", icon: "audit", requiredAny: ["audit.read"] },
      { id: "messages", label: "ข้อความ", description: "ข้อความติดต่อที่ยังต้องตอบกลับ", href: "/admin/messages", icon: "messages", requiredAny: ["message.read"] },
      { id: "settings", label: "ตั้งค่าระบบ", description: "ค่าระดับเว็บไซต์และการแสดงผล", href: "/admin/settings", icon: "settings", requiredAny: ["system.settings_read", "system.settings_update"] },
    ],
  },
];

function can(actor: AdminActor, permission: PermissionKey) {
  return hasPermission(actor, permission);
}

function canAny(actor: AdminActor, permissions: PermissionKey[]) {
  return permissions.some((permission) => can(actor, permission));
}

export function buildBangkokDayRange(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  const startMs = Date.UTC(value("year"), value("month") - 1, value("day")) - 7 * 60 * 60 * 1000;

  return {
    start: new Date(startMs).toISOString(),
    end: new Date(startMs + 24 * 60 * 60 * 1000).toISOString(),
  };
}

function actionLabel(action: string) {
  const normalized = action.toLowerCase();
  if (normalized.includes("publish")) return "เผยแพร่เนื้อหา";
  if (normalized.includes("create")) return "สร้างข้อมูล";
  if (normalized.includes("update") || normalized.includes("edit")) return "แก้ไขข้อมูล";
  if (normalized.includes("delete")) return "ลบข้อมูล";
  if (normalized.includes("approve")) return "อนุมัติรายการ";
  if (normalized.includes("reject")) return "ส่งกลับรายการ";
  if (normalized.includes("export")) return "ส่งออกข้อมูล";
  if (normalized.includes("login")) return "เข้าสู่ระบบ";
  return "ดำเนินการในระบบ";
}

function entityLabel(entityType: string | null) {
  const labels: Record<string, string> = {
    attraction: "สถานที่ท่องเที่ยว",
    attractions: "สถานที่ท่องเที่ยว",
    story: "เรื่องราว",
    travel_story: "เรื่องราว",
    route: "เส้นทางแนะนำ",
    restaurant: "ร้านอาหาร",
    accommodation: "ที่พัก",
    media: "คลังสื่อ",
    checkin_code: "QR เช็กอิน",
    certificate_template: "แม่แบบใบประกาศ",
    admin_user: "ผู้ดูแลระบบ",
    role: "บทบาทและสิทธิ์",
  };
  return entityType ? labels[entityType] ?? "ข้อมูลระบบ" : "ข้อมูลระบบ";
}

function visibleModules(actor: AdminActor): AdminModuleDirectoryGroup[] {
  return MODULE_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    items: group.items
      .filter((item) => canAny(actor, item.requiredAny))
      .map(({ requiredAny: _requiredAny, ...item }) => item),
  })).filter((group) => group.items.length > 0);
}

export async function getAdminOperationsViewModel(
  actor: AdminActor,
  options: ServiceOptions = {},
): Promise<AdminOperationsViewModel> {
  const now = options.now ?? new Date();
  const repository = options.repository ?? adminOperationsRepository;
  const today = buildBangkokDayRange(now);
  const scheduledEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  let unavailableCount = 0;

  const safeRead = async <T>(label: string, operation: () => Promise<T>): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      unavailableCount += 1;
      console.error(`Admin operations read failed: ${label}`, error);
      return null;
    }
  };

  const noAccess = Promise.resolve(undefined);
  const [
    pendingStories,
    scheduledStories,
    unreadMessages,
    pendingReviews,
    expiredCheckinCodes,
    missingMediaAlt,
    todayVisits,
    todayCertificates,
    todaySurveys,
    todayAbandoned,
    attractionReadiness,
    storyReadiness,
    routeReadiness,
    mediaReadiness,
    recentAudit,
  ] = await Promise.all([
    can(actor, "story.review") ? safeRead("pending-stories", () => repository.countPendingTouristStories()) : noAccess,
    can(actor, "story.read") ? safeRead("scheduled-stories", () => repository.countScheduledStories(now.toISOString(), scheduledEnd)) : noAccess,
    can(actor, "message.read") ? safeRead("unread-messages", () => repository.countUnreadMessages()) : noAccess,
    can(actor, "review.read") ? safeRead("pending-reviews", () => repository.countPendingReviews()) : noAccess,
    can(actor, "checkin_code.read") ? safeRead("expired-checkin-codes", () => repository.countExpiredCheckinCodes(now.toISOString())) : noAccess,
    can(actor, "media.read") ? safeRead("missing-media-alt", () => repository.countMissingMediaAltText()) : noAccess,
    can(actor, "visit.read") ? safeRead("today-visits", () => repository.countTodayVisits(today.start, today.end)) : noAccess,
    can(actor, "certificate.read") ? safeRead("today-certificates", () => repository.countTodayCertificates(today.start, today.end)) : noAccess,
    can(actor, "survey.read") ? safeRead("today-surveys", () => repository.countTodaySurveys(today.start, today.end)) : noAccess,
    can(actor, "visit.read") ? safeRead("today-abandoned", () => repository.countTodayAbandonedVisits(today.start, today.end)) : noAccess,
    can(actor, "attraction.read") ? safeRead("attraction-readiness", () => repository.getAttractionReadiness()) : noAccess,
    can(actor, "story.read") ? safeRead("story-readiness", () => repository.getStoryReadiness()) : noAccess,
    can(actor, "route.read") ? safeRead("route-readiness", () => repository.getRouteReadiness()) : noAccess,
    can(actor, "media.read") ? safeRead("media-readiness", () => repository.getMediaReadiness()) : noAccess,
    can(actor, "audit.read") ? safeRead("recent-audit", () => repository.listRecentAuditActivity(5)) : noAccess,
  ]);

  const priorityQueue: AdminPriorityItem[] = [];
  const addPriority = (
    value: number | null | undefined,
    item: Omit<AdminPriorityItem, "count">,
  ) => {
    if (typeof value === "number" && value > 0) {
      priorityQueue.push({ ...item, count: value });
    }
  };

  addPriority(expiredCheckinCodes, {
    id: "expired-checkin-codes",
    label: "QR หมดอายุแต่ยังเปิดใช้งาน",
    description: "ปิดหรือกำหนดช่วงเวลาใหม่เพื่อป้องกันนักท่องเที่ยวพบลิงก์ที่ใช้ไม่ได้",
    href: "/admin/checkin-codes?status=active",
    actionLabel: "ตรวจ QR",
    severity: "critical",
  });
  addPriority(todayAbandoned, {
    id: "abandoned-visits",
    label: "การเช็กอินที่หยุดกลางทางวันนี้",
    description: "ตรวจจุดที่นักท่องเที่ยวออกจากขั้นตอนก่อนรับใบประกาศ",
    href: "/admin/visits?status=abandoned",
    actionLabel: "ดูการเข้าชม",
    severity: "critical",
  });
  addPriority(pendingStories, {
    id: "pending-stories",
    label: "เรื่องรอการตรวจ",
    description: "เรื่องจากนักท่องเที่ยวที่ยังไม่ได้เริ่มกระบวนการพิจารณา",
    href: "/admin/stories/submissions?status=submitted",
    actionLabel: "เริ่มตรวจเรื่อง",
    severity: "attention",
  });
  addPriority(pendingReviews, {
    id: "pending-reviews",
    label: "รีวิวรออนุมัติ",
    description: "ตรวจความเหมาะสมก่อนเผยแพร่บนหน้าสถานที่และร้านอาหาร",
    href: "/admin/reviews?isApproved=false",
    actionLabel: "ตรวจรีวิว",
    severity: "attention",
  });
  addPriority(unreadMessages, {
    id: "unread-messages",
    label: "ข้อความยังไม่อ่าน",
    description: "ข้อความติดต่อจากผู้ใช้งานที่ทีมยังไม่ได้เปิดอ่าน",
    href: "/admin/messages?status=unread",
    actionLabel: "เปิดกล่องข้อความ",
    severity: "attention",
  });
  addPriority(missingMediaAlt, {
    id: "missing-media-alt",
    label: "รูปยังไม่มีคำอธิบายภาษาไทย",
    description: "เพิ่มคำอธิบายภาพเพื่อการเข้าถึงและคุณภาพเนื้อหา",
    href: "/admin/content-health#media",
    actionLabel: "แก้ข้อมูลสื่อ",
    severity: "info",
  });

  const priorityCounts: Array<number | null | undefined> = [
    expiredCheckinCodes,
    todayAbandoned,
    pendingStories,
    pendingReviews,
    unreadMessages,
    missingMediaAlt,
  ];
  const actionRequiredCount = priorityCounts.reduce<number>(
    (sum, count) => sum + (typeof count === "number" ? count : 0),
    0,
  );

  const summaryMetrics: AdminOperationMetric[] = [
    {
      id: "action-required",
      label: "งานต้องจัดการ",
      value: actionRequiredCount,
      href: "#priority-queue",
      description: "รวมรายการที่ต้องติดตามตามสิทธิ์ของคุณ",
    },
  ];
  if (pendingStories !== undefined) summaryMetrics.push({ id: "pending-stories", label: "เรื่องรออนุมัติ", value: pendingStories, href: "/admin/stories/submissions?status=submitted", description: "เรื่องจากนักท่องเที่ยวที่รอเริ่มตรวจ" });
  if (unreadMessages !== undefined) summaryMetrics.push({ id: "unread-messages", label: "ข้อความยังไม่อ่าน", value: unreadMessages, href: "/admin/messages?status=unread", description: "ข้อความที่ทีมยังไม่ได้เปิดอ่าน" });
  if (scheduledStories !== undefined) summaryMetrics.push({ id: "scheduled-stories", label: "นัดเผยแพร่ 7 วัน", value: scheduledStories, href: "/admin/stories?status=scheduled", description: "เรื่องที่มีกำหนดเผยแพร่ใน 7 วันข้างหน้า" });

  const todayMetrics: AdminOperationMetric[] = [];
  if (todayVisits !== undefined) todayMetrics.push({ id: "visits-today", label: "การเข้าชมวันนี้", value: todayVisits, href: "/admin/visits", description: "รายการเช็กอินที่เริ่มวันนี้ตามเวลาไทย" });
  if (todayCertificates !== undefined) todayMetrics.push({ id: "certificates-today", label: "ใบประกาศวันนี้", value: todayCertificates, href: "/admin/visits?status=certificate_generated", description: "ใบประกาศดิจิทัลที่สร้างสำเร็จ" });
  if (todaySurveys !== undefined) todayMetrics.push({ id: "surveys-today", label: "แบบสำรวจวันนี้", value: todaySurveys, href: "/admin/surveys", description: "แบบสำรวจที่ส่งสำเร็จวันนี้" });

  const contentReadiness: AdminContentReadiness[] = [];
  const addReadiness = (
    value: ContentReadinessCount | null | undefined,
    item: Omit<AdminContentReadiness, "total" | "ready">,
  ) => {
    if (value === undefined) return;
    contentReadiness.push({
      ...item,
      total: value?.total ?? null,
      ready: value?.ready ?? null,
    });
  };
  addReadiness(attractionReadiness, { id: "attractions", label: "สถานที่ท่องเที่ยว", description: "เผยแพร่และเปิดใช้งาน", href: "/admin/attractions" });
  addReadiness(storyReadiness, { id: "stories", label: "เรื่องราว", description: "อยู่ในสถานะเผยแพร่", href: "/admin/stories" });
  addReadiness(routeReadiness, { id: "routes", label: "เส้นทางแนะนำ", description: "เผยแพร่และเปิดใช้งาน", href: "/admin/routes" });
  addReadiness(mediaReadiness, { id: "media", label: "สื่อพร้อมใช้งาน", description: "มีคำอธิบายภาษาไทย", href: "/admin/media" });

  const recentActivity: AdminRecentActivity[] = Array.isArray(recentAudit)
    ? recentAudit.map((activity) => ({
        id: activity.id,
        actionLabel: actionLabel(activity.action),
        entityLabel: entityLabel(activity.entityType),
        actorName: activity.actorName,
        createdAt: activity.createdAt,
        href: "/admin/audit",
      }))
    : [];

  const quickActions: AdminQuickAction[] = [];
  if (can(actor, "attraction.create")) quickActions.push({ id: "new-attraction", label: "เพิ่มสถานที่", description: "สร้างข้อมูลสถานที่ในยะลา", href: "/admin/attractions/new", icon: "attraction" });
  if (can(actor, "story.create")) quickActions.push({ id: "new-story", label: "เขียนเรื่องใหม่", description: "สร้างบทความหรือเรื่องเล่าจากทีม", href: "/admin/stories/new", icon: "story" });
  if (can(actor, "checkin_code.create")) quickActions.push({ id: "new-checkin", label: "สร้าง QR เช็กอิน", description: "ผูก QR กับสถานที่หรือจุดถ่ายภาพ", href: "/admin/checkin-codes/new", icon: "checkin" });
  if (can(actor, "media.upload")) quickActions.push({ id: "upload-media", label: "เพิ่มสื่อ", description: "อัปโหลดและใส่ข้อมูลรูปภาพ", href: "/admin/media", icon: "media" });
  if (can(actor, "route.create")) quickActions.push({ id: "new-route", label: "สร้างเส้นทาง", description: "จัดลำดับจุดแวะใหม่", href: "/admin/routes/new", icon: "route" });

  return {
    generatedAt: now.toISOString(),
    actionRequiredCount,
    unavailableCount,
    summaryMetrics,
    todayMetrics,
    priorityQueue,
    contentReadiness,
    recentActivity,
    quickActions,
    modules: visibleModules(actor),
  };
}
