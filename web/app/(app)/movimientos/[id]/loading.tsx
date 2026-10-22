import BackLink from "@/components/BackLink";

// Skeleton con la forma del detalle mientras llega el movimiento.
export default function Loading() {
  return (
    <main className="px-5 pt-7" aria-busy="true">
      <BackLink />
      <div className="mt-6 flex animate-pulse flex-col items-center rounded-2xl bg-white px-6 py-8 shadow-card">
        <span className="size-16 rounded-2xl bg-gray-100" />
        <span className="mt-4 h-6 w-40 rounded bg-gray-100" />
        <span className="mt-2 h-4 w-28 rounded bg-gray-100" />
        <span className="mt-4 h-8 w-24 rounded bg-gray-100" />
      </div>
      <div className="mt-4 h-40 animate-pulse rounded-2xl bg-white shadow-card" />
    </main>
  );
}
