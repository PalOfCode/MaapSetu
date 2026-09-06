import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  MapPin,
  PlayCircle,
  Search,
  User,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type AppointmentStatus =
  | "Scheduled"
  | "Completed"
  | "Cancelled";

type FilterType =
  | "All"
  | AppointmentStatus;

interface Appointment {
  scheduleId: string;
  applicationId: string;

  officerId: string;
  GATCId: string;

  scheduledDate: string;
  scheduledTime: string;

  location: string;

  status: AppointmentStatus;

  assignedBy: string;

  instrumentId: string;
  instrumentType: string;

  applicant: string;

  createdAt: string;
}

/* =========================================================
   DATA SOURCE
   Real appointments are loaded from the ALMVE backend API.
========================================================= */

const API_BASE_URL = "http://localhost:5000";

interface InspectorApplicationsResponse {
  success: boolean;
  message?: string;
  profile?: {
    name?: string;
    employeeId?: string;
    region?: string;
  };
  applications?: Array<Record<string, unknown>>;
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeStatus(
  value: unknown
): AppointmentStatus {
  switch (String(value ?? "").trim()) {
    case "Completed":
      return "Completed";

    case "Cancelled":
      return "Cancelled";

    case "Scheduled":
    default:
      return "Scheduled";
  }
}

function normalizeAppointment(
  item: Record<string, unknown>,
  index: number
): Appointment {
  const applicationId = String(
    item.applicationId ??
      item.id ??
      "Not Available"
  );

  const applicationDbId = String(
    item.applicationDbId ??
      ""
  );

  const scheduleId = String(
    item.scheduleId ??
      (applicationDbId
        ? `SCH-${applicationDbId.padStart(5, "0")}`
        : `SCH-${String(index + 1).padStart(5, "0")}`)
  );

  return {
    scheduleId,

    applicationId,

    officerId: String(
      item.officerId ??
        item.inspector ??
        item.inspector_name ??
        ""
    ),

    GATCId: String(
      item.GATCId ??
        item.gatcId ??
        item.gatc_id ??
        ""
    ),

    scheduledDate: String(
      item.scheduledDate ??
        item.appointmentDate ??
        item.appointment_date ??
        "-"
    ),

    scheduledTime: String(
      item.scheduledTime ??
        item.appointmentTime ??
        item.appointment_time ??
        "-"
    ),

    location: String(
      item.location ??
        item.instrument_location ??
        "Not Provided"
    ),

    status: normalizeStatus(
      item.status
    ),

    assignedBy: String(
      item.assignedBy ??
        "Admin"
    ),

    instrumentId: String(
      item.instrumentId ??
        item.instrument_code ??
        item.instrument ??
        "Not Available"
    ),

    instrumentType: String(
      item.instrumentType ??
        item.instrument_type ??
        item.instrument ??
        "Instrument"
    ),

    applicant: String(
      item.applicant ??
        item.merchant ??
        item.business_name ??
        "Current Merchant"
    ),

    createdAt: String(
      item.createdAt ??
        item.created_at ??
        new Date().toISOString()
    ),
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function InspectorAppointments() {
  const navigate =
    useNavigate();

  const [
    appointmentList,
    setAppointmentList,
  ] = useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState<FilterType>(
    "All"
  );

  /* =======================================================
     LOAD REAL INSPECTOR APPLICATIONS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadAppointments = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const token = localStorage.getItem("almveToken");

        if (!token) {
          throw new Error(
            "Authentication token not found. Please login again."
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/api/inspector/applications`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let data: InspectorApplicationsResponse;

        try {
          data =
            (await response.json()) as InspectorApplicationsResponse;
        } catch {
          throw new Error(
            `Server returned an invalid response (${response.status}).`
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              `Unable to load appointments (${response.status}).`
          );
        }

        const apiAppointments =
          Array.isArray(data.applications)
            ? data.applications
            : [];

        const normalized =
          apiAppointments.map(
            (item, index) =>
              normalizeAppointment(
                item,
                index
              )
          );

        if (!cancelled) {
          setAppointmentList(normalized);
        }
      } catch (error) {
        console.error(
          "Unable to load inspector applications:",
          error
        );

        if (!cancelled) {
          setAppointmentList([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load inspector appointments."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadAppointments();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     UNIQUE APPOINTMENTS
  ======================================================= */

  const uniqueAppointments =
    useMemo(() => {
      const map =
        new Map<
          string,
          Appointment
        >();

      appointmentList.forEach(
        (appointment) => {
          map.set(
            appointment.scheduleId,
            appointment
          );
        }
      );

      return Array.from(
        map.values()
      );
    }, [appointmentList]);

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */

  const filteredAppointments =
    useMemo(() => {
      const text =
        search
          .trim()
          .toLowerCase();

      return uniqueAppointments.filter(
        (appointment) => {
          const searchableText = [
            appointment.scheduleId,
            appointment.applicationId,
            appointment.applicant,
            appointment.officerId,
            appointment.GATCId,
            appointment.instrumentId,
            appointment.instrumentType,
            appointment.location,
            appointment.assignedBy,
            appointment.scheduledDate,
            appointment.scheduledTime,
            appointment.status,
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            searchableText.includes(
              text
            );

          const matchesFilter =
            filter === "All" ||
            appointment.status ===
              filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      uniqueAppointments,
      search,
      filter,
    ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalAppointments =
    uniqueAppointments.length;

  const scheduledCount =
    uniqueAppointments.filter(
      (appointment) =>
        appointment.status ===
        "Scheduled"
    ).length;

  const completedCount =
    uniqueAppointments.filter(
      (appointment) =>
        appointment.status ===
        "Completed"
    ).length;

  const cancelledCount =
    uniqueAppointments.filter(
      (appointment) =>
        appointment.status ===
        "Cancelled"
    ).length;

  /*
   * For the dashboard section,
   * show scheduled appointments.
   */

  const scheduledAppointments =
    uniqueAppointments.filter(
      (appointment) =>
        appointment.status ===
        "Scheduled"
    );

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const openApplication = (
    applicationId: string
  ) => {
    if (
      !applicationId ||
      applicationId ===
        "Not Available"
    ) {
      return;
    }

    navigate(
      `/inspector/applications/${encodeURIComponent(
        applicationId
      )}`
    );
  };

  /* =======================================================
     START VERIFICATION
  ======================================================= */

  const startVerification = (
    appointment: Appointment
  ) => {
    if (
      !appointment.applicationId
    ) {
      return;
    }

    navigate(
      `/inspector/mpe-evaluation?applicationId=${encodeURIComponent(
        appointment.applicationId
      )}&scheduleId=${encodeURIComponent(
        appointment.scheduleId
      )}&instrumentId=${encodeURIComponent(
        appointment.instrumentId
      )}`
    );
  };

  /* =======================================================
     BACK
  ======================================================= */

  const goBack = () => {
    navigate(
      "/inspector/dashboard"
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={goBack}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
        >

          <ArrowLeft size={18} />

          Back to Inspector Dashboard

        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7">

          <p className="text-sm font-semibold text-emerald-700">
            Inspector Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
            Verification Appointments
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            Manage assigned verification schedules and field inspection visits.
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Refresh Appointments
          </button>

        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Appointments"
            value={String(
              totalAppointments
            )}
            icon={
              <CalendarDays
                size={22}
              />
            }
            iconClass="bg-emerald-100 text-emerald-700"
          />

          <StatCard
            title="Scheduled"
            value={String(
              scheduledCount
            )}
            icon={
              <Clock size={22} />
            }
            iconClass="bg-blue-100 text-blue-700"
          />

          <StatCard
            title="Completed"
            value={String(
              completedCount
            )}
            icon={
              <CheckCircle2
                size={22}
              />
            }
            iconClass="bg-green-100 text-green-700"
          />

          <StatCard
            title="Cancelled"
            value={String(
              cancelledCount
            )}
            icon={
              <CalendarDays
                size={22}
              />
            }
            iconClass="bg-red-100 text-red-600"
          />

        </div>

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            {/* SEARCH */}

            <div className="relative w-full xl:max-w-xl">

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
                placeholder="Search schedule, application, business, instrument..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              />

            </div>

            {/* FILTER */}

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
                label="Scheduled"
                active={
                  filter ===
                  "Scheduled"
                }
                onClick={() =>
                  setFilter(
                    "Scheduled"
                  )
                }
              />

              <FilterButton
                label="Completed"
                active={
                  filter ===
                  "Completed"
                }
                onClick={() =>
                  setFilter(
                    "Completed"
                  )
                }
              />

              <FilterButton
                label="Cancelled"
                active={
                  filter ===
                  "Cancelled"
                }
                onClick={() =>
                  setFilter(
                    "Cancelled"
                  )
                }
              />

            </div>

          </div>

        </section>

        {loadError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-red-700">
                  Unable to load appointments
                </p>
                <p className="mt-1 text-sm text-red-600">
                  {loadError}
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading && !loadError && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-700" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              Loading assigned appointments...
            </p>
          </div>
        )}

        {/* =================================================
            ASSIGNED SCHEDULES
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">

                  <ClipboardList
                    size={22}
                  />

                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Assigned Verification Schedules
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Appointments assigned for field verification.
                  </p>

                </div>

              </div>

            </div>

            <div className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">

              {
                scheduledAppointments.length
              }{" "}
              scheduled

            </div>

          </div>

          {!loading && scheduledAppointments.length >
          0 ? (

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              {scheduledAppointments.map(
                (
                  appointment
                ) => (

                  <AppointmentCard
                    key={
                      appointment.scheduleId
                    }
                    appointment={
                      appointment
                    }
                    onStart={() =>
                      startVerification(
                        appointment
                      )
                    }
                    onView={() =>
                      openApplication(
                        appointment.applicationId
                      )
                    }
                  />

                )
              )}

            </div>

          ) : (

            <div className="rounded-xl bg-slate-50 px-6 py-12 text-center">

              <CalendarDays
                size={40}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="font-semibold text-slate-700">
                No scheduled appointments
              </p>

              <p className="mt-1 text-sm text-slate-500">
                New assignments will appear here.
              </p>

            </div>

          )}

        </section>

        {/* =================================================
            ALL SCHEDULES TABLE
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-xl font-bold text-slate-900">
              All Verification Schedules
            </h2>

            <p className="mt-1 text-sm text-slate-500">

              {
                filteredAppointments.length
              }{" "}
              schedules found

            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1450px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <TableHead>
                    Schedule ID
                  </TableHead>

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
                    Officer
                  </TableHead>

                  <TableHead>
                    GATC / LMO
                  </TableHead>

                  <TableHead>
                    Date
                  </TableHead>

                  <TableHead>
                    Time
                  </TableHead>

                  <TableHead>
                    Location
                  </TableHead>

                  <TableHead>
                    Assigned By
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

                {filteredAppointments.length >
                0 ? (

                  filteredAppointments.map(
                    (
                      appointment
                    ) => (

                      <tr
                        key={
                          appointment.scheduleId
                        }
                        className="transition hover:bg-emerald-50/30"
                      >

                        {/* Schedule ID */}

                        <TableCell>

                          <span className="font-bold text-emerald-700">
                            {
                              appointment.scheduleId
                            }
                          </span>

                        </TableCell>

                        {/* Application ID */}

                        <TableCell>

                          <button
                            type="button"
                            onClick={() =>
                              openApplication(
                                appointment.applicationId
                              )
                            }
                            className="font-semibold text-emerald-700 hover:underline"
                          >

                            {
                              appointment.applicationId
                            }

                          </button>

                        </TableCell>

                        {/* Applicant */}

                        <TableCell>

                          <div className="flex items-center gap-2">

                            <User
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="text-sm font-semibold text-slate-700">

                              {
                                appointment.applicant
                              }

                            </span>

                          </div>

                        </TableCell>

                        {/* Instrument */}

                        <TableCell>

                          <p className="text-sm font-semibold text-slate-700">
                            {
                              appointment.instrumentId
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              appointment.instrumentType
                            }
                          </p>

                        </TableCell>

                        {/* Officer */}

                        <TableCell>

                          <span className="text-sm text-slate-600">

                            {
                              appointment.officerId ||
                              "Not Assigned"
                            }

                          </span>

                        </TableCell>

                        {/* GATC */}

                        <TableCell>

                          <div className="flex items-center gap-2">

                            <Building2
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="text-sm text-slate-600">

                              {
                                appointment.GATCId ||
                                "Not Assigned"
                              }

                            </span>

                          </div>

                        </TableCell>

                        {/* Date */}

                        <TableCell>

                          <span className="text-sm text-slate-600">

                            {
                              appointment.scheduledDate
                            }

                          </span>

                        </TableCell>

                        {/* Time */}

                        <TableCell>

                          <div className="flex items-center gap-2">

                            <Clock
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="text-sm text-slate-600">

                              {
                                appointment.scheduledTime
                              }

                            </span>

                          </div>

                        </TableCell>

                        {/* Location */}

                        <TableCell>

                          <div className="flex items-center gap-2">

                            <MapPin
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="text-sm text-slate-600">

                              {
                                appointment.location
                              }

                            </span>

                          </div>

                        </TableCell>

                        {/* Assigned By */}

                        <TableCell>

                          <span className="text-sm text-slate-600">

                            {
                              appointment.assignedBy
                            }

                          </span>

                        </TableCell>

                        {/* Status */}

                        <TableCell>

                          <StatusBadge
                            status={
                              appointment.status
                            }
                          />

                        </TableCell>

                        {/* Action */}

                        <TableCell>

                          <div className="flex items-center gap-2">

                            {appointment.status ===
                              "Scheduled" && (

                              <button
                                type="button"
                                onClick={() =>
                                  startVerification(
                                    appointment
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                              >

                                <PlayCircle
                                  size={16}
                                />

                                Start

                              </button>

                            )}

                            <button
                              type="button"
                              onClick={() =>
                                openApplication(
                                  appointment.applicationId
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                            >

                              <Eye
                                size={16}
                              />

                              View

                            </button>

                          </div>

                        </TableCell>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={12}
                      className="px-6 py-14 text-center"
                    >

                      <Search
                        size={40}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <h3 className="font-semibold text-slate-800">
                        No appointments found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try another search or filter.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>

    </div>
  );
}

/* =========================================================
   APPOINTMENT CARD
========================================================= */

function AppointmentCard({
  appointment,
  onStart,
  onView,
}: {
  appointment: Appointment;
  onStart: () => void;
  onView: () => void;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">

      <div className="flex items-start justify-between gap-4">

        <div>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Scheduled
          </span>

          <p className="mt-3 text-xs font-semibold text-slate-400">
            {
              appointment.scheduleId
            }
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {
              appointment.instrumentType
            }
          </h3>

          <p className="mt-1 text-sm font-semibold text-emerald-700">
            {
              appointment.applicationId
            }
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {
              appointment.applicant
            }
          </p>

        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">

          <CalendarDays
            size={22}
          />

        </div>

      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

        <AppointmentDetail
          icon={
            <CalendarDays
              size={17}
            />
          }
          label="Scheduled Date"
          value={
            appointment.scheduledDate
          }
        />

        <AppointmentDetail
          icon={
            <Clock
              size={17}
            />
          }
          label="Scheduled Time"
          value={
            appointment.scheduledTime
          }
        />

        <AppointmentDetail
          icon={
            <MapPin
              size={17}
            />
          }
          label="Location"
          value={
            appointment.location
          }
        />

        <AppointmentDetail
          icon={
            <User size={17} />
          }
          label="Officer"
          value={
            appointment.officerId ||
            "Not Assigned"
          }
        />

        <AppointmentDetail
          icon={
            <Building2
              size={17}
            />
          }
          label="GATC / LMO"
          value={
            appointment.GATCId ||
            "Not Assigned"
          }
        />

        <AppointmentDetail
          icon={
            <ClipboardList
              size={17}
            />
          }
          label="Assigned By"
          value={
            appointment.assignedBy
          }
        />

      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">

        <button
          type="button"
          onClick={onStart}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >

          <PlayCircle
            size={17}
          />

          Start Verification

        </button>

        <button
          type="button"
          onClick={onView}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >

          <Eye size={17} />

          View

        </button>

      </div>

    </div>
  );
}

/* =========================================================
   APPOINTMENT DETAIL
========================================================= */

function AppointmentDetail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="mt-0.5 text-emerald-700">
        {icon}
      </div>

      <div>

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-700">
          {value}
        </p>

      </div>

    </div>
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
    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

/* =========================================================
   TABLE CELL
========================================================= */

function TableCell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <td className="whitespace-nowrap px-5 py-4">
      {children}
    </td>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

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

/* =========================================================
   FILTER BUTTON
========================================================= */

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
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
        active
          ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
          : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
      }`}
    >

      {label}

    </button>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  const styles: Record<
    AppointmentStatus,
    string
  > = {
    Scheduled:
      "bg-blue-100 text-blue-700",

    Completed:
      "bg-green-100 text-green-700",

    Cancelled:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >

      {status}

    </span>
  );
}

export default InspectorAppointments;