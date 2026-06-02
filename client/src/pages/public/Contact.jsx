import { useState } from "react";
import { Helmet } from "react-helmet-async";

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

      <div className="min-h-screen py-16 px-4">
        <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-cyan-700/8 blur-3xl" />
        <div className="pointer-events-none fixed bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-700/8 blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex items-center gap-2 text-xs text-slate-500">
              <li><a href="/" className="hover:text-indigo-400 transition-colors">Home</a></li>
              <li className="text-slate-700">/</li>
              <li className="text-slate-400">Contact</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-14 text-center">
            <span className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-1.5 text-xs text-cyan-400 uppercase tracking-widest mb-5">
              Get In Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Contact{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                NexTrack Support
              </span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-base">
              Have a question, found a bug, or need help with your tracking setup? Our team responds
              within 24 hours on business days.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Info cards */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <address className="not-italic">
                {[
                  { icon: "📧", title: "General Support", value: "support@locationtracker.app", note: "Typical response: within 24 hours", color: "indigo" },
                  { icon: "🔒", title: "Privacy & Legal", value: "privacy@locationtracker.app", note: "Privacy requests answered within 72 hours", color: "purple" },
                  { icon: "🐛", title: "Bug Reports", value: "bugs@locationtracker.app", note: "Critical bugs triaged within 6 hours", color: "cyan" },
                ].map((c) => (
                  <div key={c.title} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300 mb-5 last:mb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl" aria-hidden="true">{c.icon}</span>
                      <h2 className="text-white font-semibold text-sm">{c.title}</h2>
                    </div>
                    <a href={`mailto:${c.value}`} className="text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors">{c.value}</a>
                    <p className="text-slate-600 text-xs mt-1">{c.note}</p>
                  </div>
                ))}
              </address>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-white font-semibold text-sm mb-2">🕐 Support Hours</h2>
                <p className="text-slate-400 text-sm">Monday – Friday</p>
                <p className="text-indigo-400 text-sm font-medium">9:00 AM – 6:00 PM IST</p>
                <p className="text-slate-600 text-xs mt-2">Closed on Indian public holidays</p>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center bg-slate-900/70 border border-slate-800 rounded-3xl p-10 text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-4xl mb-6">✅</div>
                  <h2 className="text-2xl font-bold text-white mb-3">Message Sent!</h2>
                  <p className="text-slate-400 text-sm max-w-xs">
                    Thank you for reaching out. We'll get back to you at{" "}
                    <span className="text-indigo-400">{form.email}</span> as soon as possible.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="nextrack-btn-ghost mt-8 text-sm px-6 py-2.5"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Send Us a Message</h2>
                  {error && (
                    <div className="mb-5 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label" htmlFor="contact-name">Your Name</label>
                        <input id="contact-name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required className="input" />
                      </div>
                      <div>
                        <label className="label" htmlFor="contact-email">Email Address</label>
                        <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required className="input" />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor="contact-subject">Subject</label>
                      <select id="contact-subject" name="subject" value={form.subject} onChange={handleChange} required className="input">
                        <option value="" disabled>Select a topic…</option>
                        <option value="general">General Question</option>
                        <option value="privacy">Privacy Concern</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="billing">Billing / Payment</option>
                        <option value="legal">Legal / Compliance</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="label" htmlFor="contact-message">Message</label>
                      <textarea id="contact-message" name="message" value={form.message} onChange={handleChange} placeholder="Describe your question or issue in detail…" required rows={5} className="input resize-none" />
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-xs text-slate-500">
                      🔒 Your message is sent securely. We never share your contact information with third parties.
                    </div>
                    <button type="submit" disabled={loading} className="nextrack-btn-primary w-full text-base py-3.5 disabled:opacity-60">
                      {loading ? "Sending…" : "Send Message →"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
