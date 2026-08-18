/**
 * The order the anniversary band arrives in, in milliseconds from the moment
 * the band is judged to be on screen.
 *
 * Shared rather than local because two components are dancing to it: the copy
 * staggers itself off these in Anniversary.tsx, and the fireworks light their
 * two waves off them in Fireworks.tsx. Kept apart from both so neither owns it
 * — a burst timed to land "before the paragraph" has to know when the paragraph
 * is, and the alternative is the same number written down twice in two files
 * that have no other reason to agree.
 *
 * The shape of it is fixed and not a matter of taste: the sky and the wordmark
 * arrive on an otherwise empty band, and everything else follows into it. That
 * is the whole effect — a name appearing in a night sky, and then the sentence
 * the name is there to introduce. Anything that lands with the logo takes the
 * empty band away and there is nothing left for the rest to arrive into.
 *
 * The gaps are wide — far past the ~300ms Reveal's own note recommends across a
 * group. That guidance is for content that should feel like it appeared at once
 * with a little life in it. This is meant to be watched in order, and at the
 * tight spacing the section had before, all four beats landed inside a quarter
 * of a second and the sequence was invisible.
 *
 * Each beat overlaps the one before it rather than queueing behind it: the
 * reveals run 500ms and the bursts 700ms, both longer than any gap here, so
 * something is always still arriving. That is the difference between one
 * movement and seven separate ones.
 */
export const BEAT = {
  /** First wave of bursts, out in the margins. The curtain going up. */
  sky: 0,
  /** The wordmark, into an otherwise empty band. */
  logo: 300,
  /** The sentence the whole section is. */
  lede: 780,
  /**
   * Second wave, in the middle of the band and behind the type.
   *
   * Deliberately between the heading and the body rather than with either: it
   * fills the beat where nothing else is moving, so the pause before the
   * paragraph reads as anticipation rather than as the animation having
   * finished early.
   *
   * These are the only bursts that go out again — see `body`.
   */
  skyMid: 1060,
  /**
   * The two body paragraphs, and the middle wave's cue to leave.
   *
   * One beat doing two things, because they are the same thing: the paragraph
   * arrives exactly where those bursts are, and a firework is the one backdrop
   * you cannot ask someone to read over. It gets a little over half a second to
   * be seen and then a slow exit under the words, so what the reader watches is
   * the sky making room rather than a layer being switched off.
   */
  body: 1620,
  /** The rule and the payoff line. */
  closing: 1980,
  /** And the invitation, last and quietest. */
  hint: 2280,
} as const;

/**
 * How long the middle wave takes to clear once the paragraph cues it.
 *
 * Much longer than anything else here, and long enough that it is still going
 * as the closing line lands. That is the point of it: an exit the reader can
 * see finishing competes with the copy for the end of the sequence, and this is
 * meant to be noticed only in the sense that the sky is quieter than it was.
 */
export const SKY_MID_EXIT_MS = 1200;
