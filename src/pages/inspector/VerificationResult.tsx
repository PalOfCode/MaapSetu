import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  MapPin,
  MessageSquare,
  Save,
  Scale,
  ShieldCheck,
  XCircle,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ResultType =
  | "PASS"
  | "FAIL"
  | "PENDING";

interface VerificationRecord {
  verificationId: string;
  applicationId: string;
  instrumentId: string;
  officerId: string;

  verificationDate: string;
  verificationType: string;

  location: string;

  result: ResultType;

  remarks: string;

  startTime: string;
  endTime: string;

  latitude: string;
  longitude: string;

  scheduleId: string;

  createdAt: string;
}

interface ObservationRecord {
  observationId: string;
  verificationId: string;

  testName: string;

  standardValue: number;
  observedValue: number;

  permissibleError: number;

  error: number;

  result: ResultType;

  remarks: string;

  unit: string;

  createdAt: string;
}

interface EvaluationResult {
  verification: VerificationRecord;
  observation: ObservationRecord;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  verification?: VerificationRecord;
  observation?: ObservationRecord;
  certificate?: CertificateRecord;
  enforcement?: EnforcementRecord;
}

interface InstrumentRecord {
  instrumentId: string;
  businessId?: string;
  instrumentType?: string;
  manufacturer?: string;
  model?: string;
  capacity?: string;
  accuracy?: string;
  category?: string;
  status?: string;
}

interface CertificateRecord {
  certificateId: string;
  certificateNumber: string;

  verificationId: string;
  applicationId: string;

  instrumentId: string;
  businessId: string;

  certificateType: string;

  issueDate: string;
  validUntil: string;

  status: "Valid" | "Expired";

  officerId: string;

  instrumentType: string;
  manufacturer: string;

  nominalValue: string;
  observedValue: string;
  permissibleError: string;
  error: string;
  absoluteError: string;

  remarks: string;

  createdAt: string;
}

interface EnforcementRecord {
  enforcementId: string;

  verificationId: string;
  applicationId: string;
  instrumentId: string;

  officerId: string;

  violationType: string;
  description: string;

  evidenceReference: string;

  status: "Pending Review";

  actionDate: string;

  createdAt: string;
}

/* =========================================================
   SAFE JSON PARSER
========================================================= */

function parseStoredArray<T>(
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

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as T[];
  } catch {
    return [];
  }
}


async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("almveToken");
  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
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

/* =========================================================
   MAIN COMPONENT
========================================================= */

function VerificationResult() {
  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  /* =======================================================
     URL DATA
  ======================================================= */

  const applicationIdFromUrl = (
    searchParams.get("applicationId") || ""
  ).trim();

  const verificationIdFromUrl = (
    searchParams.get("verificationId") || ""
  ).trim();

  const scheduleIdFromUrl = (
    searchParams.get("scheduleId") || ""
  ).trim();

  const instrumentIdFromUrl = (
    searchParams.get("instrumentId") || ""
  ).trim();

  const [evaluation, setEvaluation] =
    useState<EvaluationResult | null>(null);

  const [loadingEvaluation, setLoadingEvaluation] =
    useState(true);

  const [remarks, setRemarks] =
    useState("");

  const [saveMessage, setSaveMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [certificate, setCertificate] =
    useState<CertificateRecord | null>(null);

  const [certificateCreated, setCertificateCreated] =
    useState(false);

  const [enforcementCreated, setEnforcementCreated] =
    useState(false);

  /* =======================================================
     LOAD VERIFICATION RESULT
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadEvaluation = () => {
      setLoadingEvaluation(true);
      setErrorMessage("");

      try {
        /*
         * MPE Evaluation already saves the verification to PostgreSQL
         * through POST /api/verifications. It then stores the exact
         * successful API response in sessionStorage so this page can
         * display the same DB-backed result without posting again.
         */
        const raw =
          sessionStorage.getItem("almveVerificationResult") ||
          localStorage.getItem("latestVerificationResult") ||
          localStorage.getItem("mpeEvaluationResult");

        if (!raw) {
          throw new Error(
            "Verification result could not be loaded. Please return to MPE Evaluation and save the result again."
          );
        }

        const parsed: unknown = JSON.parse(raw);

        if (
          !parsed ||
          typeof parsed !== "object" ||
          !("verification" in parsed) ||
          !("observation" in parsed)
        ) {
          throw new Error(
            "Saved verification data is invalid. Please save the MPE result again."
          );
        }

        const data = parsed as EvaluationResult;

        if (
          applicationIdFromUrl &&
          String(data.verification.applicationId ?? "").trim() &&
          String(data.verification.applicationId ?? "").trim() !==
            applicationIdFromUrl
        ) {
          throw new Error(
            "The saved verification result does not belong to this application."
          );
        }

        if (
          verificationIdFromUrl &&
          String(data.verification.verificationId ?? "").trim() &&
          String(data.verification.verificationId ?? "").trim() !==
            verificationIdFromUrl
        ) {
          throw new Error(
            "The saved verification result does not match this verification ID."
          );
        }

        if (!cancelled) {
          setEvaluation({
            verification: {
              ...data.verification,
              applicationId:
                applicationIdFromUrl ||
                data.verification.applicationId,
              verificationId:
                verificationIdFromUrl ||
                data.verification.verificationId,
              scheduleId:
                scheduleIdFromUrl ||
                data.verification.scheduleId,
              instrumentId:
                instrumentIdFromUrl ||
                data.verification.instrumentId,
            },
            observation: {
              ...data.observation,
              verificationId:
                verificationIdFromUrl ||
                data.observation.verificationId,
            },
          });
        }
      } catch (error) {
        console.error(
          "Unable to load verification result:",
          error
        );

        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load verification result."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingEvaluation(false);
        }
      }
    };

    loadEvaluation();

    return () => {
      cancelled = true;
    };
  }, [
    applicationIdFromUrl,
    verificationIdFromUrl,
    scheduleIdFromUrl,
    instrumentIdFromUrl,
  ]);

  /* =======================================================
     MAIN DATA
  ======================================================= */

  const verification: VerificationRecord =
    evaluation?.verification || {
      verificationId: verificationIdFromUrl || "",
      applicationId: applicationIdFromUrl || "",
      instrumentId: instrumentIdFromUrl || "",
      officerId: "",
      verificationDate: "",
      verificationType: "MPE Verification",
      location: "",
      result: "PENDING",
      remarks: "",
      startTime: "",
      endTime: "",
      latitude: "",
      longitude: "",
      scheduleId: scheduleIdFromUrl || "",
      createdAt: "",
    };

  const observation: ObservationRecord =
    evaluation?.observation || {
      observationId: "",
      verificationId: verification.verificationId,
      testName: "Accuracy Test",
      standardValue: 0,
      observedValue: 0,
      permissibleError: 0,
      error: 0,
      result: "PENDING",
      remarks: "",
      unit: "",
      createdAt: "",
    };

  const applicationId =
    verification.applicationId || applicationIdFromUrl;

  const verificationId =
    verification.verificationId || verificationIdFromUrl;

  const instrumentId =
    verification.instrumentId || instrumentIdFromUrl;

  const officerId =
    verification.officerId || "";

  const result = verification.result;

  const isPass = result === "PASS";
  const isFail = result === "FAIL";

  /* =======================================================
     KEEP REMARKS IN SYNC
  ======================================================= */

  useEffect(() => {
    if (!evaluation) {
      return;
    }

    setRemarks(
      evaluation.verification.remarks ||
        evaluation.observation.remarks ||
        ""
    );
  }, [evaluation]);

  /* =======================================================
     INSTRUMENT
  ======================================================= */

  const instrument =
    useMemo<InstrumentRecord>(() => {
      const instruments =
        parseStoredArray<InstrumentRecord>(
          "merchantInstruments"
        );

      const found = instruments.find(
        (item) => item.instrumentId === instrumentId
      );

      if (found) {
        return found;
      }

      return {
        instrumentId,
        businessId: "BUS-001",
        instrumentType: "Electronic Weighing Scale",
        manufacturer: "Not Available",
        model: "Not Available",
      };
    }, [instrumentId]);

  const businessId =
    instrument.businessId || "BUS-001";

  const instrumentType =
    instrument.instrumentType ||
    "Weighing / Measuring Instrument";

  const manufacturer =
    instrument.manufacturer ||
    "Not Available";

  /* =======================================================
     BACK TO MPE
  ======================================================= */

  const goToMPE = () => {
    navigate(
      `/inspector/mpe-evaluation?applicationId=${encodeURIComponent(
        applicationId
      )}&scheduleId=${encodeURIComponent(
        verification.scheduleId || scheduleIdFromUrl
      )}&instrumentId=${encodeURIComponent(
        instrumentId
      )}`
    );
  };

  /* =======================================================
     REMARKS / SAVE STATE
  ======================================================= */

  /* =======================================================
     SAVE RESULT
  ======================================================= */

  const handleSaveResult = async () => {
    if (saving) return;

    setSaving(true);
    setSaveMessage("");
    setErrorMessage("");

    const updatedVerification: VerificationRecord = {
      ...verification,
      applicationId,
      verificationId,
      instrumentId,
      result,
      remarks,
    };

    const updatedObservation: ObservationRecord = {
      ...observation,
      verificationId,
      result,
      remarks,
    };

    try {
      /*
       * The verification was already persisted by MPEEvaluation.tsx through
       * POST /api/verifications. Do NOT POST the verification again here,
       * because that creates duplicate verification/observation records.
       *
       * This page only persists the edited remarks/result snapshot locally
       * for the current workflow and reuses the existing DB verification
       * when generating a certificate.
       */
      const payload: EvaluationResult = {
        verification: updatedVerification,
        observation: updatedObservation,
      };

      const serialized = JSON.stringify(payload);

      sessionStorage.setItem(
        "almveVerificationResult",
        serialized
      );
      localStorage.setItem(
        "mpeEvaluationResult",
        serialized
      );
      localStorage.setItem(
        "latestVerificationResult",
        serialized
      );

      setEvaluation(payload);
      setSaveMessage(
        "Verification result is ready. The original verification remains stored in PostgreSQL."
      );
    } catch (error) {
      console.error("Save verification result error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save verification result."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     UPDATE APPLICATION STATUS
  ======================================================= */

  const updateApplicationStatus = async (
    status: "Approved" | "Rejected"
  ) => {
    try {
      await apiRequest<ApiResponse>(
        `https://maapsetu-w1sf.onrender.com/api/admin/applications/${encodeURIComponent(applicationId)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );
    } catch (error) {
      console.error("Unable to update application status:", error);
    }
  };

  /* =======================================================
     GENERATE CERTIFICATE
  ======================================================= */

  const handleGenerateCertificate = async () => {
    if (saving) return;

    if (!isPass) {
      setErrorMessage(
        "Certificate cannot be generated for a failed verification."
      );
      return;
    }

    setSaving(true);
    setSaveMessage("");
    setErrorMessage("");

    try {
      /*
       * The verification result has already been saved by
       * handleSaveResult(). Do NOT POST /api/verifications again.
       * Re-saving here was causing duplicate/500 failures.
       */

      const response = await apiRequest<ApiResponse>(
        "https://maapsetu-w1sf.onrender.com/api/certificates",
        {
          method: "POST",
          body: JSON.stringify({
            verificationId: verification.verificationId,
            applicationId: verification.applicationId,
            instrumentId: verification.instrumentId,
            businessId,
            officerId: verification.officerId,

            certificateType:
              "Verification Certificate",

            instrumentType,
            manufacturer,

            nominalValue:
              `${observation.standardValue} ${observation.unit}`.trim(),

            observedValue:
              `${observation.observedValue} ${observation.unit}`.trim(),

            permissibleError:
              `± ${observation.permissibleError} ${observation.unit}`.trim(),

            error:
              `${observation.error} ${observation.unit}`.trim(),

            absoluteError:
              `${Math.abs(observation.error)} ${observation.unit}`.trim(),

            remarks,
          }),
        }
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to generate certificate."
        );
      }

      setCertificate(
        response.certificate || null
      );

      if (response.certificate) {
        sessionStorage.setItem(
          "almveCertificateResult",
          JSON.stringify(response.certificate)
        );
      }

      setCertificateCreated(true);

      

      setSaveMessage(
        response.certificate?.certificateNumber
          ? `Certificate ${response.certificate.certificateNumber} generated successfully.`
          : response.message ||
              "Certificate generated successfully."
      );
    } catch (error) {
      console.error(
        "Certificate generation error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate certificate."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     ENFORCEMENT
  ======================================================= */

  const handleEnforcement = async () => {
    if (!isFail) {
      setErrorMessage(
        "Enforcement review is only available for failed verification."
      );
      return;
    }

    setSaving(true);
    setSaveMessage("");
    setErrorMessage("");

    try {
      const response = await apiRequest<ApiResponse>(
        "https://maapsetu-w1sf.onrender.com/api/enforcement",
        {
          method: "POST",
          body: JSON.stringify({
            verificationId,
            applicationId,
            instrumentId,
            officerId,
            violationType: "MPE Limit Exceeded",
            description:
              `Observed value ${observation.observedValue} ${observation.unit} produced an error of ${Math.abs(observation.error)} ${observation.unit}, exceeding the permissible error of ±${observation.permissibleError} ${observation.unit}.`,
            evidenceReference: observation.observationId,
          }),
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Unable to create enforcement review.");
      }

      await updateApplicationStatus("Rejected");
      setEnforcementCreated(true);
      setSaveMessage(
        response.message || "Enforcement review created successfully."
      );
    } catch (error) {
      console.error("Enforcement error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create enforcement review."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     BACK TO APPLICATION
  ======================================================= */

  const goToApplication = () => {
    navigate(
      `/inspector/applications/${encodeURIComponent(
        applicationId
      )}`
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  if (loadingEvaluation) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Loading Verification Result
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Fetching the saved verification data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Verification Result Unavailable
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {errorMessage ||
                "Please return to MPE Evaluation and save the result again."}
            </p>
            <button
              type="button"
              onClick={goToMPE}
              className="mt-6 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Back to MPE Evaluation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-6xl">

        {/* =============================================
            HEADER
        ============================================= */}

        <div className="mb-7">

          <button
            type="button"
            onClick={
              goToMPE
            }
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
          >

            <ArrowLeft size={18} />

            Back to MPE Evaluation

          </button>

          <p className="text-sm font-semibold text-emerald-700">
            ALMVE Verification Engine
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
            Verification Result
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
            Review the final verification result and complete the inspection workflow.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">

            <IdBadge
              label="Application"
              value={
                applicationId
              }
            />

            <IdBadge
              label="Verification"
              value={
                verificationId
              }
            />

            <IdBadge
              label="Instrument"
              value={
                instrumentId
              }
            />

            {(verification.scheduleId ||
              scheduleIdFromUrl) && (

              <IdBadge
                label="Schedule"
                value={
                  verification.scheduleId ||
                  scheduleIdFromUrl
                }
              />

            )}

          </div>

        </div>

        {/* =============================================
            MESSAGE
        ============================================= */}

        {saveMessage && (

          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">

            <CheckCircle2
              size={19}
            />

            {saveMessage}

          </div>

        )}

        {errorMessage && (

          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertTriangle size={19} />
            {errorMessage}
          </div>

        )}

        {/* =============================================
            FINAL RESULT
        ============================================= */}

        <div
          className={`mb-6 rounded-2xl border p-6 ${
            isPass
              ? "border-green-200 bg-green-50"
              : isFail
              ? "border-red-200 bg-red-50"
              : "border-slate-200 bg-white"
          }`}
        >

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                  isPass
                    ? "bg-green-100 text-green-700"
                    : isFail
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >

                {isPass ? (
                  <CheckCircle2
                    size={36}
                  />
                ) : isFail ? (
                  <XCircle
                    size={36}
                  />
                ) : (
                  <AlertTriangle
                    size={34}
                  />
                )}

              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Final Verification Result
                </p>

                <h2
                  className={`mt-1 text-2xl font-bold md:text-3xl ${
                    isPass
                      ? "text-green-700"
                      : isFail
                      ? "text-red-700"
                      : "text-slate-700"
                  }`}
                >

                  {isPass
                    ? "VERIFICATION PASSED"
                    : isFail
                    ? "VERIFICATION FAILED"
                    : "VERIFICATION PENDING"}

                </h2>

              </div>

            </div>

            <span
              className={`inline-flex w-fit rounded-full px-5 py-2 text-sm font-bold ${
                isPass
                  ? "bg-green-100 text-green-700"
                  : isFail
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >

              {result}

            </span>

          </div>

        </div>

        {/* =============================================
            DETAILS
        ============================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* VERIFICATION DETAILS */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

            <div className="border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">

                  <ShieldCheck
                    size={22}
                  />

                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Verification Details
                  </h2>

                  <p className="text-sm text-slate-500">
                    Inspection information
                  </p>

                </div>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">

              <DetailCard
                label="Verification ID"
                value={
                  verificationId
                }
              />

              <DetailCard
                label="Application ID"
                value={
                  applicationId
                }
              />

              <DetailCard
                label="Instrument ID"
                value={
                  instrumentId
                }
              />

              <DetailCard
                label="Business ID"
                value={
                  businessId
                }
              />

              <DetailCard
                label="Instrument Type"
                value={
                  instrumentType
                }
              />

              <DetailCard
                label="Manufacturer"
                value={
                  manufacturer
                }
              />

              <DetailCard
                label="Officer ID"
                value={
                  officerId
                }
              />

              <DetailCard
                label="Verification Type"
                value={
                  verification.verificationType
                }
              />

              <DetailCard
                label="Verification Date"
                value={
                  verification.verificationDate
                }
              />

              <DetailCard
                label="Location"
                value={
                  verification.location
                }
              />

              <DetailCard
                label="Start Time"
                value={
                  verification.startTime ||
                  "Not recorded"
                }
              />

              <DetailCard
                label="End Time"
                value={
                  verification.endTime ||
                  "Not recorded"
                }
              />

            </div>

          </section>

          {/* MPE SUMMARY */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">

              <Scale size={22} />

            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              MPE Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Measurement comparison
            </p>

            <div className="mt-6 space-y-4">

              <SummaryRow
                label="Test"
                value={
                  observation.testName
                }
              />

              <SummaryRow
                label="Standard"
                value={`${observation.standardValue} ${observation.unit}`}
              />

              <SummaryRow
                label="Observed"
                value={`${observation.observedValue} ${observation.unit}`}
              />

              <SummaryRow
                label="Error"
                value={`${observation.error} ${observation.unit}`}
              />

              <SummaryRow
                label="Absolute Error"
                value={`${Math.abs(
                  observation.error
                )} ${observation.unit}`}
              />

              <SummaryRow
                label="Permissible Error"
                value={`± ${observation.permissibleError} ${observation.unit}`}
              />

              <div
                className={`rounded-xl p-4 ${
                  isPass
                    ? "bg-green-50"
                    : isFail
                    ? "bg-red-50"
                    : "bg-slate-50"
                }`}
              >

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Assessment
                </p>

                <p
                  className={`mt-1 font-bold ${
                    isPass
                      ? "text-green-700"
                      : isFail
                      ? "text-red-700"
                      : "text-slate-700"
                  }`}
                >

                  {isPass
                    ? "Within permissible error"
                    : isFail
                    ? "Exceeds permissible error"
                    : "Pending"}

                </p>

              </div>

            </div>

          </section>

        </div>

        {/* =============================================
            REMARKS
        ============================================= */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">

              <MessageSquare
                size={22}
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Inspector Remarks
              </h2>

              <p className="text-sm text-slate-500">
                Add remarks before final submission.
              </p>

            </div>

          </div>

          <textarea
            value={remarks}
            onChange={(event) =>
              setRemarks(
                event.target.value
              )
            }
            rows={4}
            placeholder="Enter verification remarks..."
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          />

        </section>

        {/* =============================================
            WORKFLOW ACTIONS
        ============================================= */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-slate-900">
              Complete Verification Workflow
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Save and continue according to the verification result.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

            {/* SAVE */}

            <button
              type="button"
              onClick={() => void handleSaveResult()}
              disabled={saving}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">

                <Save size={20} />

              </div>

              <div>

                <p className="font-semibold text-slate-800">
                  Save Result
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Save verification and observation data.
                </p>

              </div>

            </button>

            {/* CERTIFICATE */}

            {isPass && (

              <button
                type="button"
                onClick={() => void handleGenerateCertificate()}
                disabled={saving || certificateCreated}
                className="flex items-start gap-3 rounded-xl bg-emerald-700 p-4 text-left text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">

                  <FileCheck2
                    size={20}
                  />

                </div>

                <div>

                  <p className="font-semibold">
                    {certificateCreated
                      ? "Certificate Created"
                      : "Generate Certificate"}
                  </p>

                  <p className="mt-1 text-xs text-emerald-100">
                    {certificateCreated
                      ? certificate?.certificateNumber || "Certificate saved successfully."
                      : "Issue digital verification certificate."}
                  </p>

                </div>

              </button>

            )}

            {/* ENFORCEMENT */}

            {isFail && (

              <button
                type="button"
                onClick={() => void handleEnforcement()}
                disabled={saving || enforcementCreated}
                className="flex items-start gap-3 rounded-xl bg-red-600 p-4 text-left text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">

                  <AlertTriangle
                    size={20}
                  />

                </div>

                <div>

                  <p className="font-semibold">
                    {enforcementCreated
                      ? "Enforcement Created"
                      : "Flag for Enforcement"}
                  </p>

                  <p className="mt-1 text-xs text-red-100">
                    {enforcementCreated
                      ? "Review record saved."
                      : "Create enforcement review."}
                  </p>

                </div>

              </button>

            )}

            {/* VIEW APPLICATION */}

            <button
              type="button"
              onClick={
                goToApplication
              }
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

                <FileText
                  size={20}
                />

              </div>

              <div>

                <p className="font-semibold text-slate-800">
                  View Application
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Open application details.
                </p>

              </div>

            </button>

          </div>

          {/* SUCCESS */}

          {certificateCreated && (

            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">

              <div className="flex items-start gap-3">

                <CheckCircle2
                  size={20}
                  className="mt-0.5 text-green-600"
                />

                <div>

                  <p className="text-sm font-bold text-green-700">
                    Digital certificate generated
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    {certificate?.certificateNumber
                      ? `${certificate.certificateNumber} has been stored in the ALMVE certificate registry.`
                      : "The certificate has been stored in the ALMVE certificate registry."}
                  </p>

                </div>

              </div>

            </div>

          )}

          {/* ENFORCEMENT SUCCESS */}

          {enforcementCreated && (

            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">

              <div className="flex items-start gap-3">

                <AlertTriangle
                  size={20}
                  className="mt-0.5 text-red-600"
                />

                <div>

                  <p className="text-sm font-bold text-red-700">
                    Enforcement review created
                  </p>

                  <p className="mt-1 text-xs text-red-600">
                    The failed verification has been flagged for review.
                  </p>

                </div>

              </div>

            </div>

          )}

        </section>

        {/* =============================================
            METADATA
        ============================================= */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">

              <FileText
                size={21}
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Verification Metadata
              </h2>

              <p className="text-sm text-slate-500">
                Recorded inspection information
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <MetaCard
              icon={
                <CalendarDays
                  size={17}
                />
              }
              label="Verification Date"
              value={
                verification.verificationDate
              }
            />

            <MetaCard
              icon={
                <Clock size={17} />
              }
              label="Start Time"
              value={
                verification.startTime ||
                "Not recorded"
              }
            />

            <MetaCard
              icon={
                <MapPin
                  size={17}
                />
              }
              label="Location"
              value={
                verification.location
              }
            />

          </div>

        </section>

        {/* =============================================
            BOTTOM NAVIGATION
        ============================================= */}

        <div className="flex flex-col gap-3 py-8 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={
              goToMPE
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >

            <ArrowLeft
              size={17}
            />

            Back to MPE

          </button>

          <button
            type="button"
            onClick={
              goToApplication
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800"
          >

            <FileText
              size={17}
            />

            View Application

          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   ID BADGE
========================================================= */

function IdBadge({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">

      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="ml-2 text-xs font-bold text-emerald-700">
        {value}
      </span>

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
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-bold text-slate-800">
        {value}
      </span>

    </div>
  );
}

/* =========================================================
   META CARD
========================================================= */

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">

      <div className="mt-0.5 shrink-0 text-emerald-700">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
}

export default VerificationResult;