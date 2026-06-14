export type Market = "india" | "us";

export type PricingPlan = {
  id: "starter" | "growth" | "done_for_you";
  name: string;
  price: string;
  description: string;
};

export const pricingByMarket: Record<Market, PricingPlan[]> = {
  india: [
    {
      id: "starter",
      name: "Starter",
      price: "Rs 499",
      description: "Basic SEO fix plan for a small website."
    },
    {
      id: "growth",
      name: "Growth",
      price: "Rs 1,499",
      description: "One-click fixes for the top SEO issues."
    },
    {
      id: "done_for_you",
      name: "Done For You",
      price: "Rs 4,999",
      description: "We review and fix your important pages."
    }
  ],
  us: [
    {
      id: "starter",
      name: "Starter",
      price: "$9",
      description: "Basic SEO fix plan for a small website."
    },
    {
      id: "growth",
      name: "Growth",
      price: "$29",
      description: "One-click fixes for the top SEO issues."
    },
    {
      id: "done_for_you",
      name: "Done For You",
      price: "$99",
      description: "We review and fix your important pages."
    }
  ]
};
