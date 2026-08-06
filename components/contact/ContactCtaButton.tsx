"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
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
