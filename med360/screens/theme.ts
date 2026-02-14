// theme.ts

export const COLORS = {
  /* ---------- BRAND ---------- */
  BRAND_PRIMARY: "#00A896",       // Main brand color (buttons, header, active)
  BRAND_SECONDARY: "#EEF2FF",     // Light background tint
  BRAND_ACCENT: "#A80096",        // Accent / highlight (optional)
  BRAND_WARNING: "#96A800",       // Alerts, vitals, warnings

  /* ---------- BACKGROUND ---------- */
  BG_PRIMARY: "#EEF2FF",          // App background
  BG_CARD: "#FFFFFF",             // Cards, sheets, modals
  BG_INPUT: "#F8FAFC",            // Input background
  BG_HIGHLIGHT: "#EEF2FF",        // Highlighted sections (PID box etc.)

  /* ---------- TEXT ---------- */
  TEXT_PRIMARY: "#1E293B",        // Main text (titles)
  TEXT_SECONDARY: "#475569",      // Labels
  TEXT_MUTED: "#64748B",          // Subtext, inactive
  TEXT_ON_BRAND: "#FFFFFF",       // Text on brand color
  TEXT_SUBTLE: "#E0E7FF",         // Subtitle on colored background

  /* ---------- BORDER ---------- */
  BORDER_DEFAULT: "#CBD5E1",      // Input border
  BORDER_LIGHT: "#E2E8F0",        // Card borders

  /* ---------- STATE ---------- */
  STATE_ACTIVE: "#4F46E5",        // Active tab, selected
  STATE_INACTIVE: "#FFFFFF",      // Inactive background
  STATE_ERROR: "#DC2626",         // Errors
  STATE_SUCCESS: "#16A34A",       // Success
};

export const SHADOW = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
};
