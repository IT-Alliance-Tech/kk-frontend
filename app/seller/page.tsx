"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Package, ShoppingCart, TrendingUp, Plus } from "lucide-react";
import GlobalLoader from "@/components/common/GlobalLoader";

export const dynamic = "force-dynamic";

export default function SellerDashboard() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile) {
      router.push("/login");
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlobalLoader size="large" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  if (profile.role !== "seller" && profile.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{`Access Denied`}</h2>
            <p className="text-slate-600 mb-6">{`You don't have permission to access this page`}</p>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "My Products",
      value: "0",
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Sales",
      value: "0",
      icon: ShoppingCart,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Revenue",
      value: "$0",
      icon: TrendingUp,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Seller Dashboard
              </h1>
              <p className="text-slate-600">
                Manage your products and inventory
              </p>
            </div>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Product
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>My Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No products yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Start adding products to your inventory
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
