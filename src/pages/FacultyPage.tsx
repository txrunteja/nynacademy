import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Plus, Search, Edit, Trash2 } from "lucide-react";
import { createFaculty, deleteFaculty, facultyStats, getFaculty, updateFaculty } from "../api/faculty";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { ModalOrDrawer } from "../components/ui/ModalOrDrawer";
import { Pagination } from "../components/ui/Pagination";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { Faculty } from "../types/db";

const emptyForm = { name: "", phone: "", subjects: "" };

export function FacultyPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [form, setForm] = useState(emptyForm);
  const debounced = useDebouncedValue(search);
  
  const { data, isLoading } = useQuery({ queryKey: ["faculty", page, debounced], queryFn: () => getFaculty(page, 25, debounced) });
  const { data: stats } = useQuery({ queryKey: ["faculty-stats"], queryFn: facultyStats });

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        phone: form.phone,
        subjects: form.subjects.split(",").map((x) => x.trim()).filter(Boolean),
      };
      if (editing) return updateFaculty(editing.id, payload);
      return createFaculty(payload);
    },
    onSuccess: () => {
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteFaculty,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faculty"] }),
  });

  const statsMap = new Map((stats ?? []).map((s) => [s.faculty_id, s]));
  const rows = data?.data ?? [];
  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Faculty</h1>
          <p className="mt-2 text-[var(--text-muted)] text-lg">Manage teaching staff and view performance stats.</p>
        </div>
        <button 
          className="app-button-primary shadow-lg shadow-purple-500/20" 
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
            setOpen(true);
          }}
        >
          <Plus size={18} className="mr-2" />
          Add Faculty
        </button>
      </div>

      <div className="app-card p-4">
        <div className="relative w-full max-w-md border-[var(--border)]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            className="app-input pl-10 bg-[var(--surface)] hover:bg-[var(--surface-soft)] transition-colors w-full" 
            placeholder="Search faculty by name..." 
            value={search} 
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }} 
          />
        </div>
      </div>

      {isLoading ? (
        <div className="app-card p-12 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : rows.length ? (
        <div className="space-y-4">
          <DataTable
            rows={rows}
            columns={[
              { 
                key: "name", 
                title: "Name", 
                render: (r: Faculty) => (
                  <div className="font-medium text-[var(--text)]">{r.name}</div>
                ) 
              },
              { key: "phone", title: "Phone", render: (r: Faculty) => r.phone || "—" },
              { key: "subjects", title: "Subjects", render: (r: Faculty) => r.subjects.join(", ") || "—" },
              { 
                key: "today", 
                title: "Classes Today", 
                align: "center",
                render: (r: Faculty) => {
                  const val = statsMap.get(r.id)?.classes_today ?? 0;
                  return val > 0 ? <span className="app-badge bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold">{val}</span> : "—";
                }
              },
              { 
                key: "taken", 
                title: "Total Taken", 
                align: "center",
                render: (r: Faculty) => statsMap.get(r.id)?.total_taken ?? 0 
              },
              { 
                key: "missed", 
                title: "Total Missed", 
                align: "center",
                render: (r: Faculty) => {
                  const val = statsMap.get(r.id)?.total_missed ?? 0;
                  return val > 0 ? <span className="text-red-500 font-medium">{val}</span> : "0";
                }
              },
              {
                key: "actions",
                title: "",
                align: "right",
                render: (r: Faculty) => (
                  <div className="flex justify-end gap-2">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      onClick={() => {
                        setEditing(r);
                        setForm({ name: r.name, phone: r.phone || "", subjects: r.subjects.join(", ") });
                        setOpen(true);
                      }}
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" 
                      onClick={() => {
                        if (window.confirm("Delete this faculty member?")) {
                          remove.mutate(r.id);
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
          <Pagination 
            currentPage={page} 
            totalPages={Math.ceil((data?.count ?? 0) / 25)} 
            onPageChange={setPage} 
          />
        </div>
      ) : (
        <EmptyState 
          icon={<GraduationCap size={32} />}
          title="No faculty found" 
          description={search ? "Try adjusting your search criteria." : "You haven't added any faculty members yet."}
        />
      )}

      <ModalOrDrawer open={open} title={editing ? "Edit Faculty Details" : "Add New Faculty"} onClose={() => setOpen(false)}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Full Name <span className="text-red-500">*</span></label>
            <input 
              className="app-input" placeholder="e.g. Dr. John Smith" 
              value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Phone Number</label>
            <input 
              className="app-input" placeholder="+1 (555) 000-0000" 
              value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Subjects specialized in</label>
            <input 
              className="app-input" placeholder="e.g. Math, Physics, Chemistry (Comma separated)" 
              value={form.subjects} onChange={(e) => setForm((p) => ({ ...p, subjects: e.target.value }))} 
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border)] mt-6">
            <button className="app-button-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button 
              className="app-button-primary disabled:opacity-50" 
              onClick={() => save.mutate()}
              disabled={!form.name || save.isPending}
            >
              {save.isPending ? "Saving..." : "Save Faculty"}
            </button>
          </div>
        </div>
      </ModalOrDrawer>
    </div>
  );
}
