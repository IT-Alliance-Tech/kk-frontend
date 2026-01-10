/**
 * Admin Returns Management Page
 * /admin/returns
 */

import AdminReturnManagementEnhanced from "@/components/AdminReturnManagementEnhanced";

export const metadata = {
  title: "Return Management | Admin Dashboard",
  description: "Manage customer return and refund requests",
};

export default function AdminReturnsPage() {
  return <AdminReturnManagementEnhanced />;
}
