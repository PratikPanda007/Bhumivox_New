import apiFetch from "./api";

export interface Destination {
  destinationId: number;
  destinationGuid: string;
  destinationName: string;
  slug: string;
  shortDescription: string;
  heroImage: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}

export const destinationApi = {
  async getAll(): Promise<Destination[]> {
    return await apiFetch<Destination[]>("/Destination");
  },
};