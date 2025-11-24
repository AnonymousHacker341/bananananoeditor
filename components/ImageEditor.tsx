import React, { useState, useCallback, useRef } from 'react';
import { editImageWithGemini } from '../services/gemini';
import { AppStatus, ImageState } from '../types';
import { Spinner } from './Spinner';

// A default sample image (Monkey) for the demo
const SAMPLE_MONKEY_URL = "https://images.unsplash.com/photo-1540573133985-87b6da6dce60?q=80&w=1000&auto=format&fit=crop";

export const ImageEditor: React.FC = () => {
  const [images, setImages] = useState<ImageState>({
    original: null,
    generated: null,
    mimeType: 'image/jpeg'
  });
  const [prompt, setPrompt] = useState<string>("");
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to convert File/Blob to Base64
  const fileToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setImages({
        original: base64,
        generated: null,
        mimeType: file.type,
      });
      setStatus(AppStatus.IDLE);
      setErrorMsg(null);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to read file.");
    }
  };

  const loadSampleImage = async () => {
    try {
      setStatus(AppStatus.LOADING);
      const response = await fetch(SAMPLE_MONKEY_URL);
      const blob = await response.blob();
      const base64 = await fileToBase64(blob);
      setImages({
        original: base64,
        generated: null,
        mimeType: blob.type,
      });
      setPrompt("Add a tophat on top of the monkeys head"); // Pre-fill specifically for the sample
      setStatus(AppStatus.IDLE);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load sample image.");
      setStatus(AppStatus.IDLE);
    }
  };

  const handleGenerate = async () => {
    if (!images.original) {
      setErrorMsg("Please upload an image first.");
      return;
    }
    if (!prompt.trim()) {
      setErrorMsg("Please enter a prompt.");
      return;
    }

    setStatus(AppStatus.LOADING);
    setErrorMsg(null);

    try {
      const resultBase64 = await editImageWithGemini(
        images.original,
        images.mimeType,
        prompt
      );

      if (resultBase64) {
        setImages((prev) => ({ ...prev, generated: resultBase64 }));
        setStatus(AppStatus.SUCCESS);
      } else {
        throw new Error("No image generated.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate image. Please try again.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (!images.generated) return;
    const link = document.createElement('a');
    link.href = images.generated;
    link.download = 'banana-edit-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      
      {/* Header Area */}
      <div className="text-center mb-10 space-y-4">
        <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200">
          BananaEdit AI
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Transform your images using Gemini 2.5 Flash. Just describe what you want to change.
        </p>
      </div>

      {/* Main Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Input Side */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-200">Original Image</h2>
            {!images.original && (
              <button 
                onClick={loadSampleImage}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-yellow-400 px-3 py-1 rounded-full transition-colors font-medium"
              >
                Load Sample Monkey
              </button>
            )}
          </div>

          {/* Image Drop Area / Preview */}
          <div 
            className={`relative group aspect-square w-full rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 ${
              images.original 
                ? 'border-slate-600 bg-slate-900' 
                : 'border-slate-600 hover:border-yellow-400/50 bg-slate-800/50 cursor-pointer'
            }`}
            onClick={() => !images.original && fileInputRef.current?.click()}
          >
            {images.original ? (
              <>
                <img 
                  src={images.original} 
                  alt="Original" 
                  className="w-full h-full object-contain" 
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setImages({ original: null, generated: null, mimeType: 'image/jpeg' });
                    setPrompt("");
                  }}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="text-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-400 font-medium">Click to upload image</p>
                <p className="text-slate-500 text-sm mt-1">JPG, PNG supported</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          {/* Prompt Input */}
          <div className="flex flex-col gap-3 mt-2">
            <label className="text-sm font-medium text-slate-400">Editing Instruction</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Add a tophat on top of the monkeys head, make it cyberpunk style..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all resize-none h-28"
              disabled={status === AppStatus.LOADING}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!images.original || !prompt || status === AppStatus.LOADING}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex justify-center items-center gap-2 ${
              !images.original || !prompt || status === AppStatus.LOADING
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white hover:shadow-orange-500/25 transform hover:-translate-y-0.5'
            }`}
          >
            {status === AppStatus.LOADING ? (
              <>
                <Spinner />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Generate Edit</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm text-center animate-pulse">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right: Output Side */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-6 flex flex-col h-full shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-200">Result</h2>
            {status === AppStatus.SUCCESS && images.generated && (
              <button 
                onClick={handleDownload}
                className="text-sm flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            )}
          </div>

          <div className="flex-1 w-full rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden relative min-h-[400px]">
            {images.generated ? (
              <img 
                src={images.generated} 
                alt="Generated result" 
                className="w-full h-full object-contain animate-in fade-in duration-700" 
              />
            ) : (
              <div className="text-center p-8 max-w-xs">
                 {status === AppStatus.LOADING ? (
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 border-4 border-slate-700 border-t-yellow-500 rounded-full animate-spin"></div>
                      <p className="text-yellow-400/80 font-medium">Gemini is thinking...</p>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <p className="text-slate-500">
                        The generated image will appear here.
                      </p>
                   </div>
                 )}
              </div>
            )}
          </div>
          
          {/* Decorative info footer */}
          <div className="mt-4 flex justify-between items-center text-xs text-slate-600">
             <span>Powered by <span className="text-slate-500 font-semibold">gemini-2.5-flash-image</span></span>
             {status === AppStatus.SUCCESS && <span>Generation Complete</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
