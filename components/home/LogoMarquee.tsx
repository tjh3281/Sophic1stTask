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
/**
 * The three newest marks arrived as ordinary artwork, not as the flat grey the
 * rest of the row is drawn in, so they were converted to match: keyed against
 * their light background, flattened to rgb(122,136,151) — the tone sampled off
 * the existing marks — and cropped to their ink at twice display size.
 *
 * Two needed more than a recolour. The Zebra file is black on solid white, so
 * dropped in as-is it would have sat on the strip as a white card. The AWS file
 * looks transparent and is not: its chequerboard is baked in as real pixels, so
 * it would have brought a grey tile with it. Keying on the lightest channel
 * removed both, and cropping to the ink is what pulled the AWS mark out of the
 * padding it was sitting in.
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
  // Sized off its own drawing rather than the row's height, for the same reason
  // Intel is: aws stacks a word over the arrow, so a lockup two lines deep set
  // to the height of a single-line wordmark leaves the word itself tiny.
  { src: "/images/logo-aws-mono.png", alt: "Amazon Web Services", width: 60, height: 36 },
  // Under the row height, unlike most of the strip. The wordmark carries both
  // an ascender and a descender, so at a matching 32 the letters themselves
  // come out visibly larger than the all-caps marks either side of it.
  { src: "/images/logo-sandisk-mono.webp", alt: "SanDisk", width: 128, height: 26 },
  // Shorter again, for the opposite reason: the mark is a single line of caps
  // at better than seven to one, so its full height is all letter where the
  // others spend some of theirs on ascenders. Sized so its caps land near
  // MDEC's rather than so its box matches.
  { src: "/images/logo-advfit-mono.png", alt: "ADVFIT", width: 152, height: 20 },
  { src: "/images/logo-infineon-mono.webp", alt: "Infineon", width: 73 },
  // Slightly under the row height: the mark is far heavier than its neighbours,
  // and at a matching 32 its solid bars read as the loudest thing on the strip.
  { src: "/images/logo-zebra-mono.png", alt: "Zebra", width: 93, height: 30 },
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
          otherwise speed the strip up. Nine marks come to 972px of artwork plus
          96px of padding each, about 1836px, held at the same ~23px/s the seven
          ran at. */}
      <div className="marquee" style={{ "--marquee-duration": "78s" } as React.CSSProperties}>
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
