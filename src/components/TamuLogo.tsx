import tamuLogo from "@/assets/tamu_logo.png";

interface TamuLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string;
}

const sizeMap = {
  sm: 40,
  md: 60,
  lg: 80,
  xl: 100,
};

export const TamuLogo = ({ size = "md", className = "" }: TamuLogoProps) => {
  const dimensions = typeof size === "number" ? size : sizeMap[size];

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: dimensions, height: dimensions }}
    >
      <img
        src={tamuLogo}
        alt="TAMU Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};
