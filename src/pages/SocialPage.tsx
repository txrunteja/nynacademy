import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSocialPost, getSocialPosts, updateSocialPost } from "../api/social";
import { EmptyState } from "../components/ui/EmptyState";
import { ModalOrDrawer } from "../components/ui/ModalOrDrawer";
import { Pagination } from "../components/ui/Pagination";
import type { SocialPost } from "../types/db";

const empty = { platform: "", content: "", scheduled_date: "", status: "draft" };

export function SocialPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SocialPost | null>(null);
  const [form, setForm] = useState(empty);
  const { data } = useQuery({ queryKey: ["social", page], queryFn: () => getSocialPosts(page) });

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        platform: form.platform,
        content: form.content,
        scheduled_date: form.scheduled_date || null,
        status: form.status as any,
      };
      if (editing) return updateSocialPost(editing.id, payload);
      return createSocialPost(payload as any);
    },
    onSuccess: () => {
      setOpen(false);
      setEditing(null);
      setForm(empty);
      queryClient.invalidateQueries({ queryKey: ["social"] });
    },
  });

  const markPosted = useMutation({
    mutationFn: (id: string) => updateSocialPost(id, { status: "posted" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social"] }),
  });

  const rows = data?.data ?? [];
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Social Posts</h1>
        <button className="app-button-primary" onClick={() => setOpen(true)}>
          Add Post
        </button>
      </div>
      {rows.length ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => (
              <div key={r.id} className="app-card p-4">
                <p className="text-sm text-[var(--text-muted)]">{r.platform}</p>
                <p className="mt-1 line-clamp-3">{r.content}</p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">Date: {r.scheduled_date ?? "-"}</p>
                <p className="mt-1 text-xs">Status: {r.status}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    className="app-button-secondary text-sm"
                    onClick={() => {
                      setEditing(r);
                      setForm({
                        platform: r.platform,
                        content: r.content,
                        scheduled_date: r.scheduled_date ?? "",
                        status: r.status,
                      });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button className="app-button-success text-sm" onClick={() => markPosted.mutate(r.id)}>
                    Mark Posted
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} pageSize={25} total={data?.count ?? 0} onChange={setPage} />
        </>
      ) : (
        <EmptyState title="No social posts found" />
      )}
      <ModalOrDrawer open={open} title={editing ? "Edit Social Post" : "Add Social Post"} onClose={() => setOpen(false)}>
        <div className="space-y-2">
          <input className="app-input" placeholder="Platform" value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))} />
          <textarea className="app-input" placeholder="Content" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} />
          <input className="app-input" type="date" value={form.scheduled_date} onChange={(e) => setForm((p) => ({ ...p, scheduled_date: e.target.value }))} />
          <select className="app-input" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="posted">Posted</option>
          </select>
          <button className="app-button-primary" onClick={() => save.mutate()}>
            Save
          </button>
        </div>
      </ModalOrDrawer>
    </div>
  );
}
