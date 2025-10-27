import { useState } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, Upload, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MenuAnalyzer({ allergyProfile }) {
  const [menuUrl, setMenuUrl] = useState("");
  const [menuFile, setMenuFile] = useState(null);
  const [menuPreview, setMenuPreview] = useState(null);
  const [menuResult, setMenuResult] = useState(null);
  const [analyzingMenu, setAnalyzingMenu] = useState(false);
  const [menuAnalysisType, setMenuAnalysisType] = useState("url");

  const handleMenuFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMenuFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMenuPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setMenuResult(null);
    }
  };

  const handleMenuAnalyze = async () => {
    if (!allergyProfile) {
      toast.error("Please set up your allergy profile first");
      return;
    }

    if (menuAnalysisType === 'url') {
      if (!menuUrl.trim()) {
        toast.error("Please enter a menu URL");
        return;
      }

      setAnalyzingMenu(true);
      setMenuResult(null);

      try {
        const response = await axios.post(`${API}/analyze-menu-url`, {
          url: menuUrl
        });
        setMenuResult(response.data);
        toast.success("Menu analyzed successfully!");
      } catch (error) {
        toast.error(error.response?.data?.detail || "Menu analysis failed");
      } finally {
        setAnalyzingMenu(false);
      }
    } else {
      if (!menuFile) {
        toast.error("Please upload a menu photo");
        return;
      }

      setAnalyzingMenu(true);
      setMenuResult(null);

      try {
        const formData = new FormData();
        formData.append('file', menuFile);

        const response = await axios.post(`${API}/analyze-menu-photo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setMenuResult(response.data);
        toast.success("Menu analyzed successfully!");
      } catch (error) {
        toast.error(error.response?.data?.detail || "Menu analysis failed");
      } finally {
        setAnalyzingMenu(false);
      }
    }
  };

  return (
    <div className="menu-page">
      <div className="page-header">
        <h1 className="page-title">🍽️ Restaurant Menu Analyzer</h1>
        <p className="page-subtitle">
          Paste a restaurant menu URL or upload a photo. AI will identify safe dishes and suggest modifications.
        </p>
      </div>

      <div className="section">
        <div className="analysis-tabs" style={{ marginBottom: '1.5rem' }}>
          <button
            data-testid="menu-url-tab"
            className={`tab-button ${menuAnalysisType === 'url' ? 'active' : ''}`}
            onClick={() => {
              setMenuAnalysisType('url');
              setMenuResult(null);
            }}
          >
            <LinkIcon size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Menu URL
          </button>
          <button
            data-testid="menu-photo-tab"
            className={`tab-button ${menuAnalysisType === 'photo' ? 'active' : ''}`}
            onClick={() => {
              setMenuAnalysisType('photo');
              setMenuResult(null);
            }}
          >
            <Upload size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Menu Photo
          </button>
        </div>

        {menuAnalysisType === 'url' ? (
          <div data-testid="menu-url-section">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <Input
                data-testid="menu-url-input"
                placeholder="Paste restaurant menu URL (e.g., https://restaurant.com/menu)"
                value={menuUrl}
                onChange={(e) => setMenuUrl(e.target.value)}
                style={{ flex: 1, minWidth: '300px' }}
                className="analysis-input"
              />
              <Button
                onClick={handleMenuAnalyze}
                data-testid="analyze-menu-button"
                disabled={analyzingMenu}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg px-8 disabled:bg-gray-400"
              >
                {analyzingMenu ? "Analyzing..." : "Analyze Menu"}
              </Button>
            </div>
          </div>
        ) : (
          <div data-testid="menu-photo-section">
            <div style={{ marginBottom: '1.5rem' }}>
              <Label htmlFor="menu-photo" className="mb-2 block font-semibold text-green-700">
                Upload or Take Photo of Menu
              </Label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Input
                  id="menu-photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleMenuFileChange}
                  data-testid="menu-photo-input"
                  style={{ flex: 1, minWidth: '250px' }}
                />
                <Button
                  onClick={handleMenuAnalyze}
                  data-testid="analyze-menu-photo-button"
                  disabled={analyzingMenu || !menuFile}
                  className="bg-black hover:bg-gray-800 text-white rounded-md px-8 disabled:bg-gray-400"
                >
                  {analyzingMenu ? "Analyzing..." : "Analyze Menu"}
                </Button>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                📱 On mobile: Tap to take a photo with your camera or choose from gallery
              </p>
              {menuPreview && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center', background: '#f5f5f5', padding: '1.5rem', borderRadius: '16px' }}>
                  <img
                    src={menuPreview}
                    alt="Menu Preview"
                    data-testid="menu-preview"
                    style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px', border: '2px solid #9c27b0' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {menuResult && (
          <div data-testid="menu-analysis-result" style={{ marginTop: '2rem' }}>
            {menuResult.restaurant_name && (
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#2e7d32' }}>
                {menuResult.restaurant_name}
              </h3>
            )}

            <p style={{ marginBottom: '2rem', padding: '1rem', background: '#f3e5f5', borderRadius: '12px', color: '#6a1b9a', lineHeight: 1.6 }}>
              {menuResult.summary}
            </p>

            {menuResult.safe_dishes.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={24} color="#4caf50" />
                  Safe Dishes ({menuResult.safe_dishes.length})
                </h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {menuResult.safe_dishes.map((dish, idx) => (
                    <div
                      key={idx}
                      data-testid={`safe-dish-${idx}`}
                      style={{
                        background: '#e8f5e9',
                        padding: '1rem',
                        borderRadius: '12px',
                        borderLeft: '4px solid #4caf50'
                      }}
                    >
                      <h5 style={{ fontWeight: 600, color: '#2e7d32', marginBottom: '0.5rem' }}>
                        {dish.name}
                      </h5>
                      {dish.description && (
                        <p style={{ fontSize: '0.9rem', color: '#558b2f', marginBottom: '0.5rem' }}>
                          {dish.description}
                        </p>
                      )}
                      <Badge style={{ background: '#4caf50', color: 'white' }}>✓ Safe to order</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {menuResult.unsafe_dishes.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={24} color="#f44336" />
                  Dishes to Avoid or Modify ({menuResult.unsafe_dishes.length})
                </h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {menuResult.unsafe_dishes.map((dish, idx) => (
                    <div
                      key={idx}
                      data-testid={`unsafe-dish-${idx}`}
                      style={{
                        background: '#ffebee',
                        padding: '1rem',
                        borderRadius: '12px',
                        borderLeft: '4px solid #f44336'
                      }}
                    >
                      <h5 style={{ fontWeight: 600, color: '#c62828', marginBottom: '0.5rem' }}>
                        {dish.name}
                      </h5>
                      {dish.description && (
                        <p style={{ fontSize: '0.9rem', color: '#d32f2f', marginBottom: '0.5rem' }}>
                          {dish.description}
                        </p>
                      )}
                      
                      {dish.allergens.length > 0 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b71c1c' }}>
                            Contains: 
                          </span>
                          <div className="allergy-tags" style={{ marginTop: '0.5rem' }}>
                            {dish.allergens.map((allergen, aIdx) => (
                              <span
                                key={aIdx}
                                className="allergy-tag"
                                style={{ background: '#c62828', color: 'white', fontSize: '0.85rem' }}
                              >
                                {allergen}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {dish.modifications.length > 0 && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fff3e0', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e65100', display: 'block', marginBottom: '0.5rem' }}>
                            💡 Suggested Modifications:
                          </span>
                          {dish.modifications.map((mod, mIdx) => (
                            <div key={mIdx} style={{ fontSize: '0.9rem', color: '#f57c00', marginBottom: '0.25rem' }}>
                              • {mod}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
