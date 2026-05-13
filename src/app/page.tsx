"use client";

import { ArrowRight, BarChart3, BookOpen, MapPin, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppUI } from "@/components/AppShell";
import { getUiCopy } from "@/lib/ui-copy";
import heroImage from "../../pictures/main page.jpg";
import map2Image from "../../pictures/Dekstop - Map 2.png";
import wikiImage from "../../pictures/Dekstop - Wiki.png";
import statsImage from "../../pictures/Dekstop - Stats.png";
import profileImage from "../../pictures/Dekstop - Profile.png";

export default function HomePage() {
  const { openAuth, language, user } = useAppUI();
  const copy = getUiCopy(language);
  const homepageFeatures = [
    {
      icon: MapPin,
      title: copy.home.features[0].title,
      description: copy.home.features[0].description,
      image: map2Image,
    },
    {
      icon: BookOpen,
      title: copy.home.features[1].title,
      description: copy.home.features[1].description,
      image: wikiImage,
    },
    {
      icon: BarChart3,
      title: copy.home.features[2].title,
      description: copy.home.features[2].description,
      image: statsImage,
    },
    {
      icon: Award,
      title: copy.home.features[3].title,
      description: copy.home.features[3].description,
      image: profileImage,
    },
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 transition-colors duration-200 sm:px-6 lg:px-8 lg:py-8 dark:bg-slate-950">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={copy.home.heroImageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.24),rgba(15,23,42,0.66))]" />
        </div>

        <div className="relative flex min-h-[34rem] items-center justify-center px-6 py-16 text-center sm:px-10 lg:px-16">
          <div className="max-w-4xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80 backdrop-blur-sm">
              {copy.home.badge}
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
              {copy.home.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
              {copy.home.description}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {!user ? (
                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20"
                >
                  {copy.home.ctaRegister}
                </button>
              ) : null}
              <Link
                href="/map"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                {copy.home.ctaMap}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {homepageFeatures.map((feature) => (
          <article
            key={feature.title}
            className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_36px_-28px_rgba(15,23,42,0.45)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="p-6 pb-5 sm:p-7 sm:pb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-slate-800 dark:text-blue-300 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                <feature.icon className="h-[22px] w-[22px]" />
              </div>
              <h2 className="mt-6 max-w-[13rem] text-[1.35rem] font-extrabold leading-7 tracking-tight text-slate-900 dark:text-slate-100">
                {feature.title}
              </h2>
              <p className="mt-4 max-w-[18rem] text-[0.98rem] leading-7 text-slate-600 dark:text-slate-300">
                {feature.description}
              </p>
            </div>

            <div className="relative mt-auto h-44 overflow-hidden">
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.18))]" />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}