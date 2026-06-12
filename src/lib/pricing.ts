type DiscountType = "percentage" | "fixed";

type OfferLike = {
  id: number;
  title: string;
  discount: number;
  discountType?: string | null;
  productIds?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  isActive?: boolean | null;
  image?: string | null;
  priority?: number | null;
};

type ProductLike = {
  id: number | string;
  price: number;
  compareAtPrice?: number | null;
};

export type AppliedOffer = {
  id: number;
  title: string;
  discount: number;
  discountType: DiscountType;
  image: string | null;
  priority: number;
};

function normalizeDiscountType(value?: string | null): DiscountType {
  return value === "fixed" ? "fixed" : "percentage";
}

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}

function getComparableDate(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isOfferActive(offer: OfferLike, now = new Date()) {
  if (!offer.isActive) {
    return false;
  }

  const startDate = getComparableDate(offer.startDate);
  const endDate = getComparableDate(offer.endDate);

  if (startDate && startDate > now) {
    return false;
  }

  if (endDate && endDate < now) {
    return false;
  }

  return true;
}

export function offerTargetsProduct(offer: OfferLike, productId: number) {
  const ids = String(offer.productIds ?? "")
    .split(",")
    .map((entry) => Number.parseInt(entry.trim(), 10))
    .filter((entry) => Number.isInteger(entry) && entry > 0);

  return ids.includes(productId);
}

export function getDiscountedPrice(
  price: number,
  discount: number,
  discountType: string | null | undefined,
) {
  if (!Number.isFinite(price) || price <= 0) {
    return 0;
  }

  if (!Number.isFinite(discount) || discount <= 0) {
    return roundPrice(price);
  }

  if (normalizeDiscountType(discountType) === "fixed") {
    return roundPrice(Math.max(0, price - discount));
  }

  return roundPrice(Math.max(0, price - (price * discount) / 100));
}

export function applyOfferPricingToProduct<T extends ProductLike>(
  product: T,
  availableOffers: OfferLike[],
  now = new Date(),
): T & { activeOffer: AppliedOffer | null } {
  const productId = Number(product.id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return { ...product, activeOffer: null };
  }

  const basePrice = Number(product.price);
  const referencePrice =
    typeof product.compareAtPrice === "number" && product.compareAtPrice > basePrice
      ? product.compareAtPrice
      : basePrice;

  let bestPrice = roundPrice(basePrice);
  let bestOffer: AppliedOffer | null = null;

  for (const offer of availableOffers) {
    if (!isOfferActive(offer, now) || !offerTargetsProduct(offer, productId)) {
      continue;
    }

    const nextPrice = getDiscountedPrice(basePrice, Number(offer.discount ?? 0), offer.discountType);
    if (nextPrice >= bestPrice) {
      continue;
    }

    bestPrice = nextPrice;
    bestOffer = {
      id: offer.id,
      title: offer.title,
      discount: Number(offer.discount ?? 0),
      discountType: normalizeDiscountType(offer.discountType),
      image: offer.image ?? null,
      priority: Number(offer.priority ?? 0),
    };
  }

  if (!bestOffer) {
    return { ...product, activeOffer: null };
  }

  const nextCompareAtPrice = referencePrice > bestPrice ? Math.max(referencePrice, basePrice) : null;

  return {
    ...product,
    price: bestPrice,
    compareAtPrice: nextCompareAtPrice,
    activeOffer: bestOffer,
  };
}
