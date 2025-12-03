import React, { useState, useEffect } from 'react';
import { Copy, Check, Plus, X, Upload, Edit2 } from 'lucide-react';

export default function ProductFindsPage() {
  const [products, setProducts] = useState([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    image: '',
    link: '',
    code: '',
    title: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProducts = async (updatedProducts) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: updatedProducts })
      });
      if (response.ok) {
        setProducts(updatedProducts);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save products:', error);
      alert('Failed to save products. Please try again.');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1000000) {
        alert('Image too large. Please use an image under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async () => {
    if (newProduct.image && newProduct.link) {
      const updatedProducts = [...products, { ...newProduct, id: Date.now() }];
      await saveProducts(updatedProducts);
      setNewProduct({ image: '', link: '', code: '', title: '' });
      setShowAddForm(false);
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeleteProduct = async (id) => {
    const updatedProducts = products.filter(p => p.id !== id);
    await saveProducts(updatedProducts);
  };

  const handleAdminLogin = async () => {
    try {
      const response = await fetch('/api/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await response.json();
      
      if (data.valid) {
        setIsAdminMode(true);
        setShowPasswordPrompt(false);
        setPasswordInput('');
      } else {
        alert('Incorrect password!');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminMode(false);
    setShowAddForm(false);
  };

  const AdminToggle = () => (
    <button
      onClick={() => setShowPasswordPrompt(true)}
      className="fixed bottom-4 right-4 w-12 h-12 bg-gray-200 rounded-full opacity-20 hover:opacity-100 transition-opacity"
      title="Admin Mode"
    >
      <Edit2 size={20} className="mx-auto text-gray-600" />
    </button>
  );

  const PasswordPrompt = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-semibold mb-4">Enter Admin Password</h3>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
          placeholder="Enter password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleAdminLogin}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Login
          </button>
          <button
            onClick={() => {
              setShowPasswordPrompt(false);
              setPasswordInput('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                ✨ My Amazon Finds
              </h1>
              <p className="text-gray-600 mt-1">Curated products I love & exclusive promo codes</p>
            </div>
            {isAdminMode && (
              <button
                onClick={handleAdminLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
              >
                Exit Admin Mode
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {isAdminMode && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mb-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add New Product
          </button>
        )}

        {isAdminMode && showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-purple-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Add New Product</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g., Cozy Throw Blanket"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                    <Upload size={20} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {newProduct.image && (
                    <img src={newProduct.image} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amazon Link</label>
                <input
                  type="url"
                  placeholder="https://amazon.com/..."
                  value={newProduct.link}
                  onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code (Optional)</label>
                <input
                  type="text"
                  placeholder="SAVE20"
                  value={newProduct.code}
                  onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleAddProduct}
                disabled={!newProduct.image || !newProduct.link}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Product
              </button>
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-gray-500 text-lg">
              {isAdminMode ? 'No products yet. Add your first product find!' : 'Check back soon for amazing finds!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 group relative">
                {isAdminMode && (
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50"
                  >
                    <X size={16} className="text-red-500" />
                  </button>
                )}

                <a href={product.link} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.title || "Product"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </a>

                <div className="p-4">
                  {product.title && (
                    <h3 className="font-semibold text-gray-800 mb-3">{product.title}</h3>
                  )}
                  
                  {product.code && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">PROMO CODE</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-gradient-to-r from-pink-50 to-purple-50 px-3 py-2 rounded-lg text-sm font-bold text-purple-600 border border-purple-200">
                          {product.code}
                        </code>
                        <button
                          onClick={() => handleCopyCode(product.code, product.id)}
                          className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                          title="Copy code"
                        >
                          {copiedCode === product.id ? (
                            <Check size={18} />
                          ) : (
                            <Copy size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-center px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all shadow-md"
                  >
                    Shop on Amazon →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isAdminMode && !showPasswordPrompt && <AdminToggle />}
      {showPasswordPrompt && <PasswordPrompt />}
    </div>
  );
}
