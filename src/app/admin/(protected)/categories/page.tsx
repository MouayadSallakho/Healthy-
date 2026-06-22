"use client";

import { ResourceManager } from "@/features/admin/resources/resource-manager";
import { categoriesConfig } from "@/features/admin/resources/resource-configs";

export default function AdminCategoriesPage() {
  return <ResourceManager config={categoriesConfig} />;
}
