"use client";

import { useState } from "react";
import Image from "next/image";
import { getToolLogoCandidates, toolInitials, toolAccent } from "../lib/tool-logos";

type Props = {
  name: string;
  logo?: string | null;
  size?: number;
  className?: string;
};

export function ToolLogo({ name, logo, size = 22, className = "" }: Props) {
  const candidates = getToolLogoCandidates(name, logo);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(candidates.length === 0);

  if (failed || index >= candidates.length) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md text-[10px] font-bold text-white ${className}`}
        style={{
          width: size,
          height: size,
          background: toolAccent(name),
        }}
        aria-hidden="true"
      >
        {toolInitials(name)}
      </span>
    );
  }

  const src = candidates[index];

  return (
    <Image
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      unoptimized
      onError={() => {
        if (index + 1 < candidates.length) setIndex((i) => i + 1);
        else setFailed(true);
      }}
    />
  );
}
