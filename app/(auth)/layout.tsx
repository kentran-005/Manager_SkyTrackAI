export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Khối card trắng chứa form login/register */}
      <div style={{
        width: "100%",
        maxWidth: 440,
        padding: 32,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,.08)"
      }}>
        {children}
      </div>
    </div>
  );
}