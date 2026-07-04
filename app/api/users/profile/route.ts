import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/app/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate(request);
    const profile = user.toProfile ? user.toProfile() : {
      id: user._id,
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0],
      photoURL: user.photoURL,
      bio: user.bio,
      website: user.website || null,
      location: user.location || null,
      company: user.company || null,
      role: user.role,
    };
    return NextResponse.json({ user: profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Not authenticated" }, { status: err.status || 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user } = await authenticate(request);
    const { displayName, bio, photoURL, website, location, company } = await request.json();

    if (displayName !== undefined) user.displayName = String(displayName).trim().slice(0, 80);
    if (bio !== undefined) user.bio = String(bio).trim().slice(0, 500);
    if (photoURL !== undefined) user.photoURL = photoURL;
    if (website !== undefined) user.website = String(website).trim().slice(0, 200);
    if (location !== undefined) user.location = String(location).trim().slice(0, 100);
    if (company !== undefined) user.company = String(company).trim().slice(0, 100);

    await user.save();
    const profile = user.toProfile ? user.toProfile() : {
      id: user._id,
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0],
      photoURL: user.photoURL,
      bio: user.bio,
      website: user.website || null,
      location: user.location || null,
      company: user.company || null,
      role: user.role,
    };
    return NextResponse.json({ user: profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: err.status || 500 });
  }
}
