"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PromoPopup } from "@/components/promo-popup";
import { WhatsAppButton } from "@/components/whatsapp-button";
import type { SiteMessage } from "@/lib/site-messages/store";

export function AppChrome({
  children,
  signedIn,
  siteMessage,
}: {
  children: React.ReactNode;
  signedIn: boolean;
  siteMessage: SiteMessage;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
  }

  return (
    <>
      <Header signedIn={signedIn} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <PromoPopup message={siteMessage} />
    </>
  );
}
