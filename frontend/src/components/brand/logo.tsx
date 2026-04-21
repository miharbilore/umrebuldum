import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

export function Logo({ size = "md", className, showText = false }: LogoProps) {
  const sizeMap = {
    sm: "h-8 w-8 text-base rounded-lg",
    md: "h-9 w-9 text-lg rounded-xl",
    lg: "h-11 w-11 text-xl rounded-xl",
    xl: "h-16 w-16 text-3xl rounded-[1.5rem]",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shrink-0",
          sizeMap[size]
        )}
      >
        <span className="font-black text-slate-900 leading-none">U</span>
      </div>
      {showText && (
        <span className={cn(
          "font-black tracking-tight",
          size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"
        )}>
          Umrebuldum<span className="text-amber-500">.</span>
        </span>
      )}
    </div>
  );
}
