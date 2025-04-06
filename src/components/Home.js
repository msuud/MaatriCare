import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const Home = () => {
  const featuresSectionRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userProfileRef = doc(db, "userProfiles", user.uid);
          const userProfileSnap = await getDoc(userProfileRef);

          if (userProfileSnap.exists()) {
            const userProfile = userProfileSnap.data();

            const pregnancyWeek = userProfile.pregnancyWeek
              ? parseInt(userProfile.pregnancyWeek)
              : 1;
            const registrationDate = userProfile.registrationDate
              ? new Date(userProfile.registrationDate)
              : userProfile.createdAt?.seconds
              ? new Date(userProfile.createdAt.seconds * 1000)
              : undefined;
            console.log("User Profile:", userProfile);
            console.log("Pregnancy Week:", pregnancyWeek);
            console.log("Registration Date:", registrationDate);

            if (!userProfile.pregnancyWeek || !registrationDate) {
              console.error("Missing pregnancyWeek or registrationDate.");

              return;
            }

            const registrationDateObj = new Date(registrationDate);
            const currentDate = new Date();

            const weeksPassed = Math.floor(
              (currentDate - registrationDateObj) / (7 * 24 * 60 * 60 * 1000)
            );

            const currentPregnancyWeek = pregnancyWeek + weeksPassed;

            setUserData({
              ...userProfile,
              currentPregnancyWeek: Math.min(currentPregnancyWeek, 42),
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const scrollToFeatures = () => {
    featuresSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const calculateDueDate = (pregnancyWeek) => {
    if (!pregnancyWeek) return null;
    const currentDate = new Date();
    const weeksRemaining = 40 - pregnancyWeek;
    const dueDate = new Date(
      currentDate.getTime() + weeksRemaining * 7 * 24 * 60 * 60 * 1000
    );
    return dueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden p-1">
      <div className="absolute inset-0">
        <div className="absolute top-20 right-40 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        {userData && (
          <div className="mb-8 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-pink-400 to-blue-800 text-transparent bg-clip-text">
              Welcome, {userData.fullName}!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-pink-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Current Pregnancy Week</p>
                <p className="text-3xl font-bold text-pink-600">
                  {userData.currentPregnancyWeek}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Estimated Due Date</p>
                <p className="text-xl font-bold text-blue-600">
                  {calculateDueDate(userData.currentPregnancyWeek)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Trimester</p>
                <p className="text-xl font-bold text-purple-600">
                  {userData.pregnancyWeek <= 12
                    ? "First"
                    : userData.pregnancyWeek <= 27
                    ? "Second"
                    : "Third"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="w-1/2 animate-fade-in-left">
            <h1 className="text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-400 to-blue-800 text-transparent bg-clip-text">
                Your Health
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-800 to-pink-400 text-transparent bg-clip-text">
                is Our Priority
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-14 max-w-lg">
              Enhancing maternal and newborn health support through AI-powered
              solutions, providing a seamless and informed experience for
              mothers and their infants.
            </p>
            <button
              onClick={scrollToFeatures}
              className="bg-gradient-to-r from-pink-400 to-blue-800 text-white px-8 py-4 rounded-full text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all animate-bounce"
            >
              Get Started
            </button>
          </div>
          <div className="w-1/2 px-20 animate-fade-in-right">
            <div className="relative w-[600px] h-[500px] overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-white/30 to-blue-50/30 mix-blend-overlay z-10"></div>
              <img
                src="/assets/home.png"
                alt="Mother and Child"
                className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-90 filter brightness-110 contrast-90"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        ref={featuresSectionRef}
        className="relative max-w-7xl mx-auto px-4 py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 justify-items-center">
          {[
            {
              title: "AI Symptom Checker and SMS support",
              description:
                "Our AI-powered symptom checker provides valuable insights to help you better understand your health. And our SMS support system ensures you never miss a beat!",
              icon: "/assets/ai.png",
              delay: "delay-0",
              link: "/symptom-checker",
            },
            {
              title: "Pregnancy Tracker",
              description:
                "Stay informed and prepared throughout your pregnancy journey with our pregnancy tracker. Monitor key milestones and ensure a healthy experience for both you and your baby!",
              icon: "/assets/track.png",
              delay: "delay-150",
              link: "/tracker",
            },
            {
              title: "Global Health Community of Mothers",
              description:
                "Connect with a supportive community of mothers nationwide to share experiences and advice!",
              icon: "/assets/community.png",
              delay: "delay-300",
              link: "/community",
            },
            // {
            //   title: "AI-based Emergency Alert System",
            //   description:
            //     "Notify hospitals, doctors, or family members in case of high-risk pregnancy symptoms!",
            //   icon: "/assets/sos.png",
            //   delay: "delay-300",
            //   link: "/sos",
            // },
          ].map((feature, index) => (
            <div
              key={index}
              className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up ${feature.delay}`}
            >
              <Link to={feature.link}>
                <div className="p-8">
                  <div className="w-32 h-32 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={feature.icon}
                      alt={feature.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-pink-400 to-blue-800 text-transparent bg-clip-text">
                    {feature.title}
                  </h2>
                  <p className="text-gray-600 text-center">
                    {feature.description}
                  </p>
                </div>
              </Link>
            </div>
          ))}
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
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in-left {
          animation: fadeInLeft 1s ease-out;
        }
        .animate-fade-in-right {
          animation: fadeInRight 1s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out;
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
