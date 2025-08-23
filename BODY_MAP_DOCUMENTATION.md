# Body Journal & Body Map Documentation

## Overview
The Body Journal feature is a mindfulness tool that helps users connect their emotions with physical sensations through a guided 3-step process. This documentation outlines the complete implementation logic and component structure.

## Architecture

### File Structure
```
Journal Page → EmotionJournal → BodyJournalFlow → Step2BodyMap
├── body-journal-flow.tsx (Main coordinator)
├── step-1-emotion.tsx (Emotion selection)
├── step-2-body-map.tsx (Body mapping interface)
├── step-3-journal.tsx (Journal writing)
└── body-parts/
    ├── head-map.tsx
    ├── upper-body-map.tsx
    └── lower-body-map.tsx
```

## Three-Step Flow

### Step 1: Emotion Selection (Step1Emotion)
- **Purpose**: Select primary emotion and intensity
- **Options**: 8 core emotions (Joy, Trust, Fear, Surprise, Sadness, Disgust, Anger, Anticipation)
- **Intensity**: Slider control (0-100)
- **Storage**: Auto-saved to localStorage as `bodyJournal_emotion` and `bodyJournal_intensity`

### Step 2: Body Mapping (Step2BodyMap) 🎯
- **Purpose**: Map emotions to specific body parts using drag & drop
- **Interface Components**:
  - **Floating Emoji Palette**: Draggable emotion source
  - **Tabbed Body Parts**: Head, Upper Body, Lower Body
  - **Interactive Body Maps**: Clickable and droppable areas

#### Emotion Palette
8 draggable emotions with consistent mapping across all body parts:
```javascript
[
  { id: "tense", emoji: "😬" },
  { id: "relaxed", emoji: "😌" },
  { id: "warm", emoji: "🔥" },
  { id: "cool", emoji: "❄️" },
  { id: "fluttery", emoji: "🦋" },
  { id: "racing", emoji: "💓" },
  { id: "calm", emoji: "🌊" },
  { id: "buzzing", emoji: "⚡" }
]
```

#### Body Part Mapping
- **Head**: forehead, eyes, jaw, neck
- **Upper Body**: chest, heart, shoulders, arms, hands, stomach  
- **Lower Body**: hips, thighs, knees, calves, feet

### Step 3: Journal Writing (Step3Journal)
- **Purpose**: Free-form text reflection
- **Features**: 
  - Summary of selected emotions and body feelings
  - Text input for detailed journaling
  - Final submission to database

## Component Details

### BodyJournalFlow (Main Coordinator)
**File**: `body-journal-flow.tsx`

**State Management**:
```javascript
const [currentStep, setCurrentStep] = useState(1);
const [selectedEmotion, setSelectedEmotion] = useState(4);
const [emotionIntensity, setEmotionIntensity] = useState(50);
const [selectedBodyFeelings, setSelectedBodyFeelings] = useState({});
const [journalContent, setJournalContent] = useState("");
```

**Key Features**:
- **Progress Bar**: 3-step visual indicator
- **Auto-save**: All progress saved to localStorage
- **Image Preloading**: Body map images loaded on component mount
- **Data Transformation**: Converts UI data to backend format

### Step2BodyMap (Body Mapping Interface)
**File**: `step-2-body-map.tsx`

**Core Components**:
1. **Floating Emoji Palette**
   - 8 draggable emotion circles
   - Visual feedback on hover
   - Drag source for body parts

2. **Tabbed Interface**
   - Three tabs: Head, Upper, Lower
   - Separate body feelings by area
   - Independent interaction per tab

**Drag & Drop Logic**:
```javascript
// Drag start
onDragStart={(e) => {
  setDraggedFeeling(feeling.id);
  e.dataTransfer.setData("text/plain", feeling.id);
}}

// Drop handling
const handleFeelingChange = useCallback((part, feeling) => {
  const newFeelings = { ...selectedBodyFeelings, [part]: feeling };
  localStorage.setItem("bodyJournal_bodyFeelings", JSON.stringify(newFeelings));
  onBodyFeelingsChange(newFeelings);
}, [selectedBodyFeelings, onBodyFeelingsChange]);
```

### Body Part Components

#### HeadMap, UpperBodyMap, LowerBodyMap
**Files**: `body-parts/*.tsx`

**Common Structure**:
1. **Image Background**: SVG overlay on body part image
2. **Interactive Circles**: Clickable/droppable areas positioned with x,y coordinates
3. **Emoji Display**: Shows selected emotions on body parts
4. **Feeling Selection Panel**: Alternative click-based selection interface

**Visual States**:
- **Default**: Light purple circle
- **Selected**: Orange highlight
- **Has Feeling**: Green circle with emoji overlay

**Dual Interaction Methods**:
1. **Drag & Drop**: From floating palette to body parts
  기능적 특징:
  - "Floating": body map 위에 떠있는 형태
  - "Palette": 색상 팔레트처럼 감정들을 나열
  - Draggable: 각 이모지가 드래그 가능
  - Visual feedback: hover 시 오렌지 하이라이트
  - 고정 위치: body map 탭들 위쪽에 항상 표시

  이 컴포넌트는 드래그 소스로 작동하여 사용자가 감정을
  선택해서 body parts로 드래그할 수 있게 해주는
  인터페이스입니다.

2. **Click Selection**: Click part → select from panel below
 HeadMap 코드를 보면 해당 부위를 클릭했을 때 나타나는
  하단의 감정 선택 컴포넌트를 "Feeling selection" 또는
  **"Feeling selection panel"**이라고 정의했습니다.

  코드에서는:
  {/* Feeling selection */}
  {selectedPart && (
    <Card className="rounded-stone border 
  border-orange-200">
      <CardContent className="p-4">
        <p className="text-sm font-medium 
  text-stone-600 mb-3">
          How does your{" "}
          {headParts
            .find((p) => p.id === selectedPart)
            ?.label.toLowerCase()}{" "}
          feel?
        </p>
        {/* 감정 이모지 그리드와 Clear 버튼들 */}
      </CardContent>
    </Card>
  )}

  기능적 특징:
  - 조건부 렌더링: selectedPart가 있을 때만 표시
  - 동적 텍스트: "How does your [부위명] feel?"
  - 그리드 레이아웃: 4열 그리드로 감정 이모지들 배치
  - Clear 기능: 🚫 버튼으로 감정 제거
  - Cancel 버튼: 선택 취소

  이 컴포넌트는 클릭 방식의 감정 선택 인터페이스로,
  드래그&드롭과 함께 두 가지 방법으로 감정을 할당할 수
  있게 해주는 대안적 UI입니다.
## Data Flow

### Input Processing
```javascript
// User selects emotion 4 (Surprise) with 75% intensity
selectedEmotion: 4
emotionIntensity: 75

// User drags "tense" to "shoulders" and "racing" to "heart"  
selectedBodyFeelings: {
  "shoulders": "tense",
  "heart": "racing"
}

// User writes journal entry
journalContent: "Feeling nervous about presentation..."
```

### Backend Data Structure
```javascript
{
  userId: "temp-user",
  journalType: "body",
  emotionLevel: 3, // Converted to 1-5 scale
  emotionType: "surprise",
  content: "Feeling nervous about presentation...",
  bodyMapping: {
    feelings: { "shoulders": "tense", "heart": "racing" },
    emotionCategory: 4, // Original 1-8 emotion selection
    intensity: 75, // 0-100 intensity
    timestamp: "2025-08-23T20:30:00.000Z"
  }
}
```
Click Selection*
## Technical Implementation

### Image Preloading
```javascript
useEffect(() => {
  // Preload body map images to prevent loading delays
  const preloadImages = [headNeckImage, upperBodyImage, lowerBodyImage];
  preloadImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}, []);
```

### Emotion Conversion Logic
```javascript
const getEmotionData = (emotionId) => {
  const emotionCategories = [
    { id: 1, label: "Joy", type: "joy", level: 5 },
    { id: 2, label: "Trust", type: "trust", level: 4 },
    { id: 3, label: "Fear", type: "fear", level: 2 },
    { id: 4, label: "Surprise", type: "surprise", level: 3 },
    { id: 5, label: "Sadness", type: "sadness", level: 2 },
    { id: 6, label: "Disgust", type: "disgust", level: 1 },
    { id: 7, label: "Anger", type: "anger", level: 1 },
    { id: 8, label: "Anticipation", type: "anticipation", level: 4 }
  ];
  return emotionCategories.find(e => e.id === emotionId) || { type: "neutral", level: 3 };
};
```

### CSS Classes

**Body Part Emoji Positioning**:
```css
.body-part-emoji {
  position: absolute;
  font-size: 0.75rem;
  color: hsl(25, 10%, 45%);
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 10;
}
```

## User Experience Features

### Visual Feedback
- **Hover Effects**: Color changes on interactive elements
- **Selection States**: Clear visual indication of selected parts
- **Emoji Overlay**: Emotions displayed directly on body parts
- **Remove Buttons**: Hover-activated delete buttons for emotions

### Accessibility
- **Keyboard Navigation**: Tab-based navigation support
- **Screen Reader**: ARIA labels and semantic HTML
- **Touch Support**: Mobile-optimized drag interactions
- **Visual Indicators**: High contrast selection states

### Data Persistence
- **Auto-save**: Progress saved at each step
- **Session Recovery**: Can resume interrupted sessions
- **Clear on Complete**: localStorage cleaned after successful submission

## Component Naming Conventions

### Primary Components
- **BodyJournalFlow**: Main orchestrator component
- **Step2BodyMap**: Body mapping interface coordinator

### UI Elements
- **Floating Emoji Palette**: Draggable emotion source panel
- **Feeling Selection Panel**: Click-based alternative selection interface
- **Interactive Body Maps**: SVG overlay with clickable/droppable areas
- **Progress Bar**: Step indicator component

### State Variables
- `selectedEmotion`: Primary emotion choice (1-8)
- `emotionIntensity`: Intensity slider value (0-100)
- `selectedBodyFeelings`: Object mapping body parts to emotions
- `currentStep`: Current step in 3-step flow (1-3)

## Integration Points

### Router Integration
- **URL Parameters**: Supports `?type=emotion` for direct navigation
- **Navigation Reset**: Footer navigation triggers state reset

### Backend API
- **Endpoint**: `POST /api/journal-entries`
- **Response**: Saved journal entry with generated ID
- **Error Handling**: Console logging and user feedback

### LocalStorage Keys
- `bodyJournal_emotion`: Selected emotion ID
- `bodyJournal_intensity`: Emotion intensity value  
- `bodyJournal_bodyFeelings`: JSON string of body part feelings
- `bodyJournal_content`: Journal text content

---

*This documentation serves as a comprehensive reference for the Body Journal & Body Map functionality implementation.*