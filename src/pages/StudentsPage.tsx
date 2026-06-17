import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Search, Filter, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { createStudent, deleteStudent, getStudents, updateStudent } from "../api/students";
import { getFaculty } from "../api/faculty";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { ModalOrDrawer } from "../components/ui/ModalOrDrawer";
import { Pagination } from "../components/ui/Pagination";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { Student } from "../types/db";

const initialForm = { name: "", phone: "", mode: "offline", assigned_faculty_id: "", subjects: "" };

/* ── Subject colour palette ─────────────────────────────────── */
const SUBJECT_COLORS = [
  { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.35)", text: "#3b82f6" },
  { bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.35)", text: "#a855f7" },
  { bg: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.35)", text: "#ec4899" },
  { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.35)", text: "#f59e0b" },
  { bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.35)", text: "#10b981" },
  { bg: "rgba(6,182,212,0.15)",   border: "rgba(6,182,212,0.35)",  text: "#06b6d4" },
  { bg: "rgba(244,63,94,0.15)",   border: "rgba(244,63,94,0.35)",  text: "#f43f5e" },
  { bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.35)", text: "#6366f1" },
];

function subjectColor(subject: string) {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

function SubjectTags({ subjects }: { subjects: string[] }) {
  if (!subjects.length) return <span className="text-[var(--text-muted)]">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {subjects.map((s) => {
        const c = subjectColor(s);
        return (
          <span
            key={s}
            className="subject-tag"
            style={{ background: c.bg, borderColor: c.border, color: c.text }}
          >
            {s}
          </span>
        );
      })}
    </div>
  );
}

function getWhatsAppUrl(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const finalNumber = cleaned.length === 10 ? `91${cleaned}` : cleaned;
  return `https://wa.me/${finalNumber}`;
}

/* ── Phone cell with eye toggle & WhatsApp ──────────────────── */
function PhoneCell({ phone }: { phone: string | null }) {
  const [visible, setVisible] = useState(false);
  if (!phone) return <span className="text-[var(--text-muted)]">—</span>;

  const masked = phone.replace(/\d(?=\d{2})/g, "•");
  const waUrl = getWhatsAppUrl(phone);

  return (
    <span className="phone-mask">
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{visible ? phone : masked}</span>
      <button
        type="button"
        className="phone-mask-btn"
        onClick={() => setVisible((v) => !v)}
        title={visible ? "Hide phone" : "Show phone"}
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-6 h-6 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md transition-colors"
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.59-4.846c1.6.95 3.488 1.451 5.42 1.452 5.568 0 10.1-4.524 10.104-10.096C22.174 7.947 21.14 5.4 19.22 3.48c-1.92-1.92-4.467-2.973-7.213-2.974-5.57 0-10.103 4.526-10.107 10.1-.001 1.93.501 3.81 1.455 5.41l-.951 3.473 3.562-.935zm11.393-5.084c-.305-.153-1.805-.89-2.083-.99-.278-.102-.48-.153-.68.152-.2.304-.775.99-.95 1.193-.175.203-.35.228-.655.076-.305-.153-1.287-.475-2.45-1.514-.906-.809-1.517-1.809-1.695-2.114-.177-.305-.019-.47.133-.621.137-.136.305-.355.457-.533.153-.177.203-.304.305-.508.102-.203.05-.381-.025-.533-.076-.153-.68-1.638-.93-2.247-.244-.587-.492-.507-.68-.517-.174-.009-.374-.01-.572-.01-.2 0-.525.075-.8.374-.275.301-1.05 1.027-1.05 2.505s1.075 2.903 1.225 3.104c.15.203 2.115 3.23 5.123 4.527.715.309 1.274.494 1.71.633.718.228 1.37.196 1.885.12.574-.086 1.805-.738 2.057-1.453.253-.716.253-1.33.177-1.453-.075-.123-.277-.2-.582-.353z"/>
        </svg>
      </a>
    </span>
  );
}

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
      { key: "phone", title: "Phone", render: (r: Student) => <PhoneCell phone={r.phone} /> },
      { 
        key: "mode", 
        title: "Mode", 
        render: (r: Student) => (
          <span className={`app-badge ${r.mode === 'online' ? 'app-badge-success' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
            {r.mode}
          </span>
        ) 
      },
      { key: "subjects", title: "Subjects", render: (r: Student) => <SubjectTags subjects={r.subjects} /> },
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
