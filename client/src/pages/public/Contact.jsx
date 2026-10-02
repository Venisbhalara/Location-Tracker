import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AmbientBackground from "../../components/common/AmbientBackground";

const Contact = () => {
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
        <AmbientBackground />

        {/* Breadcrumb Hierarchy */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-slate-400">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li className="text-slate-600">/</li>
            <li className="text-indigo-300 font-medium">Contact</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="eyebrow-pill mb-4">Customer Support &amp; Inquiries</span>
          <h1 className="display-title mb-4">
            We're Here to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300">
              Help You
            </span>
          </h1>
          <p className="subheading-lead text-slate-300">
            Have a question, feedback, or need assistance with tracking links? Send us a message and our engineering team will assist.
          </p>
        </div>

        {/* Grid Layout: Contact Info (Secondary) vs Contact Form (Primary) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Support Information */}
          <div className="lg:col-span-5 surface-card p-6 sm:p-8 rounded-3xl border-white/[0.08] divide-y divide-white/[0.08]">
            <div className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-sm">
                  ✉️
                </span>
                <h3 className="text-base font-bold text-white">Direct Email</h3>
              </div>
              <p className="text-xs text-slate-400 mb-2.5">For all general inquiries, billing, and technical questions.</p>
              <a href="mailto:support@locationtracker.app" className="text-sm font-semibold text-indigo-300 hover:text-indigo-200 transition-colors">
                support@locationtracker.app
              </a>
            </div>

            <div className="py-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-sm">
                  ⏱️
                </span>
                <h3 className="text-base font-bold text-white">Response Guarantee</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our support team is active Monday through Saturday. We review and respond to inquiries within 24 hours.
              </p>
            </div>

            <div className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-sm">
                  🛡️
                </span>
                <h3 className="text-base font-bold text-white">Security &amp; Privacy</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                If you suspect security misuse or have privacy disclosures, reach our dedicated security desk at{" "}
                <span className="text-slate-300 font-medium">security@locationtracker.app</span>.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="surface-elevated p-8 sm:p-10 rounded-3xl border-white/10">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-4">
                    ✓
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Message Sent Successfully</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                    Thank you for reaching out. A support engineer will review your inquiry and follow up at <strong className="text-slate-200">{form.email}</strong>.
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
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-white/[0.06] pb-4 mb-2">
                    <h2 className="text-xl font-bold text-white">Send us a Message</h2>
                    <p className="text-xs text-slate-400 mt-1">Fill out the fields below and we'll reply to your email.</p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label" htmlFor="contact-name">Your Name</label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        placeholder="E.g. Jane Doe"
                        value={form.name}
                        onChange={handleChange}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="contact-email">Email Address</label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="contact-subject">Subject</label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      required
                      placeholder="What is this regarding?"
                      value={form.subject}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="contact-message">Message</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Please provide details about your question or issue..."
                      value={form.message}
                      onChange={handleChange}
                      className="input resize-y"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-cta-primary w-full py-3.5 text-sm font-semibold"
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
};

export default Contact;
