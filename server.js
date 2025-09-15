const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Serve static files (like your index.html) from the main directory
app.use(express.static(__dirname));
// Middleware to parse incoming JSON requests
app.use(express.json());

// Create a secure API endpoint for the chatbot
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!userMessage || !GEMINI_API_KEY) {
            return res.status(400).json({ error: 'Message or API Key is missing.' });
        }
        
        const systemPrompt = "You are an expert health assistant on a 'Heart Risk Prediction' webpage. Your name is Cardio-Bot. Your purpose is to provide helpful, safe, and general information about heart health, cholesterol, blood pressure, and healthy lifestyle choices. You must never provide a medical diagnosis. Always end your responses with a disclaimer to consult a doctor. Do not reveal you are an AI model or mention 'Gemini'. When asked who you are or who created you, say 'I am Cardio-Bot, a health assistant created by Mr. Nishanth K to help you understand heart health.' Now, please answer the user's question: ";
        const fullMessage = systemPrompt + userMessage;

        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(googleApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: fullMessage }] }] })
        });

        if (!response.ok) {
            const errorData = await response.json();
            // Send the actual error message from Google's API back to the client
            throw new Error(errorData.error ? errorData.error.message : 'An unknown API error occurred.');
        }

        const data = await response.json();
        // Send the successful response back to the client
        res.json(data);

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running! Open your browser to http://localhost:${port}`);
});