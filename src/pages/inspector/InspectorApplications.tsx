import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  MapPin,
  PlayCircle,
  Search,
} from "lucide-react";

type ApplicationStatus = "Pending" | "Scheduled" | "Completed";

interface AssignedApplication {
  id: string;
  instrumentId: string;
  instrument: string;
  applicant: string;
  location: string;
  appointment: string;
  inspector: string;
  status: ApplicationStatus;
}

interface InspectorProfile {
  name: string;
  employeeId: string;
  region: string;
}

function formatAppointment(date: unknown, time: unknown) {
  if (typeof date !== "string" || !date.trim()) return "";
  let formattedDate = date.trim();
  const parts = formattedDate.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts.map(Number);
    const parsed = new Date(y, m - 1, d);
    if (!Number.isNaN(parsed.getTime())) {
      formattedDate = parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  if (typeof time === "string" && time.trim()) {
    const tp = time.trim().split(":");
    if (tp.length >= 2) {
      const hour = Number(tp[0]);
      const minute = Number(tp[1]);
      if (Number.isFinite(hour) && Number.isFinite(minute)) {
        const period = hour >= 12 ? "PM" : "AM";
        const h12 = hour % 12 || 12;
        return `${formattedDate}, ${h12}:${String(minute).padStart(2, "0")} ${period}`;
      }
    }
    return `${formattedDate}, ${time.trim()}`;
  }
  return formattedDate;
}

function normalizeStatus(value: unknown): ApplicationStatus {
  const status = String(value ?? "").trim();
  if (status === "Completed" || status === "Approved") return "Completed";
  if (status === "Scheduled" || status === "Inspection Scheduled") return "Scheduled";
  return "Pending";
}

function normalizeApplication(value: Record<string, unknown>): AssignedApplication {
  // Always prefer the human-readable application number returned by the backend.
  // This prevents a numeric DB id from being used in the URL accidentally.
  const applicationId =
    value.applicationId ??
    value.application_number ??
    value.applicationNumber ??
    value.id ??
    "";

  return {
    id: String(applicationId),
    instrumentId: String(value.instrumentId ?? value.instrument_id ?? value.instrument ?? "N/A"),
    instrument: String(value.instrumentType ?? value.instrument_type ?? value.instrument ?? "Unknown Instrument"),
    applicant: String(value.merchant ?? value.businessName ?? value.applicant ?? "Unknown Applicant"),
    location: String(value.location ?? "Not specified"),
    appointment: formatAppointment(value.appointmentDate ?? value.appointment_date, value.appointmentTime ?? value.appointment_time),
    inspector: String(value.inspector ?? value.inspectorName ?? ""),
    status: normalizeStatus(value.status),
  };
}

async function apiRequest<T>(url: string): Promise<T> {
  const token = localStorage.getItem("almveToken");
  if (!token) throw new Error("Authentication token not found. Please login again.");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  let data: unknown = null;
  try { data = await response.json(); } catch {}

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: unknown }).message ?? `Request failed with status ${response.status}.`)
        : `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return data as T;
}

function InspectorApplications() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | ApplicationStatus>("All");
  const [applications, setApplications] = useState<AssignedApplication[]>([]);
  const [profile, setProfile] = useState<InspectorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest<{
        success: boolean;
        profile?: InspectorProfile;
        applications?: unknown[];
      }>("https://maapsetu-w1sf.onrender.com/api/inspector/applications");

      const mapped = Array.isArray(response.applications)
        ? response.applications
            .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
            .map(normalizeApplication)
        : [];

      setApplications(mapped);
      if (response.profile) setProfile(response.profile);
    } catch (err) {
      console.error("Failed to load inspector applications:", err);
      setError(err instanceof Error ? err.message : "Unable to load assigned applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadApplications(); }, []);

  const filteredApplications = useMemo(() => {
    const text = search.trim().toLowerCase();
    return applications.filter((application) => {
      const searchable = [
        application.id,
        application.instrumentId,
        application.instrument,
        application.applicant,
        application.location,
        application.appointment,
        application.inspector,
        application.status,
      ].join(" ").toLowerCase();

      return searchable.includes(text) &&
        (selectedStatus === "All" || application.status === selectedStatus);
    });
  }, [applications, search, selectedStatus]);

  const totalAssigned = applications.length;
  const pendingCount = applications.filter((a) => a.status === "Pending").length;
  const scheduledCount = applications.filter((a) => a.status === "Scheduled").length;
  const completedCount = applications.filter((a) => a.status === "Completed").length;

  const openDetails = (id: string) =>
    navigate(`/inspector/applications/${encodeURIComponent(id)}`);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/inspector/dashboard")}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} /> Back to Inspector Dashboard
        </button>

        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Inspector Portal</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
              Assigned Applications
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Review and manage verification applications assigned to you.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Inspector</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{profile?.name || "Inspector"}</p>
            <p className="mt-1 text-xs text-slate-400">
              {profile?.employeeId ? `Inspector ID: ${profile.employeeId}` : "Inspector"}
              {profile?.region ? ` • ${profile.region}` : ""}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-red-700">Unable to load assigned applications</p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void loadApplications()}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Assigned" value={String(totalAssigned)} icon={<ClipboardList size={22} />} iconClass="bg-blue-100 text-blue-600" />
          <StatCard title="Pending" value={String(pendingCount)} icon={<Clock3 size={22} />} iconClass="bg-orange-100 text-orange-600" />
          <StatCard title="Scheduled" value={String(scheduledCount)} icon={<CalendarDays size={22} />} iconClass="bg-purple-100 text-purple-600" />
          <StatCard title="Completed" value={String(completedCount)} icon={<CheckCircle2 size={22} />} iconClass="bg-green-100 text-green-600" />
        </div>

        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xl">
              <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search application, applicant, instrument..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(["All", "Pending", "Scheduled", "Completed"] as const).map((status) => (
                <FilterButton
                  key={status}
                  label={status}
                  active={selectedStatus === status}
                  onClick={() => setSelectedStatus(status)}
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
                <h2 className="text-xl font-bold text-slate-900">Verification Applications</h2>
                <p className="mt-1 text-sm text-slate-500">{filteredApplications.length} applications found</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <TableHead>Application</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Instrument</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Appointment</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                      <p className="font-semibold text-slate-700">Loading assigned applications...</p>
                    </td>
                  </tr>
                ) : filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => (
                    <tr key={application.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-5">
                        <button type="button" onClick={() => openDetails(application.id)} className="font-bold text-blue-600 hover:underline">
                          {application.id}
                        </button>
                        <p className="mt-1 text-xs text-slate-400">{application.instrumentId}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-800">{application.applicant}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="max-w-[220px] text-sm font-semibold text-slate-700">{application.instrument}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin size={15} className="text-slate-400" />
                          {application.location}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {application.appointment ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays size={15} className="text-slate-400" />
                            {application.appointment}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Not scheduled</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-slate-600">
                          {application.inspector || "Not assigned"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={application.status} />
                      </td>
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => openDetails(application.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        >
                          {application.status === "Completed" ? <Eye size={16} /> : <PlayCircle size={16} />}
                          {application.status === "Completed" ? "View" : "Review"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                          <Search size={26} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">No applications found</h3>
                        <p className="mt-1 text-sm text-slate-500">No applications are currently assigned to this inspector.</p>
                      </div>
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

function StatCard({ title, value, icon, iconClass }: {
  title: string; value: string; icon: ReactNode; iconClass: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>{icon}</div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function FilterButton({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styles: Record<ApplicationStatus, string> = {
    Pending: "bg-orange-100 text-orange-700",
    Scheduled: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
  };

  const icons: Record<ApplicationStatus, ReactNode> = {
    Pending: <AlertCircle size={13} />,
    Scheduled: <CalendarDays size={13} />,
    Completed: <CheckCircle2 size={13} />,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
}

function TableHead({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-600">{children}</th>;
}

export default InspectorApplications;
