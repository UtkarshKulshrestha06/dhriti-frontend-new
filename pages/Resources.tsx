
import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, Play, Youtube, Calendar, Search, ListVideo, X, Info, ExternalLink, Loader2 } from 'lucide-react';
import { VIDEOS, YOUTUBE_CONFIG } from '../constants';
import Button from '../components/Button';
import { Video, Resource } from '../types';
import { api } from '../services/api';

const Resources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('All');
  const [resources, setResources] = useState<Resource[]>([]);
  const [viewedResources, setViewedResources] = useState<Set<string>>(new Set());

  // State to hold videos - initializes with static data, updates with API data if successful
  const [videos, setVideos] = useState<Video[]>(VIDEOS);
  const [currentVideo, setCurrentVideo] = useState<Video>(VIDEOS[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isResourcesLoading, setIsResourcesLoading] = useState(true);

  const videoSectionRef = useRef<HTMLDivElement>(null);
  const pdfSectionRef = useRef<HTMLDivElement>(null);

  // Helper to parse YouTube ISO 8601 duration (e.g., PT1H2M10S)
  const parseDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return { text: '', seconds: 0 };

    const hours = (parseInt(match[1] || '0'));
    const minutes = (parseInt(match[2] || '0'));
    const seconds = (parseInt(match[3] || '0'));

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    let text = '';
    if (hours > 0) {
      text = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      text = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return { text, seconds: totalSeconds };
  };

  // FETCH VIDEOS FROM API
  useEffect(() => {
    const fetchVideos = async () => {
      // Check the toggle AND the key. If USE_API is false, we keep the initial state (Preset VIDEOS)
      if (!YOUTUBE_CONFIG.USE_API || !YOUTUBE_CONFIG.API_KEY) {
        return;
      }

      setIsLoading(true);
      try {
        // Step 1: Search for latest videos (fetch extra to account for Shorts filtering)
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_CONFIG.API_KEY}&channelId=${YOUTUBE_CONFIG.CHANNEL_ID}&part=snippet,id&order=date&maxResults=15&type=video`
        );

        if (!searchResponse.ok) {
          throw new Error('API Request Failed');
        }

        const searchData = await searchResponse.json();

        if (searchData.items && searchData.items.length > 0) {
          const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

          // Step 2: Fetch content details to check duration and filter Shorts
          const detailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_CONFIG.API_KEY}&id=${videoIds}&part=snippet,contentDetails`
          );

          if (!detailsResponse.ok) {
            throw new Error('Details Request Failed');
          }

          const detailsData = await detailsResponse.json();

          const apiVideos: Video[] = detailsData.items
            .map((item: any) => {
              const { text, seconds } = parseDuration(item.contentDetails.duration);
              return {
                id: item.id,
                title: item.snippet.title,
                videoId: item.id,
                thumbnail: item.snippet.thumbnails.medium.url,
                channelName: item.snippet.channelTitle,
                duration: text,
                seconds: seconds // internal property for filtering
              };
            })
            // Filter out videos that are likely Shorts (60 seconds or less)
            .filter((v: any) => v.seconds > 60);

          // Take top 6 long-form videos
          const finalVideos = apiVideos.slice(0, 6);

          if (finalVideos.length > 0) {
            setVideos(finalVideos);
            setCurrentVideo(finalVideos[0]);
            setCurrentIndex(0);
          }
        }
      } catch (err) {
        console.warn("YouTube API Fetch failed, using static fallback.", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchResources = async () => {
      setIsResourcesLoading(true);
      try {
        const data = await api.freebies.list();
        const normalized = (data || []).map((r: any) => ({
          ...r,
          subject: r.subject || 'All',
          date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent',
          size: r.file_size ? (r.file_size / (1024 * 1024)).toFixed(1) + ' MB' : '1.2 MB'
        }));
        setResources(normalized);
      } catch (e) {
        console.error("Failed to fetch resources", e);
      } finally {
        setIsResourcesLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('viewed_public_res');
    if (stored) setViewedResources(new Set(JSON.parse(stored)));
  }, []);

  const handleDownload = (id: string, url?: string) => {
    if (!url) return;
    const newSet = new Set(viewedResources);
    newSet.add(id);
    setViewedResources(newSet);
    localStorage.setItem('viewed_public_res', JSON.stringify(Array.from(newSet)));
    window.open(url, '_blank');
  };

  const filteredResources = activeTab === 'All'
    ? resources
    : resources.filter(r => r.subject.toLowerCase() === activeTab.toLowerCase());

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVideoChange = (video: Video, index: number) => {
    setCurrentVideo(video);
    setCurrentIndex(index);
  };

  const getEmbedUrl = (videoId: string) => {
    const origin = window.location.origin;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&origin=${origin}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <div className="bg-gradient-to-br from-ocean-50 to-white py-16 border-b border-ocean-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-ocean-600 uppercase bg-white rounded-full shadow-sm border border-ocean-100">
            Free Knowledge Hub
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            Resource <span className="text-ocean-600">Library</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium mb-8">
            Comprehensive video lectures and study materials to supplement your preparation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => scrollToSection(videoSectionRef)}
              className="w-full sm:w-auto text-base px-6 py-3 rounded-xl shadow-lg shadow-ocean-200 flex items-center justify-center"
            >
              <Youtube className="w-5 h-5 mr-2" /> Watch Lectures
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollToSection(pdfSectionRef)}
              className="w-full sm:w-auto text-base px-6 py-3 rounded-xl bg-white flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" /> Download PDFs
            </Button>
          </div>
        </div>
      </div>

      {/* 2. YouTube Section - Light Theme & Clean UI */}
      <div ref={videoSectionRef} className="py-12 bg-white scroll-mt-16 text-slate-900 border-b border-gray-100">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                <span className="bg-red-600 p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-red-200">
                  <Youtube className="w-5 h-5 fill-white text-white" />
                </span>
                Latest from Dhriti Classes
              </h2>
              {isLoading && <p className="text-gray-500 text-sm mt-1 ml-1 flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Updating list...</p>}
            </div>

            <a
              href="https://www.youtube.com/@DhritiClassesrs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto"
            >
              <button className="w-full md:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide shadow-md hover:shadow-lg">
                <ExternalLink className="w-4 h-4" /> Visit Channel
              </button>
            </a>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">

            {/* Player Container (Left) */}
            <div className="xl:flex-[2.5] flex flex-col">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-gray-200 bg-black border border-gray-100">
                <iframe
                  key={currentVideo.id}
                  width="100%"
                  height="100%"
                  src={getEmbedUrl(currentVideo.videoId)}
                  title={currentVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0"
                ></iframe>
              </div>

              <div className="mt-6">
                <h3 className="text-2xl font-bold leading-tight text-slate-900 mb-2">{currentVideo.title}</h3>
                {/* Removed Channel Icon, Name and Subscribe button as requested for a cleaner look */}
              </div>
            </div>

            {/* Playlist Queue (Right) - Light Theme */}
            <div className="xl:flex-1 xl:max-w-[450px] flex flex-col bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden h-[600px] xl:h-[calc(56.25vw*0.45)] xl:min-h-[500px] shadow-inner">

              {/* Playlist Header */}
              <div className="p-4 bg-white border-b border-gray-200">
                <h3 className="text-slate-800 font-bold text-lg leading-snug mb-1">Up Next</h3>
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">Playing: {currentIndex + 1} / {videos.length}</span>
                  <ListVideo className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 p-2">
                {videos.map((video, index) => {
                  const isActive = currentVideo.id === video.id;
                  return (
                    <div
                      key={video.id}
                      onClick={() => handleVideoChange(video, index)}
                      className={`flex gap-3 p-3 cursor-pointer group transition-all duration-200 mb-2 rounded-xl border ${isActive
                        ? 'bg-white border-ocean-200 shadow-sm'
                        : 'hover:bg-white border-transparent hover:border-gray-200 hover:shadow-sm'
                        }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 shadow-sm">
                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                        {video.duration && (
                          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1 rounded-[4px] backdrop-blur-sm">
                            {video.duration}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className={`text-sm font-bold line-clamp-2 leading-snug mb-1 ${isActive ? 'text-ocean-700' : 'text-slate-800'}`}>
                          {video.title}
                        </h4>
                        {/* Simple index indicator instead of channel name */}
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Video {index + 1}
                        </p>
                      </div>

                      {isActive && (
                        <div className="flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-ocean-500"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. PDFs Section */}
      <div ref={pdfSectionRef} className="py-20 bg-gray-50 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-ocean-600" />
              Study Materials (PDFs)
            </h2>
            <p className="text-gray-600">Download high-quality notes, formula sheets, and past year papers.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'].map((subject) => (
              <button
                key={subject}
                onClick={() => setActiveTab(subject as any)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === subject
                  ? 'bg-slate-900 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {subject}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-ocean-200 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${resource.subject === 'Physics' ? 'bg-purple-100 text-purple-700' :
                        resource.subject === 'Chemistry' ? 'bg-orange-100 text-orange-700' :
                          resource.subject === 'Mathematics' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                        {resource.subject}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-ocean-600 transition-colors flex items-center gap-2">
                        {resource.title}
                        {(resource.isNew || resource.is_new) && !viewedResources.has(resource.id) && (
                          <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse">NEW</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {resource.date}</span>
                        <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {resource.size}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(resource.id, resource.file_url)}
                    className="text-gray-400 hover:text-ocean-600 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">No resources found for this category.</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Resources;
