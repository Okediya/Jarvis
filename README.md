# 🤖 JARVIS — Multimodal Prototype Builder & Visual Teacher

> **Gemini Live Agent Challenge Hackathon Submission**  
> Built with Next.js 15, Gemini Live API, React Three Fiber, and Leaflet

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/Gemini-Live%20API-E63939.svg)](https://ai.google.dev)

---

## 🌟 Overview

**JARVIS** is a real-time multimodal AI agent that transforms voice + video input into live visual prototypes. Speak naturally and watch as Jarvis builds 3D hardware models, generates web applications, plots navigation routes on interactive maps, or teaches you about anything visible on your screen — all in real-time using the Gemini Live API.

### ✨ Key Features

- 🎤 **Voice-first interaction** with real-time streaming via Gemini Live API
- 📹 **Multimodal input**: Audio-only, Video-only, or Both simultaneously
- 🖥️ **Screen sharing**: Share your screen and Jarvis explains what it sees
- 🔧 **3D Hardware Prototypes**: Build cars, planes, gadgets with Three.js
- 💻 **Software Prototypes**: Generate web apps rendered live in a sandbox
- 🏗️ **Conversational App Scaffolding**: Jarvis can actually *build* the real software project locally (Next.js, Vite React, Vue) after prototyping it for you!
- 🗺️ **Navigation Maps**: Plot routes with markers on interactive Leaflet maps
- 📖 **Visual Teacher**: Screen-share mode for learning anything on screen
- ⚡ **Barge-in Interruptions**: Interrupt naturally like a real conversation
- 🎨 **Stunning UI**: Red-black-white theme with smooth animations

---

## 🚀 Quick Start (Under 5 Minutes)

### Prerequisites
- Node.js 18+ installed
- A free Google Gemini API key

### 1. Get a Free Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy your key

### 2. Clone & Setup
```bash
git clone https://github.com/your-username/jarvis.git
cd jarvis
npm install
```

### 3. Configure API Key
Create a `.env.local` file:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### 4. Run Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome.

---

## 🎯 How to Use

### Input Modes
| Mode | Description |
|------|-------------|
| 🎤 Audio | Voice-only interaction |
| 📹 Video | Webcam/Screen share only |
| 🎤📹 Both | Voice + visual input |

### Input Sources
| Source | Description |
|--------|-------------|
| 📷 Webcam | Camera feed for showing physical objects |
| 🖥️ Screen Share | Share your screen for Visual Teacher mode |

### Try These Prompts
- "Build a red sports car with spinning wheels"
- "Turn this into a flying airplane with wings"
- "Create an interactive dashboard web app for a fitness tracker"
- "Navigate from Ibadan to Lagos airport"
- "Share my screen and explain this webpage"
- "Teach me what this code does"
- "Explain this math diagram I'm looking at"

### 🏗️ How to Scaffold Real Projects
Once Jarvis generates a **Software Prototype** for you, it will verbally ask if you want to build it as a real project.
1. Answer "**Yes, let's use Next.js and call it my-new-app.**"
2. Jarvis will execute the CLI scaffolding tool behind the scenes!
3. Check the **parent directory** of your `jarvis/` folder; you will find your newly generated Next.js, Vite React, or Vue application ready to go.

---

## 📖 Visual Teacher Usage Guide

The Visual Teacher mode is a unique feature that lets Jarvis teach you about anything visible on your screen:

1. **Switch to Screen Share** mode using the input source toggle
2. **Select "Both" input mode** so you can speak AND share your screen
3. Click **Connect to Jarvis**
4. **Grant screen sharing permission** when prompted
5. Navigate to any content (code, docs, diagrams, charts, textbooks)
6. Ask Jarvis to explain what it sees:
   - *"What is this code doing?"*
   - *"Explain this diagram to me"*
   - *"Break down the concepts on this page"*
   - *"Help me understand this error message"*

Jarvis will provide structured explanations with key points, maintaining full context for follow-up questions.

---

## 🏗️ Architecture

```
jarvis/
├── public/
│   └── audio/
│       ├── recorder-processor.js    # Mic AudioWorklet
│       └── player-processor.js      # Playback AudioWorklet
├── src/
│   ├── app/
│   │   ├── globals.css              # Theme & Leaflet CSS
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Main page
│   ├── components/
│   │   ├── engines/
│   │   │   ├── HardwareEngine.tsx   # 3D (React Three Fiber)
│   │   │   ├── SoftwareEngine.tsx   # Web app (iframe)
│   │   │   ├── NavigationEngine.tsx # Maps (Leaflet)
│   │   │   └── TeachingEngine.tsx   # Visual Teacher
│   │   ├── PrototypeViewer.tsx      # Engine switcher
│   │   ├── Sidebar.tsx              # Controls & transcript
│   │   ├── StatusIndicator.tsx      # Connection status
│   │   ├── TranscriptPanel.tsx      # Chat history
│   │   └── WaveformVisualizer.tsx   # Audio visualizer
│   ├── hooks/
│   │   └── useGeminiLive.ts         # Gemini Live API hook
│   └── lib/
│       ├── audioPlayer.ts           # Audio playback class
│       ├── audioRecorder.ts         # Audio recording class
│       └── types.ts                 # TypeScript types
├── Dockerfile                       # Cloud Run container
├── cloud-run.yaml                   # Cloud Run config
├── firebase.json                    # Firebase Hosting
├── LICENSE                          # MIT License
└── README.md                        # This file
```

---

## ☁️ Deployment

### Google Cloud Run (Recommended — Free Tier)

**Proof of Deployment:** [Watch Video (hosted in repo)](https://github.com/Okediya/Jarvis/raw/main/public/videos/cloud-proof.mp4)

```bash
# Build the container
docker build -t gcr.io/YOUR_PROJECT/jarvis \
  --build-arg NEXT_PUBLIC_GEMINI_API_KEY=your_key .

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT/jarvis

# Deploy to Cloud Run
gcloud run deploy jarvis \
  --image gcr.io/YOUR_PROJECT/jarvis \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

### Firebase Hosting (Alternative)
```bash
npm run build
npx -y firebase-tools deploy --only hosting
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Next.js 15](https://nextjs.org) | App framework (App Router) |
| [TypeScript](https://typescriptlang.org) | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [@google/genai](https://www.npmjs.com/package/@google/genai) | Gemini Live API SDK |
| [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) | 3D rendering |
| [Three.js](https://threejs.org) | 3D engine |
| [@react-three/drei](https://github.com/pmndrs/drei) | R3F helpers |
| [Leaflet](https://leafletjs.com) | Interactive maps |
| [react-leaflet](https://react-leaflet.js.org) | React bindings for Leaflet |

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

Built for the **Gemini Live Agent Challenge** hackathon.  
