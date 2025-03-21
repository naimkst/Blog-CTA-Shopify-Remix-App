import { LinksFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spinner } from "@shopify/polaris";

export default function App() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigation.state === "loading") {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [navigation.state]);

  console.log("transition===", navigation.state);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <link rel="stylesheet" href="/assets/style.css" />
        <Meta />
        <Links />
      </head>
      <body>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "90vh",
            }}
          >
            <Spinner accessibilityLabel="Spinner example" size="large" />
          </div>
        ) : (
          <>
            <ToastContainer position="top-right" autoClose={3000} />
            <Outlet />
            <ScrollRestoration />
            <Scripts />
          </>
        )}
      </body>
    </html>
  );
}
