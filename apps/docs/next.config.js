import path from "path";
import { fileURLToPath } from "url";
import nextra from "nextra";

const withNextra = nextra({});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "..", ".."),
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

export default withNextra(nextConfig);
