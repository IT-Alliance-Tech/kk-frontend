"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminContactSubmissions } from "@/lib/admin";
import GlobalLoader from "@/components/common/GlobalLoader";

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  createdAt: string;
}

export default function RecentContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecentSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch only the latest 5 submissions
        const response = await getAdminContactSubmissions({ page: 1, limit: 5 });
        
        // Handle the paginated response structure
        if (response && response.submissions) {
          setSubmissions(response.submissions || []);
        } else {
          setSubmissions([]);
        }
      } catch (err: any) {
        console.error("Failed to load recent contact submissions:", err);
        setError(err.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    loadRecentSubmissions();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="kk-admin-contact-submissions bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
      <div className="px-3 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Contact Submissions</h3>
        <Link
          href="/admin/contact-submissions"
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
        >
          View All →
        </Link>
      </div>

      <div className="overflow-x-auto w-full">
        {loading && (
          <div className="px-3 sm:px-6 py-8 flex justify-center">
            <GlobalLoader size="medium" />
          </div>
        )}

        {error && (
          <div className="px-3 sm:px-6 py-8 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && submissions.length === 0 && (
          <div className="px-3 sm:px-6 py-8 text-center text-sm text-gray-500">
            No contact submissions yet
          </div>
        )}

        {!loading && !error && submissions.length > 0 && (
          <table className="w-full min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Subject
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <span className="text-xs sm:text-sm font-medium text-gray-900 block truncate max-w-[150px]">
                      {submission.name}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <a
                      href={`mailto:${submission.email}`}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline block truncate max-w-[200px]"
                    >
                      {submission.email}
                    </a>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 hidden md:table-cell">
                    <span className="text-xs sm:text-sm text-gray-700 block truncate max-w-[250px]">
                      {submission.subject || "-"}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <span className="text-xs sm:text-sm text-gray-500">
                      {formatDate(submission.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
