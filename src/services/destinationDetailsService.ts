import apiFetch from "./api";

export type Destination = {
  destinationId: number;
  destinationGuid: string;
  destinationName: string;
  slug: string;
  shortDescription: string;
  longDescription: string | null;
  heroImage: string;
  region: string;
  tagline: string;
  circuit: string;
  significance: string;
  geography: string;
  bestTime: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
};

export type DestinationGallery = {
  destinationGalleryId: number;
  destinationGalleryGuid: string;
  imageUrl: string;
  caption: string;
  displayOrder: number;
};

export type DestinationHighlight = {
  destinationHighlightId: number;
  destinationHighlightGuid: string;
  highlight: string;
  displayOrder: number;
};

export type RelatedJourney = {
  journeyId: number;
  journeyGuid: string;
  journeyName: string;
  slug: string;
  shortDescription: string;
  heroImage: string;
  duration: string;
  priceFrom: number;
};

export type DestinationDetails = {
  destination: Destination;
  gallery: DestinationGallery[];
  highlights: DestinationHighlight[];
  relatedJourneys: RelatedJourney[];
};

export const destinationDetailsService = {
  async getBySlug(slug: string): Promise<DestinationDetails> {
    return await apiFetch<DestinationDetails>(`/destination/${slug}`);
  },
};