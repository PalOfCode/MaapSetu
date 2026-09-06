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
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  MapPin,
  Search,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

type ApplicationStatus =
  | "Pending"
  | "Scheduled"
  | "Completed"
  | "Rejected";

type InspectorStatus =
  | "Available"
  | "Busy"
  | "Inactive";

interface Application {
  id: string;
  merchant: string;
  email: string;
  instrumentId: string;
  instrumentType: string;
  manufacturer: string;
  location: string;
  submittedDate: string;
  status: ApplicationStatus;
  inspector: string;
  appointmentDate: string;
  appointmentTime: string;
}

interface Inspector {
  id: string;
  name: string;
  employeeId: string;
  region: string;
  status: InspectorStatus;
  assignedApplications: number;
}

function normalizeStatus(value: unknown): ApplicationStatus {
  const status = String(value ?? "").trim();

  if (status === "Scheduled") return "Scheduled";
  if (status === "Completed") return "Completed";
  if (status === "Rejected") return "Rejected";

  return "Pending";
}

function normalizeApplication(
  value: Record<string, unknown>
): Application {
  return {
    // IMPORTANT: the admin API returns both `id` (DB primary key) and
    // `applicationId` (the real application number such as APP-...).
    // Assignment/status routes expect the application number.
    id: String(
      value.applicationId ??
        value.application_number ??
        value.id ??
        ""
    ),
    merchant: String(
      value.businessName ??
        value.merchant ??
        value.applicant ??
        "Current Merchant"
    ),
    email: String(
      value.businessEmail ??
        value.email ??
        "Not Available"
    ),
    instrumentId: String(
      value.instrumentId ??
        value.instrument_code ??
        value.instrument ??
        "N/A"
    ),
    instrumentType: String(
      value.instrumentType ??
        value.type ??
        "Instrument"
    ),
    manufacturer: String(
      value.manufacturer ??
        "Not Available"
    ),
    location: String(
      value.location ??
        value.instrumentLocation ??
        "Not Provided"
    ),
    submittedDate: String(
      value.submittedDate ??
        value.submittedAt ??
        value.submitted ??
        ""
    ),
    status: normalizeStatus(value.status),
    inspector: String(
      value.inspector ??
        value.inspectorName ??
        ""
    ),
    appointmentDate: String(
      value.appointmentDate ?? ""
    ),
    appointmentTime: String(
      value.appointmentTime ?? ""
    ),
  };
}

function normalizeInspector(
  value: Record<string, unknown>
): Inspector {
  const rawStatus = String(
    value.status ?? "Available"
  );

  return {
    id: String(value.id ?? ""),
    name: String(value.name ?? ""),
    employeeId: String(
      value.employeeId ?? value.employee_id ?? ""
    ),
    region: String(value.region ?? ""),
    status:
      rawStatus === "Inactive"
        ? "Inactive"
        : rawStatus === "Busy"
        ? "Busy"
        : "Available",
    assignedApplications: Number(
      value.assignedApplications ??
        value.assigned_applications ??
        0
    ),
  };
}

async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    localStorage.getItem("almveToken");

  if (!token) {
    throw new Error(
      "Authentication token not found. Please login again."
    );
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    // Keep data null if the backend returns no JSON.
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data
        ? String(
            (data as { message?: unknown }).message ??
              `Request failed with status ${response.status}.`
          )
        : `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return data as T;
}

function AdminApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [inspectors, setInspectors] =
    useState<Inspector[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | ApplicationStatus>("All");

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [selectedInspector, setSelectedInspector] =
    useState("");

  const [appointmentDate, setAppointmentDate] =
    useState("");

  const [appointmentTime, setAppointmentTime] =
    useState("");

  const [gatcId, setGatcId] =
    useState("GATC-001");

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<"success" | "error">("success");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const loadData = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [
        applicationsResponse,
        inspectorsResponse,
      ] = await Promise.all([
        apiRequest<{
          success: boolean;
          applications?: unknown[];
          message?: string;
        }>(
          "http://localhost:5000/api/admin/applications"
        ),

        apiRequest<{
          success: boolean;
          inspectors?: unknown[];
          message?: string;
        }>(
          "http://localhost:5000/api/admin/inspectors"
        ),
      ]);

      const normalizedApplications =
        Array.isArray(
          applicationsResponse.applications
        )
          ? applicationsResponse.applications
              .filter(
                (
                  item
                ): item is Record<
                  string,
                  unknown
                > =>
                  typeof item ===
                    "object" &&
                  item !== null
              )
              .map(
                normalizeApplication
              )
          : [];

      const normalizedInspectors =
        Array.isArray(
          inspectorsResponse.inspectors
        )
          ? inspectorsResponse.inspectors
              .filter(
                (
                  item
                ): item is Record<
                  string,
                  unknown
                > =>
                  typeof item ===
                    "object" &&
                  item !== null
              )
              .map(normalizeInspector)
          : [];

      setApplications(
        normalizedApplications
      );

      setInspectors(
        normalizedInspectors
      );
    } catch (error) {
      console.error(
        "Failed to load admin applications:",
        error
      );

      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load applications."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredApplications =
    useMemo(() => {
      const text =
        search.trim().toLowerCase();

      return applications.filter(
        (application) => {
          const searchable = [
            application.id,
            application.merchant,
            application.email,
            application.instrumentId,
            application.instrumentType,
            application.manufacturer,
            application.location,
            application.inspector,
            application.status,
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            searchable.includes(text);

          const matchesStatus =
            statusFilter === "All" ||
            application.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      applications,
      search,
      statusFilter,
    ]);

  const total =
    applications.length;

  const pending =
    applications.filter(
      (item) =>
        item.status ===
          "Pending"
    ).length;

  const scheduled =
    applications.filter(
      (item) =>
        item.status ===
        "Scheduled"
    ).length;

  const completed =
    applications.filter(
      (item) =>
        item.status ===
        "Completed"
    ).length;

  const rejected =
    applications.filter(
      (item) =>
        item.status ===
        "Rejected"
    ).length;

  const openReview = (
    application: Application
  ) => {
    setSelectedApplication(
      application
    );
    setSelectedInspector(
      application.inspector
    );
    setAppointmentDate(
      application.appointmentDate
    );
    setAppointmentTime(
      application.appointmentTime
    );
    setMessage("");
    setGatcId("GATC-001");
  };

  const closeReview = () => {
    if (isSaving) return;

    setSelectedApplication(
      null
    );
    setSelectedInspector("");
    setAppointmentDate("");
    setAppointmentTime("");
    setGatcId("GATC-001");
    setMessage("");
  };

  const selectedInspectorData =
    inspectors.find(
      (item) =>
        item.name ===
        selectedInspector
    );

  const saveAssignment =
    async () => {
      if (!selectedApplication) {
        return;
      }

      setMessage("");

      if (!selectedInspector) {
        setMessageType("error");
        setMessage(
          "Please select an inspector."
        );
        return;
      }

      if (!appointmentDate) {
        setMessageType("error");
        setMessage(
          "Please select an appointment date."
        );
        return;
      }

      if (!appointmentTime) {
        setMessageType("error");
        setMessage(
          "Please select an appointment time."
        );
        return;
      }

      if (
        selectedInspectorData?.status ===
        "Inactive"
      ) {
        setMessageType("error");
        setMessage(
          "This inspector is inactive and cannot be assigned."
        );
        return;
      }

      setIsSaving(true);

      try {
        const response =
          await apiRequest<{
            success: boolean;
            message?: string;
            application?: Record<
              string,
              unknown
            >;
          }>(
            `http://localhost:5000/api/admin/applications/${encodeURIComponent(
              selectedApplication.id
            )}/assign`,
            {
              method: "PATCH",
              body: JSON.stringify({
                inspectorId:
                  selectedInspectorData?.id,
                appointmentDate,
                appointmentTime,
                gatcId,
              }),
            }
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to assign inspector."
          );
        }

        setMessageType("success");
        setMessage(
          response.message ||
            "Inspector assigned successfully."
        );

        await loadData();

        const updated =
          response.application;

        if (updated) {
          setSelectedApplication(
            normalizeApplication(
              updated
            )
          );
        }
      } catch (error) {
        console.error(
          "Assign inspector error:",
          error
        );

        setMessageType("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to assign inspector."
        );
      } finally {
        setIsSaving(false);
      }
    };

  const rejectApplication =
    async () => {
      if (!selectedApplication) {
        return;
      }

      setIsSaving(true);
      setMessage("");

      try {
        const response =
          await apiRequest<{
            success: boolean;
            message?: string;
          }>(
            `http://localhost:5000/api/admin/applications/${encodeURIComponent(
              selectedApplication.id
            )}/status`,
            {
              method: "PATCH",
              body: JSON.stringify({
                status: "Rejected",
              }),
            }
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to reject application."
          );
        }

        setMessageType("success");
        setMessage(
          response.message ||
            "Application rejected successfully."
        );

        await loadData();

        setSelectedApplication(
          (current) =>
            current
              ? {
                  ...current,
                  status: "Rejected",
                  inspector: "",
                  appointmentDate:
                    "",
                  appointmentTime:
                    "",
                }
              : null
        );
      } catch (error) {
        console.error(
          "Reject application error:",
          error
        );

        setMessageType("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to reject application."
        );
      } finally {
        setIsSaving(false);
      }
    };

  const markCompleted =
    async () => {
      if (!selectedApplication) {
        return;
      }

      setIsSaving(true);
      setMessage("");

      try {
        const response =
          await apiRequest<{
            success: boolean;
            message?: string;
          }>(
            `http://localhost:5000/api/admin/applications/${encodeURIComponent(
              selectedApplication.id
            )}/status`,
            {
              method: "PATCH",
              body: JSON.stringify({
                status: "Completed",
              }),
            }
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to complete application."
          );
        }

        setMessageType("success");
        setMessage(
          response.message ||
            "Application marked as completed."
        );

        await loadData();

        setSelectedApplication(
          (current) =>
            current
              ? {
                  ...current,
                  status: "Completed",
                }
              : null
        );
      } catch (error) {
        console.error(
          "Complete application error:",
          error
        );

        setMessageType("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to complete application."
        );
      } finally {
        setIsSaving(false);
      }
    };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

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

        <div className="mb-7">
          <p className="text-sm font-semibold text-blue-600">
            Administrator Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
            Application Management
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
            Review applications, assign inspectors and schedule verification appointments.
          </p>
        </div>

        {loadError && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">
            <div>
              <p className="font-semibold text-red-700">
                Unable to load applications
              </p>

              <p className="mt-1 text-sm text-red-600">
                {loadError}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadData()
              }
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Applications"
            value={String(total)}
            icon={
              <ClipboardList size={22} />
            }
            iconClass="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Pending Review"
            value={String(pending)}
            icon={<Clock size={22} />}
            iconClass="bg-orange-100 text-orange-600"
          />

          <StatCard
            title="Scheduled"
            value={String(scheduled)}
            icon={
              <CalendarDays size={22} />
            }
            iconClass="bg-purple-100 text-purple-600"
          />

          <StatCard
            title="Completed"
            value={String(completed)}
            icon={
              <CheckCircle2 size={22} />
            }
            iconClass="bg-green-100 text-green-600"
          />

          <StatCard
            title="Rejected"
            value={String(rejected)}
            icon={<UserX size={22} />}
            iconClass="bg-red-100 text-red-600"
          />
        </div>

        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
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
                placeholder="Search application, merchant, instrument..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  "All",
                  "Pending",
                  "Scheduled",
                  "Completed",
                  "Rejected",
                ] as const
              ).map((value) => (
                <FilterButton
                  key={value}
                  label={value}
                  active={
                    statusFilter === value
                  }
                  onClick={() =>
                    setStatusFilter(
                      value
                    )
                  }
                />
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <ClipboardList size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Verification Applications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredApplications.length}{" "}
                  applications found
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Instrument</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Appointment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center"
                    >
                      <p className="text-sm font-medium text-slate-500">
                        Loading applications...
                      </p>
                    </td>
                  </tr>
                ) : filteredApplications.length >
                  0 ? (
                  filteredApplications.map(
                    (application) => (
                      <tr
                        key={application.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-blue-600">
                            {application.id}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {application.instrumentId}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-700">
                            {application.merchant}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {application.email}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-700">
                            {application.instrumentType}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {application.manufacturer}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin
                              size={16}
                              className="text-slate-400"
                            />
                            {application.location}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          {application.inspector ? (
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                                {application.inspector
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span className="text-sm font-semibold text-slate-700">
                                {application.inspector}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Not assigned
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          {application.appointmentDate ? (
                            <div>
                              <p className="text-sm font-semibold text-slate-700">
                                {application.appointmentDate}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {application.appointmentTime}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Not scheduled
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            status={
                              application.status
                            }
                          />
                        </td>

                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              openReview(
                                application
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye size={16} />
                            Review
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
                      <ClipboardList
                        size={42}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <h3 className="text-lg font-semibold text-slate-800">
                        No applications found
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

      {selectedApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={closeReview}
        >
          <div
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Application Review
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selectedApplication.id}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review application and manage verification scheduling.
                </p>
              </div>

              <button
                type="button"
                onClick={closeReview}
                disabled={isSaving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <section>
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  Application Details
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailBox
                    label="Merchant"
                    value={selectedApplication.merchant}
                  />

                  <DetailBox
                    label="Email"
                    value={selectedApplication.email}
                  />

                  <DetailBox
                    label="Instrument ID"
                    value={selectedApplication.instrumentId}
                  />

                  <DetailBox
                    label="Instrument Type"
                    value={selectedApplication.instrumentType}
                  />

                  <DetailBox
                    label="Manufacturer"
                    value={selectedApplication.manufacturer}
                  />

                  <DetailBox
                    label="Location"
                    value={selectedApplication.location}
                  />

                  <DetailBox
                    label="Submitted Date"
                    value={selectedApplication.submittedDate}
                  />

                  <DetailBox
                    label="Current Status"
                    value={selectedApplication.status}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <UserCheck size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold text-blue-900">
                      Assign Inspector
                    </h3>

                    <p className="text-sm text-blue-700">
                      Select an available inspector for this application.
                    </p>
                  </div>
                </div>

                <select
                  value={selectedInspector}
                  onChange={(event) =>
                    setSelectedInspector(
                      event.target.value
                    )
                  }
                  disabled={isSaving}
                  className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                >
                  <option value="">
                    Select Inspector
                  </option>

                  {inspectors.map(
                    (inspector) => (
                      <option
                        key={inspector.id}
                        value={inspector.name}
                        disabled={
                          inspector.status ===
                          "Inactive"
                        }
                      >
                        {inspector.name} —{" "}
                        {inspector.status} —{" "}
                        {inspector.assignedApplications} assigned
                      </option>
                    )
                  )}
                </select>

                {selectedInspectorData && (
                  <div className="mt-4 rounded-xl bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                          {selectedInspectorData.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {selectedInspectorData.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {selectedInspectorData.employeeId}{" "}
                            •{" "}
                            {selectedInspectorData.region}
                          </p>
                        </div>
                      </div>

                      <InspectorStatusBadge
                        status={
                          selectedInspectorData.status
                        }
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Briefcase size={15} />
                          <p className="text-xs">
                            Current Workload
                          </p>
                        </div>

                        <p className="mt-1 text-lg font-bold text-slate-800">
                          {
                            selectedInspectorData.assignedApplications
                          }
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Assignment Status
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {selectedInspectorData.status ===
                          "Available"
                            ? "Ready for assignment"
                            : selectedInspectorData.status ===
                              "Busy"
                            ? "Currently busy"
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <CalendarDays size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold text-orange-900">
                      Schedule Appointment
                    </h3>

                    <p className="text-sm text-orange-700">
                      Set the field verification date and time.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="appointmentDate"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Appointment Date
                    </label>

                    <input
                      id="appointmentDate"
                      type="date"
                      value={appointmentDate}
                      onChange={(event) =>
                        setAppointmentDate(
                          event.target.value
                        )
                      }
                      disabled={isSaving}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="appointmentTime"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Appointment Time
                    </label>

                    <input
                      id="appointmentTime"
                      type="time"
                      value={appointmentTime}
                      onChange={(event) =>
                        setAppointmentTime(
                          event.target.value
                        )
                      }
                      disabled={isSaving}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="gatcId"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      GATC / LMO
                    </label>

                    <select
                      id="gatcId"
                      value={gatcId}
                      onChange={(event) =>
                        setGatcId(
                          event.target.value
                        )
                      }
                      disabled={isSaving}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                    >
                      <option value="GATC-001">
                        GATC-001
                      </option>

                      <option value="GATC-002">
                        GATC-002
                      </option>

                      <option value="GATC-003">
                        GATC-003
                      </option>
                    </select>
                  </div>
                </div>
              </section>

              {message && (
                <div
                  className={`rounded-xl border p-4 ${
                    messageType ===
                    "success"
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      messageType ===
                      "success"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {message}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:flex-wrap sm:justify-end">
                {selectedApplication.status ===
                  "Pending" && (
                  <button
                    type="button"
                    onClick={() =>
                      void rejectApplication()
                    }
                    disabled={isSaving}
                    className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {isSaving
                      ? "Please wait..."
                      : "Reject Application"}
                  </button>
                )}

                {selectedApplication.status ===
                  "Scheduled" && (
                  <button
                    type="button"
                    onClick={() =>
                      void markCompleted()
                    }
                    disabled={isSaving}
                    className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                  >
                    {isSaving
                      ? "Please wait..."
                      : "Mark Completed"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeReview}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Close
                </button>

                {selectedApplication.status !==
                  "Completed" &&
                  selectedApplication.status !==
                    "Rejected" && (
                    <button
                      type="button"
                      onClick={() =>
                        void saveAssignment()
                      }
                      disabled={
                        isSaving ||
                        selectedInspectorData?.status ===
                          "Inactive"
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      <UserCheck size={18} />
                      {isSaving
                        ? "Saving..."
                        : "Assign & Schedule"}
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TableHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

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
          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
          : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  const styles: Record<
    ApplicationStatus,
    string
  > = {
    Pending:
      "bg-amber-100 text-amber-700",
    Scheduled:
      "bg-purple-100 text-purple-700",
    Completed:
      "bg-emerald-100 text-emerald-700",
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

function InspectorStatusBadge({
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
      "bg-amber-100 text-amber-700",
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

      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default AdminApplications;
