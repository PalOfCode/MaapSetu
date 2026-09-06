import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  Printer,
  QrCode,
  Search,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/* =========================================
   TYPES
========================================= */

type CertificateStatus =
  | "Valid"
  | "Expiring Soon"
  | "Expired";

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
  issued?: unknown;
  issuedDate?: unknown;

  validUntil?: unknown;

  status?: unknown;

  officerId?: unknown;
  officer?: unknown;

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

  createdAt?: unknown;
}

/* =========================================
   DEFAULT CERTIFICATES
========================================= */

/* =========================================
   HELPERS
========================================= */

function toStringValue(
  value: unknown,
  fallback = ""
): string {
  return typeof value === "string"
    ? value
    : fallback;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getCertificateStatus(
  validUntil: string,
  storedStatus?: unknown
): CertificateStatus {
  if (
    storedStatus === "Valid" ||
    storedStatus ===
      "Expiring Soon" ||
    storedStatus === "Expired"
  ) {
    return storedStatus;
  }

  if (!validUntil) {
    return "Valid";
  }

  const parsedDate =
    new Date(validUntil);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Valid";
  }

  const now = new Date();

  const difference =
    parsedDate.getTime() -
    now.getTime();

  const daysRemaining =
    difference /
    (1000 * 60 * 60 * 24);

  if (daysRemaining < 0) {
    return "Expired";
  }

  if (daysRemaining <= 30) {
    return "Expiring Soon";
  }

  return "Valid";
}

function normalizeCertificate(
  item: StoredCertificate
): Certificate {
  const certificateId =
    toStringValue(
      item.certificateId
    ) ||
    toStringValue(item.id) ||
    `CERT-${Date.now()}`;

  const certificateNumber =
    toStringValue(
      item.certificateNumber
    ) ||
    certificateId;

  const issueDate =
    toStringValue(
      item.issueDate
    ) ||
    toStringValue(
      item.issuedDate
    ) ||
    toStringValue(
      item.issued
    ) ||
    "-";

  const validUntil =
    toStringValue(
      item.validUntil
    ) ||
    "Not specified";

  const status =
    getCertificateStatus(
      validUntil,
      item.status
    );

  return {
    certificateId,

    certificateNumber,

    verificationId:
      toStringValue(
        item.verificationId
      ) ||
      `VER-${Date.now()}`,

    applicationId:
      toStringValue(
        item.applicationId
      ),

    instrumentId:
      toStringValue(
        item.instrumentId
      ) ||
      "INS-UNKNOWN",

    businessId:
      toStringValue(
        item.businessId
      ) ||
      "BUS-UNKNOWN",

    certificateType:
      toStringValue(
        item.certificateType
      ) ||
      "Verification Certificate",

    issueDate,

    validUntil,

    status,

    officerId:
      toStringValue(
        item.officerId
      ) ||
      toStringValue(
        item.officer
      ) ||
      "Authorized Inspector",

    instrumentType:
      toStringValue(
        item.instrumentType
      ) ||
      "Unknown Instrument",

    manufacturer:
      toStringValue(
        item.manufacturer
      ) ||
      "Unknown Manufacturer",

    nominalValue:
      toStringValue(
        item.nominalValue
      ) ||
      undefined,

    observedValue:
      toStringValue(
        item.observedValue
      ) ||
      toStringValue(
        item.observedDeviation
      ) ||
      undefined,

    permissibleError:
      toStringValue(
        item.permissibleError
      ) ||
      toStringValue(
        item.allowedMPE
      ) ||
      undefined,

    error:
      toStringValue(
        item.error
      ) ||
      undefined,

    absoluteError:
      toStringValue(
        item.absoluteError
      ) ||
      toStringValue(
        item.absoluteDeviation
      ) ||
      undefined,

    remarks:
      toStringValue(
        item.remarks
      ) ||
      undefined,

    createdAt:
      toStringValue(
        item.createdAt
      ) ||
      new Date().toISOString(),
  };
}

/* =========================================
   COMPONENT
========================================= */

function Certificates() {
  const navigate =
    useNavigate();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState<
    "All" | CertificateStatus
  >("All");

  const [
    selectedCertificate,
    setSelectedCertificate,
  ] =
    useState<Certificate | null>(
      null
    );

  const [
    certificateList,
    setCertificateList,
  ] =
    useState<Certificate[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  /* =========================================
     LOAD CERTIFICATES FROM POSTGRESQL
  ========================================= */

  useEffect(() => {
    let cancelled = false;

    const loadCertificates = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const token =
          localStorage.getItem("almveToken") ||
          localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Login session not found. Please sign in again."
          );
        }

        const response = await fetch(
          "http://localhost:5000/api/certificates",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const payload: unknown =
          await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            payload &&
            typeof payload === "object" &&
            "message" in payload &&
            typeof (
              payload as { message?: unknown }
            ).message === "string"
              ? String(
                  (payload as { message: string })
                    .message
                )
              : `Unable to load certificates (${response.status})`;

          throw new Error(message);
        }

        const rawCertificates =
          payload &&
          typeof payload === "object" &&
          "certificates" in payload &&
          Array.isArray(
            (payload as {
              certificates?: unknown;
            }).certificates
          )
            ? (
                payload as {
                  certificates: unknown[];
                }
              ).certificates
            : [];

        const normalizedCertificates =
          rawCertificates.map(
            (item) =>
              normalizeCertificate(
                item as StoredCertificate
              )
          );

        if (!cancelled) {
          setCertificateList(
            normalizedCertificates
          );
        }
      } catch (error) {
        console.error(
          "Unable to load certificates:",
          error
        );

        if (!cancelled) {
          setCertificateList([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load certificates."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCertificates();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================
     SEARCH + FILTER
  ========================================= */

  const filteredCertificates =
    useMemo(() => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      return certificateList.filter(
        (certificate) => {
          const searchableText =
            [
              certificate.certificateId,
              certificate.certificateNumber,
              certificate.verificationId,
              certificate.applicationId,
              certificate.instrumentId,
              certificate.businessId,
              certificate.instrumentType,
              certificate.manufacturer,
              certificate.officerId,
              certificate.certificateType,
            ]
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            searchableText.includes(
              searchText
            );

          const matchesFilter =
            filter === "All" ||
            certificate.status ===
              filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      certificateList,
      search,
      filter,
    ]);

  /* =========================================
     STATISTICS
  ========================================= */

  const totalCount =
    certificateList.length;

  const validCount =
    certificateList.filter(
      (certificate) =>
        certificate.status ===
        "Valid"
    ).length;

  const expiringCount =
    certificateList.filter(
      (certificate) =>
        certificate.status ===
        "Expiring Soon"
    ).length;

  const expiredCount =
    certificateList.filter(
      (certificate) =>
        certificate.status ===
        "Expired"
    ).length;

  /* =========================================
     PUBLIC VERIFICATION URL
  ========================================= */

 const getVerificationUrl = (
  certificateId: string
) => {
  return `http://localhost:5000/api/public/certificates/${encodeURIComponent(
    certificateId
  )}`;
};

  /* =========================================
     OPEN PUBLIC VERIFICATION
  ========================================= */

  const openPublicVerification =
    (
      certificate: Certificate
    ) => {
      navigate(
        `/verify/${encodeURIComponent(
          certificate.certificateId
        )}`
      );
    };

  /* =========================================
     DOWNLOAD
  ========================================= */

  const downloadCertificate = (
    certificate: Certificate
  ) => {
    const verificationUrl = getVerificationUrl(
      certificate.certificateId
    );

    const printWindow = window.open(
      "",
      "_blank",
      "width=1100,height=850"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to download the certificate as PDF."
      );
      return;
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(certificate.certificateNumber)}</title>
<style>
* { box-sizing: border-box; }
@page { size: A4; margin: 12mm; }

body {
  margin: 0;
  background: #ffffff;
  color: #0f172a;
  font-family: Arial, Helvetica, sans-serif;
}

.certificate {
  max-width: 190mm;
  min-height: 265mm;
  margin: 0 auto;
  border: 3px solid #047857;
  padding: 24px;
  background: #ffffff;
}

.top-line {
  height: 6px;
  background: #047857;
  border-radius: 99px;
  margin-bottom: 24px;
}

.header {
  text-align: center;
  border-bottom: 1px solid #cbd5e1;
  padding-bottom: 20px;
}

.logo {
  width: 58px;
  height: 58px;
  margin: 0 auto;
  border-radius: 14px;
  background: #047857;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 27px;
  font-weight: 800;
}

.brand {
  margin: 10px 0 0;
  font-size: 27px;
  font-weight: 800;
}

.subtitle {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
}

.title {
  margin-top: 16px;
  color: #065f46;
  font-size: 19px;
  font-weight: 800;
}

.number {
  margin-top: 6px;
  color: #047857;
  font-size: 13px;
  font-weight: 700;
}

.grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 11px;
  break-inside: avoid;
}

.label {
  margin-bottom: 5px;
  color: #64748b;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.value {
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
  word-break: break-word;
}

.status {
  margin-top: 18px;
  padding: 12px;
  border-radius: 10px;
  background: #dcfce7;
  color: #166534;
  text-align: center;
  font-size: 12px;
  font-weight: 800;
}

.verify {
  margin-top: 14px;
  padding: 12px;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  background: #f0fdf4;
  text-align: center;
}

.verify-title {
  color: #166534;
  font-size: 11px;
  font-weight: 800;
}

.url {
  margin-top: 6px;
  color: #475569;
  font-size: 9px;
  word-break: break-all;
}

.footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 9px;
  line-height: 1.5;
  text-align: center;
}
</style>
</head>
<body>
<div class="certificate">
  <div class="top-line"></div>

  <div class="header">
    <div class="logo">A</div>
    <div class="brand">ALMVE</div>
    <div class="subtitle">Automated Legal Metrology Verification Engine</div>
    <div class="title">DIGITAL VERIFICATION CERTIFICATE</div>
    <div class="number">${escapeHtml(certificate.certificateNumber)}</div>
  </div>

  <div class="grid">
    <div class="item"><div class="label">Certificate ID</div><div class="value">${escapeHtml(certificate.certificateId)}</div></div>
    <div class="item"><div class="label">Certificate Number</div><div class="value">${escapeHtml(certificate.certificateNumber)}</div></div>
    <div class="item"><div class="label">Verification ID</div><div class="value">${escapeHtml(certificate.verificationId)}</div></div>
    <div class="item"><div class="label">Application ID</div><div class="value">${escapeHtml(certificate.applicationId || "N/A")}</div></div>
    <div class="item"><div class="label">Business ID</div><div class="value">${escapeHtml(certificate.businessId)}</div></div>
    <div class="item"><div class="label">Instrument ID</div><div class="value">${escapeHtml(certificate.instrumentId)}</div></div>
    <div class="item"><div class="label">Instrument Type</div><div class="value">${escapeHtml(certificate.instrumentType)}</div></div>
    <div class="item"><div class="label">Manufacturer</div><div class="value">${escapeHtml(certificate.manufacturer)}</div></div>
    <div class="item"><div class="label">Nominal Value</div><div class="value">${escapeHtml(certificate.nominalValue || "N/A")}</div></div>
    <div class="item"><div class="label">Observed Value</div><div class="value">${escapeHtml(certificate.observedValue || "N/A")}</div></div>
    <div class="item"><div class="label">Permissible Error</div><div class="value">${escapeHtml(certificate.permissibleError || "N/A")}</div></div>
    <div class="item"><div class="label">Error</div><div class="value">${escapeHtml(certificate.error || "N/A")}</div></div>
    <div class="item"><div class="label">Absolute Error</div><div class="value">${escapeHtml(certificate.absoluteError || "N/A")}</div></div>
    <div class="item"><div class="label">Issuing Officer</div><div class="value">${escapeHtml(certificate.officerId)}</div></div>
    <div class="item"><div class="label">Issue Date</div><div class="value">${escapeHtml(certificate.issueDate)}</div></div>
    <div class="item"><div class="label">Valid Until</div><div class="value">${escapeHtml(certificate.validUntil)}</div></div>
    <div class="item"><div class="label">Certificate Type</div><div class="value">${escapeHtml(certificate.certificateType)}</div></div>
    <div class="item"><div class="label">Remarks</div><div class="value">${escapeHtml(certificate.remarks || "N/A")}</div></div>
  </div>

  <div class="status">
    Certificate Status: ${escapeHtml(certificate.status)}
  </div>

  <div class="verify">
    <div class="verify-title">PUBLIC CERTIFICATE VERIFICATION</div>
    <div class="url">${escapeHtml(verificationUrl)}</div>
  </div>

  <div class="footer">
    This digital certificate was generated by ALMVE (Automated Legal Metrology Verification Engine).
    Verify the certificate using the public verification URL.
  </div>
</div>

<script>
window.addEventListener("load", function () {
  setTimeout(function () {
    window.print();
  }, 300);
});
</script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  /* =========================================
     PRINT
  ========================================= */

  const printCertificate = (
    certificate: Certificate
  ) => {
    const verificationUrl =
      getVerificationUrl(
        certificate.certificateId
      );

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=1000,height=800"
      );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print the certificate."
      );

      return;
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html>

<head>

<title>
${certificate.certificateId}
</title>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 30px;
  font-family: Arial, Helvetica, sans-serif;
  background: #f1f5f9;
  color: #0f172a;
}

.certificate {
  max-width: 850px;
  margin: auto;
  background: #ffffff;
  border: 3px solid #047857;
  border-radius: 20px;
  padding: 40px;
}

.header {
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 24px;
  margin-bottom: 25px;
}

.logo {
  width: 60px;
  height: 60px;
  background: #047857;
  color: white;
  border-radius: 15px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
}

h1 {
  margin: 12px 0 0;
  font-size: 28px;
}

.subtitle {
  margin-top: 6px;
  color: #64748b;
  font-size: 14px;
}

.title {
  margin-top: 18px;
  font-size: 20px;
  font-weight: 800;
  color: #065f46;
}

.number {
  margin-top: 7px;
  color: #047857;
  font-weight: 700;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
}

.label {
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.value {
  font-size: 14px;
  font-weight: 700;
  word-break: break-word;
}

.status {
  margin-top: 22px;
  padding: 14px;
  text-align: center;
  background: #dcfce7;
  color: #166534;
  border-radius: 12px;
  font-weight: bold;
}

.verify {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
  word-break: break-all;
}

@media print {

  body {
    padding: 0;
    background: white;
  }

  .certificate {
    border-radius: 0;
  }

}

@media (max-width: 700px) {

  body {
    padding: 10px;
  }

  .certificate {
    padding: 20px;
  }

  .grid {
    grid-template-columns: 1fr;
  }

}

</style>

</head>

<body>

<div class="certificate">

  <div class="header">

    <div class="logo">
      A
    </div>

    <h1>
      ALMVE
    </h1>

    <div class="subtitle">
      Automated Legal Metrology Verification Engine
    </div>

    <div class="title">
      DIGITAL VERIFICATION CERTIFICATE
    </div>

    <div class="number">
      ${certificate.certificateNumber}
    </div>

  </div>

  <div class="grid">

    <div class="item">
      <div class="label">
        Certificate ID
      </div>
      <div class="value">
        ${certificate.certificateId}
      </div>
    </div>

    <div class="item">
      <div class="label">
        Verification ID
      </div>
      <div class="value">
        ${certificate.verificationId}
      </div>
    </div>

    <div class="item">
      <div class="label">
        Application ID
      </div>
      <div class="value">
        ${certificate.applicationId || "N/A"}
      </div>
    </div>

    <div class="item">
      <div class="label">
        Business ID
      </div>
      <div class="value">
        ${certificate.businessId}
      </div>
    </div>

    <div class="item">
      <div class="label">
        Instrument ID
      </div>
      <div class="value">
        ${certificate.instrumentId}
      </div>
    </div>

    <div class="item">
      <div class="label">
        Instrument Type
      </div>
      <div class="value">
        ${certificate.instrumentType}
      </div>
    </div>

    <div class="item">
      <div class="label">
        Manufacturer
      </div>
      <div class="value">
        ${certificate.manufacturer}
      </div>
    </div>

    <div class="item">
      <div class="label">
        Officer
      </div>
      <div class="value">
        ${certificate.officerId}
      </div>
    </div>

    <div class="item">
      <div class="label">
        Issue Date
      </div>
      <div class="value">
        ${certificate.issueDate}
      </div>
    </div>

    <div class="item">
      <div class="label">
        Valid Until
      </div>
      <div class="value">
        ${certificate.validUntil}
      </div>
    </div>

    <div class="item">
      <div class="label">
        Nominal Value
      </div>
      <div class="value">
        ${certificate.nominalValue || "N/A"}
      </div>
    </div>

    <div class="item">
      <div class="label">
        Certificate Type
      </div>
      <div class="value">
        ${certificate.certificateType}
      </div>
    </div>

  </div>

  <div class="status">
    Certificate Status: ${certificate.status}
  </div>

  <div class="verify">
    Public Verification:
    <br />
    ${verificationUrl}
  </div>

</div>

<script>
window.onload = function() {
  window.print();
};
</script>

</body>

</html>
`);

    printWindow.document.close();
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

        <div className="mb-8">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/merchant/dashboard"
              )
            }
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-green-700 transition hover:text-green-800"
          >

            <ArrowLeft
              size={18}
            />

            Back to Dashboard

          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm font-semibold text-green-700">
                Merchant Portal
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
                Certificates
              </h1>

              <p className="mt-2 text-slate-500">
                View and manage your digital legal metrology verification certificates.
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">

              <p className="text-xs font-medium text-slate-400">
                Total Certificates
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {totalCount}
              </p>

            </div>

          </div>

        </div>

        {/* =====================================
            STATISTICS
        ===================================== */}

        <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-3">

          <StatCard
            title="Valid Certificates"
            value={String(
              validCount
            )}
            icon={
              <CheckCircle
                size={22}
              />
            }
            iconClass="bg-green-100 text-green-700"
          />

          <StatCard
            title="Expiring Soon"
            value={String(
              expiringCount
            )}
            icon={
              <Clock
                size={22}
              />
            }
            iconClass="bg-amber-100 text-amber-700"
          />

          <StatCard
            title="Expired"
            value={String(
              expiredCount
            )}
            icon={
              <AlertCircle
                size={22}
              />
            }
            iconClass="bg-red-100 text-red-700"
          />

        </div>

        {/* =====================================
            SEARCH
        ===================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full max-w-2xl">

              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search certificate, application, instrument, business..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
              />

            </div>

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
                label="Valid"
                active={
                  filter ===
                  "Valid"
                }
                onClick={() =>
                  setFilter(
                    "Valid"
                  )
                }
              />

              <FilterButton
                label="Expiring Soon"
                active={
                  filter ===
                  "Expiring Soon"
                }
                onClick={() =>
                  setFilter(
                    "Expiring Soon"
                  )
                }
              />

              <FilterButton
                label="Expired"
                active={
                  filter ===
                  "Expired"
                }
                onClick={() =>
                  setFilter(
                    "Expired"
                  )
                }
              />

            </div>

          </div>

        </div>

        {loadError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {/* =====================================
            TABLE
        ===================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">

                <FileCheck2
                  size={23}
                />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Digital Verification Certificates
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    filteredCertificates.length
                  } certificates found
                </p>

              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1250px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <TableHead>
                    Certificate
                  </TableHead>

                  <TableHead>
                    Application
                  </TableHead>

                  <TableHead>
                    Business
                  </TableHead>

                  <TableHead>
                    Instrument
                  </TableHead>

                  <TableHead>
                    Officer
                  </TableHead>

                  <TableHead>
                    Issue Date
                  </TableHead>

                  <TableHead>
                    Valid Until
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead>
                    Actions
                  </TableHead>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {isLoading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      Loading certificates...
                    </td>
                  </tr>
                ) : filteredCertificates.length > 0 ? (

                  filteredCertificates.map(
                    (
                      certificate
                    ) => (

                      <tr
                        key={
                          certificate.certificateId
                        }
                        className="transition hover:bg-green-50/30"
                      >

                        {/* Certificate */}

                        <TableCell>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCertificate(
                                certificate
                              )
                            }
                            className="text-left"
                          >

                            <p className="font-bold text-green-700 hover:underline">

                              {
                                certificate.certificateId
                              }

                            </p>

                            <p className="mt-1 text-xs text-slate-400">

                              {
                                certificate.certificateNumber
                              }

                            </p>

                          </button>

                        </TableCell>

                        {/* Application */}

                        <TableCell>

                          <p className="font-semibold text-slate-700">

                            {
                              certificate.applicationId ||
                              "N/A"
                            }

                          </p>

                          <p className="mt-1 text-xs text-slate-400">

                            {
                              certificate.verificationId
                            }

                          </p>

                        </TableCell>

                        {/* Business */}

                        <TableCell>

                          <span className="font-semibold text-slate-700">

                            {
                              certificate.businessId
                            }

                          </span>

                        </TableCell>

                        {/* Instrument */}

                        <TableCell>

                          <p className="font-semibold text-slate-800">

                            {
                              certificate.instrumentId
                            }

                          </p>

                          <p className="mt-1 text-xs text-slate-500">

                            {
                              certificate.instrumentType
                            }

                          </p>

                        </TableCell>

                        {/* Officer */}

                        <TableCell>

                          <span className="text-sm text-slate-600">

                            {
                              certificate.officerId
                            }

                          </span>

                        </TableCell>

                        {/* Issue */}

                        <TableCell>

                          <span className="text-sm text-slate-600">

                            {
                              certificate.issueDate
                            }

                          </span>

                        </TableCell>

                        {/* Valid */}

                        <TableCell>

                          <span className="text-sm text-slate-600">

                            {
                              certificate.validUntil
                            }

                          </span>

                        </TableCell>

                        {/* Status */}

                        <TableCell>

                          <StatusBadge
                            status={
                              certificate.status
                            }
                          />

                        </TableCell>

                        {/* Actions */}

                        <TableCell>

                          <div className="flex items-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCertificate(
                                  certificate
                                )
                              }
                              title="View"
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                            >

                              <Eye
                                size={17}
                              />

                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                downloadCertificate(
                                  certificate
                                )
                              }
                              title="Download"
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                            >

                              <Download
                                size={17}
                              />

                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                printCertificate(
                                  certificate
                                )
                              }
                              title="Print"
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                            >

                              <Printer
                                size={17}
                              />

                            </button>

                          </div>

                        </TableCell>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={9}
                      className="px-6 py-16 text-center"
                    >

                      <FileCheck2
                        size={42}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <h3 className="text-lg font-semibold text-slate-800">
                        No certificates found
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

        </div>

      </div>

      {/* =====================================
          DETAILS MODAL
      ===================================== */}

      {selectedCertificate && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onClick={() =>
            setSelectedCertificate(
              null
            )
          }
        >

          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
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
                  Digital Verification Certificate
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">

                  {
                    selectedCertificate.certificateId
                  }

                </h2>

                <p className="mt-1 text-xs text-slate-400">

                  {
                    selectedCertificate.certificateNumber
                  }

                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCertificate(
                    null
                  )
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >

                <X size={21} />

              </button>

            </div>

            {/* Body */}

            <div className="p-6 md:p-7">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <CertificateDetail
                  label="Certificate ID"
                  value={
                    selectedCertificate.certificateId
                  }
                />

                <CertificateDetail
                  label="Certificate Number"
                  value={
                    selectedCertificate.certificateNumber
                  }
                />

                <CertificateDetail
                  label="Certificate Type"
                  value={
                    selectedCertificate.certificateType
                  }
                />

                <CertificateDetail
                  label="Verification ID"
                  value={
                    selectedCertificate.verificationId
                  }
                />

                <CertificateDetail
                  label="Application ID"
                  value={
                    selectedCertificate.applicationId ||
                    "N/A"
                  }
                />

                <CertificateDetail
                  label="Business ID"
                  value={
                    selectedCertificate.businessId
                  }
                />

                <CertificateDetail
                  label="Instrument ID"
                  value={
                    selectedCertificate.instrumentId
                  }
                />

                <CertificateDetail
                  label="Instrument Type"
                  value={
                    selectedCertificate.instrumentType
                  }
                />

                <CertificateDetail
                  label="Manufacturer"
                  value={
                    selectedCertificate.manufacturer
                  }
                />

                <CertificateDetail
                  label="Issuing Officer"
                  value={
                    selectedCertificate.officerId
                  }
                />

                <CertificateDetail
                  label="Issue Date"
                  value={
                    selectedCertificate.issueDate
                  }
                />

                <CertificateDetail
                  label="Valid Until"
                  value={
                    selectedCertificate.validUntil
                  }
                />

                <CertificateDetail
                  label="Nominal Value"
                  value={
                    selectedCertificate.nominalValue ||
                    "N/A"
                  }
                />

                <CertificateDetail
                  label="Observed Value"
                  value={
                    selectedCertificate.observedValue ||
                    "N/A"
                  }
                />

                <CertificateDetail
                  label="Permissible Error"
                  value={
                    selectedCertificate.permissibleError ||
                    "N/A"
                  }
                />

                <CertificateDetail
                  label="Error"
                  value={
                    selectedCertificate.error ||
                    "N/A"
                  }
                />

                <CertificateDetail
                  label="Absolute Error"
                  value={
                    selectedCertificate.absoluteError ||
                    "N/A"
                  }
                />

              </div>

              {/* Status */}

              <div className="mt-6 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Certificate Status
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Current validity status
                  </p>

                </div>

                <StatusBadge
                  status={
                    selectedCertificate.status
                  }
                />

              </div>

              {/* Remarks */}

              {selectedCertificate.remarks && (

                <div className="mt-6 rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Remarks
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">

                    {
                      selectedCertificate.remarks
                    }

                  </p>

                </div>

              )}

              {/* QR */}

              <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-7">

                <div className="text-center">

                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">

                    <QrCode
                      size={22}
                    />

                  </div>

                  <h3 className="mt-3 text-lg font-bold text-slate-900">
                    Public Verification
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Scan or open this link to verify the certificate.
                  </p>

                </div>

                <div className="mt-5 flex justify-center">

                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      getVerificationUrl(
                        selectedCertificate.certificateId
                      )
                    )}`}
                    alt="Certificate verification QR"
                    width={220}
                    height={220}
                    className="h-[220px] w-[220px] rounded-xl bg-white p-2 shadow-sm"
                  />

                </div>

                <p className="mt-4 break-all text-center text-xs text-slate-500">

                  {
                    getVerificationUrl(
                      selectedCertificate.certificateId
                    )
                  }

                </p>

              </div>

              {/* Actions */}

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    openPublicVerification(
                      selectedCertificate
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-3 font-semibold text-green-700 transition hover:bg-green-100"
                >

                  <ExternalLink
                    size={18}
                  />

                  Verify Publicly

                </button>

                <button
                  type="button"
                  onClick={() =>
                    downloadCertificate(
                      selectedCertificate
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >

                  <Download
                    size={18}
                  />

                  Download

                </button>

                <button
                  type="button"
                  onClick={() =>
                    printCertificate(
                      selectedCertificate
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800"
                >

                  <Printer
                    size={18}
                  />

                  Print Certificate

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedCertificate(
                      null
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >

                  <X size={18} />

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
   TABLE HEAD
========================================= */

function TableHead({
  children,
}: {
  children: ReactNode;
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
  children: ReactNode;
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
}: {
  title: string;
  value: string;
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

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
  status: CertificateStatus;
}) {
  const styles: Record<
    CertificateStatus,
    string
  > = {
    Valid:
      "bg-green-100 text-green-700",

    "Expiring Soon":
      "bg-amber-100 text-amber-700",

    Expired:
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
   CERTIFICATE DETAIL
========================================= */

function CertificateDetail({
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

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}

export default Certificates;