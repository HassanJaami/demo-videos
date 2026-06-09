import React from "react";

// Dimensions tuned for 1920×1080 canvas
const W = 1380;                      // lid width
const BH = 18;                       // horizontal bezel (each side)
const BT = 26;                       // top bezel
const BB = 54;                       // bottom chin
const SW = W - BH * 2;              // screen width: 1344
const SH = Math.round(SW * (10/16)); // screen height: 840  (16:10)
const FH = BT + SH + BB;            // lid height: 920
const BASE_W = W + 40;              // base slightly wider: 1420
const BASE_H = 48;
const CAM_W = 88;
const CAM_H = 16;
const OUTER_R = 18;
const SCREEN_R = 6;

interface Props {
  children: React.ReactNode;
}

export const LaptopFrame: React.FC<Props> = ({ children }) => {
  return (
    <div style={{ position: "relative", width: W, flexShrink: 0 }}>
      {/* Camera bump — sits above the lid */}
      <div
        style={{
          position: "absolute",
          top: -CAM_H,
          left: "50%",
          transform: "translateX(-50%)",
          width: CAM_W,
          height: CAM_H + 4,
          backgroundColor: "#1c1c1e",
          borderRadius: "8px 8px 0 0",
          display: "flex",
          justifyContent: "center",
          paddingTop: 5,
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: "#3a3a3c",
            border: "1px solid #555",
          }}
        />
      </div>

      {/* Lid / bezel */}
      <div
        style={{
          width: W,
          height: FH,
          backgroundColor: "#1c1c1e",
          borderRadius: OUTER_R,
          position: "relative",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1.5px #3a3a3c, 0 24px 60px rgba(0,0,0,0.55)",
        }}
      >
        {/* Screen */}
        <div
          style={{
            position: "absolute",
            top: BT,
            left: BH,
            width: SW,
            height: SH,
            borderRadius: SCREEN_R,
            overflow: "hidden",
            backgroundColor: "#000",
          }}
        >
          {children}
        </div>
      </div>

      {/* Base */}
      <div
        style={{
          width: BASE_W,
          height: BASE_H,
          marginLeft: -((BASE_W - W) / 2),
          background: "linear-gradient(180deg, #c6c6ca 0%, #9e9ea2 55%, #888 100%)",
          borderRadius: "0 0 14px 14px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {/* Hinge indent */}
        <div
          style={{
            width: 180,
            height: 4,
            backgroundColor: "rgba(0,0,0,0.18)",
            borderRadius: "0 0 6px 6px",
          }}
        />
      </div>
    </div>
  );
};

// Export screen dimensions so FeatureScene can pass them to KenBurns
export const LAPTOP_SCREEN = { width: SW, height: SH };
