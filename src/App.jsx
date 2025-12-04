import React, { useState, useEffect } from 'react';
import { Copy, Check, Plus, X, Upload, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = 'https://amazon-finds-api.onrender.com';

export default function ProductFindsPage() {
  const [products, setProducts] = useState([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [newProduct, setNewProduct] = useState({
    image: '',
    link: '',
    code: '',
    title: '',
    category: '',
    regularPrice: '',
    salePrice: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
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
      const response = await fetch(`${API_URL}/api/products`, {
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

  const calculateDiscount = (regular, sale) => {
    if (!regular || !sale) return 0;
    const discount = ((regular - sale) / regular) * 100;
    return Math.round(discount);
  };

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  const toggleSection = (category) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) {
        alert('Image too large. Please use an image under 500KB.');
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
    if (newProduct.image && newProduct.link && newProduct.title) {
      const updatedProducts = [...products, { ...newProduct, id: Date.now() }];
      await saveProducts(updatedProducts);
      setNewProduct({ 
        image: '', 
        link: '', 
        code: '', 
        title: '', 
        category: '',
        regularPrice: '',
        salePrice: ''
      });
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
      const response = await fetch(`${API_URL}/api/check-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await response.json();
      
      if (data.valid) {
        setIsAdminMode(true);
        setShowPasswordPrompt(false);
        setPasswordInput('');
        if (data.firstTime) {
          alert('Admin password set! Remember this password for future logins.');
        }
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
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                ✨ My Amazon Finds
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Deals can expire at anytime | As an Amazon Associate I earn from qualifying purchases
              </p>
            </div>
            {isAdminMode && (
              <button
                onClick={handleAdminLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
              >
                Exit Admin
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isAdminMode && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mb-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Category/Date</label>
                <input
                  type="text"
                  placeholder="e.g., December 3 Deals"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g., Wireless Headphones"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Regular Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="79.99"
                    value={newProduct.regularPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, regularPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="39.99"
                    value={newProduct.salePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {newProduct.regularPrice && newProduct.salePrice && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-green-700 font-semibold">
                    {calculateDiscount(parseFloat(newProduct.regularPrice), parseFloat(newProduct.salePrice))}% OFF
                  </p>
                </div>
              )}

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
                disabled={!newProduct.image || !newProduct.link || !newProduct.title}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Product
              </button>
            </div>
          </div>
        )}

        {Object.keys(groupedProducts).length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-gray-500 text-lg">
              {isAdminMode ? 'No products yet. Add your first deal!' : 'Check back soon for amazing deals!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedProducts).map(([category, items]) => (
              <div key={category} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleSection(category)}
                  className="w-full px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div className="text-center flex-1">
                    <h2 className="text-xl font-semibold text-gray-800">{category}</h2>
                    <p className="text-sm text-gray-500 mt-1">Click to open</p>
                  </div>
                  {expandedSections[category] ? (
                    <ChevronUp className="text-gray-400" size={24} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={24} />
                  )}
                </button>

                {expandedSections[category] && (
                  <div className="px-6 pb-6 pt-2 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((product) => {
                        const discount = calculateDiscount(
                          parseFloat(product.regularPrice), 
                          parseFloat(product.salePrice)
                        );
                        
                        return (
                          <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition group relative">
                            {isAdminMode && (
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="absolute top-2 right-2 bg-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              >
                                <X size={14} className="text-white" />
                              </button>
                            )}

                            <div className="p-4">
                              <div className="flex gap-4">
                                <a href={product.link} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                                  <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-32 h-32 object-cover rounded-lg"
                                  />
                                </a>

                                <div className="flex-1 min-w-0">
                                  <h3 className="text-gray-800 font-medium text-sm mb-2 line-clamp-2">
                                    {product.title}
                                  </h3>

                                  {discount > 0 && (
                                    <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded mb-2">
                                      {discount}% OFF
                                    </div>
                                  )}

                                  <div className="flex items-baseline gap-2 mb-3">
                                    {product.salePrice && (
                                      <span className="text-gray-900 font-bold text-lg">
                                        ${parseFloat(product.salePrice).toFixed(2)}
                                      </span>
                                    )}
                                    {product.regularPrice && (
                                      <span className="text-gray-400 line-through text-sm">
                                        ${parseFloat(product.regularPrice).toFixed(2)}
                                      </span>
                                    )}
                                  </div>

                                  {product.code ? (
                                    <button
                                      onClick={() => handleCopyCode(product.code, product.id)}
                                      className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"
                                    >
                                      {copiedCode === product.id ? (
                                        <>
                                          <Check size={14} /> Copied!
                                        </>
                                      ) : (
                                        <>
                                          <Copy size={14} /> Code: {product.code}
                                        </>
                                      )}
                                    </button>
                                  ) : (
                                    <a
                                      href={product.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-center px-3 py-2 rounded-lg text-xs font-medium transition"
                                    >
                                      See Deal →
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {!isAdminMode && !showPasswordPrompt && (
        <button
          onClick={() => setShowPasswordPrompt(true)}
          className="fixed bottom-4 right-4 w-12 h-12 bg-gray-200 rounded-full opacity-20 hover:opacity-100 transition-opacity"
          title="Admin Mode"
        >
          <Edit2 size={20} className="mx-auto text-gray-600" />
        </button>
      )}

      {showPasswordPrompt && (
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
      )}
    </div>
  );
}
