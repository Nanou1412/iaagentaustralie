import { ArrowRight, Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { industries } from "@/lib/industry-config";
import {
  UtensilsCrossed,
  Stethoscope,
  ShoppingBag,
  Building,
} from "lucide-react";

function getIndustryIcon(iconName: string) {
  switch (iconName) {
    case "UtensilsCrossed":
      return <UtensilsCrossed className="h-8 w-8" />;
    case "Stethoscope":
      return <Stethoscope className="h-8 w-8" />;
    case "ShoppingBag":
      return <ShoppingBag className="h-8 w-8" />;
    case "Building":
      return <Building className="h-8 w-8" />;
    default:
      return <Building className="h-8 w-8" />;
  }
}

function getIndustryGradient(slug: string) {
  switch (slug) {
    case "restaurants":
      return "from-orange-500 to-red-500";
    case "healthcare":
      return "from-green-500 to-emerald-500";
    case "retail":
      return "from-blue-500 to-cyan-500";
    case "realestate":
      return "from-purple-500 to-pink-500";
    default:
      return "from-blue-500 to-purple-500";
  }
}

export default function IndustriesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">Industry Solutions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">Choose your industry</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            See how Emma adapts to your specific business needs
          </p>
        </div>

        {/* Industry cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {industries.map((industry, index) => (
            <Card
              key={industry.slug}
              className={`relative transition-all duration-300 animate-fade-in group ${
                industry.available
                  ? "hover:scale-[1.02] hover:border-blue-500/30 cursor-pointer"
                  : "opacity-50"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {industry.available && (
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${getIndustryGradient(industry.slug)} opacity-0 group-hover:opacity-5 transition-opacity`} />
              )}
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getIndustryGradient(industry.slug)} p-[1px]`}>
                    <div className="w-full h-full rounded-xl bg-background flex items-center justify-center text-foreground">
                      {getIndustryIcon(industry.icon)}
                    </div>
                  </div>
                  {!industry.available && (
                    <Badge variant="secondary" className="bg-white/5">Coming soon</Badge>
                  )}
                  {industry.available && (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Available</Badge>
                  )}
                </div>
                <CardTitle className="mt-4 text-xl">{industry.name}</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  {industry.description}
                </CardDescription>
              </CardHeader>

              <CardFooter>
                {industry.available ? (
                  <Button asChild className="w-full gap-2 group-hover:glow-blue">
                    <a href={industry.slug === "restaurants" ? "/restaurant" : `/industry/${industry.slug}`}>
                      Talk to Emma
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                ) : (
                  <Button disabled variant="outline" className="w-full opacity-50">
                    Coming soon
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Back link */}
        <div className="text-center mt-12">
          <Button variant="ghost" asChild>
            <a href="/">← Back to home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
