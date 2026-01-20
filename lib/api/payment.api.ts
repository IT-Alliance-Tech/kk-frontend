import { apiPost } from "@/lib/api";

export async function initiatePayment(orderId: string) {
    try {
        const response = await apiPost<any>("/payment/initiate", { orderId });
        // The response is already unwrapped data by apiPost, so we return it directly.
        // However, my controller returns { success, data: { redirectUrl } }.
        // apiPost unwraps to the `data` field of the envelope IF success is true.
        // So `response` here will be { redirectUrl, merchantTransactionId }.
        // Wait, let's double check apiPost implementation.
        return response;
    } catch (error) {
        throw error;
    }
}
