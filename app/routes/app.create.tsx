import { useState, useEffect, useMemo, useCallback } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Autocomplete,
  BlockStack,
  Button,
  Card,
  FormLayout,
  InlineGrid,
  LegacyStack,
  Page,
  RadioButton,
  Select,
  Spinner,
  Tag,
  TextField,
  Tabs,
  LegacyCard,
  ColorPicker,
  hsbToHex,
  RangeSlider,
  Layout,
  Form,
} from "@shopify/polaris";
import { ActionFunction, json, redirect } from "@remix-run/node";
import { cors } from "remix-utils/cors";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "app/shopify.server";

export let action: ActionFunction = async ({ request }) => {
  const data = await authenticate.admin(request);

  try {
    const formData = new URLSearchParams(await request.text());

    // Extract values
    const headline = formData.get("headline")?.trim() || "";
    const description = formData.get("description")?.trim() || "";
    const layout = formData.get("layout");
    const categoryId = formData.get("categoryId");
    const productHandle = formData.get("productHandle");
    const thumbnail = formData.get("thumbnail");
    const buttonLink = formData.get("buttonLink");
    const buttonText = formData.get("buttonText");
    const productsId = formData.get("productId") || "";
    const blogId = formData.get("blogId") || "";
    const position = formData.get("position") || "";
    const articleTitles = formData.get("articleTitles") || "";
    const articleId = formData.get("articleId") || "";

    // Validate required fields
    if (!headline || !blogId || !position || !layout) {
      return json(
        { success: false, message: "All required fields must be filled" },
        { status: 400 },
      );
    }

    // ✅ Save data to Prisma
    const newMarketingEntry = await prisma.marketing.create({
      data: {
        id: uuidv4(),
        headline,
        description,
        productHandle,
        blogId,
        position,
        categoryId,
        layout,
        productsId,
        shop: data.session.shop || "",
        thumbnail,
        buttonLink,
        buttonText,
        articleTitles,
        articleId,
        status: "2",
      },
    });

    const response = json(
      {
        success: true,
        message: "Data saved successfully",
        entry: newMarketingEntry,
      },
      { status: 201 },
    );
    if (response.status === 201) {
      return response;
    }
    return redirect("/", { status: 302 });
    // return await cors(request, response);
  } catch (error: any) {
    console.error("Error saving data:", error);
    return json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 },
    );
  }
};

export default function CategorySelector() {
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [blogId, setBlogId] = useState("");
  const [selectBlog, setSelectBlog] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [producthandle, setProductHandle] = useState("");
  const [position, setPosition] = useState("5");
  const [layout, setLayout] = useState("1");
  const [articles, setArticles] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [articleTitles, setArticleTitles] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(false);

  const fetcher = useFetcher<any>();

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher?.data?.success) {
        toast.success("Data saved successfully!");
      } else {
        toast.error("Error saving data");
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
    // Fetch product categories from Shopify
    fetch("/api/category")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data?.collections?.custom_collections || []);
      });

    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data.blogs || []);
        setBlogId(data.blogs[0]?.id || "");
      });
  }, []);

  const getArticle = async (blogId: string) => {
    setLoading(true);
    if (blogId === "" || !blogId) {
      setArticles([]);
      setLoading(false);
      return;
    }
    fetch(`/api/article`, {
      method: "POST", // Use GET instead of POST
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ blogId: blogId }),
    })
      .then((res) => res.json())
      .then((data) => {
        const formattedArticles = data.articles.map(
          (article: { id: string; title: string }) => ({
            value: article.id,
            label: article.title,
          }),
        );
        setArticles(formattedArticles);
        setOptions(formattedArticles);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
        setLoading(false);
      });
  };

  const updateText = useCallback(
    (value: string) => {
      setInputValue(value);
      if (value === "") {
        setOptions(articles);
        return;
      }
      const filterRegex = new RegExp(value, "i");
      const resultOptions = articles.filter((option) =>
        option.label.match(filterRegex),
      );
      setOptions(resultOptions);
    },
    [articles],
  );

  const removeTag = useCallback(
    (tag: string) => () => {
      const updatedSelection = selectedArticles.filter((id) => id !== tag);
      setSelectedArticles(updatedSelection);
    },
    [selectedArticles],
  );

  const verticalContentMarkup =
    selectedArticles.length > 0 ? (
      <LegacyStack spacing="extraTight" alignment="center">
        {selectedArticles.map((articleId) => {
          const article = articles.find((art) => art.value === articleId);
          return (
            <Tag key={articleId} onRemove={removeTag(articleId)}>
              {article?.label || "Unknown Article"}
            </Tag>
          );
        })}
      </LegacyStack>
    ) : null;

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label="Select Articles"
      value={inputValue}
      placeholder="Search for an article"
      verticalContent={verticalContentMarkup}
      autoComplete="off"
      disabled={articles.length === 0}
    />
  );

  useEffect(() => {
    const selectedTitles = articles
      .filter((article: any) => selectedArticles.includes(article.value))
      .map((article: any) => article.label);
    setArticleTitles(selectedTitles);
  }, [selectedArticles]);

  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  const tabs = [
    {
      id: "form",
      content: "Form",
      accessibilityLabel: "Form",
      panelID: "form-content",
    },
    {
      id: "card-options",
      content: "Card Options",
      panelID: "card-options-content",
    },
    {
      id: "product-options",
      content: "Product Options",
      panelID: "product-options-content",
    },
    {
      id: "button-options",
      content: "Button Options",
      panelID: "button-options-content",
    },
    {
      id: "static-image-options",
      content: "Static Image Options",
      panelID: "staticImage-options-content",
    },
    {
      id: "content-options",
      content: "Content Options",
      panelID: "content-content",
    },
    {
      id: "spacing-options",
      content: "Spacing Options",
      panelID: "spacing-content",
    },
    {
      id: "slider-options",
      content: "Slider Options",
      panelID: "slider-content",
    },
    {
      id: "custom-css",
      content: "Custom CSS",
      panelID: "custom-css",
    },
  ];

  const [color, setColor] = useState({
    hue: 300,
    brightness: 1,
    saturation: 0.7,
    alpha: 0.7,
  });
  const [ctaBorderColor, setCTAborder] = useState({
    hue: 300,
    brightness: 1,
    saturation: 0.7,
    alpha: 0.7,
  });

  const [prdBgColor, setPrdBGColor] = useState({
    hue: 300,
    brightness: 1,
    saturation: 0.7,
    alpha: 0.7,
  });
  const [buttonBgColor, setbuttonBgColor] = useState({
    hue: 300,
    brightness: 1,
    saturation: 0.7,
    alpha: 0.7,
  });

  const [buttonTextColor, setbuttonTextColor] = useState({
    hue: 300,
    brightness: 1,
    saturation: 0.7,
    alpha: 0.7,
  });
  const [buttonHoverColor, setbuttonHoverColor] = useState({
    hue: 300,
    brightness: 1,
    saturation: 0.7,
    alpha: 0.7,
  });

  const [prdBorderColor, setPrdBorderColor] = useState({
    hue: 300,
    brightness: 1,
    saturation: 0.7,
    alpha: 0.7,
  });

  const [sliderArrowColor, setsliderArrowColor] = useState({
    hue: 300,
    brightness: 1,
    saturation: 0.7,
    alpha: 0.7,
  });

  const [sliderNavigationColor, setsliderNavigationColor] = useState({
    hue: 300,
    brightness: 1,
    saturation: 0.7,
    alpha: 0.7,
  });

  const [ctaBorderRadius, setctaBorderRadius] = useState(10);

  const handleRangeSliderChange = useCallback(
    (value: number) => setctaBorderRadius(value),
    [],
  );

  const [prdBorderRadius, setprdBorderRadius] = useState(10);

  const productBorderHandle = useCallback(
    (value: number) => setprdBorderRadius(value),
    [],
  );

  const [buttonTextSize, setbuttonTextSize] = useState(14);

  const buttonTextSizeHandle = useCallback(
    (value: number) => setbuttonTextSize(value),
    [],
  );

  const [staticImageRadius, setstaticImageRadius] = useState(14);

  const staticImageRadiusHandle = useCallback(
    (value: number) => setstaticImageRadius(value),
    [],
  );

  const [headingFontSize, setheadingFontSize] = useState(14);

  const headingFontSizeHanlde = useCallback(
    (value: number) => setheadingFontSize(value),
    [],
  );

  const [descriptionFontSize, setdescriptionFontSize] = useState(14);

  const descriptionFontSizeHandle = useCallback(
    (value: number) => setdescriptionFontSize(value),
    [],
  );

  const [customCSS, setCustomCSS] = useState(``);

  const handleChange = useCallback(
    (newValue: string) => setCustomCSS(newValue),
    [],
  );

  const [marginTop, setmarginTop] = useState(14);

  const setmarginTopHandle = useCallback(
    (value: number) => setmarginTop(value),
    [],
  );

  const [marginBottom, setMarginBottom] = useState(14);

  const marginBottomHandle = useCallback(
    (value: number) => setMarginBottom(value),
    [],
  );
  const [marginLeft, setmarginLeft] = useState(14);

  const setmarginLeftHandle = useCallback(
    (value: number) => setmarginLeft(value),
    [],
  );
  const [marginRight, setmarginRight] = useState(14);

  const marginRightHandle = useCallback(
    (value: number) => setmarginRight(value),
    [],
  );

  const [paddingTop, setPaddingTop] = useState(14);

  const paddingTopHanlde = useCallback(
    (value: number) => setPaddingTop(value),
    [],
  );

  const [paddingBottom, setPaddingBottom] = useState(14);

  const paddingBottomHandle = useCallback(
    (value: number) => setPaddingBottom(value),
    [],
  );

  const [paddingRight, setPaddingRight] = useState(14);

  const paddingRightHandle = useCallback(
    (value: number) => setPaddingRight(value),
    [],
  );

  const [paddingLeft, setPaddingLeft] = useState(14);

  const paddingLeftHandle = useCallback(
    (value: number) => setPaddingLeft(value),
    [],
  );

  const [prdLimit, setprdLimit] = useState(20);

  const prdLimitHandle = useCallback((value: number) => setprdLimit(value), []);

  console.log("selected", selected);
  return (
    <Page title="Create Marketing Entry">
      <Card roundedAbove="sm">
        <fetcher.Form method="post">
          <br />
          <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
            <LegacyCard.Section title={tabs[selected].content}>
              {selected === 0 && (
                <FormLayout>
                  <Card>
                    <InlineGrid gap="400" columns={4}>
                      <div style={{ textAlign: "center" }}>
                        <label htmlFor="layoutOne">
                          <img
                            src="/assets/images/01.jpg"
                            alt="image"
                            style={{
                              width: "100%",
                              height: "120px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              objectFit: "contain",
                              border: "2px solid #ccc",
                            }}
                          />
                        </label>
                        <RadioButton
                          label="More than Specified"
                          id="layoutOne"
                          name="layout"
                          checked={layout == "1" ? true : false}
                          onChange={() => {
                            setLayout("1");
                          }}
                          value={layout}
                        />
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <label htmlFor="layoutTwo">
                          <img
                            src="/assets/images/02.jpg"
                            alt="image"
                            style={{
                              width: "100%",
                              height: "120px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              objectFit: "contain",
                              border: "2px solid #ccc",
                            }}
                          />
                        </label>
                        <RadioButton
                          label="Less than Specified"
                          id="layoutTwo"
                          name="layout"
                          checked={layout == "2" ? true : false}
                          onChange={() => {
                            setLayout("2");
                          }}
                          value={layout}
                        />
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <label htmlFor="layoutThree">
                          <img
                            src="/assets/images/03.jpg"
                            alt="image"
                            style={{
                              width: "100%",
                              height: "120px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              objectFit: "contain",
                              border: "2px solid #ccc",
                            }}
                          />
                        </label>
                        <RadioButton
                          label="Image Right"
                          id="layoutThree"
                          name="layout"
                          checked={layout == "3" ? true : false}
                          onChange={() => {
                            setLayout("3");
                          }}
                          value={layout}
                        />
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <label htmlFor="layout-four">
                          <img
                            src="/assets/images/04.jpg"
                            alt="image"
                            style={{
                              width: "100%",
                              height: "120px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              objectFit: "contain",
                              border: "2px solid #ccc",
                            }}
                          />
                        </label>
                        <RadioButton
                          label="Image Left"
                          id="layout-four"
                          name="layout"
                          checked={layout == "4" ? true : false}
                          onChange={() => {
                            setLayout("4");
                          }}
                          value={layout}
                        />
                      </div>
                    </InlineGrid>
                  </Card>
                  <TextField
                    label="Heading"
                    onChange={(value) => {
                      setHeadline(value);
                    }}
                    value={headline}
                    name="headline"
                    placeholder="Enter the heading"
                    autoComplete="off"
                  />
                  <TextField
                    label="Your Description"
                    onChange={(value) => {
                      setDescription(value);
                    }}
                    name="description"
                    value={description}
                    placeholder="Enter the description"
                    multiline={4}
                    autoComplete="off"
                  />
                  <TextField
                    label="Item Position in the blog"
                    onChange={(value) => {
                      setPosition(value);
                    }}
                    value={position}
                    name="position"
                    autoComplete="off"
                  />
                  <Select
                    label="Select a Blog"
                    options={[
                      { label: "Select your blog", value: "" }, // Add the default option
                      ...blogs.map((cat: any) => ({
                        label: cat.title,
                        value: String(cat.id), // Store only the ID
                      })),
                    ]}
                    value={String(selectBlog)}
                    onChange={(value: any) => {
                      setSelectBlog(String(value));
                      getArticle(String(value));
                    }}
                  />
                  <div style={{ flex: "1", position: "relative" }}>
                    <Autocomplete
                      allowMultiple
                      options={options}
                      selected={selectedArticles}
                      textField={textField}
                      onSelect={setSelectedArticles}
                      listTitle="Available Articles"
                    />
                    {loading && (
                      <div
                        style={{
                          position: "absolute",
                          top: "42px",
                          left: "0",
                          right: "0",
                          display: "flex",
                          justifyContent: "center",
                          transform: "translateY(-50%)",
                          zIndex: 999,
                        }}
                      >
                        <Spinner
                          accessibilityLabel="Spinner example"
                          size="large"
                        />
                      </div>
                    )}
                  </div>
                  <Select
                    label="Select a Category"
                    options={[
                      { label: "Select your Category", value: "" }, // Add the default option
                      ...products.map((cat: any) => ({
                        label: cat.title,
                        value: String(cat.id), // Store only the ID
                      })),
                    ]}
                    value={selectedCategory || ""}
                    onChange={(value: any) => {
                      setSelectedCategory(String(value));
                      const selectedProduct: any = products.find(
                        (prod: any) => prod.id == value,
                      );
                      if (selectedProduct) {
                        setProductHandle(selectedProduct.handle);
                      }
                    }}
                  />
                  <RangeSlider
                    output
                    label="Product Limit"
                    min={0}
                    max={360}
                    value={prdLimit}
                    onChange={prdLimitHandle}
                    suffix={
                      <p
                        style={{
                          minWidth: "24px",
                          textAlign: "right",
                        }}
                      >
                        {prdLimit}
                      </p>
                    }
                  />
                </FormLayout>
              )}
              <input type="hidden" name="productHandle" value={producthandle} />
              <input type="hidden" name="categoryId" value={selectedCategory} />
              <input type="hidden" name="blogId" value={selectedArticles} />
              <input type="hidden" name="articleId" value={blogId} />
              <input type="hidden" name="articleTitles" value={articleTitles} />
              {selected === 1 && (
                <FormLayout>
                  <FormLayout.Group>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        width: "100%",
                      }}
                    >
                      <label htmlFor="">CTA Card Background color</label>
                      <ColorPicker onChange={setColor} color={color} />
                      <TextField
                        label=""
                        value={hsbToHex(color)}
                        name="ctaCardBackgroundColor"
                        placeholder="CTA Card Background color"
                        autoComplete="off"
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        width: "100%",
                      }}
                    >
                      <label htmlFor="">CTA Border color</label>
                      <ColorPicker
                        onChange={setCTAborder}
                        color={ctaBorderColor}
                      />
                      <TextField
                        label=""
                        value={hsbToHex(ctaBorderColor)}
                        name="ctaBorderColor"
                        placeholder="CTA Border color"
                        autoComplete="off"
                      />
                    </div>
                  </FormLayout.Group>

                  <RangeSlider
                    output
                    label="CTA card border radius"
                    min={0}
                    max={360}
                    value={ctaBorderRadius}
                    onChange={handleRangeSliderChange}
                    suffix={
                      <p
                        style={{
                          minWidth: "24px",
                          textAlign: "right",
                        }}
                      >
                        {ctaBorderRadius}px
                      </p>
                    }
                  />
                </FormLayout>
              )}

              {selected === 2 && (
                <FormLayout>
                  <FormLayout.Group>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        width: "100%",
                      }}
                    >
                      <label htmlFor="">Product Background color</label>
                      <ColorPicker
                        onChange={setPrdBGColor}
                        color={prdBgColor}
                      />
                      <TextField
                        label=""
                        value={hsbToHex(prdBgColor)}
                        name="prdBackgroundColor"
                        placeholder="Product Background color"
                        autoComplete="off"
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        width: "100%",
                      }}
                    >
                      <label htmlFor="">Product Border color</label>
                      <ColorPicker
                        onChange={setPrdBorderColor}
                        color={prdBorderColor}
                      />
                      <TextField
                        label=""
                        value={hsbToHex(prdBorderColor)}
                        name="prdBorderColor"
                        placeholder="Product Border color"
                        autoComplete="off"
                      />
                    </div>
                  </FormLayout.Group>

                  <RangeSlider
                    output
                    label="Product card border radius"
                    min={0}
                    max={360}
                    value={prdBorderRadius}
                    onChange={productBorderHandle}
                    suffix={
                      <p
                        style={{
                          minWidth: "24px",
                          textAlign: "right",
                        }}
                      >
                        {prdBorderRadius}px
                      </p>
                    }
                  />
                </FormLayout>
              )}

              {selected === 3 && (
                <FormLayout>
                  <FormLayout.Group>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        width: "100%",
                      }}
                    >
                      <label htmlFor="">Button Background color</label>
                      <ColorPicker
                        onChange={setbuttonBgColor}
                        color={buttonBgColor}
                      />
                      <TextField
                        label=""
                        value={hsbToHex(buttonBgColor)}
                        name="prdBackgroundColor"
                        placeholder="Product Background color"
                        autoComplete="off"
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        width: "100%",
                      }}
                    >
                      <label htmlFor="">Button Text Color</label>
                      <ColorPicker
                        onChange={setbuttonTextColor}
                        color={buttonTextColor}
                      />
                      <TextField
                        label=""
                        value={hsbToHex(buttonTextColor)}
                        name="prdBorderColor"
                        placeholder="Product Border color"
                        autoComplete="off"
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        width: "100%",
                      }}
                    >
                      <label htmlFor="">Button Hover Color</label>
                      <ColorPicker
                        onChange={setbuttonHoverColor}
                        color={buttonHoverColor}
                      />
                      <TextField
                        label=""
                        value={hsbToHex(buttonHoverColor)}
                        name="prdBorderColor"
                        placeholder="Product Border color"
                        autoComplete="off"
                      />
                    </div>
                  </FormLayout.Group>

                  <RangeSlider
                    output
                    label="Button Text Size"
                    min={0}
                    max={360}
                    value={buttonTextSize}
                    onChange={buttonTextSizeHandle}
                    suffix={
                      <p
                        style={{
                          minWidth: "24px",
                          textAlign: "right",
                        }}
                      >
                        {buttonTextSize}px
                      </p>
                    }
                  />
                </FormLayout>
              )}

              {selected === 4 && (
                <FormLayout>
                  <RangeSlider
                    output
                    label="Image Border Radius"
                    min={0}
                    max={360}
                    value={staticImageRadius}
                    onChange={staticImageRadiusHandle}
                    suffix={
                      <p
                        style={{
                          minWidth: "24px",
                          textAlign: "right",
                        }}
                      >
                        {staticImageRadius}px
                      </p>
                    }
                  />
                </FormLayout>
              )}
              {selected === 5 && (
                <FormLayout>
                  <FormLayout.Group>
                    <RangeSlider
                      output
                      label="Heading Font Size"
                      min={0}
                      max={360}
                      value={headingFontSize}
                      onChange={headingFontSizeHanlde}
                      suffix={
                        <p
                          style={{
                            minWidth: "24px",
                            textAlign: "right",
                          }}
                        >
                          {headingFontSize}px
                        </p>
                      }
                    />
                    <RangeSlider
                      output
                      label="Description Font Size"
                      min={0}
                      max={360}
                      value={descriptionFontSize}
                      onChange={descriptionFontSizeHandle}
                      suffix={
                        <p
                          style={{
                            minWidth: "24px",
                            textAlign: "right",
                          }}
                        >
                          {descriptionFontSize}px
                        </p>
                      }
                    />
                  </FormLayout.Group>
                </FormLayout>
              )}
              {selected === 6 && (
                <FormLayout>
                  <FormLayout.Group>
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <RangeSlider
                        output
                        label="Card Margin Top"
                        min={0}
                        max={360}
                        value={marginTop}
                        onChange={setmarginTopHandle}
                        suffix={
                          <p
                            style={{
                              minWidth: "24px",
                              textAlign: "right",
                            }}
                          >
                            {marginTop}px
                          </p>
                        }
                      />
                      <RangeSlider
                        output
                        label="Card Margin Bottom"
                        min={0}
                        max={360}
                        value={marginBottom}
                        onChange={marginBottomHandle}
                        suffix={
                          <p
                            style={{
                              minWidth: "24px",
                              textAlign: "right",
                            }}
                          >
                            {marginBottom}px
                          </p>
                        }
                      />
                      <RangeSlider
                        output
                        label="Card Margin Left"
                        min={0}
                        max={360}
                        value={marginLeft}
                        onChange={setmarginLeftHandle}
                        suffix={
                          <p
                            style={{
                              minWidth: "24px",
                              textAlign: "right",
                            }}
                          >
                            {marginLeft}px
                          </p>
                        }
                      />
                      <RangeSlider
                        output
                        label="Card Margin Right"
                        min={0}
                        max={360}
                        value={marginRight}
                        onChange={marginRightHandle}
                        suffix={
                          <p
                            style={{
                              minWidth: "24px",
                              textAlign: "right",
                            }}
                          >
                            {marginRight}px
                          </p>
                        }
                      />
                    </div>
                  </FormLayout.Group>

                  <FormLayout.Group>
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: "40px",
                      }}
                    >
                      <RangeSlider
                        output
                        label="Card Padding Top"
                        min={0}
                        max={360}
                        value={paddingTop}
                        onChange={paddingTopHanlde}
                        suffix={
                          <p
                            style={{
                              minWidth: "24px",
                              textAlign: "right",
                            }}
                          >
                            {paddingTop}px
                          </p>
                        }
                      />
                      <RangeSlider
                        output
                        label="Card Padding Bottom"
                        min={0}
                        max={360}
                        value={paddingBottom}
                        onChange={paddingBottomHandle}
                        suffix={
                          <p
                            style={{
                              minWidth: "24px",
                              textAlign: "right",
                            }}
                          >
                            {paddingBottom}px
                          </p>
                        }
                      />
                      <RangeSlider
                        output
                        label="Card Padding Left"
                        min={0}
                        max={360}
                        value={paddingLeft}
                        onChange={paddingLeftHandle}
                        suffix={
                          <p
                            style={{
                              minWidth: "24px",
                              textAlign: "right",
                            }}
                          >
                            {paddingLeft}px
                          </p>
                        }
                      />
                      <RangeSlider
                        output
                        label="Card Padding Right"
                        min={0}
                        max={360}
                        value={paddingRight}
                        onChange={paddingRightHandle}
                        suffix={
                          <p
                            style={{
                              minWidth: "24px",
                              textAlign: "right",
                            }}
                          >
                            {paddingRight}px
                          </p>
                        }
                      />
                    </div>
                  </FormLayout.Group>
                </FormLayout>
              )}
              {selected === 7 && (
                <FormLayout>
                  <FormLayout.Group>
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        gap: "10px",
                        flexDirection: "column",
                      }}
                    >
                      <label htmlFor="">Button Background color</label>
                      <ColorPicker
                        onChange={setsliderArrowColor}
                        color={sliderArrowColor}
                      />
                      <TextField
                        label=""
                        value={hsbToHex(sliderArrowColor)}
                        name="prdBackgroundColor"
                        placeholder="Product Background color"
                        autoComplete="off"
                      />
                    </div>

                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        gap: "10px",
                        flexDirection: "column",
                      }}
                    >
                      <label htmlFor="">Button Background color</label>
                      <ColorPicker
                        onChange={setsliderNavigationColor}
                        color={sliderNavigationColor}
                      />
                      <TextField
                        label=""
                        value={hsbToHex(sliderNavigationColor)}
                        name="prdBackgroundColor"
                        placeholder="Product Background color"
                        autoComplete="off"
                      />
                    </div>
                  </FormLayout.Group>
                </FormLayout>
              )}
              {selected === 8 && (
                <FormLayout>
                  <div
                    style={{
                      width: "100%",
                    }}
                  >
                    <TextField
                      label="Custom CSS"
                      autoComplete="off"
                      multiline={20}
                      value={customCSS}
                      onChange={handleChange}
                      name="custom-css"
                    />
                  </div>
                </FormLayout>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "40px",
                }}
              >
                <Button size="large" submit>
                  Save
                </Button>
              </div>
            </LegacyCard.Section>
          </Tabs>
        </fetcher.Form>
      </Card>
    </Page>
  );
}
