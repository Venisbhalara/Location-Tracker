import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { createPaymentOrder, verifyPayment } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import AmbientBackground from "../../components/common/AmbientBackground";

const plans = [
  {
    id: "plan_10",
    name: "Basic",
    price: 10,
    slots: 5,
    tagline: "Essential tracking for individuals and occasional check-ins.",
    features: [
      "5 Active tracking link slots",
      "24-Hour automatic link expiration",
      "Reusable slots upon expiry or deletion",
      "Standard email support",
    ],
    isPopular: false,
  },
  {
    id: "plan_20",
    name: "Professional",
    price: 20,
    slots: 15,
    tagline: "Most popular choice for families and frequent coordinators.",
    features: [
      "15 Active tracking link slots",
      "Route path history & address geocoding",
      "Reusable slots upon expiry or deletion",
      "Priority customer support",
    ],
    isPopular: true,
  },
  {
    id: "plan_30",
    name: "Enterprise",
    price: 30,
    slots: 25,
    tagline: "Maximum slot capacity for field teams and power users.",
    features: [
      "25 Active tracking link slots",
      "Multi-link group monitoring",
      "Reusable slots upon expiry or deletion",
      "Dedicated 24/7 priority support",
    ],
    isPopular: false,
  },
];

const faqs = [
  {
    q: "How do tracking slots work?",
    a: "Each slot allows you to create one unique tracking link. Once the link expires or is deleted by you, the slot returns to your balance for future use. You only recharge when you need more concurrent links.",
  },
  {
    q: "Is there an ongoing recurring subscription?",
    a: "No. NexTrack is 100% pay-as-you-go. You make a one-time purchase of tracking slots and use them at your own pace without automatic monthly renewals or unexpected fees.",
  },
  {
    q: "Can I use NexTrack internationally?",
    a: "Yes. Our telemetry engine leverages standard GPS satellite positioning and operates in all countries across modern mobile browsers.",
  },
  {
    q: "Is my tracking data secure and private?",
    a: "Completely. Location telemetry is streamed live over TLS/SSL encryption and never stored in permanent database records. Once you close the session, temporary coordinates disappear.",
  },
  {
    q: "Does the recipient need to download an app?",
    a: "No. Recipients simply tap the link on any mobile browser (Safari, Chrome, Firefox) and grant location permission. No installation or registration is needed.",
  },
  {
    q: "What is your refund policy?",
    a: "If you experience any technical impediment that prevents you from generating or sharing tracking links, please email support@locationtracker.app within 7 days and our team will assist or refund promptly.",
  },
];

const Pricing = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState(null);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentInitiate = (planId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in or create an account to recharge slots.");
      return;
    }
    const plan = plans.find((p) => p.id === planId);
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const processCheckout = async () => {
    if (!selectedPlan) return;
    const planId = selectedPlan.id;

    setLoading(planId);
    setShowModal(false);

    try {
      const res = await loadRazorpay();
      if (!res) {
        toast.error("Payment SDK failed to load. Please verify your connection.");
        setLoading(null);
        return;
      }

      const { data } = await createPaymentOrder({ planId });
      if (!data.success) {
        toast.error(data.message || "Failed to initialize payment.");
        setLoading(null);
        return;
      }

      const { order, key_id } = data;

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "NexTrack Location",
        description: `Recharge: ${selectedPlan.slots} tracking slots`,
        image: "/location.png",
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await verifyPayment(response);
            if (verifyRes.data.success) {
              toast.success("Payment verified! Slots added to your account balance.");
              window.location.href = "/dashboard";
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error(err.response?.data?.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Payment checkout could not be started.");
    } finally {
      setLoading(null);
    }
  };

  const schemaPricing = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://locationtracker.app/" },
      { "@type": "ListItem", position: 2, name: "Pricing", item: "https://locationtracker.app/pricing" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>NexTrack Pricing | One-Time GPS Tracking Slots — From ₹10</title>
        <meta
          name="description"
          content="Simple, pay-as-you-go pricing for GPS tracking slots. 5 to 25 slots from ₹10. No monthly subscriptions, real-time WebSocket telemetry, bank-grade encryption."
        />
        <link rel="canonical" href="https://locationtracker.app/pricing" />
        <meta property="og:title" content="NexTrack Pricing | From ₹10, No Subscriptions" />
        <meta property="og:description" content="One-time slot recharge for real-time GPS tracking. Instant activation, no lock-in." />
        <meta property="og:url" content="https://locationtracker.app/pricing" />
        <script type="application/ld+json">{JSON.stringify(schemaPricing)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>

      <div className="relative min-h-screen pt-10 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AmbientBackground />

        {/* Breadcrumb Hierarchy */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-slate-400">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li className="text-slate-600">/</li>
            <li className="text-indigo-300 font-medium">Pricing</li>
          </ol>
        </nav>

        {/* Page Header (PRIMARY MESSAGE) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 eyebrow-pill mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Pay Once — Use When Needed</span>
          </div>

          <h1 className="display-title mb-4">
            Transparent Pricing,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300">
              Zero Subscriptions
            </span>
          </h1>

          <p className="subheading-lead text-slate-300 max-w-xl mx-auto">
            Recharge your account with tracking slots. Each slot generates a secure tracking link that can be reused once expired or deleted.
          </p>
        </div>

        {/* ── PRICING CARDS HIERARCHY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto mb-20">
          {plans.map((plan) => {
            const isFeatured = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between p-8 rounded-3xl transition-all duration-300 ${
                  isFeatured
                    ? "surface-elevated ring-1 ring-indigo-400/40 lg:-translate-y-2 relative"
                    : "surface-card hover:border-white/20"
                }`}
              >
                {/* Visual Badge for Primary Choice */}
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md border border-white/20">
                      Most Popular
                    </span>
                  </div>
                )}

                <div>
                  {/* Tier Title & Tagline */}
                  <div className="mb-6">
                    <h3 className="card-title text-xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed min-h-[40px]">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price Block (STRONG VISUAL PROMINENCE) */}
                  <div className="mb-8 pb-6 border-b border-white/[0.08]">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                        ₹{plan.price}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        One-Time
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {plan.slots} High-Precision Slots
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                      Included with plan:
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                        <span className="w-4 h-4 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                          ✓
                        </span>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA (HERO CARD HAS PRIMARY ACTION, OTHERS HAVE SECONDARY) */}
                <div className="pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => handlePaymentInitiate(plan.id)}
                    disabled={loading !== null}
                    className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isFeatured
                        ? "btn-cta-primary shadow-lg"
                        : "btn-cta-secondary"
                    }`}
                  >
                    {loading === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span>Recharge {plan.name}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── TRUST & INTEGRITY METRICS (BORDERLESS PROOF STRIP) ── */}
        <div className="max-w-5xl mx-auto mb-20 pt-8 border-t border-white/[0.08]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
            <div className="p-3">
              <div className="text-2xl mb-1">🔒</div>
              <h4 className="text-sm font-semibold text-white mb-1">Bank-Grade Security</h4>
              <p className="text-xs text-slate-400">256-bit TLS encrypted data streams</p>
            </div>
            <div className="p-3 pt-6 md:pt-3">
              <div className="text-2xl mb-1">🌐</div>
              <h4 className="text-sm font-semibold text-white mb-1">Global Coverage</h4>
              <p className="text-xs text-slate-400">Works anywhere with mobile browser</p>
            </div>
            <div className="p-3 pt-6 md:pt-3">
              <div className="text-2xl mb-1">⚡</div>
              <h4 className="text-sm font-semibold text-white mb-1">Instant Activation</h4>
              <p className="text-xs text-slate-400">Slots credited immediately upon pay</p>
            </div>
            <div className="p-3 pt-6 md:pt-3">
              <div className="text-2xl mb-1">🛡️</div>
              <h4 className="text-sm font-semibold text-white mb-1">Zero Lock-In</h4>
              <p className="text-xs text-slate-400">No recurring auto-debit cards</p>
            </div>
          </div>
        </div>

        {/* ── FAQ SECTION ── */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="section-title">Pricing Questions Answered</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="surface-card rounded-xl border border-white/[0.08] overflow-hidden"
              >
                <button
                  onClick={() => setActiveFAQ(activeFAQ === i ? null : i)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between text-white font-medium text-sm sm:text-base hover:text-indigo-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className={`text-xl transition-transform duration-200 ${activeFAQ === i ? "rotate-45 text-indigo-400" : "text-slate-400"}`}>
                    +
                  </span>
                </button>
                {activeFAQ === i && (
                  <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── CONFIRMATION MODAL WITH CLEAR ACTION HIERARCHY ── */}
        {showModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowModal(false)}
            />

            <div className="relative surface-elevated w-full max-w-md p-8 sm:p-10 rounded-3xl border-indigo-500/50 shadow-2xl z-10">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-xl mx-auto mb-3">
                  💳
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Order Confirmation</h3>
                <p className="text-xs text-slate-400 mt-1">Review your order before proceeding</p>
              </div>

              {/* Order summary box */}
              <div className="surface-card p-5 rounded-2xl border-white/10 mb-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Plan</span>
                  <span className="text-white font-bold">{selectedPlan.name} Tier</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Credits Added</span>
                  <span className="text-emerald-400 font-bold">+{selectedPlan.slots} Slots</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-300 font-medium text-sm">Total Due</span>
                  <span className="text-2xl font-extrabold text-white">₹{selectedPlan.price}</span>
                </div>
              </div>

              {/* Action Buttons: Primary vs Secondary */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={processCheckout}
                  className="btn-cta-primary w-full py-3.5 text-sm font-semibold"
                >
                  Proceed to Secure Checkout →
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-cta-secondary w-full py-3 text-xs font-medium text-slate-400"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-6 text-center">
                <span className="text-[11px] text-slate-500">
                  🔒 Bank-grade 256-bit encrypted checkout via Razorpay
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Pricing;
