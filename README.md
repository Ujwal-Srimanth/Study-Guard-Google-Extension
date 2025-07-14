# 🧠 StudyGuard - A Smart Focus Chrome Extension

**StudyGuard** is a Chrome extension that uses Google's Gemini LLM to help you stay focused during study sessions.

⛔ Blocks distracting websites (like Instagram, memes, etc.)  
✅ Allows educational content (e.g. GeeksforGeeks, YouTube tutorials)

---

## 🔍 Features

- ✅ Uses Gemini 1.5 Flash LLM to determine if a page is educational
- ⛔ Blocks non-relevant websites automatically
- ⚡ Injects full-screen overlay while checking
- 🔓 Automatically allows relevant content (e.g., “C# tutorial on YouTube”)
- 🧠 100% client-side — your data never leaves your machine

---

## 🛠️ Installation (Manual)

1. Clone this repo
2. Go to `chrome://extensions`
3. Enable **Developer mode**
4. Click **"Load unpacked"** and select this folder
5. You're ready to focus!

---


## 📦 Tech Used

- JavaScript
- Chrome Extensions API
- Google Gemini 1.5 Flash (via Generative Language API)

---

## 🔐 Gemini API Key

> Create your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)  
> Then, update `background.js`:
```js
key=YOUR_API_KEY
