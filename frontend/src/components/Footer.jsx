import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-500 text-sm border-t border-gray-200 mt-12">
      <div className="max-w-screen-xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="text-center sm:text-left">
          © {new Date().getFullYear()} HealthHub. Crafted with care.
        </div>
        <div className="flex gap-4">
          <a href="/terms" className="hover:text-blue-500 transition-colors duration-200">Terms</a>
          <a href="/privacy-policy" className="hover:text-blue-500 transition-colors duration-200">Privacy</a>
          <a href="/contact" className="hover:text-blue-500 transition-colors duration-200">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
