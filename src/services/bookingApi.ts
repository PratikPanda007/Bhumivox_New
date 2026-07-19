import apiFetch from "./api";

export interface CreateBookingRequest {
    journeyId: number[];
    fullName: string;
    email: string;
    mobileNumber: string;
    country: string;
    city: string;
    adults: number;
    children: number;
    preferredDepartureDate: Date;
    specialRequirements?: string;
}

export interface BookingResponse {
    bookingGroupId: number;
    bookingGroupGuid: string;

    bookingId: number;
    bookingGuid: string;

    journeyName: string;

    fullName: string;
    email: string;
    mobileNumber: string;

    adults: number;
    children: number;

    preferredDepartureDate: string;

    specialRequirements: string;

    createdOn: string;

    bookingStatus: string;

    amount: number | null;
    currency: string;

    paymentStatus: string;

    razorpayPaymentLinkId: string | null;
    razorpayShortUrl: string | null;
}

export const bookingApi = {
    createBooking(request: CreateBookingRequest) {
        return apiFetch("/Booking", {
            method: "POST",
            body: JSON.stringify(request),
        });
    },

    async getMyBookings(): Promise<BookingResponse[]> {
        const response = await apiFetch<{
            success: boolean;
            data: BookingResponse[];
        }>("/Booking/MyBookings");

        return response.data;
    },
};

export type BookingGroup = {
    bookingGroupId: number;
    bookingGroupGuid: string;
    bookings: BookingResponse[];
};

export function groupBookings(
    bookings: BookingResponse[]
): BookingGroup[] {

    const map = new Map<number, BookingGroup>();

    bookings.forEach((booking) => {

        let group = map.get(booking.bookingGroupId);

        if (!group) {
            group = {
                bookingGroupId: booking.bookingGroupId,
                bookingGroupGuid: booking.bookingGroupGuid,
                bookings: [],
            };

            map.set(booking.bookingGroupId, group);
        }

        group.bookings.push(booking);
    });

    return [...map.values()];
}