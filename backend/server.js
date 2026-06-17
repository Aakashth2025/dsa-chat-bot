import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import ChatModel from "./models/models.chat.js";

dotenv.config();

const app = express();

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

app.post("/chats/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const chat = await ChatModel.findById(id);
    if (!chat) {
      return res.status(404).json({
        error: "Chat not found",
      });
    }

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const msg = message.toLowerCase().trim();

    chat.messages.push({
      role: "user",
      text: message.trim(),
    });
    if (
      chat.title === "New Chat" &&
      chat.messages.length === 1
    ) {
      chat.title = message.trim().slice(0, 40);
    }

    // Handle greetings without calling Gemini
    const greetings = [
      "hi",
      "hello",
      "hey",
      "hii",
      "heyy",
      "good morning",
      "good afternoon",
      "good evening",
      "hola",
    ];

    if (greetings.includes(msg)) {
      return res.status(200).json({
        answer:
          "Hello! 👋 I'm DSA Mentor AI. I can help you with Data Structures, Algorithms, Dynamic Programming, Graphs, Trees, Competitive Programming, and Coding Interview questions. What would you like to learn today?",
      });
    }

    // Help command
    if (msg === "help") {
      return res.status(200).json({
        answer: `
You can ask me questions about:

• Arrays
• Strings
• Linked Lists
• Stacks & Queues
• Trees & BSTs
• Graphs
• Recursion
• Backtracking
• Dynamic Programming
• Greedy Algorithms
• Segment Trees
• Competitive Programming
• Coding Interview Problems

Example:
- Explain Binary Search
- What is Dynamic Programming?
- BFS vs DFS
- Solve Two Sum in C++
        `,
      });
    }

    const history = chat.messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: history,

      config: {
        systemInstruction: `
You are DSA Mentor AI, an expert Data Structures and Algorithms instructor.

Rules:
1. Answer only questions related to:
   - Data Structures
   - Algorithms
   - Competitive Programming
   - Time and Space Complexity
   - Coding Interviews
   - Problem Solving
   - Programming concepts directly related to DSA

2. If the user asks something unrelated, reply exactly:
"I am sorry, I can only answer questions related to Data Structures and Algorithms."

3. Explain concepts in simple language.

4. Use examples whenever possible.

5. If code is requested:
   - Provide clean code.
   - Prefer C++ unless another language is requested.
   - Explain the approach and complexity.

6. Keep answers beginner-friendly while remaining accurate.
7. Format all answers using markdown.
8. Use headings and bullet points whenever appropriate.
9. Use numbered steps for algorithms.
10. Put code inside markdown code blocks.
11. When providing code, always format code properly, use indentation and never compress code into a single line.
for example, instead of writing:
int main(){int n;cin>>n;vector<int>v(n);for(int i=0;i<n;i++)cin>>v[i];sort(v.begin(),v.end());for(int i=0;i<n;i++)cout<<v[i]<<" ";return 0;}
You should write:
\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int i = 0; i < n; i++)
        cin >> v[i];
    sort(v.begin(), v.end());
    for (int i = 0; i < n; i++)
        cout << v[i] << " ";
    return 0;
`,
      },
    });

    chat.messages.push({
      role: "bot",
      text: response.text,
    });

    await chat.save();

    return res.status(200).json({
      answer: response.text,
    });
  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

app.post("/chats", async (req, res) => {
  try {
    const chat = await ChatModel.create({
      title: "New Chat",
      messages: [],
    });

    return res.status(201).json(chat);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

app.post("/new-chat", async (req, res) => {
  try {
    const chat = await ChatModel.create({
      title: "New Chat",
      messages: []
    });
    return res.status(200).json(chat);
  }
  catch (error) {
    console.error("Error creating new chat:", error);
    return res.status(500).json({
      error: "Failed to create new chat",
    });
  }
});

app.get("/chats", async (req, res) => {
  try {
    const chats = await ChatModel.find().sort({ createdAt: -1 });
    return res.status(200).json(chats);
  }
  catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({
      error: "Failed to fetch chats",
    });
  }
});

app.get("/chats/:id", async (req, res) => {
  try {
    const chat = await ChatModel.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found",
      });
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to fetch chat",
    });
  }
});

app.delete("/chats/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await ChatModel.findByIdAndDelete(id);
    if (!chat) {
      return res.status(404).json({
        error: "Chat not found"
      });
    }
    return res.status(200).json({
      message: "Chat deleted succesfully"
    });
  }
  catch(err){
    console.error(error);
    return req.status(500).json({
      error: "Internal server error"
    });
  }
})

app.get("/", (req, res) => {
  res.send("DSA Mentor AI Backend is running 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});