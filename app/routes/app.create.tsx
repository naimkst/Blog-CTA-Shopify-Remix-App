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

    return json(
      {
        success: true,
        message: "Data saved successfully",
        entry: newMarketingEntry,
      },
      { status: 201 },
    );
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
  const [article, setArticle] = useState([]);
  const [articleId, setArticleId] = useState("");
  const [selectArticle, setSelectArticle] = useState<any>(null);
  const [selectBlog, setSelectBlog] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [productId, setProductId] = useState("");
  const [producthandle, setProductHandle] = useState("");
  const [position, setPosition] = useState("5");
  const [layout, setLayout] = useState("1");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [blogsId, setBlogsId] = useState<string[]>([]);

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
        console.log("Articles:", data?.articles);
        setArticle(data?.articles || []);
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

  return (
    <Page title="Create Marketing Entry">
      <Card roundedAbove="sm">
        <fetcher.Form method="post">
          <br />
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
                console.log("Selected Blog:", !value);
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
                  }}
                >
                  <Spinner accessibilityLabel="Spinner example" size="large" />
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
                  setProductId(selectedProduct.id);
                  setProductHandle(selectedProduct.handle);
                }
              }}
            />
            <input type="hidden" name="productHandle" value={producthandle} />
            <input type="hidden" name="categoryId" value={selectedCategory} />
            <input type="hidden" name="blogId" value={selectedArticles} />
            <input type="hidden" name="articleId" value={blogId} />
            <input type="hidden" name="articleTitles" value={articleTitles} />
            <Button submit>Save</Button>
          </FormLayout>
        </fetcher.Form>
      </Card>
    </Page>
  );
}
