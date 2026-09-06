import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  CalendarDays,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";

type ApplicationStatus =
  | "Submitted"
  | "Pending"
  | "Approved"
  | "Rejected";

interface Application {
  id: string;
  applicant: string;
  instrument: string;
  type: string;
  submitted: string;
  inspector: string;
  status: ApplicationStatus;
  businessId: string;
  location: string;
  remarks: string;
}

/* =========================================
   DATA IS LOADED FROM THE API
========================================= */

/* =========================================
   COMPONENT
========================================= */

function ApplicationDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [application, setApplication] =
    useState<Application | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ======================================
     LOAD APPLICATION FROM BACKEND
  ====================================== */

  useEffect(() => {
    let cancelled = false;

    const loadApplication = async () => {
      if (!id) {
        if (!cancelled) {
          setError("Application ID is missing.");
          setLoading(false);
        }
        return;
      }

      const token =
        localStorage.getItem("almveToken");

      if (!token) {
        if (!cancelled) {
          setError(
            "Your session has expired. Please login again."
          );
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://localhost:5000/api/applications/${encodeURIComponent(
            id
          )}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let data: {
          success?: boolean;
          message?: string;
          application?: {
            id?: number;
            application_number?: string;
            business_id?: number | string;
            business_name?: string;
            instrument_id?: number | string;
            instrument_code?: string;
            instrument_type?: string;
            application_type?: string;
            submitted_at?: string;
            assigned_inspector_id?: number | string | null;
            inspector_name?: string | null;
            status?: string;
            remarks?: string | null;
            location?: string | null;
            city?: string | null;
            district?: string | null;
            state?: string | null;
          };
        } | null = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (
          !response.ok ||
          !data?.success ||
          !data.application
        ) {
          if (!cancelled) {
            setError(
              data?.message ||
                "Unable to load application details."
            );
            setApplication(null);
          }
          return;
        }

        const row = data.application;

        const status =
          row.status === "Approved" ||
          row.status === "Rejected" ||
          row.status === "Pending" ||
          row.status === "Submitted"
            ? row.status
            : "Submitted";

        const location = [
          row.location,
          row.city,
          row.district,
          row.state,
        ]
          .filter(
            (value) =>
              value !== null &&
              value !== undefined &&
              String(value).trim() !== ""
          )
          .map((value) => String(value).trim())
          .join(", ");

        const mappedApplication: Application = {
          id:
            row.application_number ||
            String(row.id || id),

          applicant:
            row.business_name ||
            "Current Business",

          instrument:
            row.instrument_code ||
            String(
              row.instrument_id || "Not Available"
            ),

          type:
            row.instrument_type ||
            row.application_type ||
            "Verification",

          submitted:
            row.submitted_at
              ? new Date(
                  row.submitted_at
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )
              : "Not Available",

          inspector:
            row.inspector_name ||
            "Not Assigned",

          status,

          businessId: String(
            row.business_id ?? ""
          ),

          location:
            location ||
            "Not Provided",

          remarks:
            row.remarks || "",
        };

        if (!cancelled) {
          setApplication(
            mappedApplication
          );
        }
      } catch (requestError) {
        console.error(
          "Load application error:",
          requestError
        );

        if (!cancelled) {
          setError(
            "Cannot connect to the ALMVE server. Make sure the backend is running on port 5000."
          );
          setApplication(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadApplication();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* ======================================
     LOADING
  ====================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/merchant/applications"
              )
            }
            className="mb-6 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Back to Applications
          </button>

          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-green-700" />

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Loading Application
            </h1>

            <p className="mt-2 text-slate-500">
              Fetching the latest application details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ======================================
     NOT FOUND / ERROR
  ====================================== */

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/merchant/applications"
              )
            }
            className="mb-6 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Back to Applications
          </button>

          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle
                size={30}
                className="text-red-600"
              />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Application Not Found
            </h1>

            <p className="mt-2 text-slate-500">
              {error ||
                `We could not find application ${
                  id || "Unknown"
                }.`}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/merchant/applications"
                )
              }
              className="mt-6 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
            >
              Back to Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ======================================
     STATUS
  ====================================== */

  const isApproved =
    application.status === "Approved";

  const isRejected =
    application.status === "Rejected";

  const isPending =
    application.status === "Pending" ||
    application.status === "Submitted";

  /* ======================================
     PAGE
  ====================================== */

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-6xl">

        {/* =================================
            HEADER
        ================================= */}

        <div className="mb-7">

          <button
            type="button"
            onClick={() =>
              navigate("/merchant/applications")
            }
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
          >
            <ArrowLeft size={18} />
            Back to Applications
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold text-blue-600">
                Merchant Portal
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Application Details
              </h1>

              <p className="mt-2 text-slate-500">
                Track your verification application and its progress.
              </p>

            </div>

            <div className="rounded-xl bg-white px-5 py-4 shadow-sm">

              <p className="text-xs font-medium text-slate-400">
                Application ID
              </p>

              <p className="mt-1 text-lg font-bold text-blue-600">
                {application.id}
              </p>

            </div>

          </div>

        </div>

        {/* =================================
            STATUS BANNER
        ================================= */}

        <div
          className={`mb-6 rounded-2xl border p-5 ${
            isApproved
              ? "border-green-200 bg-green-50"
              : isRejected
              ? "border-red-200 bg-red-50"
              : "border-orange-200 bg-orange-50"
          }`}
        >

          <div className="flex items-center gap-4">

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                isApproved
                  ? "bg-green-100 text-green-600"
                  : isRejected
                  ? "bg-red-100 text-red-600"
                  : "bg-orange-100 text-orange-600"
              }`}
            >

              {isApproved ? (
                <CheckCircle2 size={25} />
              ) : isRejected ? (
                <AlertCircle size={25} />
              ) : (
                <Clock size={25} />
              )}

            </div>

            <div>

              <p className="text-sm text-slate-500">
                Current Application Status
              </p>

              <h2
                className={`text-xl font-bold ${
                  isApproved
                    ? "text-green-700"
                    : isRejected
                    ? "text-red-700"
                    : "text-orange-700"
                }`}
              >
                {application.status}
              </h2>

            </div>

          </div>

        </div>

        {/* =================================
            INFORMATION
        ================================= */}

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Application Information */}

          <section className="rounded-2xl bg-white shadow-sm lg:col-span-2">

            <div className="border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <FileText
                    size={21}
                    className="text-blue-600"
                  />
                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Application Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Verification request details
                  </p>

                </div>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">

              <InfoItem
                label="Applicant"
                value={application.applicant}
                icon={<User size={18} />}
              />

              <InfoItem
                label="Instrument ID"
                value={application.instrument}
                icon={<FileText size={18} />}
              />

              <InfoItem
                label="Instrument Type"
                value={application.type}
                icon={<ScaleIcon />}
              />

              <InfoItem
                label="Submitted Date"
                value={application.submitted}
                icon={<CalendarDays size={18} />}
              />

              <InfoItem
                label="Assigned Inspector"
                value={application.inspector}
                icon={<User size={18} />}
              />

              <InfoItem
                label="Verification Location"
                value="Kolkata, West Bengal"
                icon={<MapPin size={18} />}
              />

            </div>

          </section>

          {/* Appointment */}

          <section className="rounded-2xl bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-5">

              <h2 className="font-bold text-slate-900">
                Verification Appointment
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Appointment information
              </p>

            </div>

            <div className="space-y-6 p-6">

              <AppointmentItem
                label="Verification Date"
                value={
                  isPending
                    ? "Not Scheduled"
                    : "28 Aug 2026"
                }
                icon={<CalendarDays size={18} />}
              />

              <AppointmentItem
                label="Time"
                value={
                  isPending
                    ? "Not Scheduled"
                    : "10:30 AM"
                }
                icon={<Clock size={18} />}
              />

              <AppointmentItem
                label="Location"
                value={
                  isPending
                    ? "Not Scheduled"
                    : "Kolkata"
                }
                icon={<MapPin size={18} />}
              />

            </div>

          </section>

        </div>

        {/* =================================
            TIMELINE
        ================================= */}

        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <div className="mb-8">

            <h2 className="text-xl font-bold text-slate-900">
              Verification Timeline
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track the complete progress of your application.
            </p>

          </div>

          <div>

            <TimelineItem
              title="Application Submitted"
              description="Your application was submitted successfully."
              completed
              date={application.submitted}
            />

            <TimelineItem
              title="Application Reviewed"
              description="The application details were reviewed by the department."
              completed={
                isApproved || isRejected
              }
              date=""
            />

            <TimelineItem
              title="Verification Scheduled"
              description="A verification appointment will appear here after the department schedules it."
              completed={false}
              active={isPending}
              date=""
            />

            <TimelineItem
              title="Verification Pending"
              description="The instrument is waiting for field verification."
              active={isPending}
              completed={isApproved}
              date=""
            />

            <TimelineItem
              title="Verification Completed"
              description="The field verification has been completed successfully."
              completed={isApproved}
              date=""
            />

            <TimelineItem
              title="Certificate Generated"
              description="The digital verification certificate will be generated after successful verification."
              completed={false}
              last
              date=""
            />

          </div>

        </section>

        {/* =================================
            ACTIONS
        ================================= */}

        <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:justify-end">

          {isApproved && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/merchant/certificates"
                )
              }
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
            >
              View Certificate
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              navigate("/merchant/applications")
            }
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
          >
            Back to Applications
          </button>

        </div>

      </div>

    </div>
  );
}

/* ========================================= */
/* INFO ITEM                                 */
/* ========================================= */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>

      <div className="mb-2 flex items-center gap-2 text-slate-400">

        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>

      </div>

      <p className="font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}

/* ========================================= */
/* APPOINTMENT ITEM                          */
/* ========================================= */

function AppointmentItem({
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

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          {value}
        </p>

      </div>

    </div>
  );
}

/* ========================================= */
/* TIMELINE                                  */
/* ========================================= */

function TimelineItem({
  title,
  description,
  completed = false,
  active = false,
  last = false,
  date,
}: {
  title: string;
  description: string;
  completed?: boolean;
  active?: boolean;
  last?: boolean;
  date: string;
}) {
  return (
    <div className="flex">

      <div className="flex flex-col items-center">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            completed
              ? "bg-green-100 text-green-600"
              : active
              ? "bg-blue-100 text-blue-600"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {completed ? (
            <CheckCircle2 size={21} />
          ) : (
            <Circle size={20} />
          )}
        </div>

        {!last && (
          <div
            className={`min-h-[65px] w-0.5 ${
              completed
                ? "bg-green-200"
                : "bg-slate-200"
            }`}
          />
        )}

      </div>

      <div className="ml-4 pb-7">

        <div className="flex flex-wrap items-center gap-3">

          <h3
            className={`font-semibold ${
              active
                ? "text-blue-700"
                : completed
                ? "text-slate-900"
                : "text-slate-500"
            }`}
          >
            {title}
          </h3>

          {active && (
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
              Current
            </span>
          )}

        </div>

        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          {description}
        </p>

        {date && (
          <p className="mt-1 text-xs font-medium text-slate-400">
            {date}
          </p>
        )}

      </div>

    </div>
  );
}

/* ========================================= */
/* SCALE ICON                                */
/* ========================================= */

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
    </svg>
  );
}

export default ApplicationDetails;