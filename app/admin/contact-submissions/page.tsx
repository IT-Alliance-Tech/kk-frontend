"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminContactSubmissions } from "@/lib/admin";
import { useRouter } from "next/navigation";
import GlobalLoader from "@/components/common/GlobalLoader";

interface ContactSubmission {
  _id: string;
  name: string;
  mobile: string;
  email: string;
  subject?: string;
  message?: string;
  source: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadSubmissions = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminContactSubmissions({ page, limit: 10 });
      
      // Handle the paginated response structure
      if (response && response.submissions) {
        setSubmissions(response.submissions || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else {
        setSubmissions([]);
      }
    } catch (err: any) {
      console.error("Failed to load contact submissions:", err);
      setError(err.message || "Failed to load contact submissions");
      
      // Handle 401 Unauthorized - redirect to login
      if (err.status === 401 || err.message?.includes("Invalid user") || err.message?.includes("Not authenticated")) {
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadSubmissions(1);
  }, [loadSubmissions]);

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      loadSubmissions(pagination.page + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      loadSubmissions(pagination.page - 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    loadSubmissions(pageNumber);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const { page, totalPages } = pagination;

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Contact Form Submissions</h1>
        <div className="text-sm text-gray-600">
          Total: {pagination.total} {pagination.total === 1 ? "submission" : "submissions"}
          {pagination.total > 0 && (
            <span className="ml-2">
              (Page {pagination.page} of {pagination.totalPages})
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <GlobalLoader size="large" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && !error && submissions.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No contact submissions yet.
        </div>
      )}

      {!loading && !error && submissions.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border min-w-[800px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-1.5 sm:p-2 text-xs sm:text-sm text-left">Date</th>
                  <th className="border p-1.5 sm:p-2 text-xs sm:text-sm text-left">Name</th>
                  <th className="border p-1.5 sm:p-2 text-xs sm:text-sm text-left">Email</th>
                  <th className="border p-1.5 sm:p-2 text-xs sm:text-sm text-left">Mobile</th>
                  <th className="border p-1.5 sm:p-2 text-xs sm:text-sm text-left">Subject</th>
                  <th className="border p-1.5 sm:p-2 text-xs sm:text-sm text-left">Message</th>
                  <th className="border p-1.5 sm:p-2 text-xs sm:text-sm text-center">Source</th>
                </tr>
              </thead>

              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="border p-1.5 sm:p-2 text-xs sm:text-sm whitespace-nowrap">
                      {formatDate(submission.createdAt)}
                    </td>
                    <td className="border p-1.5 sm:p-2 text-xs sm:text-sm">
                      {submission.name}
                    </td>
                    <td className="border p-1.5 sm:p-2 text-xs sm:text-sm">
                      <a 
                        href={`mailto:${submission.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {submission.email}
                      </a>
                    </td>
                    <td className="border p-1.5 sm:p-2 text-xs sm:text-sm whitespace-nowrap">
                      <a 
                        href={`tel:${submission.mobile}`}
                        className="text-blue-600 hover:underline"
                      >
                        {submission.mobile}
                      </a>
                    </td>
                    <td className="border p-1.5 sm:p-2 text-xs sm:text-sm">
                      {submission.subject || "-"}
                    </td>
                    <td className="border p-1.5 sm:p-2 text-xs sm:text-sm">
                      <div className="max-w-xs overflow-hidden">
                        <div className="line-clamp-2" title={submission.message || ""}>
                          {submission.message || "-"}
                        </div>
                      </div>
                    </td>
                    <td className="border p-1.5 sm:p-2 text-xs sm:text-sm text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs">
                        {submission.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              {/* Page info */}
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} submissions
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
                {/* Previous button */}
                <button
                  onClick={handlePrevPage}
                  disabled={!pagination.hasPrevPage || loading}
                  className={`px-3 py-1.5 text-sm font-medium rounded border ${
                    pagination.hasPrevPage && !loading
                      ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  }`}
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {getPageNumbers().map((pageNum, idx) => (
                    pageNum === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-3 py-1.5 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => handlePageClick(pageNum as number)}
                        disabled={loading}
                        className={`px-3 py-1.5 text-sm font-medium rounded border ${
                          pagination.page === pageNum
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        {pageNum}
                      </button>
                    )
                  ))}
                </div>

                {/* Mobile: show current page */}
                <div className="sm:hidden px-3 py-1.5 text-sm font-medium">
                  {pagination.page} / {pagination.totalPages}
                </div>

                {/* Next button */}
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage || loading}
                  className={`px-3 py-1.5 text-sm font-medium rounded border ${
                    pagination.hasNextPage && !loading
                      ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
