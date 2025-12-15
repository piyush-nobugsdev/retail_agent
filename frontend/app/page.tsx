export default async function Home() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/health`,
    { cache: "no-store" }
  );

  const data = await res.json();

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Retail AI Agent</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
