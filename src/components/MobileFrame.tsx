import React from "react";

// Dimensions tuned for 1920×1080 canvas
const W = 380;                           // phone width
const H = Math.round(W * (19.5 / 9));   // phone height: 823
const BH = 14;                           // horizontal bezel
const BT = 18;                           // top bezel
const BB = 22;                           // bottom bezel
const SW = W - BH * 2;                  // screen width: 352
const SH = H - BT - BB;                 // screen height: 783
const CORNER = 46;                       // outer corner radius
const SCREEN_CORNER = 36;               // inner screen corner radius
const DI_W = 118;                        // Dynamic Island width
const DI_H = 32;                         // Dynamic Island height

interface Props {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<Props> = ({ children }) => {
  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        flexShrink: 0,
      }}
    >
      {/* Outer body */}
      <div
        style={{
          width: W,
          height: H,
          backgroundColor: "#1c1c1e",
          borderRadius: CORNER,
          position: "relative",
          boxShadow:
            "inset 0 0 0 1.5px #3a3a3c, inset 1px 1px 0 rgba(255,255,255,0.07), 0 24px 60px rgba(0,0,0,0.55)",
        }}
      >
        {/* Volume buttons — left side */}
        {[110, 170, 230].map((top, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -4,
              top,
              width: 4,
              height: i === 0 ? 30 : 50,
              backgroundColor: "#2e2e30",
              borderRadius: "2px 0 0 2px",
            }}
          />
        ))}

        {/* Power button — right side */}
        <div
          style={{
            position: "absolute",
            right: -4,
            top: 150,
            width: 4,
            height: 70,
            backgroundColor: "#2e2e30",
            borderRadius: "0 2px 2px 0",
          }}
        />

        {/* Screen */}
        <div
          style={{
            position: "absolute",
            top: BT,
            left: BH,
            width: SW,
            height: SH,
            borderRadius: SCREEN_CORNER,
            overflow: "hidden",
            backgroundColor: "#000",
          }}
        >
          {children}

          {/* Dynamic Island overlay — on top of screenshot */}
          <div
            style={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              width: DI_W,
              height: DI_H,
              backgroundColor: "#000",
              borderRadius: DI_H / 2,
              zIndex: 10,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const MOBILE_SCREEN = { width: SW, height: SH };
