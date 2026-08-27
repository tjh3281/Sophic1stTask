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
