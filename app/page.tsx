import Hero from "@/components/sections/Hero";
import SummaryCards from "@/components/sections/SummaryCards";
import UpcomingEvents from "@/components/sections/UpcomingEvents";
import MembershipTeaser from "@/components/sections/MembershipTeaser";
import WonderWomenSpotlight from "@/components/sections/WonderWomenSpotlight";
import DonateTeaser from "@/components/sections/DonateTeaser";
import SponsorsMarquee from "@/components/sections/SponsorsMarquee";

export default function Home() {
  return (
    <div className="w-full">
      <Hero />
      <SummaryCards />
      <UpcomingEvents />
      <MembershipTeaser />
      <WonderWomenSpotlight />
      <DonateTeaser />
      <SponsorsMarquee />
    </div>
  );
}









