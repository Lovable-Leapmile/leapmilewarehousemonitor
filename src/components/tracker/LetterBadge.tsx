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
        "relative inline-grid aspect-square shrink-0 place-items-center leading-none",
        className
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 rotate-45 rounded-md border-2 border-[#0d0d0d]/80 bg-[#C9CDD2] shadow-lg"
      />
      <span
        className={cn(
          "relative font-sans font-black uppercase leading-none tracking-tight text-[#0a0a0a]",
          textClassName
        )}
      >
        {letter}
      </span>
    </span>
  );
}
