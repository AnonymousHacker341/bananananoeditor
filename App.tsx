import React from 'react';
import { ImageEditor } from './components/ImageEditor';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
               <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-100">BananaEdit</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
             <a href="#" className="hover:text-yellow-400 transition-colors">Features</a>
             <a href="#" className="hover:text-yellow-400 transition-colors">About</a>
             <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="hover:text-yellow-400 transition-colors">API Docs</a>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <ImageEditor />
      </main>

      <footer className="border-t border-slate-800 py-8 mt-auto bg-slate-950">
         <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm">
            <p>© {new Date().getFullYear()} BananaEdit AI. Powered by Gemini 2.5 Flash Image.</p>
         </div>
      </footer>
    </div>
  );
};

export default App;
