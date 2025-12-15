export function normalizeSrc(input: any): string {
  try {
    // If array → use first valid string
    if (Array.isArray(input)) {
      const firstValid = input.find(
        (x) => typeof x === "string" && x.trim() !== ""
      );
      if (firstValid) return normalizeSrc(firstValid);
    }

    // If not string → fallback
    if (typeof input !== "string") return "/no-image.png";

    const src = input.trim();

    if (!src) return "/no-image.png";

    // Full URL already
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return src;
    }

    // Backend absolute path
    if (src.startsWith("/uploads")) {
      return `${process.env.NEXT_PUBLIC_API_URL}${src}`;
    }

    // Backend missing slash
    if (src.startsWith("uploads")) {
      return `${process.env.NEXT_PUBLIC_API_URL}/${src}`;
    }

    return src;
  } catch {
    return "/no-image.png";
  }
}
