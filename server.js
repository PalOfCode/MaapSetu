const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { GoogleGenAI } = require("@google/genai");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

dotenv.config();

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* =========================================================
APP
========================================================= */

const app = express();

/* =========================================================
MIDDLEWARE
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://172.20.10.2:5173",
  "https://maap-setu-two.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https:\/\/maap-setu-.*\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
/* =========================================================
BODY PARSER
========================================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================================================
DATABASE
========================================================= */

const pool = new Pool({
connectionString:
process.env.DATABASE_URL,
});

/* =========================================================
JWT
========================================================= */

const JWT_SECRET =
process.env.JWT_SECRET;

if (!JWT_SECRET) {
console.error(
"ERROR: JWT_SECRET is missing in .env"
);

process.exit(1);
}

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

/* =========================================================
HELPER: CREATE JWT
========================================================= */

function createToken(user) {
return jwt.sign(
{
id: user.id,
email: user.email,
role: user.role,
name: user.name,
},
JWT_SECRET,
{
expiresIn: "7d",
}
);
}

/* =========================================================
MIDDLEWARE: AUTHENTICATION
========================================================= */

function authenticateToken(
req,
res,
next
) {
try {
const authHeader =
req.headers.authorization;

if (!authHeader) {
  return res.status(401).json({
    success: false,
    message:
      "Authorization token is required",
  });
}

if (
  !authHeader.startsWith(
    "Bearer "
  )
) {
  return res.status(401).json({
    success: false,
    message:
      "Invalid authorization format",
  });
}

const token =
  authHeader.split(" ")[1];

const decoded =
  jwt.verify(
    token,
    JWT_SECRET
  );

req.user = decoded;

next();

} catch (error) {
console.error(
"Authentication error:",
error.message
);

return res.status(401).json({
  success: false,
  message:
    "Invalid or expired token",
});

}
}

/* =========================================================
MIDDLEWARE: ROLE CHECK
========================================================= */

function requireRole(
...allowedRoles
) {
return (req, res, next) => {
if (!req.user) {
return res.status(401).json({
success: false,
message:
"Authentication required",
});
}

if (
  !allowedRoles.includes(
    req.user.role
  )
) {
  return res.status(403).json({
    success: false,
    message:
      "You do not have permission to access this resource",
  });
}

next();

};
}

/* =========================================================
ROOT
========================================================= */

app.get("/", (req, res) => {
res.json({
success: true,
message:
"ALMVE Backend is running",
version: "1.0.0",
});
});

/* =========================================================
HEALTH CHECK
========================================================= */

app.get(
"/api/health",
async (req, res) => {
try {
const result =
await pool.query(
"SELECT NOW() AS time"
);

  res.json({
    success: true,
    backend: "connected",
    database: "connected",
    time:
      result.rows[0].time,
  });
} catch (error) {
  console.error(
    "Database health error:",
    error
  );

  res.status(500).json({
    success: false,
    backend: "connected",
    database:
      "disconnected",
    message:
      "Unable to connect to PostgreSQL",
  });
}

}
);

/* =========================================================
REGISTER
========================================================= */

app.post(
"/api/auth/register",
async (req, res) => {
try {
const {
name,
email,
phone,
password,
role,
} = req.body;

  /* -----------------------------------------------
     VALIDATION
  ----------------------------------------------- */

  if (
    !name ||
    !email ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Name, email and password are required",
    });
  }

  if (
    typeof name !==
      "string" ||
    typeof email !==
      "string" ||
    typeof password !==
      "string"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid input data",
    });
  }

  if (
    password.length < 6
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 6 characters",
    });
  }

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  /* -----------------------------------------------
     ROLE
  ----------------------------------------------- */

  const allowedRoles = [
    "merchant",
    "inspector",
    "admin",
  ];

  const selectedRole =
    role &&
    allowedRoles.includes(
      role
    )
      ? role
      : "merchant";

  /* -----------------------------------------------
     CHECK EXISTING USER
  ----------------------------------------------- */

  const existingUser =
    await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [normalizedEmail]
    );

  if (
    existingUser.rows
      .length > 0
  ) {
    return res.status(409).json({
      success: false,
      message:
        "An account with this email already exists",
    });
  }

  /* -----------------------------------------------
     HASH PASSWORD
  ----------------------------------------------- */

  const passwordHash =
    await bcrypt.hash(
      password,
      12
    );

  /* -----------------------------------------------
     INSERT USER
  ----------------------------------------------- */

  const result =
    await pool.query(
      `
      INSERT INTO users
      (
        name,
        email,
        phone,
        password_hash,
        role
      )
      VALUES
      ($1, $2, $3, $4, $5)
      RETURNING
        id,
        name,
        email,
        phone,
        role,
        created_at
      `,
      [
        name.trim(),
        normalizedEmail,
        phone || null,
        passwordHash,
        selectedRole,
      ]
    );

  const user =
    result.rows[0];

  /* -----------------------------------------------
     TOKEN
  ----------------------------------------------- */

  const token =
    createToken(user);

  /* -----------------------------------------------
     RESPONSE
  ----------------------------------------------- */

  return res.status(201).json({
    success: true,
    message:
      "Registration successful",
    token,
    user,
  });
} catch (error) {
  console.error(
    "Register error:",
    error
  );

  return res.status(500).json({
    success: false,
    message:
      "Unable to register user",
  });
}

}
);

/* =========================================================
LOGIN
========================================================= */

app.post(
"/api/auth/login",
async (req, res) => {
try {
const {
email,
password,
} = req.body;

  /* -----------------------------------------------
     VALIDATION
  ----------------------------------------------- */

  if (
    !email ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Email and password are required",
    });
  }

  const normalizedEmail =
    String(email)
      .trim()
      .toLowerCase();

  /* -----------------------------------------------
     FIND USER
  ----------------------------------------------- */

  const result =
    await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        password_hash,
        role,
        created_at
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [normalizedEmail]
    );

  if (
    result.rows.length ===
    0
  ) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid email or password",
    });
  }

  const user =
    result.rows[0];

  /* -----------------------------------------------
     CHECK PASSWORD
  ----------------------------------------------- */

  const passwordMatch =
    await bcrypt.compare(
      password,
      user.password_hash
    );

  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid email or password",
    });
  }

  /* -----------------------------------------------
     CREATE TOKEN
  ----------------------------------------------- */

  const token =
    createToken(user);

  /* -----------------------------------------------
     RESPONSE
  ----------------------------------------------- */

  return res.json({
    success: true,
    message:
      "Login successful",

    token,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at:
        user.created_at,
    },
  });
} catch (error) {
  console.error(
    "Login error:",
    error
  );

  return res.status(500).json({
    success: false,
    message:
      "Unable to login",
  });
}

}
);

/* =========================================================
CURRENT USER
========================================================= */

app.get(
"/api/auth/me",
authenticateToken,
async (req, res) => {
try {
const result =
await pool.query(
          `SELECT
            id,
            name,
            email,
            phone,
            role,
            created_at
          FROM users
          WHERE id = $1
          LIMIT 1`
         ,
[req.user.id]
);

  if (
    result.rows.length ===
    0
  ) {
    return res.status(404).json({
      success: false,
      message:
        "User not found",
    });
  }

  res.json({
    success: true,
    user:
      result.rows[0],
  });
} catch (error) {
  console.error(
    "Current user error:",
    error
  );

  res.status(500).json({
    success: false,
    message:
      "Unable to fetch user",
  });
}

}
);
/* =========================================================
UPDATE CURRENT USER PROFILE
========================================================= */

app.put(
"/api/auth/profile",
authenticateToken,
async (req, res) => {
const client = await pool.connect();

try {
const {
name,
phone,
businessName,
address,
} = req.body;

if (!name || typeof name !== "string") {
return res.status(400).json({
success: false,
message: "Name is required.",
});
}

await client.query("BEGIN");

const userResult = await client.query(
`
UPDATE users
SET
name = $1,
phone = $2
WHERE id = $3
RETURNING
id,
name,
email,
phone,
role,
created_at
`,
[
name.trim(),
phone ? String(phone).trim() : null,
req.user.id,
]
);

if (userResult.rows.length === 0) {
await client.query("ROLLBACK");

return res.status(404).json({
success: false,
message: "User not found.",
});
}

if (
req.user.role === "merchant" &&
(businessName !== undefined ||
address !== undefined)
) {
await client.query(
`
UPDATE businesses
SET
business_name = COALESCE($1, business_name),
address = COALESCE($2, address)
WHERE user_id = $3
`,
[
businessName !== undefined
? String(businessName).trim()
: null,
address !== undefined
? String(address).trim()
: null,
req.user.id,
]
);
}

await client.query("COMMIT");

return res.json({
success: true,
message: "Profile updated successfully.",
user: userResult.rows[0],
});
} catch (error) {
await client.query("ROLLBACK");

console.error(
"Update profile error:",
error
);

return res.status(500).json({
success: false,
message: "Unable to update profile.",
});
} finally {
client.release();
}
}
);

/* =========================================================
CHANGE PASSWORD
========================================================= */

app.put(
"/api/auth/change-password",
authenticateToken,
async (req, res) => {
try {
const {
currentPassword,
newPassword,
} = req.body;

if (
!currentPassword ||
!newPassword
) {
return res.status(400).json({
success: false,
message:
"Current password and new password are required.",
});
}

if (
typeof newPassword !== "string" ||
newPassword.length < 6
) {
return res.status(400).json({
success: false,
message:
"New password must be at least 6 characters.",
});
}

const result = await pool.query(
`
SELECT
id,
password_hash
FROM users
WHERE id = $1
LIMIT 1
`,
[req.user.id]
);

if (result.rows.length === 0) {
return res.status(404).json({
success: false,
message: "User not found.",
});
}

const user = result.rows[0];

const passwordMatch =
await bcrypt.compare(
currentPassword,
user.password_hash
);

if (!passwordMatch) {
return res.status(401).json({
success: false,
message: "Current password is incorrect.",
});
}

const passwordHash =
await bcrypt.hash(
newPassword,
12
);

await pool.query(
`
UPDATE users
SET password_hash = $1
WHERE id = $2
`,
[
passwordHash,
req.user.id,
]
);

return res.json({
success: true,
message:
"Password changed successfully.",
});
} catch (error) {
console.error(
"Change password error:",
error
);

return res.status(500).json({
success: false,
message:
"Unable to change password.",
});
}
}
);
/* =========================================================
TEST MERCHANT ROUTE
========================================================= */

app.get(
"/api/merchant/profile",
authenticateToken,
requireRole("merchant"),
async (req, res) => {
try {
const result =
await pool.query(
          `SELECT
            id,
            name,
            email,
            phone,
            role,
            created_at
          FROM users
          WHERE id = $1`
         ,
[req.user.id]
);

  res.json({
    success: true,
    user:
      result.rows[0] ||
      null,
  });
} catch (error) {
  console.error(
    "Merchant profile error:",
    error
  );

  res.status(500).json({
    success: false,
    message:
      "Unable to fetch merchant profile",
  });
}

}
);

/* =========================================================
TEST INSPECTOR ROUTE
========================================================= */

app.get(
"/api/inspector/profile",
authenticateToken,
requireRole("inspector"),
async (req, res) => {
try {
const result =
await pool.query(
          `SELECT
            id,
            name,
            email,
            phone,
            role,
            created_at
          FROM users
          WHERE id = $1`
         ,
[req.user.id]
);

  res.json({
    success: true,
    user:
      result.rows[0] ||
      null,
  });
} catch (error) {
  console.error(
    "Inspector profile error:",
    error
  );

  res.status(500).json({
    success: false,
    message:
      "Unable to fetch inspector profile",
  });
}

}
);

/* =========================================================
TEST ADMIN ROUTE
========================================================= */

app.get(
"/api/admin/profile",
authenticateToken,
requireRole("admin"),
async (req, res) => {
try {
const result =
await pool.query(
          `SELECT
            id,
            name,
            email,
            phone,
            role,
            created_at
          FROM users
          WHERE id = $1`
         ,
[req.user.id]
);

  res.json({
    success: true,
    user:
      result.rows[0] ||
      null,
  });
} catch (error) {
  console.error(
    "Admin profile error:",
    error
  );

  res.status(500).json({
    success: false,
    message:
      "Unable to fetch admin profile",
  });
}

}
);
/* =========================================================
CREATE BUSINESS
========================================================= */

app.post(
"/api/businesses",
authenticateToken,
requireRole("merchant"),
async (req, res) => {
try {
const {
businessName,
businessType,
ownerName,
registrationNumber,
gstNumber,
phone,
email,
address,
city,
district,
state,
pincode,
} = req.body;

  if (
    !businessName ||
    !businessType ||
    !ownerName ||
    !email ||
    !phone ||
    !address ||
    !city ||
    !district ||
    !state ||
    !pincode
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Please provide all required business details.",
    });
  }

  const existingBusiness =
    await pool.query(
      `
      SELECT id
      FROM businesses
      WHERE user_id = $1
      LIMIT 1
      `,
      [req.user.id]
    );

  if (
    existingBusiness.rows.length > 0
  ) {
    return res.status(409).json({
      success: false,
      message:
        "A business is already registered for this account.",
    });
  }

  const result =
    await pool.query(
      `
      INSERT INTO businesses
      (
        user_id,
        business_name,
        business_type,
        owner_name,
        registration_number,
        gst_number,
        phone,
        email,
        address,
        city,
        district,
        state,
        pincode
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13
      )
      RETURNING
        id,
        user_id,
        business_name,
        business_type,
        owner_name,
        registration_number,
        gst_number,
        phone,
        email,
        address,
        city,
        district,
        state,
        pincode,
        created_at
      `,
      [
        req.user.id,
        businessName.trim(),
        businessType,
        ownerName.trim(),
        registrationNumber?.trim() ||
          null,
        gstNumber?.trim() ||
          null,
        phone.trim(),
        email
          .trim()
          .toLowerCase(),
        address.trim(),
        city.trim(),
        district.trim(),
        state,
        pincode.trim(),
      ]
    );

  return res.status(201).json({
    success: true,
    message:
      "Business registered successfully",
    business:
      result.rows[0],
  });
} catch (error) {
  console.error(
    "Create business error:",
    error
  );

  return res.status(500).json({
    success: false,
    message:
      "Unable to register business",
  });
}

}
);
/* =========================================================
CREATE INSTRUMENT
========================================================= */

app.post(
"/api/instruments",
authenticateToken,
requireRole("merchant"),
async (req, res) => {
const client = await pool.connect();

try {
  const {
    instrumentId,
    instrumentType,
    manufacturer,
    model,
    serialNumber,
    capacity,
    accuracy,
    category,
    yearOfManufacture,
    purchaseDate,
    location,
    lastVerificationDate,
    nextVerificationDate,
    photoName,
    documentName,
  } = req.body;

  /* -----------------------------------------------
     VALIDATION
  ----------------------------------------------- */

  if (
    !instrumentId ||
    !instrumentType ||
    !manufacturer ||
    !model ||
    !serialNumber ||
    !capacity ||
    !accuracy ||
    !category ||
    !yearOfManufacture ||
    !purchaseDate ||
    !location
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Please provide all required instrument details.",
    });
  }

  /* -----------------------------------------------
     FIND MERCHANT BUSINESS
  ----------------------------------------------- */

  const businessResult =
    await client.query(
      `
      SELECT id
      FROM businesses
      WHERE user_id = $1
      ORDER BY id DESC
      LIMIT 1
      `,
      [req.user.id]
    );

  if (
    businessResult.rows.length === 0
  ) {
    return res.status(404).json({
      success: false,
      message:
        "Business account not found. Please complete Business Registration first.",
    });
  }

  const businessId =
    businessResult.rows[0].id;

  /* -----------------------------------------------
     DUPLICATE CHECK
  ----------------------------------------------- */

  const duplicateResult =
    await client.query(
      `
      SELECT id
      FROM instruments
      WHERE instrument_code = $1
         OR serial_number = $2
      LIMIT 1
      `,
      [
        String(instrumentId).trim(),
        String(serialNumber).trim(),
      ]
    );

  if (
    duplicateResult.rows.length > 0
  ) {
    return res.status(409).json({
      success: false,
      message:
        "Instrument ID or Serial Number already exists.",
    });
  }

  await client.query("BEGIN");

  /* -----------------------------------------------
     CREATE INSTRUMENT
  ----------------------------------------------- */

  const instrumentResult =
    await client.query(
      `
      INSERT INTO instruments
      (
        instrument_code,
        business_id,
        instrument_type,
        manufacturer,
        model,
        serial_number,
        capacity,
        accuracy,
        category,
        year_of_manufacture,
        purchase_date,
        location,
        last_verification_date,
        next_verification_date,
        photo_name,
        document_name,
        status
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        'Inactive'
      )
      RETURNING
        id,
        instrument_code,
        business_id,
        instrument_type,
        manufacturer,
        model,
        serial_number,
        capacity,
        accuracy,
        category,
        year_of_manufacture,
        purchase_date,
        location,
        last_verification_date,
        next_verification_date,
        photo_name,
        document_name,
        status,
        created_at
      `,
      [
        String(instrumentId).trim(),
        businessId,
        instrumentType,
        String(manufacturer).trim(),
        String(model).trim(),
        String(serialNumber).trim(),
        String(capacity).trim(),
        String(accuracy).trim(),
        category,
        Number(yearOfManufacture),
        purchaseDate,
        String(location).trim(),
        lastVerificationDate || null,
        nextVerificationDate || null,
        photoName || null,
        documentName || null,
      ]
    );

  const instrument =
    instrumentResult.rows[0];

  /* -----------------------------------------------
     CREATE APPLICATION
  ----------------------------------------------- */

  const applicationNumber =
    `APP-${Date.now()}`;

  const applicationResult =
    await client.query(
      `
      INSERT INTO applications
      (
        application_number,
        business_id,
        instrument_id,
        application_type,
        status
      )
      VALUES
      (
        $1,
        $2,
        $3,
        'Initial Verification',
        'Submitted'
      )
      RETURNING
        id,
        application_number,
        business_id,
        instrument_id,
        application_type,
        status,
        submitted_at
      `,
      [
        applicationNumber,
        businessId,
        instrument.id,
      ]
    );

  const application =
    applicationResult.rows[0];

  /* -----------------------------------------------
     LINK APPLICATION TO INSTRUMENT
  ----------------------------------------------- */

  await client.query(
    `
    UPDATE instruments
    SET application_id = $1
    WHERE id = $2
    `,
    [
      application.id,
      instrument.id,
    ]
  );

  await client.query("COMMIT");

  return res.status(201).json({
    success: true,
    message:
      "Instrument registered successfully",
    instrument,
    application,
  });
} catch (error) {
  await client.query("ROLLBACK");

  console.error(
    "Create instrument error:",
    error
  );

  return res.status(500).json({
    success: false,
    message:
      "Unable to register instrument",
  });
} finally {
  client.release();
}

}
);
/* =========================================================
GET MERCHANT INSTRUMENTS
========================================================= */

app.get(
  "/api/instruments",
  authenticateToken,
  requireRole("merchant"),
  async (req, res) => {
    try {
      const merchantUserId =
        Number(req.user?.id);

      if (
        !Number.isInteger(
          merchantUserId
        )
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid merchant authentication.",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            i.id,
            i.instrument_code,
            i.business_id,
            i.instrument_type,
            i.manufacturer,
            i.model,
            i.serial_number,
            i.capacity,
            i.accuracy,
            i.category,
            i.year_of_manufacture,
            i.purchase_date,
            i.location,
            i.last_verification_date,
            i.next_verification_date,
            i.status,
            i.created_at,

            a.application_number,
            a.status AS application_status

          FROM instruments i

          LEFT JOIN applications a
            ON a.id = i.application_id

          WHERE i.business_id IN (
            SELECT id
            FROM businesses
            WHERE user_id = $1
          )

          ORDER BY i.id DESC
          `,
          [merchantUserId]
        );

      const instruments =
        result.rows.map((row) => ({
          id: row.id,

          instrumentId:
            row.instrument_code,

          instrumentCode:
            row.instrument_code,

          instrumentType:
            row.instrument_type,

          manufacturer:
            row.manufacturer,

          model:
            row.model,

          serialNumber:
            row.serial_number,

          capacity:
            row.capacity,

          accuracy:
            row.accuracy,

          category:
            row.category,

          yearOfManufacture:
            row.year_of_manufacture,

          purchaseDate:
            row.purchase_date,

          location:
            row.location,

          lastVerificationDate:
            row.last_verification_date,

          nextVerificationDate:
            row.next_verification_date,

          validUntil:
            row.next_verification_date,

          status:
            row.status ||
            row.application_status ||
            "Pending",

          applicationId:
            row.application_number ||
            "",
        }));

      return res.json({
        success: true,
        instruments,
      });
    } catch (error) {
      console.error(
        "Get merchant instruments error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load instruments",
      });
    }
  }
);
/* =========================================================
GET MERCHANT APPLICATIONS
========================================================= */

app.get(
  "/api/applications",
  authenticateToken,
  requireRole("merchant"),
  async (req, res) => {
    try {
      const merchantUserId =
        Number(req.user?.id);

      if (!Number.isInteger(merchantUserId)) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid merchant authentication.",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            a.id,
            a.application_number,
            a.business_id,
            a.instrument_id,
            a.application_type,
            a.status,
            a.assigned_inspector_id,
            a.appointment_date,
            a.appointment_time,
            a.gatc_id,
            a.submitted_at,
            a.updated_at,

            b.business_name,
            b.city,
            b.district,
            b.state,

            i.instrument_code,
            i.instrument_type,
            i.manufacturer,
            i.location AS instrument_location,

            ins.name AS inspector_name

          FROM applications a

          LEFT JOIN businesses b
            ON b.id = a.business_id

          LEFT JOIN instruments i
            ON i.id = a.instrument_id

          LEFT JOIN inspectors ins
            ON ins.id = a.assigned_inspector_id

          WHERE a.business_id IN (
            SELECT id
            FROM businesses
            WHERE user_id = $1
          )

          ORDER BY a.id DESC
          `,
          [merchantUserId]
        );

      const applications =
        result.rows.map((row) => ({
          id: row.id,

          applicationId:
            row.application_number,

          businessId:
            row.business_id,

          instrumentId:
            row.instrument_code ||
            String(row.instrument_id || ""),

          applicant:
            row.business_name ||
            "Current Business",

          instrument:
            row.instrument_type ||
            row.instrument_code ||
            "Not Available",

          instrumentType:
            row.instrument_type ||
            "Instrument",

          manufacturer:
            row.manufacturer ||
            "Not Available",

          applicationType:
            row.application_type ||
            "Initial Verification",

          submissionDate:
            row.submitted_at,

          submitted:
            row.submitted_at,

          location:
            row.instrument_location ||
            [
              row.city,
              row.district,
              row.state,
            ]
              .filter(Boolean)
              .join(", ") ||
            "Not Provided",

          assignedOfficerId:
            row.assigned_inspector_id || "",

          inspector:
            row.inspector_name ||
            "Not Assigned",

          status:
            row.status ||
            "Submitted",

          appointmentDate:
            row.appointment_date || "",

          appointmentTime:
            row.appointment_time || "",

          createdAt:
            row.submitted_at,
        }));

      return res.json({
        success: true,
        applications,
      });
    } catch (error) {
      console.error(
        "Get merchant applications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load applications",
      });
    }
  }
);
/* =========================================================
   GET SINGLE MERCHANT APPLICATION
   ========================================================= */

app.get(
  "/api/applications/:applicationNumber",
  authenticateToken,
  requireRole("merchant"),
  async (req, res) => {
    try {
      const merchantUserId = Number(req.user?.id);
      const { applicationNumber } = req.params;

      if (!Number.isInteger(merchantUserId)) {
        return res.status(401).json({
          success: false,
          message: "Invalid merchant authentication.",
        });
      }

      const result = await pool.query(
        `
        SELECT
          a.id,
          a.application_number,
          a.business_id,
          a.instrument_id,
          a.application_type,
          a.status,
          a.assigned_inspector_id,
          a.appointment_date,
          a.appointment_time,
          a.gatc_id,
          a.submitted_at,
          a.updated_at,

          b.business_name,
          b.city,
          b.district,
          b.state,

          i.instrument_code,
          i.instrument_type,
          i.manufacturer,
          i.location AS instrument_location,

          ins.name AS inspector_name

        FROM applications a

        LEFT JOIN businesses b
          ON b.id = a.business_id

        LEFT JOIN instruments i
          ON i.id = a.instrument_id

        LEFT JOIN inspectors ins
          ON ins.id = a.assigned_inspector_id

        WHERE
          a.application_number = $1
          AND a.business_id IN (
            SELECT id
            FROM businesses
            WHERE user_id = $2
          )

        LIMIT 1
        `,
        [applicationNumber, merchantUserId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Application ${applicationNumber} not found.`,
        });
      }

      const row = result.rows[0];

      return res.json({
        success: true,
        application: {
          id: row.id,
          application_number: row.application_number,

          business_id: row.business_id,
          business_name: row.business_name,

          instrument_id: row.instrument_id,
          instrument_code: row.instrument_code,
          instrument_type: row.instrument_type,

          application_type: row.application_type,

          submitted_at: row.submitted_at,

          assigned_inspector_id:
            row.assigned_inspector_id,

          inspector_name:
            row.inspector_name,

          status: row.status,

          location:
            row.instrument_location || null,

          city: row.city || null,
          district: row.district || null,
          state: row.state || null,

          appointment_date:
            row.appointment_date || null,

          appointment_time:
            row.appointment_time || null,

          gatc_id:
            row.gatc_id || null,

          remarks: "",

          updated_at:
            row.updated_at,
        },
      });
    } catch (error) {
      console.error(
        "Get single merchant application error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load application details.",
      });
    }
  }
);
/* =========================================================
   GET MERCHANT APPOINTMENTS
   ========================================================= */

app.get(
  "/api/appointments",
  authenticateToken,
  requireRole("merchant"),
  async (req, res) => {
    try {
      const merchantUserId = Number(req.user?.id);

      if (!Number.isInteger(merchantUserId)) {
        return res.status(401).json({
          success: false,
          message: "Invalid merchant authentication.",
        });
      }

      const result = await pool.query(
        `
        SELECT
          a.id,
          a.application_number,
          a.status,
          a.assigned_inspector_id,
          a.appointment_date,
          a.appointment_time,
          a.gatc_id,
          a.submitted_at,
          a.updated_at,

          b.business_name,
          b.city,
          b.district,
          b.state,

          i.instrument_code,
          i.instrument_type,
          i.location AS instrument_location,

          ins.name AS inspector_name,
          ins.employee_id AS inspector_employee_id

        FROM applications a

        LEFT JOIN businesses b
          ON b.id = a.business_id

        LEFT JOIN instruments i
          ON i.id = a.instrument_id

        LEFT JOIN inspectors ins
          ON ins.id = a.assigned_inspector_id

        WHERE
          b.user_id = $1
          AND a.appointment_date IS NOT NULL
          AND a.appointment_time IS NOT NULL
          AND a.status IN (
          'Scheduled',
           'Completed',
            'Cancelled'
  )
        ORDER BY
          a.appointment_date ASC,
          a.appointment_time ASC,
          a.id DESC
        `,
        [merchantUserId]
      );

      const appointments = result.rows.map((row) => ({
        scheduleId: `SCH-${String(row.id).padStart(5, "0")}`,

        applicationId:
          row.application_number || "",

        officerId:
          row.inspector_employee_id ||
          String(row.assigned_inspector_id || ""),

        GATCId:
          row.gatc_id || "",

        scheduledDate:
          row.appointment_date || "",

        scheduledTime:
          row.appointment_time || "",

        location:
          row.instrument_location ||
          [
            row.city,
            row.district,
            row.state,
          ]
            .filter(Boolean)
            .join(", ") ||
          "Not Provided",

        status:
          row.status === "Completed"
            ? "Completed"
            : row.status === "Cancelled"
            ? "Cancelled"
            : "Scheduled",

        assignedBy: "Admin",

        instrumentId:
          row.instrument_code ||
          "",

        instrumentType:
          row.instrument_type ||
          "Instrument",

        createdAt:
          row.updated_at ||
          row.submitted_at ||
          new Date().toISOString(),
      }));

      return res.json({
        success: true,
        appointments,
      });
    } catch (error) {
      console.error(
        "Get merchant appointments error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load appointments",
      });
    }
  }
);
/* =========================================================
2. GET ALL INSPECTORS
========================================================= */

app.get(
"/api/admin/inspectors",
authenticateToken,
requireRole("admin"),
async (req, res) => {
try {
const result = await pool.query(`
SELECT
ins.id,
ins.name,
ins.employee_id,
COALESCE(
ins.region,
''
) AS region,

      COALESCE(
        ins.status,
        'Available'
      ) AS status,

      COUNT(
        CASE
          WHEN a.status = 'Scheduled'
          THEN a.id
        END
      )::INTEGER
      AS assigned_applications

    FROM inspectors ins

    LEFT JOIN applications a
      ON a.assigned_inspector_id =
         ins.id

    GROUP BY
      ins.id,
      ins.name,
      ins.employee_id,
      ins.region,
      ins.status

    ORDER BY ins.id
  `);

  const inspectors =
    result.rows.map((row) => ({
      id: String(row.id),

      name:
        row.name,

      employeeId:
        row.employee_id,

      region:
        row.region,

      status:
        row.status === "Inactive"
          ? "Inactive"
          : row.status === "Busy"
          ? "Busy"
          : "Available",

      assignedApplications:
        Number(
          row.assigned_applications
        ) || 0,
    }));

  return res.json({
    success: true,
    inspectors,
  });
} catch (error) {
  console.error(
    "Admin inspectors error:",
    error
  );

  return res.status(500).json({
    success: false,
    message:
      "Unable to load inspectors",
  });
}

}
);
/* =========================================================
GET ADMIN APPLICATIONS
========================================================= */

app.get(
  "/api/admin/applications",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          a.id,
          a.application_number,
          a.business_id,
          a.instrument_id,
          a.application_type,
          a.status,
          a.assigned_inspector_id,
          a.appointment_date,
          a.appointment_time,
          a.gatc_id,
          a.submitted_at,
          a.updated_at,

          b.business_name,
          b.email AS business_email,

          i.instrument_code,
          i.instrument_type,
          i.manufacturer,
          i.model,
          i.location AS instrument_location,

          ins.name AS inspector_name,
          ins.employee_id AS inspector_employee_id

        FROM applications a

        LEFT JOIN businesses b
          ON b.id = a.business_id

        LEFT JOIN instruments i
          ON i.id = a.instrument_id

        LEFT JOIN inspectors ins
          ON ins.id = a.assigned_inspector_id

        ORDER BY a.id DESC
        `
      );

      const applications =
        result.rows.map((row) => ({
          id: String(row.id),

          applicationId:
            row.application_number,

          businessId:
            String(
              row.business_id || ""
            ),

          businessName:
            row.business_name ||
            "Unknown Business",

          email:
            row.business_email ||
            "",

          instrumentId:
            row.instrument_code ||
            String(
              row.instrument_id || ""
            ),

          instrumentType:
            row.instrument_type ||
            "Instrument",

          manufacturer:
            row.manufacturer ||
            "Not Available",

          model:
            row.model ||
            "Not Available",

          location:
            row.instrument_location ||
            "Not Provided",

          applicationType:
            row.application_type ||
            "Initial Verification",

          status:
            row.status ||
            "Submitted",

          assignedInspectorId:
            row.assigned_inspector_id ||
            null,

          inspector:
            row.inspector_name ||
            "Not Assigned",

          inspectorEmployeeId:
            row.inspector_employee_id ||
            "",

          appointmentDate:
            row.appointment_date ||
            null,

          appointmentTime:
            row.appointment_time ||
            null,

          gatcId:
            row.gatc_id ||
            null,

          submittedAt:
            row.submitted_at,

          updatedAt:
            row.updated_at,
        }));

      return res.json({
        success: true,
        applications,
      });
    } catch (error) {
      console.error(
        "Admin applications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load applications",
      });
    }
  }
);

/* =========================================================
3. ASSIGN INSPECTOR + SCHEDULE APPLICATION
========================================================= */

app.patch(
  "/api/admin/applications/:applicationNumber/assign",
authenticateToken,
requireRole("admin"),
async (req, res) => {

const client =
  await pool.connect();

try {
  const {
    inspectorId,
    appointmentDate,
    appointmentTime,
    gatcId,
  } = req.body;

  /* -----------------------------------------------
     VALIDATION
  ----------------------------------------------- */

  if (
    !inspectorId ||
    !appointmentDate ||
    !appointmentTime
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Inspector, appointment date and appointment time are required.",
    });
  }


  /* -----------------------------------------------
     FIND INSPECTOR
  ----------------------------------------------- */

  const inspectorResult =
    await client.query(
      `
      SELECT
        id,
        name,
        employee_id,
        status
      FROM inspectors
      WHERE id = $1
      LIMIT 1
      `,
      [inspectorId]
    );

  if (
    inspectorResult.rows.length ===
    0
  ) {
    return res.status(404).json({
      success: false,
      message:
        "Inspector not found.",
    });
  }

  const inspector =
    inspectorResult.rows[0];


  /* -----------------------------------------------
     CHECK INSPECTOR STATUS
  ----------------------------------------------- */

  if (
    inspector.status ===
    "Inactive"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Inactive inspector cannot be assigned.",
    });
  }


  /* -----------------------------------------------
     CHECK DOUBLE BOOKING
  ----------------------------------------------- */

  const duplicateSlot =
    await client.query(
      `
      SELECT
        a.id
      FROM applications a

      WHERE
        a.assigned_inspector_id = $1

        AND a.appointment_date = $2

        AND a.appointment_time = $3

        AND a.status = 'Scheduled'

        AND a.application_number <> $4

      LIMIT 1
      `,
      [
        inspectorId,
        appointmentDate,
        appointmentTime,
        req.params
          .applicationNumber,
      ]
    );

  if (
    duplicateSlot.rows.length >
    0
  ) {
    return res.status(409).json({
      success: false,
      message:
        "This inspector already has another appointment at the selected date and time.",
    });
  }


  /* -----------------------------------------------
     START TRANSACTION
  ----------------------------------------------- */

  await client.query(
    "BEGIN"
  );


  /* -----------------------------------------------
     UPDATE APPLICATION
  ----------------------------------------------- */

  const updated =
    await client.query(
      `
      UPDATE applications
      SET

        assigned_inspector_id = $1,

        appointment_date = $2,

        appointment_time = $3,

        gatc_id = $4,

        status = 'Scheduled',

        updated_at =
          CURRENT_TIMESTAMP

      WHERE
        application_number = $5

      RETURNING
        id,
        application_number,
        business_id,
        instrument_id,
        application_type,
        status,
        assigned_inspector_id,
        appointment_date,
        appointment_time,
        gatc_id,
        submitted_at,
        updated_at
      `,
      [
        inspectorId,
        appointmentDate,
        appointmentTime,
        gatcId || null,
        req.params
          .applicationNumber,
      ]
    );


  if (
    updated.rows.length ===
    0
  ) {
    await client.query(
      "ROLLBACK"
    );

    return res.status(404).json({
      success: false,
      message:
        "Application not found.",
    });
  }


  /* -----------------------------------------------
     COMMIT
  ----------------------------------------------- */

  await client.query(
    "COMMIT"
  );


  /* -----------------------------------------------
     GET UPDATED APPLICATION
  ----------------------------------------------- */

  const result =
    await client.query(
      `
      SELECT

        a.application_number,

        a.business_id,

        a.instrument_id,

        a.application_type,

        a.status,

        a.assigned_inspector_id,

        a.appointment_date,

        a.appointment_time,

        a.gatc_id,

        a.submitted_at,

        b.business_name,

        b.email AS business_email,

        i.instrument_code,

        i.instrument_type,

        i.manufacturer,

        i.location AS instrument_location,

        ins.name AS inspector_name

      FROM applications a

      LEFT JOIN businesses b
        ON b.id =
           a.business_id

      LEFT JOIN instruments i
        ON i.id =
           a.instrument_id

      LEFT JOIN inspectors ins
        ON ins.id =
           a.assigned_inspector_id

      WHERE
        a.application_number = $1

      LIMIT 1
      `,
      [
        req.params
          .applicationNumber,
      ]
    );


  const row =
    result.rows[0];


  return res.json({
    success: true,

    message:
      "Inspector assigned successfully.",

    application: {
      id:
        row.application_number,

      merchant:
        row.business_name ||
        "Current Merchant",

      email:
        row.business_email ||
        "Not Available",

      instrumentId:
        row.instrument_code ||
        String(
          row.instrument_id ||
          ""
        ),

      instrumentType:
        row.instrument_type ||
        "Instrument",

      manufacturer:
        row.manufacturer ||
        "Not Available",

      location:
        row.instrument_location ||
        "Not Provided",

      submittedDate:
        row.submitted_at,

      status:
        "Scheduled",

      inspector:
        row.inspector_name ||
        "",

      appointmentDate:
        row.appointment_date ||
        "",

      appointmentTime:
        row.appointment_time ||
        "",
    },
  });

} catch (error) {

  await client.query(
    "ROLLBACK"
  );

  console.error(
    "Assign inspector error:",
    error
  );

  return res.status(500).json({
    success: false,
    message:
      "Unable to assign inspector",
  });

} finally {
  client.release();
}

}
);

/* =========================================================
4. UPDATE APPLICATION STATUS
========================================================= */

app.patch(
  "/api/admin/applications/:applicationNumber/status",
authenticateToken,
requireRole("admin"),
async (req, res) => {

try {

  const {
    status,
  } = req.body;


  const allowedStatuses = [
    "Pending",
    "Scheduled",
    "Completed",
    "Rejected",
    "Cancelled",
  ];


  if (
    !allowedStatuses.includes(
      status
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid application status.",
    });
  }


  const result =
    await pool.query(
      `
      UPDATE applications

      SET
        status = $1,

        updated_at =
          CURRENT_TIMESTAMP

      WHERE
        application_number = $2

      RETURNING
        id,
        application_number,
        business_id,
        instrument_id,
        application_type,
        status,
        assigned_inspector_id,
        appointment_date,
        appointment_time,
        gatc_id,
        submitted_at
      `,
      [
        status,
        req.params
          .applicationNumber,
      ]
    );


  if (
    result.rows.length ===
    0
  ) {
    return res.status(404).json({
      success: false,
      message:
        "Application not found.",
    });
  }


  return res.json({
    success: true,

    message:
      "Application status updated successfully.",

    application:
      result.rows[0],
  });

} catch (error) {

  console.error(
    "Update application status error:",
    error
  );

  return res.status(500).json({
    success: false,
    message:
      "Unable to update application status",
  });
}

}
);
/* =========================================================
   GET INSPECTOR ASSIGNED APPLICATIONS
   ========================================================= */

app.get(
  "/api/inspector/applications",
  authenticateToken,
  requireRole("inspector"),
  async (req, res) => {
    try {
      /* -----------------------------------------------------
         1. FIND LOGGED-IN INSPECTOR
      ----------------------------------------------------- */
      const inspectorResult = await pool.query(
        `
        SELECT
          id,
          name,
          employee_id,
          region,
          status
        FROM inspectors
        WHERE user_id = $1
        LIMIT 1
        `,
        [req.user.id]
      );

      if (inspectorResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Inspector profile not found for this account.",
        });
      }

      const inspector = inspectorResult.rows[0];

      /* -----------------------------------------------------
         2. GET APPLICATIONS ASSIGNED TO THIS INSPECTOR
      ----------------------------------------------------- */
      const result = await pool.query(
        `
        SELECT
          a.id AS application_db_id,
          a.application_number,
          a.application_type,
          a.status,
          a.assigned_inspector_id,
          a.appointment_date,
          a.appointment_time,

          b.id AS business_id,
          b.business_name,

          i.id AS instrument_db_id,
          i.instrument_code,
          i.instrument_type,
          i.manufacturer,
          i.model,
          i.location AS instrument_location

        FROM applications a

        LEFT JOIN businesses b
          ON b.id = a.business_id

        LEFT JOIN instruments i
          ON i.id = a.instrument_id

        WHERE a.assigned_inspector_id = $1

        ORDER BY
          a.appointment_date NULLS LAST,
          a.appointment_time NULLS LAST,
          a.id DESC
        `,
        [inspector.id]
      );

      /* -----------------------------------------------------
         3. FRONTEND RESPONSE
         IMPORTANT:
         Frontend expects applicationId, NOT id.
      ----------------------------------------------------- */
      const applications = result.rows.map((row) => ({
        applicationId: String(
          row.application_number || ""
        ),

        applicationDbId: String(
          row.application_db_id || ""
        ),

        businessId: String(
          row.business_id || ""
        ),

        applicant:
          row.business_name || "Applicant",

        instrumentId:
          row.instrument_code || "",

        instrument:
          row.instrument_type || "Instrument",

        instrumentType:
          row.instrument_type || "Instrument",

        manufacturer:
          row.manufacturer || "Not Available",

        model:
          row.model || "Not Available",

        location:
          row.instrument_location || "Not specified",

        appointmentDate:
          row.appointment_date || "",

        appointmentTime:
          row.appointment_time || "",

        inspector:
          inspector.name || "",

        assignedOfficerId:
          inspector.employee_id || "",

        status:
          row.status || "Pending",

        applicationType:
          row.application_type || "",
      }));

      return res.json({
        success: true,

        profile: {
          id: inspector.id,
          name: inspector.name,
          employeeId: inspector.employee_id,
          region: inspector.region || "",
          status: inspector.status || "",
        },

        applications,
      });
    } catch (error) {
      console.error(
        "Inspector applications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load inspector applications",
      });
    }
  }
);


/* =========================================================
SAVE VERIFICATION + OBSERVATION
Uses actual PostgreSQL schema
========================================================= */

app.post(
"/api/verifications",
authenticateToken,
requireRole("inspector"),
async (req, res) => {
const client = await pool.connect();

try {
  const { verification, observation } =
    req.body;

  if (!verification || !observation) {
    return res.status(400).json({
      success: false,
      message:
        "Verification and observation data are required.",
    });
  }

  const applicationNumber =
    String(
      verification.applicationId || ""
    ).trim();

  const instrumentCode =
    String(
      verification.instrumentId || ""
    ).trim();

  if (
    !applicationNumber ||
    !instrumentCode
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Application ID and Instrument ID are required.",
    });
  }

  /* =====================================================
     RESULT
  ===================================================== */

  const result = String(
    verification.result || "PENDING"
  ).toUpperCase();

  if (
    !["PASS", "FAIL", "PENDING"].includes(
      result
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid verification result.",
    });
  }

  /* =====================================================
     DATE NORMALIZER
  ===================================================== */

  const normalizeDate = (value) => {
    if (!value) return null;

    const text = String(value).trim();

    // YYYY-MM-DD
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(text)
    ) {
      return text;
    }

    // DD-MM-YYYY
    const dashMatch = text.match(
      /^(\d{2})-(\d{2})-(\d{4})$/
    );

    if (dashMatch) {
      return `${dashMatch[3]}-${dashMatch[2]}-${dashMatch[1]}`;
    }

    // DD/MM/YYYY
    const slashMatch = text.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (slashMatch) {
      return `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`;
    }

    // fallback
    const parsed = new Date(text);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed
      .toISOString()
      .slice(0, 10);
  };

  const verificationDate =
    normalizeDate(
      verification.verificationDate
    );

  /* =====================================================
     CONNECT TRANSACTION
  ===================================================== */

  await client.query("BEGIN");

  /* =====================================================
     1. FIND APPLICATION BY APPLICATION NUMBER
  ===================================================== */

  const applicationResult =
    await client.query(
      `
      SELECT
        id,
        application_number,
        assigned_inspector_id,
        status
      FROM applications
      WHERE application_number = $1
      LIMIT 1
      `,
      [applicationNumber]
    );

  if (
    applicationResult.rows.length === 0
  ) {
    await client.query("ROLLBACK");

    return res.status(404).json({
      success: false,
      message:
        `Application ${applicationNumber} not found.`,
    });
  }

  const application =
    applicationResult.rows[0];

  /* =====================================================
     2. FIND CURRENT INSPECTOR
  ===================================================== */

  const inspectorResult =
    await client.query(
      `
      SELECT
        id,
        user_id,
        name,
        employee_id
      FROM inspectors
      WHERE user_id = $1
      LIMIT 1
      `,
      [req.user.id]
    );

  if (
    inspectorResult.rows.length === 0
  ) {
    await client.query("ROLLBACK");

    return res.status(403).json({
      success: false,
      message:
        "Inspector profile not found.",
    });
  }

  const inspector =
    inspectorResult.rows[0];

  /* =====================================================
     3. CHECK ASSIGNMENT
  ===================================================== */

  if (
    Number(
      application.assigned_inspector_id
    ) !== Number(inspector.id)
  ) {
    await client.query("ROLLBACK");

    return res.status(403).json({
      success: false,
      message:
        "This application is not assigned to you.",
    });
  }

  /* =====================================================
     4. GENERATE VERIFICATION NUMBER
  ===================================================== */

  let verificationNumber =
    String(
      verification.verificationId || ""
    ).trim();

  if (!verificationNumber) {
    verificationNumber =
      `VER-${Date.now()}`;
  }

  /* =====================================================
     5. INSERT OR UPDATE VERIFICATION
     Actual columns:
     id
     verification_number
     application_id
     inspector_id
     verification_date
     verification_type
     location
     result
     remarks
     start_time
     end_time
     latitude
     longitude
     created_at
  ===================================================== */

  const existingVerification =
    await client.query(
      `
      SELECT id
      FROM verifications
      WHERE verification_number = $1
      LIMIT 1
      `,
      [verificationNumber]
    );

  let verificationRow;

  if (
    existingVerification.rows.length > 0
  ) {
    const verificationId =
      existingVerification.rows[0].id;

    const updateResult =
      await client.query(
        `
        UPDATE verifications
        SET
          application_id = $1,
          inspector_id = $2,
          verification_date = $3,
          verification_type = $4,
          location = $5,
          result = $6,
          remarks = $7,
          start_time = $8,
          end_time = $9,
          latitude = $10,
          longitude = $11
        WHERE id = $12
        RETURNING *
        `,
        [
          application.id,
          inspector.id,
          verificationDate,
          verification.verificationType ||
            "MPE Verification",
          verification.location ||
            "",
          result,
          verification.remarks ||
            "",
          verification.startTime || null,
          verification.endTime || null,
          verification.latitude || null,
          verification.longitude || null,
          verificationId,
        ]
      );

    verificationRow =
      updateResult.rows[0];
  } else {
    const insertResult =
      await client.query(
        `
        INSERT INTO verifications (
          verification_number,
          application_id,
          inspector_id,
          verification_date,
          verification_type,
          location,
          result,
          remarks,
          start_time,
          end_time,
          latitude,
          longitude,
          created_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          CURRENT_TIMESTAMP
        )
        RETURNING *
        `,
        [
          verificationNumber,
          application.id,
          inspector.id,
          verificationDate,
          verification.verificationType ||
            "MPE Verification",
          verification.location ||
            "",
          result,
          verification.remarks ||
            "",
          verification.startTime || null,
          verification.endTime || null,
          verification.latitude || null,
          verification.longitude || null,
        ]
      );

    verificationRow =
      insertResult.rows[0];
  }

  /* =====================================================
     6. SAVE OBSERVATION
     Actual columns:
     id
     observation_number
     verification_id
     test_name
     standard_value
     observed_value
     permissible_error
     error_value
     result
     unit
     remarks
     created_at
  ===================================================== */

  let observationNumber =
    String(
      observation.observationId || ""
    ).trim();

  if (!observationNumber) {
    observationNumber =
      `OBS-${Date.now()}`;
  }

  const existingObservation =
    await client.query(
      `
      SELECT id
      FROM observations
      WHERE observation_number = $1
      LIMIT 1
      `,
      [observationNumber]
    );

  const standardValue =
    Number(
      observation.standardValue || 0
    );

  const observedValue =
    Number(
      observation.observedValue || 0
    );

  const permissibleError =
    Number(
      observation.permissibleError || 0
    );

  const errorValue =
    Number(
      observation.error || 0
    );

  let observationRow;

  if (
    existingObservation.rows.length > 0
  ) {
    const observationId =
      existingObservation.rows[0].id;

    const updateResult =
      await client.query(
        `
        UPDATE observations
        SET
          verification_id = $1,
          test_name = $2,
          standard_value = $3,
          observed_value = $4,
          permissible_error = $5,
          error_value = $6,
          result = $7,
          unit = $8,
          remarks = $9
        WHERE id = $10
        RETURNING *
        `,
        [
          verificationRow.id,
          observation.testName ||
            "Accuracy Test",
          standardValue,
          observedValue,
          permissibleError,
          errorValue,
          result,
          observation.unit || "",
          observation.remarks ||
            verification.remarks ||
            "",
          observationId,
        ]
      );

    observationRow =
      updateResult.rows[0];
  } else {
    const insertResult =
      await client.query(
        `
        INSERT INTO observations (
          observation_number,
          verification_id,
          test_name,
          standard_value,
          observed_value,
          permissible_error,
          error_value,
          result,
          unit,
          remarks,
          created_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          CURRENT_TIMESTAMP
        )
        RETURNING *
        `,
        [
          observationNumber,
          verificationRow.id,
          observation.testName ||
            "Accuracy Test",
          standardValue,
          observedValue,
          permissibleError,
          errorValue,
          result,
          observation.unit || "",
          observation.remarks ||
            verification.remarks ||
            "",
        ]
      );

    observationRow =
      insertResult.rows[0];
  }

  /* =====================================================
     7. UPDATE APPLICATION STATUS
  ===================================================== */

  let newApplicationStatus =
    application.status;

  if (result === "PASS") {
    newApplicationStatus = "Completed";
  }

  if (result === "FAIL") {
    newApplicationStatus = "Rejected";
  }

  if (
    result === "PASS" ||
    result === "FAIL"
  ) {
    await client.query(
      `
      UPDATE applications
      SET status = $1
      WHERE id = $2
      `,
      [
        newApplicationStatus,
        application.id,
      ]
    );
  }

  /* =====================================================
     8. COMMIT
  ===================================================== */

  await client.query("COMMIT");

  return res.status(200).json({
    success: true,

    message:
      "Verification result saved successfully.",

    verification: {
      id: verificationRow.id,

      verificationId:
        verificationRow.verification_number,

      applicationId:
        application.application_number,

      instrumentId: instrumentCode,

      inspectorId:
        verificationRow.inspector_id,

      verificationDate:
        verificationRow.verification_date,

      verificationType:
        verificationRow.verification_type,

      location:
        verificationRow.location,

      result:
        verificationRow.result,

      remarks:
        verificationRow.remarks || "",

      startTime:
        verificationRow.start_time || "",

      endTime:
        verificationRow.end_time || "",

      latitude:
        verificationRow.latitude || "",

      longitude:
        verificationRow.longitude || "",

      createdAt:
        verificationRow.created_at,
    },

    observation: {
      id: observationRow.id,

      observationId:
        observationRow.observation_number,

      verificationId:
        verificationRow.verification_id,

      testName:
        observationRow.test_name,

      standardValue:
        Number(
          observationRow.standard_value
        ),

      observedValue:
        Number(
          observationRow.observed_value
        ),

      permissibleError:
        Number(
          observationRow.permissible_error
        ),

      error:
        Number(
          observationRow.error_value
        ),

      result:
        observationRow.result,

      unit:
        observationRow.unit || "",

      remarks:
        observationRow.remarks || "",

      createdAt:
        observationRow.created_at,
    },

    application: {
      id: application.id,

      applicationNumber:
        application.application_number,

      status:
        newApplicationStatus,
    },
  });
} catch (error) {
  await client.query("ROLLBACK");

  console.error(
    "Save verification error:",
    error
  );

  return res.status(500).json({
    success: false,
    message:
      error.message ||
      "Unable to save verification result.",
  });
} finally {
  client.release();
}

}
);
/* =========================================================
GENERATE CERTIFICATE
========================================================= */

app.post(
"/api/certificates",
authenticateToken,
requireRole("inspector"),
async (req, res) => {
const client = await pool.connect();

try {
   await client.query("BEGIN");
  const {
    verificationId,
    applicationId,
    instrumentId,
    certificateType,
    issueDate,
    validUntil,
    status,
  } = req.body;

  if (
    !verificationId ||
    !applicationId ||
    !instrumentId
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Verification ID, application ID and instrument ID are required.",
    });
  }

  /* -----------------------------------------------------
     1. CURRENT INSPECTOR
  ----------------------------------------------------- */

  const inspectorResult =
    await client.query(
      `
      SELECT
        id,
        name,
        employee_id
      FROM inspectors
      WHERE user_id = $1
      LIMIT 1
      `,
      [req.user.id]
    );

  if (
    inspectorResult.rows.length === 0
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Inspector profile not found.",
    });
  }

  const inspector =
    inspectorResult.rows[0];

  /* -----------------------------------------------------
     2. FIND VERIFICATION
     UI sends VER-XXXXXXXX
     DB stores it in verification_number
  ----------------------------------------------------- */

  const verificationResult =
    await client.query(
      `
      SELECT
        v.id,
        v.verification_number,
        v.application_id,
        v.inspector_id,
        v.verification_date,
        v.result
      FROM verifications v
      WHERE
        v.verification_number = $1
      LIMIT 1
      `,
      [verificationId]
    );

  if (
    verificationResult.rows.length === 0
  ) {
    return res.status(404).json({
      success: false,
      message:
        "Verification record not found.",
    });
  }

  const verification =
    verificationResult.rows[0];

  /* -----------------------------------------------------
     3. CHECK INSPECTOR ASSIGNMENT
  ----------------------------------------------------- */

  if (
    Number(
      verification.inspector_id
    ) !== Number(inspector.id)
  ) {
    return res.status(403).json({
      success: false,
      message:
        "This verification is not assigned to you.",
    });
  }

  /* -----------------------------------------------------
     4. CERTIFICATE ONLY FOR PASS
  ----------------------------------------------------- */

  if (
    String(
      verification.result
    ).toUpperCase() !== "PASS"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Certificate can only be generated for a PASS verification.",
    });
  }

  /* -----------------------------------------------------
     5. FIND APPLICATION
     UI sends APP-XXXXXXXX
  ----------------------------------------------------- */

  const applicationResult =
    await client.query(
      `
      SELECT
        id,
        application_number,
        business_id,
        instrument_id
      FROM applications
      WHERE application_number = $1
      LIMIT 1
      `,
      [applicationId]
    );

  if (
    applicationResult.rows.length === 0
  ) {
    return res.status(404).json({
      success: false,
      message:
        `Application ${applicationId} not found.`,
    });
  }

  const application =
    applicationResult.rows[0];

  /* -----------------------------------------------------
     6. VERIFY APPLICATION LINK
  ----------------------------------------------------- */

  if (
    Number(
      application.id
    ) !== Number(
      verification.application_id
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Verification and application do not match.",
    });
  }

  /* -----------------------------------------------------
     7. VERIFY INSTRUMENT
  ----------------------------------------------------- */

  const instrumentResult =
    await client.query(
      `
      SELECT
        id,
        instrument_code,
        instrument_type,
        manufacturer
      FROM instruments
      WHERE instrument_code = $1
      LIMIT 1
      `,
      [instrumentId]
    );

  if (
    instrumentResult.rows.length === 0
  ) {
    return res.status(404).json({
      success: false,
      message:
        `Instrument ${instrumentId} not found.`,
    });
  }

  const instrument =
    instrumentResult.rows[0];

  if (
    Number(
      instrument.id
    ) !== Number(
      application.instrument_id
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Application and instrument do not match.",
    });
  }

  /* -----------------------------------------------------
     8. CHECK EXISTING CERTIFICATE
  ----------------------------------------------------- */

  const existingResult =
    await client.query(
      `
      SELECT
        *
      FROM certificates
      WHERE verification_id = $1
      LIMIT 1
      `,
      [verification.id]
    );

  if (
  existingResult.rows.length > 0
) {
  const existingCertificate = existingResult.rows[0];

  return res.status(200).json({
    success: true,
    message: "Certificate already exists.",
    certificate: {
      ...existingCertificate,
      certificateId:
        `CERT-${existingCertificate.id}`,
      certificateNumber:
        existingCertificate.certificate_number,
      verificationId,
      applicationId,
      instrumentId,
      businessId:
        String(existingCertificate.business_id),
      certificateType:
        existingCertificate.certificate_type ||
        "Verification Certificate",
      issueDate:
        existingCertificate.issue_date,
      validUntil:
        existingCertificate.valid_until,
      status:
        existingCertificate.status || "Valid",
      officerId:
        inspector.employee_id || "",
      instrumentType:
        instrument.instrument_type || "",
      manufacturer:
        instrument.manufacturer || "",
    },
  });
}

  /* -----------------------------------------------------
     9. GENERATE CERTIFICATE NUMBER
  ----------------------------------------------------- */

  const now =
    new Date();

  const generatedCertificateNumber =
    `ALMVE/${now.getFullYear()}/${String(
      Date.now()
    ).slice(-6)}`;

  const issue =
    issueDate
      ? String(issueDate).slice(0, 10)
      : now
          .toISOString()
          .slice(0, 10);

  const valid =
    validUntil
      ? String(validUntil).slice(0, 10)
      : (() => {
          const date =
            new Date(now);

          date.setFullYear(
            date.getFullYear() + 2
          );

          return date
            .toISOString()
            .slice(0, 10);
        })();

  /* -----------------------------------------------------
     10. INSERT CERTIFICATE
  ----------------------------------------------------- */

  const certificateResult =
    await client.query(
      `
      INSERT INTO certificates (
        certificate_number,
        verification_id,
        application_id,
        instrument_id,
        business_id,
        certificate_type,
        issue_date,
        valid_until,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      RETURNING *
      `,
      [
        generatedCertificateNumber,

        verification.id,

        application.id,

        instrument.id,

        application.business_id,

        certificateType ||
          "Verification Certificate",

        issue,

        valid,

        status ||
          "Valid",
      ]
    );

  /* -----------------------------------------------------
     11. UPDATE APPLICATION
  ----------------------------------------------------- */

  await client.query(
    `
    UPDATE applications
    SET
      status = 'Completed',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    `,
    [application.id]
  );
  await client.query("COMMIT");
  /* -----------------------------------------------------
     12. RESPONSE
  ----------------------------------------------------- */

  return res.status(201).json({
    success: true,

    message:
      `Certificate ${generatedCertificateNumber} generated successfully.`,

    certificate: {
      ...certificateResult.rows[0],

      certificateId:
        `CERT-${certificateResult.rows[0].id}`,

      certificateNumber:
        certificateResult.rows[0]
          .certificate_number,

      verificationId,

      applicationId,

      instrumentId,

      businessId:
        String(
          application.business_id
        ),

      certificateType:
        certificateResult.rows[0]
          .certificate_type,

      issueDate:
        certificateResult.rows[0]
          .issue_date,

      validUntil:
        certificateResult.rows[0]
          .valid_until,

      status:
        certificateResult.rows[0]
          .status,

      officerId:
        inspector.employee_id || "",

      instrumentType:
        instrument.instrument_type || "",

      manufacturer:
        instrument.manufacturer || "",
    },
  });
} catch (error) {
  await client.query("ROLLBACK");
  console.error(
    "Certificate generation error:",
    error
  );

  return res.status(500).json({
    success: false,
    message:
      error.message ||
      "Unable to generate certificate.",
  });
} finally {
  client.release();
}

}
);
/* =========================================================
   GET MERCHANT CERTIFICATES
========================================================= */

app.get(
  "/api/certificates",
  authenticateToken,
  requireRole("merchant"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          c.id,
          c.certificate_number,
          c.verification_id,
          c.application_id,
          c.instrument_id,
          c.business_id,
          c.certificate_type,
          c.issue_date,
          c.valid_until,
          c.status,

         v.verification_number,
v.verification_date,
v.verification_type,
v.location AS verification_location,
v.remarks AS verification_remarks,

a.application_number,

i.instrument_code,
i.instrument_type,
i.manufacturer,

o.test_name,
o.standard_value,
o.observed_value,
o.permissible_error,
o.error_value,
o.unit,
o.remarks AS observation_remarks,

          b.business_name

        FROM certificates c

        INNER JOIN businesses b
          ON b.id = c.business_id

        LEFT JOIN verifications v
          ON v.id = c.verification_id

        LEFT JOIN applications a
          ON a.id = c.application_id

        LEFT JOIN instruments i
          ON i.id = c.instrument_id

          LEFT JOIN observations o
           ON o.verification_id = c.verification_id

        WHERE b.user_id = $1

        ORDER BY c.id DESC
        `,
        [req.user.id]
      );

      const certificates = result.rows.map((row) => ({
        certificateId: `CERT-${row.id}`,

        certificateNumber:
          row.certificate_number,

        verificationId:
          row.verification_number ||
          String(row.verification_id),

        applicationId:
          row.application_number ||
          String(row.application_id),

        instrumentId:
          row.instrument_code ||
          String(row.instrument_id),

        businessId:
          String(row.business_id),

        certificateType:
          row.certificate_type ||
          "Verification Certificate",

        issueDate:
          row.issue_date,

        validUntil:
          row.valid_until,

        status:
          row.status || "Valid",

        officerId: "",

        instrumentType:
          row.instrument_type ||
          "Unknown Instrument",

        manufacturer:
          row.manufacturer ||
          "Unknown Manufacturer",

        createdAt:
          row.issue_date,
      }));

      return res.json({
        success: true,
        certificates,
      });
    } catch (error) {
      console.error(
        "Get merchant certificates error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load certificates",
      });
    }
  }
);

/* =========================================================
   PUBLIC CERTIFICATE SEARCH
   Search by Business Name + Instrument Type
   NO LOGIN REQUIRED
   ========================================================= */

app.get(
  "/api/public/certificates/search",
  async (req, res) => {
    try {
      const businessName = String(
        req.query.businessName || ""
      ).trim();

      const instrumentType = String(
        req.query.instrumentType || ""
      ).trim();

      if (!businessName || !instrumentType) {
        return res.status(400).json({
          success: false,
          message:
            "Business name and instrument type are required.",
        });
      }

      const result = await pool.query(
        `
        SELECT
          c.id,
          c.certificate_number,
          c.verification_id,
          c.application_id,
          c.instrument_id,
          c.business_id,
          c.certificate_type,
          c.issue_date,
          c.valid_until,
          c.status,
          c.officer_id,

          b.business_name,

          i.instrument_code,
          i.instrument_type,
          i.manufacturer,
          i.model,
          i.serial_number

        FROM certificates c

        LEFT JOIN businesses b
          ON b.id = c.business_id

        LEFT JOIN instruments i
          ON i.id = c.instrument_id

        WHERE
          LOWER(b.business_name)
          LIKE LOWER($1)

          AND

          LOWER(i.instrument_type)
          LIKE LOWER($2)

        ORDER BY c.id DESC
        `,
        [
          `%${businessName}%`,
          `%${instrumentType}%`,
        ]
      );

      const certificates =
        result.rows.map((row) => ({
          certificateId:
            `CERT-${row.id}`,

          certificateNumber:
            row.certificate_number,

          verificationId:
            row.verification_id,

          applicationId:
            row.application_id,

          instrumentId:
            row.instrument_code ||
            row.instrument_id,

          businessId:
            row.business_id,

          businessName:
            row.business_name,

          certificateType:
            row.certificate_type,

          issueDate:
            row.issue_date,

          validUntil:
            row.valid_until,

          status:
            row.status,

          officerId:
            row.officer_id,

          instrumentType:
            row.instrument_type,

          manufacturer:
            row.manufacturer,

          model:
            row.model,

          serialNumber:
            row.serial_number,
        }));

      return res.json({
        success: true,
        count: certificates.length,
        certificates,
      });

    } catch (error) {
      console.error(
        "Public certificate search error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to search certificates.",
      });
    }
  }
);
 app.get(
  "/api/public/businesses/:businessId/certificates",
  async (req, res) => {
    try {
      const businessId = Number(
        req.params.businessId
      );

      if (
        !Number.isInteger(businessId) ||
        businessId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid business ID.",
        });
      }

      const businessResult = await pool.query(
        `
        SELECT
          id,
          business_name
        FROM businesses
        WHERE id = $1
        `,
        [businessId]
      );

      if (businessResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Business not found.",
        });
      }

      const business =
        businessResult.rows[0];

      const certificateResult =
        await pool.query(
          `
          SELECT
            c.id,
            c.certificate_number,
            c.verification_id,
            c.application_id,
            c.instrument_id,
            c.business_id,
            c.certificate_type,
            c.issue_date,
            c.valid_until,
            c.status,
            c.officer_id,

            b.business_name,

            i.instrument_code,
            i.instrument_type,
            i.manufacturer,
            i.model,
            i.serial_number

          FROM certificates c

          LEFT JOIN businesses b
            ON b.id = c.business_id

          LEFT JOIN instruments i
            ON i.id = c.instrument_id

          WHERE c.business_id = $1

          ORDER BY c.id DESC
          `,
          [businessId]
        );

      const certificates =
        certificateResult.rows.map(
          (certificate) => ({
            certificateId:
              `CERT-${certificate.id}`,

            certificateNumber:
              certificate.certificate_number,

            verificationId:
              certificate.verification_id,

            applicationId:
              certificate.application_id,

            instrumentId:
              certificate.instrument_code ??
              certificate.instrument_id,

            businessId:
              certificate.business_id,

            businessName:
              certificate.business_name,

            certificateType:
              certificate.certificate_type,

            issueDate:
              certificate.issue_date,

            validUntil:
              certificate.valid_until,

            status:
              certificate.status,

            officerId:
              certificate.officer_id,

            instrumentType:
              certificate.instrument_type,

            manufacturer:
              certificate.manufacturer,

            model:
              certificate.model,

            serialNumber:
              certificate.serial_number,
          })
        );

      return res.json({
        success: true,

        business: {
          businessId:
            business.id,

          businessName:
            business.business_name,
        },

        count:
          certificates.length,

        certificates,
      });
    } catch (error) {
      console.error(
        "Public business certificate error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load business certificates.",
      });
    }
  }
);
 app.get("/api/public/businesses/search", async (req, res) => {
  try {
    const businessName = String(req.query.businessName || "").trim();

    if (!businessName) {
      return res.status(400).json({
        success: false,
        message: "Business name is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        business_name
      FROM businesses
      WHERE LOWER(business_name) LIKE LOWER($1)
      ORDER BY business_name ASC
      LIMIT 20
      `,
      [`%${businessName}%`]
    );

    return res.json({
      success: true,
      businesses: result.rows.map((business) => ({
        businessId: business.id,
        businessName: business.business_name,
      })),
    });
  } catch (error) {
    console.error("Public business search error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to search businesses.",
    });
  }
});
/* =========================================================
   PUBLIC CERTIFICATE PDF
   QR SCAN -> PDF CERTIFICATE
   NO LOGIN REQUIRED
========================================================= */

app.get(
  "/api/public/certificates/:certificateId/pdf",
  async (req, res) => {
    try {
      const rawId = String(
        req.params.certificateId || ""
      )
        .trim()
        .toUpperCase();

      if (!rawId) {
        return res.status(400).json({
          success: false,
          message: "Certificate ID is required.",
        });
      }

      let result;

      /*
       * Accept:
       * CERT-1
       * ALMVE/2026/739580
       */

      // if (/^CERT-\d+$/.test(rawId)) {
      //   const certificateId = Number(
      //     rawId.replace("CERT-", "")
      //   );
      if (/^CERT-\d+$/.test(rawId)) {
       /* Keep CERT IDs as strings to avoid PostgreSQL INTEGER overflow. */
        const certificateId = rawId.replace("CERT-", "");

        result = await pool.query(
          `
          SELECT
            c.id,
            c.certificate_number,
            c.verification_id,
            c.application_id,
            c.instrument_id,
            c.business_id,
            c.certificate_type,
            c.issue_date,
            c.valid_until,
            c.status,

            v.verification_number,
            v.verification_date,
            v.verification_type,
            v.location AS verification_location,
            v.result AS verification_result,
            v.remarks AS verification_remarks,

            a.application_number,

            i.instrument_code,
            i.instrument_type,
            i.manufacturer,
            i.model,
            i.serial_number,
            i.capacity,

            b.business_name,

            ins.employee_id,
            ins.name AS inspector_name,

            o.test_name,
            o.standard_value,
            o.observed_value,
            o.permissible_error,
            o.error_value,
            o.unit,
            o.result AS observation_result,
            o.remarks AS observation_remarks

          FROM certificates c

          LEFT JOIN verifications v
            ON v.id = c.verification_id

          LEFT JOIN applications a
            ON a.id = c.application_id

          LEFT JOIN instruments i
            ON i.id = c.instrument_id

          LEFT JOIN businesses b
            ON b.id = c.business_id

          LEFT JOIN inspectors ins
            ON ins.id = v.inspector_id

          LEFT JOIN observations o
            ON o.verification_id = c.verification_id

          
          WHERE CAST(c.id AS TEXT) = $1

          ORDER BY o.id ASC

          LIMIT 1
          `,
          [certificateId]
        );
      } else {
        result = await pool.query(
          `
          SELECT
            c.id,
            c.certificate_number,
            c.verification_id,
            c.application_id,
            c.instrument_id,
            c.business_id,
            c.certificate_type,
            c.issue_date,
            c.valid_until,
            c.status,

            v.verification_number,
            v.verification_date,
            v.verification_type,
            v.location AS verification_location,
            v.result AS verification_result,
            v.remarks AS verification_remarks,

            a.application_number,

            i.instrument_code,
            i.instrument_type,
            i.manufacturer,
            i.model,
            i.serial_number,
            i.capacity,

            b.business_name,

            ins.employee_id,
            ins.name AS inspector_name,

            o.test_name,
            o.standard_value,
            o.observed_value,
            o.permissible_error,
            o.error_value,
            o.unit,
            o.result AS observation_result,
            o.remarks AS observation_remarks

          FROM certificates c

          LEFT JOIN verifications v
            ON v.id = c.verification_id

          LEFT JOIN applications a
            ON a.id = c.application_id

          LEFT JOIN instruments i
            ON i.id = c.instrument_id

          LEFT JOIN businesses b
            ON b.id = c.business_id

          LEFT JOIN inspectors ins
            ON ins.id = v.inspector_id

          LEFT JOIN observations o
            ON o.verification_id = c.verification_id

          WHERE UPPER(c.certificate_number) = $1

          ORDER BY o.id ASC

          LIMIT 1
          `,
          [rawId]
        );
      }

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Certificate ${rawId} not found.`,
        });
      }

      const row = result.rows[0];

      /* -----------------------------------------------------
         PDF URL
      ----------------------------------------------------- */

      const host =
        req.headers["x-forwarded-host"] ||
        req.headers.host;

      const protocol =
        req.headers["x-forwarded-proto"] ||
        req.protocol;

      // const pdfUrl =
      //   `${protocol}://${host}` +
      //   `/api/public/certificates/CERT-${row.id}/pdf`;
      const pdfUrl =
       `${protocol}://${host}` +
       `/api/public/certificates/${encodeURIComponent(
        row.certificate_number
        )}/pdf`;

      /* -----------------------------------------------------
         CREATE QR CODE
      ----------------------------------------------------- */

      const qrBuffer = await QRCode.toBuffer(
        pdfUrl,
        {
          type: "png",
          width: 180,
          margin: 2,
        }
      );

      /* -----------------------------------------------------
         PDF RESPONSE
      ----------------------------------------------------- */

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        `inline; filename="Certificate-${row.certificate_number}.pdf"`
      );

      const doc = new PDFDocument({
        size: "A4",
        margin: 45,
      });

      doc.pipe(res);

      /* =====================================================
         HEADER
      ===================================================== */

      doc
        .fontSize(11)
        .fillColor("#00843D")
        .text(
          "LEGAL METROLOGY",
          {
            align: "center",
          }
        );

      doc
        .moveDown(0.4)
        .fontSize(22)
        .fillColor("#173F73")
        .font("Helvetica-Bold")
        .text(
          "VERIFICATION CERTIFICATE",
          {
            align: "center",
          }
        );

      doc
        .moveDown(0.3)
        .fontSize(11)
        .fillColor("#555555")
        .font("Helvetica")
        .text(
          row.certificate_type ||
            "Digital Verification Certificate",
          {
            align: "center",
          }
        );

      doc.moveDown(1);

      /* =====================================================
         CERTIFICATE NUMBER
      ===================================================== */

      doc
        .fontSize(16)
        .fillColor("#173F73")
        .font("Helvetica-Bold")
        .text(
          row.certificate_number || "-",
          {
            align: "center",
          }
        );

      doc.moveDown(1);

      /* =====================================================
         QR CODE
      ===================================================== */

      doc.image(
        qrBuffer,
        207,
        doc.y,
        {
          width: 180,
          height: 180,
        }
      );

      doc.moveDown(12);

      doc
        .fontSize(8)
        .fillColor("#666666")
        .font("Helvetica")
        .text(
          "Scan the QR code to verify this certificate.",
          {
            align: "center",
          }
        );

      doc.moveDown(1);

      /* =====================================================
         DETAILS TABLE
      ===================================================== */

      const startX = 70;
      const valueX = 270;

      function addRow(label, value) {
        const y = doc.y;

        doc
          .fontSize(10)
          .fillColor("#666666")
          .font("Helvetica")
          .text(
            label,
            startX,
            y,
            {
              width: 180,
            }
          );

        doc
          .fontSize(10)
          .fillColor("#173F73")
          .font("Helvetica-Bold")
          .text(
            value || "-",
            valueX,
            y,
            {
              width: 260,
            }
          );

        doc.moveDown(0.7);
      }

      addRow(
        "Certificate Number",
        row.certificate_number
      );

      addRow(
        "Application ID",
        row.application_number
      );

      addRow(
        "Verification ID",
        row.verification_number
      );

      addRow(
        "Business",
        row.business_name
      );

      addRow(
        "Instrument",
        row.instrument_type
      );

      addRow(
        "Instrument ID",
        row.instrument_code
      );

      addRow(
        "Manufacturer",
        row.manufacturer
      );

      addRow(
        "Model",
        row.model
      );

      addRow(
        "Serial Number",
        row.serial_number
      );

      addRow(
        "Officer ID",
        row.employee_id
      );

      addRow(
        "Verification Date",
        row.verification_date
          ? String(row.verification_date).slice(
              0,
              10
            )
          : ""
      );

      addRow(
        "Issue Date",
        row.issue_date
          ? String(row.issue_date).slice(
              0,
              10
            )
          : ""
      );

      addRow(
        "Valid Until",
        row.valid_until
          ? String(row.valid_until).slice(
              0,
              10
            )
          : ""
      );

      addRow(
        "Status",
        row.status || "Valid"
      );

      /* =====================================================
         VERIFICATION RESULT
      ===================================================== */

      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor("#173F73")
        .font("Helvetica-Bold")
        .text("Verification Result");

      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .fillColor("#00843D")
        .font("Helvetica-Bold")
        .text(
          row.verification_result ||
            "PASS",
          {
            align: "center",
          }
        );

      /* =====================================================
         OBSERVATION
      ===================================================== */

      if (row.test_name) {
        doc.moveDown(1);

        doc
          .fontSize(12)
          .fillColor("#173F73")
          .font("Helvetica-Bold")
          .text("MPE Observation");

        doc.moveDown(0.5);

        addRow(
          "Test",
          row.test_name
        );

        addRow(
          "Standard Value",
          row.standard_value != null
            ? `${row.standard_value} ${
                row.unit || ""
              }`
            : "-"
        );

        addRow(
          "Observed Value",
          row.observed_value != null
            ? `${row.observed_value} ${
                row.unit || ""
              }`
            : "-"
        );

        addRow(
          "Permissible Error",
          row.permissible_error != null
            ? `± ${row.permissible_error} ${
                row.unit || ""
              }`
            : "-"
        );

        addRow(
          "Error",
          row.error_value != null
            ? `${row.error_value} ${
                row.unit || ""
              }`
            : "-"
        );

        addRow(
          "Result",
          row.observation_result ||
            "PASS"
        );
      }

      /* =====================================================
         FOOTER
      ===================================================== */

      doc.moveDown(1);

      doc
        .fontSize(8)
        .fillColor("#777777")
        .font("Helvetica")
        .text(
          "This is a digitally generated Legal Metrology Verification Certificate.",
          {
            align: "center",
          }
        );

      doc
        .moveDown(0.3)
        .text(
          "Certificate authenticity can be verified using the QR code.",
          {
            align: "center",
          }
        );

      doc.end();
    } catch (error) {
      console.error(
        "Certificate PDF generation error:",
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message:
            "Unable to generate certificate PDF.",
        });
      }
    }
  }
);
/* =========================================================
   PUBLIC CERTIFICATE VERIFICATION
   No login required
========================================================= */

app.get(
  "/api/public/certificates/:certificateId",
  async (req, res) => {
    try {
      const rawId =
        String(req.params.certificateId || "")
          .trim()
          .toUpperCase();

      if (!rawId) {
        return res.status(400).json({
          success: false,
          message: "Certificate ID is required.",
        });
      }

      let result;

      /*
       * Accept:
       * CERT-1
       * ALMVE/2026/739580
       */

      if (/^CERT-\d+$/.test(rawId)) {
        const certificateId =
          Number(rawId.replace("CERT-", ""));

        result = await pool.query(
          `
          SELECT
            c.id,
            c.certificate_number,
            c.verification_id,
            c.application_id,
            c.instrument_id,
            c.business_id,
            c.certificate_type,
            c.issue_date,
            c.valid_until,
            c.status,

            v.verification_number,
            v.verification_date,
            v.verification_type,
            v.location,
            v.result,
            v.remarks AS verification_remarks,

            a.application_number,

            i.instrument_code,
            i.instrument_type,
            i.manufacturer,

            b.business_name

          FROM certificates c

          LEFT JOIN verifications v
            ON v.id = c.verification_id

          LEFT JOIN applications a
            ON a.id = c.application_id

          LEFT JOIN instruments i
            ON i.id = c.instrument_id

          LEFT JOIN businesses b
            ON b.id = c.business_id

          WHERE c.id = $1

          LIMIT 1
          `,
          [certificateId]
        );
      } else {
        result = await pool.query(
          `
          SELECT
            c.id,
            c.certificate_number,
            c.verification_id,
            c.application_id,
            c.instrument_id,
            c.business_id,
            c.certificate_type,
            c.issue_date,
            c.valid_until,
            c.status,

            v.verification_number,
            v.verification_date,
            v.verification_type,
            v.location,
            v.result,
            v.remarks AS verification_remarks,

            a.application_number,

            i.instrument_code,
            i.instrument_type,
            i.manufacturer,

            b.business_name

          FROM certificates c

          LEFT JOIN verifications v
            ON v.id = c.verification_id

          LEFT JOIN applications a
            ON a.id = c.application_id

          LEFT JOIN instruments i
            ON i.id = c.instrument_id

          LEFT JOIN businesses b
            ON b.id = c.business_id

          WHERE UPPER(c.certificate_number) = $1

          LIMIT 1
          `,
          [rawId]
        );
      }

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            `Certificate ${rawId} not found.`,
        });
      }

      const row = result.rows[0];

      return res.json({
        success: true,

        certificate: {
          certificateId:
            `CERT-${row.id}`,

          certificateNumber:
            row.certificate_number,

          verificationId:
            row.verification_number ||
            String(row.verification_id),

          applicationId:
            row.application_number ||
            String(row.application_id),

          instrumentId:
            row.instrument_code ||
            String(row.instrument_id),

          businessId:
            String(row.business_id),
            businessName:
             row.business_name || "Unknown Business",

          certificateType:
            row.certificate_type ||
            "Verification Certificate",

          issueDate:
            row.issue_date,

          validUntil:
            row.valid_until,

          status:
            row.status || "Valid",

          officerId:
            "",

          instrumentType:
            row.instrument_type ||
            "Unknown Instrument",

          manufacturer:
            row.manufacturer ||
            "Unknown Manufacturer",
          
            nominalValue:
  row.standard_value != null
    ? `${row.standard_value} ${row.unit || ""}`.trim()
    : undefined,

observedValue:
  row.observed_value != null
    ? `${row.observed_value} ${row.unit || ""}`.trim()
    : undefined,

permissibleError:
  row.permissible_error != null
    ? `± ${row.permissible_error} ${row.unit || ""}`.trim()
    : undefined,

error:
  row.error_value != null
    ? `${row.error_value} ${row.unit || ""}`.trim()
    : undefined,

absoluteError:
  row.error_value != null
    ? `${Math.abs(Number(row.error_value))} ${row.unit || ""}`.trim()
    : undefined,

remarks:
  row.observation_remarks ||
  row.verification_remarks ||
  undefined,

location:
  row.verification_location ||
  undefined,

createdAt:
  row.issue_date,
          
          
        },
      });
    } catch (error) {
      console.error(
        "Public certificate verification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to verify certificate.",
      });
    }
  }
);

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

app.get(
  "/api/admin/dashboard",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      /* ---------------------------------------------
         APPLICATIONS
      --------------------------------------------- */

      const applicationsResult =
        await pool.query(`
          SELECT
            a.id,
            a.application_number,
            a.status,
            a.submitted_at,
            a.business_id,
            a.instrument_id,
            a.assigned_inspector_id,

            b.business_name,

            i.instrument_code,
            i.instrument_type,

            ins.name AS inspector_name

          FROM applications a

          LEFT JOIN businesses b
            ON b.id = a.business_id

          LEFT JOIN instruments i
            ON i.id = a.instrument_id

          LEFT JOIN inspectors ins
            ON ins.id = a.assigned_inspector_id

          ORDER BY a.id DESC
        `);

      /* ---------------------------------------------
         CERTIFICATES
      --------------------------------------------- */

      const certificatesResult =
        await pool.query(`
          SELECT
            c.id,
            c.certificate_number,
            c.verification_id,
            c.application_id,
            c.instrument_id,
            c.business_id,
            c.certificate_type,
            c.issue_date,
            c.valid_until,
            c.status

          FROM certificates c

          ORDER BY c.id DESC
        `);

      /* ---------------------------------------------
         VERIFICATIONS
      --------------------------------------------- */

      const verificationsResult =
        await pool.query(`
          SELECT
            v.id,
            v.verification_number,
            v.application_id,
            v.inspector_id,
            v.verification_date,
            v.result,
            v.location

          FROM verifications v

          ORDER BY v.id DESC
        `);

      /* ---------------------------------------------
         APPLICATION STATISTICS
      --------------------------------------------- */

      const applicationStatsResult =
        await pool.query(`
          SELECT
            COUNT(*)::INTEGER AS total,

            COUNT(*) FILTER (
              WHERE status = 'Pending'
            )::INTEGER AS pending,

            COUNT(*) FILTER (
              WHERE status = 'Scheduled'
            )::INTEGER AS scheduled,

            COUNT(*) FILTER (
              WHERE status = 'Approved'
            )::INTEGER AS approved,

            COUNT(*) FILTER (
              WHERE status = 'Completed'
            )::INTEGER AS completed,

            COUNT(*) FILTER (
              WHERE status = 'Rejected'
            )::INTEGER AS rejected

          FROM applications
        `);

      /* ---------------------------------------------
         CERTIFICATE STATISTICS
      --------------------------------------------- */

      const certificateStatsResult =
        await pool.query(`
          SELECT
            COUNT(*)::INTEGER AS total,

            COUNT(*) FILTER (
              WHERE status = 'Valid'
            )::INTEGER AS valid,

            COUNT(*) FILTER (
              WHERE status = 'Expired'
            )::INTEGER AS expired,

            COUNT(*) FILTER (
              WHERE valid_until >= CURRENT_DATE
                AND valid_until <=
                    CURRENT_DATE + INTERVAL '30 days'
            )::INTEGER AS expiring

          FROM certificates
        `);

      /* ---------------------------------------------
         VERIFICATION STATISTICS
      --------------------------------------------- */

      const verificationStatsResult =
        await pool.query(`
          SELECT
            COUNT(*) FILTER (
              WHERE result = 'PASS'
            )::INTEGER AS passed,

            COUNT(*) FILTER (
              WHERE result = 'FAIL'
            )::INTEGER AS failed,

            COUNT(*) FILTER (
              WHERE result = 'PENDING'
            )::INTEGER AS pending

          FROM verifications
        `);

      /* ---------------------------------------------
         INSTRUMENT COUNT
      --------------------------------------------- */

      const instrumentResult =
        await pool.query(`
          SELECT COUNT(*)::INTEGER AS count
          FROM instruments
        `);

      /* ---------------------------------------------
         INSPECTOR COUNT
      --------------------------------------------- */

      const inspectorResult =
        await pool.query(`
          SELECT COUNT(*)::INTEGER AS count
          FROM inspectors
          WHERE COALESCE(status, 'Available')
                <> 'Inactive'
        `);

      /* ---------------------------------------------
         PREPARE RESPONSE
      --------------------------------------------- */

      const applicationStats =
        applicationStatsResult.rows[0];

      const certificateStats =
        certificateStatsResult.rows[0];

      const verificationStats =
        verificationStatsResult.rows[0];

      return res.json({
        success: true,

        applications:
          applicationsResult.rows,

        certificates:
          certificatesResult.rows,

        verifications:
          verificationsResult.rows,

        /* No enforcement table dependency for now */
        enforcements: [],

        instrumentCount:
          Number(
            instrumentResult.rows[0].count
          ),

        inspectorCount:
          Number(
            inspectorResult.rows[0].count
          ),

        applicationStats: {
          total:
            Number(
              applicationStats.total
            ),

          pending:
            Number(
              applicationStats.pending
            ),

          scheduled:
            Number(
              applicationStats.scheduled
            ),

          approved:
            Number(
              applicationStats.approved
            ),

          completed:
            Number(
              applicationStats.completed
            ),

          rejected:
            Number(
              applicationStats.rejected
            ),
        },

        certificateStats: {
          total:
            Number(
              certificateStats.total
            ),

          valid:
            Number(
              certificateStats.valid
            ),

          expiring:
            Number(
              certificateStats.expiring
            ),

          expired:
            Number(
              certificateStats.expired
            ),
        },

        verificationStats: {
          passed:
            Number(
              verificationStats.passed
            ),

          failed:
            Number(
              verificationStats.failed
            ),

          pending:
            Number(
              verificationStats.pending
            ),
        },
      });
    } catch (error) {
      console.error(
        "ADMIN DASHBOARD API ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load admin dashboard.",
      });
    }
  }
);
/* =========================================================
   GEMINI AI CHATBOT
   ========================================================= */

app.post(
  "/api/chat",
  async (req, res) => {
    try {
      const { message } = req.body;

      if (
        !message ||
        typeof message !== "string" ||
        !message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Message is required.",
        });
      }

      const response =
        await gemini.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: message.trim(),
          config: {
            systemInstruction:
              "You are MaapSetu Assistant, an AI assistant for the MaapSetu online verification system for weighing and measuring instruments. Answer clearly and helpfully. Focus on MaapSetu applications, certificates, verification, instruments, merchants, inspectors and general website guidance. Do not invent official government rules, fees, certificate numbers, application status, or database information.",
          },
        });

      return res.json({
        success: true,
        reply: response.text,
      });

    } catch (error) {
      console.error(
        "Gemini Chatbot Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to process your message.",
      });
    }
  }
);

/* =========================================================
404
========================================================= */

app.use(
(req, res) => {
res.status(404).json({
success: false,
message:
"API endpoint not found",
path: req.originalUrl,
});
}
);

/* =========================================================
GLOBAL ERROR HANDLER
========================================================= */

app.use(
(
error,
req,
res,
next
) => {
console.error(
"Unhandled server error:",
error
);

res.status(500).json({
  success: false,
  message:
    "Internal server error",
});

}
);
/* =========================================================
   GOOGLE LOGIN
========================================================= */

app.post(
  "/api/auth/google",
  async (req, res) => {
    try {
      const { credential, role } = req.body;

      if (!credential) {
        return res.status(400).json({
          success: false,
          message: "Google credential is required.",
        });
      }

      const allowedRoles = [
        "merchant",
        "inspector",
        "admin",
      ];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role.",
        });
      }

      const ticket =
        await googleClient.verifyIdToken({
          idToken: credential,
          audience:
            process.env.GOOGLE_CLIENT_ID,
        });

      const payload =
        ticket.getPayload();

      const googleEmail =
        payload?.email
          ?.trim()
          .toLowerCase();

      const emailVerified =
        payload?.email_verified;

      if (!googleEmail || !emailVerified) {
        return res.status(401).json({
          success: false,
          message:
            "Google email could not be verified.",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            id,
            name,
            email,
            phone,
            role,
            created_at
          FROM users
          WHERE email = $1
          LIMIT 1
          `,
          [googleEmail]
        );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No ALMVE account exists with this Google email. Please register first.",
        });
      }

      const user = result.rows[0];

      if (user.role !== role) {
        return res.status(403).json({
          success: false,
          message:
            `This Google account is registered as ${user.role}, not ${role}.`,
        });
      }

      const token =
        createToken(user);

      return res.json({
        success: true,
        message:
          "Google login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          created_at:
            user.created_at,
        },
      });

    } catch (error) {
      console.error(
        "Google login error:",
        error
      );

      return res.status(401).json({
        success: false,
        message:
          "Google authentication failed.",
      });
    }
  }
);

/* =========================================================
START SERVER
========================================================= */

const PORT =
process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ALMVE Backend running on http://localhost:${PORT}`);
  console.log(`Network access: http://172.20.10.2:${PORT}`);
  console.log(`Health check: http://172.20.10.2:${PORT}/api/health`);
});

console.log(
  `Health check: http://localhost:${PORT}/api/health`
);

