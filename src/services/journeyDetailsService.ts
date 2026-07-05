import apiFetch from "./api";

export type Journey = {
  journeyId: number;
  journeyGuid: string;
  journeyName: string;
  slug: string;
  destinationId: number;
  destinationName: string;
  journeyTypeId: number;
  journeyTypeName: string;
  duration: string;
  shortDescription: string;
  longDescription: string;
  heroImage: string;
  priceFrom: number;
  isFeatured: boolean;
  isActive: boolean;
};

export type JourneyItinerary = {
  journeyItineraryId: number;
  journeyItineraryGuid: string;
  dayNumber: number;
  title: string;
  description: string;
  displayOrder: number;
};

export type JourneyInclusion = {
  journeyInclusionId: number;
  journeyInclusionGuid: string;
  inclusion: string;
  displayOrder: number;
};

export type JourneyExclusion = {
  journeyExclusionId: number;
  journeyExclusionGuid: string;
  exclusion: string;
  displayOrder: number;
};

export type JourneyFAQ = {
  journeyFAQId: number;
  journeyFAQGuid: string;
  question: string;
  answer: string;
  displayOrder: number;
};

export type JourneyDestination = {
  destinationId: number;
  destinationGuid: string;
  destinationName: string;
  slug: string;
  heroImage: string;
};

export type JourneyDetails = {
  journey: Journey;
  itinerary: JourneyItinerary[];
  inclusions: JourneyInclusion[];
  exclusions: JourneyExclusion[];
  faQs: JourneyFAQ[];
  destinations: JourneyDestination[];
};

export const journeyDetailsService = {
  async getBySlug(slug: string): Promise<JourneyDetails> {
    return await apiFetch<JourneyDetails>(`/Journey/${slug}`);
  },
};