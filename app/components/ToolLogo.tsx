"use client";

import { useEffect, useMemo, useState } from "react";
import { getToolLogoCandidates, toolInitials, toolAccent } from "../lib/tool-logos";

type Props = {
  name: string;
  slug?: string | null;
  logo?: string | null;
  website?: string | null;
  size?: number;
  className?: string;
};

function InitialsBadge({
  name,
  size,
  className,
}: {
  name: string;
  size: number;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md text-[10px] font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        background: toolAccent(name),
      }}
      aria-hidden="true"
      title={name}
    >
      {toolInitials(name)}
    </span>
  );
}

export function ToolLogo({ name, slug, logo, website, size = 22, className = "" }: Props) {
  const candidates = useMemo(() => {
    const fromName = getToolLogoCandidates(name, logo, website);

    if (fromName.length > 0 || !slug) {
      return fromName;
    }

    return getToolLogoCandidates(slug, logo, website);
  }, [name, slug, logo, website]);
  // Defer remote <img> until after mount so SSR HTML matches the first client paint.
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIndex(0);
    setFailed(candidates.length === 0);
  }, [candidates]);

  if (!mounted) {
    return (
      <span
        className={`inline-block rounded-md bg-muted/80 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
        title={name}
      />
    );
  }

  if (failed || index >= candidates.length) {
    return <InitialsBadge name={name} size={size} className={className} />;
  }

  const src = candidates[index];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => {
        if (index + 1 < candidates.length) setIndex((i) => i + 1);
        else setFailed(true);
      }}
    />
  );
}
