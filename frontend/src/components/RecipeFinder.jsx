import { useState } from "react";
import axios from "axios";
import { Search, ChefHat, AlertCircle, CheckCircle, Clock, Users, RefreshCw } from "lucide-react";
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
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [recipeHistory, setRecipeHistory] = useState({}); // Track recipes by food item

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
    setSelectedRecipe(null);
    setLastSearchQuery(searchQuery);

    try {
      // Get previously shown recipes for this food item
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const excludedRecipes = recipeHistory[normalizedQuery] || [];
      
      const response = await axios.post(`${API}/recipe-finder`, {
        food_item: searchQuery,
        exclude_recipes: excludedRecipes // Send previous recipes even on first search
      });
      setResult(response.data);
      
      // Store the recipe names for this food item
      if (response.data.recipes) {
        const newRecipeNames = response.data.recipes.map(r => r.name);
        setRecipeHistory(prev => ({
          ...prev,
          [normalizedQuery]: [...(prev[normalizedQuery] || []), ...newRecipeNames]
        }));
      }
      
      toast.success("3 recipe options generated!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Recipe search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleReroll = async () => {
    if (!lastSearchQuery) return;
    
    setSearching(true);
    setSelectedRecipe(null);

    try {
      const response = await axios.post(`${API}/recipe-finder`, {
        food_item: lastSearchQuery,
        exclude_recipes: previousRecipeNames // Send previous recipe names to exclude
      });
      setResult(response.data);
      // Add new recipes to the exclusion list
      if (response.data.recipes) {
        setPreviousRecipeNames([...previousRecipeNames, ...response.data.recipes.map(r => r.name)]);
      }
      toast.success("New recipe options generated!");
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
          Search for allergy-safe recipes for any food item. AI will generate delicious recipes 
          that are completely safe based on your allergy profile and dietary restrictions.
        </p>
      </div>

      <div className="section">
        <div className="animated-border-box">
          <div className="animated-border-content" data-testid="recipe-search-section">
            <div style={{ marginBottom: '1.5rem' }}>
              <Label htmlFor="recipe-search" className="mb-2 block font-semibold text-purple-700">
                What would you like to make?
              </Label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Input
                  id="recipe-search"
                  placeholder="Type here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  data-testid="recipe-search-input"
                  style={{ flex: 1, minWidth: '250px' }}
                  className="analysis-input border-purple-300 focus:border-purple-500"
                />
                <Button
                  onClick={handleSearch}
                  data-testid="search-recipes-button"
                  disabled={searching || !searchQuery.trim() || !allergyProfile}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-8 disabled:bg-gray-600 shadow-lg shadow-purple-500/30"
                >
                  {searching ? (
                    <>
                      <div className="spinner-small mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={18} className="mr-2" />
                      Find Recipes
                    </>
                  )}
                </Button>
              </div>
            </div>

            {!allergyProfile && (
              <div className="alert alert-warning">
                <AlertCircle size={20} />
                <span>Please set up your allergy profile in the Dashboard first.</span>
              </div>
            )}
          </div>
        </div>

        {result && !selectedRecipe && (
          <div className="results-section" data-testid="recipe-results">
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="section-title">
                  <ChefHat size={24} className="mr-2" />
                  Choose a Recipe for "{result.food_item}"
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {result.summary}
                </p>
              </div>
              <Button
                onClick={handleReroll}
                disabled={searching}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6"
              >
                <RefreshCw size={18} className="mr-2" />
                Reroll Options
              </Button>
            </div>

            {result.recipes && result.recipes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {result.recipes.map((recipe, idx) => (
                  <div
                    key={idx}
                    data-testid={`recipe-option-${idx}`}
                    className="recipe-option-card"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className="recipe-option-header">
                      <h3 className="recipe-option-name">{recipe.name}</h3>
                      {recipe.safe_for_user && (
                        <span className="badge badge-success">
                          <CheckCircle size={14} />
                        </span>
                      )}
                    </div>

                    {recipe.description && (
                      <p className="recipe-option-description">{recipe.description}</p>
                    )}

                    <div className="recipe-option-meta">
                      {recipe.prep_time && (
                        <span className="meta-tag">
                          <Clock size={14} /> {recipe.prep_time}
                        </span>
                      )}
                      {recipe.cook_time && (
                        <span className="meta-tag">
                          <Clock size={14} /> {recipe.cook_time}
                        </span>
                      )}
                      {recipe.servings && (
                        <span className="meta-tag">
                          <Users size={14} /> {recipe.servings}
                        </span>
                      )}
                    </div>

                    <div className="recipe-option-footer">
                      <span className="view-recipe-text">Click to view full recipe →</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-warning">
                <AlertCircle size={20} />
                <span>No recipes found. Please try a different search.</span>
              </div>
            )}
          </div>
        )}

        {selectedRecipe && (
          <div className="results-section" data-testid="recipe-detail">
            <div style={{ marginBottom: '1.5rem' }}>
              <Button
                onClick={() => setSelectedRecipe(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-4 mb-4"
              >
                ← Back to Options
              </Button>
              <h2 className="section-title">
                <ChefHat size={24} className="mr-2" />
                {selectedRecipe.name}
              </h2>
            </div>

            <div className="recipe-card">
              <div className="recipe-header">
                <h3 className="recipe-name">{selectedRecipe.name}</h3>
                {selectedRecipe.safe_for_user && (
                  <span className="badge badge-success">
                    <CheckCircle size={16} className="mr-1" />
                    Safe for You
                  </span>
                )}
              </div>

              {selectedRecipe.description && (
                <p className="recipe-description">{selectedRecipe.description}</p>
              )}

              <div className="recipe-meta">
                {selectedRecipe.prep_time && (
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>Prep: {selectedRecipe.prep_time}</span>
                  </div>
                )}
                {selectedRecipe.cook_time && (
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>Cook: {selectedRecipe.cook_time}</span>
                  </div>
                )}
                {selectedRecipe.servings && (
                  <div className="meta-item">
                    <Users size={16} />
                    <span>{selectedRecipe.servings}</span>
                  </div>
                )}
              </div>

              {selectedRecipe.allergen_warnings && selectedRecipe.allergen_warnings.length > 0 && (
                <div className="alert alert-info mt-3">
                  <AlertCircle size={18} />
                  <div>
                    <strong>Note:</strong>
                    <ul className="mt-1">
                      {selectedRecipe.allergen_warnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="recipe-section">
                <h4 className="recipe-section-title">Ingredients</h4>
                <ul className="recipe-list">
                  {selectedRecipe.ingredients.map((ingredient, i) => (
                    <li key={i}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div className="recipe-section">
                <h4 className="recipe-section-title">Instructions</h4>
                <ol className="recipe-list recipe-list-numbered">
                  {selectedRecipe.instructions.map((instruction, i) => (
                    <li key={i}>{instruction}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
