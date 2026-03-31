"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  href?: string | null;
  className?: string;
  compact?: boolean;
  priority?: boolean;
};

export default function Logo({
  href,
  className = "",
  compact = false,
  priority = false,
}: Props) {
  const sizeClassName = compact ? "h-12 w-12 md:h-14 md:w-14" : "h-10 w-10 md:h-12 md:w-12";

  const image = (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-black/5 ${sizeClassName} ${className}`.trim()}
    >
      <Image
        src="/logo.png"
        alt="MATVerse - Eco Lifestyle Store"
        fill
        sizes={compact ? "56px" : "48px"}
        className="object-contain p-1.5"
        priority={priority}
      />
      <span className="sr-only">MATVerse</span>
    </span>
  );

  return href ? (
    <Link href={href} className="inline-flex items-center justify-center">
      {image}
    </Link>
  ) : (
    image
  );
}
