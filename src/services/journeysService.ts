import apiFetch from "./api";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

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

export const journeysService = {
  async getAll(): Promise<Journey[]> {
    const response = await apiFetch<ApiResponse<Journey[]>>("/Journey");
    return response.data;
  },
};