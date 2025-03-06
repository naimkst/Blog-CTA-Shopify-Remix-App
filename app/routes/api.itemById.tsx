import { json, LoaderFunction } from "@remix-run/node";
import { ActionFunction } from "@remix-run/node";
import { cors } from "remix-utils/cors";
import prisma from "../db.server";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json();

  try {
    const items = await prisma.marketing.findMany({
      where: {
        blogId: body.id,
      },
      orderBy: {
        createdAt: "desc",
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
