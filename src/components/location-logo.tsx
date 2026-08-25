import React from "react";
import { MapPin } from "lucide-react";

interface LocationLogoProps {
  name?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Official vector brand logo for SPAR
 */
export function SparLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      title="SPAR"
    >
      {/* Outer red ring/circle */}
      <circle cx="24" cy="24" r="23" fill="#E31B23" />
      {/* Inner white circle */}
      <circle cx="24" cy="24" r="19" fill="#FFFFFF" />
      {/* Iconic Green Spar Tree */}
      <path
        d="M24 8L32.5 21H28.5L34 29H29L35.5 38H12.5L19 29H14L19.5 21H15.5L24 8Z"
        fill="#007A3D"
      />
      {/* Tree trunk */}
      <rect x="22" y="37" width="4" height="4" rx="0.5" fill="#007A3D" />
    </svg>
  );
}

/**
 * Official vector brand logo for KFC
 */
export function KfcLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`shrink-0 rounded-full shadow-2xs ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      title="KFC"
    >
      {/* Red Background */}
      <rect width="48" height="48" rx="24" fill="#E4002B" />
      
      {/* White Stripes */}
      <rect x="10" y="3" width="7" height="42" fill="#FFFFFF" opacity="0.95" />
      <rect x="31" y="3" width="7" height="42" fill="#FFFFFF" opacity="0.95" />
      
      {/* Central Black & White Badge */}
      <rect x="6" y="14" width="36" height="20" rx="3" fill="#111111" />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="14"
        letterSpacing="0.8px"
        fill="#FFFFFF"
      >
        KFC
      </text>
    </svg>
  );
}

/**
 * Official vector brand logo for Hofer / Aldi
 */
export function HoferLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`shrink-0 rounded-full shadow-2xs ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      title="HOFER"
    >
      <rect width="48" height="48" rx="24" fill="#001489" />
      <rect x="6" y="6" width="36" height="36" rx="6" fill="#002D72" stroke="#FFD100" strokeWidth="2.5" />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="11"
        fill="#FFFFFF"
      >
        HOFER
      </text>
    </svg>
  );
}

/**
 * Official vector brand logo for Lidl
 */
export function LidlLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      title="Lidl"
    >
      <circle cx="24" cy="24" r="23" fill="#0050AA" stroke="#E30613" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="18" fill="#FFF000" />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="13"
        fill="#0050AA"
      >
        LIDL
      </text>
    </svg>
  );
}

/**
 * Official vector brand logo for Mercator
 */
export function MercatorLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      title="Mercator"
    >
      <circle cx="24" cy="24" r="23" fill="#E30613" />
      <text
        x="24"
        y="33"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="22"
        fill="#FFFFFF"
      >
        M
      </text>
    </svg>
  );
}

/**
 * Official vector brand logo for Tuš
 */
export function TusLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      title="Tuš"
    >
      <rect width="48" height="48" rx="24" fill="#008852" />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="12"
        fill="#FFFFFF"
      >
        tuš
      </text>
    </svg>
  );
}

/**
 * Smart Location Logo Component
 * Automatically detects whether the location is Spar, KFC, Hofer, Lidl, etc.
 * and renders the official logo with appropriate sizing and fallback.
 */
export function LocationLogo({ name, className = "", size = "md" }: LocationLogoProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;
  const normalized = (name || "").toLowerCase().trim();

  if (normalized.includes("spar") || normalized.includes("interspar") || normalized.includes("eurospar")) {
    return <SparLogo className={`${currentSize} ${className}`} />;
  }

  if (normalized.includes("kfc") || normalized.includes("kentucky")) {
    return <KfcLogo className={`${currentSize} ${className}`} />;
  }

  if (normalized.includes("hofer") || normalized.includes("aldi")) {
    return <HoferLogo className={`${currentSize} ${className}`} />;
  }

  if (normalized.includes("lidl")) {
    return <LidlLogo className={`${currentSize} ${className}`} />;
  }

  if (normalized.includes("mercator")) {
    return <MercatorLogo className={`${currentSize} ${className}`} />;
  }

  if (normalized.includes("tus") || normalized.includes("tuš")) {
    return <TusLogo className={`${currentSize} ${className}`} />;
  }

  // Fallback generic location icon
  return (
    <div className={`flex items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0 ${currentSize} ${className}`}>
      <MapPin className="w-3/4 h-3/4 text-primary" />
    </div>
  );
}

/**
 * Full Location Badge with Icon and Text
 */
export function LocationBadge({
  name,
  className = "",
  textClassName = "",
  size = "md",
}: {
  name?: string | null;
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      <LocationLogo name={name} size={size} />
      <span className={`font-semibold tracking-tight truncate ${textClassName}`}>
        {name || "—"}
      </span>
    </div>
  );
}
