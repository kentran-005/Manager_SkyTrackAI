import Header from '../components/Header'
import Footer from '../components/Footer'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex min-h-screen w-screen flex-col bg-[#eef2f6] overflow-hidden font-sans">
      <Header />
      {children}
      <Footer />
    </div>
  )
}