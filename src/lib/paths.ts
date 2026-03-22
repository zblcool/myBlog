const ABSOLUTE_URL_PATTERN = /^(?:[a-z]+:)?\/\//i;

export function isExternalPath(value: string) {
  return (
    ABSOLUTE_URL_PATTERN.test(value) ||
    value.startsWith("mailto:") ||
    value.startsWith("#")
  );
}

export function withBase(value: string) {
  if (!value) {
    return import.meta.env.BASE_URL;
  }

  if (isExternalPath(value)) {
    return value;
  }

  const normalized = value.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalized}`;
}

export function stripBase(pathname: string) {
  const base = import.meta.env.BASE_URL;

  if (base === "/" || !pathname.startsWith(base)) {
    return pathname;
  }

  const stripped = pathname.slice(base.length - 1);
  return stripped || "/";
}
