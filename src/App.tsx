import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Home from './pages/Home'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import BlogIndex from './pages/blog/BlogIndex'
import BlogPost from './pages/blog/BlogPost'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#13131a',
            border: '1px solid #1e293b',
            color: '#e2e8f0',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
      </Routes>
    </BrowserRouter>
  )
}
