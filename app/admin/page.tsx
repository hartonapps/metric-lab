"use client";
import React, { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebaseClient";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type UserData = {
  id: string;
  name: string;
  role: string;
  email: string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch users collection
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const data: UserData[] = [];
      querySnapshot.forEach(docSnap => {
        data.push({ id: docSnap.id, ...docSnap.data() } as UserData);
      });
      setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, [currentUser]);

  const updateRole = async (id: string, newRole: string) => {
    await updateDoc(doc(db, "users", id), { role: newRole });
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, role: newRole } : u)));
  };

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  if (!currentUser) return <p>Please login as admin</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <table className="min-w-full border">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b">
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">
                <select
                  value={user.role}
                  onChange={e => updateRole(user.id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => deleteUser(user.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}