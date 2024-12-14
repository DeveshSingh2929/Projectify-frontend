import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from 'jose';

async function validate(token) {
  if (!token || token === undefined) { return null; }
  try {

      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secretKey);
      return payload;
  } catch (err) {
      console.error('Token verification failed: ', err);
      return;
  }
}

export default async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow static files and Next.js internals to bypass the middleware
  if (
    pathname.startsWith("/_next/") || // Next.js static files
    pathname.startsWith("/static/") || // Custom static files
    pathname.endsWith(".css") || // CSS files
    pathname.endsWith(".js") || // JavaScript files
    pathname.endsWith(".png") || // Images
    pathname.endsWith(".jpg") || // Images
    pathname.endsWith(".svg") || // SVGs
    pathname.endsWith(".ico") // Favicon
  ) {
    return NextResponse.next();
  }
  const userCookie = cookies().get("user")?.value;
  const validateCookie= await validate(userCookie);
  
  if(pathname==="/register" && !validateCookie){
    return NextResponse.next();
  }
  if (pathname !== "/login" && !validateCookie) {
    console.log("redirected from here");
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  else if (pathname === "/login" && validateCookie){
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}
