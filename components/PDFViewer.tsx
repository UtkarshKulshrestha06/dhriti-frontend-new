import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Maximize2, Minimize2, ZoomIn, ZoomOut, ExternalLink, FileText, AlertTriangle } from 'lucide-react';
import Button from './Button';

interface PDFViewerProps {
    url: string;
    title: string;
    onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, onClose }) => {
    const [scale, setScale] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 10, 50));

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Listen for escape key
    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">

            {/* Main Container */}
            <div className={`relative bg-slate-900 w-full ${isFullscreen ? 'h-screen max-w-none rounded-none' : 'md:max-w-7xl h-full md:h-[95vh] md:rounded-3xl'} shadow-2xl flex flex-col overflow-hidden border border-slate-800`}>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-800 text-white shrink-0 border-b border-slate-700 z-50 gap-2">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
                            <span className="font-bold text-xs">PDF</span>
                        </div>
                        <h3 className="font-bold text-sm md:text-lg truncate max-w-[150px] md:max-w-md text-slate-200" title={title}>{title}</h3>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 ml-auto">
                        {/* Zoom Controls (mapped to PDF params) */}
                        <div className="hidden md:flex items-center bg-slate-700 rounded-lg p-1 border border-slate-600">
                            <button onClick={handleZoomOut} className="p-2 rounded-md hover:bg-slate-600 text-slate-300" title="Zoom Out">
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-mono w-12 text-center text-slate-400 select-none">{scale}%</span>
                            <button onClick={handleZoomIn} className="p-2 rounded-md hover:bg-slate-600 text-slate-300" title="Zoom In">
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-px h-6 bg-slate-700 hidden md:block"></div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            <button onClick={toggleFullscreen} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white hidden sm:block" title="Fullscreen">
                                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </button>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
                                <button className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white" title="Open in New Tab">
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                            </a>
                            <a href={url} download className="hidden sm:block">
                                <button className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white" title="Download">
                                    <Download className="w-5 h-5" />
                                </button>
                            </a>
                            <button
                                onClick={onClose}
                                className="ml-2 p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area - RESTORED FROM OLD FRONTEND LOGIC */}
                <div className="flex-1 bg-slate-800 relative group overflow-hidden">
                    <iframe
                        // We use the old method: passing zoom in hash
                        src={url ? `${url}#zoom=${scale}&toolbar=0&navpanes=0` : ''}
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
                </div>

            </div>
        </div>
    );
};

export default PDFViewer;
