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
import EditQuatation from "./pages/EditQuatation";

function AppContent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-brand overflow-x-hidden">
      {/* ================= DESKTOP NAV ================= */}
      {user && (
        <nav className="hidden md:block bg-brand-gradient sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="logo " className="w-10 h-10 rounded-md bg-white/10 p-1" />
              <h1 className="text-xl font-semibold tracking-tight text-white">
                Quatation Bulder
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <NavLinks />
              <span className="hidden md:inline text-xs font-medium text-white/80">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-white/10 hover:bg-white/20 text-sm font-medium text-white px-4 py-2 rounded-full border border-white/20 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* ================= MOBILE TOP BAR ================= */}
      {user && (
        <div className="md:hidden sticky top-0 z-30 bg-brand-gradient flex items-center justify-between px-4 h-14 shadow-sm">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="logo " className="w-9 h-9 rounded-md bg-white/10 p-1" />
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Quatation Bulder
            </h1>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
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
        className={`fixed top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-lg z-50 transform transition-transform duration-300 shadow-xl
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-brand-primary/20">
          <span className="font-semibold text-slate-800">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <FiX size={22} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {/* Mobile nav links use dark text on light background */}
          <NavLinks onClick={() => setOpen(false)} variant="mobile" />

          <div className="pt-4 mt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-2 break-all">{user?.email}</p>
            <button
              onClick={handleSignOut}
              className="w-full bg-brand-primary text-white hover:opacity-90 py-2 rounded-full text-sm font-medium shadow-sm transition-colors"
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

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:id"
            element={
              <ProtectedRoute>
                <EditQuatation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute>
                <Customer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product"
            element={
              <ProtectedRoute>
                <ProductManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accessories"
            element={
              <ProtectedRoute>
                <AccessoryManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category"
            element={
              <ProtectedRoute>
                <CategoryManager />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        duration={4000}
      />
    </div>
  );
}

/* ================= NAV LINKS ================= */
function NavLinks({
  onClick,
  variant = "desktop",
}: {
  onClick?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const baseCls =
    "block px-3 py-1.5 rounded-full text-sm font-medium transition-colors";

  const cls =
    variant === "desktop"
      ? `${baseCls} text-white/80 hover:text-white hover:bg-white/10`
      : `${baseCls} text-slate-800 hover:bg-slate-100`;

  return (
    <>
      <Link to="/" onClick={onClick} className={cls}>
        Home
      </Link>
      <Link to="/customer" onClick={onClick} className={cls}>
        Customer
      </Link>
      <Link to="/product" onClick={onClick} className={cls}>
        Products
      </Link>
      <Link to="/accessories" onClick={onClick} className={cls}>
        Accessories
      </Link>
      <Link to="/category" onClick={onClick} className={cls}>
        Categories
      </Link>
    </>
  );
}

export default function App() {
  return <AppContent />;
}
