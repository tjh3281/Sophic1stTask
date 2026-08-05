import Image from "next/image";

/**
 * Customer logo strip, drifting under the hero.
 *
 * The marks are pre-rendered in one grey at one height, rather than recoloured
 * in CSS. A greyscale filter keeps each logo's own lightness — a navy wordmark
 * comes out far darker than a red one — so the row would still look mismatched.
 * Flattening to a single tone from the alpha channel is the only way they read
 * as one set.
 *
 * Widths differ because the marks differ; that is correct, and matching height
 * is what makes a strip look even.
 */
/** Ordered wide-narrow-wide so the strip has an even rhythm as it passes. */
const LOGOS = [
  { src: "/images/logo-oppstar-mono.webp", alt: "Oppstar", width: 163 },
  // Set taller than the rest on purpose. Intel's wordmark sits inside a thin
  // oval that reaches well above and below the letters, so matching ink height
  // leaves the word itself far smaller than everyone else's and the mark reads
  // as the runt of the row. Sized up until it carries about the weight of
  // Infineon, which is drawn the same way but tighter around its word.
  { src: "/images/logo-intel-mono.webp", alt: "Intel", width: 61, height: 40 },
  { src: "/images/logo-mdec-mono.webp", alt: "MDEC", width: 126 },
  { src: "/images/logo-topglove-mono.webp", alt: "Top Glove", width: 96 },
  { src: "/images/logo-sandisk-mono.webp", alt: "SanDisk", width: 158 },
  { src: "/images/logo-infineon-mono.webp", alt: "Infineon", width: 73 },
  {
    src: "/images/logo-westerndigital-mono.webp",
    alt: "Western Digital",
    width: 116,
  },
];

/** Row height, and the default for a mark that does not override it. */
const HEIGHT = 32;

export function LogoMarquee() {
  const row = LOGOS.map((logo) => (
    <div key={logo.src} className="flex shrink-0 items-center px-8 sm:px-12">
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height ?? HEIGHT}
        className="max-w-none"
      />
    </div>
  ));

  return (
    <section
      aria-label="Customers"
      className="border-b border-line bg-surface py-10"
    >
      {/* Slower than the metrics band: this one is ambient, and a strip that
          hurries pulls attention off the copy above it.

          The duration is per track length, not per taste — the animation
          covers half the track whatever that measures, so adding logos would
          otherwise speed the strip up. Seven marks and their padding come to
          about 1450px, at roughly the 23px/s the five ran at. */}
      <div className="marquee" style={{ "--marquee-duration": "62s" } as React.CSSProperties}>
        <div className="marquee-track">
          <div className="flex items-center">{row}</div>
          {/* Fills the gap the first copy leaves as it slides off. Hidden from
              screen readers so the names are not announced twice, and dropped
              entirely under reduced motion. */}
          <div aria-hidden="true" data-marquee-clone="" className="flex items-center">
            {row}
          </div>
        </div>
      </div>
    </section>
  );
}
