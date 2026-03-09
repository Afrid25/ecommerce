import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

const ADMIN_SECRET_CODE = "1096";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, secretCode } = body;

    if (!name || !email || !password || !secretCode) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if secret code is correct
    if (secretCode !== ADMIN_SECRET_CODE) {
      return NextResponse.json(
        { error: "Invalid secret code" },
        { status: 401 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user using better-auth's internal signUpEmail
    // This handles password hashing and user creation
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email,
          name,
          password,
        },
      });

      // Check if the result has a user (successful signup) or not
      if (!result.user) {
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 400 }
        );
      }

      // Update the user's role to admin
      await db
        .update(user)
        .set({ role: "admin" })
        .where(eq(user.email, email));

      return NextResponse.json(
        { message: "Admin account created successfully" },
        { status: 201 }
      );
    } catch (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Admin signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
