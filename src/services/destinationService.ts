const API_URL = "https://localhost:7077/api/destination";

export type Destination = {
  destinationId: number;
  destinationGuid: string;
  destinationName: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  heroImage: string;
  region: string;
  tagline: string;
  circuit: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
};

export const destinationService = {
  async getAll(): Promise<Destination[]> {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load destinations.");
    }

    return await response.json();
  },

  async getBySlug(slug: string): Promise<Destination> {
    const response = await fetch(`${API_URL}/${slug}`);

    if (!response.ok) {
      throw new Error("Destination not found.");
    }

    return await response.json();
  },
};