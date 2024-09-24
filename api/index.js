require('dotenv').config();
const axios = require('axios');

// This function makes the call to the Hugging Face API
async function summarizeText(text) {
    let data = JSON.stringify({
        "inputs": text,
        "parameters": {
            "max_length": 100,
            "min_length": 30
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN
        },
        data: data
    };

    try {
        const response = await axios.request(config);
        return response.data[0].summary_text;
    } catch (error) {
        throw new Error('Error summarizing text: ' + error.message);
    }
}

// Serverless function that responds to POST requests
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const text = req.body.text_to_summarize;

        try {
            const summary = await summarizeText(text);
            res.status(200).json({ summary });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
