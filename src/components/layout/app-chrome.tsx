"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { WhatsAppButton } from "@/components/whatsapp-button";

export function AppChrome({
  children,
  signedIn,
  authMode = null,
  marketingPublicEnabled = true,
}: {
  children: React.ReactNode;
  signedIn: boolean;
  authMode?: "client" | "marketing" | null;
  marketingPublicEnabled?: boolean;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
  }

  return (
    <>
      <Header
        signedIn={signedIn}
        authMode={authMode}
        marketingPublicEnabled={marketingPublicEnabled}
      />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
