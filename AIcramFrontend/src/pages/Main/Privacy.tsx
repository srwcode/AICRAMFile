import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const PrivacyPolicy = () => {
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

          <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="bg-gray-800 rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
              <p className="text-gray-400 mb-3">
                At AI-CRAM, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p className="text-gray-400">
                Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access our website or use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
              <p className="text-gray-400 mb-3">
                We collect several types of information from and about users of our website and services, including:
              </p>
              <ul className="list-disc pl-8 text-gray-400 mb-3 space-y-2">
                <li><strong>Personal Identifiable Information:</strong> Name, email address, telephone number, and any other information you provide to us when creating an account or using our services.</li>
                <li><strong>Organization Information:</strong> Details about industry or assets made through our services.</li>
                <li><strong>Usage Data:</strong> Information about how you use our website, products, and services.</li>
                <li><strong>Technical Data:</strong> Internet protocol (IP) address, browser type and version, time zone setting and location, operating system and platform, and other technology on the devices you use to access our website.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. How We Collect Information</h2>
              <p className="text-gray-400 mb-3">
                We collect information through:
              </p>
              <ul className="list-disc pl-8 text-gray-400 mb-3 space-y-2">
                <li><strong>Direct Interactions:</strong> Information you provide when creating an account, using our services, or contacting us.</li>
                <li><strong>Automated Technologies:</strong> As you navigate through our website, we may automatically collect Technical Data by using cookies, server logs, and similar technologies.</li>
                <li><strong>Third Parties:</strong> We may receive information about you from third parties, such as business partners, subcontractors, assessment processors, and analytics providers.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. How We Use Your Information</h2>
              <p className="text-gray-400 mb-3">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc pl-8 text-gray-400 mb-3 space-y-2">
                <li>To provide, maintain, and improve our services</li>
                <li>To process assessments and send related information</li>
                <li>To verify your identity and prevent fraud</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To send you updates, security alerts, and support and administrative messages</li>
                <li>To communicate with you about products, services, offers, and events</li>
                <li>To monitor and analyze trends, usage, and activities in connection with our services</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Disclosure of Your Information</h2>
              <p className="text-gray-400 mb-3">
                We may disclose your personal information to:
              </p>
              <ul className="list-disc pl-8 text-gray-400 mb-3 space-y-2">
                <li><strong>Service Providers:</strong> Third parties who perform services on our behalf, such as assessment processing, data analysis, email delivery, hosting services, and customer service.</li>
                <li><strong>Business Partners:</strong> Business partners with whom we jointly offer products or services.</li>
                <li><strong>Legal Requirements:</strong> When required by law or to respond to legal process, to protect our rights, to protect your safety or the safety of others, to investigate fraud, or to respond to a government request.</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company.</li>
              </ul>
              <p className="text-gray-400">
                We do not sell, rent, or lease our customer lists to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Data Security</h2>
              <p className="text-gray-400 mb-3">
                We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure.
              </p>
              <p className="text-gray-400">
                While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Your Data Protection Rights</h2>
              <p className="text-gray-400 mb-3">
                Depending on your location, you may have certain rights regarding your personal information, such as:
              </p>
              <ul className="list-disc pl-8 text-gray-400 mb-3 space-y-2">
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate or incomplete information</li>
                <li>The right to erasure of your personal information</li>
                <li>The right to restrict processing of your personal information</li>
                <li>The right to data portability</li>
                <li>The right to object to processing of your personal information</li>
                <li>The right to withdraw consent at any time</li>
              </ul>
              <p className="text-gray-400">
                To exercise these rights, please contact us using the contact information provided below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Cookies and Similar Technologies</h2>
              <p className="text-gray-400 mb-3">
                We use cookies and similar tracking technologies to collect and use information about you and your interaction with our website. Cookies are small data files that are placed on your device when you visit a website.
              </p>
              <p className="text-gray-400 mb-3">
                We use cookies to identify you and your preferences, to remember your settings, to enhance your experience, and to provide functionality. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Children's Privacy</h2>
              <p className="text-gray-400">
                Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are under 18, do not use or provide any information on this website or through any of its features.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-400">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">11. Contact Us</h2>
              <p className="text-gray-400">
                If you have any questions about this Privacy Policy, please contact us at privacy@ai-cram.com
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

export default PrivacyPolicy;