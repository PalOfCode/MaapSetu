import {
  ArrowLeft,
  CalendarDays,
  Clock,
  FileCheck2,
  FileText,
  MapPin,
  PlayCircle,
  Scale,
  ShieldCheck,
  User,
} from "lucide-react";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

/* =========================================================
   TYPES
========================================================= */

interface ApplicationData {
  applicationId: string;
  applicant: string;
  instrumentId: string;
  instrumentType: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  nominalValue: string;
  installationLocation: string;
  merchantLicense: string;
  submittedDate: string;
  appointmentDate: string;
  appointmentTime: string;
  inspector: string;
  status: string;
}

interface InspectorApplicationApiItem {
  applicationId?: string;
  applicationDbId?: string;
  businessId?: string;
  applicant?: string;
  instrumentId?: string;
  instrument?: string;
  instrumentType?: string;
  manufacturer?: string;
  model?: string;
  location?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  inspector?: string;
  assignedOfficerId?: string;
  status?: string;
}

interface InspectorApplicationsResponse {
  success?: boolean;
  message?: string;
  applications?: InspectorApplicationApiItem[];
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function InspectorApplicationDetails() {
  const navigate =
    useNavigate();

  const { id } =
    useParams<{
      id: string;
    }>();

  /* =======================================================
     LOAD REAL ASSIGNED APPLICATION
  ======================================================= */

  const [application, setApplication] =
    useState<ApplicationData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadApplication = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const token =
          localStorage.getItem("almveToken");

        if (!token) {
          throw new Error(
            "Authentication token not found. Please login again."
          );
        }

        if (!id) {
          throw new Error(
            "Application ID is missing."
          );
        }

        const response = await fetch(
          "https://maapsetu-w1sf.onrender.com/api/inspector/applications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let data: InspectorApplicationsResponse | null = null;

        try {
          data =
            (await response.json()) as InspectorApplicationsResponse;
        } catch {
          data = null;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Unable to load application (${response.status}).`
          );
        }

        const assigned =
          data?.applications?.find(
            (item) =>
              String(item.applicationId || "") ===
              String(id)
          );

        if (!assigned) {
          throw new Error(
            `Application ${id} is not assigned to the logged-in inspector.`
          );
        }

        if (cancelled) {
          return;
        }

        const mapped: ApplicationData = {
          applicationId:
            String(assigned.applicationId || id),

          applicant:
            assigned.applicant ||
            "Applicant",

          instrumentId:
            assigned.instrumentId ||
            "",

          instrumentType:
            assigned.instrumentType ||
            assigned.instrument ||
            "Instrument",

          manufacturer:
            assigned.manufacturer ||
            "Not Available",

          modelNumber:
            assigned.model ||
            "Not Available",

          serialNumber:
            "Not Available",

          nominalValue:
            "Not Available",

          installationLocation:
            assigned.location ||
            "Not specified",

          merchantLicense:
            "Not Available",

          submittedDate:
            "Not Available",

          appointmentDate:
            assigned.appointmentDate ||
            "Not Scheduled",

          appointmentTime:
            assigned.appointmentTime ||
            "Not Scheduled",

          inspector:
            assigned.inspector ||
            "Not Available",

          status:
            assigned.status ||
            "Pending",
        };

        setApplication(mapped);
      } catch (error) {
        console.error(
          "Unable to load inspector application:",
          error
        );

        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load application."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadApplication();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* =======================================================
     START VERIFICATION
  ======================================================= */

  const startVerification = () => {
    if (!application) {
      return;
    }

    navigate(
      `/inspector/mpe-evaluation?applicationId=${encodeURIComponent(
        application.applicationId
      )}&instrumentId=${encodeURIComponent(
        application.instrumentId
      )}`
    );
  };

  /* =======================================================
     BACK
  ======================================================= */

  const goBack = () => {
    navigate(
      "/inspector/applications"
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Loading Application
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Fetching the assigned application from the ALMVE server.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-red-700">
              Application Not Available
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {errorMessage ||
                "Unable to load this application."}
            </p>
            <button
              type="button"
              onClick={goBack}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Back to Inspector Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-6xl">

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={goBack}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
        >

          <ArrowLeft size={18} />

          Back to Inspector Applications

        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <p className="text-sm font-semibold text-blue-600">
              Inspector Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
              Application Details
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
              Review the assigned verification application before starting field verification.
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Application ID
            </p>

            <p className="mt-1 font-bold text-blue-600">
              {application.applicationId}
            </p>

          </div>

        </div>

        {/* =================================================
            STATUS
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                <ShieldCheck size={24} />

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Verification Status
                </p>

                <h2 className="mt-1 text-xl font-bold text-blue-700">
                  {application.status}
                </h2>

              </div>

            </div>

            <button
              type="button"
              onClick={
                startVerification
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
            >

              <PlayCircle size={19} />

              Start Verification

            </button>

          </div>

        </section>

        {/* =================================================
            APPLICATION + INSPECTOR
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* APPLICATION INFORMATION */}

          <section className="rounded-2xl bg-white shadow-sm lg:col-span-2">

            <div className="border-b border-slate-200 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                  <FileText size={22} />

                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Application Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Submitted merchant and application details
                  </p>

                </div>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">

              <DetailCard
                label="Applicant"
                value={
                  application.applicant
                }
              />

              <DetailCard
                label="Application ID"
                value={
                  application.applicationId
                }
              />

              <DetailCard
                label="Submitted Date"
                value={
                  application.submittedDate
                }
              />

              <DetailCard
                label="Merchant License"
                value={
                  application.merchantLicense
                }
              />

            </div>

          </section>

          {/* INSPECTOR */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">

              <User size={22} />

            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Assigned Inspector
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Verification officer
            </p>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Inspector
              </p>

              <p className="mt-1 font-bold text-slate-800">
                {application.inspector}
              </p>

            </div>

          </section>

        </div>

        {/* =================================================
            INSTRUMENT
        ================================================= */}

        <section className="mt-6 rounded-2xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">

                <Scale size={22} />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Instrument Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Details of the instrument assigned for verification
                </p>

              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">

            <DetailCard
              label="Instrument ID"
              value={
                application.instrumentId
              }
            />

            <DetailCard
              label="Instrument Type"
              value={
                application.instrumentType
              }
            />

            <DetailCard
              label="Manufacturer"
              value={
                application.manufacturer
              }
            />

            <DetailCard
              label="Model Number"
              value={
                application.modelNumber
              }
            />

            <DetailCard
              label="Serial Number"
              value={
                application.serialNumber
              }
            />

            <DetailCard
              label="Nominal Value"
              value={
                application.nominalValue
              }
            />

            <DetailCard
              label="Installation Location"
              value={
                application.installationLocation
              }
            />

          </div>

        </section>

        {/* =================================================
            APPOINTMENT
        ================================================= */}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-5">

            <h2 className="text-xl font-bold text-slate-900">
              Verification Appointment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Scheduled field verification details
            </p>

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <AppointmentCard
              icon={
                <CalendarDays
                  size={20}
                />
              }
              label="Date"
              value={
                application.appointmentDate
              }
            />

            <AppointmentCard
              icon={
                <Clock size={20} />
              }
              label="Time"
              value={
                application.appointmentTime
              }
            />

            <AppointmentCard
              icon={
                <MapPin
                  size={20}
                />
              }
              label="Location"
              value={
                application.installationLocation
              }
            />

          </div>

        </section>

        {/* =================================================
            VERIFICATION PROCESS
        ================================================= */}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Verification Process
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Follow these steps during field inspection.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">

            <StepCard
              number="01"
              title="Check Instrument"
              description="Verify physical instrument, identification and nameplate."
            />

            <StepCard
              number="02"
              title="Record Measurement"
              description="Enter observed measurement deviation during inspection."
            />

            <StepCard
              number="03"
              title="Evaluate MPE"
              description="Compare the observed deviation against the allowed MPE."
            />

            <StepCard
              number="04"
              title="Complete Result"
              description="Generate verification result, certificate or enforcement flag."
            />

          </div>

        </section>

        {/* =================================================
            CHECKLIST
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex items-start gap-3">

            <FileCheck2
              size={21}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>

              <p className="text-sm font-bold text-blue-900">
                Inspector Checklist
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Verify instrument identification,
                physical condition, nameplate details
                and measurement performance before
                completing the MPE evaluation.
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex flex-col gap-3 py-8 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={goBack}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >

            Back

          </button>

          <button
            type="button"
            onClick={
              startVerification
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
          >

            <PlayCircle size={19} />

            Start Verification

          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({
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

      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   APPOINTMENT CARD
========================================================= */

function AppointmentCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        {icon}
      </div>

      <div>

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-bold text-slate-800">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   STEP CARD
========================================================= */

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
        {number}
      </div>

      <h3 className="mt-4 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}

export default InspectorApplicationDetails;