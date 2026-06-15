import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { blogArticles } from "./Blog";

/* ─────────────────────────────────────────────
   ARTICLE CONTENT — 500+ words each
───────────────────────────────────────────── */
const articleContent = {
  "how-gps-location-tracking-works": {
    body: (
      <div className="prose-content">
        <h2>What Is GPS and How Does It Work?</h2>
        <p>
          GPS stands for Global Positioning System, a network of over 30 satellites orbiting the Earth at approximately 20,200 kilometres above ground. These satellites are maintained by the United States government and transmit continuous radio signals containing precise timing data. Your smartphone's GPS chip receives signals from at least four satellites simultaneously and uses a mathematical process called trilateration to calculate your exact position on Earth.
        </p>
        <p>
          Each satellite signal travels at the speed of light, and by measuring tiny differences in the time it takes signals from different satellites to reach your device, your phone can pinpoint its location to within a few metres. The more satellites your device can "see," the more accurate the result. In open skies, modern smartphones routinely achieve accuracy between three and ten metres. Inside buildings or in urban canyons with tall structures, accuracy may drop to twenty or thirty metres as satellite signals bounce off surfaces.
        </p>

        <h2>The Three Pillars of Modern Location Technology</h2>
        <p>
          Smartphones do not rely on GPS alone. Modern location systems combine three complementary technologies to deliver fast, accurate positioning even in challenging environments.
        </p>
        <h3>1. GPS (Satellite-Based)</h3>
        <p>
          The gold standard for outdoor accuracy. GPS is highly precise but can take ten to forty seconds to acquire a signal from cold start — a process called Time To First Fix (TTFF). It also drains battery faster than other methods because the GPS chip must actively listen to multiple satellite frequencies at once.
        </p>
        <h3>2. Cell-Tower Triangulation</h3>
        <p>
          Your phone is constantly connected to nearby mobile network towers. By measuring signal strength from multiple towers, your carrier and device can estimate position within 100 to 300 metres. This method works indoors and underground but is significantly less precise than GPS. It is, however, extremely fast and battery-efficient.
        </p>
        <h3>3. Wi-Fi Positioning System (WPS)</h3>
        <p>
          Companies like Google and Apple maintain massive databases of Wi-Fi router locations gathered over years of mapping. When your phone detects a familiar router's MAC address, it can look up that router's known coordinates and place you within 15 to 40 metres — even without connecting to the network. WPS is the reason your phone seems to "know" where you are the moment you step indoors.
        </p>

        <h2>How NexTrack Uses Location Technology</h2>
        <p>
          When a recipient opens a NexTrack tracking link in their browser, the site uses the browser's built-in Geolocation API — a standard web interface that intelligently combines GPS, cell-tower, and Wi-Fi data to produce the most accurate reading available at that moment. The browser handles all the heavy lifting of fusing these data sources; NexTrack simply receives the resulting latitude, longitude, and accuracy radius.
        </p>
        <p>
          That coordinate is then transmitted via a WebSocket connection — a persistent, two-way channel between the recipient's browser and NexTrack's server. WebSockets are fundamentally different from traditional HTTP requests: instead of the tracker repeatedly asking "where are you?" every few seconds (which is slow and battery-intensive), the recipient's browser continuously pushes updates the moment the device's position changes. This is why NexTrack location updates appear in under one second on the tracking map — there is no polling, no delay.
        </p>

        <h2>Understanding GPS Accuracy Circles</h2>
        <p>
          On NexTrack's live map, you will notice a translucent circle surrounding the location marker. This circle represents the accuracy radius — the area within which the device is almost certainly located. A tight circle of five metres means high GPS confidence; a large circle of fifty metres means the system is relying more on Wi-Fi or cell-tower data and the position is less precise.
        </p>
        <p>
          Accuracy is affected by: how many satellites the device can see, local radio interference, cloud cover (minimally), dense building environments, and the quality of the device's GPS hardware. Flagship smartphones typically achieve better accuracy than budget devices because they include more sensitive antenna arrays.
        </p>

        <h2>Does Location Tracking Drain the Battery?</h2>
        <p>
          Continuous GPS usage does consume more battery than passive tasks — typically an additional 5–15% per hour of active tracking, depending on the device. NexTrack mitigates this by using the browser Geolocation API's built-in optimization options: the system requests high-accuracy mode only when necessary, and the browser itself manages how often it updates the position based on detected movement. When a user is stationary, updates slow down automatically; when they are moving, updates increase in frequency to keep the map current.
        </p>

        <h2>Privacy and Location: What NexTrack Never Does</h2>
        <p>
          Location data is among the most sensitive personal information that exists. Knowing where someone is at any given moment reveals their home, workplace, daily routines, religious attendance, medical visits, and relationships. NexTrack was designed from the ground up with these privacy implications in mind. Location coordinates are streamed live and never written to permanent storage. The moment a recipient closes the tracking page or revokes browser permission, location transmission stops completely and instantly. There is no background mode, no silent tracking, and no way to access someone's location without their explicit browser-level consent.
        </p>
        <p>
          Understanding how GPS works is the first step to understanding why consent-based tracking is so important. Location is not just a dot on a map — it is a window into a person's life. That is why NexTrack was built to put control firmly in the hands of the person being located.
        </p>
      </div>
    ),
  },

  "top-5-use-cases-for-location-trackers": {
    body: (
      <div className="prose-content">
        <h2>Why Real-Time Location Sharing Matters in 2026</h2>
        <p>
          Before dedicated location-sharing tools existed, keeping track of people you cared about meant constant phone calls, text check-ins, and hoping no one's phone was on silent. Today, live GPS tracking solves that problem instantly — but only when it is done with consent and transparency. Here are the five real-world scenarios where NexTrack users find the most value.
        </p>

        <h2>1. Family Safety — Knowing When Your Child Arrives Home</h2>
        <p>
          For parents, the gap between dropping a child off at school and receiving a "I'm home" text is filled with quiet anxiety. NexTrack eliminates that uncertainty. A parent generates a secure tracking link and shares it with their child before the school day. When the child opens the link on their phone during the journey home and allows location access, the parent can watch their route in real time on an interactive map.
        </p>
        <p>
          Unlike dedicated family tracking apps that require both parties to install software, create accounts, and maintain subscriptions, NexTrack works through a simple browser link. The child does not need an account. The link expires automatically after 24 hours, so there is no permanent surveillance — just a temporary, consensual window during the journey that matters. Parents of university students use the same method when their child is travelling to a new city alone for the first time.
        </p>

        <h2>2. Event Meetups — Finding Friends in Crowded Venues</h2>
        <p>
          Music festivals, sporting events, street fairs, and city-wide marathons all share one frustrating characteristic: mobile signal is overwhelmed and text messages arrive fifteen minutes late. "I'm near the main stage" becomes meaningless when there are fifty thousand people near the main stage.
        </p>
        <p>
          NexTrack's group tracking feature allows a group of friends to join a shared location session where every member's live position appears on a single map simultaneously. Instead of texting coordinates that nobody can interpret, everyone opens the group link and sees exactly where each person is. The organiser can say "meet me at the blue marker" and it works. Groups of hikers, cycling clubs, and sports teams use the same feature to stay coordinated across large outdoor areas where shouting is impractical.
        </p>

        <h2>3. Emergency Check-Ins — Sharing Location During Solo Travel</h2>
        <p>
          Solo travellers, late-night commuters, and anyone meeting a stranger for the first time (a date, a marketplace transaction, a job interview in an unfamiliar area) face a simple safety question: "Does someone I trust know exactly where I am right now?" With NexTrack, the answer can always be yes.
        </p>
        <p>
          Before getting into a rideshare, entering a building alone, or starting a hike in an unfamiliar trail system, a user generates a tracking link and sends it to a trusted contact. That contact does not need to do anything except open the link if something feels wrong. The live map shows the traveller's real-time route. If communication goes dark and the position stops updating, the contact knows to act. It is a safety net that costs nothing and requires no app installation on either end.
        </p>

        <h2>4. Field and Delivery Teams — Lightweight Fleet Visibility</h2>
        <p>
          Small businesses — plumbers, electricians, florists, food delivery operators, event staffing agencies — often need to know where their people are during working hours without the cost and complexity of enterprise fleet management software. Enterprise solutions can cost thousands of pounds per year and require dedicated hardware installed in vehicles.
        </p>
        <p>
          NexTrack offers a practical middle ground. A dispatcher generates tracking links for each driver or field agent at the start of the shift. Drivers open their assigned link on their personal phone — no app installation, no company device required — and the dispatcher watches all active positions on a shared group map. Routes are visible in real time, ETAs become accurate, and customer queries ("where is my delivery?") are answered with confidence. When the shift ends, the tracking session expires and no location data is retained.
        </p>

        <h2>5. Elderly Care — Peace of Mind for Families</h2>
        <p>
          Adult children caring for ageing parents face a delicate balance between safety and dignity. Permanently installed tracking devices can feel intrusive; requiring elderly parents to manage a smartphone app is often impractical. NexTrack offers a gentler approach.
        </p>
        <p>
          When an elderly family member goes for a walk, attends a medical appointment, or travels independently, a family member can share a tracking link via a simple SMS. The elderly person opens the link in their phone's browser — no account creation, no app — taps "Allow Location" once, and the family member has visibility for the duration of the outing. The session is temporary, consensual, and requires minimal technical ability. It restores independence while maintaining the safety net that both generations want.
        </p>

        <h2>The Common Thread: Consent and Transparency</h2>
        <p>
          Across all five use cases, the defining characteristic of NexTrack is that location sharing is always chosen, never imposed. The person being tracked initiates or actively agrees to the session by granting browser permission. They can end it at any moment by closing their tab. This design is not just a privacy nicety — it is the foundation of trust that makes location sharing genuinely useful rather than a source of anxiety and resentment. When people know they are in control, they willingly share their location more openly, which ultimately makes everyone safer.
        </p>
      </div>
    ),
  },

  "how-to-share-your-location-safely": {
    body: (
      <div className="prose-content">
        <h2>Why Location Privacy Deserves Careful Thought</h2>
        <p>
          Your real-time location is one of the most sensitive categories of personal data that exists. A stream of GPS coordinates over time reveals where you live, where you work, which doctor you visit, which places of worship you attend, and who you meet with privately. Before sharing your location with anyone — or using any application that requests location access — it is worth understanding exactly what you are sharing, with whom, and for how long.
        </p>
        <p>
          This guide gives you a practical framework for sharing location safely, identifies the warning signs of invasive tracking tools, and explains precisely how NexTrack's consent-based system protects your privacy by design.
        </p>

        <h2>The Golden Rules of Safe Location Sharing</h2>

        <h3>Rule 1: Always Share on Your Own Terms</h3>
        <p>
          Safe location sharing is active, not passive. You should be the one initiating or explicitly agreeing to every sharing session. If an app claims to share your location "automatically" or in the "background" without asking each time, treat this as a red flag. Legitimate tools ask for your permission every time — or at minimum, give you an obvious, accessible way to stop sharing at any moment.
        </p>

        <h3>Rule 2: Know Exactly What Is Being Shared</h3>
        <p>
          When you grant location access to any website or application, you are sharing your latitude, longitude, altitude (sometimes), and accuracy estimate. In most cases, this is all that is needed. However, some applications also collect: location history over days or weeks, movement patterns and inferred "home" and "work" addresses, device identifiers linked to your location, and data sold to third-party advertisers. Before agreeing, read what the application's privacy policy actually says — not just the marketing copy.
        </p>

        <h3>Rule 3: Share Only for the Duration You Need</h3>
        <p>
          Temporary location sharing is inherently safer than permanent location sharing. If you need someone to know where you are for a two-hour journey, share for two hours — not indefinitely. NexTrack tracking links expire after 24 hours by default, and you can delete them earlier from your dashboard to stop sharing immediately. Never leave a tracking session open beyond its purpose.
        </p>

        <h3>Rule 4: Share with People You Trust</h3>
        <p>
          This sounds obvious, but it is worth stating explicitly. Your live GPS position should only be visible to people whose intentions toward you are unambiguously good. Be especially careful with tracking tools that allow the requester to hide the tracking — a legitimate location-sharing tool shows both parties that sharing is active. If the person asking for your location seems evasive about why they need it, or refuses to share their own, pause before agreeing.
        </p>

        <h2>How to Revoke Location Access Instantly</h2>
        <p>
          In any browser on any device, you can revoke location access immediately:
        </p>
        <ul>
          <li><strong>Close the browser tab.</strong> This is the fastest method. Once the tracking page is closed, no further coordinates are transmitted. NexTrack has no background mode.</li>
          <li><strong>Deny location in the browser prompt.</strong> If the browser asks and you click Block, no location is ever shared.</li>
          <li><strong>Revoke site permissions in browser settings.</strong> On Chrome, go to Settings → Privacy and Security → Site Settings → Location. Find the site and remove its permission.</li>
          <li><strong>Disable location services at the device level.</strong> On iOS: Settings → Privacy → Location Services. On Android: Settings → Location → toggle off. This stops all location access across all apps and websites instantly.</li>
        </ul>

        <h2>Red Flags in Location Tracking Apps</h2>
        <p>
          Not all location-sharing tools are designed with your best interests in mind. Watch for these warning signs:
        </p>
        <ul>
          <li><strong>Background tracking without consent:</strong> If an app continues to report your location after you close it, that is a serious privacy violation.</li>
          <li><strong>No clear "stop sharing" button:</strong> Legitimate tools make it trivially easy to end a session. If stopping is buried in menus or requires contacting the other party, be suspicious.</li>
          <li><strong>Location history stored indefinitely:</strong> Some apps build permanent records of everywhere you have been. Ask whether data is deleted after each session.</li>
          <li><strong>Vague privacy policy language:</strong> Phrases like "we may share your data with trusted partners" are often cover for selling location data to advertisers or data brokers.</li>
          <li><strong>Required app installation for recipients:</strong> Requiring installation gives the app persistent device access far beyond the single tracking event.</li>
        </ul>

        <h2>How NexTrack Protects Your Privacy by Design</h2>
        <p>
          NexTrack was architected specifically to avoid every red flag listed above. Here is how each privacy principle is enforced technically, not just promised in a policy document:
        </p>
        <p>
          <strong>No background tracking:</strong> NexTrack is a web application, not a native app. Web pages cannot access your GPS in the background. The moment you close the NexTrack tracking tab, your browser's Geolocation API stops delivering coordinates — there is nothing for the server to receive.
        </p>
        <p>
          <strong>No location history storage:</strong> Location coordinates are transmitted via WebSocket and displayed on the tracking map in real time. They are never written to a database or log file. Once a session ends, the coordinates are gone permanently.
        </p>
        <p>
          <strong>Explicit browser consent every time:</strong> The browser itself — not NexTrack — asks for location permission. This is a hardware-level gate. NexTrack cannot bypass it, circumvent it, or remember it for future sessions unless the user explicitly saves the permission.
        </p>
        <p>
          <strong>Visible, instant stopping:</strong> Closing the tab is all it takes. There is no "are you sure?" prompt, no account to delete, no support ticket required.
        </p>

        <h2>A Quick Privacy Checklist Before You Share</h2>
        <p>Before opening any location-sharing link or granting location access to any site, run through this checklist:</p>
        <ul>
          <li>✅ Do I know who is requesting my location?</li>
          <li>✅ Do I understand why they need it?</li>
          <li>✅ Is the sharing temporary and time-limited?</li>
          <li>✅ Can I stop sharing immediately and easily?</li>
          <li>✅ Does the site have a clear privacy policy?</li>
          <li>✅ Is the site served over HTTPS (look for the padlock in your browser)?</li>
        </ul>
        <p>
          If you can answer yes to all six questions, sharing is likely safe. If any answer is no, ask for clarification before proceeding. Your location data is yours — protect it accordingly.
        </p>
      </div>
    ),
  },
};

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const BlogArticle = () => {
  const { slug } = useParams();
  const article = blogArticles.find((a) => a.slug === slug);
  const content = articleContent[slug];

  if (!article || !content) return <Navigate to="/blog" replace />;

  const schemaArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "NexTrack",
      url: "https://location-trackers.vercel.app",
    },
    datePublished: article.date,
    url: `https://location-trackers.vercel.app/blog/${article.slug}`,
  };

  const colorMap = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  };

  return (
    <>
      <Helmet>
        <title>{article.title} | NexTrack Blog</title>
        <meta name="description" content={article.excerpt} />
        <link rel="canonical" href={`https://location-trackers.vercel.app/blog/${article.slug}`} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:url" content={`https://location-trackers.vercel.app/blog/${article.slug}`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(schemaArticle)}</script>
      </Helmet>

      <div className="min-h-screen py-16 px-4 bg-[#0a0a10] relative overflow-hidden">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes blob {
            0% { transform: translate(0px,0px) scale(1); }
            33% { transform: translate(50px,-50px) scale(1.1); }
            66% { transform: translate(-40px,20px) scale(0.9); }
            100% { transform: translate(0px,0px) scale(1); }
          }
          .animate-blob { animation: blob 10s infinite alternate ease-in-out; }
          .animation-delay-2000 { animation-delay: 2s; }
          .bg-grid {
            background-size: 40px 40px;
            background-image: linear-gradient(to right,rgba(255,255,255,0.03) 1px,transparent 1px),
                              linear-gradient(to bottom,rgba(255,255,255,0.03) 1px,transparent 1px);
            mask-image: linear-gradient(to bottom,transparent,black 10%,black 90%,transparent);
            -webkit-mask-image: linear-gradient(to bottom,transparent,black 10%,black 90%,transparent);
          }
          .prose-content h2 {
            font-size: 1.35rem;
            font-weight: 700;
            color: #fff;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
          }
          .prose-content h3 {
            font-size: 1.05rem;
            font-weight: 600;
            color: #e2e8f0;
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
          }
          .prose-content p {
            color: #94a3b8;
            line-height: 1.85;
            margin-bottom: 1rem;
            font-size: 0.975rem;
          }
          .prose-content ul, .prose-content ol {
            color: #94a3b8;
            padding-left: 1.5rem;
            margin-bottom: 1rem;
            font-size: 0.975rem;
          }
          .prose-content li {
            margin-bottom: 0.4rem;
            line-height: 1.7;
          }
          .prose-content strong { color: #e2e8f0; }
        `}} />

        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div className="absolute inset-0 bg-grid opacity-70" />
          <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-indigo-600/20 blur-[100px] mix-blend-screen animate-blob" />
          <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full bg-purple-600/20 blur-[100px] mix-blend-screen animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li className="text-slate-700">/</li>
              <li><Link to="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
              <li className="text-slate-700">/</li>
              <li className="text-slate-400 truncate max-w-[200px]">{article.title}</li>
            </ol>
          </nav>

          {/* Article header */}
          <div className="mb-10">
            <span className={`inline-flex items-center border rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wider mb-5 ${colorMap[article.color]}`}>
              {article.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
              {article.title}
            </h1>
            <p className="text-slate-400 text-base leading-relaxed mb-6">{article.excerpt}</p>
            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 pb-8 border-b border-white/[0.06]">
              <span>✍️ {article.author}</span>
              <span>📅 {article.date}</span>
              <span>⏱ {article.readTime}</span>
            </div>
          </div>

          {/* Article body */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-7 sm:p-10 mb-10">
            {content.body}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Link to="/blog" className="nextrack-btn-ghost text-sm px-6 py-2.5">
              ← Back to Blog
            </Link>
            <Link to="/register" className="nextrack-btn-primary text-sm px-8 py-2.5">
              Try NexTrack Free →
            </Link>
          </div>

          {/* Related articles */}
          <div className="mt-14">
            <h2 className="text-lg font-bold text-white mb-6">More Articles</h2>
            <div className="flex flex-col gap-4">
              {blogArticles
                .filter((a) => a.slug !== slug)
                .map((a) => (
                  <Link
                    key={a.slug}
                    to={`/blog/${a.slug}`}
                    className="group flex items-start gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-300"
                  >
                    <span className="text-2xl flex-shrink-0">{a.icon}</span>
                    <div>
                      <p className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-300 transition-colors">
                        {a.title}
                      </p>
                      <p className="text-slate-500 text-xs">{a.readTime} · {a.date}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogArticle;
