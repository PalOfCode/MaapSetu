import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* =========================
   AUTH
========================= */

import Login from "./pages/auth/Login";

/* =========================
   MERCHANT
========================= */

import Dashboard from "./pages/merchant/Dashboard";
import Instruments from "./pages/merchant/Instruments";
import RegisterInstrument from "./pages/merchant/RegisterInstrument";
import Applications from "./pages/merchant/Applications";
import InstrumentDetails from "./pages/merchant/InstrumentDetails";
import ApplicationDetails from "./pages/merchant/ApplicationDetails";
import Appointments from "./pages/merchant/Appointments";
import Certificates from "./pages/merchant/Certificates";
import Payments from "./pages/merchant/Payments";
import MerchantNotifications from "./pages/merchant/Notifications";
import MerchantProfile from "./pages/merchant/Profile";
import MerchantSettings from "./pages/merchant/Settings";
/* =========================
   PUBLIC
========================= */

import PublicVerify from "./pages/public/PublicVerify";
import GovernmentHome from "./pages/public/GovernmentHome";
import BusinessRegistration from "./pages/public/BusinessRegistration";

/* =========================
   INSPECTOR
========================= */

import InspectorDashboard from "./pages/inspector/InspectorDashboard";
import InspectorApplications from "./pages/inspector/InspectorApplications";
import InspectorApplicationDetails from "./pages/inspector/InspectorApplicationDetails";
import InspectorAppointments from "./pages/inspector/InspectorAppointments";
import MPEEvaluation from "./pages/inspector/MPEEvaluation";
import VerificationResult from "./pages/inspector/VerificationResult";

/* =========================
   ADMIN
========================= */

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import AdminGatcsLmos from "./pages/admin/AdminGatcsLmos";
import AdminEnforcement from "./pages/admin/AdminEnforcement";
import AdminInstruments from "./pages/admin/AdminInstruments";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";

/* =========================
   APP
========================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================
            GOVERNMENT HOME
        ===================================== */}

        <Route
          path="/"
          element={<GovernmentHome />}
        />

        {/* =====================================
            LOGIN
        ===================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =====================================
            BUSINESS REGISTRATION
        ===================================== */}

        <Route
          path="/business-registration"
          element={<BusinessRegistration />}
        />

        {/* =====================================
            MERCHANT
        ===================================== */}

        <Route
          path="/merchant/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/merchant/instruments"
          element={<Instruments />}
        />

        <Route
          path="/merchant/instruments/:id"
          element={<InstrumentDetails />}
        />

        <Route
          path="/merchant/register-instrument"
          element={<RegisterInstrument />}
        />

        <Route
          path="/merchant/applications"
          element={<Applications />}
        />

        <Route
          path="/merchant/applications/:id"
          element={<ApplicationDetails />}
        />

        <Route
          path="/merchant/appointments"
          element={<Appointments />}
        />

        <Route
          path="/merchant/certificates"
          element={<Certificates />}
        />

        <Route
          path="/merchant/payments"
          element={<Payments />}
        />
        <Route
         path="/merchant/notifications"
         element={<MerchantNotifications />}
        />
        <Route
        path="/merchant/profile"
         element={<MerchantProfile />}
        />

       <Route
         path="/merchant/settings"
          element={<MerchantSettings />}
         />
        {/* =====================================
            PUBLIC CERTIFICATE VERIFICATION
        ===================================== */}

        {/* <Route
          path="/verify/:certificateId"
          element={<PublicVerify />}
        /> */}
         <Route
           path="/verify"
           element={<PublicVerify />}
        />

           <Route
              path="/verify/:certificateId"
              element={<PublicVerify />}
        />
        {/* =====================================
            INSPECTOR
        ===================================== */}

        <Route
          path="/inspector/dashboard"
          element={<InspectorDashboard />}
        />

        <Route
          path="/inspector/applications"
          element={<InspectorApplications />}
        />

        <Route
          path="/inspector/applications/:id"
          element={<InspectorApplicationDetails />}
        />

        <Route
          path="/inspector/appointments"
          element={<InspectorAppointments />}
        />

        <Route
          path="/inspector/mpe-evaluation"
          element={<MPEEvaluation />}
        />

        <Route
          path="/inspector/verification-result"
          element={<VerificationResult />}
        />

        {/* =====================================
            INSPECTOR TEMPORARY PAGES
        ===================================== */}

        <Route
          path="/inspector/notifications"
          element={
            <SimplePage
              title="Inspector Notifications"
              message="Inspector notifications will be connected next."
            />
          }
        />

        <Route
          path="/inspector/settings"
          element={
            <SimplePage
              title="Inspector Settings"
              message="Inspector settings will be connected next."
            />
          }
        />

        {/* =====================================
            ADMIN
        ===================================== */}

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/applications"
          element={<AdminApplications />}
        />

        <Route
          path="/admin/appointments"
          element={<AdminAppointments />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        <Route
          path="/admin/reports"
          element={<AdminReports />}
        />

        <Route
          path="/admin/gatcs-lmos"
          element={<AdminGatcsLmos />}
        />

        <Route
          path="/admin/enforcement"
          element={<AdminEnforcement />}
        />

        <Route
          path="/admin/instruments"
          element={<AdminInstruments />}
        />

        <Route
          path="/admin/notifications"
          element={<AdminNotifications />}
        />

        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />

        {/* =====================================
            FALLBACK
        ===================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

/* =========================================
   SIMPLE TEMPORARY PAGE
========================================= */

function SimplePage({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8">

      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">

        <p className="text-sm font-semibold text-emerald-700">
          ALMVE
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="mt-3 text-slate-500">
          {message}
        </p>

      </div>

    </div>
  );
}

export default App;