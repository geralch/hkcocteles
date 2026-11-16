import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Hero from "@/components/landing/Hero";
import FeaturedDrinks from "@/components/landing/FeaturedDrinks";
import About from "@/components/landing/About";
import Location from "@/components/landing/Location";
import Gallery from "@/components/landing/Gallery";
import LocalBusinessJsonLd from "@/components/landing/LocalBusinessJsonLd";

export const revalidate = 60;

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <LocalBusinessJsonLd />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FeaturedDrinks />
        <About />
        <Location />
        <Gallery />
      </main>
      <SiteFooter />
    </div>
  );
}
