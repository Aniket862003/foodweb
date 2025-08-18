import React from 'react';

const FixedFooterPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <main className="flex-grow p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Welcome to the Fixed Footer Page</h1>
        <p className="text-gray-700">
          This is the main content area. Add your page components here.
        </p>
      </main>

      {/* Fixed Footer */}
      <footer className="bg-blue-800 text-white text-center p-4">
        <p>© 2025 Paras Deshmane | Real Estate Web App</p>
      </footer>
    </div>
  );
};

export default FixedFooterPage;
