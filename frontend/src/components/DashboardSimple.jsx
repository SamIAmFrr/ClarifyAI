import { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ allergyProfile, reloadProfile }) {
  const [profileForm, setProfileForm] = useState({
    allergies: "",
    dietary_restrictions: "",
    skin_sensitivities: "",
    severity_notes: ""
  });
  const [analysisType, setAnalysisType] = useState("food");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showProfileForm, setShowProfileForm] = useState(false);

  useEffect(() => {
    if (allergyProfile) {
      setProfileForm({
        allergies: allergyProfile.allergies.join(", "),
        dietary_restrictions: allergyProfile.dietary_restrictions?.join(", ") || "",
        skin_sensitivities: allergyProfile.skin_sensitivities?.join(", ") || "",
        severity_notes: allergyProfile.severity_notes || ""
      });
    } else {
      setShowProfileForm(true);
    }
    loadHistory();
  }, [allergyProfile]);

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleSaveProfile = async () => {
    const profileData = {
      allergies: profileForm.allergies.split(",").map(a => a.trim()).filter(Boolean),
      dietary_restrictions: profileForm.dietary_restrictions.split(",").map(d => d.trim()).filter(Boolean),
      skin_sensitivities: profileForm.skin_sensitivities.split(",").map(s => s.trim()).filter(Boolean),
      severity_notes: profileForm.severity_notes
    };

    try {
      if (allergyProfile) {
        await axios.put(`${API}/profile/allergy`, profileData);
      } else {
        await axios.post(`${API}/profile/allergy`, profileData);
      }
      await reloadProfile();
      setShowProfileForm(false);
      toast.success("Profile saved successfully!");
    } catch (error) {
      toast.error("Failed to save profile");
    }
  };

  const handleAnalyze = async () => {
    if (!query.trim()) {
      toast.error("Please enter something to analyze");
      return;
    }

    if (!allergyProfile) {
      toast.error("Please set up your allergy profile first");
      setShowProfileForm(true);
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await axios.post(`${API}/analyze`, {
        query,
        analysis_type: analysisType
      });
      setResult(response.data);
      loadHistory();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="dashboard-content">
      {/* Allergy Profile Section */}
      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Your Allergy Profile</h2>
          <Button
            onClick={() => setShowProfileForm(!showProfileForm)}
            data-testid="edit-profile-button"
            variant="outline"
            className="rounded-lg border-purple-500 text-purple-300 hover:border-purple-400 hover:text-purple-200 hover:bg-purple-500/10"
          >
            {showProfileForm ? "Cancel" : allergyProfile ? "Edit Profile" : "Set Up Profile"}
          </Button>
        </div>

        {allergyProfile && !showProfileForm ? (
          <div data-testid="allergy-profile-display">
            <div style={{ marginBottom: '1rem' }}>
              <Label className="font-semibold text-purple-700">Allergies:</Label>
              <div className="allergy-tags">
                {allergyProfile.allergies.map((allergy, idx) => (
                  <span key={idx} className="allergy-tag" data-testid={`allergy-tag-${idx}`}>
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
            {allergyProfile.dietary_restrictions?.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <Label className="font-semibold text-purple-700">Dietary Restrictions:</Label>
                <div className="allergy-tags">
                  {allergyProfile.dietary_restrictions.map((restriction, idx) => (
                    <span key={idx} className="allergy-tag">
                      {restriction}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {allergyProfile.skin_sensitivities?.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <Label className="font-semibold text-purple-700">Skin Sensitivities:</Label>
                <div className="allergy-tags">
                  {allergyProfile.skin_sensitivities.map((sensitivity, idx) => (
                    <span key={idx} className="allergy-tag">
                      {sensitivity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          showProfileForm && (
            <div data-testid="profile-form">
              <div style={{ marginBottom: '1rem' }}>
                <Label htmlFor="allergies">Allergies (comma-separated) *</Label>
                <Input
                  id="allergies"
                  data-testid="allergies-input"
                  placeholder="e.g., Peanuts, Dairy, Shellfish"
                  value={profileForm.allergies}
                  onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <Label htmlFor="dietary">Dietary Restrictions (comma-separated)</Label>
                <Input
                  id="dietary"
                  data-testid="dietary-input"
                  placeholder="e.g., Vegan, Gluten-free"
                  value={profileForm.dietary_restrictions}
                  onChange={(e) => setProfileForm({ ...profileForm, dietary_restrictions: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <Label htmlFor="skin">Skin Sensitivities (comma-separated)</Label>
                <Input
                  id="skin"
                  data-testid="skin-input"
                  placeholder="e.g., Fragrances, Alcohol, Parabens"
                  value={profileForm.skin_sensitivities}
                  onChange={(e) => setProfileForm({ ...profileForm, skin_sensitivities: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <Label htmlFor="notes">Severity Notes</Label>
                <Textarea
                  id="notes"
                  data-testid="notes-textarea"
                  placeholder="Any important details about your allergies..."
                  value={profileForm.severity_notes}
                  onChange={(e) => setProfileForm({ ...profileForm, severity_notes: e.target.value })}
                  className="mt-2"
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                data-testid="save-profile-button"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg shadow-lg shadow-purple-500/30"
              >
                Save Profile
              </Button>
            </div>
          )
        )}
      </section>

      {/* Quick Analysis Section */}
      <section className="section">
        <h2 className="section-title">Quick Text Analysis</h2>
        <p style={{ marginBottom: '1.5rem', color: '#558b2f' }}>
          Quickly analyze food, products, skincare items, or ingredients by name.
        </p>
        
        <div className="analysis-tabs">
          {[
            { value: 'food', label: 'Food' },
            { value: 'product', label: 'Product' },
            { value: 'skincare', label: 'Skincare' },
            { value: 'fragrance', label: 'Perfume/Cologne' },
            { value: 'ingredient', label: 'Ingredient' }
          ].map(tab => (
            <button
              key={tab.value}
              data-testid={`tab-${tab.value}`}
              className={`tab-button ${analysisType === tab.value ? 'active' : ''}`}
              onClick={() => setAnalysisType(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="analysis-input-group">
          <Input
            data-testid="analysis-query-input"
            placeholder={`Enter ${analysisType} name or description...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            className="analysis-input"
          />
          <Button
            onClick={handleAnalyze}
            data-testid="analyze-button"
            disabled={analyzing}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg px-8 disabled:bg-gray-600 shadow-lg shadow-purple-500/30"
          >
            {analyzing ? "Analyzing..." : "Analyze"}
          </Button>
        </div>

        {result && (
          <div
            data-testid="analysis-result"
            className={`result-card ${result.is_safe ? 'safe' : result.warnings.length > 0 ? 'warning' : 'danger'}`}
          >
            <div className={`result-badge ${result.is_safe ? 'safe' : result.warnings.length > 0 ? 'warning' : 'danger'}`}>
              {result.is_safe ? (
                <span data-testid="result-safe"><CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Safe</span>
              ) : (
                <span data-testid="result-unsafe"><AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Caution</span>
              )}
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#2e7d32' }}>
              {result.query}
            </h3>

            <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>{result.result}</p>

            {result.warnings.length > 0 && (
              <div className="warning-list">
                <Label className="font-semibold text-orange-700 mb-2 block">
                  <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Warnings:
                </Label>
                {result.warnings.map((warning, idx) => (
                  <div key={idx} className="warning-item" data-testid={`warning-${idx}`}>
                    • {warning}
                  </div>
                ))}
              </div>
            )}

            {result.alternatives.length > 0 && (
              <div className="alternatives-list">
                <Label className="font-semibold text-purple-700 mb-2 block">
                  <Info size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Safe Alternatives:
                </Label>
                {result.alternatives.map((alt, idx) => (
                  <div key={idx} className="alternative-item" data-testid={`alternative-${idx}`}>
                    ✓ {alt}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* History Section */}
      {history.length > 0 && (
        <section className="section">
          <h2 className="section-title">Recent Analysis History</h2>
          <div className="history-grid" data-testid="history-list">
            {history.slice(0, 5).map((item, idx) => (
              <div key={item.id} className="history-item" data-testid={`history-item-${idx}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Badge variant={item.is_safe ? "success" : "warning"}>
                      {item.analysis_type}
                    </Badge>
                    <h4 style={{ fontWeight: 600, margin: '0.5rem 0' }}>{item.query}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  {item.is_safe ? (
                    <CheckCircle size={24} color="#4caf50" />
                  ) : (
                    <AlertCircle size={24} color="#ff9800" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
