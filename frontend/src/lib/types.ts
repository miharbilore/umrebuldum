/**
 * Core Domain Types for Umrebuldum
 * Standardized to CamelCase for the modern Prisma/Next.js architecture.
 */

export interface Hotel {
  name: string;
  stars: number;
  location?: string;
  city?: string;
  distanceToHaram?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface Tour {
  id: string | number;
  slug: string;
  title: string;
  featuredImage?: string;
  thumbnail?: string;
  price: number;
  duration: string;
  departureCity: string;
  hotels: Hotel[];
  itinerary: ItineraryDay[];
  guideName?: string;
  guidePhone?: string;
  agencyName?: string;
  agencyPhone?: string;
  agencyEmail?: string;
  images?: string[];
  included?: string[];
  excluded?: string[];
  emergencyContacts?: EmergencyContact[];
  rating?: number;
  reviewCount?: number;
  description?: string;
}

export interface TourListItem {
  id: string | number;
  slug: string;
  title: string;
  featuredImage?: string;
  thumbnail?: string;
  price: number;
  duration: string;
  departureCity: string;
  rating?: number;
  reviewCount?: number;
  agencyName?: string;
  featured?: boolean;
}

export interface ToursResponse {
  tours: TourListItem[];
  total: number;
  totalPages: number;
}

export interface TourFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  perPage?: number;
}

export interface City {
  id?: number;
  name: string;
  slug?: string;
  count?: number;
}
