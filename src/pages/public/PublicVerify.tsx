import { useEffect,useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CalendarDays,
  User,
  Scale,
  Building2,
  ArrowLeft,
  FileCheck2,
  MapPin,
} from "lucide-react";

/* =========================================
   TYPES
========================================= */

type CertificateStatus =
  | "Valid"
  | "Expired"
  | "Revoked"
  | "Expiring Soon";

interface Certificate {
  certificateId: string;
  certificateNumber: string;

  verificationId: string;
  applicationId: string;

  instrumentId: string;
  businessId: string;

  certificateType: string;

  issueDate: string;
  validUntil: string;

  status: CertificateStatus;

  officerId: string;

  instrumentType: string;
  manufacturer: string;

  nominalValue?: string;
  observedValue?: string;
  permissibleError?: string;
  error?: string;
  absoluteError?: string;

  remarks?: string;

  location?: string;

  createdAt: string;
}

interface StoredCertificate {
  certificateId?: unknown;
  certificateNumber?: unknown;

  id?: unknown;

  verificationId?: unknown;
  applicationId?: unknown;

  instrumentId?: unknown;
  businessId?: unknown;

  certificateType?: unknown;

  issueDate?: unknown;
  issuedDate?: unknown;
  issued?: unknown;

  validUntil?: unknown;

  status?: unknown;

  officerId?: unknown;
  officer?: unknown;
  issuingOfficer?: unknown;

  instrumentType?: unknown;
  manufacturer?: unknown;

  nominalValue?: unknown;

  observedValue?: unknown;
  observedDeviation?: unknown;

  permissibleError?: unknown;
  allowedMPE?: unknown;

  error?: unknown;
  absoluteError?: unknown;
  absoluteDeviation?: unknown;

  remarks?: unknown;

  location?: unknown;

  createdAt?: unknown;
}

/* =========================================
   HELPERS
========================================= */

function stringValue(
  value: unknown,
  fallback = ""
): string {
  return typeof value === "string"
    ? value
    : fallback;
}

function getStatus(
  validUntil: string,
  storedStatus?: unknown
): CertificateStatus {
  if (
    storedStatus === "Valid" ||
    storedStatus === "Expired" ||
    storedStatus === "Revoked" ||
    storedStatus ===
      "Expiring Soon"
  ) {
    return storedStatus;
  }

  if (!validUntil) {
    return "Valid";
  }

  const date =
    new Date(validUntil);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Valid";
  }

  const today =
    new Date();

  const difference =
    date.getTime() -
    today.getTime();

  const days =
    difference /
    (1000 * 60 * 60 * 24);

  if (days < 0) {
    return "Expired";
  }

  if (days <= 30) {
    return "Expiring Soon";
  }

  return "Valid";
}

function normalizeCertificate(
  item: StoredCertificate
): Certificate {
  const certificateId =
    stringValue(
      item.certificateId
    ) ||
    stringValue(item.id) ||
    `CERT-${Date.now()}`;

  const certificateNumber =
    stringValue(
      item.certificateNumber
    ) || certificateId;

  const issueDate =
    stringValue(
      item.issueDate
    ) ||
    stringValue(
      item.issuedDate
    ) ||
    stringValue(
      item.issued
    ) ||
    "N/A";

  const validUntil =
    stringValue(
      item.validUntil
    ) || "N/A";

  return {
    certificateId,

    certificateNumber,

    verificationId:
      stringValue(
        item.verificationId
      ) || "N/A",

    applicationId:
      stringValue(
        item.applicationId
      ) || "N/A",

    instrumentId:
      stringValue(
        item.instrumentId
      ) || "N/A",

    businessId:
      stringValue(
        item.businessId
      ) || "N/A",

    certificateType:
      stringValue(
        item.certificateType
      ) ||
      "Verification Certificate",

    issueDate,

    validUntil,

    status:
      getStatus(
        validUntil,
        item.status
      ),

    officerId:
      stringValue(
        item.officerId
      ) ||
      stringValue(
        item.officer
      ) ||
      stringValue(
        item.issuingOfficer
      ) ||
      "Authorized Inspector",

    instrumentType:
      stringValue(
        item.instrumentType
      ) ||
      "Unknown Instrument",

    manufacturer:
      stringValue(
        item.manufacturer
      ) ||
      "Unknown Manufacturer",

    nominalValue:
      stringValue(
        item.nominalValue
      ) || undefined,

    observedValue:
      stringValue(
        item.observedValue
      ) ||
      stringValue(
        item.observedDeviation
      ) ||
      undefined,

    permissibleError:
      stringValue(
        item.permissibleError
      ) ||
      stringValue(
        item.allowedMPE
      ) ||
      undefined,

    error:
      stringValue(
        item.error
      ) || undefined,

    absoluteError:
      stringValue(
        item.absoluteError
      ) ||
      stringValue(
        item.absoluteDeviation
      ) ||
      undefined,

    remarks:
      stringValue(
        item.remarks
      ) || undefined,

    location:
      stringValue(
        item.location
      ) || undefined,

    createdAt:
      stringValue(
        item.createdAt
      ) ||
      new Date().toISOString(),
  };
}

/* =========================================
   MAIN COMPONENT
========================================= */

function PublicVerify() {
  const navigate =
    useNavigate();

  const {
    certificateId:
      urlCertificateId,
  } = useParams<{
    certificateId?: string;
  }>();

  /* =========================================
     STATE
  ========================================= */

  const [
    certificateId,
    setCertificateId,
  ] = useState(
    urlCertificateId
      ? decodeURIComponent(
          urlCertificateId
        ).toUpperCase()
      : ""
  );

  const [
    certificate,
    setCertificate,
  ] =
    useState<Certificate | null>(
      null
    );

  const [
    searched,
    setSearched,
  ] = useState(false);

  /* =========================================
     LOAD CERTIFICATE FROM BACKEND
  ========================================= */

  const [loading, setLoading] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const getApiCertificateId = (
    value: string
  ): string => {
    return value.trim().toUpperCase();
  };

  const verifyCertificate = async (
    valueOverride?: string
  ) => {
    const value = (
      valueOverride ??
      certificateId
    )
      .trim()
      .toUpperCase();

    if (!value) {
      setCertificate(null);
      setLoadError("");
      setSearched(true);
      return;
    }

    setCertificate(null);
    setLoadError("");
    setLoading(true);
    setCertificateId(value);

    try {
      const response = await fetch(
        `http://localhost:5000/api/public/certificates/${encodeURIComponent(
          getApiCertificateId(value)
        )}`
      );

      const data: unknown =
        await response.json();

      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (
            data as {
              message?: unknown;
            }
          ).message === "string"
            ? (
                data as {
                  message: string;
                }
              ).message
            : "Certificate not found.";

        throw new Error(message);
      }

      const payload =
        data &&
        typeof data === "object" &&
        "certificate" in data
          ? (
              data as {
                certificate?: unknown;
              }
            ).certificate
          : data;

      if (
        !payload ||
        typeof payload !== "object"
      ) {
        throw new Error(
          "Invalid certificate response."
        );
      }

      const normalized =
        normalizeCertificate(
          payload as StoredCertificate
        );

      setCertificate(normalized);
      setSearched(true);

      window.history.replaceState(
        null,
        "",
        `/verify/${encodeURIComponent(
          value.trim().toUpperCase()
        )}`
      );
    } catch (error) {
      console.error(
        "Certificate verification error:",
        error
      );

      setCertificate(null);
      setSearched(true);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to verify certificate."
      );

      window.history.replaceState(
        null,
        "",
        `/verify/${encodeURIComponent(
          value.trim().toUpperCase()
        )}`
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     AUTO VERIFY
  ========================================= */

  useEffect(() => {
    if (!urlCertificateId) {
      return;
    }

    const decoded =
      decodeURIComponent(
        urlCertificateId
      ).toUpperCase();

    setCertificateId(
      decoded
    );

    verifyCertificate(
      decoded
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCertificateId]);

  /* =========================================
     STATUS
  ========================================= */

  const isValid =
    certificate?.status ===
    "Valid";

  const isExpired =
    certificate?.status ===
    "Expired";

  const isRevoked =
    certificate?.status ===
    "Revoked";

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-xl font-bold text-white">
              A
            </div>

            <div>

              <h1 className="text-lg font-bold text-slate-900">
                ALMVE
              </h1>

              <p className="text-xs text-slate-500">
                Automated Legal Metrology Verification Engine
              </p>

            </div>

          </div>

          <div className="hidden items-center gap-2 text-sm font-medium text-slate-500 sm:flex">

            <ShieldCheck
              size={18}
              className="text-green-600"
            />

            Public Certificate Verification

          </div>

        </div>

      </header>

      {/* =====================================
          MAIN
      ===================================== */}

      <main className="px-4 py-8 md:px-6 md:py-12">

        <div className="mx-auto max-w-5xl">

          {/* TITLE */}

          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">

              <ShieldCheck
                size={32}
              />

            </div>

            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Verify Digital Certificate
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-slate-500">
              Verify the authenticity and current status of a Legal Metrology verification certificate.
            </p>

          </div>

          {/* SEARCH BOX */}

          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

            <label
              htmlFor="certificateId"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Certificate ID / Certificate Number
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="relative flex-1">

                <Search
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="certificateId"
                  type="text"
                  value={
                    certificateId
                  }
                  onChange={(
                    event
                  ) => {
                    setCertificateId(
                      event.target.value.toUpperCase()
                    );

                    setSearched(
                      false
                    );
                  }}
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      verifyCertificate();
                    }
                  }}
                  placeholder="Enter Certificate ID or Certificate Number"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />

              </div>

              <button
                type="button"
                onClick={() =>
                  verifyCertificate()
                }
                className="rounded-xl bg-green-700 px-6 py-3.5 font-semibold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800 active:scale-95"
              >
                Verify Certificate
              </button>

            </div>

          </div>

          {loading && (
            <div className="mt-8 rounded-2xl border border-green-100 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />
              <h2 className="text-xl font-bold text-slate-900">
                Verifying Certificate
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Checking the ALMVE certificate registry...
              </p>
            </div>
          )}

          {searched &&
            !loading &&
            certificate && (

              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* RESULT HEADER */}

                <div
                  className={`border-b p-6 ${
                    isValid
                      ? "border-green-200 bg-green-50"
                      : isExpired
                      ? "border-red-200 bg-red-50"
                      : isRevoked
                      ? "border-red-200 bg-red-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >

                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    <div className="flex items-center gap-4">

                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                          isValid
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >

                        {isValid ? (
                          <CheckCircle2
                            size={30}
                          />
                        ) : (
                          <XCircle
                            size={30}
                          />
                        )}

                      </div>

                      <div>

                        <p className="text-sm font-medium text-slate-500">
                          Certificate Verification Result
                        </p>

                        <h2
                          className={`mt-1 text-2xl font-bold ${
                            isValid
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >

                          {isValid
                            ? "VALID CERTIFICATE"
                            : isRevoked
                            ? "REVOKED CERTIFICATE"
                            : isExpired
                            ? "EXPIRED CERTIFICATE"
                            : "CERTIFICATE STATUS"}

                        </h2>

                      </div>

                    </div>

                    <div
                      className={`rounded-full px-4 py-2 text-sm font-bold ${
                        isValid
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >

                      {
                        certificate.status
                      }

                    </div>

                  </div>

                </div>

                {/* DETAILS */}

                <div className="p-6 md:p-8">

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <InfoCard
                      icon={
                        <FileCheck2
                          size={19}
                        />
                      }
                      label="Certificate ID"
                      value={
                        certificate.certificateId
                      }
                    />

                    <InfoCard
                      icon={
                        <FileTextIcon />
                      }
                      label="Certificate Number"
                      value={
                        certificate.certificateNumber
                      }
                    />

                    <InfoCard
                      icon={
                        <ShieldCheck
                          size={19}
                        />
                      }
                      label="Verification ID"
                      value={
                        certificate.verificationId
                      }
                    />

                    <InfoCard
                      icon={
                        <FileTextIcon />
                      }
                      label="Application ID"
                      value={
                        certificate.applicationId ||
                        "N/A"
                      }
                    />

                    <InfoCard
                      icon={
                        <Building2
                          size={19}
                        />
                      }
                      label="Business ID"
                      value={
                        certificate.businessId
                      }
                    />

                    <InfoCard
                      icon={
                        <Scale
                          size={19}
                        />
                      }
                      label="Instrument ID"
                      value={
                        certificate.instrumentId
                      }
                    />

                    <InfoCard
                      icon={
                        <Scale
                          size={19}
                        />
                      }
                      label="Instrument Type"
                      value={
                        certificate.instrumentType
                      }
                    />

                    <InfoCard
                      icon={
                        <Building2
                          size={19}
                        />
                      }
                      label="Manufacturer"
                      value={
                        certificate.manufacturer
                      }
                    />

                    <InfoCard
                      icon={
                        <Scale
                          size={19}
                        />
                      }
                      label="Nominal Value"
                      value={
                        certificate.nominalValue ||
                        "N/A"
                      }
                    />

                    <InfoCard
                      icon={
                        <CalendarDays
                          size={19}
                        />
                      }
                      label="Issue Date"
                      value={
                        certificate.issueDate
                      }
                    />

                    <InfoCard
                      icon={
                        <CalendarDays
                          size={19}
                        />
                      }
                      label="Valid Until"
                      value={
                        certificate.validUntil
                      }
                    />

                    <InfoCard
                      icon={
                        <User size={19} />
                      }
                      label="Issuing Officer"
                      value={
                        certificate.officerId
                      }
                    />

                    {certificate.location && (
                      <InfoCard
                        icon={
                          <MapPin
                            size={19}
                          />
                        }
                        label="Verification Location"
                        value={
                          certificate.location
                        }
                      />
                    )}

                    {certificate.observedValue && (
                      <InfoCard
                        icon={
                          <Scale
                            size={19}
                          />
                        }
                        label="Observed Value"
                        value={
                          certificate.observedValue
                        }
                      />
                    )}

                    {certificate.permissibleError && (
                      <InfoCard
                        icon={
                          <Scale
                            size={19}
                          />
                        }
                        label="Permissible Error"
                        value={
                          certificate.permissibleError
                        }
                      />
                    )}

                    {certificate.error && (
                      <InfoCard
                        icon={
                          <Scale
                            size={19}
                          />
                        }
                        label="Error"
                        value={
                          certificate.error
                        }
                      />
                    )}

                    {certificate.absoluteError && (
                      <InfoCard
                        icon={
                          <Scale
                            size={19}
                          />
                        }
                        label="Absolute Error"
                        value={
                          certificate.absoluteError
                        }
                      />
                    )}

                  </div>

                  {/* AUTHENTICITY */}

                  <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-5">

                    <div className="flex gap-4">

                      <ShieldCheck
                        size={24}
                        className="mt-0.5 shrink-0 text-green-700"
                      />

                      <div>

                        <h3 className="font-bold text-green-900">
                          Certificate Authentication
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-green-800">
                          This certificate record was found in the ALMVE public verification system. Check the certificate ID, instrument details, issue date and validity period before relying on this record.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* REMARKS */}

                  {certificate.remarks && (

                    <div className="mt-5 rounded-xl bg-slate-50 p-5">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Remarks
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {
                          certificate.remarks
                        }
                      </p>

                    </div>

                  )}

                  {/* BACK */}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/"
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >

                      <ArrowLeft
                        size={18}
                      />

                      Government Home

                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCertificate(
                          null
                        );
                        setCertificateId(
                          ""
                        );
                        setSearched(
                          false
                        );
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
                    >

                      <Search
                        size={18}
                      />

                      Verify Another

                    </button>

                  </div>

                </div>

              </div>

            )}

          {/* =====================================
              NOT FOUND
          ===================================== */}

          {searched &&
            !loading &&
            !certificate && (

              <div className="mt-8 rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">

                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">

                  <XCircle
                    size={30}
                    className="text-red-600"
                  />

                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  Certificate Not Found
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  No certificate record was found for the entered Certificate ID.
                </p>

                <p className="mt-4 text-xs font-semibold text-slate-400">
                  Certificate ID:
                  {" "}
                  {certificateId}
                </p>

                {loadError && (
                  <p className="mt-3 text-sm font-medium text-red-600">
                    {loadError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setCertificateId(
                      ""
                    );
                    setCertificate(
                      null
                    );
                    setSearched(
                      false
                    );
                  }}
                  className="mt-6 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
                >
                  Try Again
                </button>

              </div>

            )}

          {/* =====================================
              FOOTER
          ===================================== */}

          <div className="mt-8 text-center">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-green-700"
            >

              <ArrowLeft
                size={17}
              />

              Go Back

            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

/* =========================================
   INFO CARD
========================================= */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

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
   FILE ICON
========================================= */

function FileTextIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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

export default PublicVerify;