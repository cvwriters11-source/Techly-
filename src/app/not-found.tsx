import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-start py-28">
      <Link href="/" aria-label="Techly home">
        <Logo />
      </Link>
      <h1 className="mt-10 font-display text-4xl font-semibold">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-muted">
        That page does not exist. Head back home or tell us what you were looking for.
      </p>
      <div className="mt-8 flex gap-3">
        <Button href="/">Home</Button>
        <Button href="/contact">
          Contact
        </Button>
      </div>
    </Container>
  );
}
