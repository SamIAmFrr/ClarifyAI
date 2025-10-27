import { Button } from "@/components/ui/button";

const REDIRECT_URL = `${window.location.origin}/dashboard`;
const AUTH_URL = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(REDIRECT_URL)}`;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_safe-eats-ai/artifacts/ld5nhj99_ChatGPT%20Image%20Oct%2012%2C%202025%2C%2011_29_54%20AM.png";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = AUTH_URL;
  };

  return (
    <div className="landing-page" data-testid="landing-page">
      <header className="landing-header">
        <div className="logo">
          <img src={LOGO_URL} alt="ClarifyAI Logo" className="logo-image" />
          ClarifyAI
        </div>
        <Button
          onClick={handleLogin}
          size="lg"
          data-testid="header-login-button"
          className="bg-black hover:bg-gray-800 text-white px-8 rounded-md min-h-[44px]"
        >
          Sign in with Google
        </Button>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Live Safely with Your Allergies</h1>
          <p className="hero-subtitle">
            Personalized allergy insights, backed by real science.
          </p>

          <Button
            onClick={handleLogin}
            size="lg"
            data-testid="hero-get-started-button"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Free
          </Button>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🍽️</div>
              <h3 className="feature-title">Food Safety</h3>
              <p className="feature-desc">
                Check ingredients and dishes before you eat. Get instant safety alerts.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🧴</div>
              <h3 className="feature-title">Skincare Analysis</h3>
              <p className="feature-desc">
                Discover what's safe to apply on your skin based on your sensitivities.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">Product Scanner</h3>
              <p className="feature-desc">
                Search any product or ingredient for detailed allergy analysis.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3 className="feature-title">Smart Alternatives</h3>
              <p className="feature-desc">
                Get personalized alternatives and substitutes for unsafe items.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}