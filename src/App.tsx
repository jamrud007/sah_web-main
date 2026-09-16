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
const LoginPage         = lazy(() => import('./pages/auth/LoginPage'));

const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      color: '#c58a63',
      fontSize: 14,
      fontWeight: 600,
      background: '#0d1b2a',
    }}
  >
    Memuat halaman…
  </div>
);

/** Bypass login untuk pengujian API langsung (Login dimasukkan ke future update) */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Halaman Login — tanpa layout */}
              <Route path="/login" element={<LoginPage />} />

              {/* Semua halaman dalam SahLayout — dilindungi */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
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
                          <Route path="/produk/form" element={<ProductFormPage key="new-sku" />} />
                          <Route path="/produk/form/:id" element={<ProductFormPage key="edit-sku" />} />
                          <Route path="/products/new" element={<ProductFormPage key="new-sku-alt" />} />
                          <Route path="/products/:id/edit" element={<ProductFormPage key="edit-sku-alt" />} />

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
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  );
}

export default App;
