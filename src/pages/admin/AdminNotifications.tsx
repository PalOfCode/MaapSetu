import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Info,
  Search,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

/* =========================================
   TYPES
========================================= */

type NotificationType =
  | "Application"
  | "Appointment"
  | "Inspector"
  | "Certificate"
  | "System"
  | "Warning";

type NotificationPriority =
  | "High"
  | "Medium"
  | "Low";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  date: string;
  time: string;
  read: boolean;
}

/* =========================================
   STORAGE KEY
========================================= */

const NOTIFICATION_STORAGE =
  "almveAdminNotifications";

/* =========================================
   INITIAL DATA
========================================= */

const initialNotifications: NotificationItem[] = [
  {
    id: "NOT-001",
    title: "New application submitted",
    message:
      "Application APP-270140200751 has been submitted by Sharma Traders and is waiting for review.",
    type: "Application",
    priority: "High",
    date: "30 Aug 2026",
    time: "09:15 AM",
    read: false,
  },

  {
    id: "NOT-002",
    title: "Appointment scheduled",
    message:
      "Verification appointment for APP-270147440083 has been scheduled with Priya Singh.",
    type: "Appointment",
    priority: "Medium",
    date: "30 Aug 2026",
    time: "08:40 AM",
    read: false,
  },

  {
    id: "NOT-003",
    title: "Inspector assignment completed",
    message:
      "Rajesh Kumar has been assigned to APP-270140200751.",
    type: "Inspector",
    priority: "Medium",
    date: "29 Aug 2026",
    time: "04:20 PM",
    read: true,
  },

  {
    id: "NOT-004",
    title: "Certificate issued",
    message:
      "Certificate CERT-2701435032 has been successfully generated.",
    type: "Certificate",
    priority: "Low",
    date: "29 Aug 2026",
    time: "02:10 PM",
    read: true,
  },

  {
    id: "NOT-005",
    title: "Certificate expiring soon",
    message:
      "Certificate CERT-2701431008 is approaching its verification expiry date.",
    type: "Warning",
    priority: "High",
    date: "28 Aug 2026",
    time: "01:45 PM",
    read: false,
  },

  {
    id: "NOT-006",
    title: "Verification engine operational",
    message:
      "The automated verification engine is operating normally.",
    type: "System",
    priority: "Low",
    date: "28 Aug 2026",
    time: "10:00 AM",
    read: true,
  },
];

/* =========================================
   GET CURRENT DATE
========================================= */

function getTodayLabel(): string {
  return new Date().toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================
   GET CURRENT TIME
========================================= */

function getCurrentTime(): string {
  return new Date().toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
}

/* =========================================
   READ STORAGE
========================================= */

function readNotifications(): NotificationItem[] {
  try {
    const saved =
      localStorage.getItem(
        NOTIFICATION_STORAGE
      );

    if (!saved) {
      return initialNotifications;
    }

    const parsed: unknown =
      JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return initialNotifications;
    }

    return parsed as NotificationItem[];
  } catch {
    return initialNotifications;
  }
}

/* =========================================
   MAIN COMPONENT
========================================= */

function AdminNotifications() {
  const navigate =
    useNavigate();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>(
      readNotifications
    );

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<
      "All" | "Unread" | NotificationType
    >("All");

  const [
    selectedNotification,
    setSelectedNotification,
  ] =
    useState<NotificationItem | null>(
      null
    );

  /* =========================================
     SAVE TO LOCAL STORAGE
  ========================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        NOTIFICATION_STORAGE,
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error(
        "Unable to save notifications:",
        error
      );
    }
  }, [notifications]);

  /* =========================================
     FILTER
  ========================================= */

  const filteredNotifications =
    useMemo(() => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      return notifications.filter(
        (notification) => {
          const matchesSearch =
            [
              notification.title,
              notification.message,
              notification.type,
              notification.priority,
              notification.date,
              notification.time,
            ]
              .join(" ")
              .toLowerCase()
              .includes(
                searchText
              );

          let matchesFilter = true;

          if (
            filter === "Unread"
          ) {
            matchesFilter =
              !notification.read;
          } else if (
            filter !== "All"
          ) {
            matchesFilter =
              notification.type ===
              filter;
          }

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      notifications,
      search,
      filter,
    ]);

  /* =========================================
     COUNTS
  ========================================= */

  const totalCount =
    notifications.length;

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  const highPriorityCount =
    notifications.filter(
      (notification) =>
        notification.priority ===
        "High"
    ).length;

  const todayCount =
    notifications.filter(
      (notification) =>
        notification.date ===
        getTodayLabel()
    ).length;

  /* =========================================
     MARK ONE AS READ
  ========================================= */

  const markAsRead = (
    id: string
  ) => {
    setNotifications(
      (current) =>
        current.map(
          (notification) =>
            notification.id === id
              ? {
                  ...notification,
                  read: true,
                }
              : notification
        )
    );
  };

  /* =========================================
     MARK ALL AS READ
  ========================================= */

  const markAllAsRead = () => {
    setNotifications(
      (current) =>
        current.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        )
    );
  };

  /* =========================================
     DELETE ONE
  ========================================= */

  const deleteNotification = (
    id: string
  ) => {
    setNotifications(
      (current) =>
        current.filter(
          (notification) =>
            notification.id !== id
        )
    );

    if (
      selectedNotification?.id === id
    ) {
      setSelectedNotification(
        null
      );
    }
  };

  /* =========================================
     CLEAR READ
  ========================================= */

  const clearRead = () => {
    setNotifications(
      (current) =>
        current.filter(
          (notification) =>
            !notification.read
        )
    );

    setSelectedNotification(
      null
    );
  };

  /* =========================================
     ADD DEMO NOTIFICATION
  ========================================= */

  const addTestNotification =
    () => {
      const newNotification: NotificationItem =
        {
          id: `NOT-${Date.now()}`,
          title:
            "System notification",
          message:
            "A new administrative notification has been generated by the ALMVE platform.",
          type: "System",
          priority: "Medium",
          date: getTodayLabel(),
          time: getCurrentTime(),
          read: false,
        };

      setNotifications(
        (current) => [
          newNotification,
          ...current,
        ]
      );
    };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-6xl">

        {/* =================================
            BACK
        ================================= */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/dashboard"
            )
          }
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
        >

          <ArrowLeft size={18} />

          Back to Admin Dashboard

        </button>

        {/* =================================
            HEADER
        ================================= */}

        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <p className="text-sm font-semibold text-blue-600">
              Administrator Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
              View system updates, application alerts,
              appointments and verification events.
            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={
                markAllAsRead
              }
              disabled={
                unreadCount === 0
              }
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Check size={16} />

              Mark all as read

            </button>

            <button
              type="button"
              onClick={
                clearRead
              }
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >

              <Trash2 size={16} />

              Clear read

            </button>

            <button
              type="button"
              onClick={
                addTestNotification
              }
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >

              <Bell size={16} />

              New Notification

            </button>

          </div>

        </div>

        {/* =================================
            STATS
        ================================= */}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Notifications"
            value={String(
              totalCount
            )}
            icon={
              <Bell size={22} />
            }
            iconClass="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Unread"
            value={String(
              unreadCount
            )}
            icon={
              <Info size={22} />
            }
            iconClass="bg-orange-100 text-orange-600"
          />

          <StatCard
            title="High Priority"
            value={String(
              highPriorityCount
            )}
            icon={
              <AlertTriangle
                size={22}
              />
            }
            iconClass="bg-red-100 text-red-600"
          />

          <StatCard
            title="Today"
            value={String(
              todayCount
            )}
            icon={
              <CalendarDays
                size={22}
              />
            }
            iconClass="bg-purple-100 text-purple-600"
          />

        </div>

        {/* =================================
            SEARCH + FILTER
        ================================= */}

        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4">

            {/* SEARCH */}

            <div className="relative w-full">

              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search notifications..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* FILTERS */}

            <div className="flex flex-wrap gap-2">

              <FilterButton
                label="All"
                active={
                  filter === "All"
                }
                onClick={() =>
                  setFilter("All")
                }
              />

              <FilterButton
                label="Unread"
                active={
                  filter === "Unread"
                }
                onClick={() =>
                  setFilter(
                    "Unread"
                  )
                }
              />

              <FilterButton
                label="Applications"
                active={
                  filter ===
                  "Application"
                }
                onClick={() =>
                  setFilter(
                    "Application"
                  )
                }
              />

              <FilterButton
                label="Appointments"
                active={
                  filter ===
                  "Appointment"
                }
                onClick={() =>
                  setFilter(
                    "Appointment"
                  )
                }
              />

              <FilterButton
                label="Inspectors"
                active={
                  filter ===
                  "Inspector"
                }
                onClick={() =>
                  setFilter(
                    "Inspector"
                  )
                }
              />

              <FilterButton
                label="Certificates"
                active={
                  filter ===
                  "Certificate"
                }
                onClick={() =>
                  setFilter(
                    "Certificate"
                  )
                }
              />

              <FilterButton
                label="System"
                active={
                  filter ===
                  "System"
                }
                onClick={() =>
                  setFilter(
                    "System"
                  )
                }
              />

              <FilterButton
                label="Warnings"
                active={
                  filter ===
                  "Warning"
                }
                onClick={() =>
                  setFilter(
                    "Warning"
                  )
                }
              />

            </div>

          </div>

        </section>

        {/* =================================
            NOTIFICATION CENTER
        ================================= */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                <Bell size={22} />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Notification Center
                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {
                    filteredNotifications.length
                  }{" "}
                  notifications found

                </p>

              </div>

            </div>

          </div>

          <div className="divide-y divide-slate-100">

            {filteredNotifications.map(
              (notification) => (

                <NotificationCard
                  key={
                    notification.id
                  }
                  notification={
                    notification
                  }
                  onRead={() =>
                    markAsRead(
                      notification.id
                    )
                  }
                  onDelete={() =>
                    deleteNotification(
                      notification.id
                    )
                  }
                  onView={() =>
                    setSelectedNotification(
                      notification
                    )
                  }
                />

              )
            )}

          </div>

          {filteredNotifications.length ===
            0 && (

            <div className="p-12 text-center">

              <Bell
                size={42}
                className="mx-auto mb-3 text-slate-300"
              />

              <h3 className="font-semibold text-slate-800">
                No notifications found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try another search or filter.
              </p>

            </div>

          )}

        </section>

      </div>

      {/* =====================================
          DETAILS MODAL
      ===================================== */}

      {selectedNotification && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() =>
            setSelectedNotification(
              null
            )
          }
        >

          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-slate-200 p-6">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${getNotificationIconClass(
                    selectedNotification.type
                  )}`}
                >

                  {getNotificationIcon(
                    selectedNotification.type
                  )}

                </div>

                <div>

                  <p className="text-sm font-semibold text-blue-600">
                    Notification Details
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {
                      selectedNotification.title
                    }
                  </h2>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedNotification(
                    null
                  )
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >

                <X size={21} />

              </button>

            </div>

            {/* BODY */}

            <div className="space-y-5 p-6">

              <div className="rounded-xl bg-slate-50 p-5">

                <p className="text-sm leading-6 text-slate-700">
                  {
                    selectedNotification.message
                  }
                </p>

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <DetailBox
                  label="Notification Type"
                  value={
                    selectedNotification.type
                  }
                />

                <DetailBox
                  label="Priority"
                  value={
                    selectedNotification.priority
                  }
                />

                <DetailBox
                  label="Date"
                  value={
                    selectedNotification.date
                  }
                />

                <DetailBox
                  label="Time"
                  value={
                    selectedNotification.time
                  }
                />

                <DetailBox
                  label="Read Status"
                  value={
                    selectedNotification.read
                      ? "Read"
                      : "Unread"
                  }
                />

                <DetailBox
                  label="Notification ID"
                  value={
                    selectedNotification.id
                  }
                />

              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

                {!selectedNotification.read && (

                  <button
                    type="button"
                    onClick={() => {
                      markAsRead(
                        selectedNotification.id
                      );

                      setSelectedNotification(
                        (current) =>
                          current
                            ? {
                                ...current,
                                read: true,
                              }
                            : null
                      );
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >

                    <Check size={18} />

                    Mark as read

                  </button>

                )}

                <button
                  type="button"
                  onClick={() =>
                    deleteNotification(
                      selectedNotification.id
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
                >

                  <Trash2 size={18} />

                  Delete

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedNotification(
                      null
                    )
                  }
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >

                  Close

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================================
   NOTIFICATION CARD
========================================= */

function NotificationCard({
  notification,
  onRead,
  onDelete,
  onView,
}: {
  notification: NotificationItem;
  onRead: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  return (
    <div
      className={`p-5 transition hover:bg-slate-50 ${
        notification.read
          ? "bg-white"
          : "bg-blue-50/40"
      }`}
    >

      <div className="flex flex-col gap-4 md:flex-row md:items-start">

        {/* ICON */}

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getNotificationIconClass(
            notification.type
          )}`}
        >

          {getNotificationIcon(
            notification.type
          )}

        </div>

        {/* CONTENT */}

        <div className="min-w-0 flex-1">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">

            <button
              type="button"
              onClick={onView}
              className="text-left"
            >

              <div className="flex flex-wrap items-center gap-2">

                <h3
                  className={`text-base ${
                    notification.read
                      ? "font-semibold text-slate-800"
                      : "font-bold text-slate-900"
                  }`}
                >

                  {
                    notification.title
                  }

                </h3>

                {!notification.read && (

                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />

                )}

              </div>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">

                {
                  notification.message
                }

              </p>

            </button>

            <div className="flex shrink-0 items-center gap-2">

              <PriorityBadge
                priority={
                  notification.priority
                }
              />

              <span className="text-xs text-slate-400">

                {
                  notification.date
                }{" "}
                •{" "}
                {
                  notification.time
                }

              </span>

            </div>

          </div>

          {/* FOOTER */}

          <div className="mt-4 flex flex-wrap items-center gap-2">

            <TypeBadge
              type={
                notification.type
              }
            />

            <button
              type="button"
              onClick={onView}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >

              <EyeIcon />

              View

            </button>

            {!notification.read && (

              <button
                type="button"
                onClick={onRead}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              >

                <Check size={14} />

                Mark as read

              </button>

            )}

            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >

              <Trash2 size={14} />

              Delete

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================
   NOTIFICATION ICON
========================================= */

function getNotificationIcon(
  type: NotificationType
): ReactNode {
  switch (type) {
    case "Application":
      return (
        <ClipboardList
          size={21}
        />
      );

    case "Appointment":
      return (
        <CalendarDays
          size={21}
        />
      );

    case "Inspector":
      return (
        <UserCheck size={21} />
      );

    case "Certificate":
      return (
        <FileCheck2
          size={21}
        />
      );

    case "Warning":
      return (
        <AlertTriangle
          size={21}
        />
      );

    case "System":
      return (
        <CheckCircle2
          size={21}
        />
      );

    default:
      return (
        <Info size={21} />
      );
  }
}

/* =========================================
   ICON COLOR
========================================= */

function getNotificationIconClass(
  type: NotificationType
): string {
  switch (type) {
    case "Application":
      return "bg-blue-100 text-blue-600";

    case "Appointment":
      return "bg-purple-100 text-purple-600";

    case "Inspector":
      return "bg-cyan-100 text-cyan-600";

    case "Certificate":
      return "bg-green-100 text-green-600";

    case "Warning":
      return "bg-red-100 text-red-600";

    case "System":
      return "bg-emerald-100 text-emerald-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

/* =========================================
   STAT CARD
========================================= */

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >

        {icon}

      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================
   FILTER BUTTON
========================================= */

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >

      {label}

    </button>
  );
}

/* =========================================
   TYPE BADGE
========================================= */

function TypeBadge({
  type,
}: {
  type: NotificationType;
}) {
  const styles: Record<
    NotificationType,
    string
  > = {
    Application:
      "bg-blue-50 text-blue-700",

    Appointment:
      "bg-purple-50 text-purple-700",

    Inspector:
      "bg-cyan-50 text-cyan-700",

    Certificate:
      "bg-green-50 text-green-700",

    System:
      "bg-slate-100 text-slate-700",

    Warning:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${styles[type]}`}
    >

      {type}

    </span>
  );
}

/* =========================================
   PRIORITY BADGE
========================================= */

function PriorityBadge({
  priority,
}: {
  priority: NotificationPriority;
}) {
  const styles: Record<
    NotificationPriority,
    string
  > = {
    High:
      "bg-red-100 text-red-700",

    Medium:
      "bg-orange-100 text-orange-700",

    Low:
      "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${styles[priority]}`}
    >

      {priority}

    </span>
  );
}

/* =========================================
   DETAIL BOX
========================================= */

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}

/* =========================================
   EYE ICON
========================================= */

function EyeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />

      <circle
        cx="12"
        cy="12"
        r="3"
      />

    </svg>
  );
}

export default AdminNotifications;