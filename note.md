# Learning Next.js through this project

A walk through the 2026 Next.js guide, with every concept tied to a real file in
this repo — and a note on which parts this project **doesn't** use yet, because
knowing what's absent is half of understanding a framework.

- **Next.js** 16.2.12 · **React** 19.2.4 · App Router · Turbopack · TypeScript · Tailwind CSS v4
- Local docs: `node_modules/next/dist/docs/index.md`

---

## 0. Orientation: what this project actually exercises

The guide covers the whole framework. This site is a static marketing prototype,
so it uses maybe a third of it — deeply. Here's the honest map.

| Guide topic                        | In this project? | Where                                                                                                                                                  |
| ---------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Server Components (default)        | ✅ Heavily       | Every file without `"use client"`                                                                                                                      |
| Client Components (`"use client"`) | ✅ 8 files       | [Header.tsx](components/layout/Header.tsx), [HeroScene.tsx](components/home/HeroScene.tsx), [MetricValue.tsx](components/solutions/MetricValue.tsx), … |
| `layout.tsx` nesting               | ✅ Two levels    | [app/layout.tsx](app/layout.tsx), [app/solutions/layout.tsx](app/solutions/layout.tsx)                                                                 |
| `page.tsx`                         | ✅ 12 of them    | [app/page.tsx](app/page.tsx) + 11 under `app/solutions/`                                                                                               |
| Metadata API                       | ✅               | [app/layout.tsx](app/layout.tsx), `solutionMetadata()` in [SolutionOverviewPage.tsx](components/solutions/SolutionOverviewPage.tsx)                    |
| Static rendering (SSG)             | ✅ All 14 routes | `npm run build` output — every route marked `○`                                                                                                        |
| `next/image`                       | ✅               | Covers, hero, cards                                                                                                                                    |
| Dynamic routes `[id]`              | ❌               | Folders are hardcoded — see §2                                                                                                                         |
| `generateStaticParams`             | ❌               | Not needed without dynamic segments                                                                                                                    |
| Server Actions                     | ❌               | No forms, no mutations                                                                                                                                 |
| Route Handlers (`route.ts`)        | ❌               | No API surface                                                                                                                                         |
| `use cache` / `cacheComponents`    | ❌               | Nothing to cache — see §4                                                                                                                              |
| `proxy.ts`                         | ❌               | No auth, no redirects                                                                                                                                  |
| `loading.tsx` / `error.tsx`        | ❌               | Nothing async can fail yet                                                                                                                             |
| Authentication                     | ❌               | Public site                                                                                                                                            |

> **The single most useful takeaway:** this project is proof that a large,
> animated, image-heavy site can be built with _zero_ data fetching, zero
> caching config, and zero client-side state management. Reach for those tools
> when a real requirement arrives, not by default.

---

## 1. Server Components vs Client Components

### The default is server

Every React file here is a Server Component unless it says otherwise. They run
**only** at build time (or on the server), and never ship to the browser.

[TechnicalMetrics.tsx](components/solutions/TechnicalMetrics.tsx) is a good
example. It maps over data, builds a marquee, and none of its code reaches the
browser:

```tsx
// No "use client" — this is a Server Component.
export function TechnicalMetrics({ metrics }: { metrics: Metric[] }) {
  const items = metrics.map((metric) => (
    <dl key={metric.label} className="flex flex-col-reverse px-8 sm:px-10">
      <dt>{metric.label}</dt>
      <dd><MetricValue values={metric.values} … /></dd>
    </dl>
  ));
  …
}
```

### The boundary is the whole skill

The guide's most important rule: **keep the client boundary as small as
possible.** This project follows it precisely, and `TechnicalMetrics` is the
clearest demonstration.

The section needs one interactive thing: numbers that count up on scroll. So
_only_ the number is a Client Component:

```
TechnicalMetrics   (server) — heading, marquee, layout, gradient classes
└── MetricValue    (client) — IntersectionObserver + requestAnimationFrame
```

The naive version would put `"use client"` at the top of `TechnicalMetrics`.
That works, but then the heading, the `<dl>` markup, the duplicate marquee
track and all the class strings get compiled into the browser bundle for no
reason. Splitting it means the browser downloads only the counting logic.

Every client file here earns it:

| File                                                                                                       | Why it must be a Client Component            |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [Header.tsx](components/layout/Header.tsx)                                                                 | `usePathname()`, `useState`, scroll listener |
| [HeroScene.tsx](components/home/HeroScene.tsx)                                                             | `requestAnimationFrame` scroll scrubbing     |
| [Reveal.tsx](components/ui/Reveal.tsx)                                                                     | `IntersectionObserver`                       |
| [MetricValue.tsx](components/solutions/MetricValue.tsx)                                                    | `IntersectionObserver` + rAF                 |
| [BenefitIcon.tsx](components/solutions/BenefitIcon.tsx)                                                    | `useState` to swap in the animated file      |
| [useScrolled.ts](lib/useScrolled.ts)                                                                       | `useSyncExternalStore`                       |
| [SolutionsMenu.tsx](components/layout/SolutionsMenu.tsx), [MobileNav.tsx](components/layout/MobileNav.tsx) | Open/close state                             |

### A real bug this project hit at the boundary

This is worth internalising, because the guide doesn't warn about it and the
symptom is bizarre.

`"use client"` doesn't just mark a component — it marks the **whole module**.
Anything exported from that file becomes a _client reference_ when a Server
Component imports it. Not the value. A reference.

The gradient class string was originally exported from `MetricValue.tsx` (a
client module) and imported by `TechnicalMetrics.tsx` (a server module). It
compiled. It passed lint. And the rendered HTML contained:

```html
<dd
  class='text-5xl … function(){throw Error("Attempted to call
FIGURE_GRADIENT() from the server but FIGURE_GRADIENT is on the client…")}'
></dd>
```

React stringified the client stub straight into the `class` attribute.

The fix was to move the constant into its own plain module,
[figureGradient.ts](components/solutions/figureGradient.ts), which has no
directive and so can be imported safely from both sides:

> **Rule of thumb:** values shared across the boundary belong in a neutral
> module. A file with `"use client"` should export components, not constants,
> types, or helpers.

### What crosses the boundary must be serializable

`TechnicalMetrics` (server) passes props into `MetricValue` (client):

```tsx
<MetricValue
  values={metric.values}
  decimals={metric.decimals}
  suffix={metric.suffix}
/>
```

Numbers, strings, arrays — all fine. A function or a class instance would throw.
This is why the metric data is plain objects in [lib/solutions.ts](lib/solutions.ts)
rather than a class with methods.

---

## 2. Routing and file conventions

### The route tree here

```
app/
├── layout.tsx                    ← root layout: <html>, fonts, Header, Footer
├── page.tsx                      ← /
├── globals.css
├── icon.png                      ← file convention: becomes the favicon
└── solutions/
    ├── layout.tsx                ← nested layout: scopes the display font
    ├── assembly-automation/
    │   ├── page.tsx              ← /solutions/assembly-automation
    │   ├── automated-packing-equipment/page.tsx
    │   ├── laser-marking-equipment/page.tsx
    │   └── automated-handler-equipment/page.tsx
    ├── inspection-testing/…
    ├── material-handling/…
    └── ict-fct/…
```

Note there is **no** `app/solutions/page.tsx`. A layout without a page is legal —
`/solutions` simply 404s, and the layout only exists to wrap the routes below it.

### Layouts don't re-render on navigation

The guide's point that a layout stays mounted while pages swap underneath is
exactly why the header works. [Header.tsx](components/layout/Header.tsx) lives in
the root layout, so navigating from `/` to a solution page doesn't remount it —
its scroll listener and open/closed menu state survive.

It's also why the mega menu can close itself _on_ navigation rather than by
unmounting: it has to detect the change with `usePathname()`, because nothing
tears it down.

### Nested layouts scope things

[app/solutions/layout.tsx](app/solutions/layout.tsx) is 20 lines and does one
job — put a different typeface on this branch of the tree:

```tsx
const display = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`contents ${display.className}`}>{children}</div>;
}
```

Two things to learn from this:

1. **Scoping cuts payload.** Because the font is imported _here_ and not in the
   root layout, the Poppins files are only requested on `/solutions/*`. The home
   page never downloads them.
2. **`display: contents` is the trick that makes it safe.** The wrapper needs to
   exist so the font-family can cascade, but it must not create a box — the
   solution covers use `-mt-16` to slide under the fixed header, and a normal
   `<div>` would change how that margin resolves. `contents` removes the box and
   keeps the inheritance.

### This project has no dynamic routes — and that's a decision

The guide shows `app/posts/[id]/page.tsx` with awaited `params`. This project
deliberately does the opposite: eleven hardcoded folders, each a one-liner:

```tsx
// app/solutions/assembly-automation/page.tsx
export const metadata = solutionMetadata("assembly-automation");
export default function Page() {
  return <SolutionOverviewPage slug="assembly-automation" />;
}
```

**Why not `app/solutions/[slug]/page.tsx`?** With a fixed set of eleven routes
known at build time, dynamic segments would add `params` awaiting,
`generateStaticParams()`, and a runtime `notFound()` path — machinery to
rediscover something already known statically. The hardcoded version is also
type-safe for free: a typo is a missing folder, not a 404 at runtime.

For reference, the dynamic version would look like this, and note `params` is a
**Promise** in Next 15+:

```tsx
// app/solutions/[slug]/page.tsx — NOT used here
export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // await is mandatory
  return <SolutionOverviewPage slug={slug} />;
}
```

The crossover point is roughly: **content you control at build time → folders;
content from a CMS or database → dynamic segments.** When these pages start
coming from a CMS, this is the first refactor to make.

### The special files this project skips

| File            | Why it's absent                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `loading.tsx`   | Nothing is . There is no fetch to suspend on.                                                                                           |
| `error.tsx`     | No runtime rendering can fail — all data is a static import.                                                                            |
| `not-found.tsx` | Next's default is fine for a prototype. `getSolution()` throws on an unknown slug, which fails the _build_ — better than a runtime 404. |
| `route.ts`      | No API surface.                                                                                                                         |

That last row is a nice illustration of static rendering: because
[lib/solutions.ts](lib/solutions.ts) throws on an unknown slug and every page is
prerendered, a bad slug breaks `npm run build` instead of shipping.

### Metadata

Two patterns are in use. Root layout sets a title _template_:

```tsx
export const metadata: Metadata = {
  title: {
    default: "Sophic Automation — Solutions Prototype",
    template: "%s — Sophic Automation",
  },
  description: "…",
};
```

And each page exports its own, generated from the same data source:

```tsx
export function solutionMetadata(slug: string): Metadata {
  const solution = getSolution(slug);
  return { title: solution.title, description: solution.oneLiner };
}
```

So `/solutions/ict-fct` gets `<title>ICT & FCT — Sophic Automation</title>`
without anyone writing that string. `app/icon.png` needs no code at all — the
filename _is_ the API.

---

## 3. Data fetching, mutations, APIs — and why none are here

There is exactly one data source: [lib/solutions.ts](lib/solutions.ts), a plain
TypeScript module exporting a `const` array.

```ts
export const SOLUTIONS: Solution[] = [ /* four categories, nested */ ];

export function getSolution(slug: string): Solution { … }
export function getSubSolution(solutionSlug: string, subSlug: string) { … }
```

Because it's a static import, it's inlined at build time. **No fetch, no
`async`, no cache, no loading state, no error state.** Everything the guide says
about Server Actions and Route Handlers is real and correct — it's simply not
reachable from a site with no writes and no external data.

Worth knowing what this data module _does_ drive, though, because it's a pattern
worth copying — one source of truth feeding many consumers:

```
lib/solutions.ts
├── the header mega menu               (SolutionsMenu, MobileNav)
├── the home page cards                (SolutionCard)
├── which pages get a photo cover      (coverImage present?)
├── which routes get a transparent header  (Header's COVER_ROUTES set)
├── breadcrumbs and page titles        (Breadcrumbs, solutionMetadata)
├── the benefit / function / metric sections (presence = section renders)
└── which sub-solutions render as picture cards  (image present?)
```

Adding a metric to a machine is a data edit, not a component edit. That's the
payoff.

### When you do need the real thing

If a contact form were added, it would be a Server Action — and the guide's
security warning is the part to take seriously. A Server Action is a **public
POST endpoint**; the fact that you call it like a function hides that, but an
attacker can call it directly:

```tsx
// app/actions/contact.ts
"use server";
import { revalidatePath } from "next/cache";

export async function submitEnquiry(formData: FormData) {
  // Validate and authorise HERE. There is no other gate.
  const email = String(formData.get("email") ?? "");
  if (!email.includes("@")) throw new Error("Invalid email");
  …
  revalidatePath("/contact");
}
```

Use a **Route Handler** (`app/api/…/route.ts` — note `.ts`, not `.tsx`) instead
when something external needs a URL: a Stripe webhook, a CMS publish hook.

---

## 4. Caching and rendering

### Every route here is static

Run `npm run build` and every one of the 14 routes is marked `○ (Static)`:

```
Route (app)
┌ ○ /
├ ○ /icon.png
├ ○ /solutions/assembly-automation
├ ○ /solutions/assembly-automation/automated-packing-equipment
…
○  (Static)  prerendered as static content
```

That happens because nothing in the tree reads a dynamic source. No `cookies()`,
no `headers()`, no uncached `fetch`, no `searchParams`. Next prerenders the HTML
at build time and it can be served from a CDN.

**Client Components don't break this.** This is a common misconception and this
project disproves it: `Header`, `HeroScene`, `Reveal` and `MetricValue` are all
client components, and every route is still static. They're prerendered to HTML
on the server, then hydrated in the browser. Interactivity is not the same thing
as dynamic rendering.

You can see the prerendering directly:

```powershell
# The counted-up figures are already in the HTML, before any JS runs
.next/server/app/solutions/assembly-automation/automated-packing-equipment.html
#  → 50–80bags/h   100–600kg   ±2–5‰   0.5~0.8MPa
```

This is deliberate in [MetricValue.tsx](components/solutions/MetricValue.tsx):
the server renders the _final_ values, and the client rewinds them to zero on
mount to animate. So the real numbers are present without JavaScript, for search
engines, and for anyone on reduced motion. The animation is decoration layered
on top of working content — a good habit generally.

### `use cache` and `cacheComponents`

Not enabled here, and there's nothing for them to do — static imports are
already as cached as data gets. But this is the flagship 2026 feature, so:

```ts
// next.config.ts — top-level, NOT under experimental (see corrections, §8)
const nextConfig: NextConfig = { cacheComponents: true };
```

```ts
// lib/posts.ts
import { cacheLife, cacheTag } from "next/cache"; // the import the guide omits

export async function getPosts() {
  "use cache";
  cacheLife("days");
  cacheTag("posts");
  return prisma.post.findMany();
}
```

Then `revalidateTag("posts")` or `updateTag("posts")` from a Server Action busts
it. Turning `cacheComponents` on also makes **Partial Prerendering** the default:
a static shell streams instantly and dynamic islands inside `<Suspense>`
boundaries fill in when ready.

The mental model that carries over: **the unit of caching is now a function, not
a page.** Older Next patched global `fetch` and configured whole routes; 2026
tags individual data functions.

---

## 5. `proxy.ts` — request interception

Not present here (no auth, no redirects, no rewrites). If it were added it would
sit at the project root, beside `next.config.ts`.

⚠️ **The guide's example has a bug.** The matcher is exported as `config`, not as
`matcher`. Verified against
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`:

```ts
// proxy.ts — corrected
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (!request.cookies.get("session_token")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // ← `config`, not `matcher`
  matcher: ["/admin/:path*"],
};
```

The guide's constraint is the important part: **no database calls in `proxy.ts`.**
It runs before every matched request, so it must stay cheap — read a cookie,
check a JWT shape, redirect. Real authorisation belongs in the data access layer,
where the query actually happens.

---

## 6. Authentication

Nothing to say from this project — it's a public marketing site with no login,
no session, no protected routes.

The one principle worth carrying anyway: **secure the data access layer, not the
page.** A check in a Server Component protects that component's render; it does
nothing for a Server Action or Route Handler that touches the same table. Put
the check next to the query.

---

## 7. The agent-tooling section

Some of §7 in the guide describes conventions of AI coding tools, not features
Next.js ships. Concretely, in this repo:

- `AGENTS.md` and `CLAUDE.md` exist at the root, but Next.js did not create them
  and does not read them. They're a convention some editors follow. Both are now
  listed in [.gitignore](.gitignore) and stay local.
- **The docs path in the guide is wrong.** It says
  `node_modules/next/docs/index.md` — that path does not exist. The real
  location, verified in this install, is:

  ```
  node_modules/next/dist/docs/index.md
  node_modules/next/dist/docs/01-app/…
  ```

  This is genuinely useful and worth browsing directly. It's the docs for
  **your exact version**, which beats a web search that might describe Next 14.

- Console forwarding is real but no longer experimental:

  ```ts
  // next.config.ts
  const nextConfig: NextConfig = {
    logging: { browserToTerminal: true }, // or 'warn'
  };
  ```

  It moved out of `experimental.browserDebugInfoInTerminal` in **v16.2.0** — this
  project is on 16.2.12, so the non-experimental form is the correct one.

---

## 8. Corrections to the guide

Each of these was checked against the docs shipped inside `node_modules` for
Next 16.2.12, not from memory.

| The guide says                                      | Actually                                                                                                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Docs at `node_modules/next/docs/index.md`           | `node_modules/next/dist/docs/index.md` — the guide's path doesn't exist                                                                                  |
| `proxy.ts` exports `export const matcher = […]`     | Exports `export const config = { matcher: […] }`                                                                                                         |
| PPR via _experimental_ `cacheComponents: true`      | `cacheComponents` is **top-level** in `next.config.ts`. `experimental.ppr` and `experimental_ppr` were removed — `cacheComponents` makes PPR the default |
| _Experimental_ `browserToTerminal`                  | `logging.browserToTerminal`, top-level since v16.2.0                                                                                                     |
| Route Handlers in `route.tsx`                       | `route.ts` / `route.js` by convention — the docs use `.ts` throughout                                                                                    |
| `cacheLife` / `cacheTag` used without imports       | Both come from `next/cache`                                                                                                                              |
| Next.js ships `claude.md` / `agents.md` scaffolding | Editor-tool convention, not a Next.js feature                                                                                                            |
| Lock file at `.next/next-dev.lock`                  | Not verified in this install — treat as uncertain                                                                                                        |

The guide is broadly sound on the _concepts_ — server-first rendering, small
client boundaries, function-level caching, `proxy.ts` replacing middleware. The
errors are all in exact API shapes, which is precisely why the project's
`AGENTS.md` says to read `node_modules/next/dist/docs/` before writing code.

---

## 9. One more thing this project teaches: `typedRoutes`

[lib/solutions.ts](lib/solutions.ts) imports the `Route` type:

```ts
import type { Route } from "next";
export type SubSolution = { …; href: Route };
```

But look at what `Route` actually resolves to right now
(`node_modules/next/types.d.ts:30`):

```ts
export type Route<RouteInferType = any> = string & {};
```

That accepts **any** string. So in this project the annotation is
_documentation_ — it tells a reader "this is a route, not an arbitrary URL" — but
it catches nothing. Real validation needs opting in:

```ts
// next.config.ts
const nextConfig: NextConfig = { typedRoutes: true };
```

With that on, Next generates a literal union of your actual routes and a typo in
an `href` becomes a compile error. **This is a genuine, one-line improvement
available to this project today** — a good first exercise.

---

## 10. Exercises, in increasing difficulty

1. **Enable `typedRoutes`** in `next.config.ts`, run `npx tsc --noEmit`, and see
   whether every `href` in `lib/solutions.ts` really matches a folder.
2. **Add `logging.browserToTerminal`** and watch a browser `console.log` appear
   in the terminal running `npm run dev`.
3. **Add a `not-found.tsx`** and visit `/solutions` (which has a layout but no
   page) to see it.
4. **Break the boundary on purpose.** Export a string constant from
   `MetricValue.tsx`, import it into `TechnicalMetrics.tsx`, build, and read the
   `class` attribute in `.next/server/app/…/automated-packing-equipment.html`.
   Seeing the stub with your own eyes is worth more than reading §1 again.
5. **Convert the eleven route folders to one `[slug]` route** with
   `generateStaticParams()`. Compare the build output — it should still be all
   `○ Static`. Then decide whether you actually prefer it.
6. **Add a contact form** as a Server Action, and note how much appears in the
   network tab that you never wrote.
