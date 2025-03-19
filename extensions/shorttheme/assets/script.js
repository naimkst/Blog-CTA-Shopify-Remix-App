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

function initializeOwlCarousel() {
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
}

async function showData(paragraphClass, position, apiUrl) {
  const blogId = document.getElementById("blogId").value;

  console.log("Blog ID:", blogId);
  let mergedData = [];

  try {
    // Fetch `itemById` Data (for specific blogId)
    const responseById = await fetch(`${apiUrl}/itemById`, {
      method: "POST",
      body: JSON.stringify({ id: blogId }),
    });

    let dataById = [];
    if (responseById.ok) {
      const jsonData = await responseById.json();
      dataById = jsonData?.items || [];
    } else {
      console.warn("itemById API returned empty data");
    }

    // Fetch `items` Data (all available items)
    const responseAllItems = await fetch(`${apiUrl}/items`, { method: "GET" });

    let dataAllItems = [];
    if (responseAllItems.ok) {
      const jsonData = await responseAllItems.json();
      dataAllItems = jsonData?.items || [];
    } else {
      console.warn("items API returned empty data");
    }

    // Merge Data: Keep items from `itemById` and `items` (avoiding duplicates)
    mergedData = [
      ...dataById,
      ...dataAllItems.filter((item) => !item.blogId || item.blogId === blogId),
    ];

    mergedData = mergedData.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );

    console.log("Merged Data:", mergedData);

    // Fetch Category Data for each unique `categoryId`
    const categoryIds = [...new Set(mergedData.map((item) => item.categoryId))];

    let categoryProducts = {};
    for (let categoryId of categoryIds) {
      if (!categoryId) continue;

      try {
        const categoryResponse = await fetch(`${apiUrl}/categoryById`, {
          method: "POST",
          body: JSON.stringify({ id: categoryId }),
        });

        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          categoryProducts[categoryId] = categoryData.products || [];
        } else {
          console.warn(`Category API failed for ID: ${categoryId}`);
        }
      } catch (err) {
        console.error(`Error fetching category ${categoryId}:`, err);
      }
    }

    console.log("Fetched Category Products:", categoryProducts);

    // Function to generate dynamic layouts
    const getLayout = (item) => {
      const products = categoryProducts[item.categoryId] || [];

      switch (item.layout) {
        case "1":
          return `
          <section class="product-area" style="background-color: ${item.customOptions.ctaCardBackgroundColor}">
            <div class="my-container-fluid">
              <div class="section-title">
                <h2>${item.headline}</h2>
                <p>${item.description}</p>
              </div>
              <div class="product-wrap product-slide">
                <div class="row-grids product-active owl-carousel">
                  ${products
                    .map(
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
          </section>`;
        case "2":
          return `<h1>Layout Two</h1><h2>${item.headline}</h2><p>${item.description}</p>`;
        case "3":
          return `<h1>Layout Three</h1><h2>${item.headline}</h2><p>${item.description}</p>`;
        case "4":
          return `<h1>Layout Four</h1><h2>${item.headline}</h2><p>${item.description}</p>`;
        default:
          return null;
      }
    };

    // Get the paragraph element by class name
    const paragraph = document.getElementsByClassName(paragraphClass)[0];

    if (!paragraph) {
      console.error("Paragraph element not found");
      return;
    }

    let originalContent = paragraph.innerHTML;
    let sentences = originalContent.split(/([.?!]+)/);

    // Sort merged data by position to ensure correct order
    mergedData.sort((a, b) => a.position - b.position);

    // Insert multiple layouts based on their positions
    mergedData.forEach((item) => {
      console.log("Item data====:", item.layout, item.position);

      if (sentences.length / 2 < Number(item.position)) {
        console.warn(
          "Paragraph does not contain enough sentences for position:",
          item.position,
        );
        return;
      }

      const insertionIndex = Number(item.position) * 2;
      const layout = getLayout(item);

      if (layout) {
        sentences.splice(insertionIndex, 0, layout);
      }
    });

    // Update the paragraph content
    paragraph.innerHTML = sentences.join("");
    setTimeout(() => {
      initializeOwlCarousel();
    }, 100);
  } catch (error) {
    console.error("Error inserting content:", error);
  }
}

// Example: Insert HTML after 8 sentences
showData("article-template__content", 8, "http://localhost:3301/api");
