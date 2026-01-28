import React, { useState } from 'react';
import { Award, Trophy, Star } from 'lucide-react';
import { TESTIMONIALS } from '../constants';

const Results: React.FC = () => {
  // Mock data for results
  const topRankers = [
    { name: "Aman Sinha", rank: "AIR 91", exam: "JEE Advanced 2024", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" },
    { name: "Sneha Gupta", rank: "AIR 45", exam: "NEET 2024", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" },
    { name: "Rahul Verma", rank: "AIR 120", exam: "JEE Advanced 2024", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" },
    { name: "Priya Singh", rank: "AIR 15", exam: "NEET 2024", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" },
    { name: "Arjun Reddy", rank: "AIR 230", exam: "JEE Main 2024", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" },
    { name: "Kavya Patel", rank: "AIR 88", exam: "NEET 2024", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Hall of Fame</span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">Our Top <span className="text-ocean-600">Achievers</span></h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Celebrating the determination and success of our students who have proved their mettle in the toughest examinations.
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
           <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 rounded-2xl p-8 text-white text-center shadow-lg">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
              <div className="text-5xl font-bold mb-2">1200+</div>
              <div className="text-ocean-100 font-medium">Selections in JEE Main 2024</div>
           </div>
           <div className="bg-gradient-to-br from-ocean-500 to-ocean-700 rounded-2xl p-8 text-white text-center shadow-lg">
              <Award className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
              <div className="text-5xl font-bold mb-2">450+</div>
              <div className="text-ocean-100 font-medium">Selections in JEE Advanced 2024</div>
           </div>
           <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-8 text-white text-center shadow-lg">
              <Star className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
              <div className="text-5xl font-bold mb-2">850+</div>
              <div className="text-teal-100 font-medium">Selections in NEET 2024</div>
           </div>
        </div>

        {/* Rankers Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
           <div className="w-1 h-6 bg-ocean-600 rounded-full"></div> 2024 Toppers
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {topRankers.map((student, idx) => (
            <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
               <div className="h-48 overflow-hidden bg-gray-200 relative">
                  <img src={student.image} alt={student.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                     {student.exam}
                  </div>
               </div>
               <div className="p-4 text-center">
                  <h3 className="font-bold text-lg text-gray-900">{student.name}</h3>
                  <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-extrabold">
                     {student.rank}
                  </div>
               </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Results;