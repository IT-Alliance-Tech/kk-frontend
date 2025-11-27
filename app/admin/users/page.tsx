"use client";

import { useEffect, useState } from "react";
import { getAdminUsers } from "@/lib/admin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    getAdminUsers().then((res) => {
      // getAdminUsers now returns array directly via ensureArray
      setUsers(Array.isArray(res) ? res : []);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u: any) => (
            <tr key={u._id}>
              <td className="border p-2">{u.name}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
