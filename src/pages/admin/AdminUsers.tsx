import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";

/* =========================================
   TYPES
========================================= */

type InspectorStatus =
  | "Available"
  | "Busy"
  | "Inactive";

interface Inspector {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  region: string;
  designation: string;
  status: InspectorStatus;
  assignedApplications: number;
  completedInspections: number;
  availability: string;
  joinedDate: string;
}

/* =========================================
   DEFAULT INSPECTORS
========================================= */

const initialInspectors: Inspector[] = [
  {
    id: "INSPECTOR-001",
    employeeId: "LM-1001",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@almve.gov.in",
    phone: "+91 98765 43210",
    department:
      "Legal Metrology Department",
    region: "Kolkata",
    designation:
      "Senior Legal Metrology Inspector",
    status: "Available",
    assignedApplications: 4,
    completedInspections: 28,
    availability:
      "Mon - Sat, 09:00 AM - 05:00 PM",
    joinedDate: "12 Jan 2024",
  },

  {
    id: "INSPECTOR-002",
    employeeId: "LM-1002",
    name: "Priya Singh",
    email: "priya.singh@almve.gov.in",
    phone: "+91 98765 43211",
    department:
      "Legal Metrology Department",
    region: "Durgapur",
    designation:
      "Legal Metrology Inspector",
    status: "Busy",
    assignedApplications: 7,
    completedInspections: 24,
    availability:
      "Mon - Fri, 09:00 AM - 05:00 PM",
    joinedDate: "08 Mar 2024",
  },

  {
    id: "INSPECTOR-003",
    employeeId: "LM-1003",
    name: "Amit Das",
    email: "amit.das@almve.gov.in",
    phone: "+91 98765 43212",
    department:
      "Legal Metrology Department",
    region: "Asansol",
    designation:
      "Legal Metrology Inspector",
    status: "Available",
    assignedApplications: 3,
    completedInspections: 31,
    availability:
      "Mon - Sat, 09:00 AM - 05:00 PM",
    joinedDate: "20 Apr 2023",
  },

  {
    id: "INSPECTOR-004",
    employeeId: "LM-1004",
    name: "Sourav Roy",
    email: "sourav.roy@almve.gov.in",
    phone: "+91 98765 43213",
    department:
      "Legal Metrology Department",
    region: "Howrah",
    designation:
      "Assistant Legal Metrology Inspector",
    status: "Inactive",
    assignedApplications: 0,
    completedInspections: 19,
    availability:
      "Currently unavailable",
    joinedDate: "15 Jul 2024",
  },

  {
    id: "INSPECTOR-005",
    employeeId: "LM-1005",
    name: "Neha Sharma",
    email: "neha.sharma@almve.gov.in",
    phone: "+91 98765 43214",
    department:
      "Legal Metrology Department",
    region: "Siliguri",
    designation:
      "Legal Metrology Inspector",
    status: "Available",
    assignedApplications: 2,
    completedInspections: 16,
    availability:
      "Mon - Sat, 09:00 AM - 05:00 PM",
    joinedDate: "10 Sep 2024",
  },
];

/* =========================================
   LOCAL STORAGE HELPER
========================================= */

function readAssignments(): Record<
  string,
  unknown
>[] {
  try {
    const saved =
      localStorage.getItem(
        "inspectorAssignedApplications"
      );

    if (!saved) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as Record<
      string,
      unknown
    >[];
  } catch {
    return [];
  }
}

/* =========================================
   COMPONENT
========================================= */

function AdminUsers() {
  const navigate =
    useNavigate();

  const [inspectors, setInspectors] =
    useState<Inspector[]>(
      initialInspectors
    );

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | InspectorStatus
    >("All");

  const [selectedInspector, setSelectedInspector] =
    useState<Inspector | null>(
      null
    );

  /* =========================================
     LOAD ASSIGNMENT COUNTS
  ========================================= */

  useEffect(() => {
    const assignments =
      readAssignments();

    if (
      assignments.length === 0
    ) {
      return;
    }

    const counts: Record<
      string,
      number
    > = {};

    assignments.forEach(
      (item) => {
        const inspector =
          typeof item.inspector ===
          "string"
            ? item.inspector.trim()
            : "";

        if (!inspector) {
          return;
        }

        counts[inspector] =
          (counts[inspector] || 0) +
          1;
      }
    );

    setInspectors(
      (current) =>
        current.map(
          (inspector) => ({
            ...inspector,

            assignedApplications:
              counts[
                inspector.name
              ] ??
              inspector.assignedApplications,
          })
        )
    );
  }, []);

  /* =========================================
     FILTERED INSPECTORS
  ========================================= */

  const filteredInspectors =
    useMemo(() => {
      const text =
        search
          .trim()
          .toLowerCase();

      return inspectors.filter(
        (inspector) => {
          const searchable = [
            inspector.name,
            inspector.employeeId,
            inspector.email,
            inspector.phone,
            inspector.department,
            inspector.region,
            inspector.designation,
            inspector.status,
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            searchable.includes(
              text
            );

          const matchesStatus =
            statusFilter === "All" ||
            inspector.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      inspectors,
      search,
      statusFilter,
    ]);

  /* =========================================
     STATISTICS
  ========================================= */

  const totalInspectors =
    inspectors.length;

  const availableInspectors =
    inspectors.filter(
      (inspector) =>
        inspector.status ===
        "Available"
    ).length;

  const busyInspectors =
    inspectors.filter(
      (inspector) =>
        inspector.status ===
        "Busy"
    ).length;

  const inactiveInspectors =
    inspectors.filter(
      (inspector) =>
        inspector.status ===
        "Inactive"
    ).length;

  const totalAssigned =
    inspectors.reduce(
      (
        total,
        inspector
      ) =>
        total +
        inspector.assignedApplications,
      0
    );

  const totalCompleted =
    inspectors.reduce(
      (
        total,
        inspector
      ) =>
        total +
        inspector.completedInspections,
      0
    );

  /* =========================================
     DETAILS
  ========================================= */

  const openDetails = (
    inspector: Inspector
  ) => {
    setSelectedInspector(
      inspector
    );
  };

  const closeDetails = () => {
    setSelectedInspector(
      null
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* ==================================
            BACK
        ================================== */}

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

        {/* ==================================
            HEADER
        ================================== */}

        <div className="mb-7">

          <p className="text-sm font-semibold text-blue-600">
            Administrator Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
            Users & Inspectors
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
            Manage inspector profiles,
            availability and verification
            workload.
          </p>

        </div>

        {/* ==================================
            STATISTICS
        ================================== */}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Inspectors"
            value={String(
              totalInspectors
            )}
            icon={
              <Users size={22} />
            }
            iconClass="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Available"
            value={String(
              availableInspectors
            )}
            icon={
              <UserCheck
                size={22}
              />
            }
            iconClass="bg-green-100 text-green-600"
          />

          <StatCard
            title="Busy"
            value={String(
              busyInspectors
            )}
            icon={
              <Briefcase
                size={22}
              />
            }
            iconClass="bg-orange-100 text-orange-600"
          />

          <StatCard
            title="Inactive"
            value={String(
              inactiveInspectors
            )}
            icon={
              <UserX size={22} />
            }
            iconClass="bg-red-100 text-red-600"
          />

        </div>

        {/* ==================================
            WORKLOAD SUMMARY
        ================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                <Briefcase
                  size={21}
                />

              </div>

              <div>

                <p className="text-sm text-blue-700">
                  Total Assigned Applications
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-900">
                  {totalAssigned}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">

                <ShieldCheck
                  size={21}
                />

              </div>

              <div>

                <p className="text-sm text-green-700">
                  Completed Inspections
                </p>

                <p className="mt-1 text-2xl font-bold text-green-900">
                  {totalCompleted}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================
            SEARCH + FILTER
        ================================== */}

        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="relative w-full max-w-xl">

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
                placeholder="Search inspector, employee ID, region..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div className="flex flex-wrap gap-2">

              <FilterButton
                label="All"
                active={
                  statusFilter ===
                  "All"
                }
                onClick={() =>
                  setStatusFilter(
                    "All"
                  )
                }
              />

              <FilterButton
                label="Available"
                active={
                  statusFilter ===
                  "Available"
                }
                onClick={() =>
                  setStatusFilter(
                    "Available"
                  )
                }
              />

              <FilterButton
                label="Busy"
                active={
                  statusFilter ===
                  "Busy"
                }
                onClick={() =>
                  setStatusFilter(
                    "Busy"
                  )
                }
              />

              <FilterButton
                label="Inactive"
                active={
                  statusFilter ===
                  "Inactive"
                }
                onClick={() =>
                  setStatusFilter(
                    "Inactive"
                  )
                }
              />

            </div>

          </div>

        </section>

        {/* ==================================
            INSPECTOR TABLE
        ================================== */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">

                <Users size={22} />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Inspector Directory
                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {
                    filteredInspectors.length
                  }{" "}
                  inspectors found

                </p>

              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <TableHead>
                    Inspector
                  </TableHead>

                  <TableHead>
                    Employee ID
                  </TableHead>

                  <TableHead>
                    Department
                  </TableHead>

                  <TableHead>
                    Region
                  </TableHead>

                  <TableHead>
                    Workload
                  </TableHead>

                  <TableHead>
                    Availability
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

                {filteredInspectors.length >
                0 ? (

                  filteredInspectors.map(
                    (
                      inspector
                    ) => (

                      <tr
                        key={
                          inspector.id
                        }
                        className="transition hover:bg-slate-50"
                      >

                        {/* Inspector */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">

                              {inspector.name
                                .charAt(
                                  0
                                )
                                .toUpperCase()}

                            </div>

                            <div>

                              <p className="font-semibold text-slate-800">

                                {
                                  inspector.name
                                }

                              </p>

                              <p className="mt-1 text-xs text-slate-400">

                                {
                                  inspector.designation
                                }

                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Employee ID */}

                        <td className="px-6 py-5 text-sm font-semibold text-blue-600">

                          {
                            inspector.employeeId
                          }

                        </td>

                        {/* Department */}

                        <td className="px-6 py-5 text-sm text-slate-600">

                          {
                            inspector.department
                          }

                        </td>

                        {/* Region */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <MapPin
                              size={16}
                              className="text-slate-400"
                            />

                            {
                              inspector.region
                            }

                          </div>

                        </td>

                        {/* Workload */}

                        <td className="px-6 py-5">

                          <p className="text-sm font-semibold text-slate-700">

                            {
                              inspector.assignedApplications
                            }{" "}
                            assigned

                          </p>

                          <p className="mt-1 text-xs text-slate-400">

                            {
                              inspector.completedInspections
                            }{" "}
                            completed

                          </p>

                        </td>

                        {/* Availability */}

                        <td className="px-6 py-5">

                          <p className="max-w-[220px] text-sm text-slate-600">

                            {
                              inspector.availability
                            }

                          </p>

                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">

                          <StatusBadge
                            status={
                              inspector.status
                            }
                          />

                        </td>

                        {/* Action */}

                        <td className="px-6 py-5">

                          <button
                            type="button"
                            onClick={() =>
                              openDetails(
                                inspector
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
                      colSpan={8}
                      className="px-6 py-14 text-center"
                    >

                      <Users
                        size={42}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <h3 className="font-semibold text-slate-800">
                        No inspectors found
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

      {/* =====================================
          INSPECTOR DETAILS MODAL
      ===================================== */}

      {selectedInspector && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={
            closeDetails
          }
        >

          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-slate-200 p-6">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">

                  {selectedInspector.name
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div>

                  <p className="text-sm font-semibold text-blue-600">
                    Inspector Profile
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">

                    {
                      selectedInspector.name
                    }

                  </h2>

                  <p className="mt-1 text-sm text-slate-500">

                    {
                      selectedInspector.designation
                    }

                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  closeDetails
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >

                <X size={21} />

              </button>

            </div>

            {/* BODY */}

            <div className="space-y-6 p-6">

              {/* STATUS */}

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <ShieldCheck
                    size={20}
                    className="text-blue-600"
                  />

                  <span className="text-sm font-semibold text-slate-700">
                    Current Status
                  </span>

                </div>

                <StatusBadge
                  status={
                    selectedInspector.status
                  }
                />

              </div>

              {/* CONTACT */}

              <section>

                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <InfoBox
                    icon={
                      <Mail size={18} />
                    }
                    label="Email"
                    value={
                      selectedInspector.email
                    }
                  />

                  <InfoBox
                    icon={
                      <Phone size={18} />
                    }
                    label="Phone"
                    value={
                      selectedInspector.phone
                    }
                  />

                  <InfoBox
                    icon={
                      <Briefcase
                        size={18}
                      />
                    }
                    label="Employee ID"
                    value={
                      selectedInspector.employeeId
                    }
                  />

                  <InfoBox
                    icon={
                      <MapPin
                        size={18}
                      />
                    }
                    label="Region"
                    value={
                      selectedInspector.region
                    }
                  />

                </div>

              </section>

              {/* WORK */}

              <section>

                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  Work Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <InfoBox
                    icon={
                      <Briefcase
                        size={18}
                      />
                    }
                    label="Department"
                    value={
                      selectedInspector.department
                    }
                  />

                  <InfoBox
                    icon={
                      <ShieldCheck
                        size={18}
                      />
                    }
                    label="Designation"
                    value={
                      selectedInspector.designation
                    }
                  />

                  <InfoBox
                    icon={
                      <Users
                        size={18}
                      />
                    }
                    label="Assigned Applications"
                    value={String(
                      selectedInspector.assignedApplications
                    )}
                  />

                  <InfoBox
                    icon={
                      <CalendarDays
                        size={18}
                      />
                    }
                    label="Completed Inspections"
                    value={String(
                      selectedInspector.completedInspections
                    )}
                  />

                  <InfoBox
                    icon={
                      <CalendarDays
                        size={18}
                      />
                    }
                    label="Joined Date"
                    value={
                      selectedInspector.joinedDate
                    }
                  />

                  <InfoBox
                    icon={
                      <ClockIcon />
                    }
                    label="Availability"
                    value={
                      selectedInspector.availability
                    }
                  />

                </div>

              </section>

              {/* CLOSE */}

              <div className="flex justify-end border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={
                    closeDetails
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
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
  status: InspectorStatus;
}) {
  const styles: Record<
    InspectorStatus,
    string
  > = {
    Available:
      "bg-green-100 text-green-700",

    Busy:
      "bg-orange-100 text-orange-700",

    Inactive:
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
   INFO BOX
========================================= */

function InfoBox({
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

      <p className="break-words text-sm font-semibold text-slate-800">
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
   CLOCK ICON
========================================= */

function ClockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export default AdminUsers;