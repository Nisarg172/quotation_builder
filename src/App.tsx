import { Routes, Route, Link } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import CategoryManager from "./pages/CategoryManager";
import ProductManager from "./pages/ProductManager";
import AccessoryManager from "./pages/AccessoryManager";


export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Sticky Navigation */}
      <nav className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-50">
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<ProductManager/>} />
          <Route path="/accessories" element={<AccessoryManager/>} />
          <Route path="/category" element={<CategoryManager/>} />
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