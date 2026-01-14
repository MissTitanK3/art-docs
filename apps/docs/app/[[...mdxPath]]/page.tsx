import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateStaticParamsFor, importPage } from "nextra/pages";
import { getPageMap } from "nextra/page-map";
import { Layout, Navbar } from "nextra-theme-docs";
import { useMDXComponents as getDocsComponents } from "../../mdx-components";
import themeConfig from "../../theme.config";

type PageParams = { mdxPath?: string[] };

export const generateStaticParams = generateStaticParamsFor("mdxPath");

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams> | PageParams;
}): Promise<Metadata> {
  const mdxPath = (await params).mdxPath ?? [];
  const { metadata } = await importPage(mdxPath);
  return metadata;
}

export default async function Page({
  params,
}: {
  params: Promise<PageParams> | PageParams;
}) {
  const mdxPath = (await params).mdxPath ?? [];
  const pageMap = await getPageMap();
  const { default: MDXContent, toc, metadata, sourceCode } = await importPage(
    mdxPath,
  );

  const { wrapper: MDXWrapper } = getDocsComponents({});
  const Wrapper =
    MDXWrapper ??
    (({ children }: { children: ReactNode }) => <div className="z-0">{children}</div>);

  return (
    <Layout editLink={false} feedback={{
      content: "",
      labels: "",
      link: "/"
    }} toc={{
      backToTop: true,
    }} pageMap={pageMap} {...themeConfig} navbar={<Navbar className="nextra-mobile-nav" logo={<h1>ART Docs</h1>} />} copyPageButton={false}>
      <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
        <MDXContent />
      </Wrapper>
    </Layout>
  );
}
