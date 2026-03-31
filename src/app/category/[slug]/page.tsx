import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategoryBySlugWithProducts } from "@/lib/catalog";

type CategoryPageProps = {
  params: { slug: string };
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const slug = params?.slug;

  if (!slug) {
    return (
      <div className="container-nike py-32 text-center">
        <h1 className="text-4xl font-semibold">Invalid category</h1>
        <Link href="/shop" className="mt-4 inline-block text-[var(--primary)]">
          Return to shop
        </Link>
      </div>
    );
  }

  const data = await getCategoryBySlugWithProducts(slug);

  if (!data || !data.category) {
    return (
      <div className="container-nike py-32 text-center">
        <h1 className="text-4xl font-semibold">Category not found</h1>
        <Link href="/shop" className="mt-4 inline-block text-[var(--primary)]">
          Return to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20 pt-28">
      <div className="container-nike">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#17311a] px-8 py-12 text-white md:px-12 md:py-16">
          <div className="absolute inset-0 h-full w-full">
            <Image
              src={data.category.image || "/images/matverse/interior_scene_collage.jpg"}
              alt={data.category.name}
              fill
              priority
              className="object-cover opacity-25"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-transparent" />

          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
              Category
            </p>

            <h1 className="mt-4 text-4xl font-semibold md:text-6xl">
              {data.category.name}
            </h1>

            <p className="mt-5 text-base leading-8 text-white/80">
              {data.category.description || "Explore products in this category"}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={`/shop?category=${data.category.slug}`}
                className="rounded-full bg-[#FF6A00] px-5 py-3 text-sm font-semibold text-white"
              >
                Filter in Shop
              </Link>

              <Link
                href="/shop"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
              >
                View all products
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Products in this category
            </h2>
            <span className="text-sm text-[var(--text-secondary)]">
              {data.products?.length || 0} items
            </span>
          </div>

          {!data.products || data.products.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-[var(--border)] px-6 py-16 text-center text-[var(--text-secondary)]">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
