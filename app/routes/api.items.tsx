import { json, LoaderFunction } from "@remix-run/node";
import { ActionFunction } from "@remix-run/node";
import { cors } from "remix-utils/cors";
import prisma from "../db.server";

export const loader = async ({ request }: any) => {
  const items = await prisma.marketing.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      status: "2",
    },
  });
  // return { reviews };
  const response = json({
    items,
  });
  return await cors(request, response);
};
