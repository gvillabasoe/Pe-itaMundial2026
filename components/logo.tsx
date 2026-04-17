import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
  rounded?: boolean;
  alt?: string;
}

/**
 * Main brand logo. The asset must live at `public/logo-porra.webp`.
 * If you only have it under public/flags/, copy it to public/logo-porra.webp.
 */
export function Logo({
  size = 40,
  className = "",
  priority = false,
  rounded = true,
  alt = "Peñita Mundial · IV Edición",
}: LogoProps) {
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden bg-bg-3 ${
        rounded ? "rounded-xl" : ""
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-porra.webp"
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className="object-contain"
      />
    </span>
  );
}
