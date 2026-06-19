import React, { useEffect } from "react";
import { Box, Stack, Image, Text, Center } from "@mantine/core";

import logUNDP from "./icon-undp.png";
import logoCIR from "./logo.png";
import { useNavigate } from "react-router-dom";

// Native CSS keyframe definitions injected into a style tag or your global.css
// This avoids any third-party engine dependency!
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }
`;

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Start the 5-second timer
    const timer = setTimeout(() => {
      navigate("/auth_check");
    }, 5000);

    // CLEANUP: Clears the timer if the user leaves the page before 5 seconds
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      {/* Inject custom animations */}
      <style>{animationStyles}</style>

      <Box
        sx={{ overflow: "hidden" }} // Just in case, keeping bounds tight
        style={{
          backgroundColor: "#03152d", // Deep blue background
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          // CSS Dot Grid background pattern matching the original design
          backgroundImage: "radial-gradient(#0a2546 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      >
        {/* Main Center Content */}
        <Center style={{ height: "100%" }}>
          <Stack
            gap={40}
            style={{
              animation: "fadeIn 1s ease-out forwards",
              maxWidth: 400,
              width: "100%",
              padding: "var(--mantine-spacing-xl)",
              textAlign: "center",
            }}
          >
            {/* App Icon Wrapper */}
            <Box
              style={{
                animation: "pulse 3s ease-in-out infinite",
                width: "clamp(140px, 40vw, 180px)", // Perfectly responsive scaling automatically
                height: "clamp(140px, 40vw, 180px)",
                margin: "0 auto",
              }}
            >
              <Image
                src={logoCIR}
                alt="Crisis Impact Reporting Tool Logo"
                fit="contain"
              />
            </Box>

            {/* UNDP Branding Emblem */}
            <Center>
              {/* <Box
                style={{
                  border: "1.5px solid rgba(255,255,255,0.8)",
                  padding: "4px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  display: "inline-flex",
                  gap: 6,
                  opacity: 0.9,
                  color: "#white",
                  lineHeight: 1.1,
                }}
              > */}
              <Image
                src={logUNDP}
                alt="Crisis Impact Reporting Tool Logo"
                fit=""
                h={50}
                w={100}
              />

              {/* <span>🇺🇳sssssssssssss</span>
                <span style={{ textAlign: "left", fontSize: 10 }}>
                  UN
                  <br />
                  DP
                </span> */}
              {/* </Box> */}
            </Center>

            {/* Typography Stack */}
            <Stack gap={4}>
              <Text
                style={{
                  fontSize: "clamp(24px, 5vw, 32px)", // Mobile responsive fluid sizing
                  fontWeight: 700,
                  letterSpacing: -0.5,
                  lineHeight: 1.2,
                  color: "#ffffff",
                }}
              >
                Crisis Impact
              </Text>
              <Text
                style={{
                  fontSize: "clamp(24px, 5vw, 32px)",
                  fontWeight: 700,
                  letterSpacing: -0.5,
                  lineHeight: 1.2,
                  color: "#3bc4be", // The signature cyan color
                }}
              >
                Reporting Tool
              </Text>
            </Stack>
          </Stack>
        </Center>

        {/* Footer Branding Section */}
        <Box
          style={{
            position: "absolute",
            bottom: "40px",
            transform: "translateX(-50%)",
            width: "100%",
            textAlign: "center",
            animation: "fadeIn 1.2s ease-out forwards",
          }}
        >
          <Stack gap={8} align="center">
            {/* Custom SVG user-network footer icon */}

            {/* <Image
              src={logUNDP}
              alt="Crisis Impact Reporting Tool Logo"
              h={24}
              w={24}
            /> */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3bc4be"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>

            <Text
              style={{
                color: "#607d9b", // Slate accent color
                fontSize: "var(--mantine-font-size-sm)",
                fontWeight: 500,
                maxWidth: 280,
                margin: "0 auto",
                lineHeight: 1.4,
              }}
            >
              Empowering Communities,
              <br />
              Informing Action
            </Text>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
