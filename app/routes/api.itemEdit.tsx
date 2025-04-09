import { json, LoaderFunction } from "@remix-run/node";
import { ActionFunction } from "@remix-run/node";
import { cors } from "remix-utils/cors";
import { prisma } from "app/db.server";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json();

  try {
    const blogId = body.id;

    const items = await prisma.marketing.findUnique({
      where: {
        id: blogId,
      },
    });
    // return { reviews };
    const response = json({
      items,
    });

    return await cors(request, response);
  } catch (error) {
    console.error("Error fetching items:", error);
  }
};
