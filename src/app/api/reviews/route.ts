import { db } from "@/lib/db";
import { reviews, products } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc, avg, count } from "drizzle-orm";

// GET reviews for a product
export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get("productId");
    
    if (productId) {
      // Get reviews for a specific product
      const productReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, parseInt(productId)))
        .orderBy(desc(reviews.createdAt));
      
      // Get average rating for the product
      const ratingStats = await db
        .select({
          avgRating: avg(reviews.rating),
          totalReviews: count(reviews.id),
        })
        .from(reviews)
        .where(eq(reviews.productId, parseInt(productId)));
      
      return NextResponse.json({
        reviews: productReviews,
        averageRating: ratingStats[0]?.avgRating || 0,
        totalReviews: ratingStats[0]?.totalReviews || 0,
      });
    }
    
    // Get all reviews
    const allReviews = await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.createdAt));
    
    return NextResponse.json(allReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, userName, rating, comment } = body;

    // Validate required fields
    if (!productId || !userName || !rating) {
      return NextResponse.json(
        { error: "Product ID, user name, and rating are required" },
        { status: 400 }
      );
    }

    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (product.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Create the review
    const newReview = await db
      .insert(reviews)
      .values({
        productId,
        userId: userId || null,
        userName,
        rating,
        comment: comment || null,
      })
      .returning();

    return NextResponse.json(newReview[0], { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

// PUT - Update a review
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, rating, comment } = body;

    if (!id || !rating) {
      return NextResponse.json(
        { error: "Review ID and rating are required" },
        { status: 400 }
      );
    }

    // Update the review
    const updatedReview = await db
      .update(reviews)
      .set({
        rating,
        comment,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, id))
      .returning();

    if (updatedReview.length === 0) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedReview[0]);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    // Delete the review
    const deletedReview = await db
      .delete(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .returning();

    if (deletedReview.length === 0) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
