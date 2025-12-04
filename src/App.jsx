import React, { useState, useEffect } from 'react';
import { Copy, Check, Plus, X, Upload, Edit2, ChevronDown, ChevronUp, Instagram, Mail, Facebook, Twitter } from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState('home');
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
      {/* Navigation */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setCurrentPage('home')}
              className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
            >
              ✨ My Amazon Finds
            </button>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setCurrentPage('home')}
                className={`text-sm font-medium transition ${currentPage === 'home' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentPage('about')}
                className={`text-sm font-medium transition ${currentPage === 'about' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
              >
                About
              </button>
              <button 
                onClick={() => setCurrentPage('disclaimer')}
                className={`text-sm font-medium transition ${currentPage === 'disclaimer' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
              >
                Disclaimer
              </button>
              {isAdminMode && (
                <button
                  onClick={handleAdminLogout}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-600 transition"
                >
                  Exit Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About Page */}
      {currentPage === 'about' && (
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-6">
              About My Amazon Finds
            </h1>
            
            <div className="space-y-4 text-gray-700">
              <p className="text-lg font-semibold">I find deals. You save money. That's it.</p>
              
              <p>I'm not here to waste your time with junk — just real Amazon promo codes, price drops, and deals I actually found cheaper.</p>
              
              <p className="font-semibold">No filler. No fluff.</p>
              
              <p>💎 I also give gift cards to my favorite commenters sometimes — because why not?</p>
              
              <p className="font-semibold">If I post it, it's either:</p>
              
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Way cheaper than normal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Got a promo code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Or it's just too good to not share</span>
                </li>
              </ul>
              
              <p>I do the digging so you don't have to. You just scroll, click, and save. 🔥</p>
              
              <p className="font-semibold">Don't sleep on these — stuff goes fast.</p>
            </div>

            {/* Social Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">Follow me for daily deals:</p>
              <div className="flex gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                   className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                  <Instagram size={20} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                  <Twitter size={20} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                  <Facebook size={20} />
                </a>
                <a href="mailto:hello@example.com"
                   className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer Page */}
      {currentPage === 'disclaimer' && (
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-6">
              Disclaimer
            </h1>
            
            <div className="space-y-4 text-gray-700 text-sm">
              <p className="font-semibold">Important: We may earn commissions for purchases made through links on our site.</p>
              
              <p>Product prices and availability are accurate as of the date/time indicated and are subject to change.</p>
              
              <p>The price and availability information displayed on Amazon at the time of purchase will apply to your order.</p>
              
              <p>Content, discounts, offers, images, prices, and availability may change or be removed at any time.</p>
              
              <p>My Amazon Finds participates in the Amazon Services LLC Associates Program, an affiliate advertising program that allows sites to earn advertising fees by linking to Amazon.com.</p>
              
              <p>Neither Amazon nor any store or brand mentioned on this website supports, sponsors, or endorses this website or its content.</p>
              
              <p className="font-semibold uppercase">Certain content that appears on this site comes from Amazon Services LLC. This content is provided 'as is' and may be subject to change or removal at any time.</p>
              
              <p>Third-party product names, logos, brands, and trademarks are the property of their respective owners and are not affiliated with My Amazon Finds.</p>
              
              <p>These parties do not endorse, sponsor, or support this website, its content, or its services.</p>
              
              <p>My Amazon Finds does not claim to represent the manufacturers, brands, companies, or retailers listed on this site, nor does it own their trademarks, logos, marketing materials, or products.</p>
              
              <p>Images are for illustrative purposes only. My Amazon Finds does not sell products or services.</p>
              
              <p>This website is a news platform providing information about various offers found online to the best of our knowledge at the time of publication.</p>
              
              <p>My Amazon Finds does not ship products or samples and does not accept any form of payment.</p>
            </div>
          </div>
        </div>
      )}

      {/* Home Page - Products */}
      {currentPage === 'home' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 text-sm">
              Deals can expire at anytime | As an Amazon Associate I earn from qualifying purchases at no extra cost to you.
            </p>
            
            {/* Social Links Below Header */}
            <div className="flex gap-3 justify-center mt-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                 className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                <Instagram size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                <Twitter size={16} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                 className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                <Facebook size={16} />
              </a>
              <a href="mailto:hello@example.com"
                 className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                <Mail size={16} />
              </a>
            </div>
          </div>

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
                <div key={category} className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 overflow-hidden">
                  <button
                    onClick={() => toggleSection(category)}
                    className="w-full px-6 py-5 flex justify-between items-center hover:bg-purple-50 transition group"
                  >
                    <div className="text-center flex-1">
                      <h2 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition">{category}</h2>
                      <p className="text-sm text-gray-500 mt-1">Click to open</p>
                    </div>
                    <div className={`transform transition-transform ${expandedSections[category] ? 'rotate-180' : ''}`}>
                      <ChevronDown className="text-purple-500" size={28} />
                    </div>
                  </button>

                  {expandedSections[category] && (
                    <div className="px-6 pb-6 pt-2 bg-gradient-to-br from-pink-50 to-purple-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((product) => {
                          const discount = calculateDiscount(
                            parseFloat(product.regularPrice), 
                            parseFloat(product.salePrice)
                          );
                          
                          return (
                            <div key={product.id} className="bg-white rounded-xl border-2 border-purple-100 overflow-hidden hover:shadow-lg transition group relative">
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
                                      className="w-32 h-32 object-cover rounded-lg border-2 border-purple-100"
                                    />
                                  </a>

                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-gray-800 font-medium text-sm mb-2 line-clamp-2">
                                      {product.title}
                                    </h3>

                                    {discount > 0 && (
                                      <div className="inline-block bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
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
                                        className="w-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border-2 border-purple-200"
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
                                        className="block w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-center px-3 py-2 rounded-lg text-xs font-bold transition shadow-md hover:shadow-lg"
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
      )}

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
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border-2 border-purple-200">
            <h3 className="text-xl font-semibold mb-4">Enter Admin Password</h3>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Enter password"
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdminLogin}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition font-medium"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setPasswordInput('');
                }}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
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
