import { apiGet } from "@/lib/api";

export async function getCategories() {
  return apiGet("/categories");
}
