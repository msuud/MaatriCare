# 🌸MaatriCare — AI-Powered Maternal Health Support System
Infant mortality remains a significant public health challenge worldwide, especially in underserved regions where limited healthcare access, socioeconomic barriers, and low maternal awareness prevent timely interventions.

MaatriCare is an AI-driven maternal and child healthcare platform designed to provide comprehensive prenatal and postnatal support through both a web-based interface and an offline SMS-based system, ensuring accessibility even for users without smartphones or internet access.

## SMS Functionality (Offline Support)
We used MacroDroid on an Android phone to enable offline SMS support.
### How it works:
- A user sends an SMS to our project’s dedicated phone number.
- MacroDroid is set to trigger when an SMS is received.
- It captures the SMS text and sends it as a prompt to the Gemini API using an HTTP request.
- The Gemini API processes the input and returns a response (advice, guidance, or emergency suggestion).
- MacroDroid reads this response and sends it back to the user via SMS.
- This enables AI-powered health support through simple SMS, even without internet access.


## Key Features
- AI-Powered Symptom Triage & Health Guidance
- Personalized Pregnancy Tracking
- Global Community connecting mothers wordlwide
- Offline SMS and multi-lingual support for remote accessibility

## Tech Stack
- Frontend - React.js
- Backend - Node.js (Express)
- AI/NLP - Gemini API
- Database - Firebase

## How to Use
1. Clone the Repository
2. Install Dependencies using npm nstall
3. Set up Environment Variables by creating a .env file in the main project folder
4. Run the Application using npm start

## Screenshots for preview:
![Screenshot 2025-04-06 190812](https://github.com/user-attachments/assets/fec8fb1a-ab6a-4dec-b6e5-773ebc6f6d1d)
![image](https://github.com/user-attachments/assets/4d2d34f1-5824-4ac6-9334-64b87ed39942)
![image](https://github.com/user-attachments/assets/271553e1-4ad0-43f1-be03-47d89b15e259)
![image](https://github.com/user-attachments/assets/671d6af0-8371-487a-8871-3263603c9699)
![image](https://github.com/user-attachments/assets/e5764777-0386-4e90-ac6a-290914b8766c)
![image](https://github.com/user-attachments/assets/fa0c2130-41fc-4495-b6cf-9d2170bf0b99)
![WhatsApp Image 2025-04-06 at 19 15 21_9a6b93c2](https://github.com/user-attachments/assets/878040e9-3569-4383-850a-30d24c8b6f00)
![WhatsApp Image 2025-04-06 at 19 15 21_877fe0e4](https://github.com/user-attachments/assets/eacdf012-8e0f-4e9d-96ad-87c25b691724)










