import Image from "next/image";

export function WebsitePreview({
  src,
  title,
  compact = false,
}: {
  src: string;
  title: string;
  compact?: boolean;
}) {
  const boxClass = compact
    ? "relative aspect-[2.4/1] overflow-hidden bg-black"
    : "relative aspect-[2/1] overflow-hidden bg-black";

  return (
    <div className={boxClass}>
      {src.startsWith("/") ? (
        <Image
          src={src}
          alt={`${title} website`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        // External live-site screenshots are not always in next/image remotePatterns.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${title} website`}
          className="absolute inset-0 size-full object-cover object-top"
        />
      )}
    </div>
  );
}
