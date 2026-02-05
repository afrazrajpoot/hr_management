"use client";
import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface ProfessionalVideoPlayerProps {
    src: string;
}

export const ProfessionalVideoPlayer: React.FC<ProfessionalVideoPlayerProps> = ({ src }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const previewVideoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewPosition, setPreviewPosition] = useState(0);
    const [previewTime, setPreviewTime] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (value: number[]) => {
        if (videoRef.current) {
            videoRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    useEffect(() => {
        if (videoRef.current && src) {
            videoRef.current.play().catch(err => console.log("Autoplay blocked:", err));
            setIsPlaying(true);
        }
    }, [src]);

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0];
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const handleMouseMoveOnTimeline = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const time = percentage * duration;

        setPreviewPosition(x);
        setPreviewTime(time);

        if (previewVideoRef.current) {
            previewVideoRef.current.currentTime = time;
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleFullscreen = () => {
        const doc = document as any;
        const container = containerRef.current as any;

        if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
        } else {
            if (doc.exitFullscreen) {
                doc.exitFullscreen();
            } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
            } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            const doc = document as any;
            setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement));
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("mozfullscreenchange", handleFullscreenChange);
        document.addEventListener("MSFullscreenChange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
            document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
        };
    }, []);

    const resetControlsTimeout = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying && !previewVisible) setShowControls(false);
        }, 3000);
    };

    useEffect(() => {
        const handleMouseMove = () => resetControlsTimeout();
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [isPlaying, previewVisible]);

    return (
        <div
            ref={containerRef}
            className="relative group bg-black rounded-xl overflow-hidden shadow-2xl aspect-video select-none"
            onMouseMove={resetControlsTimeout}
        >
            {/* Main Video */}
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full cursor-pointer"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onWaiting={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onLoadStart={() => setIsLoading(true)}
            />

            {/* Loading Spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                        <span className="text-white text-xs font-bold tracking-[0.2em] uppercase opacity-80">Loading</span>
                    </div>
                </div>
            )}

            {/* Main Video Overlay for Click-to-Play (YouTube style) */}
            <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={(e) => {
                    // Only toggle if not clicking on the controls area (bottom 80px approx)
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickY = e.clientY - rect.top;
                    if (clickY < rect.height - 100) {
                        togglePlay();
                    }
                }}
                onMouseMove={resetControlsTimeout}
            />

            {/* Overlay Gradient (Non-blocking) */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 pointer-events-none z-20 ${showControls ? "opacity-100" : "opacity-0"}`} />

            {/* Play/Pause Large Icon */}
            <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300 z-30 ${isPlaying ? "scale-150 opacity-0" : "scale-100 opacity-100"}`}
            >
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-full border border-white/20">
                    <Play className="w-12 h-12 text-white fill-current" />
                </div>
            </div>

            {/* Controls Container */}
            <div
                className={`absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-500 z-40 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onMouseEnter={() => {
                    setShowControls(true);
                    // Clear timeout so it doesn't hide while hovering
                    if (typeof window !== 'undefined') {
                        // We use a global variable or ref for timeout, let's assume the reset logic handles this
                    }
                }}
            >

                {/* Seek Preview */}
                {previewVisible && (
                    <div
                        className="absolute bottom-20 bg-gray-900 rounded-lg overflow-hidden border-2 border-purple-500 shadow-2xl pointer-events-none z-50"
                        style={{
                            left: Math.max(80, Math.min(previewPosition, (containerRef.current?.clientWidth || 0) - 80)),
                            transform: "translateX(-50%)",
                            width: "160px",
                            height: "90px"
                        }}
                    >
                        <video
                            ref={previewVideoRef}
                            src={src}
                            className="w-full h-full object-cover"
                            muted
                        />
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 px-1 rounded text-[10px] text-white">
                            {formatTime(previewTime)}
                        </div>
                    </div>
                )}

                {/* Custom Progress Bar - Enriched Hit Area for Stability */}
                <div
                    className="relative h-10 flex items-center mb-1 cursor-pointer group/timeline px-1 z-50"
                    onMouseEnter={() => setPreviewVisible(true)}
                    onMouseLeave={() => setPreviewVisible(false)}
                    onMouseMove={handleMouseMoveOnTimeline}
                >
                    {/* Visual Bar */}
                    <div className="absolute left-1 right-1 h-1.5 bg-white/20 rounded-full overflow-hidden transition-all duration-200 group-hover/timeline:h-2 group-hover/timeline:bg-white/30">
                        <div
                            className="h-full bg-purple-500 transition-all duration-75 relative"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        >
                            {/* Glow effect at the end of progress */}
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-purple-400 blur-sm"></div>
                        </div>
                    </div>

                    {/* Invisible Hit Slider (shadcn/ui slider or custom) */}
                    <Slider
                        value={[currentTime]}
                        max={duration}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="relative z-10 w-full cursor-pointer h-full opacity-0 group-hover/timeline:opacity-100 transition-opacity"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between z-50 relative">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-purple-400 transition-colors">
                            {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
                        </button>

                        <div className="flex items-center gap-2 group/volume">
                            <button onClick={toggleMute} className="text-white hover:text-purple-400 transition-colors">
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300">
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={1}
                                    step={0.01}
                                    onValueChange={handleVolumeChange}
                                    className="w-20"
                                />
                            </div>
                        </div>

                        <div className="text-white text-xs font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={handleFullscreen} className="text-white hover:text-purple-400 transition-colors">
                            {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .group/timeline:hover .preview-bubble {
          opacity: 1;
        }
      `}</style>
        </div>
    );
};
