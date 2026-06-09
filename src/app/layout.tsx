import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import AnalyticsNotice from "@/components/analytics-notice";
import { env } from "@/lib/env";
import { COLOR_THEME_STORAGE_KEY, COLOR_THEME_VALUES, DEFAULT_COLOR_THEME } from "@/lib/color-theme";

const colorThemeInitScript = `
(() => {
  try {
    const allowed = ${JSON.stringify(COLOR_THEME_VALUES)};
    const stored = window.localStorage.getItem("${COLOR_THEME_STORAGE_KEY}");
    const theme = allowed.includes(stored) ? stored : "${DEFAULT_COLOR_THEME}";
    document.documentElement.setAttribute("data-color-theme", theme);
  } catch {
    document.documentElement.setAttribute("data-color-theme", "${DEFAULT_COLOR_THEME}");
  }
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SaleDock Cloud POS",
  description:
    "SaleDock is a cloud POS platform for shops to manage sales, inventory, repairs, invoices, expenses, and reports.",
  verification: {
    google: "4yFsod3SEer6gpo9UjvizFLcwif5c9ZcG1nOZ-2mUcQ",
  },
  other: {
    ...(env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? {
          "google-site-verification": env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        }
      : {}),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-color-theme={DEFAULT_COLOR_THEME}
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${notoNastaliqUrdu.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: colorThemeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
        <AnalyticsNotice
          gaMeasurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
          clarityProjectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}
        />
      </body>
    </html>
  );
}
