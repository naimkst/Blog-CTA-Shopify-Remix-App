import { writeFile } from "fs/promises";
import path from "path";
import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json(
      { success: false, message: "Method not allowed" },
      { status: 405 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return json(
        { success: false, message: "No file uploaded" },
        { status: 400 },
      );
    }

    // Convert file to a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Define the upload path (public/uploads folder)
    const uploadPath = path.join(process.cwd(), "public", "uploads", file.name);

    // Save the file
    await writeFile(uploadPath, buffer);

    return json({
      success: true,
      message: "File uploaded successfully",
      filename: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return json(
      { success: false, message: "Error uploading file" },
      { status: 500 },
    );
  }
};
