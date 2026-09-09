import React from "react";

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold">MaapSetu Terms of Service</h1>
          <p className="mb-8 text-sm text-gray-500">Last updated: September 9, 2026</p>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">1. Acceptance</h2>
            <p>
              By accessing or using MaapSetu, you agree to these Terms of Service.
              If you do not agree with these terms, please do not use the service.
            </p>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">2. About MaapSetu</h2>
            <p>
              MaapSetu is an online platform intended to support workflows related
              to weighing and measuring instruments, including applications,
              appointments, verification-related information and certificates.
            </p>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">3. User Accounts</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>You must provide accurate information when creating or using an account.</li>
              <li>You are responsible for protecting your login credentials.</li>
              <li>You must not use another person's account without authorization.</li>
              <li>You must promptly report suspected unauthorized access.</li>
            </ul>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">4. Google Sign-In</h2>
            <p>
              If Google Sign-In is available, you may use your Google account to
              authenticate with MaapSetu. Your use of Google services is also
              subject to Google's applicable terms and policies.
            </p>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">5. Acceptable Use</h2>
            <p className="mb-3">You must not:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Submit false, misleading or fraudulent information.</li>
              <li>Attempt to bypass authentication or access restricted areas.</li>
              <li>Interfere with the availability or security of the platform.</li>
              <li>Use the platform for unlawful purposes.</li>
              <li>Upload malicious code or content intended to damage the service.</li>
            </ul>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">6. Submitted Information</h2>
            <p>
              You are responsible for the accuracy and legality of information
              submitted through your account. You should only submit information
              that you are authorized to provide.
            </p>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">7. Service Availability</h2>
            <p>
              We aim to keep MaapSetu available and reliable, but the service may
              occasionally be unavailable because of maintenance, updates,
              network failures, security events, or circumstances outside our
              reasonable control.
            </p>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">8. Changes</h2>
            <p>
              Features and these terms may be updated as MaapSetu develops.
              Continued use after an update means you accept the updated terms.
            </p>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">9. Termination</h2>
            <p>
              Access may be suspended or terminated when necessary for security,
              legal compliance, misuse prevention, or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">10. Contact</h2>
            <p>
              For questions about these terms, please contact the MaapSetu
              support contact shown in the application.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
