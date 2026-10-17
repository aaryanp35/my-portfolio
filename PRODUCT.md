# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase: static HTML, CSS and JavaScript with no build step. Libraries only via pinned CDN URLs (GSAP 3.13 with ScrollTrigger, SplitText and MotionPathPlugin; Lenis 1.3). Deployed by Vercel from `main` to https://aaryanp35.vercel.app. Confirmed by the owner.

## Users

Primary: technical recruiters and hiring managers screening Aaryan Patel for 2027 internships and new-grad roles across product management (APM), data science, and AI engineering. The owner asked for a balanced profile rather than one of the three leading. They arrive from a resume link, LinkedIn, or GitHub, usually on a laptop and often on a phone, and decide in under ten seconds whether to keep reading. Secondary: founders, teammates, and collaborators checking who he is.

## Product Purpose

A personal site that shows who Aaryan is and what he has built, in his own voice, so a recruiter forms a warm and credible impression fast and reaches for the resume or email. Success is a recruiter who can name his current role, two of his projects, and one quality of his character after one visit, and who downloads the resume or sends a message.

## Positioning

A third-year University of Toronto student (Economics with Data Analytics, minors in Computer Science and Statistics) who has already shipped as an Associate Product Manager at a payments orchestration company (DeUNA), builds AI systems for defense wargaming (Strand Analytica), co-built an AI storytelling platform for indie filmmakers (Athenaeum), and ships his own products (Proxii, Firsthand). A varsity rower from Menlo Park, California. The combination of product ownership, applied data work, hands-on AI engineering, and athletic discipline at this stage is the claim a peer could not copy.

## Operating Context

Visited from a resume PDF, LinkedIn, GitHub profile, or a cold email. Read on laptops and phones, often in a recruiter's queue of many candidates. The resume PDF (`resume.pdf`) is the detailed, metric-bearing document; the site is the broad, human introduction that links to it.

## Capabilities and Constraints

- Single page: introduction, experience, selected work, a note on payments and defense work, athletics, education and skills, contact. Resume download is the one feature the owner marked as required.
- Headline items that must be prominent and clearly explained: DeUNA (payments ML optimizer, A/B testing, Associate PM), Athenaeum (AI storytelling platform, RAG, Dramaturg agent), Strand Analytica (AI wargaming for the UK Ministry of Defence and US Department of War), Proxii (spatial economics scoring app).
- Owner's content rule (confirmed): keep the website broad. Do not publish specific metrics, dollar figures, or data results on the site; those stay in the resume. Do not make the site read as fintech-focused.
- Confidentiality: DeUNA and Strand Analytica work is described at public, resume level only. No client details beyond what the resume states.
- Never publish the phone number on the site. The resume PDF is the owner's call.
- Must work without JavaScript (content visible), respect prefers-reduced-motion, and hold up at 360px wide. External resources only from pinned CDN URLs and Google Fonts.
- Optional, not required: a dark theme; the rotating multi-language word effect from the previous site (the owner liked it, and did not mark it as a must-keep).
- Undecided: whether the GitHub repo is renamed (Proxii-1 to Proxii), which affects project links later.

## Brand Commitments

- Name: Aaryan Patel. Voice: plainspoken, concrete, warm, slightly wry, first person where it is natural. No "passionate", no "leveraging", no em dashes anywhere in copy.
- Binding visual constraint volunteered by the owner: an indie California, Marin headlands, redwood hiker feel fused with product and tech craft, with the trail or field-notes metaphor allowed to show. The owner rejected the previous dark, glassy, neon-accent "instrument panel" look as generic AI output and wants bold, distinct work.
- Assets: portrait photo at night on the San Francisco Embarcadero (`images/profile.jpg`, `images/profile.webp`, `images/profile-square.jpg`), sunset-over-wave favicon set (`images/favicon.svg` and PNG sizes), OG image (`images/og-image.jpg`, may be regenerated to match the new world).

## Evidence on Hand

- Resume, October 2026: `resume.pdf` (source of truth for roles, dates, projects, skills; metrics live here and not on the site).
- Live projects: Proxii at https://proxii.vercel.app, repo https://github.com/aaryanp35/Proxii-1; Firsthand repo https://github.com/aaryanp35/firsthand; ECO225 paper (Google Doc) and code repo; Auratune and Meal Planner course repos.
- Athletics facts from the previous site: University of Toronto varsity rowing; Norcal Crew team captain 2020 to 2024; U.S. Rowing Olympic Development Program; STEM outreach via Stem to Stern Rowing.
- No testimonials, press, or logos are on hand; do not fabricate any.

## Product Principles

1. Warm first, credible immediately: a recruiter should feel they met a person, then see the proof.
2. Broad on the site, specific in the resume: the page names roles, problems, and what he built; numbers are one click away.
3. Structure does the convincing: dates, roles, and clear project framing read in a skim without hover or animation.
4. Personality with restraint: the Californian world is committed and recognizable, never a costume that slows reading.
5. Honest and public: nothing on the page that the resume or a public repo cannot back.
