import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  Eye,
  FileCheck2,
  Gauge,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

/* =========================================================
   TYPES
========================================================= */

type ApplicationStatus =
  | "New"
  | "Under Review"
  | "Inspection Scheduled"
  | "Approved"
  | "Rejected"
  | "Completed";

type AppointmentStatus =
  | "Scheduled"
  | "Completed"
  | "Cancelled";

interface ApplicationItem {
  id: string;
  applicant: string;
  instrument: string;
  instrumentId: string;
  location: string;
  date: string;
  status: ApplicationStatus;
}

interface AppointmentItem {
  id: string;
  applicationId: string;
  merchant: string;
  instrument: string;
  instrumentId: string;
  date: string;
  time: string;
  location: string;
  status: AppointmentStatus;
}



/* =========================================================
   HELPERS
========================================================= */

function formatDate(
  value: string
): string {
  if (!value) {
    return "N/A";
  }

  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return value;
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function normalizeApplicationStatus(
  value?: string
): ApplicationStatus {
  switch (value) {
    case "New":
      return "New";

    case "Under Review":
      return "Under Review";

    case "Inspection Scheduled":
      return "Inspection Scheduled";

    case "Approved":
      return "Approved";

    case "Rejected":
      return "Rejected";

    case "Completed":
      return "Completed";

    case "Pending":
      return "Under Review";

    case "Scheduled":
      return "Inspection Scheduled";

    default:
      return "Under Review";
  }
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function InspectorDashboard() {
  const navigate =
    useNavigate();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    applications,
    setApplications,
  ] =
    useState<ApplicationItem[]>([]);

  const [
    appointments,
    setAppointments,
  ] =
    useState<AppointmentItem[]>([]);

  const [
    currentDate,
    setCurrentDate,
  ] = useState("");

  const [profile, setProfile] =
    useState<{
      name: string;
      employeeId: string;
      region: string;
      status: string;
    }>({
      name: "Inspector",
      employeeId: "",
      region: "",
      status: "Available",
    });

  /* =======================================================
     CURRENT DATE
  ======================================================= */

  useEffect(() => {
    const today =
      new Date();

    setCurrentDate(
      today.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          weekday: "long",
        }
      )
    );
  }, []);

  /* =======================================================
     LOAD ASSIGNED APPLICATIONS FROM POSTGRESQL
  ======================================================= */

  useEffect(() => {
    const loadInspectorDashboard = async () => {
      try {
        const token =
          localStorage.getItem("almveToken");

        if (!token) {
          console.error(
            "Inspector authentication token not found."
          );
          return;
        }

        const response = await fetch(
          "https://maapsetu-w1sf.onrender.com/api/inspector/applications",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data: unknown =
          await response.json();

        if (!response.ok) {
          const message =
            data &&
            typeof data === "object" &&
            "message" in data &&
            typeof (
              data as {
                message?: unknown;
              }
            ).message === "string"
              ? (
                  data as {
                    message: string;
                  }
                ).message
              : "Unable to load inspector dashboard.";

          throw new Error(message);
        }

        if (
          !data ||
          typeof data !== "object"
        ) {
          throw new Error(
            "Invalid inspector dashboard response."
          );
        }

        const payload =
          data as {
            profile?: {
              name?: string;
              employeeId?: string;
              region?: string;
              status?: string;
            };
            applications?: unknown;
          };

        setProfile({
          name:
            payload.profile?.name ||
            "Inspector",
          employeeId:
            payload.profile?.employeeId ||
            "",
          region:
            payload.profile?.region ||
            "",
          status:
            payload.profile?.status ||
            "Available",
        });

        const rows =
          Array.isArray(
            payload.applications
          )
            ? payload.applications
            : [];

        const normalizedApplications =
          rows.map((item) => {
            const value =
              item as {
                id?: unknown;
                applicationId?: unknown;
                applicant?: unknown;
                merchant?: unknown;
                instrument?: unknown;
                instrumentType?: unknown;
                instrumentId?: unknown;
                location?: unknown;
                submittedDate?: unknown;
                submissionDate?: unknown;
                appointmentDate?: unknown;
                status?: unknown;
              };

            return {
              id:
                typeof value.applicationId ===
                "string"
                  ? value.applicationId
                  : typeof value.id === "string"
                  ? value.id
                  : String(
                      value.id ?? "N/A"
                    ),

              applicant:
                typeof value.merchant ===
                "string"
                  ? value.merchant
                  : typeof value.applicant ===
                    "string"
                  ? value.applicant
                  : "Merchant",

              instrument:
                typeof value.instrumentType ===
                "string"
                  ? value.instrumentType
                  : typeof value.instrument ===
                    "string"
                  ? value.instrument
                  : "Measuring Instrument",

              instrumentId:
                typeof value.instrumentId ===
                "string"
                  ? value.instrumentId
                  : String(
                      value.instrumentId ??
                        "N/A"
                    ),

              location:
                typeof value.location ===
                "string"
                  ? value.location
                  : "Not Provided",

              date:
                formatDate(
                  typeof value.appointmentDate ===
                    "string"
                    ? value.appointmentDate
                    : typeof value.submissionDate ===
                      "string"
                    ? value.submissionDate
                    : typeof value.submittedDate ===
                      "string"
                    ? value.submittedDate
                    : ""
                ),

              status:
                normalizeApplicationStatus(
                  typeof value.status ===
                    "string"
                    ? value.status
                    : undefined
                ),
            } satisfies ApplicationItem;
          });

        setApplications(
          normalizedApplications
        );

        const normalizedAppointments =
          rows
            .filter((item) => {
              const value =
                item as {
                  appointmentDate?: unknown;
                };

              return Boolean(
                value.appointmentDate
              );
            })
            .map((item, index) => {
              const value =
                item as {
                  id?: unknown;
                  applicationId?: unknown;
                  applicant?: unknown;
                  merchant?: unknown;
                  instrument?: unknown;
                  instrumentType?: unknown;
                  instrumentId?: unknown;
                  appointmentDate?: unknown;
                  appointmentTime?: unknown;
                  location?: unknown;
                  status?: unknown;
                };

              const appointmentStatus =
                value.status === "Completed"
                  ? "Completed"
                  : "Scheduled";

              return {
                id:
                  typeof value.id ===
                  "string"
                    ? `APT-${value.id}`
                    : `APT-${String(
                        index + 1
                      ).padStart(3, "0")}`,

                applicationId:
                  typeof value.applicationId ===
                  "string"
                    ? value.applicationId
                    : "N/A",

                merchant:
                  typeof value.merchant ===
                  "string"
                    ? value.merchant
                    : typeof value.applicant ===
                      "string"
                    ? value.applicant
                    : "Merchant",

                instrument:
                  typeof value.instrumentType ===
                  "string"
                    ? value.instrumentType
                    : typeof value.instrument ===
                      "string"
                    ? value.instrument
                    : "Measuring Instrument",

                instrumentId:
                  typeof value.instrumentId ===
                  "string"
                    ? value.instrumentId
                    : String(
                        value.instrumentId ??
                          "N/A"
                      ),

                date:
                  formatDate(
                    typeof value.appointmentDate ===
                      "string"
                      ? value.appointmentDate
                      : ""
                  ),

                time:
                  typeof value.appointmentTime ===
                  "string"
                    ? value.appointmentTime
                    : "Time not set",

                location:
                  typeof value.location ===
                  "string"
                    ? value.location
                    : "Not Provided",

                status:
                  appointmentStatus,
              } satisfies AppointmentItem;
            });

        setAppointments(
          normalizedAppointments
        );
      } catch (error) {
        console.error(
          "Unable to load inspector dashboard:",
          error
        );

        setApplications([]);
        setAppointments([]);
      }
    };

    loadInspectorDashboard();
  }, []);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goTo = (
    path: string
  ) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const logout = () => {
    localStorage.removeItem(
      "almveRole"
    );

    localStorage.removeItem(
      "almveEmail"
    );

    navigate("/");
  };

  const openApplication = (
    id: string
  ) => {
    goTo(
      `/inspector/applications/${id}`
    );
  };

  /* =======================================================
     APPLICATION STATISTICS
  ======================================================= */

  const applicationCounts =
    useMemo(() => {
      const counts = {
        newApplications: 0,
        underReview: 0,
        scheduled: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
      };

      applications.forEach(
        (application) => {
          switch (
            application.status
          ) {
            case "New":
              counts.newApplications +=
                1;
              break;

            case "Under Review":
              counts.underReview += 1;
              break;

            case "Inspection Scheduled":
              counts.scheduled += 1;
              break;

            case "Approved":
              counts.approved += 1;
              break;

            case "Rejected":
              counts.rejected += 1;
              break;

            case "Completed":
              counts.completed += 1;
              break;
          }
        }
      );

      return counts;
    }, [applications]);

  const totalApplications =
    applications.length;

  const pendingVerification =
    applicationCounts.underReview +
    applicationCounts.scheduled;

  const todayInspections =
    appointments.filter(
      (item) =>
        item.status ===
        "Scheduled"
    ).length;

  const completedVerifications =
    applications.filter(
      (application) =>
        application.status ===
        "Completed"
    ).length;

  const failedVerifications =
    applicationCounts.rejected;

  const chartTotal =
    totalApplications || 1;

  const newPercent =
    Math.round(
      (applicationCounts.newApplications /
        chartTotal) *
        100
    );

  const reviewPercent =
    Math.round(
      (applicationCounts.underReview /
        chartTotal) *
        100
    );

  const scheduledPercent =
    Math.round(
      (applicationCounts.scheduled /
        chartTotal) *
        100
    );

  const approvedPercent =
    Math.round(
      (applicationCounts.approved /
        chartTotal) *
        100
    );

  const rejectedPercent =
    Math.max(
      0,
      100 -
        newPercent -
        reviewPercent -
        scheduledPercent -
        approvedPercent
    );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="fixed inset-x-0 top-0 z-50 h-[76px] border-b border-slate-200 bg-white">

        <div className="flex h-full items-center justify-between px-4 md:px-6">

          {/* LEFT */}

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(
                  (value) => !value
                )
              }
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle sidebar"
            >

              {sidebarOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}

            </button>

            {/* LOGO */}

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">

                <ScaleLogo />

              </div>

              <div className="hidden sm:block">

                <h1 className="text-xl font-bold tracking-wide text-emerald-700">
                  ALMVE
                </h1>

                <p className="text-[11px] text-slate-500">
                  Legal Metrology Verification System
                </p>

              </div>

            </div>

          </div>

          {/* CENTER */}

          <div className="hidden lg:block">

            <h2 className="text-xl font-bold text-slate-900">
              Inspector Dashboard
            </h2>

            <p className="text-xs text-slate-500">
              Monitor inspections, applications and verification activities
            </p>

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2 md:gap-3">

            <button
              type="button"
              className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:block"
              aria-label="Search"
            >

              <Search size={20} />

            </button>

            <button
              type="button"
              onClick={() =>
                goTo(
                  "/inspector/notifications"
                )
              }
              className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
              aria-label="Notifications"
            >

              <Bell size={22} />

              <span className="absolute right-0.5 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                5
              </span>

            </button>

            <div className="hidden items-center gap-2 md:flex">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">

                <User size={20} />

              </div>

              <div>

                <p className="text-sm font-semibold text-slate-900">
                  {profile.name}
                </p>

                <p className="text-xs text-slate-500">
                  {profile.employeeId
                      ? `Inspector ID: ${profile.employeeId}`
                      : "Inspector ID unavailable"}
                </p>

              </div>

              <ChevronDown
                size={16}
                className="text-slate-400"
              />

            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Logout"
            >

              <LogOut size={20} />

            </button>

          </div>

        </div>

      </header>

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside
        className={`fixed bottom-0 left-0 top-[76px] z-40 w-[250px] border-r border-slate-200 bg-white transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >

        <div className="flex h-full flex-col overflow-y-auto p-4">

          <nav className="space-y-1">

            <SidebarItem
              icon={
                <LayoutDashboard
                  size={19}
                />
              }
              label="Dashboard"
              active
              onClick={() =>
                goTo(
                  "/inspector/dashboard"
                )
              }
            />

            {/* APPLICATIONS */}

            <SidebarGroup title="Applications">

              <SidebarItem
                icon={
                  <ClipboardList
                    size={18}
                  />
                }
                label="New Applications"
                badge={
                  applicationCounts.newApplications
                }
                onClick={() =>
                  goTo(
                    "/inspector/applications"
                  )
                }
              />

              <SidebarItem
                icon={
                  <FileCheck2
                    size={18}
                  />
                }
                label="Assigned to Me"
                badge={
                  totalApplications
                }
                onClick={() =>
                  goTo(
                    "/inspector/applications"
                  )
                }
              />

              <SidebarItem
                icon={
                  <Search size={18} />
                }
                label="Under Review"
                onClick={() =>
                  goTo(
                    "/inspector/applications"
                  )
                }
              />

              <SidebarItem
                icon={
                  <ClipboardList
                    size={18}
                  />
                }
                label="All Applications"
                onClick={() =>
                  goTo(
                    "/inspector/applications"
                  )
                }
              />

            </SidebarGroup>

            {/* APPOINTMENTS */}

            <SidebarGroup title="Appointments">

              <SidebarItem
                icon={
                  <CalendarDays
                    size={18}
                  />
                }
                label="My Appointments"
                onClick={() =>
                  goTo(
                    "/inspector/appointments"
                  )
                }
              />

              <SidebarItem
                icon={
                  <CalendarDays
                    size={18}
                  />
                }
                label="Schedule"
                onClick={() =>
                  goTo(
                    "/inspector/appointments"
                  )
                }
              />

            </SidebarGroup>

            {/* INSPECTIONS */}

            <SidebarGroup title="Inspections">

              <SidebarItem
                icon={
                  <Clock3 size={18} />
                }
                label="Pending Inspections"
                badge={
                  todayInspections
                }
                onClick={() =>
                  goTo(
                    "/inspector/appointments"
                  )
                }
              />

              <SidebarItem
                icon={
                  <CheckCircle2
                    size={18}
                  />
                }
                label="Completed Inspections"
                onClick={() =>
                  goTo(
                    "/inspector/verification-result"
                  )
                }
              />

              <SidebarItem
                icon={
                  <FileCheck2
                    size={18}
                  />
                }
                label="Inspection Reports"
                onClick={() =>
                  goTo(
                    "/inspector/verification-result"
                  )
                }
              />

            </SidebarGroup>

            {/* CERTIFICATES */}

            <SidebarGroup title="Certificates">

              <SidebarItem
                icon={
                  <FileCheck2
                    size={18}
                  />
                }
                label="Issued Certificates"
                onClick={() =>
                  goTo(
                    "/inspector/verification-result"
                  )
                }
              />

              <SidebarItem
                icon={
                  <ShieldCheck
                    size={18}
                  />
                }
                label="Certificate Verification"
                onClick={() =>
                  goTo(
                    "/inspector/verification-result"
                  )
                }
              />

            </SidebarGroup>

            {/* ENFORCEMENT */}

            <SidebarGroup title="Enforcement">

              <SidebarItem
                icon={
                  <ShieldAlert
                    size={18}
                  />
                }
                label="Non Compliance"
                onClick={() =>
                  goTo(
                    "/inspector/verification-result"
                  )
                }
              />

              <SidebarItem
                icon={
                  <ShieldAlert
                    size={18}
                  />
                }
                label="Enforcement Actions"
                onClick={() =>
                  goTo(
                    "/inspector/verification-result"
                  )
                }
              />

            </SidebarGroup>

            {/* OTHER */}

            <div className="pt-3">

              <SidebarItem
                icon={
                  <FileCheck2
                    size={18}
                  />
                }
                label="Reports"
                onClick={() =>
                  goTo(
                    "/inspector/verification-result"
                  )
                }
              />

              <SidebarItem
                icon={
                  <Bell size={18} />
                }
                label="Notifications"
                badge={3}
                onClick={() =>
                  goTo(
                    "/inspector/notifications"
                  )
                }
              />

              <SidebarItem
                icon={
                  <User size={18} />
                }
                label="Profile"
                onClick={() =>
                  goTo(
                    "/inspector/settings"
                  )
                }
              />

              <SidebarItem
                icon={
                  <Settings
                    size={18}
                  />
                }
                label="Settings"
                onClick={() =>
                  goTo(
                    "/inspector/settings"
                  )
                }
              />

            </div>

          </nav>

          {/* LOGOUT */}

          <div className="mt-auto border-t border-slate-100 pt-3">

            <SidebarItem
              icon={
                <LogOut size={18} />
              }
              label="Logout"
              danger
              onClick={logout}
            />

          </div>

        </div>

      </aside>

      {/* ==================================================
          MOBILE OVERLAY
      ================================================== */}

      {sidebarOpen && (

        <button
          type="button"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-30 bg-slate-950/20 lg:hidden"
          aria-label="Close sidebar"
        />

      )}

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="min-h-screen pt-[76px] lg:pl-[250px]">

        <div className="p-4 md:p-6 lg:p-7">

          {/* =================================================
              WELCOME PANEL
          ================================================= */}

          <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col md:flex-row">

              <div className="flex-1 p-6 md:p-7">

                <div className="mb-3 flex items-center gap-2">

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    Inspector Portal
                  </span>

                </div>

                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  Welcome back, {profile.name}! 👋
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                  Here's an overview of your verification
                  activities and assignments.
                </p>

              </div>

              <div className="flex min-h-[165px] items-center justify-between bg-slate-50 px-6 py-6 md:w-[370px]">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Today's Date
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {currentDate ||
                      "01 Sep 2026"}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700">

                    <CheckCircle2
                      size={16}
                    />

                    System operational

                  </div>

                </div>

                <VerificationIllustration />

              </div>

            </div>

          </section>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

            <MetricCard
              title="Assigned Applications"
              value={String(
                totalApplications
              )}
              icon={
                <ClipboardList
                  size={23}
                />
              }
              iconClass="bg-blue-50 text-blue-600"
              onClick={() =>
                goTo(
                  "/inspector/applications"
                )
              }
            />

            <MetricCard
              title="Pending Verification"
              value={String(
                pendingVerification
              )}
              icon={
                <Clock3 size={23} />
              }
              iconClass="bg-orange-50 text-orange-600"
              onClick={() =>
                goTo(
                  "/inspector/applications"
                )
              }
            />

            <MetricCard
              title="Today's Inspections"
              value={String(
                todayInspections
              )}
              icon={
                <CalendarDays
                  size={23}
                />
              }
              iconClass="bg-emerald-50 text-emerald-600"
              onClick={() =>
                goTo(
                  "/inspector/appointments"
                )
              }
            />

            <MetricCard
              title="Verified This Month"
              value={String(
                completedVerifications
              )}
              icon={
                <ShieldCheck
                  size={23}
                />
              }
              iconClass="bg-purple-50 text-purple-600"
              onClick={() =>
                goTo(
                  "/inspector/verification-result"
                )
              }
            />

            <MetricCard
              title="Failed Inspections"
              value={String(
                failedVerifications
              )}
              icon={
                <ShieldAlert
                  size={23}
                />
              }
              iconClass="bg-red-50 text-red-600"
              onClick={() =>
                goTo(
                  "/inspector/verification-result"
                )
              }
            />

          </div>

          {/* =================================================
              MIDDLE
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

            {/* APPLICATION STATUS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Application Status
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Current application distribution
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/inspector/applications"
                    )
                  }
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  View all →
                </button>

              </div>

              <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">

                {/* DONUT */}

                <div className="relative h-48 w-48 shrink-0">

                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        `conic-gradient(
                          #3b82f6 0% ${newPercent}%,
                          #f59e0b ${newPercent}% ${newPercent + reviewPercent}%,
                          #22c55e ${newPercent + reviewPercent}% ${newPercent + reviewPercent + scheduledPercent}%,
                          #8b5cf6 ${newPercent + reviewPercent + scheduledPercent}% ${newPercent + reviewPercent + scheduledPercent + approvedPercent}%,
                          #ef4444 ${newPercent + reviewPercent + scheduledPercent + approvedPercent}% 100%
                        )`,
                    }}
                  />

                  <div className="absolute inset-[25px] flex flex-col items-center justify-center rounded-full bg-white">

                    <span className="text-3xl font-bold text-slate-900">
                      {totalApplications}
                    </span>

                    <span className="text-xs font-medium text-slate-500">
                      Total
                    </span>

                  </div>

                </div>

                {/* LEGEND */}

                <div className="w-full max-w-xs space-y-3">

                  <LegendRow
                    label="New"
                    value={
                      applicationCounts.newApplications
                    }
                    percent={
                      newPercent
                    }
                    dotClass="bg-blue-500"
                  />

                  <LegendRow
                    label="Under Review"
                    value={
                      applicationCounts.underReview
                    }
                    percent={
                      reviewPercent
                    }
                    dotClass="bg-orange-500"
                  />

                  <LegendRow
                    label="Inspection Scheduled"
                    value={
                      applicationCounts.scheduled
                    }
                    percent={
                      scheduledPercent
                    }
                    dotClass="bg-emerald-500"
                  />

                  <LegendRow
                    label="Approved"
                    value={
                      applicationCounts.approved
                    }
                    percent={
                      approvedPercent
                    }
                    dotClass="bg-purple-500"
                  />

                  <LegendRow
                    label="Rejected"
                    value={
                      applicationCounts.rejected
                    }
                    percent={
                      rejectedPercent
                    }
                    dotClass="bg-red-500"
                  />

                </div>

              </div>

            </section>

            {/* TODAY'S SCHEDULE */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Today's Inspection Schedule
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Scheduled field verification visits
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/inspector/appointments"
                    )
                  }
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  View full schedule →
                </button>

              </div>

              <div className="divide-y divide-slate-100">

                {appointments
                  .slice(0, 5)
                  .map(
                    (
                      appointment
                    ) => (

                      <ScheduleRow
                        key={
                          appointment.id
                        }
                        appointment={
                          appointment
                        }
                        onClick={() =>
                          openApplication(
                            appointment.applicationId
                          )
                        }
                      />

                    )
                  )}

              </div>

            </section>

          </div>

          {/* =================================================
              BOTTOM
          ================================================= */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

            {/* RECENT APPLICATIONS */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

              <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Recent Applications Assigned
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Applications requiring inspector action.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/inspector/applications"
                    )
                  }
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  View all →
                </button>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[780px] text-left">

                  <thead className="bg-slate-50">

                    <tr>

                      <TableHead>
                        Application ID
                      </TableHead>

                      <TableHead>
                        Applicant
                      </TableHead>

                      <TableHead>
                        Instrument
                      </TableHead>

                      <TableHead>
                        Date
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead>
                        Action
                      </TableHead>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {applications
                      .slice(0, 5)
                      .map(
                        (
                          application
                        ) => (

                          <tr
                            key={
                              application.id
                            }
                            className="transition hover:bg-slate-50"
                          >

                            <td className="px-5 py-4">

                              <button
                                type="button"
                                onClick={() =>
                                  openApplication(
                                    application.id
                                  )
                                }
                                className="text-sm font-bold text-blue-600 hover:underline"
                              >

                                {
                                  application.id
                                }

                              </button>

                            </td>

                            <td className="px-5 py-4 text-sm font-semibold text-slate-700">

                              {
                                application.applicant
                              }

                            </td>

                            <td className="px-5 py-4">

                              <p className="text-sm font-medium text-slate-700">

                                {
                                  application.instrument
                                }

                              </p>

                              <p className="mt-1 text-xs text-slate-400">

                                {
                                  application.instrumentId
                                }

                              </p>

                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">

                              {
                                application.date
                              }

                            </td>

                            <td className="px-5 py-4">

                              <ApplicationStatusBadge
                                status={
                                  application.status
                                }
                              />

                            </td>

                            <td className="px-5 py-4">

                              <button
                                type="button"
                                onClick={() =>
                                  openApplication(
                                    application.id
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                              >

                                <Eye
                                  size={14}
                                />

                                {application.status ===
                                "Approved"
                                  ? "View"
                                  : "Review"}

                              </button>

                            </td>

                          </tr>

                        )
                      )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* QUICK ACTIONS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5">

                <h2 className="text-lg font-bold text-slate-900">
                  Quick Actions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Frequently used inspection tools
                </p>

              </div>

              <div className="space-y-3">

                <QuickAction
                  title="View New Applications"
                  description="Review newly submitted applications"
                  icon={
                    <ClipboardList
                      size={20}
                    />
                  }
                  iconClass="bg-blue-50 text-blue-600"
                  onClick={() =>
                    goTo(
                      "/inspector/applications"
                    )
                  }
                />

                <QuickAction
                  title="Schedule Inspection"
                  description="Schedule a new inspection appointment"
                  icon={
                    <CalendarDays
                      size={20}
                    />
                  }
                  iconClass="bg-emerald-50 text-emerald-600"
                  onClick={() =>
                    goTo(
                      "/inspector/appointments"
                    )
                  }
                />

                <QuickAction
                  title="Create Inspection Report"
                  description="Generate report after inspection"
                  icon={
                    <FileCheck2
                      size={20}
                    />
                  }
                  iconClass="bg-orange-50 text-orange-600"
                  onClick={() =>
                    goTo(
                      "/inspector/verification-result"
                    )
                  }
                />

                <QuickAction
                  title="Evaluate MPE"
                  description="Perform measurement rule evaluation"
                  icon={
                    <Gauge size={20} />
                  }
                  iconClass="bg-purple-50 text-purple-600"
                  onClick={() =>
                    goTo(
                      "/inspector/mpe-evaluation"
                    )
                  }
                />

                <QuickAction
                  title="Record Non Compliance"
                  description="Report non-compliance or violation"
                  icon={
                    <ShieldAlert
                      size={20}
                    />
                  }
                  iconClass="bg-red-50 text-red-600"
                  onClick={() =>
                    goTo(
                      "/inspector/verification-result"
                    )
                  }
                />

              </div>

            </section>

          </div>

          {/* FOOTER */}

          <footer className="pt-7 text-center">

            <p className="text-xs text-slate-400">
              © 2026 ALMVE - Automated Legal
              Metrology Verification Engine.
              All rights reserved.
            </p>

          </footer>

        </div>

      </main>

    </div>
  );
}

/* =========================================================
   SIDEBAR GROUP
========================================================= */

function SidebarGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="pt-3">

      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <div className="space-y-1">
        {children}
      </div>

    </div>
  );
}

/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon,
  label,
  active = false,
  badge,
  danger = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >

      <span
        className={
          active
            ? "text-emerald-700"
            : danger
            ? "text-red-600"
            : "text-slate-500 group-hover:text-slate-700"
        }
      >
        {icon}
      </span>

      <span className="flex-1">
        {label}
      </span>

      {typeof badge ===
        "number" &&
        badge > 0 && (

          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              active
                ? "bg-emerald-600 text-white"
                : "bg-red-100 text-red-600"
            }`}
          >
            {badge}
          </span>

        )}

      {!danger && (
        <ChevronRight
          size={14}
          className={
            active
              ? "text-emerald-500"
              : "text-slate-300"
          }
        />
      )}

    </button>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  title,
  value,
  icon,
  iconClass,
  onClick,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  iconClass: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >

      <div className="flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <ChevronRight
          size={17}
          className="text-slate-300"
        />

      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </p>

    </button>
  );
}

/* =========================================================
   LEGEND ROW
========================================================= */

function LegendRow({
  label,
  value,
  percent,
  dotClass,
}: {
  label: string;
  value: number;
  percent: number;
  dotClass: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <span
        className={`h-3 w-3 shrink-0 rounded-full ${dotClass}`}
      />

      <span className="min-w-0 flex-1 text-sm text-slate-600">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-700">
        {value}
      </span>

      <span className="w-12 text-right text-xs text-slate-400">
        {percent}%
      </span>

    </div>
  );
}

/* =========================================================
   SCHEDULE ROW
========================================================= */

function ScheduleRow({
  appointment,
  onClick,
}: {
  appointment: AppointmentItem;
  onClick: () => void;
}) {
  const timeParts =
    appointment.time.split(
      " "
    );

  const time =
    timeParts[0] ||
    appointment.time;

  const period =
    timeParts[1] || "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-1 py-3.5 text-left transition hover:bg-slate-50 sm:gap-4"
    >

      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-50 px-2 py-2">

        <span className="text-sm font-bold text-emerald-700">
          {time}
        </span>

        <span className="text-[9px] font-bold uppercase text-emerald-600">
          {period}
        </span>

      </div>

      <div className="min-w-0 flex-1">

        <p className="truncate text-sm font-bold text-slate-800">
          {appointment.merchant}
        </p>

        <p className="mt-1 truncate text-xs text-slate-500">
          {appointment.instrument}
        </p>

      </div>

      <div className="hidden min-w-[125px] text-xs text-slate-400 md:block">

        {appointment.applicationId}

      </div>

      <span className="hidden rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 sm:inline-flex">
        Scheduled
      </span>

      <div className="hidden items-center gap-1 text-xs text-slate-400 lg:flex">

        <MapPin size={13} />

        <span className="max-w-[100px] truncate">
          {appointment.location}
        </span>

      </div>

    </button>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  title,
  description,
  icon,
  iconClass,
  onClick,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  iconClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 text-left transition hover:border-slate-200 hover:bg-slate-50"
    >

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="truncate text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-400">
          {description}
        </p>

      </div>

      <ChevronRight
        size={17}
        className="shrink-0 text-slate-300 group-hover:text-slate-500"
      />

    </button>
  );
}

/* =========================================================
   APPLICATION STATUS BADGE
========================================================= */

function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  const styles: Record<
    ApplicationStatus,
    string
  > = {
    New:
      "bg-blue-100 text-blue-700",

    "Under Review":
      "bg-orange-100 text-orange-700",

    "Inspection Scheduled":
      "bg-emerald-100 text-emerald-700",

    Approved:
      "bg-purple-100 text-purple-700",

    Rejected:
      "bg-red-100 text-red-700",

    Completed:
      "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   TABLE HEAD
========================================================= */

function TableHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

/* =========================================================
   VERIFICATION ILLUSTRATION
========================================================= */

function VerificationIllustration() {
  return (
    <div className="hidden items-end gap-2 md:flex">

      {/* SCALE */}

      <div className="relative">

        <div className="h-8 w-20 rounded-t-lg bg-slate-300" />

        <div className="mt-1 flex h-7 w-24 items-center justify-center rounded-lg border border-slate-300 bg-white shadow-sm">

          <span className="h-2 w-8 rounded bg-slate-700" />

        </div>

      </div>

      {/* DOCUMENT */}

      <div className="flex h-24 w-16 flex-col items-center justify-end rounded-xl border border-slate-200 bg-white p-2 shadow-sm">

        <FileCheck2
          size={32}
          className="text-blue-500"
        />

        <span className="mt-1 text-[7px] font-bold text-slate-500">
          VERIFY
        </span>

      </div>

      {/* CHECK */}

      <div className="relative flex h-24 w-16 items-center justify-center">

        <div className="flex h-14 w-14 items-center justify-center rounded-full border-[5px] border-emerald-500 bg-white shadow-sm">

          <CheckCircle2
            size={28}
            className="text-emerald-600"
          />

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   SCALE LOGO
========================================================= */

function ScaleLogo() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path d="M12 3v18" />

      <path d="M5 6h14" />

      <path d="M5 6l-3 6a3 3 0 0 0 6 0L5 6Z" />

      <path d="M19 6l-3 6a3 3 0 0 0 6 0l-3-6Z" />

      <path d="M8 21h8" />

    </svg>
  );
}

export default InspectorDashboard;