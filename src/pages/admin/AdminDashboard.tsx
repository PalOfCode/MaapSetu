import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileCheck2,
  FileText,
  Gauge,
  LogOut,
  Menu,
  Scale,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/* =========================================
   TYPES
========================================= */

type ApplicationStatus =
  | "Pending"
  | "Scheduled"
  | "Approved"
  | "Rejected"
  | "Completed";

interface Application {
  id: string;
  applicant: string;
  instrument: string;
  type: string;
  submitted: string;
  inspector: string;
  status: ApplicationStatus;
}

interface Certificate {
  certificateId: string;
  certificateNumber?: string;
  applicationId?: string;
  instrumentId: string;
  businessId: string;
  issueDate: string;
  validUntil: string;
  status: string;
  instrumentType: string;
}

interface VerificationRecord {
  verificationId: string;
  applicationId: string;
  instrumentId: string;
  officerId: string;
  verificationDate: string;
  result: "PASS" | "FAIL" | "PENDING";
  location: string;
}

interface EnforcementRecord {
  enforcementId: string;
  verificationId: string;
  applicationId: string;
  instrumentId: string;
  officerId?: string;
  status: string;
}


/* =========================================
   COMPONENT
========================================= */

function AdminDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [certificates, setCertificates] =
    useState<Certificate[]>([]);

  const [verifications, setVerifications] =
    useState<VerificationRecord[]>([]);

  const [enforcements, setEnforcements] =
    useState<EnforcementRecord[]>([]);

  const [instrumentCount, setInstrumentCount] =
    useState(25480);

  /* =========================================
     LOAD DASHBOARD DATA FROM POSTGRESQL
  ========================================= */

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token =
          localStorage.getItem("almveToken");

        if (!token) {
          console.error(
            "Admin authentication token not found."
          );
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/admin/dashboard",
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
              : "Unable to load admin dashboard.";

          throw new Error(message);
        }

        if (
          !data ||
          typeof data !== "object"
        ) {
          throw new Error(
            "Invalid dashboard response."
          );
        }

        const dashboard =
          data as {
            applications?: unknown;
            certificates?: unknown;
            verifications?: unknown;
            enforcements?: unknown;
            instrumentCount?: unknown;
            inspectorCount?: unknown;
          };

        const applicationRows =
          Array.isArray(
            dashboard.applications
          )
            ? dashboard.applications
            : [];

        const normalizedApplications =
          applicationRows.map((item) => {
            const value =
              item as {
                id?: unknown;
                application_number?: unknown;
                applicationId?: unknown;
                applicant?: unknown;
                business_name?: unknown;
                instrument?: unknown;
                instrument_code?: unknown;
                type?: unknown;
                instrument_type?: unknown;
                submitted?: unknown;
                submitted_at?: unknown;
                inspector?: unknown;
                inspector_name?: unknown;
                status?: unknown;
              };

            return {
              id:
                typeof value.application_number ===
                "string"
                  ? value.application_number
                  : typeof value.applicationId ===
                    "string"
                  ? value.applicationId
                  : typeof value.id === "number" ||
                    typeof value.id === "string"
                  ? String(value.id)
                  : `APP-${Date.now()}`,

              applicant:
                typeof value.business_name ===
                "string"
                  ? value.business_name
                  : typeof value.applicant ===
                    "string"
                  ? value.applicant
                  : "Unknown Merchant",

              instrument:
                typeof value.instrument_code ===
                "string"
                  ? value.instrument_code
                  : "N/A",

              type:
                typeof value.instrument_type ===
                "string"
                  ? value.instrument_type
                  : typeof value.type ===
                    "string"
                  ? value.type
                  : "Instrument",

              submitted:
                typeof value.submitted_at ===
                "string"
                  ? new Date(
                      value.submitted_at
                    ).toLocaleDateString(
                      "en-IN"
                    )
                  : typeof value.submitted ===
                    "string"
                  ? value.submitted
                  : "N/A",

              inspector:
                typeof value.inspector_name ===
                "string"
                  ? value.inspector_name
                  : typeof value.inspector ===
                    "string"
                  ? value.inspector
                  : "Not Assigned",

              status:
                normalizeApplicationStatus(
                  typeof value.status ===
                    "string"
                    ? value.status
                    : undefined
                ),
            };
          });

        setApplications(
          normalizedApplications
        );

        const certificateRows =
          Array.isArray(
            dashboard.certificates
          )
            ? dashboard.certificates
            : [];

        setCertificates(
          certificateRows as Certificate[]
        );

        const verificationRows =
          Array.isArray(
            dashboard.verifications
          )
            ? dashboard.verifications
            : [];

        setVerifications(
          verificationRows as VerificationRecord[]
        );

        const enforcementRows =
          Array.isArray(
            dashboard.enforcements
          )
            ? dashboard.enforcements
            : [];

        setEnforcements(
          enforcementRows as EnforcementRecord[]
        );

        if (
          typeof dashboard.instrumentCount ===
          "number"
        ) {
          setInstrumentCount(
            dashboard.instrumentCount
          );
        } else {
          setInstrumentCount(0);
        }
      } catch (error) {
        console.error(
          "Unable to load admin dashboard:",
          error
        );

        setApplications([]);
        setCertificates([]);
        setVerifications([]);
        setEnforcements([]);
        setInstrumentCount(0);
      }
    };

    loadDashboard();
  }, []);

  /* =========================================
     NAVIGATION
  ========================================= */

  const goTo = (
    path: string
  ) => {
    setSidebarOpen(false);
    setProfileOpen(false);
    navigate(path);
  };

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {
    localStorage.removeItem(
      "almveRole"
    );

    localStorage.removeItem(
      "almveEmail"
    );

    navigate("/login");
  };

  /* =========================================
     APPLICATION STATS
  ========================================= */

  const applicationStats =
    useMemo(() => {
      return {
        total:
          applications.length,

        pending:
          applications.filter(
            (item) =>
              item.status ===
              "Pending"
          ).length,

        scheduled:
          applications.filter(
            (item) =>
              item.status ===
              "Scheduled"
          ).length,

        approved:
          applications.filter(
            (item) =>
              item.status ===
              "Approved"
          ).length,

        rejected:
          applications.filter(
            (item) =>
              item.status ===
              "Rejected"
          ).length,
      };
    }, [applications]);

  /* =========================================
     CERTIFICATE STATS
  ========================================= */

  const certificateStats =
    useMemo(() => {
      const valid =
        certificates.filter(
          (item) =>
            item.status ===
              "Valid" ||
            item.status ===
              "Expiring Soon"
        ).length;

      const expiring =
        certificates.filter(
          (item) =>
            item.status ===
            "Expiring Soon"
        ).length;

      const expired =
        certificates.filter(
          (item) =>
            item.status ===
            "Expired"
        ).length;

      return {
        total:
          certificates.length,
        valid,
        expiring,
        expired,
      };
    }, [certificates]);

  /* =========================================
     VERIFICATION STATS
  ========================================= */

  const verificationStats =
    useMemo(() => {
      return {
        passed:
          verifications.filter(
            (item) =>
              item.result ===
              "PASS"
          ).length,

        failed:
          verifications.filter(
            (item) =>
              item.result ===
              "FAIL"
          ).length,

        pending:
          verifications.filter(
            (item) =>
              item.result ===
              "PENDING"
          ).length,
      };
    }, [verifications]);

  /* =========================================
     INSPECTOR COUNT
  ========================================= */

  const inspectorCount =
    useMemo(() => {
      const names =
        applications
          .map(
            (item) =>
              item.inspector
          )
          .filter(
            (item) =>
              item &&
              item !==
                "Not Assigned"
          );

      return Math.max(
        18,
        new Set(names).size
      );
    }, [applications]);

  /* =========================================
     DONUT DATA
  ========================================= */

  const donutData =
    useMemo(() => {
      const submitted =
        applicationStats.pending;

      const underReview =
        applicationStats.scheduled;

      const approved =
        applicationStats.approved;

      const rejected =
        applicationStats.rejected;

      const total =
        submitted +
        underReview +
        approved +
        rejected;

      if (total === 0) {
        return {
          submitted: 25,
          underReview: 25,
          approved: 25,
          rejected: 25,
        };
      }

      return {
        submitted: Math.round(
          (submitted /
            total) *
            100
        ),

        underReview: Math.round(
          (underReview /
            total) *
            100
        ),

        approved: Math.round(
          (approved /
            total) *
            100
        ),

        rejected: Math.max(
          0,
          100 -
            Math.round(
              (submitted /
                total) *
                100
            ) -
            Math.round(
              (underReview /
                total) *
                100
            ) -
            Math.round(
              (approved /
                total) *
                100
            )
        ),
      };
    }, [applicationStats]);

  /* =========================================
     ALERTS
  ========================================= */

  const alerts = useMemo(() => {
    return [
      {
        type:
          certificateStats.expiring >
          0
            ? "warning"
            : "info",

        text:
          certificateStats.expiring >
          0
            ? `${certificateStats.expiring} certificate(s) expiring soon`
            : "No certificate expiry alert",
      },

      {
        type:
          applicationStats.pending >
          0
            ? "critical"
            : "info",

        text:
          applicationStats.pending >
          0
            ? `${applicationStats.pending} application(s) pending review`
            : "No pending applications",
      },

      {
        type:
          enforcements.length >
          0
            ? "warning"
            : "info",

        text:
          enforcements.length >
          0
            ? `${enforcements.length} enforcement case(s) require attention`
            : "No enforcement cases",
      },

      {
        type: "info",

        text: `${inspectorCount} inspectors currently active`,
      },

      {
        type: "info",

        text: `${certificateStats.total} certificates recorded`,
      },
    ];
  }, [
    certificateStats,
    applicationStats,
    enforcements.length,
    inspectorCount,
  ]);

  return (
    <div className="min-h-screen bg-[#eef4f7] text-slate-900">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 h-[78px] border-b border-slate-200 bg-white">

        <div className="flex h-full items-center justify-between px-4 md:px-6">

          {/* BRAND */}

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(
                  (current) =>
                    !current
                )
              }
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                goTo(
                  "/admin/dashboard"
                )
              }
              className="flex items-center gap-3 text-left"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-xl font-bold text-white">
                ⚖
              </div>

              <div className="hidden sm:block">

                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Government of India
                </p>

                <h1 className="text-sm font-bold text-slate-900 md:text-base">
                  Unified Online Verification & Digital Certification System
                </h1>

              </div>

            </button>

          </div>

          {/* RIGHT */}

          <div className="relative flex items-center gap-3">

            <div className="hidden text-right md:block">

              <p className="text-sm font-semibold text-slate-900">
                Welcome, Admin
              </p>

              <p className="text-xs text-slate-500">
                Dept. of Consumer Affairs
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                goTo(
                  "/admin/notifications"
                )
              }
              className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100"
              aria-label="Notifications"
            >

              <Bell size={21} />

              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />

            </button>

            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (current) =>
                    !current
                )
              }
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">

                <Users size={20} />

              </div>

              <div className="hidden text-left lg:block">

                <p className="text-sm font-semibold text-slate-900">
                  Administrator
                </p>

                <p className="text-xs text-slate-500">
                  System Administrator
                </p>

              </div>

              <ChevronDown
                size={16}
                className="hidden text-slate-400 lg:block"
              />

            </button>

            {profileOpen && (

              <div className="absolute right-0 top-14 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">

                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/admin/settings"
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                >

                  <Settings size={17} />

                  Settings

                </button>

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >

                  <LogOut size={17} />

                  Logout

                </button>

              </div>

            )}

          </div>

        </div>

      </header>

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside
        className={`fixed bottom-0 left-0 top-[78px] z-40 w-[250px] border-r border-slate-200 bg-white transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >

        <div className="flex h-full flex-col p-4">

          <nav className="space-y-1">

            <SidebarItem
              icon={
                <Gauge size={20} />
              }
              label="Dashboard"
              active
              onClick={() =>
                goTo(
                  "/admin/dashboard"
                )
              }
            />

            <SidebarItem
              icon={
                <ClipboardList
                  size={20}
                />
              }
              label="Applications"
              hasArrow
              onClick={() =>
                goTo(
                  "/admin/applications"
                )
              }
            />

            <SidebarItem
              icon={
                <CalendarDays
                  size={20}
                />
              }
              label="Appointments"
              hasArrow
              onClick={() =>
                goTo(
                  "/admin/appointments"
                )
              }
            />

            <SidebarItem
              icon={
                <Scale size={20} />
              }
              label="Instruments"
              hasArrow
              onClick={() =>
                goTo(
                  "/admin/instruments"
                )
              }
            />

            <SidebarItem
              icon={
                <Building2 size={20} />
              }
              label="GATCs & LMOs"
              hasArrow
              onClick={() =>
                goTo(
                  "/admin/gatcs-lmos"
                )
              }
            />

            <SidebarItem
              icon={
                <FileText size={20} />
              }
              label="Reports"
              hasArrow
              onClick={() =>
                goTo(
                  "/admin/reports"
                )
              }
            />

            <SidebarItem
              icon={
                <ShieldCheck
                  size={20}
                />
              }
              label="Inspections & Enforcement"
              hasArrow
              onClick={() =>
                goTo(
                  "/admin/enforcement"
                )
              }
            />

            <SidebarItem
              icon={
                <Users size={20} />
              }
              label="Users & Inspectors"
              hasArrow
              onClick={() =>
                goTo(
                  "/admin/users"
                )
              }
            />

            <SidebarItem
              icon={
                <Settings size={20} />
              }
              label="Settings"
              onClick={() =>
                goTo(
                  "/admin/settings"
                )
              }
            />

          </nav>

          <div className="mt-auto border-t border-slate-100 pt-3">

            <SidebarItem
              icon={
                <LogOut size={20} />
              }
              label="Logout"
              danger
              onClick={
                handleLogout
              }
            />

          </div>

        </div>

      </aside>

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (

        <button
          type="button"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden"
          aria-label="Close navigation"
        />

      )}

      {/* =====================================
          MAIN
      ===================================== */}

      <main className="min-h-screen pt-[78px] lg:pl-[250px]">

        <div className="p-4 md:p-6">

          {/* =================================
              PAGE HEADER
          ================================= */}

          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                Administrator Portal
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Administrator Overview
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Monitor verification activities, instruments and certificates.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                goTo(
                  "/admin/notifications"
                )
              }
              className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 md:self-auto"
            >

              <Bell size={17} />

              View Alerts

            </button>

          </div>

          {/* =================================
              KPI CARDS
          ================================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <KpiCard
              title="Total Registered Instruments"
              value={formatNumber(
                instrumentCount
              )}
              subtitle="All registered instruments"
              icon={
                <Gauge size={21} />
              }
              iconClass="bg-blue-100 text-blue-700"
            />

            <KpiCard
              title="Pending Verification Applications"
              value={formatNumber(
                applicationStats.pending
              )}
              subtitle="Awaiting review"
              icon={
                <ClipboardList
                  size={21}
                />
              }
              iconClass="bg-cyan-100 text-cyan-700"
            />

            <KpiCard
              title="Certificates Issued"
              value={formatNumber(
                certificateStats.total
              )}
              subtitle="Digital certificates"
              icon={
                <FileCheck2
                  size={21}
                />
              }
              iconClass="bg-green-100 text-green-700"
            />

            <KpiCard
              title="Expiring Certificates"
              value={formatNumber(
                certificateStats.expiring
              )}
              subtitle="Within 30 days"
              icon={
                <AlertTriangle
                  size={21}
                />
              }
              iconClass="bg-red-100 text-red-700"
            />

          </div>

          {/* =================================
              MIDDLE SECTION
          ================================= */}

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_1.15fr_0.8fr]">

            {/* STATUS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5">

                <h2 className="text-lg font-bold text-slate-900">
                  Verification Status Breakdown
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current application status
                </p>

              </div>

              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">

                <DonutChart
                  values={[
                    donutData.submitted,
                    donutData.underReview,
                    donutData.approved,
                    donutData.rejected,
                  ]}
                />

                <div className="w-full max-w-[180px] space-y-4">

                  <LegendRow
                    label="Submitted"
                    value={`${donutData.submitted}%`}
                    dotClass="bg-cyan-500"
                  />

                  <LegendRow
                    label="Under Review"
                    value={`${donutData.underReview}%`}
                    dotClass="bg-orange-500"
                  />

                  <LegendRow
                    label="Approved"
                    value={`${donutData.approved}%`}
                    dotClass="bg-green-500"
                  />

                  <LegendRow
                    label="Rejected"
                    value={`${donutData.rejected}%`}
                    dotClass="bg-red-500"
                  />

                </div>

              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">

                <MiniStat
                  label="Passed"
                  value={String(
                    verificationStats.passed
                  )}
                />

                <MiniStat
                  label="Failed"
                  value={String(
                    verificationStats.failed
                  )}
                />

                <MiniStat
                  label="Pending"
                  value={String(
                    verificationStats.pending
                  )}
                />

              </div>

            </section>

            {/* WORKLOAD */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5">

                <h2 className="text-lg font-bold text-slate-900">
                  Workload by Region
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Verification workload distribution
                </p>

              </div>

              <RegionBar
                name="Maharashtra"
                value={82}
                completed={54}
              />

              <RegionBar
                name="Delhi"
                value={69}
                completed={46}
              />

              <RegionBar
                name="Karnataka"
                value={55}
                completed={34}
              />

              <RegionBar
                name="West Bengal"
                value={63}
                completed={39}
              />

              <div className="mt-6 flex items-center gap-5 text-xs text-slate-500">

                <div className="flex items-center gap-2">

                  <span className="h-2.5 w-2.5 rounded-full bg-green-600" />

                  Total workload

                </div>

                <div className="flex items-center gap-2">

                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

                  Completed

                </div>

              </div>

            </section>

            {/* ALERTS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-start justify-between">

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Alerts & Notifications
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Items requiring attention
                  </p>

                </div>

                <Bell
                  size={20}
                  className="text-slate-400"
                />

              </div>

              <div className="space-y-3">

                {alerts.map(
                  (
                    alert,
                    index
                  ) => (

                    <button
                      type="button"
                      key={`${alert.text}-${index}`}
                      onClick={() =>
                        goTo(
                          "/admin/notifications"
                        )
                      }
                      className="flex w-full items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-green-200 hover:bg-green-50"
                    >

                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          alert.type ===
                          "critical"
                            ? "bg-red-100 text-red-600"
                            : alert.type ===
                              "warning"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >

                        {alert.type ===
                        "critical" ? (
                          <AlertTriangle
                            size={15}
                          />
                        ) : (
                          <Bell size={15} />
                        )}

                      </span>

                      <span className="text-xs font-medium leading-5 text-slate-700">

                        {alert.text}

                      </span>

                    </button>

                  )
                )}

              </div>

            </section>

          </div>

          {/* =================================
              RECENT APPLICATIONS
          ================================= */}

          <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Recent Verification Requests
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest applications requiring administrative attention.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/admin/applications"
                  )
                }
                className="text-sm font-semibold text-green-700 hover:text-green-800"
              >

                View All →

              </button>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px] text-left">

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>

                    <TableHead>
                      Application ID
                    </TableHead>

                    <TableHead>
                      Applicant Name
                    </TableHead>

                    <TableHead>
                      GATC / LMO
                    </TableHead>

                    <TableHead>
                      Instrument Type
                    </TableHead>

                    <TableHead>
                      Date Submitted
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
                          className="transition hover:bg-green-50/30"
                        >

                          <td className="px-5 py-4">

                            <button
                              type="button"
                              onClick={() =>
                                goTo(
                                  "/admin/applications"
                                )
                              }
                              className="font-semibold text-green-700 hover:underline"
                            >

                              {
                                application.id
                              }

                            </button>

                          </td>

                          <td className="px-5 py-4">

                            <span className="text-sm font-semibold text-slate-800">

                              {
                                application.applicant
                              }

                            </span>

                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">

                            GATC / LMO

                          </td>

                          <td className="px-5 py-4">

                            <div>

                              <p className="text-sm font-medium text-slate-700">

                                {
                                  application.type
                                }

                              </p>

                              <p className="mt-1 text-xs text-slate-400">

                                {
                                  application.instrument
                                }

                              </p>

                            </div>

                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">

                            {
                              application.submitted
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
                                goTo(
                                  "/admin/applications"
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                            >

                              {application.status ===
                              "Pending"
                                ? "Review"
                                : "View Details"}

                            </button>

                          </td>

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          </section>

          {/* =================================
              DIGITAL CERTIFICATES
          ================================= */}

          <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Digital Certificates
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Recently issued verification certificates.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/admin/reports"
                  )
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                View
              </button>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>

                    <TableHead>
                      Certificate ID
                    </TableHead>

                    <TableHead>
                      GATC / LMO
                    </TableHead>

                    <TableHead>
                      Instrument
                    </TableHead>

                    <TableHead>
                      Date Issued
                    </TableHead>

                    <TableHead>
                      Expiry Date
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {certificates
                    .slice(0, 5)
                    .map(
                      (
                        certificate
                      ) => (

                        <tr
                          key={
                            certificate.certificateId
                          }
                          className="transition hover:bg-green-50/30"
                        >

                          <td className="px-5 py-4">

                            <span className="font-semibold text-green-700">

                              {
                                certificate.certificateId
                              }

                            </span>

                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">

                            {
                              certificate.businessId
                            }

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-sm font-semibold text-slate-700">

                              {
                                certificate.instrumentId
                              }

                            </p>

                            <p className="mt-1 text-xs text-slate-400">

                              {
                                certificate.instrumentType
                              }

                            </p>

                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">

                            {
                              certificate.issueDate
                            }

                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">

                            {
                              certificate.validUntil
                            }

                          </td>

                          <td className="px-5 py-4">

                            <CertificateStatusBadge
                              status={
                                certificate.status
                              }
                            />

                          </td>

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          </section>

          {/* =================================
              SYSTEM STATUS
          ================================= */}

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">

                  <ShieldCheck
                    size={22}
                  />

                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    System Status
                  </h2>

                  <p className="text-sm text-slate-500">
                    Current platform health
                  </p>

                </div>

              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                <SystemStatus
                  label="Verification Engine"
                />

                <SystemStatus
                  label="Application Processing"
                />

                <SystemStatus
                  label="Certificate Service"
                />

                <SystemStatus
                  label="Inspector Network"
                />

              </div>

            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">

                  <AlertTriangle
                    size={22}
                  />

                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Action Required
                  </h2>

                  <p className="text-sm text-slate-500">
                    Items needing administrator attention
                  </p>

                </div>

              </div>

              <div className="space-y-3">

                <ActionNotice
                  title={`${applicationStats.pending} applications pending review`}
                  onClick={() =>
                    goTo(
                      "/admin/applications"
                    )
                  }
                />

                <ActionNotice
                  title={`${enforcements.length} enforcement cases awaiting action`}
                  onClick={() =>
                    goTo(
                      "/admin/enforcement"
                    )
                  }
                />

                <ActionNotice
                  title={`${inspectorCount} inspectors currently available`}
                  onClick={() =>
                    goTo(
                      "/admin/appointments"
                    )
                  }
                />

              </div>

            </section>

          </div>

        </div>

      </main>

    </div>
  );
}

/* =========================================
   SIDEBAR ITEM
========================================= */

function SidebarItem({
  icon,
  label,
  active = false,
  hasArrow = false,
  danger = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  hasArrow?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
        active
          ? "bg-blue-100 text-blue-700"
          : danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >

      <span className="shrink-0">
        {icon}
      </span>

      <span className="flex-1">
        {label}
      </span>

      {hasArrow && (
        <span className="text-slate-400">
          ›
        </span>
      )}

    </button>
  );
}

/* =========================================
   KPI CARD
========================================= */

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-3">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
          ALMVE
        </span>

      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}

/* =========================================
   DONUT
========================================= */

function DonutChart({
  values,
}: {
  values: number[];
}) {
  const radius = 42;

  const circumference =
    2 * Math.PI * radius;

  let accumulated = 0;

  const segments =
    values.map(
      (
        value,
        index
      ) => {
        const length =
          (value / 100) *
          circumference;

        const current =
          {
            index,
            length,
            offset:
              accumulated,
          };

        accumulated += length;

        return current;
      }
    );

  const strokeClasses = [
    "stroke-cyan-500",
    "stroke-orange-500",
    "stroke-green-500",
    "stroke-red-500",
  ];

  return (
    <div className="relative h-44 w-44 shrink-0">

      <svg
        viewBox="0 0 100 100"
        className="-rotate-90"
      >

        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="15"
        />

        {segments.map(
          (segment) => (

            <circle
              key={
                segment.index
              }
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              strokeWidth="15"
              className={
                strokeClasses[
                  segment.index
                ]
              }
              strokeDasharray={`${segment.length} ${circumference}`}
              strokeDashoffset={
                -segment.offset
              }
            />

          )
        )}

      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">

        <span className="text-2xl font-bold text-slate-900">
          100%
        </span>

        <span className="text-xs text-slate-500">
          Applications
        </span>

      </div>

    </div>
  );
}

/* =========================================
   LEGEND
========================================= */

function LegendRow({
  label,
  value,
  dotClass,
}: {
  label: string;
  value: string;
  dotClass: string;
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-2">

        <span
          className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
        />

        <span className="text-sm text-slate-600">
          {label}
        </span>

      </div>

      <span className="text-sm font-semibold text-slate-400">
        {value}
      </span>

    </div>
  );
}

/* =========================================
   REGION BAR
========================================= */

function RegionBar({
  name,
  value,
  completed,
}: {
  name: string;
  value: number;
  completed: number;
}) {
  return (
    <div className="mb-5">

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-semibold text-slate-700">
          {name}
        </span>

        <span className="text-xs text-slate-400">
          {value} cases
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">

        <div
          className="flex h-full"
          style={{
            width: `${Math.min(
              100,
              value
            )}%`,
          }}
        >

          <div
            className="h-full bg-green-600"
            style={{
              width: `${
                value === 0
                  ? 0
                  : Math.min(
                      100,
                      (completed /
                        value) *
                        100
                    )
              }%`,
            }}
          />

          <div
            className="h-full bg-blue-500"
            style={{
              flex: 1,
            }}
          />

        </div>

      </div>

    </div>
  );
}

/* =========================================
   MINI STAT
========================================= */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3 text-center">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}

/* =========================================
   APPLICATION STATUS
========================================= */

function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  const styles: Record<
    ApplicationStatus,
    string
  > = {
    Pending:
      "bg-orange-100 text-orange-700",

    Scheduled:
      "bg-blue-100 text-blue-700",

    Approved:
      "bg-green-100 text-green-700",

    Rejected:
      "bg-red-100 text-red-700",

    Completed:
      "bg-emerald-100 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* =========================================
   CERTIFICATE STATUS
========================================= */

function CertificateStatusBadge({
  status,
}: {
  status: string;
}) {
  const isValid =
    status ===
      "Valid" ||
    status ===
      "Expiring Soon";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
        isValid
          ? status ===
            "Expiring Soon"
            ? "bg-orange-100 text-orange-700"
            : "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status}
    </span>
  );
}

/* =========================================
   SYSTEM STATUS
========================================= */

function SystemStatus({
  label,
}: {
  label: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">

      <div className="flex items-center justify-between gap-2">

        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700">

          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

          Operational

        </span>

      </div>

    </div>
  );
}

/* =========================================
   ACTION NOTICE
========================================= */

function ActionNotice({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-green-300 hover:bg-green-50"
    >

      <div className="flex items-center gap-3">

        <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />

        <span className="text-sm font-medium text-slate-700">
          {title}
        </span>

      </div>

      <span className="text-xs font-semibold text-green-700">
        View →
      </span>

    </button>
  );
}

/* =========================================
   TABLE HEAD
========================================= */

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

/*=======================================
   HELPERS
========================================= */

function normalizeApplicationStatus(
  value?: string
): ApplicationStatus {
  if (
    value ===
      "Approved" ||
    value === "Rejected" ||
    value === "Scheduled" ||
    value === "Completed"
  ) {
    return value;
  }

  return "Pending";
}

function formatNumber(
  value: number
): string {
  return value.toLocaleString(
    "en-IN"
  );
}

export default AdminDashboard;