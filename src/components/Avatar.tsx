import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  email?: string;
  src?: string;
  size?: number;
  className?: string;
}

export function getInitials(name?: string, email?: string): string {
  const source = (name || "").trim();
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
  }
  if (email) return email.split("@")[0].slice(0, 2).toUpperCase();
  return "?";
}

export function Avatar({ name, email, src, size = 40, className }: AvatarProps) {
  const initials = getInitials(name, email);
  const style = { width: size, height: size, fontSize: Math.round(size * 0.36) };

  if (src) {
    return (
      <img
        src={src}
        alt={name || "avatar"}
        style={style}
        className={cn("rounded-full object-cover border border-line", className)}
      />
    );
  }
  return (
    <div
      style={style}
      className={cn(
        "rounded-full bg-surface-2 border border-line text-ink font-semibold grid place-items-center select-none",
        className,
      )}
    >
      {initials}
    </div>
  );
}
