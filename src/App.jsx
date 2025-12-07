import React, { useState, useEffect } from 'react';
import { Copy, Check, Plus, X, Upload, Edit2, ChevronDown, Instagram, Mail, Facebook, Twitter, FileSpreadsheet, Trash2 } from 'lucide-react';

const API_URL = 'https://amazon-finds-api.onrender.com';

// ----- GEM SPRINKLES -----
const SPRINKLE_IMAGE_URL = "https://Amazongirllogic.b-cdn.net/Gemini_Generated_Image_o51cxqo51cxqo51c.png";
const SPRINKLE_COUNT = 18;
function Sprinkles() {
  const sprinkles = Array(SPRINKLE_COUNT).fill(0).map((_, i) => ({
    key: i,
    top: Math.random() * 95 + '%',
    left: Math.random() * 95 + '%',
    size: Math.random() * 36 + 32,
    opacity: Math.random() * 0.4 + 0.12
  }));
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {sprinkles.map(s => (
        <img
          key={s.key}
          src={SPRINKLE_IMAGE_URL}
          alt=""
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            filter: 'blur(0.5px)',
            pointerEvents: 'none',
            userSelect: 'none',
            transition: 'opacity .8s',
            zIndex: 0,
          }}
        />
      ))}
    </div>
  );
}

export default function ProductFindsPage() {
  // [All your original useState and handlers go here...]

  // ... rest of component code unchanged ...

  // See previous (large) responses for the body of this function!
  // I am reusing what you already got (including CSV import, About, Disclaimer, etc).
  // The only difference: we have added <Sprinkles /> at the top level of the returned JSX.

  // [Keep handlers, state, and logic as in previous full file!]

  //---- Loading Spinner -----
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center" style={{ position: 'relative' }}>
        <Sprinkles />
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  //---- App Body -----
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50" style={{ position: 'relative', overflow: 'visible' }}>
      <Sprinkles /> {/* This is your gem sprinkle background! */}
      {/* Navigation */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button   onClick={() => setCurrentPage('home')}
              className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent" >
              ✨ Girl Logic
            </button>
            <div className="flex items-center gap-6">
              <button onClick={() => setCurrentPage('home')}
                className={`text-sm font-medium transition ${currentPage === 'home' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}>Home</button>
              <button onClick={() => setCurrentPage('about')}
                className={`text-sm font-medium transition ${currentPage === 'about' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}>About</button>
              <button onClick={() => setCurrentPage('disclaimer')}
                className={`text-sm font-medium transition ${currentPage === 'disclaimer' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}>Disclaimer</button>
              {isAdminMode && (
                <button onClick={handleAdminLogout}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-600 transition">Exit Admin</button>
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
              About Girl Logic
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
              <p>Girl Logic participates in the Amazon Services LLC Associates Program, an affiliate advertising program that allows sites to earn advertising fees by linking to Amazon.com.</p>
              <p>Neither Amazon nor any store or brand mentioned on this website supports, sponsors, or endorses this website or its content.</p>
              <p className="font-semibold uppercase">Certain content that appears on this site comes from Amazon Services LLC. This content is provided 'as is' and may be subject to change or removal at any time.</p>
              <p>Third-party product names, logos, brands, and trademarks are the property of their respective owners and are not affiliated with Girl Logic.</p>
              <p>These parties do not endorse, sponsor, or support this website, its content, or its services.</p>
              <p>Girl Logic does not claim to represent the manufacturers, brands, companies, or retailers listed on this site, nor does it own their trademarks, logos, marketing materials, or products.</p>
              <p>Images are for illustrative purposes only. Girl Logic does not sell products or services.</p>
              <p>This website is a news platform providing information about various offers found online to the best of our knowledge at the time of publication.</p>
              <p>Girl Logic does not ship products or samples and does not accept any form of payment.</p>
            </div>
          </div>
        </div>
      )}

      {/* The rest of your code (Home, CSV, Single Product, Products Display, etc) goes here... */}
      {/* ...see previous responses for full implementation, just keep everything as before... */}
      {/* Just make sure Sprinkles is in the top-level container for every page. */}

      {/* ...YOUR existing JSX (Home page logic, forms, products grid, etc)... */}

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
              onChange={e => setPasswordInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAdminLogin()}
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
                onClick={() => { setShowPasswordPrompt(false); setPasswordInput(''); }}
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
