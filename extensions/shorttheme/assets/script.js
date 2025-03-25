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
  const gid = document.getElementById("collectionId").value;
  const collectionId = gid.split("/").pop();

  console.log("Collection ID:", collectionId);

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
      ...dataAllItems.filter(
        (item) => !item?.blogId || item?.blogId === blogId,
      ),
    ];

    mergedData = mergedData.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item?.id),
    );

    console.log("Merged Data:", mergedData);

    // Fetch Category Data for each unique `categoryId`
    const categoryIds = [
      ...new Set(mergedData.map((item) => item?.categoryId)),
    ];

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
      const products = categoryProducts[item?.categoryId] || [];
      const productLimit = item?.productLimit
        ? Number(item?.productLimit)
        : products.length;

      const limitedProducts = products.slice(0, productLimit);

      console.log("item=====:", item);

      switch (item?.layout) {
        case "1":
          return `
          <section class="product-area" style="background-color: ${item?.customOptions?.ctaCardBackgroundColor}; border-color: ${item?.customOptions?.ctaBorderColor};border-radius: ${item?.customOptions?.ctaBorderRadius}px; padding-top: ${item?.customOptions?.paddingTop}px; padding-bottom: ${item?.customOptions?.paddingBottom}px; padding-left: ${item?.customOptions?.paddingLeft}px; padding-right: ${item?.customOptions?.paddingRight}px; margin-top: ${item?.customOptions?.marginTop}px; margin-bottom: ${item?.customOptions?.marginBottom}px; margin-left: ${item?.customOptions?.marginLeft}px; margin-right: ${item?.customOptions?.marginRight}px; border-width: ${item?.customOptions?.ctaBorderBorderSize}px; border-style: solid; border-color: ${item?.customOptions?.ctaBorderColor};">
          <style>
          ${item?.customStyles}
          button.owl-next {
            background: ${item?.customOptions?.sliderNavigationColor} !important;
          }
          .product-wrap .owl-nav button{
            background: ${item?.customOptions?.sliderNavigationColor} !important;
          }
          .product-area .product-wrap .owl-nav button span {
              color: ${item?.customOptions?.sliderArrowColor} !important;
          }
          .product-area .product-wrap .owl-nav button:hover {
              color: ${item?.customOptions?.sliderHoverIconColor} !important;
              background: ${item?.customOptions?.sliderHoverBgColor} !important;
          }
          .product-area .product-wrap .owl-nav button:hover .product-area .product-wrap .owl-nav button span {
            color: ${item?.customOptions?.sliderHoverIconColor} !important;
          }
          button.owl-next:hover span {
              color: ${item?.customOptions?.sliderHoverIconColor} !important;
          }
          .product-area .product-wrap .owl-nav button:hover span {
              color: ${item?.customOptions?.sliderHoverIconColor} !important;
          }
          .sliderButton a.btn:hover {
            background-color: ${item?.customOptions?.buttonHoverColor} !important;
          }
        </style>
            <div class="my-container-fluid">
              <div class="section-title">
               <h2 style="font-size: ${item?.customOptions?.headingFontSize}px; color: ${item?.customOptions?.headingTextColor}">${item?.headline}</h2>
                <p style="font-size: ${item?.customOptions?.descriptionFontSize}px; color: ${item?.customOptions?.descriptionColor}">${item?.description}</p>
              </div>
              <div class="product-wrap product-slide">
                <div class="row-grids owl-carousel ${productLimit > 3 ? "product-active" : ""}">
                  ${limitedProducts
                    .map(
                      (product) => `
                      <div class="grid" style="">
                        <div class="product-item" style="border-radius: ${item?.customOptions?.prdBorderRadius}px;background: ${item?.customOptions?.prdBackgroundColor}; border: ${item?.customOptions?.prdTBorderSize}px solid ${item?.customOptions?.prdBorderColor};">
                        <a href="/products/${product?.handle}">
                          <div class="product-img">
                            <img style="border-radius:${item?.customOptions?.staticImageRadius}px;" src="${product?.image?.src}" alt="${product.title}">
                          </div>
                          <div class="product-text">
                            <h2><a style="color:${item?.customOptions?.prdTitleColor};font-size: ${item?.customOptions?.prdTitleSize}px" href="/products/${product?.handle}">${product?.title}</a></h2>
                          </div>
                          </a>
                        </div>
                      </div>
                    `,
                    )
                    .join("")}
                </div>

                <div class="sliderButton">
                    <a href="${item?.buttonLink ? item?.buttonLink : `/collections/${item?.productHandle}`}" class="btn" style="background-color: ${item?.customOptions?.buttonBackgroundColor}; color: ${item?.customOptions?.buttonTextColor}; border-radius: ${item?.customOptions?.buttonBorderRadius}px; font-size: ${item?.customOptions?.buttonTextSize}px;">${item?.buttonText}</a>
                </div>
              </div>
            </div>
          </section>`;
        case "2":
          return `<h1>Layout Two</h1><h2>${item?.headline}</h2><p>${item?.description}</p>`;
        case "3":
          return `<h1>Layout Three</h1><h2>${item?.headline}</h2><p>${item?.description}</p>`;
        case "4":
          return `<h1>Layout Four</h1><h2>${item?.headline}</h2><p>${item?.description}</p>`;
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
      console.log("Item data====:", item?.layout, item?.position);

      if (sentences.length / 2 < Number(item?.position)) {
        console.warn(
          "Paragraph does not contain enough sentences for position:",
          item?.position,
        );
        return;
      }

      const insertionIndex = Number(item?.position) * 2;
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
