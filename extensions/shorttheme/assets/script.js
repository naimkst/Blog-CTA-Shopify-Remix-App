(function ($) {
  "use strict";

  /*------------------------------------------
     product slider
  -------------------------------------------*/
  // document.addEventListener("DOMContentLoaded", function () {
  //   setTimeout(() => {
  //     console.log("DOM fully loaded and parsed");
  //     if ($(".product-active").length) {
  //       $(".product-active").owlCarousel({
  //         autoplay: true,
  //         smartSpeed: 300,
  //         margin: 30,
  //         loop: true,
  //         autoplayHoverPause: true,
  //         dots: false,
  //         nav: true,
  //         responsive: {
  //           0: {
  //             items: 1,
  //           },

  //           350: {
  //             items: 1,
  //           },
  //           500: {
  //             items: 2,
  //           },

  //           768: {
  //             items: 3,
  //           },
  //           992: {
  //             items: 3,
  //           },

  //           1200: {
  //             items: 3,
  //           },

  //           1400: {
  //             items: 4,
  //           },
  //         },
  //       });
  //     }
  //   }, 600);
  // });
})(window.jQuery);

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    console.log("DOM fully loaded and parsed");
    $(".product-active").owlCarousel({
      loop: true,
      margin: 10,
      nav: true,
      dots: true,
      autoplay: true,
      autoplayTimeout: 3000,
      autoplayHoverPause: true,
      responsive: {
        0: {
          items: 1,
        },
        600: {
          items: 2,
        },
        1000: {
          items: 3,
        },
      },
    });
  }, 900); // Delay to ensure HTML content is fully loaded
});

async function showData(paragraphClass, position, apiUrl) {
  const blogId = document.getElementById("blogId").value;

  console.log("Blog ID:===", blogId);

  try {
    // Fetch data from the API
    const response = await fetch(`${apiUrl}/itemById`, {
      method: "POST",

      body: JSON.stringify({
        id: blogId,
      }),
    });

    if (!response.ok) {
      console.error("Failed to fetch data:", response.statusText);
      return;
    }

    // Parse the JSON response
    const data = await response.json();
    console.log("Fetched Marketing data====:", data);
    let marketingData = data?.items[0];

    console.log("Marketing Data:===", marketingData);

    // ❌ Fix: Use a different variable name instead of `fetch`
    const categoryResponse = await fetch(`${apiUrl}/categoryById`, {
      method: "POST",

      body: JSON.stringify({
        id: "371132629219",
      }),
    });

    if (!categoryResponse.ok) {
      console.error(
        "Failed to fetch category data:",
        categoryResponse.statusText,
      );
      return;
    }

    const categoryData = await categoryResponse.json();
    let products = categoryData?.products;
    console.log("Fetched Data:===", products);

    // Create the HTML content dynamically
    const htmlContent = `
      <section class="product-area">
        <div class="my-container-fluid">
          <div class="section-title">
            <h2>${marketingData?.headline}</h2>
            <p>${marketingData?.description}</p>
          </div>
          <div class="product-wrap product-slide">
            <div class="row-grids product-active owl-carousel">
              ${products
                ?.map(
                  (product) => `
                <div class="grid">
                  <div class="product-item">
                    <div class="product-img">
                      <img src="${product?.image?.src}" alt="${product.title}">
                    </div>
                    <div class="product-text">
                      <h2><a href="/products/${product?.handle}">${product?.title}</a></h2>
                    </div>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
      </section>
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
    if (sentences.length / 2 < Number(data.items[0]?.position)) {
      console.warn("Paragraph does not contain enough sentences.");
      return;
    }

    // Find the index after the specified sentence count
    const insertionIndex = Number(data.items[0]?.position) * 2;

    // Insert the HTML content after the specified sentence
    sentences.splice(insertionIndex, 0, htmlContent);

    // Join the sentences back and set it as the new content
    paragraph.innerHTML = sentences.join("");
  } catch (error) {
    console.error("Error inserting content:", error);
  }
}

// Example: Insert HTML after 8 sentences
showData("article-template__content", 8, "http://localhost:3301/api");
