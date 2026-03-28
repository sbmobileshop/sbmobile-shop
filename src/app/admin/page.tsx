"use client";

import React from "react";
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Products",
    titleBn: "মোট পণ্য",
    value: "156",
    icon: Package,
    change: "+12%",
    color: "text-blue-500",
  },
  {
    title: "Total Orders",
    titleBn: "মোট অর্ডার",
    value: "89",
    icon: ShoppingCart,
    change: "+8%",
    color: "text-green-500",
  },
  {
    title: "Total Customers",
    titleBn: "মোট গ্রাহক",
    value: "234",
    icon: Users,
    change: "+15%",
    color: "text-purple-500",
  },
  {
    title: "Total Revenue",
    titleBn: "মোট আয়",
    value: "৳1.2M",
    icon: DollarSign,
    change: "+23%",
    color: "text-accent",
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">{stat.change}</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Order #SB{Math.random().toString(36).substring(7).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">2 items - ৳{Math.floor(Math.random() * 50000)}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Add Product", icon: Package },
                { label: "View Orders", icon: ShoppingCart },
                { label: "Analytics", icon: Eye },
                { label: "Settings", icon: TrendingUp },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    className="p-4 bg-muted/30 rounded-xl hover:bg-accent/10 hover:border-accent/30 border border-transparent transition-all text-left"
                  >
                    <Icon className="h-5 w-5 text-accent mb-2" />
                    <p className="font-medium text-foreground text-sm">{action.label}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
