import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/use-auth";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { registerPWA } from "@/lib/pwa";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KRUH ŽIVLJENJA" },
      { name: "description", content: "Načrtovanje prevzemov in razdeljevanja hrane / Food pickup and distribution planner" },
      { property: "og:title", content: "KRUH ŽIVLJENJA" },
      { name: "twitter:title", content: "KRUH ŽIVLJENJA" },
      { property: "og:description", content: "Načrtovanje prevzemov in razdeljevanja hrane / Food pickup and distribution planner" },
      { name: "twitter:description", content: "Načrtovanje prevzemov in razdeljevanja hrane / Food pickup and distribution planner" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/g9Wx1IBlv0O8UCVKRCU69xaSxT13/social-images/social-1778477580629-kruh_zivljenja_LOGO.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/g9Wx1IBlv0O8UCVKRCU69xaSxT13/social-images/social-1778477580629-kruh_zivljenja_LOGO.webp" },
      { name: "theme-color", content: "#a06f3a" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Kruh življenja" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="mt-2 text-muted-foreground">Stran ne obstaja / Page not found</p>
        <Link to="/" className="mt-6 inline-block text-primary underline">Domov / Home</Link>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => { registerPWA(); }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <Outlet />
          <PwaInstallBanner />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
