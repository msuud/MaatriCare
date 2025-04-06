import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import "../index.css";
import Home from "./Home";
import SymptomChecker from "./SymptomChecker";
// import SettingsSOS from "./SettingsSOS";
import Community from "./Community";
import LoginPage from "./LoginPage";
import PregnancyTracker from "./PregnancyTracker";
import { FaBabyCarriage } from "react-icons/fa";
import SignupPage from "./SignupPage";
import UserProfilePage from "./UserProfilePage";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userProfileRef = doc(db, "userProfiles", currentUser.uid);
          const userProfileSnap = await getDoc(userProfileRef);
          setHasProfile(userProfileSnap.exists());
        } catch (error) {
          console.error("Error checking user profile:", error);
          setHasProfile(false);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user && !hasProfile) {
    return <Navigate to="/profile" />;
  }

  return children;
};

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";
  const isProfilePage = location.pathname === "/profile";
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {})
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-100">
      {!isLoginPage && !isSignupPage && !isProfilePage && (
        <nav className="relative bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 hover:scale-105 transition-transform">
                <FaBabyCarriage className="w-6 h-6 text-purple-800" />
                <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-blue-800 text-transparent bg-clip-text">
                  MaatriCare
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <Link
                  to="/"
                  className="bg-gradient-to-r from-pink-400 to-blue-800 text-white px-6 py-2 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Home
                </Link>
                {currentUser ? (
                  <button
                    onClick={handleSignOut}
                    className="text-pink-700 hover:text-pink-900 hover:-translate-y-0.5 transition-transform"
                  >
                    Logout
                  </button>
                ) : (
                  <Link to="/login">
                    <button className="bg-gradient-to-r from-pink-400 to-blue-800 text-white px-6 py-2 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all">
                      Login
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/symptom-checker"
          element={
            <ProtectedRoute>
              <SymptomChecker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracker"
          element={
            <ProtectedRoute>
              <PregnancyTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/sos" 
          element={
            <ProtectedRoute>
              <SettingsSOS />
            </ProtectedRoute>
          }
        /> */}
      </Routes>
    </div>
  );
};

export default App;
