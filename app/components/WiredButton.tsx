"use client";

import React, { useEffect, useRef } from "react";
import "wired-elements";

interface WiredButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  backgroundColor?: string;
  elevation?: string;
}

const WiredButton: React.FC<WiredButtonProps> = ({
  children,
  onClick,
  className = "",
  backgroundColor,
  elevation = "2",
}) => {
  const buttonRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Apply background color if provided
    if (backgroundColor && buttonRef.current) {
      buttonRef.current.style.setProperty(
        "--wired-button-bg-color",
        backgroundColor
      );
    }
  }, [backgroundColor]);

  return (
    <div className={className}>
      {/* @ts-ignore - TypeScript doesn't know about wired-elements custom elements */}
      <wired-button ref={buttonRef} elevation={elevation} onClick={onClick}>
        {children}
      </wired-button>
    </div>
  );
};

export default WiredButton;
