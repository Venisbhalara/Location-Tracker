# PROJECT DOCUMENTATION: Fix Google AdSense Policy Violation
# Site: location-trackers.vercel.app
# Issue: "Google-served ads on screens without publisher content"

---

## CONTEXT & PROBLEM

This site (location-trackers.vercel.app) is a location tracker web app deployed on Vercel.
Google AdSense has flagged it and suspended ads because:
- Pages show ads but lack sufficient written/editorial content
- The site functions as a pure tool/utility (map/tracker) with no articles or informational text
- Google requires meaningful publisher content alongside any ad placements

Goal: Fix the site so it passes AdSense review and never gets flagged again.

---

## TECH STACK (fill in your actual stack if different)

- Framework: [e.g. Next.js / React / Vue / plain HTML]
- Deployed on: Vercel
- Styling: [e.g. Tailwind CSS / CSS Modules]
- Language: [e.g. JavaScript / TypeScript]

---

## TASKS — IMPLEMENT ALL OF THE FOLLOWING

### TASK 1: Create a `/about` page

Create a new page at `/about` with the following:
- Minimum 400 words of real written content
- Explain what the location tracker does and who it is for
- Include an H1 heading, H2 subheadings, and multiple paragraphs
- DO NOT place any ads on this page until it has full content

Example content structure:
```
H1: About [Site Name]
H2: What We Do
  - 2-3 paragraphs explaining the tool
H2: Who Is This For?
  - 2-3 paragraphs about use cases
H2: Our Mission
  - 1-2 paragraphs
```

---

### TASK 2: Create a `/privacy-policy` page

AdSense requires a Privacy Policy. Create `/privacy-policy` with:
- What data is collected
- How cookies are used (including Google AdSense cookies)
- Third-party services used
- User rights and contact information
- Minimum 300 words

---

### TASK 3: Create a `/contact` page

Create `/contact` with:
- A contact form (name, email, message fields) OR a visible contact email
- Brief description of how to reach you
- At least 100 words of content

---

### TASK 4: Create a `/blog` or `/articles` section

This is the MOST IMPORTANT fix. Create a blog/articles section at `/blog` with:

**Index page (`/blog`):**
- List of at least 3 articles with title, excerpt, and link
- Minimum 200 words on the index page itself

**Individual article pages (`/blog/[slug]`):**
- Each article must be minimum 500 words
- Must have proper H1, H2, H3 heading hierarchy
- Must have relevant images with alt text
- Must have a publish date and author name

**Suggested article topics (write these):**
1. "How GPS Location Tracking Works" — explain GPS, accuracy, use cases
2. "Top 5 Use Cases for Location Trackers" — family safety, fleet, travel, etc.
3. "How to Share Your Real-Time Location Safely" — privacy tips, best practices
4. "Location Tracking vs GPS Tracking: What's the Difference?" — educational content
5. "A Beginner's Guide to Using [Your Site Name]" — tutorial for your tool

---

### TASK 5: Update the Homepage (`/`)

The homepage must have:
- A clear H1 heading describing what the site does
- At least 300 words of written content (not just the tool UI)
- A "How it works" section with steps
- A "Features" section with descriptions
- A "Use Cases" section
- Links to the blog/articles
- Ad units placed ONLY within content sections, never above the fold alone

---

### TASK 6: Add a Navigation Bar (if not present)

The site must have a proper navigation with links to:
- Home (`/`)
- About (`/about`)
- Blog (`/blog`)
- Privacy Policy (`/privacy-policy`)
- Contact (`/contact`)

---

### TASK 7: Add a Footer

Create a site-wide footer with:
- Copyright notice
- Links: Privacy Policy | Contact | About
- Year (dynamic, use `new Date().getFullYear()`)

---

### TASK 8: Fix AdSense Ad Placement

**REMOVE ads from:**
- Any page/screen that is ONLY a map
- Any page/screen that is ONLY a form (no surrounding content)
- Loading screens or error pages
- Pages with less than 300 words of content

**KEEP/ADD ads only on:**
- Blog article pages (place within content, not at top)
- About page (after full content is added)
- Homepage (only within content sections, not above the fold alone)

**Ad placement rules:**
- Never place more than 3 ad units per page
- Never place ads where content is minimal
- Ads must be surrounded by real content, not floating alone

---

### TASK 9: Add Structured Metadata (SEO)

For every page, add proper meta tags:
```html
<title>Page Title | Site Name</title>
<meta name="description" content="150-160 character description of the page" />
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Description" />
<meta property="og:type" content="website" />
<link rel="canonical" href="https://location-trackers.vercel.app/page-url" />
```

---

### TASK 10: Create a Sitemap

Create `/sitemap.xml` that includes all pages:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://location-trackers.vercel.app/</loc></url>
  <url><loc>https://location-trackers.vercel.app/about</loc></url>
  <url><loc>https://location-trackers.vercel.app/blog</loc></url>
  <url><loc>https://location-trackers.vercel.app/privacy-policy</loc></url>
  <url><loc>https://location-trackers.vercel.app/contact</loc></url>
</urlset>
```

---

## CONTENT QUALITY RULES (Must Follow)

When writing any content for this site, follow these rules:

1. Every page must have a unique H1 heading
2. Paragraphs must be real, readable sentences — no placeholder "Lorem ipsum"
3. Minimum word counts per page:
   - Homepage: 300 words
   - About: 400 words
   - Blog articles: 500 words each
   - Privacy Policy: 300 words
   - Contact: 100 words
4. Include at least one image per article (with descriptive alt text)
5. Use proper grammar and spelling — no AI-sounding filler text

---

## FINAL CHECKLIST (Do Not Submit AdSense Review Until All Are Done)

- [ ] `/about` page created with 400+ words
- [ ] `/privacy-policy` page created
- [ ] `/contact` page created
- [ ] `/blog` section with 3+ articles (500+ words each)
- [ ] Homepage has 300+ words of content
- [ ] Navigation bar links to all pages
- [ ] Footer added with legal links
- [ ] Ads removed from map-only and content-empty screens
- [ ] Ads placed only within content-rich pages
- [ ] Meta tags added to all pages
- [ ] Sitemap created at `/sitemap.xml`
- [ ] Site deployed and live on Vercel

---

## AFTER IMPLEMENTATION

Once all tasks above are complete and deployed:

1. Go to https://search.google.com/search-console
2. Verify site ownership for location-trackers.vercel.app
3. Submit sitemap: `https://location-trackers.vercel.app/sitemap.xml`
4. Go to Google AdSense → Sites → location-trackers.vercel.app
5. Check "I confirm that I have fixed the issues"
6. Click "Request review"
7. Wait 1–2 weeks for Google's decision

---

*This documentation was created to fix a Google AdSense content policy violation.
All tasks must be completed before requesting a policy review.*
