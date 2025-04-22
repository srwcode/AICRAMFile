import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Phone, Mail, MapPin, Info } from 'lucide-react';

const ContactUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-gray-900 backdrop-blur-md z-50 border-boxdark">
        <div className="max-w-6xl mx-auto flex items-center justify-center py-4 px-4">
          <Link to="/">
            <div className="font-mono tracking-tight flex items-center scale-75">
              <span className="flex items-center gap-2 font-extrabold text-white text-4xl">AI<span className="text-gray-400"> | </span>CR</span>
              <ShieldCheck strokeWidth={3} size={34} className="text-white mb-0.5 ml-0.5"/>
              <span className="font-extrabold text-white text-4xl">M</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-grow bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-400 mb-8 hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>

          <h1 className="text-3xl font-bold text-white mb-8">Contact Us</h1>

          <div className="bg-gray-800 rounded-lg shadow-sm p-8 space-y-10">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                <Mail className="mr-2 h-5 w-5 text-gray-400" />
                Email Us
              </h2>
              <p className="text-gray-400">
                Reach out anytime at <a href="mailto:contact@ai-cram.com" className="underline">contact@ai-cram.com</a><br />
                Our team usually responds within 1 business day.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                <Phone className="mr-2 h-5 w-5 text-gray-400" />
                Call Us
              </h2>
              <p className="text-gray-400">
                Customer Support: <a href="tel:+18005551234" className="underline">+66 92-627-4175</a><br />
                Available Monday to Friday, 9 AM – 6 PM (ICT)
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-gray-400" />
                Visit Us
              </h2>
              <p className="text-gray-400">
                126 Pracha Uthit Rd<br />
                Bang Mot, Thung Khru<br />
                Bangkok 10140<br />
                Thailand
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                <Info className="mr-2 h-5 w-5 text-gray-400" />
                Other Inquiries
              </h2>
              <p className="text-gray-400">
                For partnership opportunities, press inquiries, or enterprise solutions, please reach out to our business team at <a href="mailto:biz@ai-cram.com" className="underline">biz@ai-cram.com</a>.
              </p>
            </section>

            <div className="text-gray-400 pt-6 border-t border-gray-700">
              <p>Last updated: April 14, 2025</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;