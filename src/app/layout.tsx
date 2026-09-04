import type { Metadata } from "next";
import { AppChrome } from "@/components/layout/app-chrome";
import { getClientUser } from "@/lib/client-auth";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · Software Development & IT Solutions`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const client = await getClientUser();

  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <AppChrome signedIn={Boolean(client)}>{children}</AppChrome>
      </body>
    </html>
  );
}
