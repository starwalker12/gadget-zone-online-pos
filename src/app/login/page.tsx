import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-700 text-2xl font-black text-white">
            GZ
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-700">
            Gadget Zone
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Online POS Login
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Supabase authentication will be wired in the next implementation
            phase. This page is the production login foundation.
          </p>
        </div>
        <form className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              placeholder="admin@gadgetzone.example"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-blue-600"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              type="password"
              placeholder="Password"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-blue-600"
            />
          </label>
          <button
            type="button"
            className="h-12 w-full rounded-xl bg-blue-700 text-sm font-bold text-white transition hover:bg-blue-800"
          >
            Sign in
          </button>
        </form>
        <Link
          href="/dashboard"
          className="mt-5 block text-center text-sm font-semibold text-blue-700"
        >
          Preview dashboard shell
        </Link>
      </section>
    </main>
  );
}
