import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const TermsOfService = () => {
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

          <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="bg-gray-800 rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
              <p className="text-gray-400 mb-3">
                Welcome to AI-CRAM. These Terms of Service ("Terms") govern your access to and use of AI-CRAM's website, products, and services ("Services"). Please read these Terms carefully before using our Services.
              </p>
              <p className="text-gray-400">
                By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Eligibility</h2>
              <p className="text-gray-400 mb-3">
                The Services are intended solely for users who are 18 years of age or older. Any use of the Services by anyone under 18 is expressly prohibited. By using the Services, you represent and warrant that you are 18 years of age or older.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Account Registration</h2>
              <p className="text-gray-400 mb-3">
                To use certain features of our Services, you must register for an account. When you register, you must provide accurate and complete information. You are solely responsible for the activity that occurs on your account, and you must keep your account password secure.
              </p>
              <p className="text-gray-400 mb-3">
                You must notify us immediately of any breach of security or unauthorized use of your account. We will not be liable for any losses caused by any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Use of the Service</h2>
              <p className="text-gray-400 mb-3">
                Our service provides AI-assisted analysis of cybersecurity scenarios to help identify vulnerabilities, assess risk levels, and suggest mitigation strategies. By using our service, you agree to the following:
              </p>
              <ul className="list-disc pl-8 text-gray-400 mb-3 space-y-2">
                <li>You will provide accurate and relevant information for analysis.</li>
                <li>You understand that our analysis is advisory in nature and should not replace professional judgment.</li>
                <li>You will not misuse the service for any unlawful or unethical purposes.</li>
                <li>You acknowledge that we do not access or scan your systems directly, and results depend on the information you provide.</li>
              </ul>
              <p className="text-gray-400">
                We reserve the right to modify or discontinue the service at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Availability and Access</h2>
              <p className="text-gray-400 mb-3">
                The service is provided as-is and may be subject to occasional updates, maintenance, or interruptions. We make no guarantees regarding uptime or uninterrupted access.
              </p>
              <p className="text-gray-400 mb-3">
                Access to the service may require account registration or authentication. You are responsible for maintaining the confidentiality of your credentials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Dispute Resolution</h2>
              <p className="text-gray-400 mb-3">
                If a dispute arises between a buyer and seller, we will review the case and make a decision based on our dispute resolution policy. Our decision is final and binding.
              </p>
              <p className="text-gray-400 mb-3">
                To resolve a dispute, we may request additional information from either party. Failure to provide requested information may result in a decision adverse to the non-responsive party.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
              <p className="text-gray-400 mb-3">
                In no event shall AI-CRAM, its officers, directors, employees, or agents, be liable to you for any direct, indirect, incidental, special, punitive, or consequential damages whatsoever resulting from any:
              </p>
              <ul className="list-disc pl-8 text-gray-400 mb-3 space-y-2">
                <li>Errors, mistakes, or inaccuracies of content</li>
                <li>Personal injury or property damage of any nature whatsoever</li>
                <li>Unauthorized access to or use of our servers and/or any personal information stored therein</li>
                <li>Interruption or cessation of transmission to or from our Services</li>
                <li>Bugs, viruses, trojan horses, or the like which may be transmitted through our Services by any third party</li>
              </ul>
              <p className="text-gray-400">
                The foregoing limitation of liability shall apply to the fullest extent permitted by law in the applicable jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Indemnification</h2>
              <p className="text-gray-400">
                You agree to defend, indemnify, and hold harmless AI-CRAM and its officers, directors, employees, and agents, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses arising from your use of and access to the Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Modifications to Terms</h2>
              <p className="text-gray-400">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Governing Law</h2>
              <p className="text-gray-400">
                These Terms shall be governed and construed in accordance with the laws of Thailand, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">11. Contact Us</h2>
              <p className="text-gray-400">
                If you have any questions about these Terms, please contact us at legal@ai-cram.com
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

export default TermsOfService;