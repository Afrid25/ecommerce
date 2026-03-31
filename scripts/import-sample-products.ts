import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { ensureCommerceSchema } from "../src/lib/commerce";
import { db } from "../src/lib/db";
import { products } from "../src/lib/db/schema";
import { importedSampleProducts } from "../src/lib/sample-products";

async function main() {
  await ensureCommerceSchema();

  let inserted = 0;
  let updated = 0;

  for (const product of importedSampleProducts) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.name, product.name), eq(products.image, product.image)))
      .limit(1);

    if (existing) {
      await db
        .update(products)
        .set({
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? null,
          costPrice: product.costPrice,
          category: product.category,
          categorySlug: product.categorySlug,
          stock: product.stock,
          isFeatured: Boolean(product.isFeatured),
          isTrending: Boolean(product.isTrending),
          isHot: Boolean(product.isHot),
          isLimited: Boolean(product.isLimited),
        })
        .where(eq(products.id, existing.id));

      updated += 1;
      continue;
    }

    await db.insert(products).values({
      ...product,
      compareAtPrice: product.compareAtPrice ?? null,
    });

    inserted += 1;
  }

  console.log(`[SAMPLE_IMPORT] inserted=${inserted} updated=${updated}`);
}

main().catch((error) => {
  console.error("[SAMPLE_IMPORT_FAILED]", error);
  process.exit(1);
});
