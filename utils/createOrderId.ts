import axios from "axios";

export async function createOrderId(amount: number, currency: string, planType: 'basic' | 'pro') {
  try {
    const response = await axios.post("/api/createOrder", {
      amount,
      currency: "INR",
      planType
    });

    console.log("Order Response:", response.data);
    return response.data.orderId;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create order");
  }
}
