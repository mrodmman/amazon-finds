import React, { useState, useEffect } from 'react';
import { Copy, Check, Plus, X, Upload, Edit2, ChevronDown, ChevronUp, Instagram, Mail, Facebook, Twitter, FileSpreadsheet, Trash2, FolderPlus } from 'lucide-react';

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
  const [csvData, setCsvData] = useState('');
  const [csvImageUrls, setCsvImageUrls] = useState(['']);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

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

  const handleImagePaste = async (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file.size > 500000) {
          alert('Image too large. Please use an image under 500KB.');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewProduct({ ...newProduct, image: reader.result });
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleAddProduct = async () => {
    if (newProduct.image && newProduct.link && newProduct.title) {
      const category = selectedCategory || newProduct.category;
      const updatedProducts = [...products, { 
        ...newProduct, 
        category: category,
        id: Date.now() 
      }];
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
      setSelectedCategory('');
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
    setShowCsvUpload(false);
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Find column indices
    const titleIndex = headers.findIndex(h => h.toLowerCase().includes('title'));
    const linkIndex = headers.findIndex(h => h.toLowerCase().includes('link') || h.toLowerCase().includes('url'));
    const codeIndex = headers.findIndex(h => h.toLowerCase().includes('code') || h.toLowerCase().includes('promo'));
    const regularPriceIndex = headers.findIndex(h => h.toLowerCase().includes('regular') || h.toLowerCase().includes('original'));
    const salePriceIndex = headers.findIndex(h => h.toLowerCase().includes('sale') || h.toLowerCase().includes('current'));
    
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < Math.max(titleIndex, linkIndex, regularPriceIndex, salePriceIndex) + 1) continue;
      
      const product = {
        id: Date.now() + i,
        title: values[titleIndex] || '',
        link: values[linkIndex] || '',
        code: values[codeIndex] || '',
        regularPrice: values[regularPriceIndex] || '',
        salePrice: values[salePriceIndex] || '',
        category: selectedCategory || newProduct.category || 'New Deals',
        image: csvImageUrls[i - 1] || '' // Match image URL with CSV row
      };
      
      products.push(product);
    }
    
    return products;
  };

  const handleImportCSV = async () => {
    if (!csvData) {
      alert('Please paste or upload CSV data first');
      return;
    }
    
    const importedProducts = parseCSV(csvData);
    
    // Filter out products without required fields
    const validProducts = importedProducts.filter(p => p.title && p.link);
    
    if (validProducts.length === 0) {
      alert('No valid products found in CSV. Please check your format.');
      return;
    }
    
    const updatedProducts = [...products, ...validProducts];
    await saveProducts(updatedProducts);
    
    setCsvData('');
    setCsvImageUrls(['']);
    setShowCsvUpload(false);
    setSelectedCategory('');
    setNewProduct({
      image: '',
      link: '',
      code: '',
      title: '',
      category: '',
      regularPrice: '',
      salePrice: ''
    });
    
    alert(`Successfully imported ${validProducts.length} products!`);
  };

  const addImageUrlField = () => {
    setCsvImageUrls([...csvImageUrls, '']);
  };

  const removeImageUrlField = (index) => {
    const newUrls = [...csvImageUrls];
    newUrls.splice(index, 1);
    setCsvImageUrls(newUrls);
  };

  const updateImageUrl = (index, value) => {
    const newUrls = [...csvImageUrls];
    newUrls[index] = value;
    setCsvImageUrls(newUrls);
  };

  const handleImagePasteCSV = (index, e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file.size > 500000) {
          alert('Image too large. Please use an image under 500KB.');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          const newUrls = [...csvImageUrls];
          newUrls[index] = reader.result;
          setCsvImageUrls(newUrls);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
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
      {/* Navigation - Same as before */}
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

      {/* About Page - Same as before */}
      {/* Disclaimer Page - Same as before */}

      {/* Home Page - Products */}
      {currentPage === 'home' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 text-sm">
              Deals can expire at anytime | As an Amazon Associate I earn from qualifying purchases at no extra cost to you.
            </p>
            
            {/* Social Links Below Header - Same as before */}
          </div>

          {isAdminMode && (
            <div className="flex gap-4 justify-center mb-8 flex-wrap">
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setShowCsvUpload(false);
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                Add Single Product
              </button>
              
              <button
                onClick={() => {
                  setShowCsvUpload(!showCsvUpload);
                  setShowAddForm(false);
                }}
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <FileSpreadsheet size={20} />
                Upload CSV
              </button>
            </div>
          )}

          {/* CSV Upload Form */}
          {isAdminMode && showCsvUpload && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-purple-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Upload CSV Products</h2>
                <button onClick={() => setShowCsvUpload(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2">📋 CSV Format Instructions:</h3>
                  <p className="text-blue-700 text-sm mb-2">Your CSV should have these columns (in any order):</p>
                  <ul className="text-blue-600 text-sm list-disc pl-5 space-y-1">
                    <li><code>Title</code> - Product title (required)</li>
                    <li><code>Link</code> - Amazon product URL (required)</li>
                    <li><code>RegularPrice</code> - Original price (e.g., 79.99)</li>
                    <li><code>SalePrice</code> - Current sale price (e.g., 39.99)</li>
                    <li><code>Code</code> - Promo code (optional)</li>
                  </ul>
                  <p className="text-blue-700 text-sm mt-2">Example row: <code>Wireless Headphones,https://amazon.com/headphones,79.99,39.99,SAVE20</code></p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category/Date Selection
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        if (e.target.value !== 'new') {
                          setNewProduct({ ...newProduct, category: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select existing category or create new</option>
                      <option value="new">-- Create New Category --</option>
                      {Object.keys(groupedProducts).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    
                    {selectedCategory === 'new' && (
                      <input
                        type="text"
                        placeholder="Enter new category name (e.g., December 5 Deals)"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload CSV File
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                        <Upload size={20} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Choose CSV File</span>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleCsvUpload}
                          className="hidden"
                        />
                      </label>
                      {csvData && (
                        <span className="text-green-600 text-sm">✓ CSV loaded ({csvData.split('\n').length - 1} products)</span>
                      )}
                    </div>
                  </div>
                </div>

                {csvData && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images (Paste or enter URLs)
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Add images in the same order as your CSV rows. You can paste images directly into the fields!
                    </p>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                      {csvImageUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-gray-500 text-sm w-6">{index + 1}.</span>
                            <div 
                              className="flex-1 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 focus-within:border-purple-500"
                              onPaste={(e) => handleImagePasteCSV(index, e)}
                            >
                              <input
                                type="text"
                                placeholder="Paste image or enter image URL..."
                                value={url}
                                onChange={(e) => updateImageUrl(index, e.target.value)}
                                className="w-full bg-transparent outline-none text-sm"
                              />
                            </div>
                            {url && (
                              <img src={url} alt="Preview" className="h-10 w-10 object-cover rounded border" />
                            )}
                          </div>
                          {index > 0 && (
                            <button
                              onClick={() => removeImageUrlField(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={addImageUrlField}
                      className="mt-2 text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add another image field
                    </button>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleImportCSV}
                    disabled={!csvData || !(selectedCategory || newProduct.category)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Import {csvData ? csvData.split('\n').length - 1 : 0} Products
                  </button>
                  <button
                    onClick={() => {
                      setCsvData('');
                      setCsvImageUrls(['']);
                    }}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Single Product Form */}
          {isAdminMode && showAddForm && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-purple-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Add Single Product</h2>
                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category/Date Selection
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      if (e.target.value !== 'new') {
                        setNewProduct({ ...newProduct, category: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select existing category or create new</option>
                    <option value="new">-- Create New Category --</option>
                    {Object.keys(groupedProducts).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  {selectedCategory === 'new' && (
                    <input
                      type="text"
                      placeholder="Enter new category name (e.g., December 5 Deals)"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  )}
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
                    <span className="text-gray-500 text-sm">or</span>
                    <div 
                      className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 focus-within:border-purple-500"
                      onPaste={handleImagePaste}
                    >
                      <input
                        type="text"
                        placeholder="Paste image here or enter URL..."
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        className="w-full bg-transparent outline-none text-sm"
                      />
                    </div>
                    {newProduct.image && (
                      <img src={newProduct.image} alt="Preview" className="h-16 w-16 object-cover rounded-lg border" />
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

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleAddProduct}
                    disabled={!newProduct.image || !newProduct.link || !newProduct.title || !(selectedCategory || newProduct.category)}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Product
                  </button>
                  <button
                    onClick={() => {
                      setNewProduct({
                        image: '',
                        link: '',
                        code: '',
                        title: '',
                        category: '',
                        regularPrice: '',
                        salePrice: ''
                      });
                      setSelectedCategory('');
                    }}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Display - Same as before */}
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
                // ... same as before
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Mode Button and Password Prompt - Same as before */}
    </div>
  );
}
