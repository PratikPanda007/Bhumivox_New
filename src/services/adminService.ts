import apiFetch from "./api";

export type Booking = {
    bookingId: number;
    bookingGuid: string;

    journeyId: number;
    journeyName: string;

    fullName: string;
    email: string;
    mobileNumber: string;

    country: string;
    city: string;

    adults: number;
    children: number;

    preferredDepartureDate: string;

    bookingStatus: string;
    paymentStatus: string;

    amount: number;

    createdOn: string;
};

export type PaymentLink = {
    paymentLinkId: number;
    razorpayPaymentLinkId: string;
    razorpayShortUrl: string;
    amount: number;
};

export const adminService = {

    async getBookings(): Promise<Booking[]> {
        //return await apiFetch<Booking[]>("/Admin/Bookings");
        const result = await apiFetch<{
            success: boolean;
            data: Booking[];
        }>("/Admin/Bookings");

        return result.data;
    },

    async getBooking(id: number): Promise<Booking> {
        return await apiFetch<Booking>(`/Admin/Bookings/${id}`);
    },

    async generatePaymentLink(id: number, amount: number): Promise<PaymentLink> {
        return await apiFetch<PaymentLink>(
            `/Admin/Bookings/${id}/GeneratePaymentLink`,
            {
                method: "POST",
                 body: JSON.stringify({
                amount
            })
            }
        );
    },

    async getPaymentLink(id: number): Promise<string | null> {
        const result = await apiFetch<{
            paymentLink: string | null;
        }>(`/Admin/Bookings/${id}/PaymentLink`);

        return result.paymentLink;
    },

    async markPaid(id: number): Promise<void> {
        await apiFetch(
            `/Admin/Bookings/${id}/MarkPaid`,
            {
                method: "POST"
            }
        );
    }

};