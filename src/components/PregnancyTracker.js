import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { FaSpinner } from "react-icons/fa";
import { pregnancyData } from "./pregnancyData";

const PregnancyTracker = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

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

            if (!userProfile.pregnancyWeek || !registrationDate) {
              console.error("Missing pregnancyWeek or registrationDate.");
              setError(
                "Missing pregnancy week or registration date in your profile."
              );
              return;
            }

            const registrationDateObj = new Date(registrationDate);
            const currentDate = new Date();

            const weeksPassed = Math.floor(
              (currentDate - registrationDateObj) / (7 * 24 * 60 * 60 * 1000)
            );

            const currentPregnancyWeek = pregnancyWeek + weeksPassed;
            console.log(currentPregnancyWeek);

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

  const getWeeksToDisplay = () => {
    if (!userData || !userData.currentPregnancyWeek) return [];
    return [
      Math.max(userData.currentPregnancyWeek - 1, 1),
      userData.currentPregnancyWeek,
      Math.min(userData.currentPregnancyWeek + 1, 42),
    ];
  };

  const weeksToDisplay = getWeeksToDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100 relative overflow-hidden px-2 flex flex-col justify-center pt-16 pb-16">
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-40 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
        <div className="absolute top-40 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-6 left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 px-4 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-600 to-blue-800 text-transparent bg-clip-text">
          Welcome to Your Pregnancy Tracker
        </h1>

        {userData && userData.fullName && (
          <h2 className="text-2xl mb-4 text-gray-700">
            Hello, {userData.fullName}!
          </h2>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <FaSpinner className="animate-spin text-4xl text-purple-600" />
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <p className="text-black mb-10 text-xl">
              {userData.pregnancyWeek < 42
                ? "Track your weekly progress and receive personalized tips to support a healthy pregnancy!"
                : "Congratulations! You've reached full term. Your baby is ready to meet you soon!"}
            </p>

            <div className="mb-10">
              <h3 className="text-2xl font-semibold mb-2 text-purple-700">
                Your Progress
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-pink-400 to-blue-800 h-4 rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${Math.min(
                      (userData.pregnancyWeek / 42) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="mt-2 text-gray-600">
                Week {userData.currentPregnancyWeek} of 42
              </p>
            </div>

            {/* Week Cards */}
            <h3 className="text-2xl font-semibold mb-6 text-purple-700">
              {weeksToDisplay.length === 1
                ? "Your Current Week"
                : "Your Previous, Current & Upcoming Weeks"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {weeksToDisplay.map((week) => (
                <WeekCard
                  key={week}
                  weekData={pregnancyData[week] || {}}
                  currentPregnancyWeek={userData.currentPregnancyWeek}
                />
              ))}
            </div>
          </>
        )}
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
      `}</style>
    </div>
  );
};

const WeekCard = ({ weekData, isCurrent, currentPregnancyWeek }) => {
  const {
    week,
    babyDevelopment,
    babySize,
    motherChanges,
    commonSymptoms,
    tipsAndAdvice,
    toDoList,
  } = weekData;

  if (!week) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        Data not available
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg p-6 shadow-lg transition-all duration-300 ${
        week === currentPregnancyWeek
          ? "ring-4 ring-pink-400 transform hover:scale-105"
          : "hover:shadow-xl hover:transform hover:scale-102"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3
          className={`font-semibold text-xl ${
            week === currentPregnancyWeek ? "text-pink-600" : "text-gray-800"
          }`}
        >
          Week {week}
          {week === currentPregnancyWeek ? (
            <span className="ml-2 text-sm bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
              Current
            </span>
          ) : (
            <span className="ml-2 text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
              {week < 42
                ? week < currentPregnancyWeek
                  ? "Previous"
                  : week === currentPregnancyWeek
                  ? "Current"
                  : "Next"
                : "Full Term"}
            </span>
          )}
        </h3>

        <div className="text-right">
          <span className="text-xs text-gray-500">Baby size</span>
          <p className="text-sm font-medium">{babySize}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-purple-700">Baby Development</h4>
          <p className="text-gray-600">{babyDevelopment}</p>
        </div>

        <div>
          <h4 className="font-semibold text-purple-700">Your Changes</h4>
          <p className="text-gray-600">{motherChanges}</p>
        </div>

        <div>
          <h4 className="font-semibold text-purple-700">Common Symptoms</h4>
          <p className="text-gray-600">{commonSymptoms}</p>
        </div>

        <div>
          <h4 className="font-semibold text-purple-700">Tips & Advice</h4>
          <ul className="list-disc pl-5 text-gray-600">
            {tipsAndAdvice?.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-purple-700">To-Do This Week</h4>
          <ul className="list-disc pl-5 text-gray-600">
            {toDoList?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PregnancyTracker;
