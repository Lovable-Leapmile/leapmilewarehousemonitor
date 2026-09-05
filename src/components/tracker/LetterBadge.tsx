import { cn } from "@/lib/utils";

/** Square badge carrying the assigned list letter. */
export function LetterBadge({
  letter,
  className,
  textClassName,
  active = true,
}: {
  letter: string;
  className?: string;
  textClassName?: string;
  /** Active badges show a white face; inactive ones stay shaded grey. */
  active?: boolean;
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
        className={cn(
          "absolute inset-0 rounded-md border-2 border-[#0d0d0d]/80 shadow-lg",
          active ? "bg-white" : "bg-[#6E7378]"
        )}
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
