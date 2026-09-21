import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import VisitTracker from './components/VisitTracker'
import Header from './components/Header'
import Footer from './components/Footer'
import { AppProvider } from './context/AppContext'
import { JobsProvider } from './context/JobsContext'
import Home from './pages/Home'
import JobDetail from './pages/JobDetail'
import Companies from './pages/Companies'
import CompanyDetail from './pages/CompanyDetail'
import Talent from './pages/Talent'
import Hire from './pages/Hire'
import HirePay from './pages/HirePay'
import Blog, { BlogPost } from './pages/Blog'
import About from './pages/About'
import Login from './pages/Login'
import Salaries from './pages/Salaries'
import Research from './pages/Research'
import Layoffs from './pages/Layoffs'
import Events from './pages/Events'
import Applications from './pages/Applications'
import AdminJobs from './pages/AdminJobs'
import AdminJobEdit from './pages/AdminJobEdit'
import { useApp } from './context/AppContext'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function RequireAdmin({ children }) {
  const { user } = useApp()
  const location = useLocation()
  if (user?.role !== 'admin') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

function Layout({ children }) {
  const { pathname } = useLocation()
  const homeMobile = pathname === '/'

  return (
    <div className={`flex min-w-0 flex-col bg-page text-ink dark:bg-night dark:text-gray-100 ${homeMobile ? 'max-lg:h-dvh max-lg:overflow-hidden lg:min-h-dvh' : 'min-h-dvh'}`}>
      <ScrollToTop />
      <VisitTracker />
      <Header />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
      {homeMobile ? <div className="hidden lg:block"><Footer /></div> : <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <JobsProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs/:slug" element={<JobDetail />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:slug" element={<CompanyDetail />} />
            <Route path="/talent" element={<Talent />} />
            <Route path="/hire" element={<Hire />} />
            <Route path="/hire/pay" element={<HirePay />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/salaries" element={<Salaries />} />
            <Route path="/research" element={<Research />} />
            <Route path="/layoffs" element={<Layoffs />} />
            <Route path="/crypto-layoffs" element={<Layoffs />} />
            <Route path="/events" element={<Events />} />
            <Route path="/crypto-events" element={<Events />} />
            <Route
              path="/applications"
              element={
                <RequireAdmin>
                  <Applications />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/jobs"
              element={
                <RequireAdmin>
                  <AdminJobs />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/jobs/:id"
              element={
                <RequireAdmin>
                  <AdminJobEdit />
                </RequireAdmin>
              }
            />
            <Route path="/remote" element={<Navigate to="/?remote=1" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      </JobsProvider>
    </AppProvider>
  )
}
