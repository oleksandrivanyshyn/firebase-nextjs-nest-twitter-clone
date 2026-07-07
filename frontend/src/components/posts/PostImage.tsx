'use client';

import { useState } from 'react';
import Image from 'next/image';

export function PostImage({ src, className }: { src: string; className: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      src={src}
      alt="post"
      width={800}
      height={400}
      onLoad={() => setLoaded(true)}
      className={`bg-muted transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
}
