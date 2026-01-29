
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { X, Download, Maximize2, ZoomIn, ZoomOut, ExternalLink, PenTool, Eraser, Palette, Check, FileText } from 'lucide-react';
import Button from './Button';

interface PDFViewerProps {
    url: string;
    title: string;
    onClose: () => void;
}

const COLORS = [
    { id: 'red', value: '#ef4444', label: 'Red' },
    { id: 'blue', value: '#3b82f6', label: 'Blue' },
    { id: 'green', value: '#22c55e', label: 'Green' },
    { id: 'black', value: '#000000', label: 'Black' },
    { id: 'yellow', value: '#eab308', label: 'Highlighter' }, // Using a darker yellow for visibility, or handle opacity
];

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, onClose }) => {
    const [scale, setScale] = useState(1);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [activeColor, setActiveColor] = useState('#ef4444');
    const [showColorPicker, setShowColorPicker] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const contentContainerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Zoom Handlers
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

    // Full Screen
    const handleFullScreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            scrollContainerRef.current?.parentElement?.requestFullscreen();
        }
    };

    // Resize canvas to match the render size exactly
    useLayoutEffect(() => {
        if (!isDrawingMode) return;

        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const contentContainer = contentContainerRef.current;

            if (!canvas || !contentContainer) return;

            // We use the dimensions of the content container (which scales with width %)
            const { width, height } = contentContainer.getBoundingClientRect();

            // Set actual canvas size to match display size for 1:1 mapping
            // Note: This resets canvas content. In a real app, you'd save/restore paths.
            // For this demo, we assume drawing is transient or we accept clearing on zoom/resize.
            if (canvas.width !== width || canvas.height !== height) {
                // Ideally, we copy the old image data to new canvas, but simple resize clears it.
                // To keep it simple for this fix:
                canvas.width = width;
                canvas.height = height;
            }
        };

        // Delay slightly to allow transition to finish if any
        const timeout = setTimeout(resizeCanvas, 200);
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            clearTimeout(timeout);
        };
    }, [isDrawingMode, scale]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawingMode) return;
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();

        const clientX = ('touches' in e) ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = ('touches' in e) ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);

        // Config style
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (activeColor === '#eab308') {
            // Highlighter style
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)';
            ctx.lineWidth = 15;
        } else {
            // Pen style
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = 3;
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !isDrawingMode) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = ('touches' in e) ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = ('touches' in e) ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        ctx?.beginPath(); // Reset path to prevent connecting lines
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">

            {/* Main Container */}
            <div
                className="relative bg-slate-900 w-full md:max-w-7xl h-full md:h-[95vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-800"
            >

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-800 text-white shrink-0 border-b border-slate-700 z-50 gap-2">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
                            <span className="font-bold text-xs">PDF</span>
                        </div>
                        <h3 className="font-bold text-sm md:text-lg truncate max-w-[150px] md:max-w-md text-slate-200" title={title}>{title}</h3>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 ml-auto">

                        {/* Draw Tools */}
                        <div className="flex items-center bg-slate-700 rounded-lg p-1 border border-slate-600">
                            <button
                                onClick={() => setIsDrawingMode(!isDrawingMode)}
                                className={`p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold ${isDrawingMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-600'}`}
                                title="Toggle Annotations"
                            >
                                <PenTool className="w-4 h-4" />
                                <span className="hidden sm:inline">{isDrawingMode ? 'Drawing On' : 'Annotate'}</span>
                            </button>

                            {isDrawingMode && (
                                <>
                                    <div className="w-px h-4 bg-slate-600 mx-1"></div>

                                    {/* Color Picker Trigger */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowColorPicker(!showColorPicker)}
                                            className="p-2 rounded-md hover:bg-slate-600 transition-colors relative"
                                        >
                                            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: activeColor }}></div>
                                        </button>

                                        {showColorPicker && (
                                            <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 p-2 rounded-xl shadow-xl flex gap-2 z-50">
                                                {COLORS.map(c => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => { setActiveColor(c.value); setShowColorPicker(false); }}
                                                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${activeColor === c.value ? 'border-white' : 'border-transparent'}`}
                                                        style={{ backgroundColor: c.value }}
                                                        title={c.label}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={clearCanvas} className="p-2 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-600 transition-colors" title="Clear All">
                                        <Eraser className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="w-px h-6 bg-slate-700 hidden md:block"></div>

                        {/* Zoom Controls */}
                        <div className="hidden md:flex items-center bg-slate-700 rounded-lg p-1 border border-slate-600">
                            <button onClick={handleZoomOut} className="p-2 rounded-md hover:bg-slate-600 text-slate-300" title="Zoom Out">
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-mono w-12 text-center text-slate-400 select-none">{Math.round(scale * 100)}%</span>
                            <button onClick={handleZoomIn} className="p-2 rounded-md hover:bg-slate-600 text-slate-300" title="Zoom In">
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            <button onClick={handleFullScreen} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white hidden sm:block" title="Fullscreen">
                                <Maximize2 className="w-5 h-5" />
                            </button>
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

                {/* Content Area - Scrollable */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 bg-slate-900/50 relative overflow-auto flex justify-center p-4 md:p-8 custom-scrollbar"
                >
                    <div
                        ref={contentContainerRef}
                        className="relative shadow-2xl transition-all duration-200 origin-top"
                        style={{
                            width: `${scale * 100}%`,
                            minHeight: '100%',
                        }}
                    >
                        {/* Canvas Overlay - Sits on top of the iframe container */}
                        {isDrawingMode && (
                            <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="absolute inset-0 z-20 cursor-crosshair touch-none pointer-events-auto"
                            // Width and Height are set by the layout effect to match client dims
                            />
                        )}

                        {/* PDF Iframe */}
                        <div className="w-full h-[150vh] bg-white rounded-lg overflow-hidden relative">
                            <iframe
                                // Strip query params if they cause 404s, but keep #toolbar for browser-native viewer
                                src={url ? `${url}#toolbar=0&navpanes=0&scrollbar=0` : ''}
                                className="w-full h-full block"
                                title="PDF Viewer"
                                style={{ pointerEvents: isDrawingMode ? 'none' : 'auto' }}
                                onError={(e) => console.error("Iframe load error", e)}
                            >
                            </iframe>

                            {/* Fallback Overlay (shown if iframe is blocked or fails) */}
                            <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-slate-50 text-slate-500 p-8 text-center">
                                <FileText className="w-16 h-16 mb-4 opacity-20" />
                                <p className="mb-4 font-medium">If the document doesn't load, use the buttons below.</p>
                                <div className="flex gap-4">
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" className="bg-white">
                                            <ExternalLink className="w-4 h-4 mr-2" /> Open in New Tab
                                        </Button>
                                    </a>
                                    <a href={url} download>
                                        <Button>
                                            <Download className="w-4 h-4 mr-2" /> Download PDF
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isDrawingMode && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur text-white px-6 py-2 rounded-full text-xs font-bold pointer-events-none z-50 border border-white/10 shadow-xl flex items-center gap-2">
                            <PenTool className="w-3 h-3 text-indigo-400" />
                            Drawing Mode Active
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PDFViewer;
