import { json, LoaderFunction } from "@remix-run/node";
import { ActionFunction } from "@remix-run/node";
import { cors } from "remix-utils/cors";
import {prisma} from "../db.server";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json();

  try {
    const blogId = body.id;

    console.log("blogIds=====", blogId);
    const items = await prisma.marketing.findMany({
      where: {
        blogId: {
          contains: blogId, // Checks if searchId exists in the comma-separated list
        },
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
