import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { HowItWorks } from "@/components/HowItWorks";
import { AttackSurface } from "@/components/AttackSurface";
import { Research } from "@/components/Research";
import { WaitlistSection } from "@/components/WaitlistSection";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <InteractiveDemo />
      <HowItWorks />
      <AttackSurface />
      <Research />
      <WaitlistSection />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
