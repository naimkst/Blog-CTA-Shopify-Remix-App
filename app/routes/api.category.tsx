import { json } from "@remix-run/node";

export const loader = async ({ request }: any) => {
  const shop = "app-development-qa.myshopify.com";
  const accessToken = "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";

  try {
    // Fetch collections (categories) from Shopify
    const response = await fetch(
      `https://${shop}/admin/api/2025-01/custom_collections.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Shopify API Error: ${data.errors || "Unknown error"}`);
    }

    return json({ collections: data });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return json({ error: error.message }, { status: 500 });
  }
};
