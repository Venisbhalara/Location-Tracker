import { Helmet } from "react-helmet-async";
import AmbientBackground from "../../components/common/AmbientBackground";

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4 flex items-center gap-3 font-serif">
      <span className="w-1.5 h-6 rounded-full bg-stone-800 inline-block" />
      {title}
    </h2>
    <div className="text-stone-700 text-sm sm:text-base leading-relaxed space-y-3">{children}</div>
  </div>
);

const Terms = () => {
  return (
    <div className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Helmet>
        <title>Terms &amp; Conditions | NexTrack GPS Location Sharing</title>
        <meta name="description" content="NexTrack Terms and Conditions — understand your rights and obligations when using our real-time GPS location sharing platform." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://locationtracker.app/terms" />
      </Helmet>

      <AmbientBackground />

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 bg-[#ece6da] border border-[#ded7ca] rounded-full px-4 py-1 text-xs text-stone-800 uppercase tracking-widest font-semibold mb-4">
            Legal Agreement
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-3 font-serif">
            Terms &amp; Conditions
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Effective Date: <span className="text-stone-700 font-medium">March 19, 2026</span> &nbsp;·&nbsp; Last Updated:{" "}
            <span className="text-stone-700 font-medium">March 19, 2026</span>
          </p>
        </div>

        <div className="border border-amber-200 bg-amber-50/70 rounded-2xl p-6 mb-10 flex gap-4 items-start shadow-xs">
          <span className="text-2xl mt-0.5">⚖️</span>
          <div>
            <p className="text-amber-950 font-bold text-sm mb-1 font-serif">Please Read Carefully</p>
            <p className="text-amber-900 text-xs sm:text-sm leading-relaxed">
              By accessing or using NexTrack, you agree to be bound by these Terms & Conditions. If you do not
              agree, do not use the Service.
            </p>
          </div>
        </div>

        <div className="surface-card border border-[#ded7ca] rounded-3xl p-8 sm:p-12 shadow-xs">

          <Section title="1. Acceptance of Terms">
            <p>
              These Terms & Conditions ("Terms") govern your use of NexTrack (the "Service"), operated by
              NexTrack ("we", "us", "our"). By creating an account or using any part of the Service, you agree
              to these Terms in full.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              NexTrack is a web-based platform that allows registered users to generate secure tracking links
              and share them with contacts. When a contact opens the link and grants permission through their browser,
              their real-time location is transmitted to the link creator via WebSocket.
            </p>
            <p>
              The Service is designed for lawful purposes including: family safety, friend meet-ups, and personal
              coordination.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be at least <strong className="text-stone-900">13 years of age</strong> to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must provide accurate and truthful information when registering.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </Section>

          <Section title="4. Consent Obligations — Critical">
            <p>
              This is the most important section of these Terms. By using the tracking feature, you agree to the
              following consent obligations:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong className="text-stone-900 font-semibold">You MUST obtain informed consent</strong> from any person whose location
                you wish to track before sending them a tracking link.
              </li>
              <li>
                You must not deceive, mislead, or pressure any person into clicking a tracking link or granting location
                permission.
              </li>
              <li>
                You acknowledge that the browser natively requests location permission — the person must click "Allow"
                for any tracking to begin. <strong className="text-stone-900 font-semibold">We cannot and do not override browser
                permissions.</strong>
              </li>
              <li>
                Sending tracking links to people without their knowledge or for surveillance, stalking, or harassment
                purposes is a <strong className="text-stone-900 font-bold">violation of these Terms and may be illegal</strong> in
                your jurisdiction.
              </li>
            </ol>
            <div className="mt-4 border border-rose-200 bg-rose-50/70 rounded-xl p-4 text-xs text-rose-900 leading-relaxed">
              ❌ <strong className="font-bold">Prohibited:</strong> Using NexTrack to track anyone without their explicit consent.
              Violations result in immediate account termination and may be reported to relevant law enforcement authorities.
            </div>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree NOT to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Stalk, harass, or harm any person</li>
              <li>Track minors without parental consent</li>
              <li>Circumvent browser location permission dialogs</li>
              <li>Scrape, reverse-engineer, or exploit the Service</li>
              <li>Violate any applicable local, national, or international law</li>
              <li>Impersonate NexTrack or any other entity</li>
              <li>Attempt unauthorized access to any part of the Service or its infrastructure</li>
            </ul>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              All content, design, code, and branding associated with NexTrack are owned by us and protected
              by applicable intellectual property laws. You may not copy, modify, distribute, or create derivative
              works without our written permission.
            </p>
          </Section>

          <Section title="7. Disclaimer of Warranties">
            <p>
              The Service is provided on an <strong className="text-stone-900">"as is" and "as available" basis</strong>{" "}
              without warranties of any kind, either express or implied. We do not warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The Service will be uninterrupted, error-free, or secure</li>
              <li>Location data will be 100% accurate at all times (GPS accuracy depends on recipient device)</li>
              <li>The Service will meet your specific requirements</li>
            </ul>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, NexTrack shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including but not limited to loss of data,
              loss of privacy, or personal harm arising from misuse of the Service.
            </p>
            <p>
              You use the Service at your own risk. You are solely responsible for ensuring your use complies with all
              applicable laws, especially those relating to privacy and surveillance in your jurisdiction.
            </p>
          </Section>

          <Section title="9. Termination">
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time, with or without
              notice, for any violation of these Terms. You may also delete your account at any time from the
              dashboard settings.
            </p>
          </Section>

          <Section title="10. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of India. Any disputes arising
              from these Terms shall be subject to the exclusive jurisdiction of the courts of India.
            </p>
          </Section>

          <Section title="11. Contact">
            <div className="bg-[#f7f4ed] border border-[#e7e0d3] rounded-2xl p-5 text-sm">
              <p className="text-stone-900 font-bold font-serif">NexTrack Legal Desk</p>
              <p className="text-stone-800 font-mono mt-1">legal@locationtracker.app</p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
};

export default Terms;
