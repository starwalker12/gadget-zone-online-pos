import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentContext } from "@/lib/auth/session";
import { listCustomers } from "@/lib/data/customers";
import { env } from "@/lib/env";

export default async function CustomersPage() {
  if (!env.isSupabaseConfigured) redirect("/login");
  const { user, profile } = await getCurrentContext();
  if (!user) redirect("/login");
  if (!profile?.organization_id) redirect("/setup");

  const customers = await listCustomers(profile.organization_id);

  return (
    <AppShell pageTitle="Customers">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-black text-slate-950">All customers</h2>
            <p className="text-xs text-slate-500">Walk-in customers can be added during checkout.</p>
          </div>
          <Link href="/pos" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800">
            New sale
          </Link>
        </div>
        {customers.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-slate-600">No customers yet.</p>
            <p className="mt-1 text-xs text-slate-500">
              Add one from the <Link href="/pos" className="text-blue-700 underline">POS</Link> using the &quot;+ New&quot; button next to the customer dropdown.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-bold text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-slate-700">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{c.address ?? "—"}</td>
                    <td className="px-4 py-3">
                      {c.is_archived ? (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">Archived</span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
