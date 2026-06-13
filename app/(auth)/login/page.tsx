// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { useAuth } from "@/lib/authContext"; // Import useAuth

// export default function LoginPage() {
//   const router = useRouter();
//   const { login } = useAuth(); // Lấy hàm login từ context
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleLogin(e: React.FormEvent) {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       // Gọi API Login thật từ Spring Boot
//       const res = await fetch("http://localhost:8080/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Login failed");
//       }

//       // Đăng nhập thành công, lưu token và thông tin user
//       login(data.token, { email: data.email, role: data.role, name: data.name });

//       // Điều hướng dựa trên Role
//       if (data.role === "ADMIN") {
//         router.push("/admin");
//       } else {
//         router.push("/user");
//       }
//     } catch (err: any) {
//       setError(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <>
//       <div style={{ textAlign: "center", marginBottom: 24 }}>
//         <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>Welcome Back</h1>
//         <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Login to SkyTrack AI</p>
//       </div>

//       {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

//       <form onSubmit={handleLogin}>
//         <div style={{ marginBottom: 14 }}>
//           <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Email</label>
//           <input 
//             value={email} onChange={e => setEmail(e.target.value)}
//             type="email" required placeholder="admin@skytrack.vn"
//             style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none" }}
//           />
//         </div>
//         <div style={{ marginBottom: 20 }}>
//           <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Password</label>
//           <input 
//             value={password} onChange={e => setPassword(e.target.value)}
//             type="password" required placeholder="123456"
//             style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none" }}
//           />
//         </div>
//         <button type="submit" disabled={loading} style={{
//           width: "100%", padding: "12px", background: loading ? "#93c5fd" : "#3b82f6", color: "#fff",
//           border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer"
//         }}>
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>

//       <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#6b7280" }}>
//         Don't have an account? <Link href="/register" style={{ color: "#3b82f6", fontWeight: 600 }}>Register</Link>
//       </p>
//     </>
//   );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext"; 
import api from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ── KIỂM TRA MÔI TRƯỜNG DEV KHÔNG CÓ BACKEND ──
    // Nếu biến môi trường NEXT_PUBLIC_NO_BACKEND được bật, hệ thống chạy offline hoàn toàn
    if (process.env.NEXT_PUBLIC_NO_BACKEND === "true") {
      setTimeout(() => { // Tạo độ trễ giả lập mạng cho mượt mà UI
        if (email === "admin@gmail.com" && password === "123456") {
          login("mock-token-admin", { email: "admin@gmail.com", role: "ADMIN", name: "Admin Dev" });
          router.push("/admin");
          setLoading(false);
        } else if (email === "user@gmail.com" && password === "123456") {
          login("mock-token-user", { email: "user@gmail.com", role: "USER", name: "User Dev" });
          router.push("/user");
          setLoading(false);
        } else {
          setError("Sai tài khoản hoặc mật khẩu test (Dùng admin@gmail.com hoặc user@gmail.com / mk: 123456)");
          setLoading(false);
        }
      }, 800);
      return; // Dừng lại ở đây, không chạy xuống fetch Spring Boot nữa
    }

    // ── LUỒNG CHẠY THẬT VỚI SPRING BOOT (CỦA BẠN) ──
    try {
      const { data } = await api.post("/api/auth/login", { email, password });

      login(data.token, { email: data.email, role: data.role, name: data.name });

      if (data.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>Welcome Back</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Login to SkyTrack AI</p>
      </div>

      {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 14 }}>
<label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Email</label>
          <input 
            value={email} onChange={e => setEmail(e.target.value)}
            type="email" required placeholder="admin@skytrack.vn"
            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none" }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Password</label>
          <input 
            value={password} onChange={e => setPassword(e.target.value)}
            type="password" required placeholder="123456"
            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none" }}
          />
        </div>
        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "12px", background: loading ? "#93c5fd" : "#3b82f6", color: "#fff",
          border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer"
        }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#6b7280" }}>
        Don&apos;t have an account? <Link href="/register" style={{ color: "#3b82f6", fontWeight: 600 }}>Register</Link>
      </p>
    </>
  );
}
