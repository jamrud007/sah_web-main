// src/App.tsx
import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ToastProvider } from './context/ToastContext';
import SahLayout from './components/layout/SahLayout';

// Lazy-loaded pages
const DashboardPage     = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProductListPage   = lazy(() => import('./pages/products/ProductListPage'));
const ProductFormPage   = lazy(() => import('./pages/products/ProductFormPage'));
const ProductDetailPage = lazy(() => import('./pages/products/ProductDetailPage'));
const ProductPhotosPage = lazy(() => import('./pages/products/ProductPhotosPage'));

const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      color: 'var(--sah-copper)',
      fontSize: 14,
      fontWeight: 600,
    }}
  >
    Memuat halaman…
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <BrowserRouter>
          <SahLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Default redirect to Katalog Produk */}
                <Route path="/" element={<Navigate to="/produk" replace />} />

                {/* Beranda Admin (SCR-WEB-02) */}
                <Route path="/beranda" element={<DashboardPage />} />

                {/* Katalog Produk (SCR-WEB-03) */}
                <Route path="/produk" element={<ProductListPage />} />
                <Route path="/products" element={<ProductListPage />} />

                {/* Form SKU (SCR-WEB-04) */}
                <Route path="/produk/form" element={<ProductFormPage />} />
                <Route path="/produk/form/:id" element={<ProductFormPage />} />
                <Route path="/products/new" element={<ProductFormPage />} />
                <Route path="/products/:id/edit" element={<ProductFormPage />} />

                {/* Detail Produk (SCR-WEB-06) */}
                <Route path="/produk/detail" element={<ProductDetailPage />} />
                <Route path="/produk/detail/:id" element={<ProductDetailPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />

                {/* Foto Referensi & Editor (SCR-WEB-05) */}
                <Route path="/produk/foto" element={<ProductPhotosPage />} />
                <Route path="/produk/foto/:id" element={<ProductPhotosPage />} />
                <Route path="/products/:id/photos" element={<ProductPhotosPage />} />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/produk" replace />} />
              </Routes>
            </Suspense>
          </SahLayout>
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  );
}

export default App;
