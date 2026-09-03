import { cn } from "@/lib/utils";

/** Rotated diamond badge carrying the assigned list letter. */
export function LetterBadge({
  letter,
  className,
  textClassName,
}: {
  letter: string;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span
      className={cn(
        "grid rotate-45 place-items-center rounded-md border-2 border-[#1a1a1a] bg-[linear-gradient(to_bottom,#ffffff_0%,#ffffff_50%,#FFB000_50%,#FFB000_100%)] text-black shadow-lg",
        className
      )}
    >
      <span
        className={cn(
          "-rotate-45 font-sans font-black uppercase tracking-tight",
          textClassName
        )}
      >
        {letter}
      </span>
    </span>
  );
}
