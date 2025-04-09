import { json } from "@remix-run/node";
import { cors } from "remix-utils/cors";

export const action = async ({ request }: any) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const shop = process.env.SHOPIFY_STORE_NAME;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  try {
    const body = await request.json();
    const collectionId = body.id;

    if (!collectionId || isNaN(Number(collectionId))) {
      return json(
        { error: "Invalid or missing Collection ID" },
        { status: 400 },
      );
    }

    // Fetch products in the given collection
    const response = await fetch(
      `https://${shop}/admin/api/2025-01/collections/${collectionId}/products.json`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Shopify API Error: ${JSON.stringify(data.errors || "Unknown error")}`,
      );
    }

    const result = json({ products: data.products });
    return await cors(request, result);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
};
