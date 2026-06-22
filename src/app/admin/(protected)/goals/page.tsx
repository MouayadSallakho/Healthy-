"use client";

import { ResourceManager } from "@/features/admin/resources/resource-manager";
import { goalsConfig } from "@/features/admin/resources/resource-configs";

export default function AdminGoalsPage() {
  return <ResourceManager config={goalsConfig} />;
}
