import Header from '../components/Header'
import Footer from '../components/Footer'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-screen flex-col bg-[#eef2f6] overflow-hidden font-sans">
      <Header />
      {children}
      <Footer />
    </div>
  )
}