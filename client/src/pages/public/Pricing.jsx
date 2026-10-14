import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { createPaymentOrder, verifyPayment } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import SlotLifecycleVisual from "../../components/pricing/SlotLifecycleVisual";
import OdometerCounter from "../../components/common/OdometerCounter";
import SpecularCard from "../../components/common/SpecularCard";
import {
  OpticalReveal,
  OpticalStaggerContainer,
  OpticalStaggerItem,
} from "../../components/common/OpticalReveal";
import toast from "react-hot-toast";

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

const FAQItem = React.memo(({ faq, index, isOpen, onToggle }) => (
  <div className="surface-card rounded-xl border border-[#e7e0d3] overflow-hidden hover:border-stone-300 transition-colors">
    <button
      type="button"
      onClick={() => onToggle(index)}
      aria-expanded={isOpen}
      className="w-full px-6 py-4.5 text-left flex items-center justify-between text-stone-900 font-medium text-sm sm:text-base hover:text-indigo-700 transition-colors cursor-pointer"
    >
      <span>{faq.q}</span>
      <span
        className={`text-xl transition-transform duration-250 shrink-0 ml-4 ${
          isOpen ? "rotate-45 text-indigo-600" : "text-stone-400"
        }`}
        aria-hidden="true"
      >
        +
      </span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-5 text-sm text-stone-600 leading-relaxed border-t border-[#f0ece1] pt-3">
            {faq.a}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));

FAQItem.displayName = "FAQItem";

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
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://locationtracker.app/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Pricing",
      item: "https://locationtracker.app/pricing",
    },
  ],
};

const Pricing = React.memo(() => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState(0);

  React.useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentInitiate = React.useCallback(
    (planId) => {
      if (!isAuthenticated) {
        toast.error("Please sign in or create an account to recharge slots.");
        return;
      }
      const plan = plans.find((p) => p.id === planId);
      setSelectedPlan(plan);
      setShowModal(true);
    },
    [isAuthenticated]
  );

  const processCheckout = React.useCallback(async () => {
    if (!selectedPlan) return;
    const planId = selectedPlan.id;

    setLoading(planId);
    setShowModal(false);

    try {
      const res = await loadRazorpay();
      if (!res) {
        toast.error(
          "Payment SDK failed to load. Please verify your connection."
        );
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
              toast.success(
                "Payment verified! Slots added to your account balance."
              );
              window.location.href = "/dashboard";
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error(
              err.response?.data?.message || "Payment verification failed."
            );
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#1c1b18",
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
  }, [selectedPlan, user]);

  return (
    <>
      <Helmet>
        <title>NexTrack Pricing | One-Time GPS Tracking Slots — From ₹10</title>
        <meta
          name="description"
          content="Simple, pay-as-you-go pricing for GPS tracking slots. 5 to 25 slots from ₹10. No monthly subscriptions, real-time WebSocket telemetry, bank-grade encryption."
        />
        <link rel="canonical" href="https://locationtracker.app/pricing" />
        <meta
          property="og:title"
          content="NexTrack Pricing | From ₹10, No Subscriptions"
        />
        <meta
          property="og:description"
          content="One-time slot recharge for real-time GPS tracking. Instant activation, no lock-in."
        />
        <meta property="og:url" content="https://locationtracker.app/pricing" />
        <script type="application/ld+json">
          {JSON.stringify(schemaPricing)}
        </script>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>

      <div className="relative min-h-screen pt-10 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb Hierarchy */}
        <OpticalReveal distance={10}>
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs text-stone-500">
              <li>
                <Link to="/" className="hover:text-stone-900 transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-stone-300">/</li>
              <li className="text-stone-800 font-medium">Pricing</li>
            </ol>
          </nav>
        </OpticalReveal>

        {/* Page Header */}
        <OpticalReveal delay={0.05} distance={18}>
          <div className="glass-content-container rounded-3xl px-6 py-8 sm:px-10 sm:py-10 text-center w-full max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 eyebrow-pill mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Pay Once — Use When Needed</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 mb-4 font-serif">
              Transparent Pricing,{" "}
              <span className="italic font-normal text-stone-600">
                Zero Subscriptions
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-700 max-w-xl mx-auto leading-relaxed">
              Recharge your account with tracking slots. Each slot generates a
              secure tracking link that can be reused once expired or deleted.
            </p>
          </div>
        </OpticalReveal>

        {/* ── CLOSED-LOOP SLOT RECYCLING GRAPHIC ── */}
        <OpticalReveal delay={0.1} distance={20}>
          <SlotLifecycleVisual />
        </OpticalReveal>

        {/* ── PRICING CARDS HIERARCHY ── */}
        <OpticalStaggerContainer
          stagger={0.1}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto mb-20"
        >
          {plans.map((plan) => {
            const isFeatured = plan.isPopular;

            return (
              <OpticalStaggerItem
                key={plan.id}
                distance={20}
                className="h-full"
              >
                <div className="relative h-full">
                  {isFeatured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                      <span className="px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-stone-900 text-white shadow-sm">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <SpecularCard
                    className={`p-8 rounded-3xl h-full ${
                      isFeatured
                        ? "surface-elevated shadow-lg lg:-translate-y-2"
                        : "surface-card"
                    }`}
                  >
                    <div>
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-stone-900 mb-2 font-serif">
                          {plan.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed min-h-[40px]">
                          {plan.tagline}
                        </p>
                      </div>

                      {/* Price Block with Odometer Counter */}
                      <div className="mb-8 pb-6 border-b border-white/60">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
                            <OdometerCounter value={plan.price} prefix="₹" />
                          </span>
                          <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                            One-Time
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/45 border border-white/80 text-stone-800 text-xs font-semibold mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>
                            <OdometerCounter
                              value={plan.slots}
                              suffix=" High-Precision Slots"
                            />
                          </span>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-3.5 mb-8">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-3">
                          Included with plan:
                        </span>
                        {plan.features.map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 text-xs sm:text-sm text-stone-800"
                          >
                            <span className="w-4 h-4 rounded-full bg-white/55 border border-white/85 text-stone-800 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                              ✓
                            </span>
                            <span className="leading-snug">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card CTA */}
                    <div className="pt-4 border-t border-white/60">
                      <button
                        onClick={() => handlePaymentInitiate(plan.id)}
                        disabled={loading !== null}
                        className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isFeatured
                            ? "btn-cta-primary shadow-sm"
                            : "btn-cta-secondary"
                        }`}
                      >
                        {loading === plan.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          <span>Recharge {plan.name}</span>
                        )}
                      </button>
                    </div>
                  </SpecularCard>
                </div>
              </OpticalStaggerItem>
            );
          })}
        </OpticalStaggerContainer>

        {/* ── TRUST & INTEGRITY METRICS ── */}
        <OpticalReveal distance={16}>
          <div className="glass-content-container rounded-3xl w-full max-w-6xl mx-auto mb-20 p-6 sm:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/60">
              <div className="p-3">
                <div className="text-2xl mb-1">🔒</div>
                <h4 className="mx-auto text-sm font-semibold text-stone-900 mb-1">
                  Bank-Grade Security
                </h4>
                <p className="text-xs text-stone-600">
                  256-bit TLS encrypted data streams
                </p>
              </div>
              <div className="p-3 pt-6 md:pt-3">
                <div className="text-2xl mb-1">🌐</div>
                <h4 className="mx-auto text-sm font-semibold text-stone-900 mb-1">
                  Global Coverage
                </h4>
                <p className="text-xs text-stone-600">
                  Works anywhere with mobile browser
                </p>
              </div>
              <div className="p-3 pt-6 md:pt-3">
                <div className="text-2xl mb-1">⚡</div>
                <h4 className="mx-auto text-sm font-semibold text-stone-900 mb-1">
                  Instant Activation
                </h4>
                <p className="text-xs text-stone-600">
                  Slots credited immediately upon pay
                </p>
              </div>
              <div className="p-3 pt-6 md:pt-3">
                <div className="text-2xl mb-1">🛡️</div>
                <h4 className="mx-auto text-sm font-semibold text-stone-900 mb-1">
                  Zero Lock-In
                </h4>
                <p className="text-xs text-stone-600">
                  No recurring auto-debit cards
                </p>
              </div>
            </div>
          </div>
        </OpticalReveal>

        {/* ── FAQ SECTION ── */}
        <div className="max-w-3xl mx-auto">
          <OpticalReveal distance={18}>
            <div className="glass-content-container rounded-3xl px-6 py-6 sm:px-10 sm:py-7 text-center w-full max-w-3xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-serif">
                Pricing Questions Answered
              </h2>
              <p className="text-stone-700 text-sm mt-1">
                Everything you need to know about slot purchases and billing.
              </p>
            </div>
          </OpticalReveal>

          <OpticalStaggerContainer stagger={0.06} className="space-y-3">
            {faqs.map((faq, i) => (
              <OpticalStaggerItem key={i} distance={14}>
                <FAQItem
                  faq={faq}
                  index={i}
                  isOpen={activeFAQ === i}
                  onToggle={(idx) =>
                    setActiveFAQ(activeFAQ === idx ? null : idx)
                  }
                />
              </OpticalStaggerItem>
            ))}
          </OpticalStaggerContainer>
        </div>

        {/* ── CONFIRMATION MODAL ── */}
        <AnimatePresence>
          {showModal && selectedPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs"
                onClick={() => setShowModal(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-[#fcfaf6] w-full max-w-md p-8 sm:p-10 rounded-2xl border border-[#ded7ca] shadow-2xl z-10"
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#ece6da] border border-[#ded7ca] text-stone-800 flex items-center justify-center text-xl mx-auto mb-3">
                    💳
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 tracking-tight font-serif">
                    Order Confirmation
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Review your order before proceeding
                  </p>
                </div>

                {/* Order summary box */}
                <div className="surface-card p-5 rounded-xl border border-[#e7e0d3] mb-6 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-600">Plan</span>
                    <span className="text-stone-900 font-bold">
                      {selectedPlan.name} Tier
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-600">Credits Added</span>
                    <span className="text-emerald-700 font-bold">
                      +{selectedPlan.slots} Slots
                    </span>
                  </div>
                  <div className="h-px bg-[#e7e0d3] my-2" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-stone-700 font-medium text-sm">
                      Total Due
                    </span>
                    <span className="text-2xl font-extrabold text-stone-900">
                      ₹{selectedPlan.price}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={processCheckout}
                    className="btn-cta-primary w-full py-3.5 text-sm font-semibold justify-center"
                  >
                    Proceed to Secure Checkout →
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="btn-cta-secondary w-full py-3 text-xs font-medium justify-center text-stone-600"
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <span className="text-[11px] text-stone-500">
                    🔒 Bank-grade 256-bit encrypted checkout via Razorpay
                  </span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});

export default Pricing;
