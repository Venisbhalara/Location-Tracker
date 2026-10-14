import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://locationtracker.app/" },
    { "@type": "ListItem", position: 2, name: "Contact", item: "https://locationtracker.app/contact" },
  ],
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact NexTrack",
  url: "https://locationtracker.app/contact",
  description: "Get in touch with NexTrack support for help with GPS tracking, privacy concerns, or bug reports.",
};

const Contact = memo(() => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Failed to send message. Please email us directly at support@locationtracker.app");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Helmet>
        <title>Contact NexTrack Support | GPS Location Tracking Help</title>
        <meta
          name="description"
          content="Reach NexTrack support for questions about real-time GPS location tracking, privacy concerns, or bug reports. We respond within 24 hours on business days."
        />
        <link rel="canonical" href="https://locationtracker.app/contact" />
        <meta property="og:title" content="Contact NexTrack | Get Help with GPS Location Tracking" />
        <meta property="og:description" content="Have a question or found a bug? Our team is ready to help. Reach us at support@locationtracker.app." />
        <meta property="og:url" content="https://locationtracker.app/contact" />
        <script type="application/ld+json">{JSON.stringify(contactSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>

      <div className="relative min-h-screen pt-10 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

        {/* Breadcrumb Hierarchy */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-stone-500">
            <li><Link to="/" className="hover:text-stone-900 transition-colors">Home</Link></li>
            <li className="text-stone-300">/</li>
            <li className="text-stone-900 font-medium">Contact</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="eyebrow-pill mb-4">Customer Support &amp; Technical Desk</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 mb-4 font-serif">
            We're Here to{" "}
            <span className="italic font-normal text-stone-600">
              Assist You
            </span>
          </h1>
          <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto leading-relaxed">
            Have a question, feedback, or need assistance with tracking links? Send us a message and our engineering team will respond promptly.
          </p>
        </div>

        {/* Grid Layout: Contact Info vs Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Support Information */}
          <div className="lg:col-span-5 surface-card p-6 sm:p-8 rounded-3xl border border-[#ded7ca] divide-y divide-[#e7e0d3] shadow-xs">
            <div className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-xl bg-[#ece6da] border border-[#ded7ca] text-stone-800 flex items-center justify-center text-sm shadow-inner">
                  ✉️
                </span>
                <h3 className="text-base font-bold text-stone-900 font-serif">Direct Email</h3>
              </div>
              <p className="text-xs text-stone-600 mb-2 leading-relaxed">For all inquiries, account issues, and billing queries.</p>
              <a href="mailto:support@locationtracker.app" className="text-sm font-semibold text-stone-800 hover:text-stone-950 transition-colors underline decoration-stone-300 underline-offset-4">
                support@locationtracker.app
              </a>
            </div>

            <div className="py-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center text-sm">
                  ⏱️
                </span>
                <h3 className="text-base font-bold text-stone-900 font-serif">Response Guarantee</h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Our support team is active Monday through Saturday. We review and answer technical inquiries within 24 hours.
              </p>
            </div>

            <div className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-xl bg-[#ece6da] border border-[#ded7ca] text-stone-800 flex items-center justify-center text-sm shadow-inner">
                  🛡️
                </span>
                <h3 className="text-base font-bold text-stone-900 font-serif">Security &amp; Privacy</h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                If you suspect security misuse or have privacy disclosures, reach our dedicated security desk at{" "}
                <span className="text-stone-900 font-semibold font-mono text-[11px]">security@locationtracker.app</span>.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="surface-card p-8 sm:p-10 rounded-3xl border border-[#ded7ca] shadow-xs">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center text-3xl mx-auto mb-4">
                    ✓
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-2 font-serif">Message Sent Successfully</h3>
                  <p className="text-sm text-stone-600 max-w-md mx-auto mb-6 leading-relaxed">
                    Thank you for reaching out. A support engineer will review your inquiry and follow up at <strong className="text-stone-900">{form.email}</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", subject: "", message: "" });
                    }}
                    className="btn-cta-secondary px-6 py-2.5 text-xs font-semibold"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-[#e7e0d3] pb-4 mb-2">
                    <h2 className="text-xl font-bold text-stone-900 font-serif">Send Us a Direct Message</h2>
                    <p className="text-xs text-stone-500 mt-1">Fill out the fields below and we'll reply to your email address.</p>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="contact-name">
                        Your Full Name
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        placeholder="Jane Doe"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full bg-white border border-[#ded7ca] rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="contact-email">
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full bg-white border border-[#ded7ca] rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="contact-subject">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      required
                      placeholder="What is this regarding?"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full bg-white border border-[#ded7ca] rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="contact-message">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Please provide details about your question, suggestion, or technical issue..."
                      value={form.message}
                      onChange={handleChange}
                      className="w-full bg-white border border-[#ded7ca] rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all resize-y"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-cta-primary w-full py-3.5 text-sm font-semibold justify-center shadow-xs"
                    >
                      {loading ? "Sending Message..." : "Submit Inquiry →"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
});

export default Contact;
