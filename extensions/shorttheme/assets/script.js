async function insertAfterSentenceCountWithFetch(
  paragraphClass,
  sentenceCount,
  apiUrl,
) {
  const blogId = document.getElementById("blogId").value;
  try {
    // Fetch data from the API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error("Failed to fetch data:", response.statusText);
      return;
    }

    // Parse the JSON response
    const data = await response.json();
    console.log("Fetched Data:", data.items);

    // Extract required fields from the response
    const productImage =
      data.items[2].productImage || "https://via.placeholder.com/150"; // Default image
    const productTitle = data.items[2].productTitle || "Default Title";
    const productLink = data.items[2].link || "#";

    // Create the HTML content dynamically
    const htmlContent = `
      <div class='ctaBox'>
        <img src='${productImage}' alt='' />
        <h2>${productTitle}</h2>
        <a href='${productLink}' target='_blank'>View</a>
      </div>
    `;

    // Get the paragraph element by class name
    const paragraph = document.getElementsByClassName(paragraphClass)[0];

    if (!paragraph) {
      console.error("Paragraph element not found");
      return;
    }

    // Get the paragraph content as plain text
    const originalContent = paragraph.innerHTML;

    // Split content by sentences (e.g., ".", "?", "!")
    const sentences = originalContent.split(/([.?!]+)/);

    // Check if there are enough sentences
    if (sentences.length / 2 < Number(data.items[2].position)) {
      console.warn("Paragraph does not contain enough sentences.");
      return;
    }

    // Find the index after the specified sentence count
    const insertionIndex = Number(data.items[2].position) * 2; // Each sentence has text + delimiter

    // Insert the HTML content after the specified sentence
    sentences.splice(insertionIndex, 0, htmlContent);

    // Join the sentences back and set it as the new content
    paragraph.innerHTML = sentences.join("");
  } catch (error) {
    console.error("Error inserting content:", error);
  }
}

// Example: Insert HTML after 3 sentences, fetching data from an API
insertAfterSentenceCountWithFetch(
  "article-template__content",
  8,
  "http://localhost:51205/api/items", // Replace with your API endpoint
);
