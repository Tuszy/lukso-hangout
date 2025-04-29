import React, { PropsWithChildren } from "react";
// Icon
import LuksoLogo from "../assets/lukso logo.svg";

export const LoadingBackdrop = ({
  children,
  background,
  hideSpinner = false,
}: PropsWithChildren<{ background?: string; hideSpinner?: boolean }>) => (
  <div
    className="fixed inset-0 bg-[rgba(0,0,0,0.75)] z-10 flex flex-col items-center justify-center gap-4 transition-all select-none backdrop-blur-sm"
    style={{ background }}
  >
    {!hideSpinner && (
      <img
        draggable={false}
        src={LuksoLogo}
        width={64}
        height={64}
        className="animate-[spin_3s_linear_infinite] opacity-100"
      />
    )}
    <div className="text-white text-3xl font-bold text-center">{children}</div>
  </div>
);
