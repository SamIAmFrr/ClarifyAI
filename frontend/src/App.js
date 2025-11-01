import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/DashboardSimple";
import ProductScanner from "@/components/ProductScanner";
import RecipeFinder from "@/components/RecipeFinder";
import MenuAnalyzer from "@/components/MenuAnalyzer";
import AppLayout from "@/components/AppLayout";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [allergyProfile, setAllergyProfile] = useState(null);
  const [historyTrigger, setHistoryTrigger] = useState(0);

  const triggerHistoryReload = () => {
    setHistoryTrigger(prev => prev + 1);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const checkAuth = async () => {
    // Check for session_id in URL fragment
    const hash = window.location.hash;
    if (hash.includes('session_id=')) {
      const sessionId = hash.split('session_id=')[1].split('&')[0];
      await handleSessionId(sessionId);
      // Clean URL
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }

    // Check existing session
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionId = async (sessionId) => {
    try {
      const response = await axios.post(
        `${API}/auth/session`,
        {},
        { headers: { 'X-Session-ID': sessionId } }
      );
      setUser(response.data.user);
    } catch (error) {
      console.error('Session creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile/allergy`);
      setAllergyProfile(response.data);
    } catch (error) {
      setAllergyProfile(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen" data-testid="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <LandingPage />}
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <AppLayout user={user} setUser={setUser}>
                  <Dashboard allergyProfile={allergyProfile} reloadProfile={loadProfile} />
                </AppLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/product-scanner"
            element={
              user ? (
                <AppLayout user={user} setUser={setUser}>
                  <ProductScanner allergyProfile={allergyProfile} />
                </AppLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/recipe-finder"
            element={
              user ? (
                <AppLayout user={user} setUser={setUser}>
                  <RecipeFinder allergyProfile={allergyProfile} />
                </AppLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/menu-analyzer"
            element={
              user ? (
                <AppLayout user={user} setUser={setUser}>
                  <MenuAnalyzer allergyProfile={allergyProfile} />
                </AppLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
