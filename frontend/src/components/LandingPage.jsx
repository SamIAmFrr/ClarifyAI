import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const REDIRECT_URL = `${window.location.origin}/dashboard`;
const AUTH_URL = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(REDIRECT_URL)}`;

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = AUTH_URL;
  };

  return (
    <div className="landing-page" data-testid="landing-page">
      <header className="landing-header">
        <div className="logo">
          <div className="logo-icon">
            <Shield size={20} />
          </div>
          SafeEats AI
        </div>
        <Button
          onClick={handleLogin}
          size="lg"
          data-testid="header-login-button"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 rounded-full"
        >
          Sign in with Google
        </Button>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Live Safely with Your Allergies</h1>
          <p className="hero-subtitle">
            AI-powered allergy assistant that helps you discover what's safe to eat,
            use, and apply on your skin. Get instant analysis and personalized recommendations.
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