import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  X,
  MapPin,
  User,
  Building2,
  CalendarDays,
  ClipboardList,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/* =========================================
   TYPES
========================================= */

type ApplicationStatus =
  | "Submitted"
  | "Pending"
  | "Scheduled"
  | "Completed"
  | "Approved"
  | "Rejected";

interface Application {
  id: string;
  applicationId: string;

  businessId: string;
  instrumentId: string;

  applicant: string;
  instrument: string;

  applicationType: string;
  type: string;

  submissionDate: string;
  submitted: string;

  preferredDate: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;

  assignedOfficerId: string;
  assignedGatcId: string;

  inspector: string;

  status: ApplicationStatus;

  remarks: string;
  createdAt: string;
}

type FilterType =
  | "All"
  | ApplicationStatus;

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
}

/* =========================================
   COMPONENT
========================================= */

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
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

function Applications() {
  const navigate =
    useNavigate();

  const [
    applicationList,
    setApplicationList,
  ] =
    useState<Application[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    filter,
    setFilter,
  ] =
    useState<FilterType>("All");

  const [
    selectedApplication,
    setSelectedApplication,
  ] =
    useState<Application | null>(
      null
    );

  /* =========================================
     LOAD APPLICATIONS FROM BACKEND
  ========================================= */

  useEffect(() => {
    let cancelled = false;

    const loadApplications =
      async () => {
        const token =
          localStorage.getItem(
            "almveToken"
          );

        if (!token) {
          setLoading(false);
          setError(
            "Your session has expired. Please login again."
          );
          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              "https://maapsetu-w1sf.onrender.com/api/applications",
              {
                method: "GET",
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                  "Content-Type":
                    "application/json",
                },
              }
            );

          let data: {
            success?: boolean;
            message?: string;
            applications?: unknown[];
          } | null = null;

          try {
            data = await response.json();
          } catch {
            data = null;
          }

          if (
            !response.ok ||
            !data?.success
          ) {
            if (!cancelled) {
              setError(
                data?.message ||
                  "Unable to load applications."
              );
            }
            return;
          }

          const rows =
            Array.isArray(
              data.applications
            )
              ? data.applications
              : [];

          const mappedApplications:
            Application[] =
            rows
              .map(
                (item: any) => {
                  const applicationId =
                    item.applicationId ||
                    item.application_number ||
                    item.id ||
                    "";

                  if (!applicationId) {
                    return null;
                  }

                  const statusMap: Record<
                    string,
                    ApplicationStatus
                  > = {
                    submitted:
                      "Submitted",
                    pending:
                      "Pending",
                    scheduled:
                      "Scheduled",
                    completed:
                      "Completed",
                    approved:
                      "Approved",
                    rejected:
                      "Rejected",
                    "pending verification":
                      "Pending",
                    "inspection scheduled":
                      "Scheduled",
                  };

                  const rawStatus =
                    String(
                      item.status ||
                        "Submitted"
                    )
                      .trim()
                      .toLowerCase();

                  const status =
                    statusMap[
                      rawStatus
                    ] ||
                    "Submitted";

                  const submittedDate =
                    item.submissionDate ||
                    item.submitted_at ||
                    item.submitted ||
                    item.created_at ||
                    "";

                  return {
                    id: String(
                      item.id ??
                        applicationId
                    ),

                    applicationId:
                      String(
                        applicationId
                      ),

                    businessId:
                      String(
                        item.businessId ??
                          item.business_id ??
                          "Not Available"
                      ),

                    instrumentId:
                      String(
                        item.instrumentId ??
                          item.instrument_id ??
                          "Not Available"
                      ),

                    applicant:
                      item.applicant ||
                      item.business_name ||
                      "Current Business",

                    instrument:
                      item.instrument ||
                      item.instrument_name ||
                      item.instrument_type ||
                      String(
                        item.instrumentId ??
                          item.instrument_id ??
                          "Not Available"
                      ),

                    applicationType:
                      item.applicationType ||
                      item.application_type ||
                      "Initial Verification",

                    type:
                      item.type ||
                      item.instrument_type ||
                      "Verification",

                    submissionDate:
                      formatDate(
                        submittedDate
                      ),

                    submitted:
                      formatDate(
                        submittedDate
                      ),

                    preferredDate:
                      formatDate(
                        item.preferredDate ||
                          item.preferred_date ||
                          item.appointmentDate ||
                          item.appointment_date
                      ),

                    appointmentDate:
                      formatDate(
                        item.appointmentDate ||
                          item.appointment_date
                      ),

                    appointmentTime:
                      item.appointmentTime ||
                      item.appointment_time ||
                      "",

                    location:
                      item.location ||
                      "Not Provided",

                    assignedOfficerId:
                      item.assignedOfficerId ||
                      item.assigned_inspector_id ||
                      "",

                    assignedGatcId:
                      item.assignedGatcId ||
                      item.assigned_gatc_id ||
                      item.gatc_id ||
                      "",

                    inspector:
                      item.inspector_name ||
                      item.inspector ||
                      "Not Assigned",

                    status,

                    remarks:
                      item.remarks || "",

                    createdAt:
                      item.createdAt ||
                      item.created_at ||
                      new Date().toISOString(),
                  };
                }
              )
              .filter(
                (
                  item
                ): item is Application =>
                  item !== null
              );

          if (!cancelled) {
            setApplicationList(
              mappedApplications
            );
          }
        } catch (loadError) {
          console.error(
            "Unable to load applications:",
            loadError
          );

          if (!cancelled) {
            setError(
              "Cannot connect to the ALMVE server. Make sure the backend is running on port 5000."
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================
     REMOVE DUPLICATES
  ========================================= */

  const uniqueApplications =
    useMemo(() => {
      const map =
        new Map<
          string,
          Application
        >();

      applicationList.forEach(
        (application) => {
          map.set(
            application.applicationId,
            application
          );
        }
      );

      return Array.from(
        map.values()
      );
    }, [applicationList]);

  /* =========================================
     SEARCH + FILTER
  ========================================= */

  const filteredApplications =
    useMemo(() => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      return uniqueApplications.filter(
        (application) => {
          const matchesFilter =
            filter === "All" ||
            application.status ===
              filter;

          const searchableText =
            [
              application.applicationId,
              application.businessId,
              application.instrumentId,
              application.applicant,
              application.instrument,
              application.applicationType,
              application.location,
              application.inspector,
              application.assignedOfficerId,
              application.assignedGatcId,
              application.status,
            ]
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            searchableText.includes(
              searchText
            );

          return (
            matchesFilter &&
            matchesSearch
          );
        }
      );
    }, [
      uniqueApplications,
      search,
      filter,
    ]);

  /* =========================================
     STATISTICS
  ========================================= */

  const totalApplications =
    uniqueApplications.length;

  const approvedApplications =
    uniqueApplications.filter(
      (item) =>
        item.status ===
          "Approved" ||
        item.status ===
          "Completed"
    ).length;

  const pendingApplications =
    uniqueApplications.filter(
      (item) =>
        item.status ===
          "Pending" ||
        item.status ===
          "Submitted" ||
        item.status ===
          "Scheduled"
    ).length;

  const rejectedApplications =
    uniqueApplications.filter(
      (item) =>
        item.status ===
        "Rejected"
    ).length;

  /* =========================================
     NEW APPLICATION
  ========================================= */

  const handleNewApplication =
    () => {
      navigate(
        "/merchant/register-instrument"
      );
    };

  /* =========================================
     VIEW APPLICATION
  ========================================= */

  const handleViewApplication =
    (
      application: Application
    ) => {
      setSelectedApplication(
        application
      );
    };

  /* =========================================
     CLOSE MODAL
  ========================================= */

  const closeModal = () => {
    setSelectedApplication(
      null
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

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <p className="text-sm font-semibold text-green-700">
              Merchant Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
              Applications
            </h1>

            <p className="mt-2 text-base text-slate-500">
              Track your legal metrology verification applications.
            </p>

          </div>

          <button
            type="button"
            onClick={
              handleNewApplication
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3.5 font-semibold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800 active:scale-95"
          >

            <Plus size={20} />

            New Application

          </button>

        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-700 shadow-sm hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* =====================================
            STATISTICS
        ===================================== */}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Applications"
            value={String(
              totalApplications
            )}
            icon={
              <FileText
                size={23}
              />
            }
            iconClass="bg-green-100 text-green-700"
          />

          <StatCard
            title="Approved"
            value={String(
              approvedApplications
            ).padStart(2, "0")}
            icon={
              <CheckCircle
                size={23}
              />
            }
            iconClass="bg-emerald-100 text-emerald-700"
          />

          <StatCard
            title="Pending / Submitted"
            value={String(
              pendingApplications
            ).padStart(2, "0")}
            icon={
              <Clock
                size={23}
              />
            }
            iconClass="bg-amber-100 text-amber-700"
          />

          <StatCard
            title="Rejected"
            value={String(
              rejectedApplications
            ).padStart(2, "0")}
            icon={
              <XCircle
                size={23}
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

            {/* Search */}

            <div className="relative w-full lg:max-w-xl">

              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by application, business, instrument..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
              />

            </div>

            {/* Filter */}

            <div className="flex flex-wrap gap-2">

              <FilterButton
                label="All"
                active={
                  filter ===
                  "All"
                }
                onClick={() =>
                  setFilter(
                    "All"
                  )
                }
              />

              <FilterButton
                label="Submitted"
                active={
                  filter ===
                  "Submitted"
                }
                onClick={() =>
                  setFilter(
                    "Submitted"
                  )
                }
              />

              <FilterButton
                label="Pending"
                active={
                  filter ===
                  "Pending"
                }
                onClick={() =>
                  setFilter(
                    "Pending"
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
                label="Approved"
                active={
                  filter ===
                  "Approved"
                }
                onClick={() =>
                  setFilter(
                    "Approved"
                  )
                }
              />

              <FilterButton
                label="Rejected"
                active={
                  filter ===
                  "Rejected"
                }
                onClick={() =>
                  setFilter(
                    "Rejected"
                  )
                }
              />

            </div>

          </div>

        </div>

        {/* =====================================
            TABLE
        ===================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-6">

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Verification Applications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredApplications.length} applications found
                </p>

              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">

                <ClipboardList
                  size={16}
                />

                Dataset-aligned application records

              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1450px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <TableHead>
                    Application ID
                  </TableHead>

                  <TableHead>
                    Business ID
                  </TableHead>

                  <TableHead>
                    Instrument ID
                  </TableHead>

                  <TableHead>
                    Application Type
                  </TableHead>

                  <TableHead>
                    Submission Date
                  </TableHead>

                  <TableHead>
                    Preferred Date
                  </TableHead>

                  <TableHead>
                    Location
                  </TableHead>

                  <TableHead>
                    Officer
                  </TableHead>

                  <TableHead>
                    GATC / LMO
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

                {loading ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-6 py-16 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />

                        <h3 className="text-lg font-semibold text-slate-800">
                          Loading applications...
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Fetching data from PostgreSQL.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredApplications.length > 0 ? (

                  filteredApplications.map(
                    (
                      application
                    ) => (

                      <tr
                        key={
                          application.applicationId
                        }
                        className="transition hover:bg-green-50/30"
                      >

                        {/* Application ID */}

                        <TableCell>

                          <button
                            type="button"
                            onClick={() =>
                              handleViewApplication(
                                application
                              )
                            }
                            className="font-bold text-green-700 hover:text-green-800 hover:underline"
                          >
                            {
                              application.applicationId
                            }
                          </button>

                        </TableCell>

                        {/* Business ID */}

                        <TableCell>

                          <span className="font-semibold text-slate-800">

                            {
                              application.businessId
                            }

                          </span>

                        </TableCell>

                        {/* Instrument */}

                        <TableCell>

                          <span className="font-semibold text-slate-800">

                            {
                              application.instrumentId
                            }

                          </span>

                        </TableCell>

                        {/* Application Type */}

                        <TableCell>

                          <span className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">

                            {
                              application.applicationType
                            }

                          </span>

                        </TableCell>

                        {/* Submission Date */}

                        <TableCell>

                          <span className="text-sm text-slate-600">

                            {
                              application.submissionDate
                            }

                          </span>

                        </TableCell>

                        {/* Preferred Date */}

                        <TableCell>

                          <span className="text-sm text-slate-600">

                            {
                              application.preferredDate ||
                              "Not set"
                            }

                          </span>

                        </TableCell>

                        {/* Location */}

                        <TableCell>

                          <div className="flex items-center gap-2">

                            <MapPin
                              size={15}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="max-w-[150px] truncate text-sm text-slate-600">

                              {
                                application.location
                              }

                            </span>

                          </div>

                        </TableCell>

                        {/* Officer */}

                        <TableCell>

                          <span className="text-sm text-slate-600">

                            {
                              application.assignedOfficerId ||
                              application.inspector ||
                              "Not Assigned"
                            }

                          </span>

                        </TableCell>

                        {/* GATC */}

                        <TableCell>

                          <span className="text-sm text-slate-600">

                            {
                              application.assignedGatcId ||
                              "Not Assigned"
                            }

                          </span>

                        </TableCell>

                        {/* Status */}

                        <TableCell>

                          <StatusBadge
                            status={
                              application.status
                            }
                          />

                        </TableCell>

                        {/* Action */}

                        <TableCell>

                          <button
                            type="button"
                            onClick={() =>
                              handleViewApplication(
                                application
                              )
                            }
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 active:scale-95"
                          >

                            <Eye size={17} />

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
                      className="px-6 py-16 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                          <Search
                            size={25}
                            className="text-slate-400"
                          />

                        </div>

                        <h3 className="text-lg font-semibold text-slate-800">

                          No applications found

                        </h3>

                        <p className="mt-1 text-sm text-slate-500">

                          Try another search or filter.

                        </p>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =====================================
            DETAILS MODAL
        ===================================== */}

        {selectedApplication && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onClick={
              closeModal
            }
          >

            <div
              className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >

              {/* Header */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

                <div>

                  <p className="text-sm font-semibold text-green-700">

                    Verification Application

                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">

                    {
                      selectedApplication.applicationId
                    }

                  </h2>

                </div>

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >

                  <X
                    size={21}
                  />

                </button>

              </div>

              {/* Details */}

              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">

                <Detail
                  icon={
                    <FileText
                      size={18}
                    />
                  }
                  label="Application ID"
                  value={
                    selectedApplication.applicationId
                  }
                />

                <Detail
                  icon={
                    <Building2
                      size={18}
                    />
                  }
                  label="Business ID"
                  value={
                    selectedApplication.businessId
                  }
                />

                <Detail
                  icon={
                    <ClipboardList
                      size={18}
                    />
                  }
                  label="Instrument ID"
                  value={
                    selectedApplication.instrumentId
                  }
                />

                <Detail
                  icon={
                    <User
                      size={18}
                    />
                  }
                  label="Applicant"
                  value={
                    selectedApplication.applicant
                  }
                />

                <Detail
                  icon={
                    <FileText
                      size={18}
                    />
                  }
                  label="Application Type"
                  value={
                    selectedApplication.applicationType
                  }
                />

                <Detail
                  icon={
                    <CalendarDays
                      size={18}
                    />
                  }
                  label="Submission Date"
                  value={
                    selectedApplication.submissionDate
                  }
                />

                <Detail
                  icon={
                    <CalendarDays
                      size={18}
                    />
                  }
                  label="Preferred Date"
                  value={
                    selectedApplication.preferredDate ||
                    "Not set"
                  }
                />

                <Detail
                  icon={
                    <CalendarDays
                      size={18}
                    />
                  }
                  label="Appointment"
                  value={
                    selectedApplication.appointmentDate
                      ? `${selectedApplication.appointmentDate}${
                          selectedApplication.appointmentTime
                            ? ` at ${selectedApplication.appointmentTime}`
                            : ""
                        }`
                      : "Not scheduled"
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
                    selectedApplication.location
                  }
                />

                <Detail
                  icon={
                    <User
                      size={18}
                    />
                  }
                  label="Assigned Officer"
                  value={
                    selectedApplication.assignedOfficerId ||
                    "Not Assigned"
                  }
                />

                <Detail
                  icon={
                    <Building2
                      size={18}
                    />
                  }
                  label="Assigned GATC / LMO"
                  value={
                    selectedApplication.assignedGatcId ||
                    "Not Assigned"
                  }
                />

                <Detail
                  icon={
                    <User
                      size={18}
                    />
                  }
                  label="Inspector"
                  value={
                    selectedApplication.inspector
                  }
                />

                <div className="rounded-xl bg-slate-50 p-4">

                  <div className="flex items-center gap-2 text-slate-400">

                    <CheckCircle
                      size={18}
                    />

                    <p className="text-xs font-semibold uppercase tracking-wide">

                      Status

                    </p>

                  </div>

                  <div className="mt-2">

                    <StatusBadge
                      status={
                        selectedApplication.status
                      }
                    />

                  </div>

                </div>

                <div className="md:col-span-2 rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                    Remarks

                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">

                    {
                      selectedApplication.remarks ||
                      "No remarks available."
                    }

                  </p>

                </div>

                <div className="md:col-span-2 rounded-xl border border-slate-100 bg-white p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                    Created At

                  </p>

                  <p className="mt-2 text-sm text-slate-600">

                    {
                      selectedApplication.createdAt
                        ? new Date(
                            selectedApplication.createdAt
                          ).toLocaleString(
                            "en-IN"
                          )
                        : "Not available"
                    }

                  </p>

                </div>

              </div>

              {/* Footer */}

              <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                >

                  Close

                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/merchant/applications/${selectedApplication.applicationId}`
                    )
                  }
                  className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
                >

                  Open Application

                </button>

              </div>

            </div>

          </div>

        )}

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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div
        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
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
  status: ApplicationStatus;
}) {
  const styles: Record<
    ApplicationStatus,
    string
  > = {
    Submitted:
      "bg-blue-100 text-blue-700",

    Pending:
      "bg-amber-100 text-amber-700",

    Scheduled:
      "bg-violet-100 text-violet-700",

    Completed:
      "bg-emerald-100 text-emerald-700",

    Approved:
      "bg-green-100 text-green-700",

    Rejected:
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
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-slate-400">

        {icon}

        <p className="text-xs font-semibold uppercase tracking-wide">

          {label}

        </p>

      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-800">

        {value}

      </p>

    </div>
  );
}

export default Applications;