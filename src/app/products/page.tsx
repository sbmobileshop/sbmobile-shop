"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import FeaturedProducts from "@/components/home/FeaturedProducts";

export default function ProductsPage() {
  return (
    <div className="min-h-screen pt-16">
      <FeaturedProducts />
    </div>
  );
}
