import {
  Box,
  Link,
  Page,
  Badge,
  Icon,
  InlineStack,
  Tooltip,
  Thumbnail,
  Divider,
  LegacyCard,
  EmptyState,
} from "@shopify/polaris";
import prisma from "../db.server";
import { Form, useLoaderData } from "@remix-run/react";
import {
  CheckCircleIcon,
  DeleteIcon,
  WandIcon,
  XIcon,
} from "@shopify/polaris-icons";
import { json } from "@remix-run/node";
import { toast } from "react-toastify";
import { cors } from "remix-utils/cors";
import { authenticate } from "app/shopify.server";
import { Link as LinkTo } from "@remix-run/react";

export const loader = async ({ request }: any) => {
  const { session } = await authenticate.admin(request);
  console.log("Request method:", session);
  const reviews = await prisma.marketing.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  // return { reviews };

  const response = json({
    reviews,
  });
  return await cors(request, response);
};
export const action = async ({ request }: any) => {
  const body = await request.formData();
  if (request.method == "DELETE") {
    try {
      const updatedReview = await prisma.marketing.delete({
        where: { id: body.get("id") },
      });

      const response = json({
        message: "Review is deleted",
      });
      return await cors(request, response);
    } catch (error) {
      console.error("Error updating review:", error);
      throw new Error("Could not approve the review.");
    }
  }
};
export default function Index() {
  const { reviews } = useLoaderData<typeof loader>();

  if (!reviews || reviews.length === 0) {
    return (
      <Page fullWidth>
        <LegacyCard sectioned>
          <EmptyState
            heading="No Item Found!"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          ></EmptyState>
        </LegacyCard>
      </Page>
    );
  }

  return (
    <Page fullWidth>
      <Box background="bg-surface">
        {/* Table Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            fontWeight: "bold",
            gap: "30px",
            padding: "10px",
          }}
        >
          <div style={{ flex: "1" }}>Image</div>
          <div style={{ flex: "1" }}>Title</div>
          <div style={{ flex: "1" }}>Handle</div>
          <div style={{ flex: "1" }}>Layout</div>
          <div style={{ flex: "1" }}>Position</div>
          <div style={{ flex: "1" }}>Status</div>
          <div style={{ flex: "1" }}>Action</div>
        </div>
        <Divider />
        {reviews.map((item: any, index: any) => (
          <Box background="bg-surface" key={item?.id}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "10px",
              }}
            >
              {item?.thumbnail ? (
                <div style={{ flex: "1" }}>
                  <Thumbnail
                    source={`/uploads/` + item?.thumbnail}
                    alt={item?.productTitle}
                  />
                </div>
              ) : (
                <div style={{ flex: "1" }}>
                  <Thumbnail
                    source={`/assets/images/Image-not-found.png`}
                    alt={item?.productTitle}
                  />
                </div>
              )}

              <div style={{ flex: "1" }}>{item?.name}</div>
              <div style={{ flex: "1" }}>{item?.headline}</div>
              <div style={{ flex: "1" }}>{item?.layout}</div>
              <div style={{ flex: "1" }}>{item?.position}</div>

              <div style={{ flex: "1" }}>
                <InlineStack wrap={false}>
                  {item?.status == "0" ? (
                    <Badge tone="critical">Pending</Badge>
                  ) : (
                    <Badge tone="success">Active</Badge>
                  )}
                </InlineStack>
              </div>

              <div style={{ flex: "1" }}>
                <InlineStack wrap={false}>
                  <Form method="DELETE">
                    <input type="hidden" name="id" value={item?.id} />
                    <button
                      type="submit"
                      style={{ background: "transparent", border: "none" }}
                    >
                      <Link onClick={() => toast.error("Review is deleted!")}>
                        <Tooltip content="Delete">
                          <Icon
                            source={DeleteIcon}
                            tone="critical"
                            accessibilityLabel="Delete"
                          />
                        </Tooltip>
                      </Link>
                    </button>
                  </Form>

                  <Form method="PUT">
                    <input type="hidden" name="id" value={item?.id} />
                    <button
                      type="submit"
                      style={{ background: "transparent", border: "none" }}
                    >
                      <Link
                        onClick={() => toast.success("Review is rejected!")}
                      >
                        <Tooltip content="Pending">
                          <Icon
                            source={XIcon}
                            tone="critical"
                            accessibilityLabel="Reject"
                          />
                        </Tooltip>
                      </Link>
                    </button>
                  </Form>
                  <Form method="PATCH">
                    <input type="hidden" name="id" value={item?.id} />
                    <button
                      type="submit"
                      style={{ background: "transparent", border: "none" }}
                    >
                      <Link
                        onClick={() => toast.success("Review is approved!")}
                      >
                        <Tooltip content="Accept">
                          <Icon
                            source={CheckCircleIcon}
                            tone="success"
                            accessibilityLabel="Accept"
                          />
                        </Tooltip>
                      </Link>
                    </button>
                  </Form>

                  <Form method="PATCH">
                    <input type="hidden" name="id" value={item?.id} />
                    <button
                      type="submit"
                      style={{ background: "transparent", border: "none" }}
                    >
                      <LinkTo to={`/app/create?id=${item?.id}`}>
                        <Tooltip content="Edit">
                          <Icon
                            source={WandIcon}
                            tone="success"
                            accessibilityLabel="Edit"
                          />
                        </Tooltip>
                      </LinkTo>
                    </button>
                  </Form>
                </InlineStack>
              </div>
            </div>
            <Divider />
          </Box>
        ))}
      </Box>
    </Page>
  );
}
