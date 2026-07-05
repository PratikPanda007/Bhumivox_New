import apiFetch from "./api";

export type Role = {
  roleId: number;
  roleGuid: string;
  roleName: string;
};

export type JourneyType = {
  journeyTypeId: number;
  journeyTypeGuid: string;
  journeyTypeName: string;
  description: string;
  displayOrder: number;
};

export type TravelStyle = {
  travelStyleId: number;
  travelStyleGuid: string;
  travelStyleName: string;
  description: string;
  displayOrder: number;
};

export type BookingStatus = {
  bookingStatusId: number;
  bookingStatusGuid: string;
  statusName: string;
  displayOrder: number;
};

export type PaymentStatus = {
  paymentStatusId: number;
  paymentStatusGuid: string;
  statusName: string;
  displayOrder: number;
};

export const masterService = {
  getRoles() {
    return apiFetch<Role[]>("/master/roles");
  },

  getJourneyTypes() {
    return apiFetch<JourneyType[]>("/master/journey-types");
  },

  getTravelStyles() {
    return apiFetch<TravelStyle[]>("/master/travel-styles");
  },

  getBookingStatus() {
    return apiFetch<BookingStatus[]>("/master/booking-status");
  },

  getPaymentStatus() {
    return apiFetch<PaymentStatus[]>("/master/payment-status");
  },
};