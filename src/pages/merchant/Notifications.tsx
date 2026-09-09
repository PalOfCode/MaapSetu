import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CalendarDays,
  Clock,
  FileCheck2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

type NotificationType =
  | "Application"
  | "Appointment"
  | "Certificate"
  | "System"
  | "Warning";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date: string;
  time: string;
  read: boolean;
  applicationId?: string;
}

interface ApiApplication {
  applicationId?: unknown;
  application_number?: unknown;
  id?: unknown;
  status?: unknown;
  appointmentDate?: unknown;
  appointment_date?: unknown;
  appointmentTime?: unknown;
  appointment_time?: unknown;
  instrumentType?: unknown;
  instrument_type?: unknown;
}

interface ApplicationsResponse {
  success?: boolean;
  applications?: ApiApplication[];
  message?: string;
}

function asString(value: unknown): string {
  return String(value ?? "").trim();
}

function formatDate(value: string): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string): string {
  if (!value) return "";

  const parts = value.split(":");
  if (parts.length < 2) return value;

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return value;
  }

  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getApplicationId(item: ApiApplication): string {
  return asString(
    item.applicationId ??
      item.application_number ??
      item.id
  );
}

function getAppointmentDate(item: ApiApplication): string {
  return asString(
    item.appointmentDate ??
      item.appointment_date
  );
}

function getAppointmentTime(item: ApiApplication): string {
  return asString(
    item.appointmentTime ??
      item.appointment_time
  );
}

function getInstrumentType(item: ApiApplication): string {
  return asString(
    item.instrumentType ??
      item.instrument_type ??
      "Instrument"
  );
}

function buildNotifications(
  applications: ApiApplication[]
): NotificationItem[] {
  const now = new Date();

  return applications
    .flatMap((item) => {
      const id = getApplicationId(item);
      const status = asString(item.status);
      const appointmentDate = getAppointmentDate(item);
      const appointmentTime = getAppointmentTime(item);
      const instrument = getInstrumentType(item);

      if (!id) return [];

      const items: NotificationItem[] = [];

      if (
        status === "Scheduled" &&
        appointmentDate
      ) {
        const appointmentDateTime = new Date(
          `${appointmentDate}T${
            appointmentTime || "00:00"
          }`
        );

        const dateText = formatDate(
          appointmentDate
        );
        const timeText = formatTime(
          appointmentTime
        );

        const future =
          Number.isNaN(
            appointmentDateTime.getTime()
          ) || appointmentDateTime >= now;

        items.push({
          id: `appointment-${id}`,
          title: future
            ? "Verification scheduled"
            : "Verification appointment",
          message: future
            ? `Your ${instrument} verification is scheduled for ${dateText}${
                timeText ? ` at ${timeText}` : ""
              }.`
            : `Your ${instrument} verification appointment was scheduled for ${dateText}.`,
          type: "Appointment",
          date: dateText,
          time: timeText,
          read: false,
          applicationId: id,
        });
      }

      if (status === "Completed") {
        items.push({
          id: `completed-${id}`,
          title: "Verification completed",
          message: `Your ${instrument} verification for application ${id} has been completed.`,
          type: "Application",
          date: "",
          time: "",
          read: false,
          applicationId: id,
        });
      }

      if (status === "Rejected") {
        items.push({
          id: `rejected-${id}`,
          title: "Application rejected",
          message: `Application ${id} for ${instrument} has been rejected.`,
          type: "Warning",
          date: "",
          time: "",
          read: false,
          applicationId: id,
        });
      }

      if (
        status === "Pending" ||
        status === "Submitted" ||
        status === "Under Review"
      ) {
        items.push({
          id: `application-${id}`,
          title: "Application update",
          message: `Application ${id} is currently ${status.toLowerCase()}.`,
          type: "Application",
          date: "",
          time: "",
          read: false,
          applicationId: id,
        });
      }

      return items;
    })
    .slice(0, 30);
}

function NotificationIcon({
  type,
}: {
  type: NotificationType;
}) {
  if (type === "Appointment") {
    return <CalendarDays size={20} />;
  }

  if (type === "Certificate") {
    return <FileCheck2 size={20} />;
  }

  if (type === "Warning") {
    return <AlertCircle size={20} />;
  }

  if (type === "System") {
    return <Clock size={20} />;
  }

  return <Bell size={20} />;
}

export default function MerchantNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<"All" | NotificationType>("All");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadNotifications = async () => {
    setLoading(true);
    setErrorMessage("");

    const token =
      localStorage.getItem("almveToken");

    if (!token) {
      setLoading(false);
      setErrorMessage(
        "Authentication token not found. Please login again."
      );
      return;
    }

    try {
      const response = await fetch(
        "https://maapsetu-w1sf.onrender.com/api/applications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | ApplicationsResponse
          | null;

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            `Unable to load notifications (${response.status}).`
        );
      }

      const generated =
        buildNotifications(
          Array.isArray(data.applications)
            ? data.applications
            : []
        );

      const storedRead =
        localStorage.getItem(
          "almveMerchantReadNotifications"
        );

      let readIds: string[] = [];

      try {
        const parsed = storedRead
          ? JSON.parse(storedRead)
          : [];
        if (Array.isArray(parsed)) {
          readIds = parsed.map(String);
        }
      } catch {
        readIds = [];
      }

      setNotifications(
        generated.map((item) => ({
          ...item,
          read: readIds.includes(item.id),
        }))
      );
    } catch (error) {
      console.error(
        "Unable to load merchant notifications:",
        error
      );

      setNotifications([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();

    const handleNotificationUpdate = () => {
      void loadNotifications();
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
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, read: true }
          : item
      )
    );

    const stored =
      localStorage.getItem(
        "almveMerchantReadNotifications"
      );

    let ids: string[] = [];

    try {
      const parsed = stored
        ? JSON.parse(stored)
        : [];
      if (Array.isArray(parsed)) {
        ids = parsed.map(String);
      }
    } catch {
      ids = [];
    }

    if (!ids.includes(id)) {
      ids.push(id);
    }

    localStorage.setItem(
      "almveMerchantReadNotifications",
      JSON.stringify(ids)
    );

    window.dispatchEvent(
      new Event("almveNotificationsUpdated")
    );
  };

  const markAllAsRead = () => {
    const ids = notifications.map(
      (item) => item.id
    );

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read: true,
      }))
    );

    localStorage.setItem(
      "almveMerchantReadNotifications",
      JSON.stringify(ids)
    );

    window.dispatchEvent(
      new Event("almveNotificationsUpdated")
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const filteredNotifications = useMemo(() => {
    const text = search
      .toLowerCase()
      .trim();

    return notifications.filter((item) => {
      const matchesSearch = [
        item.title,
        item.message,
        item.type,
        item.applicationId ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(text);

      const matchesFilter =
        filter === "All" ||
        item.type === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [notifications, search, filter]);

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f8f7] text-slate-900">
      <header className="fixed inset-x-0 top-0 z-50 h-[78px] border-b border-slate-200 bg-white">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <button
            type="button"
            onClick={() =>
              navigate("/merchant/dashboard")
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-white">
              <Bell size={23} />
            </div>

            <div className="text-left">
              <p className="text-lg font-bold text-green-800">
                ALMVE
              </p>
              <p className="text-xs text-slate-500">
                Merchant Portal
              </p>
            </div>
          </button>

          <div className="hidden text-center md:block">
            <h1 className="text-xl font-bold lg:text-2xl">
              Notifications
            </h1>
            <p className="text-xs text-slate-500">
              Merchant Notification Center
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/merchant/dashboard")
            }
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">
              Dashboard
            </span>
          </button>
        </div>
      </header>

      <main className="min-h-screen pt-[78px] lg:pl-[258px]">
        <div className="p-4 md:p-6 lg:p-7">
          <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700">
                  <Bell size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Notification Center
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {unreadCount} unread notification
                    {unreadCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void loadNotifications()
                  }
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Mark all as read
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search notifications..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "All",
                    "Application",
                    "Appointment",
                    "Certificate",
                    "Warning",
                    "System",
                  ] as const
                ).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setFilter(item)
                    }
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      filter === item
                        ? "bg-green-700 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {errorMessage && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw
                  size={30}
                  className="mx-auto mb-3 animate-spin text-green-700"
                />
                <p className="font-semibold text-slate-700">
                  Loading notifications...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell
                  size={44}
                  className="mx-auto mb-3 text-slate-300"
                />
                <h3 className="font-semibold text-slate-800">
                  No notifications found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  There are no notifications matching
                  your current search or filter.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredNotifications.map(
                  (notification) => (
                    <article
                      key={notification.id}
                      className={`flex gap-4 p-5 transition hover:bg-slate-50 ${
                        notification.read
                          ? "bg-white"
                          : "bg-green-50/40"
                      }`}
                    >
                      <div
                        className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          notification.type ===
                          "Warning"
                            ? "bg-red-50 text-red-600"
                            : notification.type ===
                              "Appointment"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        <NotificationIcon
                          type={notification.type}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-slate-900">
                                {notification.title}
                              </h3>

                              {!notification.read && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                  NEW
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {notification.message}
                            </p>
                          </div>

                          <span className="shrink-0 text-xs text-slate-400">
                            {notification.date}
                            {notification.time
                              ? ` • ${notification.time}`
                              : ""}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            {notification.type}
                          </span>

                          {notification.applicationId && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/merchant/applications/${notification.applicationId}`
                                )
                              }
                              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-50"
                            >
                              View Application
                            </button>
                          )}

                          {!notification.read && (
                            <button
                              type="button"
                              onClick={() =>
                                markAsRead(
                                  notification.id
                                )
                              }
                              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              Mark as read
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              deleteNotification(
                                notification.id
                              )
                            }
                            title="Remove notification"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
