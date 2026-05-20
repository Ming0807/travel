import type { AttractionCard, DashboardMetricCard } from "@/types/tourism";

export const homepageAttractions: AttractionCard[] = [
  {
    slug: "aiyerweng-skywalk",
    name: "Aiyerweng Skywalk",
    province: "Yala",
    category: "Mountain view",
    description: "A misty Betong viewpoint suited for a QR certificate photo spot and route discovery.",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Mountain viewpoint with mist at sunrise",
    tags: ["Certificate spot", "Nature", "Yala"]
  },
  {
    slug: "pattani-central-mosque",
    name: "Pattani Cultural Landmark",
    province: "Pattani",
    category: "Culture",
    description: "A heritage-focused discovery card for stories, respectful travel guidance, and local routes.",
    imageUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Mosque architecture with blue sky",
    tags: ["Heritage", "Stories", "Pattani"]
  },
  {
    slug: "narathiwat-coast",
    name: "Narathiwat Coast",
    province: "Narathiwat",
    category: "Coastal route",
    description: "A coastal discovery prompt for future route planning and community tourism content.",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Tropical beach and sea",
    tags: ["Route", "Sea", "Narathiwat"]
  },
  {
    slug: "songkhla-old-town",
    name: "Songkhla Old Town",
    province: "Songkhla",
    category: "Future expansion",
    description: "The data model can expand to wider southern border travel areas without changing the MVP core loop.",
    imageUrl: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Colorful old town street in Southeast Asia",
    tags: ["Future", "Stories", "Songkhla"]
  },
  {
    slug: "satun-geopark-route",
    name: "Satun Geopark Route",
    province: "Satun",
    category: "Future route",
    description: "Future route cards can connect nearby southern provinces while preserving dashboard filters.",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Limestone landscape and water",
    tags: ["Future", "Nature", "Satun"]
  }
];

export const dashboardPreviewMetrics: DashboardMetricCard[] = [
  {
    label: "QR Scans",
    value: "Separate",
    note: "Entry interest, not visits."
  },
  {
    label: "Tourist Profiles",
    value: "Estimated",
    note: "System profiles, not verified people."
  },
  {
    label: "Estimated Spending",
    value: "Range",
    note: "Planning estimate, not revenue."
  },
  {
    label: "Satisfaction",
    value: "No data",
    note: "Missing answers are never zero."
  }
];

export const suggestedRoutes = [
  {
    name: "Mist to Culture",
    summary: "Yala mountain viewpoint, Pattani heritage stop, local food story cards.",
    status: "Phase 2 content"
  },
  {
    name: "Coast and Community",
    summary: "Narathiwat coastal discovery with community attraction prompts.",
    status: "Phase 2 content"
  },
  {
    name: "Southern Border Plus",
    summary: "Future extension for Songkhla and Satun while keeping core analytics province-aware.",
    status: "Future"
  }
];
