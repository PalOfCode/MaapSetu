import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Calculator,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Scale,
  User,
  XCircle,
} from "lucide-react";

/* =========================================
   TYPES
========================================= */

type EvaluationResult =
  | "PASS"
  | "FAIL"
  | "PENDING";

interface InspectorApplication {
  applicationId: string;
  instrumentId: string;
  applicant: string;
  instrument: string;
  applicationType?: string;
  location: string;
  assignedOfficerId?: string;
  inspector?: string;
  status?: string;
}

interface InspectorApplicationsResponse {
  success: boolean;
  message?: string;
  applications?: InspectorApplication[];
  profile?: {
    id: number;
    name: string;
    employeeId?: string;
    region?: string;
    status?: string;
  };
}

/* =========================================
   MAIN COMPONENT
========================================= */

function MPEEvaluation() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  /* =========================================
     URL PARAMETERS
  ========================================= */

  const applicationId = (
    searchParams.get("applicationId") || ""
  ).trim();

  const scheduleId = (
    searchParams.get("scheduleId") || ""
  ).trim();

  const urlInstrumentId = (
    searchParams.get("instrumentId") || ""
  ).trim();

  /* =========================================
     REAL INSTRUMENT ID
  ========================================= */

  const [
    assignedInstrumentId,
    setAssignedInstrumentId,
  ] = useState(urlInstrumentId);

  const instrumentId =
    assignedInstrumentId || urlInstrumentId;

  /* =========================================
     APPLICATION LOADING
  ========================================= */

  const [
    applicationLoading,
    setApplicationLoading,
  ] = useState(false);

  /* =========================================
     FORM STATE
  ========================================= */

  const [
    testName,
    setTestName,
  ] = useState(
    "Accuracy Test"
  );

  const [
    standardValue,
    setStandardValue,
  ] = useState("30");

  const [
    observedValue,
    setObservedValue,
  ] = useState("");

  const [
    permissibleError,
    setPermissibleError,
  ] = useState("10");

  const [
    unit,
    setUnit,
  ] = useState("g");

  const [
    location,
    setLocation,
  ] = useState(
    "Field Verification Site"
  );

  const [
    officerId,
    setOfficerId,
  ] = useState("");

  const [
    latitude,
    setLatitude,
  ] = useState("");

  const [
    longitude,
    setLongitude,
  ] = useState("");

  const [
    remarks,
    setRemarks,
  ] = useState("");

  const [
    startTime,
    setStartTime,
  ] = useState("");

  const [
    endTime,
    setEndTime,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    saved,
    setSaved,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  /* =========================================
     LOAD ASSIGNED APPLICATION
  ========================================= */

  useEffect(() => {
    if (!applicationId) {
      setErrorMessage(
        "No application was selected. Please start verification from an assigned appointment."
      );
      return;
    }

    let cancelled = false;

    const loadAssignedApplication =
      async () => {
        const token =
          localStorage.getItem(
            "almveToken"
          );

        if (!token) {
          setErrorMessage(
            "Authentication token not found. Please login again."
          );
          return;
        }

        setApplicationLoading(true);
        setErrorMessage("");

        try {
          const response =
            await fetch(
              "http://localhost:5000/api/inspector/applications",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          let data:
            | InspectorApplicationsResponse
            | null = null;

          try {
            data =
              (await response.json()) as InspectorApplicationsResponse;
          } catch {
            data = null;
          }

          if (!response.ok) {
            throw new Error(
              data?.message ||
                `Unable to load assigned application (${response.status}).`
            );
          }

          if (!data?.success) {
            throw new Error(
              data?.message ||
                "Unable to load assigned applications."
            );
          }

          const assignedApplication =
            data.applications?.find(
              (item) =>
                String(
                  item.applicationId ?? ""
                ).trim() ===
                applicationId
            );

          if (!assignedApplication) {
            throw new Error(
              `Application ${applicationId} is not assigned to the logged-in inspector.`
            );
          }

          if (cancelled) {
            return;
          }

          const backendInstrumentId =
            String(
              assignedApplication.instrumentId ??
                ""
            ).trim();

          if (backendInstrumentId) {
            setAssignedInstrumentId(
              backendInstrumentId
            );
          }

          if (
            assignedApplication.location
          ) {
            setLocation(
              assignedApplication.location
            );
          }

          if (
            data.profile?.employeeId
          ) {
            setOfficerId(
              data.profile.employeeId
            );
          }
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(
            "Unable to load assigned application:",
            error
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load assigned application."
          );
        } finally {
          if (!cancelled) {
            setApplicationLoading(false);
          }
        }
      };

    void loadAssignedApplication();

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  /* =========================================
     NUMERIC VALUES
  ========================================= */

  const numericStandard =
    Number(standardValue);

  const numericObserved =
    Number(observedValue);

  const numericPermissibleError =
    Number(permissibleError);

  /* =========================================
     CALCULATED ERROR
  ========================================= */

  const calculatedError =
    useMemo(() => {
      if (
        observedValue.trim() === "" ||
        Number.isNaN(numericObserved) ||
        Number.isNaN(numericStandard)
      ) {
        return null;
      }

      return (
        numericObserved -
        numericStandard
      );
    }, [
      observedValue,
      numericObserved,
      numericStandard,
    ]);

  /* =========================================
     ABSOLUTE ERROR
  ========================================= */

  const absoluteError =
    calculatedError === null
      ? null
      : Math.abs(
          calculatedError
        );

  /* =========================================
     RESULT
  ========================================= */

  const result: EvaluationResult =
    useMemo(() => {
      if (
        observedValue.trim() === "" ||
        permissibleError.trim() === ""
      ) {
        return "PENDING";
      }

      if (
        Number.isNaN(numericObserved) ||
        Number.isNaN(
          numericPermissibleError
        ) ||
        Number.isNaN(numericStandard)
      ) {
        return "PENDING";
      }

      if (
        numericPermissibleError < 0 ||
        numericStandard < 0
      ) {
        return "PENDING";
      }

      return Math.abs(
        numericObserved -
          numericStandard
      ) <= numericPermissibleError
        ? "PASS"
        : "FAIL";
    }, [
      observedValue,
      permissibleError,
      numericObserved,
      numericStandard,
      numericPermissibleError,
    ]);

  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm =
    (): string => {
      if (!applicationId) {
        return (
          "Application ID is missing. Start verification from an assigned appointment."
        );
      }

      if (applicationLoading) {
        return (
          "Application details are still loading. Please wait a moment and try again."
        );
      }

      if (!instrumentId) {
        return (
          "Instrument ID is missing for this application."
        );
      }

      if (!testName.trim()) {
        return (
          "Please enter test name."
        );
      }

      if (
        standardValue.trim() === "" ||
        Number.isNaN(numericStandard) ||
        numericStandard < 0
      ) {
        return (
          "Please enter a valid standard value."
        );
      }

      if (
        observedValue.trim() === ""
      ) {
        return (
          "Please enter observed value."
        );
      }

      if (
        Number.isNaN(numericObserved)
      ) {
        return (
          "Please enter a valid observed value."
        );
      }

      if (
        permissibleError.trim() === "" ||
        Number.isNaN(
          numericPermissibleError
        ) ||
        numericPermissibleError < 0
      ) {
        return (
          "Please enter a valid permissible error."
        );
      }

      if (!location.trim()) {
        return (
          "Please enter verification location."
        );
      }

      if (!officerId.trim()) {
        return (
          "Officer ID is required."
        );
      }

      if (
        startTime &&
        endTime &&
        endTime < startTime
      ) {
        return (
          "End time cannot be earlier than start time."
        );
      }

      return "";
    };

  /* =========================================
     SAVE VERIFICATION
  ========================================= */

  const handleEvaluate = async () => {
    if (saving) {
      return;
    }

    setErrorMessage("");
    setSaved(false);

    const validationError =
      validateForm();

    if (validationError) {
      setErrorMessage(
        validationError
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const token =
      localStorage.getItem(
        "almveToken"
      );

    if (!token) {
      setErrorMessage(
        "Authentication token not found. Please login again."
      );
      return;
    }

    setSaving(true);

    const verificationId =
      `VER-${Date.now()}`;

    const observationId =
      `OBS-${Date.now()}`;

    const now =
      new Date().toISOString();

    const verificationRecord = {
      verificationId,
      applicationId,
      instrumentId,
      officerId,
      verificationDate:
        new Date().toISOString(),
      verificationType:
        "MPE Verification",
      location,
      result,
      remarks,
      startTime,
      endTime,
      latitude,
      longitude,
      scheduleId,
      createdAt: now,
    };

    const observationRecord = {
      observationId,
      verificationId,
      testName,
      standardValue:
        numericStandard,
      observedValue:
        numericObserved,
      permissibleError:
        numericPermissibleError,
      error:
        calculatedError ?? 0,
      result,
      remarks,
      unit,
      createdAt: now,
    };

    try {
      const response =
        await fetch(
          "http://localhost:5000/api/verifications",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify({
              verification:
                verificationRecord,
              observation:
                observationRecord,
            }),
          }
        );

      let data: unknown = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "message" in data
            ? String(
                (
                  data as {
                    message?: unknown;
                  }
                ).message ??
                  "Unable to save verification."
              )
            : `Unable to save verification (${response.status}).`;

        throw new Error(message);
      }

      if (
        data &&
        typeof data === "object" &&
        "verification" in data &&
        "observation" in data
      ) {
        sessionStorage.setItem(
          "almveVerificationResult",
          JSON.stringify({
            verification:
              (
                data as {
                  verification: unknown;
                }
              ).verification,
            observation:
              (
                data as {
                  observation: unknown;
                }
              ).observation,
          })
        );
      }

      setSaved(true);

      const returnedVerificationId =
        data &&
        typeof data === "object" &&
        "verification" in data &&
        data.verification &&
        typeof data.verification ===
          "object" &&
        "verificationId" in
          data.verification
          ? String(
              (
                data.verification as {
                  verificationId?: unknown;
                }
              ).verificationId ??
                verificationId
            )
          : verificationId;

      window.setTimeout(() => {
        navigate(
          `/inspector/verification-result?applicationId=${encodeURIComponent(
            applicationId
          )}&verificationId=${encodeURIComponent(
            returnedVerificationId
          )}`
        );
      }, 600);
    } catch (error) {
      console.error(
        "Unable to save verification:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save verification."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     RESET
  ========================================= */

  const resetForm = () => {
    setTestName(
      "Accuracy Test"
    );
    setStandardValue("30");
    setObservedValue("");
    setPermissibleError("10");
    setUnit("g");

    setLocation(
      "Field Verification Site"
    );

    setOfficerId("");
    setLatitude("");
    setLongitude("");
    setRemarks("");
    setStartTime("");
    setEndTime("");

    setErrorMessage("");
    setSaved(false);
  };

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-7">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/inspector/appointments"
              )
            }
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-green-700 transition hover:text-green-800"
          >
            <ArrowLeft size={18} />
            Back to Appointments
          </button>

          <p className="text-sm font-semibold text-green-700">
            ALMVE Verification Engine
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
            MPE Rule Evaluation
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Evaluate the observed instrument measurement against the configured maximum permissible error.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">

            <IdBadge
              label="Application"
              value={
                applicationId ||
                "Not Selected"
              }
            />

            <IdBadge
              label="Schedule"
              value={
                scheduleId ||
                "Not Linked"
              }
            />

            <IdBadge
              label="Instrument"
              value={
                instrumentId ||
                "Loading..."
              }
            />

            {applicationLoading && (
              <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                Loading assigned application...
              </span>
            )}

          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />
            <p className="text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        {saved && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle2
              size={20}
            />
            <p className="text-sm font-semibold">
              Verification saved successfully.
            </p>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

          <InfoCard
            title="Standard Value"
            value={`${standardValue || "0"} ${unit}`}
            icon={
              <Scale size={22} />
            }
            iconClass="bg-green-100 text-green-700"
          />

          <InfoCard
            title="Permissible Error"
            value={`± ${permissibleError || "0"} ${unit}`}
            icon={
              <Calculator size={22} />
            }
            iconClass="bg-amber-100 text-amber-700"
          />

          <InfoCard
            title="Evaluation Result"
            value={result}
            icon={
              result === "PASS" ? (
                <CheckCircle2
                  size={22}
                />
              ) : result === "FAIL" ? (
                <XCircle
                  size={22}
                />
              ) : (
                <AlertCircle
                  size={22}
                />
              )
            }
            iconClass={
              result === "PASS"
                ? "bg-emerald-100 text-emerald-700"
                : result === "FAIL"
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-500"
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3">

            <div className="border-b border-slate-200 px-6 py-6">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Calculator
                    size={22}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Observation Details
                  </h2>

                  <p className="text-sm text-slate-500">
                    Enter the test and measurement observation.
                  </p>
                </div>

              </div>
            </div>

            <div className="space-y-5 p-6">

              <div>
                <label
                  htmlFor="testName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Test Name
                </label>

                <input
                  id="testName"
                  type="text"
                  value={testName}
                  onChange={(event) =>
                    setTestName(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <NumberInput
                  label="Standard Value"
                  value={
                    standardValue
                  }
                  onChange={
                    setStandardValue
                  }
                  placeholder="Example: 30"
                />

                <div>
                  <label
                    htmlFor="unit"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Unit
                  </label>

                  <select
                    id="unit"
                    value={unit}
                    onChange={(event) =>
                      setUnit(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="g">
                      g
                    </option>
                    <option value="kg">
                      kg
                    </option>
                    <option value="mg">
                      mg
                    </option>
                    <option value="L">
                      L
                    </option>
                    <option value="mL">
                      mL
                    </option>
                    <option value="m">
                      m
                    </option>
                    <option value="cm">
                      cm
                    </option>
                  </select>
                </div>

              </div>

              <NumberInput
                label="Observed Value"
                value={
                  observedValue
                }
                onChange={
                  setObservedValue
                }
                placeholder="Enter observed value"
              />

              <NumberInput
                label="Permissible Error"
                value={
                  permissibleError
                }
                onChange={
                  setPermissibleError
                }
                placeholder="Example: 10"
              />

              <div className="rounded-xl border border-green-100 bg-green-50 p-5">

                <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                  Automatic Calculation
                </p>

                <div className="mt-4 space-y-3">

                  <CalculationRow
                    label="Standard Value"
                    value={`${standardValue || "0"} ${unit}`}
                  />

                  <CalculationRow
                    label="Observed Value"
                    value={
                      observedValue
                        ? `${observedValue} ${unit}`
                        : "—"
                    }
                  />

                  <CalculationRow
                    label="Error"
                    value={
                      calculatedError ===
                      null
                        ? "—"
                        : `${calculatedError} ${unit}`
                    }
                  />

                  <CalculationRow
                    label="Absolute Error"
                    value={
                      absoluteError ===
                      null
                        ? "—"
                        : `${absoluteError} ${unit}`
                    }
                  />

                  <CalculationRow
                    label="Permissible Error"
                    value={`± ${
                      permissibleError ||
                      "0"
                    } ${unit}`}
                  />

                </div>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Verification Location
                </label>

                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="officerId"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Officer ID
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="officerId"
                    type="text"
                    value={officerId}
                    onChange={(event) =>
                      setOfficerId(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <TimeInput
                  label="Start Time"
                  value={
                    startTime
                  }
                  onChange={
                    setStartTime
                  }
                />

                <TimeInput
                  label="End Time"
                  value={
                    endTime
                  }
                  onChange={
                    setEndTime
                  }
                />

              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <TextNumberInput
                  label="Latitude"
                  value={
                    latitude
                  }
                  onChange={
                    setLatitude
                  }
                  placeholder="Example: 22.5726"
                />

                <TextNumberInput
                  label="Longitude"
                  value={
                    longitude
                  }
                  onChange={
                    setLongitude
                  }
                  placeholder="Example: 88.3639"
                />

              </div>

              <div>
                <label
                  htmlFor="remarks"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Remarks
                </label>

                <textarea
                  id="remarks"
                  value={remarks}
                  onChange={(event) =>
                    setRemarks(
                      event.target.value
                    )
                  }
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />
              </div>

            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-between">

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={
                  handleEvaluate
                }
                disabled={
                  saved ||
                  saving ||
                  applicationLoading ||
                  !applicationId ||
                  !instrumentId
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Calculator
                  size={18}
                />

                {saved
                  ? "Saved"
                  : saving
                  ? "Saving..."
                  : "Evaluate & Save"}
              </button>

            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-slate-900">
                Evaluation Result
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Rule-based MPE assessment.
              </p>

              <div
                className={`mt-6 rounded-2xl p-6 text-center ${
                  result === "PASS"
                    ? "bg-green-50"
                    : result === "FAIL"
                    ? "bg-red-50"
                    : "bg-slate-50"
                }`}
              >
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                    result === "PASS"
                      ? "bg-green-100 text-green-700"
                      : result === "FAIL"
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {result ===
                  "PASS" ? (
                    <CheckCircle2
                      size={34}
                    />
                  ) : result ===
                    "FAIL" ? (
                    <XCircle
                      size={34}
                    />
                  ) : (
                    <AlertCircle
                      size={34}
                    />
                  )}
                </div>

                <h3
                  className={`mt-5 text-3xl font-bold ${
                    result === "PASS"
                      ? "text-green-700"
                      : result === "FAIL"
                      ? "text-red-700"
                      : "text-slate-500"
                  }`}
                >
                  {result}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {result === "PASS" &&
                    "Observed error is within the permissible limit."}

                  {result === "FAIL" &&
                    "Observed error exceeds the permissible limit."}

                  {result === "PENDING" &&
                    "Enter an observed value to calculate the result."}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-green-100 bg-green-50 p-6">

              <div className="flex items-start gap-3">

                <Calculator
                  size={20}
                  className="mt-0.5 shrink-0 text-green-700"
                />

                <div>
                  <p className="font-semibold text-green-800">
                    MPE Rule
                  </p>

                  <p className="mt-2 text-sm font-semibold text-green-800">
                    Absolute Error ≤ Permissible Error
                  </p>

                  <p className="mt-2 text-xs leading-5 text-green-700">
                    The calculated observation error is compared with the configured permissible limit.
                  </p>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="font-bold text-slate-900">
                Verification Workflow
              </h3>

              <div className="mt-5 space-y-4">

                <WorkflowStep
                  number="1"
                  title="Measurement Recorded"
                  active={
                    observedValue !== ""
                  }
                />

                <WorkflowStep
                  number="2"
                  title="MPE Rule Applied"
                  active={
                    result !== "PENDING"
                  }
                />

                <WorkflowStep
                  number="3"
                  title="Verification Result"
                  active={saved}
                />

                <WorkflowStep
                  number="4"
                  title="Certificate / Review"
                  active={saved}
                  last
                />

              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="font-bold text-slate-900">
                Verification Metadata
              </h3>

              <div className="mt-4 space-y-4">

                <MetaRow
                  icon={
                    <FileText
                      size={16}
                    />
                  }
                  label="Application"
                  value={
                    applicationId
                  }
                />

                <MetaRow
                  icon={
                    <Scale
                      size={16}
                    />
                  }
                  label="Instrument"
                  value={
                    instrumentId ||
                    "Not available"
                  }
                />

                <MetaRow
                  icon={
                    <CalendarDays
                      size={16}
                    />
                  }
                  label="Verification Date"
                  value={new Date().toLocaleDateString(
                    "en-IN"
                  )}
                />

                <MetaRow
                  icon={
                    <Clock
                      size={16}
                    />
                  }
                  label="Start Time"
                  value={
                    startTime ||
                    "Not set"
                  }
                />

                <MetaRow
                  icon={
                    <MapPin
                      size={16}
                    />
                  }
                  label="Location"
                  value={location}
                />

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   INFO CARD
========================================= */

function InfoCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================
   ID BADGE
========================================= */

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

      <span className="ml-2 text-xs font-bold text-green-700">
        {value}
      </span>

    </div>
  );
}

/* =========================================
   NUMBER INPUT
========================================= */

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        <span className="ml-1 text-red-500">
          *
        </span>
      </label>

      <input
        type="number"
        step="any"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
      />

    </div>
  );
}

/* =========================================
   TEXT NUMBER INPUT
========================================= */

function TextNumberInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type="number"
        step="any"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
      />

    </div>
  );
}

/* =========================================
   CALCULATION ROW
========================================= */

function CalculationRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-green-100 pb-3 last:border-0 last:pb-0">

      <span className="text-sm text-green-700">
        {label}
      </span>

      <span className="text-right text-sm font-bold text-green-900">
        {value}
      </span>

    </div>
  );
}

/* =========================================
   TIME INPUT
========================================= */

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>

      <label
        htmlFor={label}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={label}
        type="time"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
      />

    </div>
  );
}

/* =========================================
   WORKFLOW STEP
========================================= */

function WorkflowStep({
  number,
  title,
  active,
  last = false,
}: {
  number: string;
  title: string;
  active: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3">

      <div className="flex flex-col items-center">

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
            active
              ? "bg-green-700 text-white"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          {active ? (
            <CheckCircle2
              size={15}
            />
          ) : (
            number
          )}
        </div>

        {!last && (
          <div
            className={`mt-1 h-6 w-px ${
              active
                ? "bg-green-300"
                : "bg-slate-200"
            }`}
          />
        )}

      </div>

      <p
        className={`pt-1 text-sm font-semibold ${
          active
            ? "text-slate-800"
            : "text-slate-400"
        }`}
      >
        {title}
      </p>

    </div>
  );
}

/* =========================================
   META ROW
========================================= */

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="shrink-0 text-green-700">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="truncate text-sm font-semibold text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
}

export default MPEEvaluation;