import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLead, getLeads, updateLead } from "../api/leads";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { ModalOrDrawer } from "../components/ui/ModalOrDrawer";
import { Pagination } from "../components/ui/Pagination";
import type { Lead } from "../types/db";

const empty = { name: "", phone: "", source: "other", status: "new", notes: "", follow_up_date: "" };

export function LeadsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [source, setSource] = useState<"all" | "justdial" | "sulekha" | "other">("all");
  const [status, setStatus] = useState<"all" | "new" | "contacted" | "converted" | "dropped">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState(empty);
  const { data } = useQuery({ queryKey: ["leads", page, source, status], queryFn: () => getLeads(page, 25, source, status) });

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        phone: form.phone,
        source: form.source as any,
        status: form.status as any,
        notes: form.notes || null,
        follow_up_date: form.follow_up_date || null,
      };
      if (editing) return updateLead(editing.id, payload);
      return createLead(payload as any);
    },
    onSuccess: () => {
      setOpen(false);
      setEditing(null);
      setForm(empty);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const rows = data?.data ?? [];
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads</h1>
        <button className="app-button-primary" onClick={() => setOpen(true)}>
          Add Lead
        </button>
      </div>
      <div className="mb-3 flex gap-2">
        <select className="app-input w-auto" value={source} onChange={(e) => setSource(e.target.value as any)}>
          <option value="all">All source</option>
          <option value="justdial">Justdial</option>
          <option value="sulekha">Sulekha</option>
          <option value="other">Other</option>
        </select>
        <select className="app-input w-auto" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="all">All status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>
      {rows.length ? (
        <>
          <DataTable
            rows={rows}
            columns={[
              { key: "name", title: "Name", render: (r: Lead) => r.name },
              { key: "phone", title: "Phone", render: (r: Lead) => r.phone },
              { key: "source", title: "Source", render: (r: Lead) => r.source },
              { key: "status", title: "Status", render: (r: Lead) => r.status },
              { key: "follow", title: "Follow Up", render: (r: Lead) => r.follow_up_date ?? "-" },
              {
                key: "actions",
                title: "Actions",
                render: (r: Lead) => (
                  <button
                    className="app-button-secondary"
                    onClick={() => {
                      setEditing(r);
                      setForm({
                        name: r.name,
                        phone: r.phone,
                        source: r.source,
                        status: r.status,
                        notes: r.notes ?? "",
                        follow_up_date: r.follow_up_date ?? "",
                      });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </button>
                ),
              },
            ]}
          />
          <Pagination page={page} pageSize={25} total={data?.count ?? 0} onChange={setPage} />
        </>
      ) : (
        <EmptyState title="No leads found" />
      )}
      <ModalOrDrawer open={open} title={editing ? "Edit Lead" : "Add Lead"} onClose={() => setOpen(false)}>
        <div className="space-y-2">
          <input className="app-input" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="app-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          <select className="app-input" value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}>
            <option value="other">Other</option>
            <option value="justdial">Justdial</option>
            <option value="sulekha">Sulekha</option>
          </select>
          <select className="app-input" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="dropped">Dropped</option>
          </select>
          <textarea className="app-input" placeholder="Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          <input className="app-input" type="date" value={form.follow_up_date} onChange={(e) => setForm((p) => ({ ...p, follow_up_date: e.target.value }))} />
          <button className="app-button-primary" onClick={() => save.mutate()}>
            Save
          </button>
        </div>
      </ModalOrDrawer>
    </div>
  );
}
