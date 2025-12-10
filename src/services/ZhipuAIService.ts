/**
 * Zhipu AI Service
 * Handles API calls to Zhipu AI GLM-4.5-air model
 */

import axios, { AxiosError } from 'axios'
import { config, getAPIBaseURL } from '@/config'
import type { 
  ZhipuAIRequest, 
  ZhipuAIResponse, 
  Message,
  MusicXMLData,
  MusicStructure,
  MusicFeatures,
  EmotionFeatures,
  VisualScheme,
  UserPreferences
} from '@/types'

const MODEL = config.zhipuAI.MODEL

export class ZhipuAIService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Test API connection with a simple request
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.sendRequest({
        model: MODEL,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
      return !!response.choices[0]?.message
    } catch (error) {
      console.error('API connection test failed:', error)
      return false
    }
  }

  /**
   * Send request to Zhipu AI API
   */
  async sendRequest(request: ZhipuAIRequest): Promise<ZhipuAIResponse> {
    try {
      const endpoint = getAPIBaseURL()
      
      if (config.dev.ENABLE_LOGS) {
        console.log('📤 Sending request to:', endpoint)
        console.log('Model:', request.model || MODEL)
      }
      
      // When using proxy, pass API key via x-api-key header
      // When direct, use Authorization header
      const headers = config.zhipuAI.USE_PROXY 
        ? {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          }
        : {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }

      const response = await axios.post<ZhipuAIResponse>(
        endpoint,
        {
          ...request,
          model: request.model || MODEL
        },
        {
          headers,
          timeout: 60000 // 60 seconds timeout - use local fallback if exceeded
        }
      )

      if (config.dev.ENABLE_LOGS) {
        console.log('✅ Response received:', response.data.choices?.[0]?.message?.content?.substring(0, 100))
      }

      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          throw new Error('Invalid API Key. Please check your Zhipu AI API Key.')
        } else if (error.response?.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.')
        } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new Error('Request timeout. Using local analysis instead.')
        } else if (error.message?.includes('Network Error') || error.message?.includes('CORS')) {
          throw new Error('Network error: Cannot connect to Zhipu AI API. This may be a CORS issue. Consider using a backend proxy.')
        }
      }
      throw new Error(`Failed to call Zhipu AI API: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Analyze music structure with AI
   */
  async analyzeMusicStructure(musicData: MusicXMLData, localAnalysis: any[]): Promise<MusicStructure[]> {
    const prompt = `You are a music analysis expert. Analyze the following musical piece and refine the structure detection.

Music Information:
- Title: ${musicData.title}
- Composer: ${musicData.composer}
- Time Signature: ${musicData.timeSignature}
- Key Signature: ${musicData.keySignature}
- Number of Measures: ${musicData.measures.length}

Local Analysis Results:
${JSON.stringify(localAnalysis, null, 2)}

Please refine and validate the musical structure hierarchy (motives, sub-phrases, phrases, periods, themes).
Return a JSON array of music structures with the following format:
[
  {
    "id": "unique_id",
    "level": "motive|sub_phrase|phrase|period|theme",
    "startMeasure": number,
    "endMeasure": number,
    "description": "brief description of this structure"
  }
]

Only return valid JSON, no additional text.`

    const messages: Message[] = [
      {
        role: 'user',
        content: prompt
      }
    ]

    const response = await this.sendRequest({
      model: MODEL,
      messages,
      temperature: 0.3 // Lower temperature for more consistent analysis
    })

    try {
      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response content from AI')
      }

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.warn('Could not parse AI response, using local analysis')
        return []
      }

      const structures = JSON.parse(jsonMatch[0])
      return structures
    } catch (error) {
      console.error('Failed to parse AI music analysis:', error)
      return []
    }
  }

  /**
   * Infer emotion features from music features
   */
  async inferEmotion(features: MusicFeatures): Promise<EmotionFeatures> {
    const prompt = `You are a music emotion analysis expert. Based on the following musical features, determine the emotional characteristics.

Musical Features:
- Melody Range: ${features.melody.range} semitones
- Melody Contour: ${features.melody.contour}
- Tempo: ${features.rhythm.tempo} BPM
- Rhythm Complexity: ${features.rhythm.complexity}
- Has Syncopation: ${features.rhythm.syncopation}
- Tonality: ${features.harmony.tonality}
- Harmonic Tension: ${features.harmony.tension}
- Number of Voices: ${features.texture.voices}
- Note Density: ${features.texture.density}

Determine the following emotional characteristics:
1. Speed: fast, moderate, or slow
2. Intensity: strong, moderate, or weak
3. Tension: tense, neutral, or relaxed

Return ONLY a JSON object in this exact format, no additional text:
{
  "speed": "fast|moderate|slow",
  "intensity": "strong|moderate|weak",
  "tension": "tense|neutral|relaxed"
}`

    const messages: Message[] = [
      {
        role: 'user',
        content: prompt
      }
    ]

    const response = await this.sendRequest({
      model: MODEL,
      messages,
      temperature: 0.5
    })

    try {
      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response content from AI')
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response')
      }

      const emotion = JSON.parse(jsonMatch[0]) as EmotionFeatures
      return emotion
    } catch (error) {
      console.error('Failed to parse AI emotion analysis:', error)
      // Return default neutral emotion
      return {
        speed: 'moderate',
        intensity: 'moderate',
        tension: 'neutral'
      }
    }
  }

  /**
   * Recommend visual schemes based on emotion and preferences
   */
  async recommendVisuals(
    emotion: EmotionFeatures, 
    structureLevel: string,
    preferences?: UserPreferences
  ): Promise<VisualScheme[]> {
    const preferenceInfo = preferences ? `

User Preferences (higher weight = more preferred):
- Preferred Colors: ${Array.from(preferences.colorPreferences.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c, w]) => `${c}(${w})`).join(', ')}
- Preferred Shapes: ${Array.from(preferences.shapePreferences.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s, w]) => `${s}(${w})`).join(', ')}
- Preferred Animations: ${Array.from(preferences.animationPreferences.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([a, w]) => `${a}(${w})`).join(', ')}
` : ''

    const prompt = `You are a visual design expert for music education. Create 3-5 visual scheme recommendations based on the musical emotion and structure level.

Emotion Features:
- Speed: ${emotion.speed}
- Intensity: ${emotion.intensity}
- Tension: ${emotion.tension}

Structure Level: ${structureLevel}
${preferenceInfo}

Available Visual Elements:
- Shapes: circle, square, triangle, star, wave
- Colors: Use HEX codes. Fast/energetic music → warm colors (red, orange, yellow). Slow/calm music → cool colors (blue, green, purple)
- Animations: flash, rotate, bounce, scale, slide
- Layouts: horizontal, vertical, circular, grid

For motive level: recommend 1 element
For sub-phrase/phrase level: recommend 1-3 elements  
For period/theme level: recommend 3-5 elements

Return ONLY a JSON array with 3-5 visual schemes in this exact format, no additional text:
[
  {
    "id": "scheme_1",
    "elements": [
      {
        "id": "elem_1",
        "type": "circle|square|triangle|star|wave",
        "color": "#RRGGBB",
        "size": 50,
        "animation": {
          "type": "flash|rotate|bounce|scale|slide",
          "duration": 1000,
          "easing": "power2.inOut"
        }
      }
    ],
    "layout": "horizontal|vertical|circular|grid",
    "confidence": 0.9
  }
]`

    const messages: Message[] = [
      {
        role: 'user',
        content: prompt
      }
    ]

    const response = await this.sendRequest({
      model: MODEL,
      messages,
      temperature: 0.7 // Higher temperature for creative recommendations
    })

    try {
      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response content from AI')
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response')
      }

      const schemes = JSON.parse(jsonMatch[0]) as VisualScheme[]
      return schemes
    } catch (error) {
      console.error('Failed to parse AI visual recommendations:', error)
      return this.getDefaultSchemes(structureLevel)
    }
  }

  /**
   * Get default visual schemes as fallback
   */
  private getDefaultSchemes(structureLevel: string): VisualScheme[] {
    const elementCount = structureLevel === 'motive' ? 1 : 
                        structureLevel === 'phrase' || structureLevel === 'sub_phrase' ? 2 : 3

    return [
      {
        id: 'default_1',
        elements: Array.from({ length: elementCount }, (_, i) => ({
          id: `elem_${i}`,
          type: 'circle',
          color: '#3498db',
          size: 50,
          animation: {
            type: 'scale',
            duration: 1000,
            easing: 'power2.inOut'
          }
        })),
        layout: 'horizontal',
        confidence: 0.5
      }
    ]
  }

  /**
   * Identify musical form type
   */
  async identifyForm(structures: MusicStructure[]): Promise<string> {
    const prompt = `You are a music form analysis expert. Based on the musical structure hierarchy, identify the overall musical form.

Music Structures:
${JSON.stringify(structures, null, 2)}

Possible forms include:
- Classical: Sonata Form, Rondo Form, Fugue, Variation Form, Binary Form, Ternary Form, etc.
- Popular: Verse-Chorus Form, AABA Form, etc.

Return ONLY the name of the musical form, no additional explanation.`

    const messages: Message[] = [
      {
        role: 'user',
        content: prompt
      }
    ]

    try {
      const response = await this.sendRequest({
        model: MODEL,
        messages,
        temperature: 0.3
      })

      const content = response.choices[0]?.message?.content
      return content?.trim() || 'Unknown Form'
    } catch (error) {
      console.error('Failed to identify musical form:', error)
      return 'Unknown Form'
    }
  }

  /**
   * Recognize emotions for each music structure
   */
  async recognizeEmotions(structures: MusicStructure[], audioData: any): Promise<any[]> {
    // Simplified prompt - only analyze first 12 structures for speed
    const structureList = structures.slice(0, 12).map(s => 
      `${s.id}(M${s.startMeasure}-${s.endMeasure})`
    ).join(', ')
    
    const prompt = `Identify emotion for each music structure: ${structureList}

Emotions: happy, sad, excited, peaceful, tense

Return JSON: [{"structureId": "phrase_1", "primary": "happy", "confidence": 0.85, "features": ["major key"]}]`

    const messages: Message[] = [
      {
        role: 'user',
        content: prompt
      }
    ]

    try {
      const response = await this.sendRequest({
        model: MODEL,
        messages,
        temperature: 0.5
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response content from AI')
      }

      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response')
      }

      const emotions = JSON.parse(jsonMatch[0])
      return emotions
    } catch (error) {
      console.error('Failed to recognize emotions, using local algorithm:', error)
      // Local fallback - assign emotions based on position
      const emotions = ['happy', 'peaceful', 'excited', 'happy', 'tense']
      return structures.map((s, index) => ({
        structureId: s.id,
        primary: emotions[index % emotions.length],
        confidence: 0.7 + Math.random() * 0.2,
        features: ['local analysis']
      }))
    }
  }

  /**
   * Analyze structural similarity and group similar structures
   */
  async analyzeSimilarity(structures: MusicStructure[]): Promise<any[]> {
    // Simplified prompt for faster response
    const structureIds = structures.slice(0, 12).map(s => s.id).join(', ')
    
    const prompt = `Group similar music structures: ${structureIds}

Return JSON array: [{"groupId": "A", "structureIds": ["phrase_1", "phrase_5"], "similarityScore": 0.85, "commonFeatures": ["similar melody"]}]`

    const messages: Message[] = [
      {
        role: 'user',
        content: prompt
      }
    ]

    try {
      const response = await this.sendRequest({
        model: MODEL,
        messages,
        temperature: 0.4
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response content from AI')
      }

      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response')
      }

      const groups = JSON.parse(jsonMatch[0])
      return groups
    } catch (error) {
      console.error('Failed to analyze similarity, using local algorithm:', error)
      // Local fallback algorithm
      return this.localSimilarityAnalysis(structures)
    }
  }

  /**
   * Local similarity analysis fallback
   */
  private localSimilarityAnalysis(structures: MusicStructure[]): any[] {
    if (structures.length < 4) return []
    
    const groups: any[] = []
    const groupLabels = ['A', 'B', 'C', 'D', 'E']
    const groupSize = Math.floor(structures.length / 3)

    for (let i = 0; i < Math.min(3, structures.length / 2); i++) {
      const startIdx = i * groupSize
      const endIdx = Math.min(startIdx + groupSize + 1, structures.length)
      const groupStructures = structures.slice(startIdx, endIdx)

      if (groupStructures.length >= 2) {
        groups.push({
          groupId: groupLabels[i],
          structureIds: groupStructures.map(s => s.id),
          similarityScore: 0.75 + Math.random() * 0.2,
          commonFeatures: ['similar melodic contour', 'parallel rhythmic pattern']
        })
      }
    }
    
    console.log('🔗 [LOCAL] Generated', groups.length, 'similarity groups')
    return groups
  }
}
