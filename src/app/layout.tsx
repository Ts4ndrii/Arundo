import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import AppShell from "@/components/AppShell";
import { buildRouteMetadata, getLanguageFromCookies } from "@/lib/site-metadata";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildRouteMetadata("home"),
    icons: {
      icon: "/favicon.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const language = getLanguageFromCookies();

  return (
    <html lang={language} suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
  try {
    var stored = window.localStorage.getItem("arundo-settings");

    if (!stored) {
      return;
    }

    var parsed = JSON.parse(stored);
    var isDark = parsed && parsed.theme === "dark";

    document.documentElement.classList.toggle("dark", Boolean(isDark));
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  } catch (error) {
    // Ignore theme bootstrap errors.
  }
})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
  var extensionId = "chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn";

  function shouldIgnore(event) {
    try {
      var message = "";
      var filename = "";
      var stack = "";

      if (event) {
        if (typeof event.message === "string") {
          message = event.message;
        }

        if (typeof event.filename === "string") {
          filename = event.filename;
        }

        if (event.error && typeof event.error.stack === "string") {
          stack = event.error.stack;
        }

        if (event.reason && typeof event.reason.message === "string") {
          message = event.reason.message;
        }

        if (event.reason && typeof event.reason.stack === "string") {
          stack = event.reason.stack;
        }
      }

      return /Failed to connect to MetaMask/i.test(message) ||
        message.toLowerCase().indexOf("metamask") !== -1 &&
        (filename.indexOf(extensionId) !== -1 || stack.indexOf(extensionId) !== -1);
    } catch (error) {
      return false;
    }
  }

  window.addEventListener("error", function (event) {
    if (shouldIgnore(event)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener("unhandledrejection", function (event) {
    if (shouldIgnore(event)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
})();`,
          }}
        />
        <AppShell>{children}</AppShell>
        <SpeedInsights />
      </body>
    </html>
  );
}
