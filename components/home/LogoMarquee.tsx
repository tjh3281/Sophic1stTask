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
/**
 * Ordered wide-narrow-wide so the strip has an even rhythm as it passes.
 *
 * `color` is the mark in its own livery, revealed on hover. Every mark has one
 * now, but the field stays optional so a new customer can be added before its
 * artwork is cleaned up rather than after.
 *
 * Both layers of each pair are generated from one source in a single pass, so
 * they are cropped to identical bounds and the cross-fade cannot shift. Pairing
 * a new colour file with an older mono one is what would break that — the two
 * crops would come from different measurements.
 */
const LOGOS: {
  src: string;
  alt: string;
  width: number;
  height?: number;
  color?: string;
}[] = [
  {
    src: "/images/logo-oppstar-mono.png",
    alt: "Oppstar",
    width: 161,
    color: "/images/logo-oppstar-color.png",
  },
  // Set taller than the rest on purpose. Intel's wordmark sits inside a thin
  // oval that reaches well above and below the letters, so matching ink height
  // leaves the word itself far smaller than everyone else's and the mark reads
  // as the runt of the row. Sized up until it carries about the weight of
  // Infineon, which is drawn the same way but tighter around its word.
  {
    src: "/images/logo-intel-mono.png",
    alt: "Intel",
    width: 60,
    height: 40,
    color: "/images/logo-intel-color.png",
  },
  {
    src: "/images/logo-mdec-mono.png",
    alt: "MDEC",
    width: 125,
    color: "/images/logo-mdec-color.png",
  },
  // Sized off its own drawing rather than the row's height, for the same reason
  // Intel is: aws stacks a word over the arrow, so a lockup two lines deep set
  // to the height of a single-line wordmark leaves the word itself tiny.
  {
    src: "/images/logo-aws-mono.png",
    alt: "Amazon Web Services",
    width: 60,
    height: 36,
    color: "/images/logo-aws-color.png",
  },
  // Under the row height, unlike most of the strip. The wordmark carries both
  // an ascender and a descender, so at a matching 32 the letters themselves
  // come out visibly larger than the all-caps marks either side of it.
  {
    src: "/images/logo-sandisk-mono.png",
    alt: "SanDisk",
    width: 133,
    height: 26,
    color: "/images/logo-sandisk-color.png",
  },
  // Shorter again, for the opposite reason: the mark is a single line of caps
  // at better than seven to one, so its full height is all letter where the
  // others spend some of theirs on ascenders. Sized so its caps land near
  // MDEC's rather than so its box matches.
  {
    src: "/images/logo-advfit-mono.png",
    alt: "ADVFIT",
    width: 152,
    height: 20,
    color: "/images/logo-advfit-color.png",
  },
  // Over the row height, for the reason given at Intel — and set to the same 40
  // deliberately. Infineon is drawn the same way, a word inside a thin oval that
  // reaches above and below it, so the two only look like a matched pair when
  // their ovals match rather than their words.
  {
    src: "/images/logo-infineon-mono.png",
    alt: "Infineon",
    width: 91,
    height: 40,
    color: "/images/logo-infineon-color.png",
  },
  // Over the row height too, though it is the heaviest mark on the strip and so
  // sits a notch below Intel and Infineon. Their extra height is spent on empty
  // oval; every pixel of Zebra's is solid bar.
  {
    src: "/images/logo-zebra-mono.png",
    alt: "Zebra",
    width: 112,
    height: 36,
    // Zebra's own livery is black, so this reads as a darkening rather than as
    // a burst of colour. That is the mark, not a shortfall in the file.
    color: "/images/logo-zebra-color.png",
  },
  {
    // The mono here punches the WD monogram out rather than filling it. White
    // ink cannot be drawn in a single tone — flattened to the same grey as the
    // box around it, the letters vanish — so the hole is the letterform.
    src: "/images/logo-westerndigital-mono.png",
    alt: "Western Digital",
    width: 114,
    color: "/images/logo-westerndigital-color.png",
  },
];

/** Row height, and the default for a mark that does not override it. */
const HEIGHT = 32;

export function LogoMarquee() {
  const row = LOGOS.map((logo) => {
    const height = logo.height ?? HEIGHT;

    return (
      <div key={logo.src} className="flex shrink-0 items-center px-8 sm:px-12">
        {/* The hover target is the mark, not its padded cell — hovering the gap
            between two logos should light neither. Sized by the mono image in
            normal flow, which the colour copy then covers. */}
        <span className="logo-mark relative block">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={height}
            className="logo-mark-mono max-w-none"
          />
          {logo.color && (
            <Image
              src={logo.color}
              // Empty: the mono copy underneath already carries the name, and
              // announcing every customer twice helps nobody.
              alt=""
              width={logo.width}
              height={height}
              className="logo-mark-color absolute inset-0 max-w-none"
            />
          )}
        </span>
      </div>
    );
  });

  return (
    <section
      aria-label="Customers"
      className="border-b border-line bg-surface py-10"
    >
      {/* Slower than the metrics band: this one is ambient, and a strip that
          hurries pulls attention off the copy above it.

          The duration is per track length, not per taste — the animation
          covers half the track whatever that measures, so adding logos would
          otherwise speed the strip up. Nine marks come to 1008px of artwork plus
          96px of padding each, about 1872px, held at the same ~23px/s the seven
          ran at. */}
      <div className="marquee" style={{ "--marquee-duration": "80s" } as React.CSSProperties}>
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
