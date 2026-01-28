
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Map, CheckCircle2, X, Loader2 } from 'lucide-react';
import Button from '../components/Button';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    course: 'JEE'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // -------------------------------------------------------------------------
    // NOTE: In a real production environment without a backend, 
    // you would use a service like EmailJS here.
    //
    // Example logic for EmailJS:
    // await emailjs.send('service_id', 'template_id', formState, 'public_key');
    // -------------------------------------------------------------------------

    // Simulating an API call/Email sending process
    setTimeout(() => {
      console.log("--- Email Data Sent to Institute ---");
      console.table(formState); // This shows the data in the browser console
      
      setIsSubmitting(false);
      setShowModal(true);
      setFormState({ name: '', email: '', phone: '', message: '', course: 'JEE' });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };

  interface ContactItem {
    icon: React.ElementType;
    title: string;
    value: string;
    sub: string;
    bg: string;
    color: string;
    action?: {
      label: string;
      href: string;
      mobileOnly?: boolean;
    };
  }

  const contactInfo: ContactItem[] = [
    { 
      icon: Phone, 
      title: "Call Us", 
      value: "+91 98765 43210", 
      sub: "Mon-Sat 9am to 7pm",
      bg: "bg-blue-100", 
      color: "text-blue-600",
      action: {
        label: "Call Now",
        href: "tel:+919876543210",
        mobileOnly: true // Only visible on mobile
      }
    },
    { 
      icon: Mail, 
      title: "Email Us", 
      value: "admissions@oceanic.edu", 
      sub: "We reply within 24 hours",
      bg: "bg-orange-100", 
      color: "text-orange-600",
      action: {
        label: "Open Gmail",
        // Direct link to Gmail compose window
        href: "https://mail.google.com/mail/?view=cm&fs=1&to=admissions@oceanic.edu",
        mobileOnly: false
      }
    },
    { 
      icon: MapPin, 
      title: "Visit Campus", 
      value: "123 Knowledge Park", 
      sub: "Mathura, Uttar Pradesh",
      bg: "bg-purple-100", 
      color: "text-purple-600" 
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. Header with Blobs */}
      <div className="relative pt-16 pb-24 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
        {/* Blobs */}
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <span className="bg-white/80 backdrop-blur border border-white/50 text-ocean-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
            We'd love to hear from you
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-6 mb-4">
            Get In <span className="text-ocean-600">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Have questions about admissions, courses, or fees? Fill out the form or reach out directly.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Contact Form Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-12 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-ocean-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <MessageCircle className="w-6 h-6 mr-3 text-ocean-600" /> Send a Message
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Student Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formState.name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formState.phone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                      placeholder="+91 98765..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formState.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Interested In</label>
                    <div className="relative">
                      <select 
                        name="course"
                        value={formState.course}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-all font-medium appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <option value="JEE">JEE (Mains + Advanced)</option>
                        <option value="NEET">NEET (Medical)</option>
                        <option value="Foundation">Foundation (Class 9-10)</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Message (Optional)</label>
                  <textarea 
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    rows={4}
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-all resize-none font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    placeholder="Tell us about your current grade and goals..."
                  ></textarea>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl text-lg shadow-lg shadow-ocean-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      Send Message <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* RIGHT: Map & Contact Info */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Google Maps Card - Bigger & Top */}
            <div className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-200 h-96 shadow-md relative group order-1">
               <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113583.9961726006!2d77.59607865768512!3d27.488349942971212!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3973711667d4d3d3%3A0x2863a3d201211756!2sMathura%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1716900000000!5m2!1sen!2sin"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Campus Location"
               ></iframe>
               <a 
                 href="https://maps.app.goo.gl/MzuyV1JmGbyZvrpM6" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-white hover:text-ocean-600 transition-all flex items-center gap-2"
               >
                 <Map className="w-4 h-4" /> Open in Google Maps
               </a>
            </div>

            {/* Contact Info Cards - Smaller & Bottom */}
            <div className="order-2 space-y-4">
              {contactInfo.map((info, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 hover:-translate-y-1 transition-transform">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${info.bg}`}>
                      <info.icon className={`w-6 h-6 ${info.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{info.title}</p>
                      <p className="text-base font-bold text-slate-900 leading-tight">{info.value}</p>
                      <p className="text-[10px] font-medium text-gray-500 mt-0.5">{info.sub}</p>
                    </div>
                  </div>
                  
                  {info.action && (
                    <div className={`mt-0 ${info.action.mobileOnly ? 'block md:hidden' : 'block'}`}>
                      <a 
                        href={info.action.href} 
                        className="block"
                        target={info.action.href.startsWith('http') ? '_blank' : undefined}
                        rel={info.action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        <Button variant="outline" size="sm" className="w-full justify-center rounded-lg py-2 text-xs border-gray-200 bg-gray-50 hover:border-ocean-300 hover:bg-ocean-50">
                          {info.action.label}
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Enquiry Sent!</h3>
            <p className="text-gray-600 mb-6 font-medium leading-relaxed">
              Message sent for enquiry, we will contact you within 24 hrs.
            </p>
            
            <Button onClick={() => setShowModal(false)} className="w-full rounded-xl py-3">
              Okay, Got it
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Contact;
