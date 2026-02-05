import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Find Your Next
            <span className="text-blue-600"> AI & Data</span> Opportunity
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-slide-up">
            Connect top AI and Data talent with innovative companies. Powered by
            intelligent matching and streamlined workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <a href="/register" className="btn btn-primary text-lg px-8 py-4">
              Get Started
            </a>
            <a href="/jobs" className="btn btn-secondary text-lg px-8 py-4">
              Browse Jobs
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TalentX?
            </h2>
            <p className="text-xl text-gray-600">
              AI-powered matching for the perfect fit
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center card animate-scale-in">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                AI-Powered Matching
              </h3>
              <p className="text-gray-600">
                Our intelligent algorithm connects the right talent with the
                right opportunities.
              </p>
            </div>

            <div
              className="text-center card animate-scale-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Talents</h3>
              <p className="text-gray-600">
                All talents are thoroughly vetted to ensure quality and
                expertise.
              </p>
            </div>

            <div
              className="text-center card animate-scale-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Hiring</h3>
              <p className="text-gray-600">
                Streamlined process from application to hiring gets you started
                faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}

      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of companies and talents already using TalentX
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="btn btn-primary text-lg px-8 py-4">
              Sign Up as Talent
            </a>
            <a
              href="/register?role=employer"
              className="btn btn-secondary text-lg px-8 py-4"
            >
              Post a Job
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2024 TalentX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
