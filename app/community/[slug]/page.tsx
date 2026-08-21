import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/solutions/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { COMMUNITY_STORIES, findStory } from "@/lib/community";

/** Every visit is known at build time, so each prerenders and the route never
 *  wakes a function on Netlify. Anything else 404s. */
export async function generateStaticParams() {
  return COMMUNITY_STORIES.map((story) => ({ slug: story.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/community/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const story = findStory(slug);
  if (!story) return { title: "Community" };

  return { title: story.title, description: story.summary };
}

/**
 * One visit, written up.
 *
 * The page a frame on the globe leads to. It opens on the same photograph the
 * frame was showing, which is the whole of the continuity between the two: the
 * reader clicks a picture and arrives on it, rather than clicking a picture and
 * arriving at a heading that has to re-introduce itself.
 *
 * Which is also why that photograph is not in the gallery below — it is already
 * the largest thing on the page. The other four are, in the order the visit
 * happened rather than the order the globe hangs them in.
 *
 * Built to the shape of the job-opening pages rather than to the community
 * page's own: a dark cover over a light body. The section this belongs to is a
 * screen-height animation in space, and space is the right room for a globe and
 * the wrong one for nine hundred words about an afternoon at a care home.
 */
export default async function CommunityStoryPage({
  params,
}: PageProps<"/community/[slug]">) {
  const { slug } = await params;
  const story = findStory(slug);
  if (!story) notFound();

  const [cover, ...gallery] = story.photos;

  return (
    <>
      {/* -mt-16 pt-16 cancels the layout's clearance for the fixed header so
          the photograph runs behind it, then restores the spacing inside. */}
      <section className="relative isolate -mt-16 flex min-h-[19rem] flex-col overflow-hidden bg-slate-950 pt-16 sm:min-h-[24rem] lg:min-h-[28rem]">
        <Image
          src={cover.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Bottom-heavy, where the copy is. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/62 via-45% to-slate-950/35"
        />
        {/* And firmer again through the top quarter, where the header goes
            transparent on this route and its white links sit on whatever this
            photograph happens to have up there. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 via-22% to-transparent to-50%"
        />

        <Container className="relative flex flex-1 flex-col">
          <div className="pt-6 sm:pt-8">
            <Breadcrumbs
              tone="dark"
              trail={[
                { label: "Home", href: "/" },
                { label: "Community", href: "/community" },
                { label: story.title },
              ]}
            />
          </div>

          {/* mt-auto pins the type to the foot; the photograph takes whatever
              height is left above it. */}
          <div className="mt-auto max-w-3xl pb-10 pt-12 sm:pb-14">
            <Reveal>
              <div className="flex items-center gap-3">
                {/* The drawn rule every cover on this site opens on. */}
                <span
                  aria-hidden="true"
                  className="h-px w-9 shrink-0 bg-accent"
                />
                <time
                  dateTime={story.iso}
                  className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-white/80"
                >
                  {story.date}
                </time>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-4 text-[2rem] font-bold leading-[1.12] tracking-[-0.03em] text-white sm:text-[2.75rem]">
                {story.title}
              </h1>
            </Reveal>
          </div>
        </Container>
      </section>

      <Container>
        <div className="mx-auto max-w-3xl py-12 sm:py-16">
          {story.body.map((paragraph, index) => (
            <Reveal key={index} delay={index * 60}>
              <p
                className={
                  index === 0
                    ? "text-lg leading-relaxed text-muted"
                    : "mt-6 text-lg leading-relaxed text-muted"
                }
              >
                {paragraph}
              </p>
            </Reveal>
          ))}

          {gallery.length > 0 && (
            <Reveal className="mt-14">
              <h2 className="text-lg font-bold tracking-[-0.015em] text-foreground">
                From the visit
              </h2>
              {/* One column on a phone, where a half-width photograph of twenty
                  people is a photograph of nobody. */}
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {gallery.map((photo) => (
                  <figure
                    key={photo.src}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-slate-100"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover object-center"
                    />
                  </figure>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal className="mt-14">
            <div className="border-t border-line pt-8">
              <p className="text-sm text-muted">
                Back to{" "}
                <Link
                  href="/community"
                  className="font-medium text-brand transition-colors duration-200 ease-gentle hover:text-brand-dark"
                >
                  our community
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </>
  );
}
