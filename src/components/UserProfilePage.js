import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBabyCarriage } from "react-icons/fa";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [pregnancyWeek, setPregnancyWeek] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !pregnancyWeek) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const user = auth.currentUser;

      if (!user) {
        setError("No authenticated user found!");
        setIsLoading(false);
        return;
      }

      const currentDate = new Date();

      await setDoc(doc(db, "userProfiles", user.uid), {
        fullName,
        pregnancyWeek: parseInt(pregnancyWeek) || 1,
        phoneNumber: user.phoneNumber,
        uid: user.uid,
        createdAt: new Date(),
        registrationDate: new Date().toISOString(),
      });

      navigate("/");
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-400">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-400/30 to-purple-500/30 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-blue-500/30 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>

        <div className="absolute top-1/4 left-1/4 w-12 h-12 border-4 border-white/20 rounded-lg rotate-12 animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-16 h-16 border-4 border-white/20 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 border-4 border-white/20 rounded-xl rotate-45 animate-float animation-delay-4000"></div>
      </div>

      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-3xl p-6">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <FaBabyCarriage className="w-5 h-5 text-purple-800" />
              <span className="text-md font-semibold text-gray-800">
                MaatriCare
              </span>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-4">
              Just a few more details to get you started!
            </h1>

            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 transition-all outline-none"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Pregnancy Stage (in weeks)
                </label>
                <input
                  type="number"
                  min="1"
                  max="42"
                  value={pregnancyWeek}
                  onChange={(e) => setPregnancyWeek(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 transition-all outline-none"
                  placeholder="Enter pregnancy week (1-42)"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-sm bg-gradient-to-r from-pink-400 to-blue-800 text-white py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
              >
                {isLoading ? "Saving..." : "Complete Profile"}
              </button>
            </form>
          </div>

          <div className="hidden md:block w-1/2 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm relative">
            <img
              src="/assets/motherandchild.png"
              alt="Mother and child"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default UserProfilePage;
