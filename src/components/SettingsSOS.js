import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SettingsSOS = () => {
  const [voiceSupport, setVoiceSupport] = useState(true);
  const [language, setLanguage] = useState("english");
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState("");
  const [newName, setNewName] = useState("");
  const [nearbyMedical, setNearbyMedical] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(
            "Unable to access your location. Please enable location services."
          );
          setLoading(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbyMedical = async () => {
      setLoading(true);
      try {
        const response = await fetchMedicalServicesNearLocation(
          userLocation.latitude,
          userLocation.longitude
        );
        setNearbyMedical(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching nearby medical services:", error);
        setLocationError(
          "Error fetching nearby medical services. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchNearbyMedical();
  }, [userLocation]);

  const fetchMedicalServicesNearLocation = async (latitude, longitude) => {
    try {
      const API_KEY = "API_KEY";
      const radius = 5000;
      const types = "hospital,doctor,health";

      const response = await fetch(`link`);

      if (!response.ok) {
        throw new Error("Failed to fetch medical services");
      }

      const data = await response.json();

      return data.results.map((place) => {
        const placeLocation = place.geometry.location;
        const distance = calculateDistance(
          latitude,
          longitude,
          placeLocation.lat,
          placeLocation.lng
        );

        return {
          name: place.name,
          number: place.formatted_phone_number || "Call for information",
          distance: `${distance.toFixed(1)} miles`,
          type: determineType(place.types),
          placeId: place.place_id,
        };
      });
    } catch (error) {
      console.error("Error fetching medical services:", error);

      return [
        {
          name: "City General Hospital",
          number: "555-123-4567",
          distance: "1.2 miles",
          type: "hospital",
        },
        {
          name: "Dr. Sarah Johnson",
          number: "555-987-6543",
          specialty: "Emergency Medicine",
          distance: "0.8 miles",
          type: "doctor",
        },
        {
          name: "Westside Urgent Care",
          number: "555-456-7890",
          distance: "1.5 miles",
          type: "urgent-care",
        },
        {
          name: "Dr. Michael Chen",
          number: "555-222-3333",
          specialty: "General Practice",
          distance: "2.1 miles",
          type: "doctor",
        },
        {
          name: "Memorial Hospital",
          number: "555-789-0123",
          distance: "3.4 miles",
          type: "hospital",
        },
      ];
    }
  };

  const determineType = (types) => {
    if (types.includes("hospital")) return "hospital";
    if (types.includes("doctor")) return "doctor";
    if (types.includes("pharmacy")) return "pharmacy";
    return "medical";
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const addContact = () => {
    if (
      newContact.trim() !== "" &&
      newName.trim() !== "" &&
      !contacts.some((c) => c.number === newContact)
    ) {
      const newContactsList = [
        ...contacts,
        { name: newName, number: newContact },
      ];
      setContacts(newContactsList);
      setNewContact("");
      setNewName("");
    }
  };

  const removeContact = (index) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    setContacts(updatedContacts);
  };

  const handleSOS = () => {
    if (contacts.length > 0) {
      alert(
        `SOS Alert sent to: ${contacts
          .map((c) => `${c.name} (${c.number})`)
          .join(", ")}`
      );
    } else {
      alert("No emergency contacts added!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/4 bg-white p-4 shadow-lg rounded-lg z-10 relative">
        <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-600 to-blue-800 text-transparent bg-clip-text">
          Emergency Contacts
        </h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="Enter phone number"
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
          <button
            onClick={addContact}
            className="mt-2 px-4 py-2 bg-gradient-to-r from-pink-400 via-purple-600 to-blue-800 text-white rounded-full hover:opacity-90 border w-full"
          >
            Add Contact
          </button>
        </div>

        <ul className="max-h-64 overflow-y-auto">
          {contacts.map((contact, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-100 p-2 rounded mb-2"
            >
              <span className="text-sm">
                {contact.name} ({contact.number})
              </span>
              <button
                onClick={() => removeContact(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-40 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
          <div className="absolute top-40 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-6 left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>
        <button
          className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-bold text-xl shadow-lg transition-colors"
          onClick={handleSOS}
        >
          SOS
        </button>
      </div>

      <div className="w-full md:w-1/4 bg-white p-4 shadow-lg rounded-lg z-10 relative">
        <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-600 to-blue-800 text-transparent bg-clip-text">
          Nearby Medical
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : locationError ? (
          <div className="text-red-500 p-3 bg-red-50 rounded-lg text-sm">
            {locationError}
          </div>
        ) : (
          <ul className="max-h-64 overflow-y-auto">
            {nearbyMedical.map((service, index) => (
              <li
                key={index}
                className="bg-gray-50 p-2 rounded-lg mb-2 border-l-4 border-blue-500"
              >
                <div className="font-bold text-sm">{service.name}</div>
                <div className="text-xs text-gray-600">
                  {service.type === "doctor" && service.specialty && (
                    <span>{service.specialty} • </span>
                  )}
                  {service.distance} away
                </div>
                <a
                  href={`tel:${service.number}`}
                  className="text-blue-600 hover:underline inline-block mt-1 text-xs"
                >
                  {service.number}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SettingsSOS;
