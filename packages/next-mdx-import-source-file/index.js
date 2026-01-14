export function useMDXComponents(components) {
  // Minimal shim: return provided components or an empty object.
  // Nextra/Next may expect this to return a mapping of MDX components.
  return components ?? {};
}
