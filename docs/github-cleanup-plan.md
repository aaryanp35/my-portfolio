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

## Pin

Pinned repos appear on your profile. Set them under Customize your pins, and drag to reorder. GitHub allows six.

- [ ] Pin `Proxii` (renamed from Proxii-1).
- [ ] Pin `firsthand`.
- [ ] Pin `csc111-auratune`.
- [ ] Pin `CSC207-Project-Meal-Planner`. It is a fork, so make sure its description says it is your implementation and not a course starter.
- [ ] Pin `my-portfolio`.
- [ ] Pin one more repo of your choice. Pick a public, non-fork repo that shows original work. `dogbreed` is a good candidate if you keep it (see Archive/delete). Skip any repo you cannot describe in one line.

## Archive/delete

Rule of thumb: delete forks that hold none of your work, since deleting a fork does not touch the original. Archive anything with work of yours that just needs to stop changing. Archiving is reversible, deleting is not.

- [ ] Delete `lab-5` (public fork, 2025-11). Course lab, not a project. Archive instead if you wrote code there that you want to keep.
- [ ] Delete `lab2-multiset-adt` (public fork, 2025-09). Course lab. Same exception as above.
- [ ] Delete `lab2-branching-and-merging` (public fork, 2025-09). Course lab. Same exception as above.
- [ ] Delete `FizzBuzz` (public fork, 2025-09). Exercise, not a project.
- [ ] Delete `todo-list` (public fork, 2025-09). Fork, not original work. Check for commits of yours first.
- [ ] Delete `Trader` (public fork, 2025-09). Fork, not original work. Check for commits of yours first.
- [ ] Delete `dog-breed-fetcher` (public fork, 2025-10). Overlaps with the dogbreed work.
- [ ] Delete `dog2` (public, 2025-10). Duplicates `dogbreed`, which has the same subject and last push date. Diff the two first, and move over anything `dog2` has that `dogbreed` lacks. This plan keeps `dogbreed`, since its name is cleaner.
- [ ] Archive `csc111jamie-aaryan` (private, 2025-02). Old CSC111 repo from 2025. Archiving keeps the history read-only.
- [ ] Check `m4` and `m5regex` (public, 2025-11, not forks). If either is a course assignment, archive it. If it is a project, leave it alone.

Leave alone, no action needed: `quantaventuretool`, `secondbrain_lookacross`, `LiamMcFarland` (all private, recently pushed).

## Polish

- [ ] Add a description, website, and topics to each pinned repo. Suggested text:
  - `Proxii`: "Spatial economics app that scores gentrification risk." Website: https://proxii.vercel.app/. Topics: `spatial-economics`, `gentrification`, `risk-scoring`.
  - `firsthand`: "Turns a news article into a first-person counter-perspective story using Gemini." Topics: `gemini`, `news`, `storytelling`.
  - `csc111-auratune`: "Music mood classifier built for CSC111." Topics: `machine-learning`, `music`, `classification`.
  - `CSC207-Project-Meal-Planner`: "Java meal planner built on Clean Architecture (CSC207)." Topics: `java`, `clean-architecture`.
  - `my-portfolio`: "Personal portfolio site." Website: https://aaryanp35.vercel.app. Topics: `portfolio`, `gsap`, `vercel`.
  - Sixth pin: write a one-line description once you pick it.
- [ ] Confirm each pinned repo has a README that opens with a one-line summary and renders without broken links.
- [ ] Fill in the profile: name Aaryan Patel, location Menlo Park, CA, company DeUNA, website https://aaryanp35.vercel.app. Bio suggestion: "Associate PM at DeUNA. UofT Economics with Data Analytics."
- [ ] Set the public email under Settings, Emails so it matches the email in the profile README.
- [ ] Confirm two-factor authentication is on: Settings, Password and authentication.
- [ ] Open your profile in a private browser window to confirm the README, photo, and pinned repos display for visitors.
