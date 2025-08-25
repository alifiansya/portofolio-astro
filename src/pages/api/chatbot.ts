import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        // CV For LLM Data Feed
        const cvPath = path.resolve(process.cwd(), "cv.txt");
        const cvText = fs.readFileSync(cvPath, "utf-8");
        const { message, history, counter } = await request.json();

        const apiKey = import.meta.env.GEMINI_API_KEY;
        const botPrompt = `    
        ${cvText}
        chat history: {${history}}
        chat counter: {${counter}}
        user asks: {${message}}
        `;
        console.log(botPrompt)

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
            method: "POST",
            body: JSON.stringify({
                "contents": [
                  {
                    "parts": [
                      {
                        "text": botPrompt
                      }
                    ]
                  }
                ]
              }),
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": apiKey
            }
        })    
        const botResponse = await response.json()
        const botText = botResponse.candidates[0].content.parts[0].text
        console.log(botText)
    
        return new Response(
            JSON.stringify({ reply: `${botText}` }),
            { status: 200 }
        );
    }
    catch {
        return new Response(
            JSON.stringify({ reply: `Server Error, Please try again later.` }),
            { status: 500 }
        );
    }

};