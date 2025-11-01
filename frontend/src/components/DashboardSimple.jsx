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

export default function Dashboard({ allergyProfile, reloadProfile, historyTrigger }) {
  const [profileForm, setProfileForm] = useState({
    allergies: "",
    dietary_restrictions: "",
    religion_restrictions: "",
    skin_sensitivities: "",
    severity_notes: ""
  });
  const [history, setHistory] = useState([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);

  useEffect(() => {
    if (allergyProfile) {
      setProfileForm({
        allergies: allergyProfile.allergies.join(", "),
        dietary_restrictions: allergyProfile.dietary_restrictions?.join(", ") || "",
        religion_restrictions: allergyProfile.religion_restrictions?.join(", ") || "",
        skin_sensitivities: allergyProfile.skin_sensitivities?.join(", ") || "",
        severity_notes: allergyProfile.severity_notes || ""
      });
    } else {
      setShowProfileForm(true);
    }
    loadHistory();
  }, [allergyProfile]);

  useEffect(() => {
    loadHistory();
  }, [historyTrigger]);

  const loadHistory = async () => {
    try {
      // Fetch all three types of history
      const [textHistory, imageHistory, menuHistory] = await Promise.all([
        axios.get(`${API}/history`).catch(() => ({ data: [] })),
        axios.get(`${API}/image-history`).catch(() => ({ data: [] })),
        axios.get(`${API}/menu-history`).catch(() => ({ data: [] }))
      ]);

      // Combine and format all history items
      const allHistory = [
        ...textHistory.data.map(item => ({
          ...item,
          type: 'text',
          displayType: 'Quick Analysis',
          icon: '🔍'
        })),
        ...imageHistory.data.map(item => ({
          ...item,
          type: 'image',
          displayType: 'Product Scan',
          icon: '📷',
          query: item.product_name || 'Product Label',
          is_safe: item.is_safe
        })),
        ...menuHistory.data.map(item => ({
          ...item,
          type: 'menu',
          displayType: 'Menu Analysis',
          icon: '🍽️',
          query: item.restaurant_name || item.source_data,
          is_safe: item.safe_dishes && item.safe_dishes.length > 0
        }))
      ];

      // Sort by timestamp (newest first)
      allHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setHistory(allHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleSaveProfile = async () => {
    const profileData = {
      allergies: profileForm.allergies.split(",").map(a => a.trim()).filter(Boolean),
      dietary_restrictions: profileForm.dietary_restrictions.split(",").map(d => d.trim()).filter(Boolean),
      religion_restrictions: profileForm.religion_restrictions.split(",").map(r => r.trim()).filter(Boolean),
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

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all your analysis history?")) {
      return;
    }

    setClearingHistory(true);
    try {
      // Clear all three types of history
      await Promise.all([
        axios.delete(`${API}/history`).catch(() => {}),
        axios.delete(`${API}/image-history`).catch(() => {}),
        axios.delete(`${API}/menu-history`).catch(() => {})
      ]);
      setHistory([]);
      toast.success("History cleared successfully!");
    } catch (error) {
      toast.error("Failed to clear history");
    } finally {
      setClearingHistory(false);
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
            {allergyProfile.religion_restrictions?.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <Label className="font-semibold text-purple-700">Religion Restrictions:</Label>
                <div className="allergy-tags">
                  {allergyProfile.religion_restrictions.map((restriction, idx) => (
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
                <Label htmlFor="religion">Religion Restrictions (comma-separated)</Label>
                <Input
                  id="religion"
                  data-testid="religion-input"
                  placeholder="e.g., Halal, Kosher, Hindu (no beef), Jain"
                  value={profileForm.religion_restrictions}
                  onChange={(e) => setProfileForm({ ...profileForm, religion_restrictions: e.target.value })}
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

      {/* History Section */}
      {history.length > 0 && (
        <section className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Recent Analysis History</h2>
            <Button
              onClick={handleClearHistory}
              disabled={clearingHistory}
              variant="outline"
              className="rounded-lg border-red-500 text-red-600 hover:border-red-400 hover:text-red-500 hover:bg-red-500/10"
            >
              {clearingHistory ? "Clearing..." : "Clear History"}
            </Button>
          </div>
          <div className="history-grid" data-testid="history-list">
            {history.slice(0, 10).map((item, idx) => (
              <div key={item.id} className="history-item" data-testid={`history-item-${idx}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                      <Badge variant={item.is_safe ? "success" : "warning"}>
                        {item.displayType}
                      </Badge>
                    </div>
                    <h4 style={{ fontWeight: 600, margin: '0.5rem 0', wordBreak: 'break-word' }}>
                      {item.query}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>
                      {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {item.is_safe ? (
                    <CheckCircle size={24} color="#a855f7" />
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
