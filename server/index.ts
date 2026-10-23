import cors from "cors";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { extname, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

const app = express();
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const buildDirectory = resolve(projectRoot, "dist");

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use(express.static(buildDirectory));
app.use((req, res, next) => {
  if (req.method !== "GET" || extname(req.path)) {
    next();
    return;
  }

  res.sendFile(resolve(buildDirectory, "index.html"));
});

const port = Number(process.env.PORT || 5000);
app.listen(port, "0.0.0.0", () => {
  console.log(`Quiz site listening on port ${port}`);
});
