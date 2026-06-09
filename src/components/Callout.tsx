import React from "react";
import { usePopIn } from "../lib/animations";
import { theme } from "../lib/theme";

interface Props {
  label: string;
  delay?: number;
  bg?: string;
  color?: string;
}

export const Callout: React.FC<Props> = ({
  label,
  delay = 20,
  bg = theme.colors.accent,
  color = theme.colors.white,
}) => {
  const { scale, opacity } = usePopIn(delay);

  return (
    <div
      style={{
        display: "inline-block",
        marginTop: 28,
        padding: "10px 22px",
        borderRadius: 100,
        backgroundColor: bg,
        color,
        fontSize: 18,
        fontWeight: 600,
        fontFamily: theme.fonts.sans,
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: "left center",
      }}
    >
      {label}
    </div>
  );
};
