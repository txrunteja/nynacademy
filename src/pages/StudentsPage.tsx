import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { createStudent, deleteStudent, getStudents, updateStudent } from "../api/students";
import { getFaculty } from "../api/faculty";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { ModalOrDrawer } from "../components/ui/ModalOrDrawer";
import { Pagination } from "../components/ui/Pagination";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { Student } from "../types/db";

const initialForm = { name: "", phone: "", mode: "offline", assigned_faculty_id: "", subjects: "" };

export function StudentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<"all" | "online" | "offline">("all");
  const [facultyId, setFacultyId] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState(initialForm);
  const debounced = useDebouncedValue(search);

  const { data, isLoading } = useQuery({
    queryKey: ["students", page, debounced, mode, facultyId],
    queryFn: () => getStudents({ page, search: debounced, mode, facultyId }),
  });
  
  const { data: facultyData } = useQuery({ queryKey: ["faculty", "simple"], queryFn: () => getFaculty(1, 100) });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        phone: form.phone,
        mode: form.mode as "online" | "offline",
        assigned_faculty_id: form.assigned_faculty_id || null,
        subjects: form.subjects.split(",").map((x) => x.trim()).filter(Boolean),
      };
      if (editing) return updateStudent(editing.id, payload);
      return createStudent(payload);
    },
    onSuccess: () => {
      setOpen(false);
      setEditing(null);
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
  });

  const rows = data?.data ?? [];
  const columns = useMemo(
    () => [
      { 
        key: "name", 
        title: "Name", 
        render: (r: Student) => (
          <div className="font-medium text-[var(--text)]">{r.name}</div>
        ) 
      },
      { key: "phone", title: "Phone", render: (r: Student) => r.phone || "—" },
      { 
        key: "mode", 
        title: "Mode", 
        render: (r: Student) => (
          <span className={`app-badge ${r.mode === 'online' ? 'app-badge-success' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
            {r.mode}
          </span>
        ) 
      },
      { key: "subjects", title: "Subjects", render: (r: Student) => r.subjects.join(", ") || "—" },
      {
        key: "actions",
        title: "",
        align: "right" as const,
        render: (r: Student) => (
          <div className="flex justify-end gap-2">
            <button
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              onClick={() => {
                setEditing(r);
                setForm({
                  name: r.name,
                  phone: r.phone || "",
                  mode: r.mode,
                  assigned_faculty_id: r.assigned_faculty_id ?? "",
                  subjects: r.subjects.join(", "),
                });
                setOpen(true);
              }}
              title="Edit"
            >
              <Edit size={18} />
            </button>
            <button 
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" 
              onClick={() => {
                if (window.confirm("Delete this student?")) {
                  deleteMutation.mutate(r.id);
                }
              }}
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [deleteMutation]
  );

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Students</h1>
          <p className="mt-2 text-[var(--text-muted)] text-lg">Manage enrolments, contact info, and subjects.</p>
        </div>
        <button 
          className="app-button-primary shadow-lg shadow-blue-500/20" 
          onClick={() => {
            setEditing(null);
            setForm(initialForm);
            setOpen(true);
          }}
        >
          <Plus size={18} className="mr-2" />
          Add Student
        </button>
      </div>

      <div className="app-card p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            className="app-input pl-10 bg-[var(--surface)] hover:bg-[var(--surface-soft)] transition-colors w-full"
            placeholder="Search students by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <select 
              className="app-input pl-9 bg-[var(--surface)] font-medium cursor-pointer" 
              value={mode} 
              onChange={(e) => {
                setMode(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="all">All Modes</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div className="relative flex-1 sm:flex-initial">
            <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <select 
              className="app-input pl-9 bg-[var(--surface)] font-medium cursor-pointer" 
              value={facultyId} 
              onChange={(e) => {
                setFacultyId(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Faculty</option>
              {(facultyData?.data ?? []).map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="app-card p-12 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : rows.length ? (
        <div className="space-y-4">
          <DataTable columns={columns} rows={rows} />
          <Pagination 
            currentPage={page} 
            totalPages={Math.ceil((data?.count || 0) / 25)} 
            onPageChange={setPage} 
          />
        </div>
      ) : (
        <EmptyState 
          icon={<Users size={32} />}
          title="No students found" 
          description={search || mode !== 'all' || facultyId !== 'all' ? "Try adjusting your filters to see more results." : "You haven't added any students yet."} 
        />
      )}

      <ModalOrDrawer open={open} title={editing ? "Edit Student Details" : "Add New Student"} onClose={() => setOpen(false)}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Full Name <span className="text-red-500">*</span></label>
            <input 
              className="app-input" placeholder="e.g. Jane Doe" 
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Learning Mode</label>
              <select 
                className="app-input" value={form.mode} onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))}
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Primary Faculty</label>
              <select 
                className="app-input" value={form.assigned_faculty_id} onChange={(e) => setForm((p) => ({ ...p, assigned_faculty_id: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {(facultyData?.data ?? []).map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Subjects</label>
            <input 
              className="app-input" placeholder="e.g. Math, Physics, Chemistry (Comma separated)" 
              value={form.subjects} onChange={(e) => setForm((p) => ({ ...p, subjects: e.target.value }))} 
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border)] mt-6">
            <button className="app-button-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button 
              className="app-button-primary disabled:opacity-50" 
              onClick={() => saveMutation.mutate()}
              disabled={!form.name || saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving..." : "Save Student"}
            </button>
          </div>
        </div>
      </ModalOrDrawer>
    </div>
  );
}
