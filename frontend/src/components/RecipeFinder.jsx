import { useState } from "react";
import axios from "axios";
import { Search, ChefHat, AlertCircle, CheckCircle, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RecipeFinder({ allergyProfile }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a dish or food item");
      return;
    }

    if (!allergyProfile) {
      toast.error("Please set up your allergy profile first");
      return;
    }

    setSearching(true);
    setResult(null);

    try {
      const response = await axios.post(`${API}/recipe-finder`, {
        food_item: searchQuery
      });
      setResult(response.data);
      toast.success("Recipes found!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Recipe search failed");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="recipe-page">
      <div className="page-header">
        <h1 className="page-title">🍳 Recipe Finder</h1>
        <p className="page-subtitle">
          Find safe recipes tailored to your allergies. Get step-by-step instructions with ingredient substitutions.
        </p>
      </div>

      <div className="section">
        <div data-testid="recipe-search-section">
          <div style={{ marginBottom: '1.5rem' }}>
            <Label htmlFor="recipe-search" className="mb-2 block font-semibold text-purple-700">
              What would you like to make?
            </Label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Input
                id="recipe-search"
                placeholder="e.g., Chocolate chip cookies, pasta carbonara, chicken curry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                data-testid="recipe-search-input"
                style={{ flex: 1, minWidth: '250px' }}
                className="analysis-input"
              />
              <Button
                onClick={handleSearch}
                data-testid="search-recipes-button"
                disabled={searching || !searchQuery.trim()}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg px-8 disabled:bg-gray-600 shadow-lg shadow-purple-500/30"
              >
                <Search size={18} className="mr-2" />
                {searching ? "Searching..." : "Find Recipes"}
              </Button>
            </div>
          </div>

          {recipes && (
            <div data-testid="recipe-results" style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#7c3aed', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChefHat size={24} />
                Safe Recipes for {searchQuery}
              </h2>

              {recipes.recipes && recipes.recipes.length > 0 ? (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {recipes.recipes.map((recipe, idx) => (
                    <div
                      key={idx}
                      data-testid={`recipe-${idx}`}
                      style={{
                        background: 'rgba(168, 85, 247, 0.05)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        borderLeft: '4px solid #a855f7'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#7c3aed', flex: 1 }}>
                          {recipe.name}
                        </h3>
                        <div className="result-badge safe">
                          <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                          Allergy-Safe
                        </div>
                      </div>

                      {recipe.description && (
                        <p style={{ color: '#64748b', marginBottom: '1rem', fontStyle: 'italic' }}>
                          {recipe.description}
                        </p>
                      )}

                      {recipe.prep_time && (
                        <div style={{ fontSize: '0.875rem', color: '#7c3aed', marginBottom: '1rem' }}>
                          ⏱️ Prep Time: {recipe.prep_time}
                        </div>
                      )}

                      <div style={{ marginBottom: '1rem' }}>
                        <Label className="font-semibold text-purple-700 mb-2 block">Ingredients:</Label>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {recipe.ingredients.map((ingredient, iIdx) => (
                            <li
                              key={iIdx}
                              style={{
                                padding: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.5)',
                                borderRadius: '6px',
                                marginBottom: '0.25rem',
                                fontSize: '0.9rem'
                              }}
                            >
                              • {ingredient}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {recipe.substitutions && recipe.substitutions.length > 0 && (
                        <div style={{ marginBottom: '1rem', background: '#f3e8ff', padding: '1rem', borderRadius: '8px' }}>
                          <Label className="font-semibold text-purple-700 mb-2 block">
                            🔄 Allergy-Safe Substitutions:
                          </Label>
                          {recipe.substitutions.map((sub, sIdx) => (
                            <div key={sIdx} style={{ fontSize: '0.875rem', color: '#7c3aed', marginBottom: '0.25rem' }}>
                              • {sub}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginBottom: '1rem' }}>
                        <Label className="font-semibold text-purple-700 mb-2 block">Instructions:</Label>
                        <ol style={{ paddingLeft: '1.5rem' }}>
                          {recipe.instructions.map((instruction, insIdx) => (
                            <li
                              key={insIdx}
                              style={{
                                marginBottom: '0.75rem',
                                fontSize: '0.9rem',
                                lineHeight: 1.6,
                                color: '#475569'
                              }}
                            >
                              {instruction}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {recipe.notes && (
                        <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                          <Label className="font-semibold text-orange-700 mb-1 block">
                            <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Notes:
                          </Label>
                          <p style={{ fontSize: '0.875rem', color: '#92400e' }}>{recipe.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No safe recipes found. Try a different dish!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
