import React, { useState } from "react";

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  const GEMINI_API_URL = process.env.REACT_APP_GEMINI_API_URL;

  const formatResponse = (text) => {
    if (!text) return "";

    const cleanedText = text
      .replace(/\*\*\*(.*?)\*\*\*/g, "<strong>$1:</strong>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

    return cleanedText;
  };

  const getGuidance = async () => {
    if (!symptoms.trim()) {
      setResponse("Please enter your symptoms.");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `You are a helpful medical assistant for MaatriCare. Provide brief, informative guidance for the following health concern: ${symptoms}

Instructions for your response:
1. Format your response in clean paragraphs without using markdown syntax like asterisks.
2. Include these sections: Possible Causes, When to Seek Medical Attention, and Basic Care Advice.
3. Use clear, professional medical language but make it easy for patients to understand.
4. Keep your response concise and well-organized.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 32,
          topP: 1,
          maxOutputTokens: 800,
        },
      };

      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        const geminiResponse = data.candidates[0].content.parts[0].text;
        setResponse(formatResponse(geminiResponse) || "No response received.");
      } else {
        setResponse(data.error?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse("Error connecting to Gemini API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100 flex justify-center items-center px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl border border-gray-200 mx-auto">
        <div className="w-full">
          <div className="bg-white rounded-lg w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-purple-600 to-blue-800 text-transparent bg-clip-text text-center">
              AI Symptom Checker
            </h2>

            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Enter your symptoms here..."
                  className="w-full p-4 border rounded-lg mb-4 h-48"
                />

                <div className="text-center w-full">
                  <button
                    onClick={getGuidance}
                    className="px-6 py-3 bg-gradient-to-r from-pink-400 via-purple-600 to-blue-800 text-white rounded-full hover:opacity-90 border transition-opacity"
                    disabled={loading}
                  >
                    {loading ? "Getting advice..." : "Get Guidance"}
                  </button>
                </div>
              </div>

              <div className="h-full">
                <div
                  className={`h-full p-4 border rounded-lg bg-gray-50 flex flex-col ${
                    response ? "border-blue-200" : "border-gray-200"
                  }`}
                >
                  <h3 className="font-semibold text-lg mb-2">Response:</h3>
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-pulse text-gray-500">
                        Processing your query...
                      </div>
                    </div>
                  ) : response ? (
                    <div className="overflow-y-auto max-h-64">
                      <p className="whitespace-pre-line text-gray-700">
                        {response}
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-400 flex justify-center items-center h-full">
                      Enter your symptoms and click "Get Guidance" to receive
                      advice
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
