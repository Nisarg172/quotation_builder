import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from "./hooks/useAuth";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

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
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* ================= DESKTOP NAV ================= */}
      {user && (
        <nav className="hidden md:block bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-800">
              HM Technology
            </h1>

            <div className="flex items-center space-x-6">
              <NavLinks />
              <span className="text-sm text-slate-600">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* ================= MOBILE TOP BAR ================= */}
      {user && (
        <div className="md:hidden sticky top-0 z-30 bg-white border-b flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-bold text-slate-800">HM Technology</h1>
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <FiMenu size={22} />
          </button>
        </div>
      )}

      {/* ================= MOBILE OVERLAY ================= */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* ================= MOBILE DRAWER (RIGHT) ================= */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b">
          <span className="font-semibold text-slate-800">Menu</span>
          <button onClick={() => setOpen(false)}>
            <FiX size={22} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <NavLinks onClick={() => setOpen(false)} />

          <div className="pt-4 mt-4 border-t">
            <p className="text-sm text-slate-600 mb-2">{user?.email}</p>
            <button
              onClick={handleSignOut}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ================= ROUTES ================= */}
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/pdf/:id" element={<BillQuatation />} />

          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/customer" element={<ProtectedRoute><Customer /></ProtectedRoute>} />
          <Route path="/product" element={<ProtectedRoute><ProductManager /></ProtectedRoute>} />
          <Route path="/accessories" element={<ProtectedRoute><AccessoryManager /></ProtectedRoute>} />
          <Route path="/category" element={<ProtectedRoute><CategoryManager /></ProtectedRoute>} />
        </Routes>
      </main>

      <Toaster position="top-right" richColors closeButton expand duration={4000} />
    </div>
  );
}

/* ================= NAV LINKS ================= */
function NavLinks({ onClick }: { onClick?: () => void }) {
  const cls =
    "block px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100";

  return (
    <>
      <Link to="/" onClick={onClick} className={cls}>Home</Link>
      <Link to="/customer" onClick={onClick} className={cls}>Customer</Link>
      <Link to="/product" onClick={onClick} className={cls}>Products</Link>
      <Link to="/accessories" onClick={onClick} className={cls}>Accessories</Link>
      <Link to="/category" onClick={onClick} className={cls}>Categories</Link>
    </>
  );
}

export default function App() {
  return <AppContent />;
}
