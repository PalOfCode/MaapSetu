import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle,
  Clock,
  ClipboardList,
  Eye,
  MapPin,
  Search,
  User,
} from "lucide-react";

/* =========================================
   TYPES
========================================= */

type AppointmentStatus =
  | "Scheduled"
  | "Completed"
  | "Cancelled";

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

  createdAt: string;
}

type FilterType =
  | "All"
  | AppointmentStatus;

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
}

/* =========================================
   DEFAULT APPOINTMENTS
========================================= */

const defaultAppointments: Appointment[] = [
  {
    scheduleId: "SCH-00041",
    applicationId: "APP-001",

    officerId: "OFF-001",
    GATCId: "GATC-001",

    scheduledDate: "28 Aug 2026",
    scheduledTime: "10:30 AM",

    location: "Kolkata",

    status: "Scheduled",

    assignedBy: "Admin",

    instrumentId: "INS-001",
    instrumentType:
      "Electronic Weighing Scale",

    createdAt:
      "2026-08-20T10:00:00.000Z",
  },

  {
    scheduleId: "SCH-00042",
    applicationId: "APP-003",

    officerId: "OFF-002",
    GATCId: "GATC-002",

    scheduledDate: "30 Aug 2026",
    scheduledTime: "11:00 AM",

    location: "Durgapur",

    status: "Scheduled",

    assignedBy: "Admin",

    instrumentId: "INS-003",
    instrumentType:
      "Digital Weighing Machine",

    createdAt:
      "2026-08-22T11:00:00.000Z",
  },

  {
    scheduleId: "SCH-00043",
    applicationId: "APP-004",

    officerId: "OFF-003",
    GATCId: "GATC-001",

    scheduledDate: "25 Aug 2026",
    scheduledTime: "02:00 PM",

    location: "Asansol",

    status: "Completed",

    assignedBy: "Admin",

    instrumentId: "INS-004",
    instrumentType:
      "Counter Weighing Scale",

    createdAt:
      "2026-08-21T12:00:00.000Z",
  },

  {
    scheduleId: "SCH-00044",
    applicationId: "APP-005",

    officerId: "OFF-004",
    GATCId: "GATC-003",

    scheduledDate: "24 Aug 2026",
    scheduledTime: "12:30 PM",

    location: "Kolkata",

    status: "Cancelled",

    assignedBy: "Admin",

    instrumentId: "INS-005",
    instrumentType:
      "Electronic Weighing Scale",

    createdAt:
      "2026-08-23T09:00:00.000Z",
  },
];

/* =========================================
   COMPONENT
========================================= */

function Appointments() {
  const navigate =
    useNavigate();

  const [
    appointmentList,
    setAppointmentList,
  ] = useState<Appointment[]>(
    defaultAppointments
  );

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

  /* =========================================
     LOAD SAVED SCHEDULES
  ========================================= */

  useEffect(() => {
    try {
      const savedData =
        localStorage.getItem(
          "merchantSchedules"
        );

      if (!savedData) {
        return;
      }

      const parsed: unknown =
        JSON.parse(savedData);

      if (!Array.isArray(parsed)) {
        return;
      }

      const savedSchedules: Appointment[] =
        parsed.map(
          (
            item: Partial<Appointment>,
            index: number
          ) => {
            const scheduleId =
              item.scheduleId ||
              `SCH-${String(
                index + 1
              ).padStart(5, "0")}`;

            return {
              scheduleId,

              applicationId:
                item.applicationId ||
                "Not Available",

              officerId:
                item.officerId ||
                "",

              GATCId:
                item.GATCId ||
                "",

              scheduledDate:
                item.scheduledDate ||
                "-",

              scheduledTime:
                item.scheduledTime ||
                "-",

              location:
                item.location ||
                "Not Provided",

              status:
                item.status ||
                "Scheduled",

              assignedBy:
                item.assignedBy ||
                "Admin",

              instrumentId:
                item.instrumentId ||
                "Not Available",

              instrumentType:
                item.instrumentType ||
                "Instrument",

              createdAt:
                item.createdAt ||
                new Date().toISOString(),
            };
          }
        );

      setAppointmentList([
        ...defaultAppointments,
        ...savedSchedules,
      ]);
    } catch (error) {
      console.error(
        "Unable to load schedules:",
        error
      );
    }
  }, []);

  /* =========================================
     REMOVE DUPLICATES
  ========================================= */

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

  /* =========================================
     SEARCH + FILTER
  ========================================= */

  const filteredAppointments =
    useMemo(() => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      return uniqueAppointments.filter(
        (appointment) => {
          const searchableText =
            [
              appointment.scheduleId,
              appointment.applicationId,
              appointment.officerId,
              appointment.GATCId,
              appointment.location,
              appointment.instrumentId,
              appointment.instrumentType,
              appointment.assignedBy,
              appointment.status,
              appointment.scheduledDate,
              appointment.scheduledTime,
            ]
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            searchableText.includes(
              searchText
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

  /* =========================================
     STATISTICS
  ========================================= */

  const scheduledCount =
    uniqueAppointments.filter(
      (item) =>
        item.status ===
        "Scheduled"
    ).length;

  const completedCount =
    uniqueAppointments.filter(
      (item) =>
        item.status ===
        "Completed"
    ).length;

  const cancelledCount =
    uniqueAppointments.filter(
      (item) =>
        item.status ===
        "Cancelled"
    ).length;

  /* =========================================
     UPCOMING
  ========================================= */

  const upcomingAppointments =
    uniqueAppointments.filter(
      (appointment) =>
        appointment.status ===
        "Scheduled"
    );

  /* =========================================
     VIEW APPLICATION
  ========================================= */

  const handleViewApplication = (
    applicationId: string
  ) => {
    if (!applicationId) {
      return;
    }

    navigate(
      `/merchant/applications/${applicationId}`
    );
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="mb-8">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/merchant/applications"
              )
            }
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-green-700 transition hover:text-green-800"
          >

            <ArrowLeft
              size={18}
            />

            Back to Applications

          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold text-green-700">
                Merchant Portal
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Appointments
              </h1>

              <p className="mt-2 text-slate-500">
                View and track your verification schedules.
              </p>

            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

              <p className="text-xs text-slate-400">
                Total Appointments
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {
                  uniqueAppointments.length
                }
              </p>

            </div>

          </div>

        </div>

        {/* =====================================
            STATISTICS
        ===================================== */}

        <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-3">

          <StatCard
            title="Scheduled"
            value={String(
              scheduledCount
            )}
            icon={
              <CalendarDays
                size={22}
              />
            }
            iconClass="bg-green-100 text-green-700"
          />

          <StatCard
            title="Completed"
            value={String(
              completedCount
            )}
            icon={
              <CheckCircle
                size={22}
              />
            }
            iconClass="bg-emerald-100 text-emerald-700"
          />

          <StatCard
            title="Cancelled"
            value={String(
              cancelledCount
            )}
            icon={
              <AlertCircle
                size={22}
              />
            }
            iconClass="bg-red-100 text-red-600"
          />

        </div>

        {/* =====================================
            SEARCH + FILTER
        ===================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-xl">

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
                placeholder="Search schedule, application, instrument..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
              />

            </div>

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

        </div>

        {/* =====================================
            UPCOMING APPOINTMENTS
        ===================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">

                <CalendarDays
                  size={22}
                />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Upcoming Verification Appointments
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Scheduled field verification visits.
                </p>

              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {upcomingAppointments.map(
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
                  onView={() =>
                    handleViewApplication(
                      appointment.applicationId
                    )
                  }
                />
              )
            )}

          </div>

          {upcomingAppointments.length ===
            0 && (
            <div className="rounded-xl bg-slate-50 px-6 py-12 text-center">

              <CalendarDays
                size={38}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="font-semibold text-slate-700">
                No upcoming appointments
              </p>

            </div>
          )}

        </div>

        {/* =====================================
            ALL APPOINTMENTS
        ===================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  All Appointments
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    filteredAppointments.length
                  } schedules found
                </p>

              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">

                <ClipboardList
                  size={15}
                />

                Verification Schedule

              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1400px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <TableHead>
                    Schedule ID
                  </TableHead>

                  <TableHead>
                    Application ID
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
                        className="transition hover:bg-green-50/30"
                      >

                        {/* Schedule ID */}

                        <TableCell>

                          <span className="font-bold text-green-700">
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
                              handleViewApplication(
                                appointment.applicationId
                              )
                            }
                            className="font-semibold text-green-700 hover:underline"
                          >

                            {
                              appointment.applicationId
                            }

                          </button>

                        </TableCell>

                        {/* Instrument */}

                        <TableCell>

                          <p className="font-semibold text-slate-800">
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

                          <div className="flex items-center gap-2">

                            <User
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="text-sm text-slate-600">

                              {
                                appointment.officerId ||
                                "Not Assigned"
                              }

                            </span>

                          </div>

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

                          <button
                            type="button"
                            onClick={() =>
                              handleViewApplication(
                                appointment.applicationId
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                          >

                            <Eye
                              size={16}
                            />

                            View

                          </button>

                        </TableCell>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={11}
                      className="px-6 py-14 text-center"
                    >

                      <Search
                        size={38}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="font-semibold text-slate-700">
                        No appointments found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try another search or filter.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================
   APPOINTMENT CARD
========================================= */

function AppointmentCard({
  appointment,
  onView,
}: {
  appointment: Appointment;
  onView: () => void;
}) {
  return (
    <div className="rounded-2xl border border-green-100 bg-green-50/40 p-5">

      <div className="flex items-start justify-between gap-4">

        <div>

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
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

          <p className="mt-1 text-sm font-semibold text-green-700">

            {
              appointment.applicationId
            }

          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">

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
            <User
              size={17}
            />
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

      <button
        type="button"
        onClick={onView}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 active:scale-[0.99]"
      >

        <Eye size={18} />

        View Application

      </button>

    </div>
  );
}

/* =========================================
   APPOINTMENT DETAIL
========================================= */

function AppointmentDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="mt-0.5 text-green-700">
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

/* =========================================
   TABLE HEAD
========================================= */

function TableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

/* =========================================
   TABLE CELL
========================================= */

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="whitespace-nowrap px-5 py-4">
      {children}
    </td>
  );
}

/* =========================================
   STAT CARD
========================================= */

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: StatCardProps) {
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
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
        active
          ? "bg-green-700 text-white shadow-md shadow-green-700/20"
          : "bg-slate-100 text-slate-700 hover:bg-green-50 hover:text-green-700"
      }`}
    >

      {label}

    </button>
  );
}

/* =========================================
   STATUS BADGE
========================================= */

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
      "bg-green-100 text-green-700",

    Completed:
      "bg-emerald-100 text-emerald-700",

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

export default Appointments;