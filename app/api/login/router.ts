import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Kiểm tra tài khoản ảo, đúng mật khẩu nào cũng cho vào
    if (email === "admin@gmail.com" && password === "123456") {
      return NextResponse.json({
        token: "mock-jwt-token-admin",
        user: {
          name: "Admin Dev",
          email: "admin@gmail.com",
          role: "ADMIN",
        },
      });
    }

    if (email === "user@gmail.com" && password === "123456") {
      return NextResponse.json({
        token: "mock-jwt-token-user",
        user: {
          name: "User Dev",
          email: "user@gmail.com",
          role: "USER",
        },
      });
    }

    // Nếu gõ sai tài khoản ảo
    return NextResponse.json(
      { error: "Sai tài khoản hoặc mật khẩu test (Hãy dùng admin@gmail.com hoặc user@gmail.com)" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống mock" }, { status: 500 });
  }
}
