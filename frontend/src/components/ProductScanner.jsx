import { useState } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProductScanner({ allergyProfile }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setImageResult(null); // Reset previous result
    }
  };

  const handleImageAnalyze = async () => {
    if (!imageFile) {
      toast.error("Please upload an image");
      return;
    }

    if (!allergyProfile) {
      toast.error("Please set up your allergy profile first");
      return;
    }

    setAnalyzingImage(true);
    setImageResult(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await axios.post(`${API}/analyze-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setImageResult(response.data);
      toast.success("Product analyzed successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Image analysis failed");
    } finally {
      setAnalyzingImage(false);
    }
  };

  return (
    <div className="scanner-page">
      <div className="page-header">
        <h1 className="page-title">📷 Product Label Scanner</h1>
        <p className="page-subtitle">
          Upload a photo of any product label - food, skincare, cosmetics, perfumes, colognes, or fragrances. 
          AI will instantly identify allergens and irritants based on your profile.
        </p>
      </div>

      <div className="section">
        <div data-testid="image-upload-section">
          <div style={{ marginBottom: '1.5rem' }}>
            <Label htmlFor="label-image" className="mb-2 block font-semibold text-purple-700">
              Upload or Take Photo of Product Label
            </Label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Input
                id="label-image"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                data-testid="image-upload-input"
                style={{ flex: 1, minWidth: '250px' }}
              />
              <Button
                onClick={handleImageAnalyze}
                data-testid="analyze-image-button"
                disabled={analyzingImage || !imageFile}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg px-8 disabled:bg-gray-600 shadow-lg shadow-purple-500/30"
              >
                <Upload size={18} className="mr-2" />
                {analyzingImage ? "Analyzing..." : "Analyze Product"}
              </Button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              📱 On mobile: Tap to take a photo with your camera or choose from gallery
            </p>
          </div>

          {imagePreview && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center', background: '#f5f5f5', padding: '1.5rem', borderRadius: '16px' }}>
              <img
                src={imagePreview}
                alt="Preview"
                data-testid="image-preview"
                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px', border: '2px solid #4caf50' }}
              />
            </div>
          )}

          {imageResult && (
            <div
              data-testid="image-analysis-result"
              className={`result-card ${imageResult.is_safe ? 'safe' : 'danger'}`}
              style={{ marginTop: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div className={`result-badge ${imageResult.is_safe ? 'safe' : 'danger'}`}>
                  {imageResult.is_safe ? (
                    <span data-testid="image-result-safe">
                      <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Safe to Use
                    </span>
                  ) : (
                    <span data-testid="image-result-unsafe">
                      <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Unsafe - Contains Allergens/Irritants
                    </span>
                  )}
                </div>

                {/* Personalized Safety Rating */}
                <div style={{ 
                  background: imageResult.safety_rating >= 75 ? '#e8f5e9' : imageResult.safety_rating >= 50 ? '#fff3e0' : '#ffebee',
                  padding: '1rem 1.5rem',
                  borderRadius: '16px',
                  textAlign: 'center',
                  border: `3px solid ${imageResult.safety_rating >= 75 ? '#4caf50' : imageResult.safety_rating >= 50 ? '#ff9800' : '#f44336'}`
                }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, color: imageResult.safety_rating >= 75 ? '#7c3aed' : imageResult.safety_rating >= 50 ? '#e65100' : '#c62828' }}>
                    {imageResult.safety_rating}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: imageResult.safety_rating >= 75 ? '#7c3aed' : imageResult.safety_rating >= 50 ? '#e65100' : '#c62828' }}>
                    Safety Score
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                    Personalized for you
                  </div>
                </div>
              </div>

              {imageResult.product_name && (
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#7c3aed' }}>
                  {imageResult.product_name}
                </h3>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <Label className="font-semibold text-purple-700 mb-2 block">Ingredients Found:</Label>
                <div className="allergy-tags">
                  {imageResult.ingredients.slice(0, 15).map((ingredient, idx) => (
                    <span key={idx} className="allergy-tag" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                      {ingredient}
                    </span>
                  ))}
                  {imageResult.ingredients.length > 15 && (
                    <span className="allergy-tag" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                      +{imageResult.ingredients.length - 15} more
                    </span>
                  )}
                </div>
              </div>

              {imageResult.detected_allergens.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <Label className="font-semibold text-red-700 mb-2 block">
                    ⚠️ Detected Allergens/Irritants:
                  </Label>
                  <div className="allergy-tags">
                    {imageResult.detected_allergens.map((allergen, idx) => (
                      <span
                        key={idx}
                        className="allergy-tag"
                        data-testid={`detected-allergen-${idx}`}
                        style={{ background: '#ffebee', color: '#c62828' }}
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {imageResult.warnings.length > 0 && (
                <div className="warning-list">
                  <Label className="font-semibold text-orange-700 mb-2 block">
                    <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Warnings:
                  </Label>
                  {imageResult.warnings.map((warning, idx) => (
                    <div key={idx} className="warning-item" data-testid={`image-warning-${idx}`}>
                      • {warning}
                    </div>
                  ))}
                </div>
              )}

              <p style={{ marginTop: '1rem', lineHeight: 1.6, color: '#555', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                {imageResult.detailed_analysis}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
