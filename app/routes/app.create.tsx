import { useState, useEffect } from "react";
import { Form, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import {
  Button,
  Card,
  FormLayout,
  Page,
  Select,
  TextField,
} from "@shopify/polaris";
import { ActionFunction, json, redirect } from "@remix-run/node";
import { cors } from "remix-utils/cors";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { redirectDocument } from "@remix-run/node";

export let action: ActionFunction = async ({ request }) => {
  try {
    const formData = new URLSearchParams(await request.text());

    // Extract values
    const productId = formData.get("productId");
    const title = formData.get("title");
    const productTitle = formData.get("productTitle");
    const productImage = formData.get("productImage") || "";
    const blogId = formData.get("blogId") || "";
    const position = formData.get("position") || "";
    const productSlug = formData.get("productSlug") || ""; // ✅ Get productSlug

    // Validate required fields
    if (!productId || !title || !productTitle) {
      return json({ message: "All fields are required" }, { status: 400 });
    }

    // ✅ Save form data to Prisma (including productSlug)
    const newMarketingEntry = await prisma.item.create({
      data: {
        id: productId,
        title,
        productId,
        productImage,
        productTitle,
        blogId,
        position,
        productSlug, // ✅ Save productSlug
      },
    });

    //if susccessful, return a success message

    if (!newMarketingEntry) {
      return json({ message: "Error saving data" }, { status: 400 });
    }
    if (newMarketingEntry) {
      return json(
        {
          message: "Data saved successfully",
          entry: newMarketingEntry,
        },
        { status: 201 },
      );
    }
    if (!newMarketingEntry) {
      return json({ message: "Error saving data" }, { status: 400 });
    }

    // Redirect to the home page on success
    return redirect("/", { status: 302 });
  } catch (error) {
    console.error("Error saving data:", error);
    return json(
      { message: "Internal Server Error", error: error.message },
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
  const [titleValue, setTitleValue] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [producthandle, setProductHandle] = useState("");
  const [position, setPosition] = useState("5");

  const navigation = useNavigation();
  const navigate = useNavigate();
  useEffect(() => {
    console.log("Navigation state:", navigation.state);
    if (navigation.state === "submitting") {
      toast.success("Data saved successfully!");
      setTimeout(() => {
        navigate("/app");
      }, 2000);
    } else if (navigation.state === "idle") {
      if (navigation.formData) {
        toast.success("Data saved successfully!");
        setTimeout(() => {
          navigate("/app");
        }, 2000);
      }
    }
  }, [navigation]);

  useEffect(() => {
    // Fetch product categories from Shopify
    fetch("/api/category")
      .then((res) => res.json())
      .then((data) => setProducts(data?.products || []));

    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data.blogs || []);
        setBlogId(data.blogs[0]?.id || "");
      });
  }, []);

  const getArticle = async (blogId: string) => {
    if (blogId === "") {
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
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
      });
  };

  return (
    <Page title="Category Selector">
      <ToastContainer />
      <Card roundedAbove="sm">
        <Form method="post">
          <br />
          <FormLayout>
            <TextField
              label="CTA Name"
              onChange={(value) => {
                setTitleValue(value);
              }}
              value={titleValue}
              name="title"
              autoComplete="off"
            />
            <TextField
              label="Position"
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
                console.log("Selected Blog:", value);
                setSelectBlog(String(value));
                getArticle(String(value));
              }}
            />
            <Select
              label="Select a Article"
              options={[
                { label: "Select your Article", value: "" }, // Add the default option
                ...article.map((cat: any) => ({
                  label: cat.title,
                  value: String(cat.id), // Store only the ID
                })),
              ]}
              value={String(articleId)}
              onChange={(value: any) => {
                setArticleId(String(value));
              }}
            />
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
                console.log("Selected Product:", selectedProduct);
                if (selectedProduct) {
                  console.log("Selected Product Data:", selectedProduct);
                  setProductImage(selectedProduct.image.src || "");
                  setProductTitle(selectedProduct.title);
                  setProductHandle(selectedProduct.handle);
                }
              }}
            />
            <input type="hidden" name="productSlug" value={producthandle} />
            <input type="hidden" name="productId" value={selectedCategory} />
            <input type="hidden" name="productImage" value={productImage} />
            <input type="hidden" name="productTitle" value={productTitle} />
            <input type="hidden" name="blogId" value={articleId} />

            <Button submit>Save</Button>
          </FormLayout>
        </Form>
      </Card>
    </Page>
  );
}
