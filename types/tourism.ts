export type Locale = "th" | "en";

export type ProvinceKey = "yala" | "pattani" | "narathiwat" | "songkhla" | "satun";

export type AttractionCard = {
  slug: string;
  name: string;
  province: string;
  category: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  tags: string[];
};

export type RestaurantCard = {
  slug: string;
  name: string;
  province: string;
  foodType: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  rating?: number;
  reviewCount?: number;
};

export type RestaurantDetail = {
  slug: string;
  name: string;
  province: string;
  provinceId: number;
  foodType: string | null;
  description: string | null;
  addressText: string | null;
  openingHours: string | null;
  contactInfo: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  isPublished: boolean;
  nearbyAttractions: {
    slug: string;
    name: string;
    distanceText: string | null;
    imageUrl: string | null;
  }[];
};

export type ReviewCard = {
  reviewId: number;
  touristName: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
};

export type ReviewStats = {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>; // {1: count, 2: count, ...}
};

export type PublicReviewSubmission = {
  attractionId?: number;
  restaurantId?: number;
  rating: number;
  title?: string;
  comment?: string;
};

export type DashboardMetricCard = {
  label: string;
  value: string;
  note: string;
};

export type BadgeCategory = "exploration" | "engagement" | "milestone" | "social";

export type BadgeDefinition = {
  badgeId: number;
  badgeKey: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string | null;
  descriptionEn: string | null;
  iconName: string | null;
  iconColor: string;
  category: BadgeCategory;
  requirementType: string;
  requirementValue: number;
  requirementExtra: string | null;
  displayOrder: number;
  isActive: boolean;
};

export type TouristBadge = {
  badgeAwardId: string;
  badge: BadgeDefinition;
  earnedAt: string;
};

export type XPLevelInfo = {
  currentXp: number;
  currentLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progress: number; // 0-1
};

export type LeaderboardEntry = {
  rank: number;
  touristId: string;
  touristName: string;
  totalXp: number;
  badgeCount: number;
  stampCount: number;
  visitCount: number;
  level: number;
};

export type PlaceholderPageStatus = "MVP placeholder" | "Planned" | "Future";
