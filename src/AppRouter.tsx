import { Routes, Route } from 'react-router-dom';
import App from './App';
import BlogPage from './components/BlogPage';
import BlogPostPage from './components/BlogPostPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/signup" element={<App />} />
      <Route path="/login" element={<App />} />
      <Route path="/features" element={<App />} />
      <Route path="/integrations" element={<App />} />
      <Route path="/help" element={<App />} />
      <Route path="/privacy" element={<App />} />
      <Route path="/terms" element={<App />} />
      <Route path="/pricing" element={<App />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:id" element={<BlogPostPage />} />
    </Routes>
  );
} 