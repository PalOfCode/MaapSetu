import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const API_BASE_URL = "http://localhost:5000";

interface Business {
  businessId: number;
  businessName: string;
}

export default function PublicBusinessQR() {
  const [businessName, setBusinessName] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] =
    useState<Business | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchBusiness = async () => {
    const name = businessName.trim();

    if (!name) {
      setError("Please enter a business name.");
      return;
    }

    setLoading(true);
    setError("");
    setBusinesses([]);
    setSelectedBusiness(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/public/businesses/search?businessName=${encodeURIComponent(
          name
        )}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to search businesses.");
      }

      if (!data.businesses || data.businesses.length === 0) {
        setError("No business found.");
        return;
      }

      setBusinesses(data.businesses);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const generateQR = (business: Business) => {
    setSelectedBusiness(business);
  };

  const businessUrl = selectedBusiness
    ? `${window.location.origin}/business/${selectedBusiness.businessId}`
    : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#f5f7fa",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "white",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginBottom: "10px" }}>
          Business Certificate Verification
        </h1>

        <p style={{ color: "#666", marginBottom: "25px" }}>
          Enter the business name to generate its certificate QR code.
        </p>

        {/* SEARCH */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchBusiness();
              }
            }}
            placeholder="Enter business name"
            style={{
              flex: 1,
              padding: "12px 14px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          />

          <button
            onClick={searchBusiness}
            disabled={loading}
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "8px",
              background: "#ffecec",
              color: "#c62828",
            }}
          >
            {error}
          </div>
        )}

        {/* BUSINESS RESULTS */}
        {businesses.length > 0 && (
          <div style={{ marginBottom: "30px" }}>
            <h2>Select Business</h2>

            {businesses.map((business) => (
              <div
                key={business.businessId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  marginTop: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                }}
              >
                <div>
                  <strong>{business.businessName}</strong>

                  <div
                    style={{
                      fontSize: "13px",
                      color: "#777",
                      marginTop: "4px",
                    }}
                  >
                    Business ID: {business.businessId}
                  </div>
                </div>

                <button
                  onClick={() => generateQR(business)}
                  style={{
                    padding: "10px 15px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Generate QR
                </button>
              </div>
            ))}
          </div>
        )}

        {/* QR */}
        {selectedBusiness && (
          <div
            style={{
              textAlign: "center",
              borderTop: "1px solid #eee",
              paddingTop: "30px",
            }}
          >
            <h2>{selectedBusiness.businessName}</h2>

            <p style={{ color: "#666" }}>
              Scan this QR code to view all certificates
              for this business.
            </p>

            <div
              style={{
                display: "inline-block",
                padding: "20px",
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "12px",
                marginTop: "15px",
              }}
            >
              <QRCodeCanvas
                value={businessUrl}
                size={250}
                level="H"
              />
            </div>

            <p
              style={{
                marginTop: "15px",
                fontSize: "13px",
                color: "#777",
                wordBreak: "break-all",
              }}
            >
              {businessUrl}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}