import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  MapPin,
  RefreshCw,
  Search,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/* =========================================
   TYPES
========================================= */

type AppointmentStatus =
  | "Scheduled"
  | "Today"
  | "Completed"
  | "Cancelled";

interface Appointment {
  id: string;
  applicationId: string;
  merchant: string;
  instrumentId: string;
  instrumentType: string;
  inspector: string;
  location: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}

/* =========================================
   DEFAULT APPOINTMENTS
========================================= */

const defaultAppointments: Appointment[] = [
  {
    id: "APT-001",
    applicationId: "APP-270147440083",
    merchant: "Jamil Samir",
    instrumentId: "INS-003",
    instrumentType: "Digital Weighing Machine",
    inspector: "Priya Singh",
    location: "Durgapur",
    date: "01 Sep 2026",
    time: "11:00 AM",
    status: "Scheduled",
  },
  {
    id: "APT-002",
    applicationId: "APP-270147390032",
    merchant: "Sharma Traders",
    instrumentId: "INS-004",
    instrumentType: "Counter Weighing Scale",
    inspector: "Amit Das",
    location: "Asansol",
    date: "25 Aug 2026",
    time: "02:00 PM",
    status: "Completed",
  },
  {
    id: "APT-003",
    applicationId: "APP-270140200751",
    merchant: "Sharma Traders",
    instrumentId: "INS-001",
    instrumentType: "Electronic Weighing Scale",
    inspector: "Rajesh Kumar",
    location: "Kolkata",
    date: "30 Aug 2026",
    time: "10:30 AM",
    status: "Today",
  },
];

/* =========================================
   STORAGE HELPER
========================================= */

function readLocalArray<T>(
  key: string
): T[] {
  try {
    const stored =
      localStorage.getItem(key);

    if (!stored) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? (parsed as T[])
      : [];
  } catch {
    return [];
  }
}

/* =========================================
   DATE PARSER
========================================= */

function parseDate(
  value: string
): Date | null {
  if (!value) {
    return null;
  }

  /* YYYY-MM-DD */

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    const date = new Date(
      `${value}T00:00:00`
    );

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
  }

  /* Native date parsing */

  const direct =
    new Date(value);

  if (
    !Number.isNaN(
      direct.getTime()
    )
  ) {
    return direct;
  }

  /* DD Mon YYYY */

  const match =
    value.match(
      /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/
    );

  if (!match) {
    return null;
  }

  const day =
    Number(match[1]);

  const monthName =
    match[2].toLowerCase();

  const year =
    Number(match[3]);

  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const monthIndex =
    months.findIndex(
      (month) =>
        month.startsWith(
          monthName.slice(
            0,
            3
          )
        )
    );

  if (
    monthIndex < 0
  ) {
    return null;
  }

  const date =
    new Date(
      year,
      monthIndex,
      day
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}

/* =========================================
   DATE FORMAT
========================================= */

function formatDate(
  value: string
): string {
  const date =
    parseDate(value);

  if (!date) {
    return value || "N/A";
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

/* =========================================
   TIME FORMAT
========================================= */

function formatTime(
  value: string
): string {
  if (!value) {
    return "N/A";
  }

  /* HH:mm → 12-hour */

  if (
    /^\d{2}:\d{2}$/.test(
      value
    )
  ) {
    const [
      hoursText,
      minutesText,
    ] = value.split(":");

    let hours =
      Number(hoursText);

    const minutes =
      Number(minutesText);

    const period =
      hours >= 12
        ? "PM"
        : "AM";

    if (hours === 0) {
      hours = 12;
    } else if (
      hours > 12
    ) {
      hours -= 12;
    }

    return `${hours}:${String(
      minutes
    ).padStart(
      2,
      "0"
    )} ${period}`;
  }

  return value;
}

/* =========================================
   STATUS
========================================= */

function normalizeStatus(
  status?: string,
  date?: string
): AppointmentStatus {
  if (
    status === "Completed" ||
    status === "Cancelled"
  ) {
    return status;
  }

  if (
    status === "Today"
  ) {
    return "Today";
  }

  if (date) {
    const appointmentDate =
      parseDate(date);

    const today =
      new Date();

    if (
      appointmentDate
    ) {
      if (
        appointmentDate.toDateString() ===
        today.toDateString()
      ) {
        return "Today";
      }

      if (
        appointmentDate.getTime() <
        today.getTime()
      ) {
        return "Completed";
      }
    }
  }

  return "Scheduled";
}

/* =========================================
   BUILD APPOINTMENTS
========================================= */

function buildAppointments(
  assignments: Record<
    string,
    unknown
  >[]
): Appointment[] {
  return assignments
    .filter(
      (item) => {
        const inspector =
          String(
            item.inspector ??
              ""
          ).trim();

        const date =
          String(
            item.appointmentDate ??
              ""
          ).trim();

        return (
          inspector !== "" &&
          date !== ""
        );
      }
    )
    .map(
      (
        item,
        index
      ): Appointment => {

        const appointmentStatus =
          normalizeStatus(
            String(
              item.status ??
                "Scheduled"
            ),
            String(
              item.appointmentDate ??
                ""
            )
          );

        return {
          id:
            String(
              item.appointmentId ??
                ""
            ) ||
            `APT-${String(
              index + 1
            ).padStart(
              3,
              "0"
            )}`,

          applicationId:
            String(
              item.id ??
                item.applicationId ??
                "N/A"
            ),

          merchant:
            String(
              item.merchant ??
                item.applicant ??
                "Current Merchant"
            ),

          instrumentId:
            String(
              item.instrumentId ??
                item.instrument ??
                "N/A"
            ),

          instrumentType:
            String(
              item.instrumentType ??
                item.type ??
                "Instrument"
            ),

          inspector:
            String(
              item.inspector ??
                "Not Assigned"
            ),

          location:
            String(
              item.location ??
                "Not Provided"
            ),

          date:
            formatDate(
              String(
                item.appointmentDate ??
                  ""
              )
            ),

          time:
            formatTime(
              String(
                item.appointmentTime ??
                  ""
              )
            ),

          status:
            appointmentStatus,
        };
      }
    );
}

/* =========================================
   MAIN COMPONENT
========================================= */

function AdminAppointments() {
  const navigate =
    useNavigate();

  const [
    appointments,
    setAppointments,
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
  ] = useState<
    "All" | AppointmentStatus
  >("All");

  const [
    selectedAppointment,
    setSelectedAppointment,
  ] =
    useState<Appointment | null>(
      null
    );

  /* =========================================
     LOAD APPOINTMENTS
  ========================================= */

  const loadAppointments = () => {
    const assignments =
      readLocalArray<
        Record<string, unknown>
      >(
        "inspectorAssignedApplications"
      );

    const generated =
      buildAppointments(
        assignments
      );

    if (
      generated.length === 0
    ) {
      setAppointments(
        defaultAppointments
      );
      return;
    }

    const appointmentMap =
      new Map<
        string,
        Appointment
      >();

    defaultAppointments.forEach(
      (appointment) => {
        appointmentMap.set(
          appointment.applicationId,
          appointment
        );
      }
    );

    generated.forEach(
      (appointment) => {
        appointmentMap.set(
          appointment.applicationId,
          appointment
        );
      }
    );

    setAppointments(
      Array.from(
        appointmentMap.values()
      )
    );
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  /* =========================================
     FILTERED APPOINTMENTS
  ========================================= */

  const filteredAppointments =
    useMemo(() => {
      const text =
        search
          .trim()
          .toLowerCase();

      return appointments.filter(
        (appointment) => {
          const searchable =
            [
              appointment.id,
              appointment.applicationId,
              appointment.merchant,
              appointment.instrumentId,
              appointment.instrumentType,
              appointment.inspector,
              appointment.location,
              appointment.date,
              appointment.time,
            ]
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            searchable.includes(
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
      appointments,
      search,
      filter,
    ]);

  /* =========================================
     STATISTICS
  ========================================= */

  const totalCount =
    appointments.length;

  const scheduledCount =
    appointments.filter(
      (item) =>
        item.status ===
          "Scheduled" ||
        item.status ===
          "Today"
    ).length;

  const todayCount =
    appointments.filter(
      (item) =>
        item.status ===
        "Today"
    ).length;

  const completedCount =
    appointments.filter(
      (item) =>
        item.status ===
        "Completed"
    ).length;

  const cancelledCount =
    appointments.filter(
      (item) =>
        item.status ===
        "Cancelled"
    ).length;

  /* =========================================
     VIEW APPLICATION
  ========================================= */

  const openApplication = (
    applicationId: string
  ) => {
    navigate(
      "/admin/applications"
    );

    void applicationId;
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* ==================================
            HEADER TOP
        ================================== */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
            className="flex items-center gap-2 self-start text-sm font-semibold text-blue-600 transition hover:text-blue-800"
          >

            <ArrowLeft size={18} />

            Back to Admin Dashboard

          </button>

          <button
            type="button"
            onClick={
              loadAppointments
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >

            <RefreshCw
              size={16}
            />

            Refresh

          </button>

        </div>

        {/* ==================================
            PAGE HEADER
        ================================== */}

        <div className="mb-7">

          <p className="text-sm font-semibold text-blue-600">
            Administrator Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
            Verification Appointments
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            Monitor inspector assignments and scheduled field verification appointments.
          </p>

        </div>

        {/* ==================================
            STAT CARDS
        ================================== */}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Appointments"
            value={String(
              totalCount
            )}
            icon={
              <CalendarDays
                size={22}
              />
            }
            iconClass="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Scheduled / Upcoming"
            value={String(
              scheduledCount
            )}
            icon={
              <Clock size={22} />
            }
            iconClass="bg-orange-100 text-orange-600"
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
            iconClass="bg-green-100 text-green-600"
          />

        </div>

        {/* ==================================
            SEARCH & FILTER
        ================================== */}

        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm">

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
                placeholder="Search appointment, application, inspector..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  setFilter(
                    "All"
                  )
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
                label="Today"
                active={
                  filter ===
                  "Today"
                }
                onClick={() =>
                  setFilter(
                    "Today"
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

        {/* ==================================
            APPOINTMENT TABLE
        ================================== */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-xl font-bold text-slate-900">
              Scheduled Verification Appointments
            </h2>

            <p className="mt-1 text-sm text-slate-500">

              {
                filteredAppointments.length
              }{" "}
              appointments found

            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <TableHead>
                    Appointment ID
                  </TableHead>

                  <TableHead>
                    Application
                  </TableHead>

                  <TableHead>
                    Merchant
                  </TableHead>

                  <TableHead>
                    Instrument
                  </TableHead>

                  <TableHead>
                    Inspector
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
                          appointment.id
                        }
                        className="transition hover:bg-slate-50"
                      >

                        {/* APPOINTMENT ID */}

                        <td className="px-6 py-5">

                          <p className="font-semibold text-blue-600">

                            {
                              appointment.id
                            }

                          </p>

                        </td>

                        {/* APPLICATION */}

                        <td className="px-6 py-5">

                          <button
                            type="button"
                            onClick={() =>
                              openApplication(
                                appointment.applicationId
                              )
                            }
                            className="font-semibold text-slate-700 hover:text-blue-600 hover:underline"
                          >

                            {
                              appointment.applicationId
                            }

                          </button>

                        </td>

                        {/* MERCHANT */}

                        <td className="px-6 py-5">

                          <p className="text-sm font-semibold text-slate-700">

                            {
                              appointment.merchant
                            }

                          </p>

                        </td>

                        {/* INSTRUMENT */}

                        <td className="px-6 py-5">

                          <p className="text-sm font-semibold text-slate-700">

                            {
                              appointment.instrumentType
                            }

                          </p>

                          <p className="mt-1 text-xs text-slate-400">

                            {
                              appointment.instrumentId
                            }

                          </p>

                        </td>

                        {/* INSPECTOR */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">

                              {appointment.inspector
                                .charAt(
                                  0
                                )
                                .toUpperCase()}

                            </div>

                            <span className="text-sm font-semibold text-slate-700">

                              {
                                appointment.inspector
                              }

                            </span>

                          </div>

                        </td>

                        {/* DATE */}

                        <td className="px-6 py-5 text-sm text-slate-600">

                          {
                            appointment.date
                          }

                        </td>

                        {/* TIME */}

                        <td className="px-6 py-5 text-sm text-slate-600">

                          {
                            appointment.time
                          }

                        </td>

                        {/* LOCATION */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <MapPin
                              size={16}
                              className="text-slate-400"
                            />

                            {
                              appointment.location
                            }

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5">

                          <StatusBadge
                            status={
                              appointment.status
                            }
                          />

                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-5">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedAppointment(
                                appointment
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                          >

                            <Eye size={16} />

                            View

                          </button>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={10}
                      className="px-6 py-16 text-center"
                    >

                      <CalendarDays
                        size={42}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <h3 className="text-lg font-semibold text-slate-800">
                        No appointments found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try another filter or search term.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* ==================================
            SUMMARY CARDS
        ================================== */}

        <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

          <SummaryCard
            icon={
              <UserCheck
                size={21}
              />
            }
            title="Inspector Assignments"
            value={String(
              appointments.filter(
                (item) =>
                  item.inspector &&
                  item.inspector !==
                    "Not Assigned"
              ).length
            )}
            text="Appointments with assigned inspectors"
          />

          <SummaryCard
            icon={
              <Clock size={21} />
            }
            title="Upcoming"
            value={String(
              scheduledCount
            )}
            text="Scheduled field verification visits"
          />

          <SummaryCard
            icon={
              <XCircle size={21} />
            }
            title="Cancelled"
            value={String(
              cancelledCount
            )}
            text="Cancelled appointments"
          />

        </section>

      </div>

      {/* =====================================
          DETAILS MODAL
      ===================================== */}

      {selectedAppointment && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() =>
            setSelectedAppointment(
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

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-slate-200 p-6">

              <div>

                <p className="text-sm font-semibold text-blue-600">
                  Appointment Details
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">

                  {
                    selectedAppointment.id
                  }

                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAppointment(
                    null
                  )
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >

                <X size={21} />

              </button>

            </div>

            {/* MODAL DETAILS */}

            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">

              <Detail
                icon={
                  <ClipboardList
                    size={18}
                  />
                }
                label="Application ID"
                value={
                  selectedAppointment.applicationId
                }
              />

              <Detail
                icon={
                  <CalendarDays
                    size={18}
                  />
                }
                label="Appointment ID"
                value={
                  selectedAppointment.id
                }
              />

              <Detail
                icon={
                  <UserCheck
                    size={18}
                  />
                }
                label="Merchant"
                value={
                  selectedAppointment.merchant
                }
              />

              <Detail
                icon={
                  <UserCheck
                    size={18}
                  />
                }
                label="Inspector"
                value={
                  selectedAppointment.inspector
                }
              />

              <Detail
                icon={
                  <ScaleIcon />
                }
                label="Instrument"
                value={
                  selectedAppointment.instrumentId
                }
              />

              <Detail
                icon={
                  <FileIcon />
                }
                label="Instrument Type"
                value={
                  selectedAppointment.instrumentType
                }
              />

              <Detail
                icon={
                  <CalendarDays
                    size={18}
                  />
                }
                label="Date"
                value={
                  selectedAppointment.date
                }
              />

              <Detail
                icon={
                  <Clock size={18} />
                }
                label="Time"
                value={
                  selectedAppointment.time
                }
              />

              <Detail
                icon={
                  <MapPin
                    size={18}
                  />
                }
                label="Location"
                value={
                  selectedAppointment.location
                }
              />

              <Detail
                icon={
                  <CheckCircle2
                    size={18}
                  />
                }
                label="Status"
                value={
                  selectedAppointment.status
                }
              />

            </div>

            {/* MODAL FOOTER */}

            <div className="flex justify-end border-t border-slate-200 p-5">

              <button
                type="button"
                onClick={() =>
                  setSelectedAppointment(
                    null
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
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
   SUMMARY CARD
========================================= */

function SummaryCard({
  icon,
  title,
  value,
  text,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

          {icon}

        </div>

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {text}
          </p>

        </div>

      </div>

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
      "bg-blue-100 text-blue-700",

    Today:
      "bg-orange-100 text-orange-700",

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

/* =========================================
   DETAIL
========================================= */

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="mb-2 flex items-center gap-2 text-slate-400">

        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>

      </div>

      <p className="break-words text-sm font-bold text-slate-800">
        {value}
      </p>

    </div>
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
    <th className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-600">
      {children}
    </th>
  );
}

/* =========================================
   SCALE ICON
========================================= */

function ScaleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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

/* =========================================
   FILE ICON
========================================= */

function FileIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />

      <path d="M14 2v6h6" />

      <path d="M8 13h8" />

      <path d="M8 17h6" />

    </svg>
  );
}

export default AdminAppointments;