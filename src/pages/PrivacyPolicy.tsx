import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold">MaapSetu Privacy Policy</h1>
          <p className="mb-8 text-sm text-gray-500">Last updated: September 9, 2026</p>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">1. Introduction</h2>
            <p>
              MaapSetu is an online verification and management platform for
              weighing and measuring instruments. This Privacy Policy explains
              what information we collect, how we use it, and how we protect it.
            </p>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">2. Information We Collect</h2>
            <p className="mb-3">
              Depending on how you use MaapSetu, we may collect:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Name and contact details such as email address and phone number.</li>
              <li>Account credentials and role information.</li>
              <li>Business and instrument information submitted through the platform.</li>
              <li>Application, appointment, verification and certificate information.</li>
              <li>Technical information needed to operate and secure the service.</li>
            </ul>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">3. Google Sign-In</h2>
            <p>
              MaapSetu may provide Google Sign-In. When you choose Google Sign-In,
              Google may provide basic account information such as your name,
              email address, profile information, and a unique Google account
              identifier. MaapSetu uses this information to authenticate your
              account and provide the requested MaapSetu services.
            </p>
            <p className="mt-3">
              MaapSetu does not request access to your Google Drive, Gmail,
              Contacts, Calendar, or other Google services unless a future
              feature explicitly requires such access and you separately grant
              the requested permission.
            </p>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">4. How We Use Information</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Create and authenticate MaapSetu accounts.</li>
              <li>Provide applications, appointments, verification and certificate services.</li>
              <li>Communicate with users about their account or submitted requests.</li>
              <li>Maintain platform security, prevent abuse and troubleshoot problems.</li>
              <li>Improve the reliability and functionality of the platform.</li>
            </ul>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">5. Sharing of Information</h2>
            <p>
              We do not sell personal information. Information may be shared only
              when necessary to provide MaapSetu services, comply with applicable
              law, protect the security of the platform, or when you explicitly
              request or authorize such sharing.
            </p>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">6. Data Security</h2>
            <p>
              We use reasonable technical and organizational safeguards to protect
              account and application information. No internet-based service can
              guarantee absolute security, so users should also protect their
              passwords and account credentials.
            </p>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">7. Data Retention</h2>
            <p>
              Information is retained for as long as reasonably necessary to
              provide the service, maintain records, resolve disputes, comply
              with legal obligations, and protect the platform.
            </p>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">8. Your Choices</h2>
            <p>
              You may request access to, correction of, or deletion of eligible
              personal information associated with your account, subject to
              applicable legal and operational requirements.
            </p>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">9. Children's Privacy</h2>
            <p>
              MaapSetu is intended for users who are legally able to use the
              services. We do not knowingly collect personal information from
              children in violation of applicable law.
            </p>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-xl font-semibold">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy when the platform or applicable
              requirements change. The latest version will be published on this
              page with an updated date.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">11. Contact</h2>
            <p>
              For privacy-related questions or requests, please contact the
              MaapSetu support contact shown in the application.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
