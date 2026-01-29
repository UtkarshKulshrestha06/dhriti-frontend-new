
import React, { useState, useRef } from 'react';
import { X, Download, Maximize2, Minimize2, ZoomIn, ZoomOut, FileText, ExternalLink, ChevronLeft, ChevronRight, Info, AlertTriangle } from 'lucide-react';
import Button from './Button';

interface PDFViewerProps {
    url: string;
    title: string;
    onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, onClose }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(100);
    const viewerRef = useRef<HTMLDivElement>(null);

    const toggleFullscreen = () => {
        if (!viewerRef.current) return;

        if (!document.fullscreenElement) {
            viewerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Listen for escape key or other fullscreen exits
    React.useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 lg:p-10 pointer-events-none">
            {/* Backdrop with stronger blur */}
            <div
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-md transition-opacity pointer-events-auto"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div
                ref={viewerRef}
                className={`relative bg-white w-full max-w-6xl h-full sm:h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 pointer-events-auto ${isFullscreen ? 'max-w-none h-screen rounded-none' : ''
                    }`}
            >

                {/* Modern Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-ocean-50 flex items-center justify-center text-ocean-600 shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h3 className="font-extrabold text-slate-900 truncate leading-tight">{title}</h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Studying at Dhriti Classes</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <div className="hidden sm:flex items-center bg-slate-50 rounded-xl p-1 mr-2 border border-slate-100">
                            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-[10px] font-bold text-slate-500 w-12 text-center select-none">{zoom}%</span>
                            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>

                        <a href={url} target="_blank" rel="noreferrer" className="hidden sm:block">
                            <button className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all" title="Open in browser">
                                <ExternalLink className="w-5 h-5" />
                            </button>
                        </a>

                        <div className="w-px h-6 bg-slate-100 mx-1 hidden sm:block"></div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-red-600 text-white transition-all shadow-lg"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Improved Content Area */}
                <div className="flex-1 bg-slate-800 relative group overflow-hidden">
                    <iframe
                        src={`${url}#zoom=${zoom}&toolbar=0&navpanes=0`}
                        className="w-full h-full border-none"
                        title="PDF Content"
                    >
                        <div className="flex flex-col items-center justify-center h-full text-slate-200">
                            <AlertTriangle className="w-12 h-12 mb-4 text-orange-400" />
                            <p className="mb-6 font-medium">Browser PDF viewer not available.</p>
                            <a href={url} download>
                                <Button variant="outline" className="border-white text-white hover:bg-white/10">Download Document</Button>
                            </a>
                        </div>
                    </iframe>

                    {/* Floating Mobile Controls overlay (auto-hide?) */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 text-white shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto">
                        <button className="p-1 hover:text-ocean-400"><ChevronLeft className="w-6 h-6" /></button>
                        <span className="text-sm font-bold w-12 text-center">1 / --</span>
                        <button className="p-1 hover:text-ocean-400"><ChevronRight className="w-6 h-6" /></button>
                        <div className="w-px h-4 bg-white/20 mx-2"></div>
                        <a href={url} download title="Download"><Download className="w-5 h-5 hover:text-ocean-400" /></a>
                    </div>
                </div>

                {/* Minimal Footer */}
                <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-2.5 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        Secure & Encrypted Viewer
                    </div>
                    <div className="flex gap-6">
                        <span className="flex items-center gap-1.5"><Info className="w-3 h-3" /> Digital Library</span>
                        <span className="text-slate-300">© Dhriti Classes</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PDFViewer;
