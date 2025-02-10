import { ActionFunction, json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const shop = "app-development-qa.myshopify.com";
  const accessToken = "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";

  const body = await request.json();
  const { blogId } = body;

  if (!blogId) {
    return json({ error: "Missing blogId" }, { status: 400 });
  }

  try {
    // Fetch collections (categories) from Shopify
    const response = await fetch(
      `https://${shop}/admin/api/2025-01/blogs/${blogId}/articles.json`,
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

    return json({ articles: data.articles });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return json({ error: error.message }, { status: 500 });
  }
};
