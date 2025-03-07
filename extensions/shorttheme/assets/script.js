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
      autoplay: true,
      smartSpeed: 300,
      margin: 10,
      loop: true,
      autoplayHoverPause: true,
      dots: false,
      nav: true,
      responsive: {
        0: {
          items: 2,
        },
        600: {
          items: 3,
        },
        1000: {
          items: 4,
        },
      },
    });
  }, 1200); // Delay to ensure HTML content is fully loaded
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
    let blogData = data?.items;

    console.log("item dataaaaaaaa:===", data);

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
    const layout1 = `
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
                  <a href="/products/${product?.handle}">
                    <div class="product-img">
                      <img src="${product?.image?.src}" alt="${product.title}">
                    </div>
                    <div class="product-text">
                      <h2><a href="/products/${product?.handle}">${product?.title}</a></h2>
                    </div>
                    </a>
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

    const layout2 = `
    <h1>Layout Two</h1>
    <h2>${marketingData?.headline}</h2>
    <p>${marketingData?.description}</p>`;

    const layout3 = `
    <h1>Layout Three</h1>
    <h2>${marketingData?.headline}</h2>
    <p>${marketingData?.description}</p>`;

    const layout4 = `
    <h1>Layout Four</h1>
    <h2>${marketingData?.headline}</h2>
    <p>${marketingData?.description}</p>`;

    // Get the paragraph element by class name
    const paragraph = document.getElementsByClassName(paragraphClass)[0];

    if (!paragraph) {
      console.error("Paragraph element not found");
      return;
    }

    blogData?.map((item) => {
      console.log("Item data====:", item.layout, item.position);

      // Get the paragraph content as plain text
      const originalContent = paragraph.innerHTML;

      // Split content by sentences (e.g., ".", "?", "!")
      const sentences = originalContent.split(/([.?!]+)/);

      // Check if there are enough sentences
      if (sentences.length / 2 < Number(item.position)) {
        console.warn("Paragraph does not contain enough sentences.");
        return;
      }

      // Find the index after the specified sentence count
      const insertionIndex = Number(item.position) * 2;

      // Insert the HTML content after the specified sentence
      const layout =
        item.layout == "1"
          ? layout1
          : item.layout == "2"
            ? layout2
            : item.layout == "3"
              ? layout3
              : item.layout == "4"
                ? layout4
                : null; // Default case if no match

      if (layout) {
        sentences.splice(insertionIndex, 0, layout);
      }

      // Join the sentences back and set it as the new content
      paragraph.innerHTML = sentences.join("");
    });
  } catch (error) {
    console.error("Error inserting content:", error);
  }
}

// Example: Insert HTML after 8 sentences
showData("article-template__content", 8, "http://localhost:3301/api");
