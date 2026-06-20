import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PaymentPage from './pages/PaymentPage'
import QRPage from './pages/QRPage'
import StatusPage from './pages/StatusPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pay/:orderId" element={<PaymentPage />} />
        <Route path="/qr/:orderId" element={<QRPage />} />
        <Route path="/status/:orderId" element={<StatusPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Layout>
  )
}
