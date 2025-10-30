export default function Product({ params }: { params: { slug: string } }) {
  return (
    <main className="max-w-3xl mx-auto py-4 px-4">
      <h1 className="text-3xl font-bold">Product: {params.slug}</h1>
    </main>
  );
}
