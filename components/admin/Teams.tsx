"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "teams"),
      (snap) => {
        setPermissionError(null);
        setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        if (err?.code === "permission-denied") {
          setPermissionError("No permission to read teams.");
          setTeams([]);
          return;
        }
        console.error("Teams listener error:", err);
      }
    );
    return () => unsub();
  }, []);

  const filteredTeams = teams.filter((t) => t.name?.toLowerCase().includes(search.toLowerCase()));

  const deleteTeam = async (id: string) => {
    if (confirm("Are you sure you want to delete this team?")) {
      await deleteDoc(doc(db, "teams", id));
      alert("Team deleted");
      setSelectedTeam(null);
    }
  };

  const editTeamName = async (id: string, name: string) => {
    await updateDoc(doc(db, "teams", id), { name });
    alert("Team updated");
  };

  return (
    <div className="mt-10 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Teams</h2>
        <p className="text-gray-400 text-sm">Manage teams and members</p>
      </div>

      {permissionError && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
          {permissionError}
        </div>
      )}

      <input
        placeholder="Search teams..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {filteredTeams.slice(0, 20).map((team) => (
          <div
            key={team.id}
            onClick={() => setSelectedTeam(team)}
            className="cursor-pointer bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition"
          >
            <p className="font-medium">{team.name}</p>
            <p className="text-gray-400 text-sm">{team.members?.length || 0} members</p>
          </div>
        ))}
      </div>

      {selectedTeam && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-semibold">{selectedTeam.name}</h3>
          <p>ID: {selectedTeam.id}</p>

          <div className="flex gap-2">
            <input
              type="text"
              defaultValue={selectedTeam.name}
              onBlur={(e) => editTeamName(selectedTeam.id, e.target.value)}
              className="p-2 rounded bg-black/40 border border-white/10"
            />
            <span className="text-gray-400 text-sm">Blur to save</span>
          </div>

          <button onClick={() => deleteTeam(selectedTeam.id)} className="bg-red-600 px-3 py-2 rounded">
            Delete Team
          </button>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Members</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {selectedTeam.members?.map((m: any, i: number) => (
                <div key={i} className="flex justify-between text-sm border-b border-white/5 pb-1">
                  <span>{m.name || m.email}</span>
                  <span className="text-gray-400 text-xs">{m.role || "Member"}</span>
                </div>
              )) || <p className="text-gray-500">No members</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}