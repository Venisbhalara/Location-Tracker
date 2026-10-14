import { memo } from "react";
import { Helmet } from "react-helmet-async";

const Section = memo(({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4 flex items-center gap-3 font-serif">
      <span className="w-1.5 h-6 rounded-full bg-stone-800 inline-block" />
      {title}
    </h2>
    <div className="text-stone-700 text-sm sm:text-base leading-relaxed space-y-3">{children}</div>
  </div>
));

const PrivacyPolicy = memo(() => {
  return (
    <div className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Helmet>
        <title>Privacy Policy | NexTrack GPS Location Sharing</title>
        <meta name="description" content="NexTrack Privacy Policy — learn how we handle your data, location permissions, and what we never store. Your privacy is our foundation." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://locationtracker.app/privacy-policy" />
      </Helmet>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 bg-[#ece6da] border border-[#ded7ca] rounded-full px-4 py-1 text-xs text-stone-800 uppercase tracking-widest font-semibold mb-4">
            Legal Document
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-3 font-serif">
            Privacy Policy
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Effective Date: <span className="text-stone-700 font-medium">March 19, 2026</span> &nbsp;·&nbsp; Last Updated:{" "}
            <span className="text-stone-700 font-medium">March 19, 2026</span>
          </p>
        </div>

        {/* Alert box */}
        <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-6 mb-10 flex gap-4 items-start shadow-xs">
          <span className="text-2xl mt-0.5">🔒</span>
          <div>
            <p className="text-emerald-900 font-bold text-sm mb-1 font-serif">Your Privacy Comes First</p>
            <p className="text-emerald-800 text-xs sm:text-sm leading-relaxed">
              NexTrack <strong className="text-emerald-950 font-bold">only accesses your location with your explicit, informed consent.</strong> You are in full control at all times. We never track you silently, persistently in the background, or without permission.
            </p>
          </div>
        </div>

        <div className="surface-card border border-[#ded7ca] rounded-3xl p-8 sm:p-12 shadow-xs">

          <Section title="1. Introduction">
            <p>
              Welcome to <strong className="text-stone-900 font-bold">NexTrack</strong> ("we", "our", "us"). This Privacy
              Policy explains how we collect, use, store, and protect your information when you use our platform at{" "}
              <span className="text-stone-900 font-medium underline">locationtracker.app</span> (the "Service").
            </p>
            <p>
              By using our Service, you agree to the practices described in this Privacy Policy. If you do not agree,
              please do not use the Service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong className="text-stone-900 font-semibold">a) Account Information:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name and email address (when you register)</li>
              <li>Hashed password (never stored in plain text)</li>
            </ul>
            <p className="mt-4"><strong className="text-stone-900 font-semibold">b) Location Data (CONSENT-BASED ONLY):</strong></p>
            <p>
              This is the most sensitive data we handle. NexTrack accesses your geographic location{" "}
              <strong className="text-stone-900 font-bold">ONLY when:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You receive a tracking link and <strong className="text-stone-900 font-semibold">voluntarily open it</strong></li>
              <li>Your browser/device asks you to <strong className="text-stone-900 font-semibold">"Allow" location access</strong> and you grant it</li>
              <li>You are actively sharing — sharing stops the moment you close the page or deny permission</li>
            </ul>
            <p className="mt-3 p-3.5 bg-[#f7f4ed] rounded-xl border border-[#e7e0d3] text-xs text-stone-700 leading-relaxed">
              ⚠️ <strong className="text-stone-900">We never access background location.</strong> Location is only streamed
              in real time while the tracking page is open and permission is granted. We do not store precise location
              history.
            </p>
            <p className="mt-4"><strong className="text-stone-900 font-semibold">c) Usage & Technical Data:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Browser type, operating system, and device type</li>
              <li>IP address (for security and fraud prevention)</li>
              <li>Pages visited and feature interactions (aggregate analytics only)</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-2">
              <li>To create and manage your account</li>
              <li>To generate and verify secure tracking links</li>
              <li>To stream your real-time location to the requesting party (with your consent)</li>
              <li>To send you service-related emails (account verification, password reset)</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To improve and optimize our Service</li>
            </ul>
            <p>
              We <strong className="text-stone-900 font-bold">do not sell, rent, or trade</strong> your personal information or
              location data to any third party for commercial purposes.
            </p>
          </Section>

          <Section title="4. Consent & Location Tracking — In Detail">
            <p>
              The core of our Service is <strong className="text-stone-900 font-bold">consent-first location sharing.</strong> Here is
              exactly how it works:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                A registered user generates a tracking link from their dashboard and sends it to another person.
              </li>
              <li>
                The recipient (you) opens the link in their browser. A clear notice explains that location sharing is
                being requested.
              </li>
              <li>
                The browser natively prompts: <em>"Allow [site] to access your location?"</em> — you must click{" "}
                <strong className="text-stone-900 font-semibold">Allow</strong> for any sharing to begin.
              </li>
              <li>
                If you click <strong className="text-stone-900 font-semibold">Block</strong> or close the page, no location is ever
                transmitted. The process ends immediately.
              </li>
              <li>
                Sharing is <strong className="text-stone-900 font-semibold">real-time only</strong>. Once you close the tab or revoke
                browser permission, tracking ends instantly.
              </li>
            </ol>
          </Section>

          <Section title="5. Data Retention">
            <ul className="list-disc pl-5 space-y-2">
              <li>Account data is retained until you delete your account.</li>
              <li>Tracking requests (links) auto-expire and are purged from our database after expiry.</li>
              <li>Real-time location coordinates are <strong className="text-stone-900 font-bold">not permanently stored</strong> — they are only transmitted live via WebSocket.</li>
              <li>You may request deletion of your account and all associated data at any time by emailing us.</li>
            </ul>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All data is transmitted over HTTPS (TLS encryption)</li>
              <li>Passwords are hashed using bcrypt before storage</li>
              <li>Tracking tokens are UUID-based and cryptographically random</li>
              <li>WebSocket connections are authenticated and session-scoped</li>
            </ul>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the following rights regarding your data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-stone-900">Access:</strong> Request a copy of data we hold about you</li>
              <li><strong className="text-stone-900">Correction:</strong> Ask us to correct inaccurate data</li>
              <li><strong className="text-stone-900">Deletion:</strong> Request deletion of your account and all data</li>
              <li><strong className="text-stone-900">Withdraw Consent:</strong> Stop location sharing at any time by closing the tracking page or revoking browser permission</li>
              <li><strong className="text-stone-900">Portability:</strong> Request your data in a portable format</li>
            </ul>
          </Section>

          <Section title="8. Third-Party Services & Advertising">
            <p>We use the following trusted third-party services that may process limited data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-stone-900">Leaflet.js:</strong> Open-source mapping library (no data sent to Leaflet)</li>
              <li><strong className="text-stone-900">OpenStreetMap:</strong> Map tile provider (your IP may be visible when loading tiles)</li>
              <li><strong className="text-stone-900">Socket.IO:</strong> Real-time communication library</li>
            </ul>
          </Section>

          <Section title="9. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:
            </p>
            <div className="mt-3 bg-[#f7f4ed] border border-[#e7e0d3] rounded-2xl p-5 text-sm">
              <p className="text-stone-900 font-bold font-serif">NexTrack Privacy Desk</p>
              <p className="text-stone-800 font-mono mt-1">privacy@locationtracker.app</p>
              <p className="text-stone-500 text-xs mt-1">We respond to all privacy disclosures and inquiries within 72 hours.</p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
});

export default PrivacyPolicy;
