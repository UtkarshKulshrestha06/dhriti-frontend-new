import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Award, Users, MapPin, Download, 
  MessageCircle, Shield, CheckCircle2, Apple, Play,
  ChevronLeft, ShoppingCart, MousePointer2, Bell, Zap, Brain, ArrowRight
} from 'lucide-react';
import Button from '../components/Button';
import CourseCard from '../components/CourseCard';
import TestimonialCard from '../components/TestimonialCard';
import { TESTIMONIALS, COURSES, ANNOUNCEMENTS } from '../constants';
import { CourseCategory } from '../types';

const Home: React.FC = () => {
  const [activeCourseTab, setActiveCourseTab] = useState<CourseCategory>(CourseCategory.JEE);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const displayCourses = COURSES.filter(c => c.category === activeCourseTab).slice(0, 3);

  const slides = [
    {
      id: 1,
      path: '/courses',
      bg: 'bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-100',
      content: (
        <div className="w-full h-full flex items-center relative px-6 md:px-12 lg:px-16">
          <div className="z-10 w-full md:w-3/5 space-y-2 md:space-y-4">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
              NEET Home Test Series
            </h2>
            <div className="inline-block bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm md:text-lg font-bold transform -skew-x-6 shadow-md">
              Turn your home into a real NEET battlefield
            </div>
            <p className="text-gray-700 text-sm md:text-lg font-medium pt-3 max-w-xl">
              India's Most Trusted Test Series for <span className="font-bold text-black">Class 11th, 12th & 12th Pass</span> Students.
            </p>
          </div>
          <div className="absolute right-4 md:right-8 bottom-0 h-[85%] md:h-[95%] w-1/2 flex items-end justify-end pointer-events-none">
             <img 
               src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
               alt="Student" 
               className="object-contain h-full drop-shadow-2xl" 
             />
          </div>
        </div>
      )
    },
    {
      id: 2,
      path: '/',
      bg: 'bg-gradient-to-r from-blue-50 to-indigo-100',
      content: (
        <div className="w-full h-full flex items-center relative px-6 md:px-12 lg:px-16">
          <div className="z-10 w-full md:w-3/5 space-y-4">
             <span className="text-ocean-600 font-bold tracking-widest text-xs md:text-xs uppercase bg-white/50 px-3 py-1 rounded-full">Admissions Open</span>
             <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
               <span className="text-ocean-600">Oceanic Prime</span><br/>JEE Advanced 2026
             </h2>
             <p className="text-gray-600 text-sm md:text-lg max-w-xl">
               Comprehensive 2-year classroom program. Learn from the architects of top ranks.
             </p>
          </div>
          <div className="absolute right-0 bottom-0 h-full w-1/2 flex items-end justify-center pointer-events-none opacity-90">
             <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="JEE Aspirant" 
                className="object-contain h-[90%] drop-shadow-xl"
             />
          </div>
        </div>
      )
    },
    {
      id: 3,
      path: '/resources',
      bg: 'bg-gradient-to-r from-emerald-50 to-teal-100',
      content: (
        <div className="w-full h-full flex items-center relative px-6 md:px-12 lg:px-16">
          <div className="z-10 w-full md:w-3/5 space-y-4">
             <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">FREE RESOURCES</span>
             </div>
             <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
               Download Previous<br/>Year Papers
             </h2>
             <p className="text-gray-700 text-sm md:text-lg max-w-xl">
               Access 10+ years of JEE & NEET question papers with detailed solutions for free.
             </p>
          </div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-1/3 hidden md:block pointer-events-none">
              <div className="bg-white p-6 rounded-2xl shadow-2xl transform rotate-3 border border-gray-100 scale-100">
                 <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
                 <div className="space-y-3">
                    <div className="h-2 w-full bg-gray-100 rounded"></div>
                    <div className="h-2 w-full bg-gray-100 rounded"></div>
                    <div className="h-2 w-full bg-gray-100 rounded"></div>
                 </div>
              </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      path: '/contact',
      bg: 'bg-gradient-to-r from-slate-800 to-slate-900',
      content: (
        <div className="w-full h-full flex items-center relative px-6 md:px-12 lg:px-16">
          <div className="z-10 w-full md:w-3/5 space-y-4">
             <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
               Expert Guidance for<br/><span className="text-ocean-400">Your Future</span>
             </h2>
             <p className="text-gray-300 text-sm md:text-lg max-w-xl">
               Visit our centers or book an online counseling session today.
             </p>
          </div>
           <div className="absolute right-0 bottom-0 h-full w-1/2 flex items-end justify-center pointer-events-none">
             <img 
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Counseling" 
                className="object-cover h-full w-full opacity-50 mask-image-l"
                style={{ maskImage: 'linear-gradient(to right, transparent, black 50%)' }}
             />
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const whyChooseUsData = [
    { title: "Complete Care & Safety", desc: "Safety first campus", icon: Shield, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Regular Updates", desc: "SMS/App alerts to parents", icon: MessageCircle, color: "text-green-600", bg: "bg-green-100" },
    { title: "Test Series", desc: "Weekly rigorous testing", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Expert Faculty", desc: "IITian & Medico mentors", icon: Users, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Personal Mentorship", desc: "1-on-1 guidance sessions", icon: Brain, color: "text-pink-600", bg: "bg-pink-100" },
    { title: "Doubt Solving", desc: "Instant doubt resolution", icon: Zap, color: "text-yellow-600", bg: "bg-yellow-100" }
  ];

  // Split announcements
  const midPoint = Math.ceil(ANNOUNCEMENTS.length / 2);
  const row1 = ANNOUNCEMENTS.slice(0, midPoint);
  const row2 = ANNOUNCEMENTS.slice(midPoint);

  return (
    <div className="flex flex-col min-h-screen font-sans">
      
      {/* 1. Hero Banner */}
      <section className="pt-2 pb-2 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="relative w-full aspect-[2.75/1] rounded-2xl overflow-hidden shadow-lg cursor-pointer group border border-gray-100"
            onClick={() => navigate(slides[currentSlide].path)}
          >
            <div className="relative w-full h-full">
              {slides.map((slide, index) => (
                <div 
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  } ${slide.bg}`}
                >
                  {slide.content}
                </div>
              ))}
            </div>

            <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/60 hover:bg-white/90 p-2 md:p-3 rounded-full text-slate-900 opacity-0 group-hover:opacity-100 shadow-md transition-all"><ChevronLeft className="w-6 h-6 md:w-8 md:h-8" /></button>
            <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/60 hover:bg-white/90 p-2 md:p-3 rounded-full text-slate-900 opacity-0 group-hover:opacity-100 shadow-md transition-all"><ChevronRight className="w-6 h-6 md:w-8 md:h-8" /></button>
          </div>
          <div className="flex justify-center gap-2 mt-3">
            {slides.map((_, index) => (
              <button key={index} onClick={() => goToSlide(index)} className={`h-2 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-slate-800' : 'w-2 bg-gray-300'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Announcements */}
      <section className="bg-ocean-50 border-y border-ocean-100 py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6">
          <div className="flex items-center gap-2 text-ocean-900 font-black text-lg whitespace-nowrap">
            <Bell className="w-5 h-5 fill-ocean-600 text-ocean-600" /> <span>LATEST NEWS</span>
          </div>
          <div className="flex-1 flex flex-col gap-1 relative h-16 justify-center">
             {/* Row 1 */}
             <div className="overflow-hidden w-full">
               <div className="animate-marquee whitespace-nowrap flex gap-12">
                 {[...row1, ...row1, ...row1].map((item, idx) => (
                   <span key={`r1-${idx}`} className="text-base font-bold text-slate-700 hover:text-ocean-700 hover:underline cursor-pointer flex items-center gap-3 transition-colors">
                      {item.isNew && <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm animate-pulse">NEW</span>}
                      {item.text}
                   </span>
                 ))}
               </div>
             </div>
             {/* Row 2 */}
             <div className="overflow-hidden w-full">
               <div className="animate-marquee-reverse whitespace-nowrap flex gap-12">
                 {[...row2, ...row2, ...row2].map((item, idx) => (
                   <span key={`r2-${idx}`} className="text-base font-bold text-slate-700 hover:text-ocean-700 hover:underline cursor-pointer flex items-center gap-3 transition-colors">
                      {item.isNew && <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm animate-pulse">NEW</span>}
                      {item.text}
                   </span>
                 ))}
               </div>
             </div>
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
           @keyframes marquee-reverse {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
          .animate-marquee-reverse {
            animation: marquee-reverse 45s linear infinite;
          }
          .animate-marquee:hover, .animate-marquee-reverse:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* 3. Our Courses */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
             <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">Our <span className="text-ocean-600">Courses</span></h2>
             <p className="text-lg text-gray-500 font-medium">Targeted programs for JEE, NEET & Foundation</p>
          </div>
          
          <div className="flex justify-center mb-10">
             <div className="bg-gray-100 p-2 rounded-full inline-flex shadow-inner">
                {[CourseCategory.JEE, CourseCategory.NEET, CourseCategory.FOUNDATION].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCourseTab(tab)}
                    className={`px-6 py-2 rounded-full text-base font-bold transition-all ${
                      activeCourseTab === tab ? 'bg-ocean-900 text-white shadow-lg scale-105' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {displayCourses.map((course) => (
              <div key={course.id} className="h-[420px]">
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Why Choose <span className="text-ocean-600">Dhriti?</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUsData.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 flex items-start gap-4 hover:-translate-y-2 transition-transform duration-300">
                <div className={`${item.bg} p-3 rounded-2xl flex-shrink-0`}>
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-base text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Results */}
      <section className="py-20 bg-white text-center">
         <div className="max-w-5xl mx-auto px-4">
            <Award className="w-14 h-14 text-yellow-500 mx-auto mb-5" />
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5">Unmatched <span className="text-ocean-600">Results</span></h2>
            <p className="text-gray-600 text-xl font-medium mb-10 max-w-3xl mx-auto">
              Year after year, Dhriti Classes produces top rankers in JEE & NEET. Our consistency speaks for itself.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-8 mb-12">
               <div className="bg-ocean-50 p-5 rounded-2xl">
                  <p className="text-5xl font-black text-ocean-700">650+</p>
                  <p className="text-lg text-gray-600 font-bold uppercase tracking-wider mt-2">IIT Selections</p>
               </div>
               <div className="bg-ocean-50 p-5 rounded-2xl">
                  <p className="text-5xl font-black text-ocean-700">1200+</p>
                  <p className="text-lg text-gray-600 font-bold uppercase tracking-wider mt-2">Medical Seats</p>
               </div>
            </div>
            <Link to="/results">
              <Button size="lg" className="rounded-full px-10 py-3 text-lg shadow-2xl shadow-ocean-200 hover:scale-105 transition-transform">
                 View All Results <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
         </div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Student <span className="text-ocean-600">Stories</span></h2>
            <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">Hear from our toppers who turned their dreams into reality with Dhriti.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>

          {/* Visual Pagination Dots */}
          <div className="flex justify-center gap-3">
             {[...Array(9)].map((_, i) => (
               <div 
                 key={i} 
                 className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${i === 4 ? 'bg-black scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
               ></div>
             ))}
          </div>
        </div>
      </section>

      {/* 7. Contact CTA */}
      <section className="py-20 bg-white">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Ready to start your journey?</h2>
            <p className="text-lg text-gray-600 mb-10 font-medium">
              Join the league of toppers. Visit our nearest center or contact us for admissions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/contact">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-3">Contact Us</Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white text-lg px-8 py-3">Locate Center</Button>
            </div>
         </div>
      </section>

    </div>
  );
};

export default Home;