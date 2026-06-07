import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({
        error: "Question is required",
      });
    }

    const msg = question.toLowerCase().trim();

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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: question,

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

app.get("/", (req, res) => {
  res.send("DSA Mentor AI Backend is running 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});