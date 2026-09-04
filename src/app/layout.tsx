import type { Metadata } from "next";
import { AppChrome } from "@/components/layout/app-chrome";
import { getClientUser } from "@/lib/client-auth";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://techly.co.za"),
  title: {
    default: `${site.name} · Software Development & IT Solutions`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    type: "website",
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
