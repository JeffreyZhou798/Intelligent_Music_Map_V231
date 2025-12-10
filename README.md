# Intelligent Music Map

AI-powered music education tool based on Orff Schulwerk approach for visual music structure mapping.

## Overview

This project implements a **zero-shot learning + pre-trained large model + pseudo-reinforcement learning** lightweight pure frontend architecture. It uses Zhipu AI GLM-4.5-air for music analysis without any custom model training, GPU deployment, or labeled data.

### Core Design Principles

- **Zero-Shot Inference**: Relies entirely on pre-trained models, no training or backpropagation
- **Symbol + Audio Dual-Modality Fusion**: Combines MusicXML symbolic structure with MP3 acoustic features
- **Chunk-by-Chunk Processing**: Avoids memory overflow for large compositions
- **Pseudo-Reinforcement Learning**: Learns user preferences through interaction feedback

## Features

### Music Analysis (AI-Powered)
- **Structure Detection**: Motives → Sub-phrases → Phrases → Periods → Themes
- **Emotion Recognition**: Happy, Sad, Excited, Peaceful, Tense
- **Similarity Grouping**: Groups A, B, C, D... based on melodic, rhythmic, harmonic features
- **Form Identification**: Sonata Form, Rondo Form, Binary Form, etc.
- **Confidence Visualization**: Solid/dashed borders based on AI confidence scores

### Visual Mapping
- **AI Recommendations**: 3-5 visual schemes per structure (shapes + colors + animations)
- **Custom Design**: Drag-and-drop visual element editor
- **Batch Operations**: 
  - "Apply to All Same Emotion" - Apply to structures with same emotion
  - "Apply to Related Structures" - Apply to similar structure groups
- **Shape Library**: Circle, Square, Triangle, Star, Diamond, Hexagon, Pentagon
- **Color Mapping**: Warm colors for happy/excited, cool colors for sad/peaceful
- **Animations**: Pulse, Flash, Rotate, Bounce, Scale, Slide, Shake, Fade

### Interactive Preview
- **Three-Window Synchronized Playback**:
  - Score View (measure tracking)
  - Audio Playback (with progress bar)
  - Visual Music Map (animated elements)
- **Click-to-Jump**: Click any structure to sync all three views

### Export Options
- **JSON (.mvt)**: Machine-readable, supports re-import
- **Interactive HTML**: Offline playable
- **SVG/PNG**: Visual map images
- **Annotated MusicXML**: Compatible with MuseScore, Finale

## Architecture

### Three-Layer AI Model Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PERCEPTION LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ MusicXML    │  │ Audio       │  │ Multimodal          │  │
│  │ Parser      │  │ Analyzer    │  │ Fusion              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      LOGIC LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Structure   │  │ Emotion     │  │ Similarity          │  │
│  │ Segmentation│  │ Recognition │  │ Analyzer            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                    (Zhipu AI GLM-4.5-air)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    OPERATION LAYER                           │
│  ┌─────────────┐  ┌─────────────────────────────────────┐   │
│  │ Visual      │  │ Pseudo-RL Preference Learner        │   │
│  │ Recommender │  │ (Reward: +1 accept, +0.5 modify, -1)│   │
│  └─────────────┘  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### CORS Solution

```
User Browser → Vercel Frontend → Vercel Serverless Function → Zhipu AI API
                                        (/api/zhipu.js)
```

- No CORS issues (same-origin request to Vercel)
- API key stored securely in environment variables
- Rate limiting and logging supported

## Quick Start

### Prerequisites
- Node.js 18+
- Zhipu AI API Key (get from https://open.bigmodel.cn)

### Local Development

1. **Install dependencies:**
```bash
cd intelligent-music-map-V231
npm install
```

2. **Start local proxy server (for API calls):**
```bash
# Set API key and start proxy
# Windows PowerShell:
$env:ZHIPU_API_KEY='your_api_key_here'; node local-proxy.js

# Linux/Mac:
ZHIPU_API_KEY='your_api_key_here' node local-proxy.js
```

3. **Start development server (in another terminal):**
```bash
npm run dev
```

4. **Open browser:** http://localhost:3000

### Test with Sample Files

Use the Mozart K.545 files in `CompositionExamples/`:
- `Mozart Piano K.545 First Movement/sonata-no-16-1st-movement-k-545.mxl`
- `Mozart Piano K.545 First Movement/sonata-no-16-1st-movement-k-545.mp3`

## Deployment

### Vercel Deployment (Recommended)

1. Push code to GitHub

2. Import project in Vercel dashboard

3. **Add environment variable:**
   - Key: `ZHIPU_API_KEY`
   - Value: Your Zhipu AI API key

4. Deploy!

The serverless function at `/api/zhipu.js` handles API calls securely.

### GitHub Pages Deployment

```bash
npm run deploy
```

Note: GitHub Pages requires mock mode or external proxy server.

## Project Structure

```
intelligent-music-map-V231/
├── api/
│   └── zhipu.js              # Vercel Serverless Function (API proxy)
├── src/
│   ├── components/
│   │   ├── VisualizationEditor.vue  # Visual element editor
│   │   ├── PlaybackPreview.vue      # Three-window preview
│   │   ├── ExportPanel.vue          # Export options
│   │   └── ApiKeyDialog.vue         # API key input
│   ├── services/
│   │   ├── ZhipuAIService.ts        # Zhipu AI API calls
│   │   ├── MockAIService.ts         # Local fallback algorithms
│   │   ├── MusicAnalysisEngine.ts   # Music structure analysis
│   │   ├── PreferenceLearner.ts     # Pseudo-RL system
│   │   ├── FileService.ts           # MusicXML parsing
│   │   ├── AudioService.ts          # MP3 processing
│   │   └── VisualizationService.ts  # SVG/PNG generation
│   ├── stores/
│   │   ├── music.ts                 # Music data state
│   │   ├── visual.ts                # Visual mappings state
│   │   └── user.ts                  # User preferences state
│   ├── types/
│   │   └── index.ts                 # TypeScript definitions
│   └── views/
│       └── Home.vue                 # Main workflow page
├── local-proxy.js            # Local development proxy server
├── vercel.json               # Vercel configuration
└── package.json
```

## Technology Stack

| Category | Technology |
|----------|------------|
| Frontend | Vue 3 + TypeScript + Vite |
| UI Framework | Element Plus |
| Animation | GSAP |
| Visualization | D3.js, SVG |
| State Management | Pinia |
| AI Model | Zhipu AI GLM-4.5-air |
| Deployment | Vercel Serverless |
| Storage | LocalStorage, IndexedDB |

## Configuration

Edit `src/config.ts`:

```typescript
export const config = {
  zhipuAI: {
    USE_PROXY: true,           // Use proxy to avoid CORS
    MODEL: 'glm-4.5-air'       // AI model
  },
  dev: {
    ENABLE_LOGS: true,         // Console logging
    ENABLE_MOCK_MODE: false    // Use mock data (no API needed)
  }
}
```

## Workflow

1. **Upload**: MusicXML (.mxl/.musicxml) + MP3 (optional)
2. **Analyze**: AI detects structures, emotions, similarities
3. **Visualize**: Select/customize visual elements for each structure
4. **Preview**: Three-window synchronized playback
5. **Export**: Save as JSON/HTML/MusicXML

## Pseudo-Reinforcement Learning

The system learns user preferences during each editing session:

| User Action | Reward | Effect |
|-------------|--------|--------|
| Accept AI recommendation | +1 | Increase preference for selected elements |
| Modify but keep similar | +0.5 | Slight increase for kept elements |
| Reject and choose different | -1 | Decrease preference for rejected elements |

Preferences are session-based and cleared after export.

## Browser Compatibility

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Author

Zhou Zhiyu - Music Education & AI Research
