# GitHub Cleanup Plan for aaryanp35

Work top to bottom. Each section is a checklist. Repo visibility, fork status, and last push dates are from the October 2026 inventory.

## Do first

- [ ] Confirm the `Proxii` repo (public, empty, last push 2026-02) has no code, issues, or wiki you want, then delete it: repo Settings, Danger Zone, Delete this repository.
- [ ] Rename `Proxii-1` (public, last push 2026-04, the real Proxii app) to `Proxii`: Settings, General, Repository name.
- [ ] Update every link to the old name. GitHub redirects the old URL, but fix the references anyway: the profile README, the portfolio site, and any resume or LinkedIn entry.
- [ ] Check that the Vercel project behind proxii.vercel.app is still connected to the renamed repo under Settings, Git. The live URL does not change.
- [ ] Create the public profile repo `aaryanp35/aaryanp35` and commit the profile README as `README.md`.
- [ ] Upload a profile photo: profile menu, Your profile, Edit profile, profile picture.
- [ ] Production is Vercel: https://aaryanp35.vercel.app deploys from `main`. Vercel SSO protection is enabled on the project, so open the URL in a private window and, if a Vercel login wall appears, turn off Deployment Protection for production (Vercel project Settings, Deployment Protection) or add a custom domain.

## Substance

These items make the profile credible, not just tidy. Do them before the new pins go live.

- [ ] Create the public `athenaeum` repo: an architecture write-up, a diagram, and a small runnable slice (pgvector RAG over a toy corpus, a Dramaturg-style clarifying-question loop, the authorship ledger schema). Label it a sanitized public slice with no client data. Check with co-founder Shaan Jain before publishing.
- [ ] Create the public `ab-testing-payments-sim` repo with a notebook on synthetic data: experiment design, KPI definitions, a power analysis, and a sequential or CUPED analysis, with every assumption stated. Include the projected-GMV extrapolation and label the whole thing illustrative. This is the public artifact behind the $230M projection, with no DeUNA data. Link it from the profile README once published.
- [ ] Proxii README: state that the Ridge model is trained on labels produced by the rule-based score, so it calibrates to that score and is not validated. Add a "My contribution" line saying what you built and what collaborators built, since another contributor appears in the commit history.
- [ ] Resume and portfolio wording: make it match the code. Drop hedonic pricing, spatial econometrics, and sentiment unless the code adds them. Describe what exists instead, for example "POI-density neighborhood index with distance decay and Ridge calibration".
- [ ] Proxii repo: fix the two failing tests in `src/__tests__/CareersPage.test.jsx`, then delete the "known failing tests" note from its README.
- [ ] Proxii repo: untrack `.claude/`, `.agents/`, and the `.cursor/` skills symlink with `git rm -r --cached`, and add them to `.gitignore`.

## Pin

Pinned repos appear on your profile. Set them under Customize your pins, and drag to reorder. GitHub allows six.

- [ ] Pin `Proxii` (renamed from Proxii-1).
- [ ] Pin `firsthand`.
- [ ] Pin `csc111-auratune`.
- [ ] Pin `my-portfolio`.
- [ ] Pin the ECO225 research repo, https://github.com/ECO225-2026/eco225-project-aaryanp35. It lives in a course org, so either fork or mirror it into `aaryanp35` with a real README (research question, data, OLS with HC1 errors, random forest, one-sentence finding), or pin a public mirror instead.
- [ ] Pin `athenaeum` (the new public repo from Substance).

## Archive/delete

Rule of thumb: delete forks that hold none of your work, since deleting a fork does not touch the original. Archive anything with work of yours that just needs to stop changing. Archiving is reversible, deleting is not.

- [ ] Before changing the four course repos below, read the CSC207 and CSC111 academic integrity policies on posting course work publicly. Also confirm `csc111-auratune`, which stays pinned, is allowed to be public.
- [ ] Delete `lab-5` (public fork, 2025-11). Course lab, not a project. Archive instead if you wrote code there that you want to keep.
- [ ] Delete `lab2-multiset-adt` (public fork, 2025-09). Course lab. Same exception as above.
- [ ] Delete `lab2-branching-and-merging` (public fork, 2025-09). Course lab. Same exception as above.
- [ ] Delete `FizzBuzz` (public fork, 2025-09). Exercise, not a project.
- [ ] Delete `todo-list` (public fork, 2025-09). Fork, not original work. Check for commits of yours first.
- [ ] Delete `Trader` (public fork, 2025-09). Fork, not original work. Check for commits of yours first.
- [ ] Delete `dog-breed-fetcher` (public fork, 2025-10). Overlaps with the dogbreed work.
- [ ] Make `dog2` private (public, 2025-10). Course assignment solution, not a project.
- [ ] Make `dogbreed` private (public, 2025-10). Course starter scaffold with failing tests, not a project.
- [ ] Archive `csc111jamie-aaryan` (private, 2025-02). Old CSC111 repo from 2025. Archiving keeps the history read-only.
- [ ] Make `m4` and `m5regex` private (public, 2025-11, not forks). Both are course assignments.

Leave alone, no action needed: `quantaventuretool`, `secondbrain_lookacross`, `LiamMcFarland` (all private, recently pushed).

## Polish

- [ ] Add a description, website, and topics to each pinned repo. Suggested text:
  - `Proxii`: "Spatial economics app that scores gentrification risk." Website: https://proxii.vercel.app/. Topics: `spatial-economics`, `gentrification`, `risk-scoring`.
  - `firsthand`: "Turns a news article into a first-person counter-perspective story using Gemini." Topics: `gemini`, `news`, `storytelling`.
  - `csc111-auratune`: "Decision-tree music recommender over Spotify audio features, built for CSC111." Topics: `machine-learning`, `music`, `classification`.
  - `my-portfolio`: "Personal portfolio site." Website: https://aaryanp35.vercel.app. Topics: `portfolio`, `gsap`, `vercel`.
  - `eco225-project-aaryanp35` (or the mirror's name): "OLS and random forest analysis of 250K SFPD stops against Zillow home values." Topics: `econometrics`, `regression`, `random-forest`.
  - `athenaeum`: "Sanitized architecture write-up and runnable slice of an AI storytelling platform for filmmakers." Topics: `rag`, `pgvector`, `fastapi`.
- [ ] Confirm each pinned repo has a README that opens with a one-line summary and renders without broken links.
- [ ] Fill in the profile: name Aaryan Patel, location Menlo Park, CA, company DeUNA, website https://aaryanp35.vercel.app. Bio suggestion: "Associate PM at DeUNA. UofT Economics with Data Analytics."
- [ ] Set the public email under Settings, Emails so it matches the email in the profile README.
- [ ] Decide on the phone number in `resume.pdf` (tracked in my-portfolio). Either keep it, since a resume normally has one, or replace the file with a phone-free version. The site never shows the number. If my-portfolio goes public, the old file stays in git history, so replacing it alone does not remove the number.
- [ ] Confirm two-factor authentication is on: Settings, Password and authentication.
- [ ] Open your profile in a private browser window to confirm the README, photo, and pinned repos display for visitors.
