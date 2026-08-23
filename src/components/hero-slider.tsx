"use client";

import { useCallback, useEffect, useState } from "react";
import { HeroIllustration } from "@/components/hero-illustration";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import { heroSlides, stats } from "@/lib/site";

const INTERVAL = 7000;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = heroSlides[index];

  const goTo = useCallback((next: number) => {
    setIndex((next + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % heroSlides.length);
    }, INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden pb-12 pt-4 sm:pt-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Software development and IT support highlights"
    >
      <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[70%] w-[70%] bg-[radial-gradient(ellipse_at_center,rgba(18,200,176,0.18),transparent_60%)]" />

      <Container className="relative">
        <div className="grid items-center gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6">
          <div key={slide.title} className="animate-[reveal-in_0.55s_ease-out]">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-accent sm:text-5xl lg:text-[3.35rem] lg:leading-[1.12]">
              {slide.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white sm:text-lg">
              {slide.text}
            </p>
            <div className="mt-8">
              <Button href={slide.href}>{slide.cta}</Button>
            </div>
          </div>

          <HeroIllustration />
        </div>

        <div className="mt-6 flex justify-center gap-2 lg:justify-start">
          {heroSlides.map((item, slideIndex) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Show: ${item.title}`}
              aria-current={slideIndex === index}
              onClick={() => goTo(slideIndex)}
              className={cn(
                "h-2 rounded-full transition-all",
                slideIndex === index
                  ? "w-7 bg-accent"
                  : "w-2 bg-white/25 hover:bg-white/50",
              )}
            />
          ))}
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-10">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-semibold text-accent sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-white/75">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
