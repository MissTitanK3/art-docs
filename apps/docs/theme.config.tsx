import type { LayoutProps } from "nextra-theme-docs/dist/types.generated";

type ThemeConfigProps = Partial<LayoutProps>;

const config: ThemeConfigProps = {
  navbar: true,
  sidebar: {
    defaultMenuCollapseLevel: 1,
  },
  footer: "Region Dispatch Documentation",
};

export default config;
