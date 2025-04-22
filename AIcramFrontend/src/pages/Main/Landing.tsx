import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import config from '../../config';
import { ShieldCheck, Sparkle, Zap, Cpu, LineChart, BookCheck, User, ArrowRight, AlertTriangle, Database, Shield, ChevronDown } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const authToken = localStorage.getItem('token');
    
    if (authToken) {
      fetch(`${config.API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': authToken || ''
        }
      })
        .then((response) => response.json())
        .then((data) => {
          setUserType(data.user_type);
        })
        .catch((error) => {
          console.error('Error fetching user type:', error);
          setUserType(null);
        });
    }
  }, [navigate]);

  const scrollToNextSection = () => {
    const nextSectionElement = document.getElementById('learn-more-section');
    if (nextSectionElement) {
      nextSectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight);
    };
  
    window.addEventListener("scroll", handleScroll);
  
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const features = [
    { 
      icon: <Cpu size={24} className="text-white" />, 
      title: "AI-Powered", 
      description: "Advanced machine learning algorithms that identify threats and vulnerabilities"
    },
    { 
      icon: <Shield size={24} className="text-white" />, 
      title: "Holistic Defense", 
      description: "Full-spectrum defense against modern cyber threats with proactive monitoring"
    },
    { 
      icon: <Zap size={24} className="text-white" />, 
      title: "Fast Insights", 
      description: "Delivers timely detection and recommended actions to support swift decision-making"
    },
    { 
      icon: <Database size={24} className="text-white" />, 
      title: "Threat Intelligence", 
      description: "Links findings to known CVE and MITRE ATT&CK using the threat database"
    },
    { 
      icon: <LineChart size={24} className="text-white" />, 
      title: "Risk Analytics", 
      description: "Provides impact, likelihood, and risk ratings, along with visualized reports"
    },
    { 
      icon: <BookCheck size={24} className="text-white" />, 
      title: "Reliable Controls", 
      description: "Suggests controls based on NIST SP 800-53 and ISO/IEC 27001 to reduce risk"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header
        className={`top-0 z-50 w-full transition-all duration-200
        ${isScrolled ? 
          'fixed bg-gray-900 border-b border-boxdark backdrop-blur-md' :
          'absolute bg-transparent border-transparent'
        }`}>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-5">
          <Link to="/" className="block -mr-20" style={{ width: 'auto', height: 'auto' }}>
            <div className="font-mono tracking-tight flex items-center scale-50 md:scale-75 origin-left">
              <span className="flex items-center gap-2 font-extrabold text-white text-4xl">AI<span className="text-gray-400"> | </span>CR</span>
              <ShieldCheck strokeWidth={3} size={34} className="text-white mb-0.5 ml-0.5"/>
              <span className="font-extrabold text-white text-4xl">M</span>
            </div>
          </Link>
          <div className="flex items-center gap-2.5">
            {userType === "ADMIN" ? (
              <button
                onClick={() => navigate('/admin')}
                className="bg-white hover:bg-gray-300 text-gray-900 text-sm md:text-base px-3.5 py-2 md:px-4 md:py-2.5 rounded-md transition-all duration-200 font-medium cursor-pointer"
              >
                Admin Dashboard
              </button>
            ) : userType === "USER" ? (
              <button
                onClick={() => navigate('/member')}
                className="bg-white hover:bg-gray-300 text-gray-900 text-sm md:text-base px-3.5 py-2 md:px-4 md:py-2.5 rounded-md transition-all duration-200 font-medium cursor-pointer"
              >
                Dashboard
              </button>
            ) :
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/auth/signin')}
                  className="border-2 border-transparent text-white hover:border-gray-500 text-sm md:text-base px-3.5 py-2 md:px-4 md:py-2.5 rounded-md transition-all duration-200 font-medium cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/auth/signup')}
                  className="bg-white hover:bg-gray-300 text-gray-900 text-sm md:text-base px-3.5 py-2 md:px-4 md:py-2.5 rounded-md transition-all duration-200 font-medium cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            }
          </div>
        </div>
      </header>
      
      <section 
        className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gray-900" 
        id="hero-section"
        style={{
          backgroundImage: `url('/landing-bg.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top'
        }}
      >
        <div className="absolute inset-0 bg-gray-900 bg-opacity-85"></div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 pl-4 pr-4.5 py-2 rounded-full bg-gray-900 text-gray-300">
            <Sparkle size={16} className="text-gray-400" />
            <span className="text-sm md:text-base font-medium">AI-Powered</span>
          </div>

          <h1 className="mb-8 text-3xl md:text-5xl font-bold leading-tight text-white">
            Cyber Risk Assessment & Mitigation
          </h1>

          <p className="mb-20 text-sm md:text-xl text-gray-400 max-w-2xl mx-auto md:!leading-[2rem]">
            AI-CRAM delivers enterprise-grade risk assessment, threat detection, and mitigation strategies through cutting-edge machine learning algorithms.
          </p>
          
          <div className="flex flex-col gap-6 md:flex-row md:gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/auth/signup')}
              className="bg-white hover:bg-gray-300 text-gray-900 px-6 py-3 md:px-8 md:py-4 rounded-md md:text-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="border-2 border-gray-700 hover:border-gray-500 px-6 py-3 md:px-8 md:py-4 rounded-md md:text-lg font-medium transition-all duration-200"
            >
              Request Demo
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <button 
            onClick={scrollToNextSection}
            className="flex flex-col items-center text-white hover:text-gray-400 transition-colors duration-200"
          >
            <span className="mb-2.5">Learn more</span>
            <ChevronDown size={24} className="animate-bounce" />
          </button>
        </div>
      </section>

      <section className="py-20 bg-gray-800" id="learn-more-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Next-Gen Cyber Protection</h2>
            <p className="text-gray-400 text-lg">
              AI-CRAM combines advanced AI with cybersecurity expertise to protect your digital assets
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-900 border border-gray-900 rounded-lg p-8 hover:border-gray-700 transition-all duration-300"
              >
                <div className="bg-gray-800 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">     
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How AI-CRAM Works</h2>
            <p className="text-gray-400 text-lg">
              Our platform continuously monitors, analyzes, and protects your infrastructure
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center py-4 px-6">
              <div className="bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Threat Detection</h3>
              <p className="text-gray-400">Analyze your situation to identify vulnerabilities and potential threats before they escalate into critical risks</p>
            </div>
            
            <div className="flex flex-col items-center text-center py-4 px-6">
              <div className="bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                <Sparkle size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Analysis</h3>
              <p className="text-gray-400">Machine learning algorithms analyze threats, assess risks, and determine the optimal mitigation strategies</p>
            </div>
            
            <div className="flex flex-col items-center text-center py-4 px-6">
              <div className="bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Control Guideline</h3>
              <p className="text-gray-400">Receive tailored control recommendations to proactively strengthen your security posture and reduce potential risks</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Trusted by Professionals</h2>
            <p className="text-gray-400 text-lg">
              See why organizations worldwide trust AI-CRAM to protect their digital assets
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 border border-gray-900 rounded-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold mb-1">Sarah Johnson</h4>
                  <p className="text-gray-500 text-sm">CISO, Global Financial Technologies</p>
                </div>
              </div>
              <p className="text-gray-400">
                AI-CRAM has transformed our security operations. The AI-driven approach has reduced our threat detection time by 85% and improved our overall security posture significantly.
              </p>
            </div>
            
            <div className="bg-gray-900 border border-gray-900 rounded-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold mb-1">Mark Thompson</h4>
                  <p className="text-gray-500 text-sm">Director of IT, Enterprise Solutions</p>
                </div>
              </div>
              <p className="text-gray-400">
                The predictive capabilities of AI-CRAM have helped us stay ahead of emerging threats. Their platform offers peace of mind in an increasingly complex threat landscape.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <Link to="/">
                <div className="font-mono tracking-tight flex items-center mb-4">
                  <span className="font-extrabold text-white text-2xl">AI<span className="text-gray-400"> | </span>CR</span>
                  <ShieldCheck strokeWidth={3} size={24} className="text-white mb-0.5 ml-0.5"/>
                  <span className="font-extrabold text-white text-2xl">M</span>
                </div>
              </Link>
              <p className="text-gray-400 text-sm lg:max-w-80">
                Next-generation cybersecurity platform powered by artificial intelligence.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-lg">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="/documentation" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-lg">Company</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-lg">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex justify-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} AI-CRAM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;