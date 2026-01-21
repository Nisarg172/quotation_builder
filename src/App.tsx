import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/Home";
import CategoryManager from "./pages/CategoryManager";
import ProductManager from "./pages/ProductManager";
import AccessoryManager from "./pages/AccessoryManager";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import BillQuatation from "./pages/BillQuatation";
import Customer from "./pages/Customer";

function AppContent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation - Only show if authenticated */}
      {user && (
        <nav className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-3 lg:px-3">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-slate-800">HM Technology</h1>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <Link
                  to="/"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-slate-100"
                >
                  Home
                </Link>

                <Link
                  to="/customer"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-slate-100"
                >
                  Customer
                </Link>
                <Link
                  to="/product"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-slate-100"
                >
                  Products
                </Link>
                <Link
                  to="/accessories"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-slate-100"
                >
                  Accessories
                </Link>
                <Link
                  to="/category"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-slate-100"
                >
                  Categories
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-slate-600 text-sm">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/pdf/:id" element={<BillQuatation />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/product" element={
            <ProtectedRoute>
              <ProductManager />
            </ProtectedRoute>
          } />
          <Route path="/accessories" element={
            <ProtectedRoute>
              <AccessoryManager />
            </ProtectedRoute>
          } />
          <Route path="/category" element={
            <ProtectedRoute>
              <CategoryManager />
            </ProtectedRoute>
          } />

           <Route path="/customer" element={
            <ProtectedRoute>
              <Customer />
            </ProtectedRoute>
          } />

          
          
        </Routes>
      </main>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={true}
        duration={4000}
      />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}