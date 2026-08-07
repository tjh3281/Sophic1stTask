"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SpecularButton } from "@/components/ui/SpecularButton";

/**
 * The Contact Us button at the foot of a sub-solution page.
 *
 * Exists so ContactCta can stay a Server Component: a handler cannot cross
 * that boundary, but the slug this needs is just a string, so the split lands
 * here. Everything about how the button looks stays in ContactCta — this only
 * adds the navigation.
 *
 * Pushed rather than wrapped in a Link because SpecularButton renders a
 * <button>, and an <a> around a <button> is invalid markup that browsers
 * handle inconsistently. The cost is that middle-click and "open in new tab"
 * do nothing here; the header's Contact is a real link for that.
 *
 * The second cost is what the prefetch below pays back: a Link fetches the
 * destination as soon as it comes into view, and router.push fetches nothing
 * until the click, so the whole download happened while somebody sat looking
 * at an unchanged page. Asking for it up front makes the click a render of
 * something already in memory.
 *
 * The query string is left off deliberately — /contact is prerendered and the
 * slug is read from the URL in the browser, so one payload serves every
 * sub-solution and asking per slug would only fetch the same file again.
 */
export function ContactCtaButton({
  preset,
  children,
}: {
  /** Sub-solution slug, pre-selected in the form's solution dropdown. */
  preset: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  // On mount rather than on hover: this button sits at the foot of the page,
  // so by the time it is on screen the visitor has read everything above it
  // and the network is idle. Touch has no hover to trigger from either.
  useEffect(() => {
    router.prefetch("/contact");
  }, [router]);

  return (
    <SpecularButton
      size="lg"
      radius={18}
      tint="#ffffff"
      tintOpacity={0}
      blur={0}
      textColor="#0f172a"
      lineColor="#000000"
      baseColor="#000000"
      intensity={1}
      shineSize={10}
      shineFade={40}
      thickness={1}
      speed={0.35}
      followMouse
      proximity={250}
      autoAnimate={false}
      onClick={() =>
        router.push(`/contact?solution=${encodeURIComponent(preset)}` as Route)
      }
    >
      {children}
    </SpecularButton>
  );
}
