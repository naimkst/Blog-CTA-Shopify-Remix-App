import { useState, useEffect, useCallback } from "react";
import {
  Navigate,
  useFetcher,
  useSearchParams,
  useNavigate,
} from "@remix-run/react";
import {
  Autocomplete,
  Button,
  Card,
  FormLayout,
  InlineGrid,
  LegacyStack,
  Page,
  RadioButton,
  Select,
  Tag,
  TextField,
  Tabs,
  LegacyCard,
  ColorPicker,
  hsbToHex,
  RangeSlider,
} from "@shopify/polaris";
import { ActionFunction, json, redirect } from "@remix-run/node";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "app/shopify.server";
import path from "path";
import { Buffer } from "buffer";
import { writeFile } from "fs/promises";

export let action: ActionFunction = async ({ request }: any) => {
  const data = await authenticate.admin(request);

  try {
    const formData = await request.formData();
    const file = formData.get("thumbnail") as File; // Get file

    // Extract values
    const name = formData.get("name")?.trim() || "";
    const headline = formData.get("headline")?.trim() || "";
    const description = formData.get("description")?.trim() || "";
    const layout = formData.get("layout");
    const categoryId = formData.get("categoryId");
    const productHandle = formData.get("productHandle");
    const buttonLink = formData.get("buttonLink");
    const buttonText = formData.get("buttonText");
    const productsId = formData.get("productId") || "";
    const blogId = formData.get("blogId") || "";
    const position = formData.get("position") || "";
    const articleTitles = formData.get("articleTitles") || "";
    const articleId = formData.get("articleId") || "";
    const productLimit = formData.get("productLimit") || "";
    const ctaCardBackgroundColor = formData.get("ctaCardBackgroundColor") || "";
    const ctaBorderColor = formData.get("ctaBorderColor") || "";
    const ctaBorderRadius = formData.get("ctaBorderRadius") || "";
    const prdBackgroundColor = formData.get("prdBackgroundColor") || "";
    const prdBorderColor = formData.get("prdBorderColor") || "";
    const prdBorderRadius = formData.get("prdBorderRadius") || "";
    const buttonBackgroundColor = formData.get("buttonBackgroundColor") || "";
    const buttonTextColor = formData.get("buttonTextColor") || "";
    const buttonHoverColor = formData.get("buttonHoverColor") || "";
    const buttonTextSize = formData.get("buttonTextSize") || "";
    const staticImageRadius = formData.get("staticImageRadius") || "";
    const headingFontSize = formData.get("headingFontSize") || "";
    const descriptionFontSize = formData.get("descriptionFontSize") || "";
    const marginTop = formData.get("marginTop") || "";
    const marginBottom = formData.get("marginBottom") || "";
    const marginLeft = formData.get("marginLeft") || "";
    const marginRight = formData.get("marginRight") || "";
    const paddingTop = formData.get("paddingTop") || "";
    const paddingBottom = formData.get("paddingBottom") || "";
    const paddingLeft = formData.get("paddingLeft") || "";
    const paddingRight = formData.get("paddingRight") || "";
    const sliderArrowColor = formData.get("sliderArrowColor") || "";
    const sliderNavigationColor = formData.get("sliderNavigationColor") || "";
    const customStyles = formData.get("customStyles") || "";
    const existingId = formData.get("existingId") || "";
    const headingTextColor = formData.get("headingTextColor") || "";
    const descriptionColor = formData.get("descriptionColor") || "";
    const prdTitleColor = formData.get("prdTitleColor") || "";
    const prdTitleSize = formData.get("prdTitleSize") || "";
    const isThumbnail = formData.get("isThumbnail") || "";
    const sliderHoverBgColor = formData.get("sliderHoverBgColor") || "";
    const sliderHoverIconColor = formData.get("sliderHoverIconColor") || "";
    const ctaBorderBorderSize = formData.get("ctaBorderBorderSize") || "";
    const prdTBorderSize = formData.get("prdTBorderSize") || "";

    // Validate required fields
    if (!headline || !name || !position || !layout) {
      return json(
        { success: false, message: "All required fields must be filled" },
        { status: 400 },
      );
    }

    let imageName = "";
    if (file && file.size > 0) {
      // ✅ Convert file to a Buffer
      function sanitizeFileName(fileName: string) {
        return fileName
          .toLowerCase() // Convert to lowercase
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/[^a-z0-9.-]/g, ""); // Remove special characters except dot and hyphen
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
      imageName = fileName;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await writeFile(filePath, buffer);
    }

    // ✅ Save data to Prisma
    const newMarketingEntry = await prisma.marketing.upsert({
      where: { id: existingId || uuidv4() }, // Use `existingId` if updating
      update: {
        name,
        headline,
        description,
        productHandle,
        blogId,
        position,
        categoryId,
        layout,
        productsId,
        shop: data.session.shop || "",
        thumbnail: imageName ? imageName : isThumbnail,
        buttonLink,
        buttonText,
        articleTitles,
        articleId,
        status: "2",
        productLimit,
        customOptions: {
          sliderHoverBgColor,
          prdTBorderSize,
          ctaBorderBorderSize,
          sliderHoverIconColor,
          headingTextColor,
          descriptionColor,
          prdTitleColor,
          prdTitleSize,
          ctaCardBackgroundColor,
          ctaBorderColor,
          ctaBorderRadius,
          prdBackgroundColor,
          prdBorderColor,
          prdBorderRadius,
          buttonBackgroundColor,
          buttonTextColor,
          buttonHoverColor,
          buttonTextSize,
          staticImageRadius,
          headingFontSize,
          descriptionFontSize,
          marginTop,
          marginBottom,
          marginLeft,
          marginRight,
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
          sliderArrowColor,
          sliderNavigationColor,
        },
        customStyles,
      },
      create: {
        id: uuidv4(), // Generate a new ID if creating
        name,
        headline,
        description,
        productHandle,
        blogId,
        position,
        categoryId,
        layout,
        productsId,
        shop: data.session.shop || "",
        thumbnail: imageName ? imageName : isThumbnail,
        buttonLink,
        buttonText,
        articleTitles,
        articleId,
        status: "2",
        productLimit,
        customOptions: {
          sliderHoverBgColor,
          prdTBorderSize,
          sliderHoverIconColor,
          ctaBorderBorderSize,
          headingTextColor,
          descriptionColor,
          prdTitleColor,
          prdTitleSize,
          ctaCardBackgroundColor,
          ctaBorderColor,
          ctaBorderRadius,
          prdBackgroundColor,
          prdBorderColor,
          prdBorderRadius,
          buttonBackgroundColor,
          buttonTextColor,
          buttonHoverColor,
          buttonTextSize,
          staticImageRadius,
          headingFontSize,
          descriptionFontSize,
          marginTop,
          marginBottom,
          marginLeft,
          marginRight,
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
          sliderArrowColor,
          sliderNavigationColor,
        },
        customStyles,
      },
    });

    console.log("Upserted Marketing Entry:", newMarketingEntry);

    const response = json(
      {
        success: true,
        message: "Data saved successfully",
        entry: newMarketingEntry,
      },
      { status: 201 },
    );

    return response;
    // if (response) {
    //   return redirect("/app"); // ✅ Redirects to the app home page
    // }

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
  const [editData, setEditData] = useState<any>(null);
  const [blogs, setBlogs] = useState([]);
  const [blogId, setBlogId] = useState("");
  const [selectBlog, setSelectBlog] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [headline, setHeadline] = useState("");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("View More");
  const [buttonLink, setButtonLink] = useState("#");
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("id");

  function hexToHsb(hex: string) {
    let r = 0,
      g = 0,
      b = 0;

    // Remove '#' if present
    hex = hex.replace(/^#/, "");

    // Convert hex to RGB
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    // Normalize RGB values
    r /= 255;
    g /= 255;
    b /= 255;

    // Find max and min RGB values
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let hue = 0;
    if (delta !== 0) {
      if (max === r) {
        hue = ((g - b) / delta) % 6;
      } else if (max === g) {
        hue = (b - r) / delta + 2;
      } else {
        hue = (r - g) / delta + 4;
      }
      hue *= 60;
      if (hue < 0) hue += 360;
    }

    const saturation = max === 0 ? 0 : delta / max;
    const brightness = max;

    return { hue, brightness, saturation, alpha: 1 };
  }

  const getEditData = async () => {
    if (!itemId) return;
    fetch(`/api/itemEdit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: itemId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data?.items);
        setEditData(data?.items);
        if (data?.items) {
          setHeadline(data?.items?.headline);
          setItemName(data?.items?.name);
          setDescription(data?.items?.description);
          setButtonLink(data?.items?.buttonLink);
          setButtonText(data?.items?.buttonText);
          setProductHandle(data?.items?.productHandle);
          setPosition(data?.items?.position);
          setLayout(data?.items?.layout);
          setSelectBlog(data?.items?.blogId);
          setSelectedCategory(data?.items?.categoryId);
          setSelectedImage(`/uploads/${data?.items?.thumbnail}`);
          setColor(
            hexToHsb(data?.items?.customOptions?.ctaCardBackgroundColor),
          );
          setCTAborder(hexToHsb(data?.items?.customOptions?.ctaBorderColor));
          setctaBorderRadius(data?.items?.customOptions?.ctaBorderRadius);
          setPrdBGColor(
            hexToHsb(data?.items?.customOptions?.prdBackgroundColor),
          );
          setPrdBorderColor(
            hexToHsb(data?.items?.customOptions?.prdBorderColor),
          );
          setprdBorderRadius(data?.items?.customOptions?.prdBorderRadius);
          setbuttonBgColor(
            hexToHsb(data?.items?.customOptions?.buttonBackgroundColor),
          );
          setbuttonTextColor(
            hexToHsb(data?.items?.customOptions?.buttonTextColor),
          );
          setbuttonHoverColor(
            hexToHsb(data?.items?.customOptions?.buttonHoverColor),
          );
          setbuttonTextSize(data?.items?.customOptions?.buttonTextSize);
          setstaticImageRadius(data?.items?.customOptions?.staticImageRadius);
          setheadingFontSize(data?.items?.customOptions?.headingFontSize);
          setdescriptionFontSize(
            data?.items?.customOptions?.descriptionFontSize,
          );
          setmarginTop(data?.items?.customOptions?.marginTop);
          setMarginBottom(data?.items?.customOptions?.marginBottom);
          setmarginLeft(data?.items?.customOptions?.marginLeft);
          setmarginRight(data?.items?.customOptions?.marginRight);
          setPaddingTop(data?.items?.customOptions?.paddingTop);
          setPaddingBottom(data?.items?.customOptions?.paddingBottom);
          setPaddingRight(data?.items?.customOptions?.paddingRight);
          setPaddingLeft(data?.items?.customOptions?.paddingLeft);
          setsliderArrowColor(
            hexToHsb(data?.items?.customOptions?.sliderArrowColor),
          );
          setsliderNavigationColor(
            hexToHsb(data?.items?.customOptions?.sliderNavigationColor),
          );
          setCustomCSS(data?.items?.customOptions?.customStyles);
          setprdLimit(data?.items?.productLimit);
          setArticleTitles(data?.items?.articleTitles);
          setSelectedArticles(data?.items?.articleId);
          setHeadingColor(
            hexToHsb(data?.items?.customOptions?.headingTextColor),
          );
          setDescriptionColor(
            hexToHsb(data?.items?.customOptions?.descriptionColor),
          );
          setProductTitleColor(
            hexToHsb(data?.items?.customOptions?.prdTitleColor),
          );
          setPrdTitleSize(data?.items?.customOptions?.prdTitleSize);
          setSliderHoverBgColor(
            hexToHsb(data?.items?.customOptions?.setSliderHoverBgColor),
          );
          setSliderHoverIconColor(
            hexToHsb(data?.items?.customOptions?.sliderHoverIconColor),
          );
          setCtaBorderBorderSize(
            data?.items?.customOptions?.ctaBorderBorderSize,
          );
          setPrdTBorderSize(data?.items?.customOptions?.prdTBorderSize);
        }
      });
  };

  useEffect(() => {
    getEditData();
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher?.data?.success) {
        toast.success("Data saved successfully!");
        navigate("/app");
      } else if (fetcher.data?.success === false) {
        toast.error("Error saving data");
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
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
    hue: 0,
    brightness: 1,
    saturation: 0,
    alpha: 1,
  });
  const [ctaBorderColor, setCTAborder] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1,
  });

  const [prdBgColor, setPrdBGColor] = useState({
    hue: 0,
    brightness: 1,
    saturation: 0,
    alpha: 1,
  });
  const [prdTitleColor, setProductTitleColor] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1,
  });
  const [buttonBgColor, setbuttonBgColor] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1,
  });

  const [buttonTextColor, setbuttonTextColor] = useState({
    hue: 0,
    brightness: 1,
    saturation: 0,
    alpha: 1,
  });
  const [headingTextColor, setHeadingColor] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1,
  });
  const [descriptionColor, setDescriptionColor] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1,
  });
  const [buttonHoverColor, setbuttonHoverColor] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1,
  });

  const [prdBorderColor, setPrdBorderColor] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1,
  });

  const [sliderArrowColor, setsliderArrowColor] = useState({
    hue: 0,
    brightness: 1,
    saturation: 0,
    alpha: 1,
  });

  const [sliderNavigationColor, setsliderNavigationColor] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1,
  });
  const [sliderHoverBgColor, setSliderHoverBgColor] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1,
  });
  const [sliderHoverIconColor, setSliderHoverIconColor] = useState({
    hue: 0,
    brightness: 1,
    saturation: 0,
    alpha: 1,
  });

  const [ctaBorderRadius, setctaBorderRadius] = useState(0);

  const handleRangeSliderChange = useCallback(
    (value: number) => setctaBorderRadius(value),
    [],
  );

  const [ctaBorderBorderSize, setCtaBorderBorderSize] = useState(0);

  const ctaBorderBorderSizeHandle = useCallback(
    (value: number) => setCtaBorderBorderSize(value),
    [],
  );

  const [prdBorderRadius, setprdBorderRadius] = useState(0);

  const productBorderHandle = useCallback(
    (value: number) => setprdBorderRadius(value),
    [],
  );

  const [prdTitleSize, setPrdTitleSize] = useState(12);

  const prdTitleSizeHandle = useCallback(
    (value: number) => setPrdTitleSize(value),
    [],
  );
  const [prdTBorderSize, setPrdTBorderSize] = useState(0);

  const prdTBorderSizeHandle = useCallback(
    (value: number) => setPrdTBorderSize(value),
    [],
  );

  const [buttonTextSize, setbuttonTextSize] = useState(14);

  const buttonTextSizeHandle = useCallback(
    (value: number) => setbuttonTextSize(value),
    [],
  );

  const [staticImageRadius, setstaticImageRadius] = useState(0);

  const staticImageRadiusHandle = useCallback(
    (value: number) => setstaticImageRadius(value),
    [],
  );

  const [headingFontSize, setheadingFontSize] = useState(20);

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

  const [marginTop, setmarginTop] = useState(0);

  const setmarginTopHandle = useCallback(
    (value: number) => setmarginTop(value),
    [],
  );

  const [marginBottom, setMarginBottom] = useState(0);

  const marginBottomHandle = useCallback(
    (value: number) => setMarginBottom(value),
    [],
  );
  const [marginLeft, setmarginLeft] = useState(0);

  const setmarginLeftHandle = useCallback(
    (value: number) => setmarginLeft(value),
    [],
  );
  const [marginRight, setmarginRight] = useState(0);

  const marginRightHandle = useCallback(
    (value: number) => setmarginRight(value),
    [],
  );

  const [paddingTop, setPaddingTop] = useState(0);

  const paddingTopHanlde = useCallback(
    (value: number) => setPaddingTop(value),
    [],
  );

  const [paddingBottom, setPaddingBottom] = useState(0);

  const paddingBottomHandle = useCallback(
    (value: number) => setPaddingBottom(value),
    [],
  );

  const [paddingRight, setPaddingRight] = useState(0);

  const paddingRightHandle = useCallback(
    (value: number) => setPaddingRight(value),
    [],
  );

  const [paddingLeft, setPaddingLeft] = useState(0);

  const paddingLeftHandle = useCallback(
    (value: number) => setPaddingLeft(value),
    [],
  );

  const [prdLimit, setprdLimit] = useState(20);

  const prdLimitHandle = useCallback((value: number) => setprdLimit(value), []);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFile(file);
      setSelectedImage(URL.createObjectURL(file)); // Show preview
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setFile(null);
    (document.getElementById("file-input") as HTMLInputElement).value = "";
  };

  return (
    <Page
      title={`${itemId ? "Edit Marketing Entry" : "Create Marketing Entry"}`}
    >
      <Card roundedAbove="sm">
        <fetcher.Form method="post" encType="multipart/form-data">
          <br />
          <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
            <LegacyCard.Section title={tabs[selected].content}>
              <div
                style={
                  selected === 0 ? { display: "block" } : { display: "none" }
                }
              >
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
                    label="Item Name"
                    onChange={(value) => {
                      setItemName(value);
                    }}
                    value={itemName}
                    name="name"
                    placeholder="Enter the Item Name"
                    autoComplete="off"
                  />
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
                  {/* <div style={{ flex: "1", position: "relative" }}>
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
                  </div> */}

                  {layout === "1" || layout === "2" ? (
                    <>
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
                      <div
                        style={{
                          marginTop: "20px",
                        }}
                      >
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
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        width: "100%",
                      }}
                    >
                      <div className="upload-container">
                        <label className="upload-box" id="upload-box">
                          {selectedImage ? (
                            <>
                              <img
                                style={{
                                  width: "150px",
                                  height: "150px",
                                  borderRadius: "8px",
                                  objectFit: "cover",
                                }}
                                src={selectedImage ? selectedImage : ""}
                                alt=""
                              />
                              <button
                                className="remove-btn"
                                id="remove-btn"
                                onClick={handleRemoveImage}
                                style={{
                                  display: selectedImage ? "block" : "none",
                                  marginTop: "10px",
                                  border: "none",
                                  padding: "8px 10px",
                                  fontSize: "12px",
                                  borderRadius: "4px",
                                }}
                              >
                                Change Image
                              </button>
                            </>
                          ) : (
                            <p id="upload-text">
                              Click & Upload Your Image Here
                            </p>
                          )}

                          <input
                            type="file"
                            id="file-input"
                            name="thumbnail"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                      <TextField
                        label="Button Text"
                        onChange={(value) => {
                          setButtonText(value);
                        }}
                        name="buttonText"
                        value={buttonText}
                        placeholder="Enter the button text"
                        autoComplete="off"
                      />

                      <TextField
                        label="Button Link"
                        onChange={(value) => {
                          setButtonLink(value);
                        }}
                        name="buttonLink"
                        value={buttonLink}
                        placeholder="Enter the button Link"
                        autoComplete="off"
                      />
                    </div>
                  )}
                </FormLayout>
              </div>

              <div
                style={
                  selected === 1 ? { display: "block" } : { display: "none" }
                }
              >
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

                  <FormLayout.Group>
                    <RangeSlider
                      output
                      label="CTA card border Size"
                      min={0}
                      max={360}
                      value={ctaBorderBorderSize}
                      onChange={ctaBorderBorderSizeHandle}
                      suffix={
                        <p
                          style={{
                            minWidth: "24px",
                            textAlign: "right",
                          }}
                        >
                          {ctaBorderBorderSize}px
                        </p>
                      }
                    />

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
                  </FormLayout.Group>
                </FormLayout>
              </div>

              <div
                style={
                  selected === 2 ? { display: "block" } : { display: "none" }
                }
              >
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
                      <label htmlFor="">Product Title color</label>
                      <ColorPicker
                        onChange={setProductTitleColor}
                        color={prdTitleColor}
                      />
                      <TextField
                        label=""
                        value={hsbToHex(prdTitleColor)}
                        name="prdTitleColor"
                        placeholder="Product Title color"
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

                  <FormLayout.Group>
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

                    <RangeSlider
                      output
                      label="Product Title Size"
                      min={0}
                      max={360}
                      value={prdTitleSize}
                      onChange={prdTitleSizeHandle}
                      suffix={
                        <p
                          style={{
                            minWidth: "24px",
                            textAlign: "right",
                          }}
                        >
                          {prdTitleSize}px
                        </p>
                      }
                    />
                    <RangeSlider
                      output
                      label="Product Border Size"
                      min={0}
                      max={360}
                      value={prdTBorderSize}
                      onChange={prdTBorderSizeHandle}
                      suffix={
                        <p
                          style={{
                            minWidth: "24px",
                            textAlign: "right",
                          }}
                        >
                          {prdTitleSize}px
                        </p>
                      }
                    />
                  </FormLayout.Group>
                </FormLayout>
              </div>

              <div
                style={
                  selected === 3 ? { display: "block" } : { display: "none" }
                }
              >
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
                        name="buttonBackgroundColor"
                        placeholder="Button Background color"
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
                        name="buttonTextColor"
                        placeholder="Button Text color"
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
                        name="buttonHoverColor"
                        placeholder="Button Hover color"
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
              </div>

              <div
                style={
                  selected === 4 ? { display: "block" } : { display: "none" }
                }
              >
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
              </div>

              <div
                style={
                  selected === 5 ? { display: "block" } : { display: "none" }
                }
              >
                <FormLayout>
                  <FormLayout.Group>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexDirection: "column",
                          marginBottom: "20px",
                        }}
                      >
                        <label htmlFor="">Heading Text Color</label>
                        <ColorPicker
                          onChange={setHeadingColor}
                          color={headingTextColor}
                        />
                        <TextField
                          label=""
                          value={hsbToHex(headingTextColor)}
                          name="headingTextColor"
                          placeholder="Heading Text color"
                          autoComplete="off"
                        />
                      </div>
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
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexDirection: "column",
                          marginBottom: "20px",
                        }}
                      >
                        <label htmlFor="">Description Text Color</label>
                        <ColorPicker
                          onChange={setDescriptionColor}
                          color={descriptionColor}
                        />
                        <TextField
                          label=""
                          value={hsbToHex(descriptionColor)}
                          name="descriptionColor"
                          placeholder="Description Text color"
                          autoComplete="off"
                        />
                      </div>

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
                    </div>
                  </FormLayout.Group>
                </FormLayout>
              </div>

              <div
                style={
                  selected === 6 ? { display: "block" } : { display: "none" }
                }
              >
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
              </div>

              <div
                style={
                  selected === 7 ? { display: "block" } : { display: "none" }
                }
              >
                <FormLayout>
                  <FormLayout.Group>
                    <div
                      style={{
                        width: "200px",
                        display: "flex",
                        gap: "10px",
                        flexDirection: "column",
                      }}
                    >
                      <label htmlFor="">Slider Arrow Background color</label>
                      <ColorPicker
                        onChange={setsliderArrowColor}
                        color={sliderArrowColor}
                      />
                      <TextField
                        label=""
                        value={hsbToHex(sliderArrowColor)}
                        name="sliderArrowColor"
                        placeholder="Slider Background color"
                        autoComplete="off"
                      />
                    </div>

                    <div
                      style={{
                        width: "200px",
                        display: "flex",
                        gap: "10px",
                        flexDirection: "column",
                      }}
                    >
                      <label htmlFor="">Slider Icon color</label>
                      <ColorPicker
                        onChange={setsliderNavigationColor}
                        color={sliderNavigationColor}
                      />
                      <TextField
                        label=""
                        value={hsbToHex(sliderNavigationColor)}
                        name="sliderNavigationColor"
                        placeholder="Slider Icon color"
                        autoComplete="off"
                      />
                    </div>

                    <div
                      style={{
                        width: "200px",
                        display: "flex",
                        gap: "10px",
                        flexDirection: "column",
                      }}
                    >
                      <label htmlFor="">Slider Hover Background color</label>
                      <ColorPicker
                        onChange={setSliderHoverBgColor}
                        color={sliderHoverBgColor}
                      />
                      <TextField
                        label=""
                        value={hsbToHex(sliderHoverBgColor)}
                        name="sliderHoverBgColor"
                        placeholder="Slider Hover Background Color"
                        autoComplete="off"
                      />
                    </div>

                    <div
                      style={{
                        width: "200px",
                        display: "flex",
                        gap: "10px",
                        flexDirection: "column",
                      }}
                    >
                      <label htmlFor="">Slider Hover Icon color</label>
                      <ColorPicker
                        onChange={setSliderHoverIconColor}
                        color={sliderHoverIconColor}
                      />
                      <TextField
                        label=""
                        value={hsbToHex(sliderHoverIconColor)}
                        name="sliderHoverIconColor"
                        placeholder="Slider Hover Icon Color"
                        autoComplete="off"
                      />
                    </div>
                  </FormLayout.Group>
                </FormLayout>
              </div>
              <div
                style={
                  selected === 8 ? { display: "block" } : { display: "none" }
                }
              >
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
                      name="customStyles"
                    />
                  </div>
                </FormLayout>
              </div>

              <input type="hidden" name="productHandle" value={producthandle} />
              <input type="hidden" name="categoryId" value={selectedCategory} />
              <input type="hidden" name="blogId" value={selectBlog} />
              {/* <input type="hidden" name="articleId" value={blogId} /> */}
              {/* <input type="hidden" name="articleTitles" value={articleTitles} /> */}
              <input
                type="hidden"
                name="productLimit"
                value={String(prdLimit)}
              />
              <input
                type="hidden"
                name="ctaBorderRadius"
                value={ctaBorderRadius}
              />
              <input
                type="hidden"
                name="prdBorderRadius"
                value={prdBorderRadius}
              />
              <input
                type="hidden"
                name="buttonTextSize"
                value={buttonTextSize}
              />
              <input
                type="hidden"
                name="staticImageRadius"
                value={staticImageRadius}
              />
              <input
                type="hidden"
                name="headingFontSize"
                value={headingFontSize}
              />
              <input
                type="hidden"
                name="descriptionFontSize"
                value={descriptionFontSize}
              />
              <input type="hidden" name="marginTop" value={marginTop} />
              <input type="hidden" name="marginBottom" value={marginBottom} />
              <input type="hidden" name="marginLeft" value={marginLeft} />
              <input type="hidden" name="marginRight" value={marginRight} />
              <input type="hidden" name="paddingTop" value={paddingTop} />
              <input type="hidden" name="paddingBottom" value={paddingBottom} />
              <input type="hidden" name="paddingLeft" value={paddingLeft} />
              <input type="hidden" name="paddingRight" value={paddingRight} />
              <input type="hidden" name="existingId" value={String(itemId)} />
              <input type="hidden" name="prdTitleSize" value={prdTitleSize} />
              <input
                type="hidden"
                name="prdTBorderSize"
                value={prdTBorderSize}
              />
              <input
                type="hidden"
                name="ctaBorderBorderSize"
                value={ctaBorderBorderSize}
              />
              {editData && (
                <input
                  type="hidden"
                  name="isThumbnail"
                  value={editData.thumbnail}
                />
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
