# MoodMinder 🌸

A comprehensive mental health and wellness mobile application that empowers users to track emotions, journal their thoughts, and build self-awareness through innovative AI-powered features.

## 🌐 Live Demo
**[Try MoodMinder Now →](https://softmoves-sujinsuh200-5975s-projects.vercel.app/)**

**[How it works →](https://drive.google.com/file/d/1rNhs8ixBJU5VtPI2NK4O255i9s5N2AFI/view?usp=sharing)**

*Experience the full-featured mental wellness app with AI-powered journaling, emotion tracking, and personalized meme generation.*

## ✨ Features

### 🎭 Emotion Tracking & Body Mapping
- **Visual Emotion Faces**: 5-point emotion scale with intuitive visual feedback
- **Body Sensation Mapping**: Interactive body diagrams to track physical feelings
- **Quick Emotion Logging**: One-tap emotion check-ins throughout the day

### 📝 Multi-Modal Journaling
- **Body Journal**: Emotion tracking with physical sensation awareness
- **Identity Journal**: Self-discovery through keyword reflection and AI-generated memes
- **Reframing Journal**: 3-step AI-powered emotion reframing process using GPT-4o
- **Voice Mode**: Hands-free journaling with voice recognition and text-to-speech

### 🎨 AI-Powered Meme Generation
- **Personalized Memes**: Generate custom memes based on your identity keywords
- **Mood-Based Selection**: Smart image selection matching your emotional state
- **Social Sharing**: Share your wellness journey through personalized content

### 📊 Analytics & Insights
- **Emotion Trends**: Beautiful wave charts showing emotional patterns over time
- **Weekly/Monthly Reports**: Comprehensive analytics with streak tracking
- **Body Sensation Analysis**: Visual representation of physical-emotional connections

### 🆘 Crisis Support Tools
- **Emergency Logging**: Timestamped crisis events with resolution tracking
- **Box Breathing**: Guided breathing exercises for anxiety relief
- **Butterfly Hug**: Self-soothing technique for emotional regulation

### 🗣️ Voice Features
- **Voice Chat Orb**: Interactive voice conversations with animated visual feedback
- **Continuous Voice Input**: Seamless voice-to-text journaling experience
- **AI Voice Responses**: Natural language processing for emotional support

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript for robust, type-safe development
- **Vite** for lightning-fast builds and hot reloading
- **Tailwind CSS** with custom warm color palette (peach, sage, lavender, coral)
- **Radix UI** primitives with shadcn/ui component library
- **Wouter** for lightweight client-side routing
- **TanStack Query** for efficient server state management
- **Framer Motion** for smooth animations and transitions

### Backend
- **Express.js** with TypeScript for RESTful API endpoints
- **Drizzle ORM** with PostgreSQL for type-safe database operations
- **Neon Serverless** PostgreSQL for production-ready data persistence
- **Session Management** with connect-pg-simple

### AI Integration
- **OpenAI GPT-4o** for emotion reframing and meme generation
- **Voice Recognition API** for hands-free interaction
- **Text-to-Speech** for accessibility and voice responses



### Authentication & Sessions

- **Supabase Auth** for user authentication 
- **Endpoints** /api/auth/signup, /api/auth/login, /api/auth/logout, /api/auth/refresh, /api/auth/me


### Environment Setup
For the new auth server, load `.env.local` when you start it so Supabase keys are available:
```bash
$ npm install --save-dev dotenv-cli
$ npm run dev:auth          # runs: dotenv -e .env.local -- tsx src/server.ts

If you prefer manual exports, run export $(grep -v '^#' .env.local | xargs) before npx tsx src/server.ts



새 인증 흐름을 검증하는 curl 예시 (signup, login, me, logout, 반복 실패 시 429)와 기대 응답을 README에 넣어두면 팀원이 바로 확인할 수 있습니다.
Supabase 대시보드에서 profiles 테이블이 upsert되는지 체크하라는 설명도 추가하세요.
Rate limit / 소프트 락 안내

/api/auth/login은 1분당 5회, 5번 연속 실패 시 5분 잠금이라는 정책을 README에 명시하세요. 이 부분은 보안/UX 참고를 위해 꼭 문서화해야 합니다.
서버 실행 방법 정리

현재 npm run dev는 구(舊) Express 서버를 올리는 스크립트이니, 인증용 서버는 npm run dev:auth(또는 npx tsx src/server.ts)로 띄워야 한다는 점을 README에 추가하세요.
프런트(Vite)와 백엔드(/src/server.ts)를 동시에 실행하려면 어떤 명령어를 사용해야 하는지도 설명하면 좋습니다.






### Mobile-First Design
- **PWA-Ready** with offline capabilities
- **Touch-Optimized** interface with gesture support
- **Bottom Navigation** for easy thumb accessibility
- **Responsive Layout** adapting from mobile to desktop

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Neon account for serverless)
- OpenAI API key for AI features

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/MoodMinder.git
cd MoodMinder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and OpenAI API key

# Set up the database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

### Deployment

The app is deployed on **Vercel** for seamless full-stack hosting:

```bash
# Deploy to Vercel
npm i -g vercel
vercel --prod
```

### Environment Variables

```env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_session_secret
NODE_ENV=development

SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, JWT_JWKS_URL, FRONTEND_URL, COOKIE_DOMAIN, PORT
```

### Auth Testing Quickstart
**Sign up:**

curl -i -X POST http://localhost:8787/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test.user+$(date +%s)@example.com","password":"Passw0rd1","nickname":"test"}'
**Log in (stores cookies in cookies.txt):**

curl -i -c cookies.txt -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test.user@example.com","password":"Passw0rd1"}'
**Get current user:**

curl -i -b cookies.txt http://localhost:8787/api/auth/me
Trigger lockout (repeat wrong password ≥5 times) to verify 429 response.

**Log out:**

curl -i -b cookies.txt -X POST http://localhost:8787/api/auth/logout
Follow-up GET /api/auth/me should return 401.

These commands verify cookies (HttpOnly, SameSite=Lax), rate limits, and Supabase profile upsert without needing a frontend.




## 📱 Usage

### Daily Journaling Flow
1. **Quick Check-in**: Log your current emotion with a single tap
2. **Body Awareness**: Map physical sensations on interactive body diagrams
3. **Reflection**: Write about your feelings and experiences
4. **AI Reframing**: Get personalized emotional insights and coping strategies

### Identity Exploration
1. **Keyword Selection**: Choose words that represent your identity
2. **Deep Reflection**: Write about your chosen traits and values
3. **Meme Generation**: Receive a personalized, uplifting meme based on your reflection
4. **Social Sharing**: Share your wellness journey with friends and family

### Voice Interaction
1. **Voice Toggle**: Enable voice mode for hands-free journaling
2. **Speak Naturally**: Talk about your feelings and experiences
3. **AI Conversation**: Engage with empathetic AI responses
4. **Visual Feedback**: Watch the voice orb animation respond to your speech

## 🎯 Project Goals

MoodMinder aims to make mental health tracking accessible, engaging, and insightful through:

- **Gamification**: Making self-care enjoyable with memes and visual feedback
- **AI Assistance**: Providing intelligent emotional support and reframing
- **Accessibility**: Voice features and intuitive design for all users
- **Privacy**: Secure, user-controlled data with local processing options
- **Evidence-Based**: Incorporating proven therapeutic techniques like CBT reframing

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # Type checking
npm run db:push      # Push database schema changes
npm run db:seed      # Seed database with test data
npm run db:clear     # Clear test data
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Therapeutic Techniques**: Inspired by Cognitive Behavioral Therapy (CBT) and mindfulness practices
- **Design System**: Built with accessibility-first principles using Radix UI
- **AI Ethics**: Committed to responsible AI use in mental health applications


