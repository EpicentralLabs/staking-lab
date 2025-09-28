const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/react/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: ["class"],
  plugins: [
    heroui({
      prefix: "heroui",
      addCommonColors: false,
      defaultTheme: "dark",
      defaultExtendTheme: "dark",
      layout: {},
      themes: {
        "purple-dark": {
          extend: "dark",
          colors: {
            background: "#0D1117",
            foreground: "#ECEDEE",
            primary: {
              50: "#3B096C",
              100: "#520F83",
              200: "#7318A2",
              300: "#9823C2",
              400: "#c031e2",
              500: "#DD62ED",
              600: "#F182F6",
              700: "#FCADF9",
              800: "#FDD5F9",
              900: "#FEECFE",
              DEFAULT: "#DD62ED",
              foreground: "#ffffff",
            },
            focus: "#F182F6",
          },
          layout: {
            disabledOpacity: "0.3",
            radius: {
              small: "4px",
              medium: "6px",
              large: "8px",
            },
            borderWidth: {
              small: "1px",
              medium: "2px",
              large: "3px",
            },
          },
        },
        dark: {
          colors: {
            background: "#050810",
            foreground: "#ECEDEE",
            primary: {
              50: "#1a2332",
              100: "#3a4a5c",
              200: "#4a85ff",
              300: "#5890ff",
              400: "#6b9bff",
              500: "#7ea6ff",
              600: "#91b1ff",
              700: "#a4bcff",
              800: "#b7c7ff",
              900: "#cad2ff",
              DEFAULT: "#4a85ff",
              foreground: "#ffffff",
            },
            secondary: {
              DEFAULT: "#1f2937",
              foreground: "#f9fafb",
            },
            success: {
              DEFAULT: "#10b981",
              foreground: "#ffffff",
            },
            warning: {
              DEFAULT: "#f59e0b",
              foreground: "#ffffff",
            },
            danger: {
              DEFAULT: "#ef4444",
              foreground: "#ffffff",
            },
            focus: "#4a85ff",
          },
        },
      },
    }),
  ],
};
