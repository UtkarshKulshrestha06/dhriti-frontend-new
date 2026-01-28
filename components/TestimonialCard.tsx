import React from 'react';
import { Testimonial } from '../types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between group">
      <div className="mb-8">
        <p className="text-gray-600 leading-relaxed text-lg font-medium">
          {testimonial.quote}
        </p>
      </div>
      
      <div className="flex items-end justify-between mt-auto">
        <div className="relative">
           <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-red-600 p-1 bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
             <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover rounded-full" />
           </div>
        </div>
        
        <div className="text-right">
          <h4 className="text-xl font-bold text-gray-900">{testimonial.name}</h4>
          <p className="text-gray-500 font-semibold text-sm mt-1">{testimonial.exam} <span className="text-gray-400">|</span> <span className="text-ocean-600 font-bold">{testimonial.rank}</span></p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;