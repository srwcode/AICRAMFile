import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const AboutUs = () => {
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

          <h1 className="text-3xl font-bold text-white mb-8">About Us</h1>

          <div className="bg-gray-800 rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Our Mission</h2>
              <p className="text-gray-400">
                At AI-CRAM (AI-Powered Cyber Risk Assessment and Mitigation), our mission is to empower businesses to proactively identify, evaluate, and mitigate cyber threats using the power of artificial intelligence. In a world where digital risks evolve faster than ever, we’re committed to providing cutting-edge tools that make cybersecurity scalable, smart, and stress-free.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">What We Do</h2>
              <p className="text-gray-400 mb-3">
                AI-CRAM delivers intelligent cyber risk assessments tailored to your infrastructure, helping you pinpoint vulnerabilities, simulate threat scenarios, and implement robust mitigation strategies. Our platform leverages machine learning and advanced analytics to ensure continuous protection and risk awareness in real-time.
              </p>
              <p className="text-gray-400">
                From startups to enterprises, AI-CRAM adapts to your security needs, simplifying compliance easier and peace of mind attainable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Why AI-CRAM?</h2>
              <ul className="list-disc pl-8 text-gray-400 space-y-2">
                <li>AI-driven threat modeling and real-time risk scoring</li>
                <li>Automated risk reports aligned with industry frameworks</li>
                <li>Custom mitigation planning tailored to your systems</li>
                <li>Seamless integration with existing tools and workflows</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Our Vision</h2>
              <p className="text-gray-400">
                We envision a future where cyber resilience is embedded in every organization’s DNA—where AI and automation work hand-in-hand with human decision-making to prevent breaches before they happen. At AI-CRAM, we’re not just reacting to threats. We’re staying ten steps ahead.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Meet the Team</h2>
              <p className="text-gray-400">
                Our team is made up of cybersecurity experts, AI researchers, software engineers, and risk analysts who are passionate about building secure digital environments. With decades of combined experience, we bring both technical depth and a relentless focus on user-centric solutions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Let’s Build a Safer Future</h2>
              <p className="text-gray-400">
                Whether you're looking to assess your current risk landscape or implement a full-scale mitigation plan, AI-CRAM is here to help. Get in touch with us and join the movement toward smarter, safer digital operations.
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

export default AboutUs;