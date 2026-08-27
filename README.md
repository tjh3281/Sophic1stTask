# Sophic Automation — website

A Next.js site for Sophic Automation: the four solution lines, the company,
partners, careers and community sections, and a contact form.

The original project brief and content notes are kept in
[`docs/brief.md`](docs/brief.md).

---

## 1. What you need first

| Tool       | Version         | Check with  | Where to get it                                    |
| ---------- | --------------- | ----------- | -------------------------------------------------- |
| **Node.js** | **20 or newer** | `node -v`   | <https://nodejs.org> — download the LTS installer   |
| **npm**     | comes with Node | `npm -v`    | installed with Node                                 |
| **Git**     | any recent      | `git --version` | <https://git-scm.com/downloads>                 |

Node 20 is the floor because Next 16 requires it. The live build runs on Node 22
(pinned in `netlify.toml`), so anything from 20 up is fine locally.

If `node -v` or `git --version` prints an error instead of a version, that tool
is not installed or not on your PATH — install it and open a **new** terminal
window, because a terminal that was already open will not see it.

---

## 2. Open the project on your computer

Open a terminal — Command Prompt, PowerShell, Git Bash or the terminal inside
VS Code — and run these one at a time.

**Get the code.** Only needed the first time:

```bash
git clone https://github.com/tjh3281/Sophic1stTask.git
cd Sophic1stTask
```

If you already have the folder, go into it and get the latest instead:

```bash
cd Sophic1stTask
git checkout main
git pull
```

**Install the dependencies.** Also mostly a first-time step — run it again
whenever `package.json` changes or you see "module not found" errors:

```bash
npm install
```

This creates a `node_modules` folder of roughly 500 MB. It is ignored by git and
never gets committed.

**Start the site:**

```bash
npm run dev
```

Leave that terminal running and open <http://localhost:3000> in your browser.
Edit any file, save, and the page updates on its own.

Press **Ctrl + C** in the terminal to stop the server.

### Optional: the contact advisor key

The contact page has an advisor that classifies enquiries. **You do not need
this to run the site** — with no key it falls back to a built-in keyword
classifier and everything else works normally.

To enable it, create a file named `.env.local` in the project root:

```
GEMINI_API_KEYS=your-key-here
```

`.env.local` is ignored by git, so your key stays on your machine. On the live
site the same value is set in the Netlify dashboard under
**Site configuration → Environment variables**, never in a committed file.

---

## 3. The commands you will use

| Command         | What it does                                                        |
| --------------- | ------------------------------------------------------------------- |
| `npm run dev`   | Development server at localhost:3000, reloads as you save            |
| `npm run build` | Production build — **the same one the live site runs**               |
| `npm start`     | Serves the production build locally (run `npm run build` first)      |
| `npm run lint`  | Checks code style and common mistakes                                |

---

## 4. Publishing your changes

There are two branches and they do different jobs:

| Branch      | What it is                                                        |
| ----------- | ------------------------------------------------------------------ |
| **`main`**  | The working branch. All normal work is committed here.              |
| **`netlify`** | **The live branch.** Netlify deploys whatever lands here.         |

The order matters: **commit to `main`, then update `netlify` from it.** Never
edit `netlify` directly — keeping it a copy of `main` is what stops the live
site and the working branch drifting apart.

### Step 1 — check the build before you publish

Publishing runs a build on Netlify. If that build fails, the site does not
update. Catch it locally first:

```bash
npm run build
```

Wait for `✓ Compiled successfully`. **If this fails, fix it before going
further** — pushing a broken build only fails again on the server.

### Step 2 — see what you changed

```bash
git status
```

Files listed under **"Changes not staged for commit"** are edits to existing
files. Files under **"Untracked files"** are new ones git has never seen — new
images and new pages both show up here, and they are only published if you add
them.

### Step 3 — stage and commit

To include everything you changed:

```bash
git add -A
git commit -m "Short description of what changed"
```

To be selective instead, name the paths:

```bash
git add lib/solutions.ts public/images/new-photo.jpg
git commit -m "Add the new product photo"
```

Write the message as what the change does, in a few words — `Add the Penang
Island Branch address`, not `update`. It is what you will be reading in six
months when you need to find when something changed.

### Step 4 — push `main`

```bash
git push origin main
```

Nothing is live yet. This only saves your work to GitHub.

### Step 5 — publish to the live site

```bash
git push origin main:netlify
```

Read that as "push my `main` onto the remote's `netlify`". Netlify sees the new
commit and starts building — it installs dependencies and runs `npm run build`
on its own servers, so it takes a few minutes rather than the few seconds the
build takes locally. Watch it in the Netlify dashboard under **Deploys**; the
site updates only when that deploy finishes green.

### The whole thing, once you know it

```bash
npm run build                      # confirm it compiles
git add -A
git commit -m "What changed"
git push origin main               # save to GitHub
git push origin main:netlify       # publish to the live site
```

---

## 5. When something goes wrong

**`git push` is rejected as "non-fast-forward" or "behind".**
Someone else pushed first. Get their work, then push again:

```bash
git pull --rebase origin main
npm run build
git push origin main
```

**`git push origin main:netlify` is rejected.**
`netlify` has a commit `main` does not. Look at what it has:

```bash
git fetch origin
git log --oneline origin/netlify ^main
```

If that lists anything, bring it into `main` first with
`git merge origin/netlify`, rebuild, and push again. **Do not use `--force`** —
on the live branch that throws work away.

**The site did not change after a push.**
Check three things in order: that `git log origin/netlify -1` shows your commit,
that the Netlify dashboard shows a deploy running or finished, and that the
deploy did not fail. A red deploy means the build broke on the server — the log
there names the file.

**`npm run dev` fails, or a module is missing.**
Usually stale dependencies after pulling. Reinstall:

```bash
npm install
```

If it persists, clear the build cache and try again:

```bash
rm -rf .next        # PowerShell: Remove-Item -Recurse -Force .next
npm run dev
```

**Port 3000 is already in use.**
An earlier server is still running. Close that terminal, or start on another
port with `npm run dev -- -p 3001`.

---

## 6. Where things live

```
app/                    Routes. Each folder with a page.tsx is a URL.
  solutions/            The four solution lines and everything under them
  api/                  Server routes for the contact advisor
components/             React components, grouped by the section that uses them
lib/                    Content and shared logic — see below
public/images/          Every image the site serves
docs/brief.md           The original project brief and content notes
netlify.toml            Live build settings, including the pinned Node version
```

Most content edits are in `lib/`, not in the pages:

| File               | Holds                                                    |
| ------------------ | -------------------------------------------------------- |
| `lib/solutions.ts` | The whole solutions tree: lines, categories, products     |
| `lib/contact.ts`   | Company details, office addresses, contact form options   |
| `lib/careers.ts`   | Job openings                                              |
| `lib/partners.ts`  | The partner network                                       |

`lib/partners.ts` has one catch worth knowing before you add or remove a
partner. The partners page draws them as a completed jigsaw, and a completed
jigsaw has no spare pieces: the three board layouts in `lib/partnerPuzzle.ts`
are pictures of the board, one letter per cell, and the letters for each group
have to number exactly the partners in it. Change the list without changing the
maps and the build stops with a message naming the group and both counts.

`lib/solutions.ts` is the single source for the solutions tree — the header
menu, the footer, breadcrumbs, the site search and the contact form's product
list all read from it. Adding a product there makes it appear in all of them;
what it does **not** do is create the page. A new product also needs a folder
under `app/solutions/…` containing a `page.tsx`, and the build will tell you if
you add one without the other.

---

## 7. Adding an image

Put the file in `public/images/` and reference it as `/images/your-file.jpg`
(no `public/` in the path).

Two conventions worth keeping:

- **Name it in lower case with hyphens** — `product-engineering-cover.jpg`, not
  `Product Engineering Cover.jpg`. Spaces and capitals in image paths cause
  problems that only show up on the live server.
- **Use JPG, PNG or WebP.** If you have a `.jfif` from a download, save it as
  `.jpg` first.

Cover images run the full width of the screen, so give them at least **1600 px**
of width. A smaller file will look soft when stretched.

New images are untracked until you `git add` them — a page that works locally
but shows a broken image once live is almost always an image that was never
committed.

---

## 8. Filling in the placeholders

Parts of the site are deliberately unfinished. Where the real wording and
photography have not arrived yet, the pages are built from obvious stand-ins —
pale blue blueprint images, and text reading `Technical Metric 1`, `Function 2`,
`Benefit 3`. That is on purpose: the page is laid out exactly as a finished one,
and which pages are still waiting is obvious at a glance instead of something
you have to know.

**Everything in this section is meant to be deleted.** Replacing a stand-in with
real content means removing the stand-in, not adding alongside it.

### What is still a placeholder

Counts as of writing — see *Checking what is left* below to recount at any time.

| What                                    | How many | Where                   |
| --------------------------------------- | -------- | ----------------------- |
| Product pages with no real content       | 30 of 37 | `lib/solutions.ts`      |
| Category "Why …?" benefit cards          | 8 of 12  | `lib/solutions.ts`      |
| Category cover photos                    | 8 of 12  | `public/images/`        |
| Product photos                           | 30       | `public/images/`        |
| Products with no description written     | 3        | `lib/solutions.ts`      |

The three with no description are Sophic's own products, where the source
material gave a name and nothing else:

- InnoLocker SMARTer
- OPENdot
- TofI Data Bridge

They read *"Sophic's own. Description to be written."* on the site. Nothing was
invented for them, so these need someone who knows the product.

### Finishing one product page

Open `lib/solutions.ts` and search for the product name. An unfinished one is a
single `placeholderSub(...)` call — four arguments: slug, title, summary, and
the page's URL:

```ts
placeholderSub(
  "andon-system",
  "Andon System",
  "Calls for help from the line, raised where the problem is and escalated until it is answered.",
  "/solutions/digitalised-solutions/factory-intelligence-monitoring-connectivity/andon-system",
),
```

**To fix only the one-line summary** — the sentence under the title, also used on
cards and in the header — edit the third argument in place. That is the smallest
useful improvement and takes seconds.

**To finish the whole page**, replace the call with a full entry. Keep `slug`,
`title` and `href` exactly as they were — `href` must keep matching the folder
under `app/solutions/…` or the build fails:

```ts
{
  slug: "andon-system",
  title: "Andon System",
  summary: "One line, as above.",
  href: "/solutions/digitalised-solutions/factory-intelligence-monitoring-connectivity/andon-system",

  image: "/images/andon-system.webp",
  imageFraming: "photo",

  metrics: [
    { label: "Response Time", values: [30], suffix: "s" },
    { label: "Stations Supported", values: [50, 200], separator: "–" },
  ],

  functions: [
    {
      icon: "chart",
      title: "What it does",
      description: "One sentence describing this capability.",
    },
  ],

  benefits: [
    {
      icon: "gauge",
      title: "Why it is worth having",
      image: "/images/andon-benefit-1.webp",
      points: ["First point.", "Second point."],
    },
  ],
}
```

Every field except the first four is optional, **and leaving one out removes its
section from the page rather than breaking it**. So you can add real metrics
today and real benefits next month; a page with two of the three simply shows
two.

Field notes:

- **`imageFraming`** — `"photo"` for a full-frame scene, which gets cropped and
  framed. `"cutout"` (the default, so just omit it) for a machine photographed
  on white, which gets floated on the page. Using `"cutout"` for a scene leaves
  it letterboxed with a shadow around a hard rectangle.
- **`metrics`** — `values` is one number, or two for a range with a `separator`.
  `prefix` is for a tolerance sign, `suffix` for the unit, `decimals` for how
  many places to hold. They animate counting up from zero, which is why they are
  numbers and not text. **Only put real figures here.** An invented spec is the
  one thing on these pages a customer could act on.
- **`functions` / `benefits` icons** — pick any name from the `GlyphName` list
  near the top of `lib/solutions.ts`: `package`, `barcode`, `tune`, `gauge`,
  `tag`, `cycle`, `laser`, `durable`, `arm`, `trays`, `sort`, `lens`, `chart`,
  `screen`, `compass`, `wrench`. They are line drawings, not tied to any one
  meaning, so choose whichever reads best.
- **`benefits[].image`** — each benefit card carries its own photo. Point it at a
  real one; leaving the shared `placeholder-benefit-1.webp` in place is what
  makes a half-finished page look finished.

For a model of a completed entry, look at **`laser-marking-equipment`** or
**`machine-vision`** in the same file. Seven products are already finished this
way.

### Finishing a category

A category with stand-in benefit cards has this line:

```ts
benefits: PLACEHOLDER_CATEGORY_BENEFITS,
```

Replace it with three or four real cards. These render over the cover photo, so
keep them short:

```ts
benefits: [
  {
    icon: "target",
    title: "Short claim",
    description: "One sentence backing it up.",
  },
],
```

The `icon` here is a different set from the one above — the animated
`BenefitIconName` list, also in `lib/solutions.ts`: `rocket`, `verified`,
`handshake`, `shield`, `target`, `connection`, `settings`, `customer`, `speed`,
`protection`, `savings`, `document`, `user`, `money-bag`.

Each of those needs two files in `public/images/` — `<name>.webp` and
`<name>-still.webp`. If you use a name whose artwork does not exist yet, add it
to `PENDING_ICONS` in `components/solutions/BenefitIcon.tsx` so it draws a
neutral shape instead of a broken image, and remove it from that list once the
files arrive.

### Replacing a placeholder image

The blueprint plates are the files named `placeholder-…` in `public/images/`.
There are two kinds:

- `placeholder-cover-<category>.webp` — the full-width photo behind a category
  page's title
- `placeholder-<product>.webp` — a product's own photo

You can either **point the entry at a new filename** (preferred — see
§7 for naming) or **overwrite the placeholder file** keeping its name, which
needs no code change at all.

Covers run the full width of the screen, so give them **1600 px or more**.
Product photos are shown much smaller; around 1200 px is plenty.

Once nothing references a `placeholder-…` file any more, delete it.

### Checking what is left

From the project folder:

```bash
git grep -c "placeholderSub(" lib/solutions.ts
```

That prints how many unfinished products remain — **subtract one**, because the
function's own definition is counted too. Today it prints `31`, so 30 products
are unfinished. Similarly:

```bash
git grep -c "PLACEHOLDER_CATEGORY_BENEFITS" lib/solutions.ts   # prints 9  -> 8 categories
git grep -c "UNDESCRIBED," lib/solutions.ts                     # prints 3  -> 3 products
```

The first two count their own definition line as well, so subtract one from
each. The third does not, because the trailing comma only appears where the
constant is used.

Once the first two are down to `1` and the third to `0`, nothing on the site is
a stand-in any more — at which point the placeholder constants at the top of
`lib/solutions.ts` and the leftover `placeholder-*.webp` files can all be
deleted.

### Publishing what you filled in

Same flow as §4. Check it builds, commit, then push to both branches:

```bash
npm run build                      # confirm it compiles
git add -A
git commit -m "Add real content for the Andon System page"
git push origin main               # save to GitHub
git push origin main:netlify       # publish to the live site
```

Two things this catches that a glance at the browser will not: a `href` that no
longer matches its folder, and a new image you forgot to `git add`. Run
`npm run build` before you push and both show up as errors instead of as a
broken page on the live site.
