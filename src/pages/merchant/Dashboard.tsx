import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  FileText,
  Home,
  LogOut,
  Menu,
  PackageCheck,
  Scale,
  Settings,
  User,
  X,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ApplicationStatus =
  | "Submitted"
  | "Under Review"
  | "Inspection Scheduled"
  | "Approved"
  | "Rejected";

interface Application {
  id: string;
  instrumentId: string;
  instrumentType: string;
  submitted: string;
  status: ApplicationStatus;
}

interface Appointment {
  id: string;
  businessName: string;
  instrumentType: string;
  date: string;
  time: string;
  status: "Scheduled" | "Confirmed";
}

interface Instrument {
  instrumentId: string;
  instrumentType?: string;
  status?: string;
}

/* =========================================================
   DATABASE DATA
========================================================= */

interface ApiApplication {
  id?: number | string;
  applicationId?: string;
  application_number?: string;
  businessId?: number | string;
  applicant?: string;
  instrumentId?: string | number;
  instrument?: string;
  instrumentType?: string;
  type?: string;
  submitted?: string;
  submittedDate?: string;
  submissionDate?: string;
  status?: string;
  location?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  inspector?: string;
}

interface ApiCertificate {
  certificateId?: string;
  certificateNumber?: string;
  validUntil?: string;
  status?: string;
}

interface ApplicationsResponse {
  success: boolean;
  message?: string;
  applications?: ApiApplication[];
}

interface CertificatesResponse {
  success: boolean;
  message?: string;
  certificates?: ApiCertificate[];
}

interface UserResponse {
  success: boolean;
  message?: string;
  user?: {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
  };
}

function getToken(): string {
  return localStorage.getItem("almveToken") || "";
}

function normalizeApplicationStatus(
  value: string
): ApplicationStatus {
  switch (value) {
    case "Under Review":
      return "Under Review";

    case "Scheduled":
    case "Inspection Scheduled":
      return "Inspection Scheduled";

    case "Approved":
    case "Completed":
      return "Approved";

    case "Rejected":
      return "Rejected";

    case "Submitted":
    case "Pending":
    default:
      return "Submitted";
  }
}

function formatDate(value: unknown): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(
    String(value)
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatAppointmentDate(
  value: unknown
): {
  day: string;
  month: string;
  fullDate: string;
} {
  if (!value) {
    return {
      day: "--",
      month: "---",
      fullDate: "Date not available",
    };
  }

  const date = new Date(
    String(value)
  );

  if (Number.isNaN(date.getTime())) {
    return {
      day: "--",
      month: "---",
      fullDate: String(value),
    };
  }

  return {
    day: String(
      date.getDate()
    ).padStart(2, "0"),
    month:
      date
        .toLocaleDateString(
          "en-IN",
          { month: "short" }
        )
        .toUpperCase(),
    fullDate:
      date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),
  };
}

function formatTime(
  value: unknown
): string {
  if (!value) {
    return "Time not set";
  }

  const raw = String(value);

  if (
    /am|pm/i.test(raw)
  ) {
    return raw;
  }

  const parts =
    raw.split(":");

  if (
    parts.length < 2
  ) {
    return raw;
  }

  const hours =
    Number(parts[0]);

  const minutes =
    parts[1];

  if (
    Number.isNaN(hours)
  ) {
    return raw;
  }

  const suffix =
    hours >= 12
      ? "PM"
      : "AM";

  const displayHour =
    hours % 12 || 12;

  return `${String(
    displayHour
  ).padStart(2, "0")}:${minutes} ${suffix}`;
}

function mapApplication(
  item: ApiApplication
): Application {
  return {
    id: String(
      item.applicationId ??
        item.application_number ??
        item.id ??
        ""
    ),
    instrumentId: String(
      item.instrumentId ??
        item.instrument ??
        "N/A"
    ),
    instrumentType: String(
      item.instrumentType ??
        item.instrument ??
        item.type ??
        "Instrument"
    ),
    submitted: formatDate(
      item.submitted ??
        item.submittedDate ??
        item.submissionDate
    ),
    status:
      normalizeApplicationStatus(
        String(
          item.status ??
            "Submitted"
        )
      ),
  };
}

function mapAppointment(
  item: ApiApplication,
  businessName: string
): Appointment | null {
  if (
    !item.appointmentDate &&
    !item.appointmentTime
  ) {
    return null;
  }

  return {
    id: String(
      item.applicationId ??
        item.application_number ??
        item.id ??
        ""
    ),
    businessName:
      businessName ||
      item.applicant ||
      "Business",
    instrumentType: String(
      item.instrumentType ??
        item.instrument ??
        item.type ??
        "Instrument"
    ),
    date: String(
      item.appointmentDate ??
        ""
    ),
    time: formatTime(
      item.appointmentTime
    ),
    status:
      item.status ===
        "Confirmed"
        ? "Confirmed"
        : "Scheduled",
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applicationsOpen, setApplicationsOpen] = useState(true);
  const [instrumentsOpen, setInstrumentsOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const [
    applications,
    setApplications,
  ] = useState<Application[]>([]);

  const [
    instruments,
    setInstruments,
  ] = useState<Instrument[]>([]);

  const [
    appointments,
    setAppointments,
  ] = useState<Appointment[]>([]);

  const [
    certificateCount,
    setCertificateCount,
  ] = useState(0);

  const [
    expiringCount,
    setExpiringCount,
  ] = useState(0);

  const [
    merchantName,
    setMerchantName,
  ] = useState("Merchant");

  const [
    unreadNotificationCount,
    setUnreadNotificationCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /* =======================================================
     LOAD DASHBOARD DATA FROM POSTGRESQL
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadDashboard =
      async () => {
        const token =
          getToken();

        if (!token) {
          setErrorMessage(
            "Authentication token not found. Please login again."
          );
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setErrorMessage("");

          const headers = {
            Authorization:
              `Bearer ${token}`,
          };

          const [
            applicationsResponse,
            certificatesResponse,
            userResponse,
          ] = await Promise.all([
            fetch(
              "https://maapsetu-w1sf.onrender.com/api/applications",
              { headers }
            ),
            fetch(
              "https://maapsetu-w1sf.onrender.com/api/certificates",
              { headers }
            ),
            fetch(
              "https://maapsetu-w1sf.onrender.com/api/auth/me",
              { headers }
            ),
          ]);

          const applicationsData =
            (await applicationsResponse
              .json()
              .catch(() => null)) as
              | ApplicationsResponse
              | null;

          const certificatesData =
            (await certificatesResponse
              .json()
              .catch(() => null)) as
              | CertificatesResponse
              | null;

          const userData =
            (await userResponse
              .json()
              .catch(() => null)) as
              | UserResponse
              | null;

          if (
            !applicationsResponse.ok
          ) {
            throw new Error(
              applicationsData?.message ||
                "Unable to load applications."
            );
          }

          if (
            !applicationsData?.success
          ) {
            throw new Error(
              applicationsData?.message ||
                "Unable to load applications."
            );
          }

          if (
            !certificatesResponse.ok
          ) {
            throw new Error(
              certificatesData?.message ||
                "Unable to load certificates."
            );
          }

          if (
            !certificatesData?.success
          ) {
            throw new Error(
              certificatesData?.message ||
                "Unable to load certificates."
            );
          }

          if (cancelled) {
            return;
          }

          const apiApplications =
            Array.isArray(
              applicationsData.applications
            )
              ? applicationsData.applications
              : [];

          const normalizedApplications =
            apiApplications
              .map(mapApplication)
              .filter(
                (item) =>
                  item.id.length > 0
              );

          setApplications(
            normalizedApplications
          );

          const uniqueInstruments: Instrument[] = [];

          apiApplications.forEach(
            (item) => {
              const id = String(
                item.instrumentId ??
                  item.instrument ??
                  ""
              ).trim();

              if (!id) {
                return;
              }

              const alreadyExists =
                uniqueInstruments.some(
                  (instrument) =>
                    instrument.instrumentId ===
                    id
                );

              if (alreadyExists) {
                return;
              }

              uniqueInstruments.push({
                instrumentId: id,
                instrumentType:
                  String(
                    item.instrumentType ??
                      item.instrument ??
                      "Instrument"
                  ),
                status: "Active",
              });
            }
          );

          setInstruments(
            uniqueInstruments
          );

          const businessName =
            String(
              apiApplications[0]
                ?.applicant ??
                ""
            );

          const normalizedAppointments =
            apiApplications
              .map((item) =>
                mapAppointment(
                  item,
                  businessName
                )
              )
              .filter(
                (
                  item
                ): item is Appointment =>
                  item !== null
              )
              .slice(0, 3);

          setAppointments(
            normalizedAppointments
          );

          const certificates =
            Array.isArray(
              certificatesData.certificates
            )
              ? certificatesData.certificates
              : [];

          setCertificateCount(
            certificates.length
          );

          const expiring =
            certificates.filter(
              (certificate) => {
                const status =
                  String(
                    certificate.status ??
                      ""
                  ).toLowerCase();

                if (
                  status.includes(
                    "expiring"
                  )
                ) {
                  return true;
                }

                if (
                  status ===
                  "expired"
                ) {
                  return false;
                }

                if (
                  !certificate.validUntil
                ) {
                  return false;
                }

                const validUntil =
                  new Date(
                    String(
                      certificate.validUntil
                    )
                  );

                if (
                  Number.isNaN(
                    validUntil.getTime()
                  )
                ) {
                  return false;
                }

                const now =
                  new Date();

                const in30Days =
                  new Date();

                in30Days.setDate(
                  in30Days.getDate() +
                    30
                );

                return (
                  validUntil >= now &&
                  validUntil <=
                    in30Days
                );
              }
            ).length;

          setExpiringCount(
            expiring
          );

          setMerchantName(
            String(
              userData?.user?.name ||
                localStorage.getItem(
                  "merchantName"
                ) ||
                localStorage.getItem(
                  "businessName"
                ) ||
                "Merchant"
            )
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(
            "Unable to load merchant dashboard:",
            error
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load merchant dashboard."
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     NOTIFICATION COUNT
  ======================================================= */

  const updateNotificationCount = () => {
    try {
      const storedRead = localStorage.getItem(
        "almveMerchantReadNotifications"
      );

      let readIds: string[] = [];

      try {
        const parsedRead = storedRead
          ? JSON.parse(storedRead)
          : [];

        if (Array.isArray(parsedRead)) {
          readIds = parsedRead.map(String);
        }
      } catch {
        readIds = [];
      }

      /*
       * Notifications.tsx creates notification IDs from
       * application IDs/statuses. We create the same IDs here
       * from the applications already loaded by Dashboard.
       */
      const notificationIds: string[] = [];

      applications.forEach((item) => {
        const id = String(item.id || "").trim();

        if (!id) {
          return;
        }

        const rawStatus = String(
          item.status || ""
        ).trim();

        if (
          rawStatus === "Scheduled" ||
          rawStatus === "Inspection Scheduled"
        ) {
          notificationIds.push(`appointment-${id}`);
        }

        if (
          rawStatus === "Completed" ||
          rawStatus === "Approved"
        ) {
          notificationIds.push(`completed-${id}`);
        }

        if (rawStatus === "Rejected") {
          notificationIds.push(`rejected-${id}`);
        }

        if (
          rawStatus === "Pending" ||
          rawStatus === "Submitted" ||
          rawStatus === "Under Review"
        ) {
          notificationIds.push(`application-${id}`);
        }
      });

      const unreadCount = notificationIds.filter(
        (id) => !readIds.includes(id)
      ).length;

      setUnreadNotificationCount(
        unreadCount
      );
    } catch (error) {
      console.error(
        "Unable to calculate notification count:",
        error
      );
      setUnreadNotificationCount(0);
    }
  };

  useEffect(() => {
    updateNotificationCount();

    const handleNotificationUpdate = () => {
      updateNotificationCount();
    };

    window.addEventListener(
      "almveNotificationsUpdated",
      handleNotificationUpdate
    );

    return () => {
      window.removeEventListener(
        "almveNotificationsUpdated",
        handleNotificationUpdate
      );
    };
  }, [applications]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const applicationStats =
    useMemo(() => {
      const submitted =
        applications.filter(
          (item) =>
            item.status ===
            "Submitted"
        ).length;

      const underReview =
        applications.filter(
          (item) =>
            item.status ===
            "Under Review"
        ).length;

      const scheduled =
        applications.filter(
          (item) =>
            item.status ===
            "Inspection Scheduled"
        ).length;

      const approved =
        applications.filter(
          (item) =>
            item.status ===
            "Approved"
        ).length;

      const rejected =
        applications.filter(
          (item) =>
            item.status ===
            "Rejected"
        ).length;

      return {
        submitted,
        underReview,
        scheduled,
        approved,
        rejected,
        total:
          applications.length,
      };
    }, [applications]);

  const registeredInstrumentCount =
    instruments.length;

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goTo = (path: string) => {
    setSidebarOpen(false);
    setProfileOpen(false);
    navigate(path);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f7f8f7] text-slate-900">
      {errorMessage && (
        <div className="fixed left-1/2 top-3 z-[70] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-lg">
          {errorMessage}
        </div>
      )}

      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-50 h-[78px] border-b border-slate-200 bg-white">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <button
              type="button"
              onClick={() => goTo("/merchant/dashboard")}
              className="flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-700 text-white shadow-sm">
                <ScaleLogo />
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-lg font-bold text-green-800">ALMVE</p>
                <p className="text-xs text-slate-500">Merchant Portal</p>
              </div>
            </button>
          </div>

          <div className="hidden text-center md:block">
            <h2 className="text-xl font-bold lg:text-2xl">Merchant Dashboard</h2>
            <p className="text-xs text-slate-500">
              Welcome to ALMVE Merchant Portal
            </p>
          </div>

          <div className="relative flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => goTo("/merchant/notifications")}
              className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100"
              title="Notifications"
            >
              <Bell size={22} />
              {unreadNotificationCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-bold text-white">
                  {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <User size={21} />
              </div>

              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold">{merchantName}</p>
                <p className="text-xs text-slate-500">Merchant</p>
              </div>

              <ChevronDown size={16} className="hidden text-slate-400 lg:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <button
                  type="button"
                  onClick={() => goTo("/merchant/profile")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-100"
                >
                  <User size={17} /> Profile
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/merchant/settings")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-100"
                >
                  <Settings size={17} /> Settings
                </button>

                <button
                  type="button"
                  onClick={() => goTo("/login")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={17} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`fixed bottom-0 left-0 top-[78px] z-40 w-[258px] border-r border-slate-200 bg-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
          <nav className="space-y-2">
            <SidebarButton
              active
              icon={<Home size={19} />}
              label="Dashboard"
              onClick={() => goTo("/merchant/dashboard")}
            />

            <SidebarButton
              icon={<ClipboardList size={19} />}
              label="Applications"
              hasArrow
              expanded={applicationsOpen}
              onClick={() => setApplicationsOpen((value) => !value)}
            />

            {applicationsOpen && (
              <div className="ml-9 space-y-1">
                <SubNavButton
                  label="New Application"
                  icon={<span className="text-base">+</span>}
                  onClick={() => goTo("/merchant/register-instrument")}
                />
                <SubNavButton
                  label="My Applications"
                  icon={<FileText size={16} />}
                  onClick={() => goTo("/merchant/applications")}
                />
              </div>
            )}

            <SidebarButton
              icon={<PackageCheck size={19} />}
              label="Instruments"
              hasArrow
              expanded={instrumentsOpen}
              onClick={() => setInstrumentsOpen((value) => !value)}
            />

            {instrumentsOpen && (
              <div className="ml-9 space-y-1">
                <SubNavButton
                  label="Register Instrument"
                  icon={<span className="text-base">+</span>}
                  onClick={() => goTo("/merchant/register-instrument")}
                />
                <SubNavButton
                  label="My Instruments"
                  icon={<Scale size={16} />}
                  onClick={() => goTo("/merchant/instruments")}
                />
              </div>
            )}

            <SidebarButton
              icon={<CalendarDays size={19} />}
              label="Appointments"
              onClick={() => goTo("/merchant/appointments")}
            />

            <SidebarButton
              icon={<FileCheck2 size={19} />}
              label="Certificates"
              onClick={() => goTo("/merchant/certificates")}
            />

            <SidebarButton
              icon={<CreditCard size={19} />}
              label="Payments"
              onClick={() => goTo("/merchant/payments")}
            />

            <SidebarButton
              icon={<Bell size={19} />}
              label="Notifications"
              badge={
                unreadNotificationCount > 0
                  ? unreadNotificationCount > 99
                    ? "99+"
                    : String(
                        unreadNotificationCount
                      )
                  : undefined
              }
              onClick={() =>
                goTo("/merchant/notifications")
              }
            />

            <SidebarButton
              icon={<User size={19} />}
              label="Profile"
              onClick={() => goTo("/merchant/profile")}
            />

            <SidebarButton
              icon={<Settings size={19} />}
              label="Settings"
              onClick={() => goTo("/merchant/settings")}
            />
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-3">
            <SidebarButton
              icon={<LogOut size={19} />}
              label="Logout"
              danger
              onClick={() => goTo("/login")}
            />
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden"
          aria-label="Close menu"
        />
      )}

      {/* MAIN */}
      <main className="min-h-screen pt-[78px] lg:pl-[258px]">
        <div className="p-4 md:p-6 lg:p-7">

          {loading && (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-700">
              Loading your dashboard data from PostgreSQL...
            </div>
          )}
          {/* WELCOME */}
          <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative flex min-h-[145px] items-center justify-between overflow-hidden px-6 py-7 md:px-7">
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-2xl font-bold md:text-3xl">
                  Welcome back, <span className="text-green-700">{merchantName}</span>! 👋
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Manage your instruments, applications and certification activities from your dashboard.
                </p>
              </div>

              <DashboardIllustration />
            </div>
          </section>

          {/* STAT CARDS */}
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              title="Registered Instruments"
              value={String(registeredInstrumentCount)}
              icon={<Scale size={23} />}
              iconClass="bg-green-50 text-green-700"
              actionLabel="View all instruments"
              onClick={() => goTo("/merchant/instruments")}
            />

            <DashboardStatCard
              title="Pending Applications"
              value={String(
                applicationStats.submitted + applicationStats.underReview
              )}
              icon={<ClipboardList size={23} />}
              iconClass="bg-orange-50 text-orange-600"
              actionLabel="View all applications"
              onClick={() => goTo("/merchant/applications")}
            />

            <DashboardStatCard
              title="Certificates"
              value={String(certificateCount)}
              icon={<FileCheck2 size={23} />}
              iconClass="bg-blue-50 text-blue-600"
              actionLabel="View all certificates"
              onClick={() => goTo("/merchant/certificates")}
            />

            <DashboardStatCard
              title="Expiring Soon"
              value={String(expiringCount)}
              icon={<AlertTriangle size={23} />}
              iconClass="bg-red-50 text-red-600"
              actionLabel="View details"
              onClick={() => goTo("/merchant/certificates")}
            />
          </div>

          {/* MIDDLE */}
          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <ApplicationStatusCard
              stats={applicationStats}
              onViewAll={() => goTo("/merchant/applications")}
            />

            <UpcomingAppointmentsCard
              appointments={appointments}
              onViewAll={() => goTo("/merchant/appointments")}
            />
          </div>

          {/* BOTTOM */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
            <RecentApplicationsCard
              applications={applications.slice(0, 5)}
              onViewAll={() => goTo("/merchant/applications")}
              onView={(id) => goTo(`/merchant/applications/${id}`)}
            />

            <QuickActionsCard
              onNewApplication={() =>
                goTo("/merchant/register-instrument")
              }
              onRegisterInstrument={() =>
                goTo("/merchant/register-instrument")
              }
              onPayment={() => goTo("/merchant/payments")}
              onCertificate={() => goTo("/merchant/certificates")}
            />
          </div>
        </div>

        <footer className="border-t border-slate-200 px-4 py-5 text-center text-xs text-slate-400 lg:pl-[258px]">
          © 2026 ALMVE - Automated Legal Metrology Verification Engine. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

/* =========================================================
   SIDEBAR COMPONENTS
========================================================= */

function SidebarButton({
  icon,
  label,
  active = false,
  hasArrow = false,
  expanded = false,
  badge,
  danger = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  hasArrow?: boolean;
  expanded?: boolean;
  badge?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
          {badge}
        </span>
      )}
      {hasArrow && (
        <ChevronDown
          size={15}
          className={`text-slate-400 transition ${
            expanded ? "rotate-0" : "-rotate-90"
          }`}
        />
      )}
    </button>
  );
}

function SubNavButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function DashboardStatCard({
  title,
  value,
  icon,
  iconClass,
  actionLabel,
  onClick,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  iconClass: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>
        <ChevronRight size={18} className="text-slate-300" />
      </div>

      <p className="mt-5 text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>

      <button
        type="button"
        onClick={onClick}
        className="mt-3 text-sm font-semibold text-green-700 hover:text-green-800"
      >
        {actionLabel} →
      </button>
    </div>
  );
}

/* =========================================================
   STATUS CARD
========================================================= */

function ApplicationStatusCard({
  stats,
  onViewAll,
}: {
  stats: {
    submitted: number;
    underReview: number;
    scheduled: number;
    approved: number;
    rejected: number;
    total: number;
  };
  onViewAll: () => void;
}) {
  const segments = [
    { label: "Submitted", value: stats.submitted, className: "bg-green-500" },
    { label: "Under Review", value: stats.underReview, className: "bg-yellow-400" },
    { label: "Inspection Scheduled", value: stats.scheduled, className: "bg-blue-500" },
    { label: "Approved", value: stats.approved, className: "bg-violet-500" },
    { label: "Rejected", value: stats.rejected, className: "bg-red-500" },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <ClipboardList size={20} />
            </div>
            <h2 className="text-xl font-bold">Application Status</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">Your application overview</p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold text-green-700 hover:text-green-800"
        >
          View all →
        </button>
      </div>

      <div className="mt-6 flex flex-col items-center gap-7 md:flex-row">
        <div className="relative flex h-48 w-48 shrink-0 items-center justify-center rounded-full border-[26px] border-green-500">
          <div className="absolute inset-0 rounded-full border-[26px] border-transparent border-l-yellow-400 border-t-blue-500 border-r-violet-500 border-b-red-500" />
          <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white shadow-inner">
            <span className="text-3xl font-bold">{stats.total}</span>
            <span className="text-xs text-slate-500">Total</span>
          </div>
        </div>

        <div className="w-full space-y-3">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${segment.className}`} />
              <span className="flex-1 text-sm text-slate-600">{segment.label}</span>
              <span className="text-sm font-bold text-slate-800">{segment.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   APPOINTMENTS
========================================================= */

function UpcomingAppointmentsCard({
  appointments,
  onViewAll,
}: {
  appointments: Appointment[];
  onViewAll: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <CalendarDays size={20} />
          </div>
          <h2 className="text-xl font-bold">Upcoming Appointments</h2>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold text-green-700"
        >
          View all →
        </button>
      </div>

      <div className="mt-5 divide-y divide-slate-100">
        {appointments.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No appointments scheduled yet.
          </div>
        ) : (
          appointments.map((appointment) => {
            const dateInfo =
              formatAppointmentDate(
                appointment.date
              );

            return (
              <div
                key={appointment.id}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-green-50 text-green-700">
                  <span className="text-[10px] font-bold">
                    {dateInfo.month}
                  </span>

                  <span className="text-lg font-bold">
                    {dateInfo.day}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {appointment.businessName}
                  </p>

                  <p className="truncate text-sm text-slate-500">
                    {appointment.instrumentType}
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <ClockIcon />
                    {appointment.time}
                  </div>
                </div>

                <span
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    appointment.status ===
                    "Confirmed"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-orange-50 text-orange-700"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

/* =========================================================
   RECENT APPLICATIONS
========================================================= */

function RecentApplicationsCard({
  applications,
  onViewAll,
  onView,
}: {
  applications: Application[];
  onViewAll: () => void;
  onView: (id: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-bold">Recent Applications</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold text-green-700"
        >
          View all →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-slate-50">
            <tr>
              <TableHead>Application ID</TableHead>
              <TableHead>Instrument</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((application) => (
              <tr key={application.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onView(application.id)}
                    className="font-semibold text-green-700 hover:underline"
                  >
                    {application.id}
                  </button>
                </td>
                <td className="px-5 py-4 text-sm text-slate-700">
                  {application.instrumentType}
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {application.submitted}
                </td>
                <td className="px-5 py-4">
                  <ApplicationStatusBadge status={application.status} />
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onView(application.id)}
                    className="text-sm font-semibold text-green-700 hover:underline"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

function QuickActionsCard({
  onNewApplication,
  onRegisterInstrument,
  onPayment,
  onCertificate,
}: {
  onNewApplication: () => void;
  onRegisterInstrument: () => void;
  onPayment: () => void;
  onCertificate: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-green-50/60 p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Quick Actions</h2>

      <div className="space-y-2">
        <QuickAction
          icon={<FileText size={19} />}
          title="New Application"
          description="Apply for instrument verification"
          onClick={onNewApplication}
        />

        <QuickAction
          icon={<Scale size={19} />}
          title="Register Instrument"
          description="Add a new instrument"
          onClick={onRegisterInstrument}
        />

        <QuickAction
          icon={<CreditCard size={19} />}
          title="Make Payment"
          description="Pay verification fees"
          onClick={onPayment}
        />

        <QuickAction
          icon={<FileCheck2 size={19} />}
          title="Download Certificate"
          description="View your certificates"
          onClick={onCertificate}
        />
      </div>
    </section>
  );
}

function QuickAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl bg-white p-3.5 text-left transition hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{description}</p>
      </div>

      <ChevronRight size={18} className="shrink-0 text-slate-400" />
    </button>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  const className: Record<ApplicationStatus, string> = {
    Submitted: "bg-blue-50 text-blue-700",
    "Under Review": "bg-orange-50 text-orange-700",
    "Inspection Scheduled": "bg-violet-50 text-violet-700",
    Approved: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-700",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${className[status]}`}>
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
    <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function ScaleLogo() {
  return (
    <svg
      width="26"
      height="26"
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

function ClockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function DashboardIllustration() {
  return (
    <div className="hidden h-32 w-80 items-end justify-end gap-3 pr-5 md:flex">
      <div className="h-24 w-12 rounded-t-lg border-4 border-slate-300 bg-slate-100" />
      <div className="relative h-32 w-20 rounded-t-[28px] bg-green-700">
        <div className="absolute left-4 top-5 h-8 w-12 rounded border-4 border-green-200" />
        <div className="absolute bottom-0 left-5 h-16 w-10 rounded-t bg-slate-700" />
      </div>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-700">
        <FileCheck2 size={31} />
      </div>
    </div>
  );
}

export default Dashboard;
