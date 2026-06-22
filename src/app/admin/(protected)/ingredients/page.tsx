"use client";

import { ResourceManager } from "@/features/admin/resources/resource-manager";
import { ingredientsConfig } from "@/features/admin/resources/resource-configs";

export default function AdminIngredientsPage() {
  return <ResourceManager config={ingredientsConfig} />;
}
