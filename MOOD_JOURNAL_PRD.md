# Mood Journal – AI-Powered Emotion Tracker
## Product Requirements Document (PRD)

### 🔹 Project Overview
Build a web-based mood tracking journal where users write daily entries that are analyzed by AI for sentiment/emotion detection. Store entries in Supabase and visualize mood trends over time.

**Tech Stack:**
- Frontend: React with Lovable.dev
- Backend: Supabase (Auth + Database)
- AI: Hugging Face Sentiment Analysis API
- Charts: Chart.js or Recharts
- Deployment: Lovable.dev

### 🔹 Core Features

#### 1. Authentication
- Use Supabase Auth with email/password
- Secure user sessions
- Redirect unauthenticated users to login

#### 2. Journal Entry System
- Multi-line text input for journal entries
- "Analyze & Save" button triggers:
  1. Hugging Face API call for sentiment analysis
  2. Save entry + sentiment data to Supabase
  3. Show confirmation message
- Daily entry creation with timestamps

#### 3. AI Sentiment Analysis
- **API Endpoint:** `https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english`
- **Authentication:** Bearer token with Hugging Face API key
- **Expected Response:**
```json
{
  "sentiment": "POSITIVE",
  "score": 0.97
}
```

#### 4. Database Schema (Supabase)
```sql
CREATE TABLE journal_entries (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  text text NOT NULL,
  sentiment varchar(20),
  score float8,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### 5. Dashboard & Visualization
- Line chart showing mood scores over time
- X-axis: Entry dates
- Y-axis: Sentiment scores (0-1)
- Color coding:
  - Positive (>0.6): Green
  - Neutral (0.4-0.6): Blue  
  - Negative (<0.4): Red

#### 6. Journal History
- Table/list of all user entries
- Show: Date, text preview (100 chars), sentiment, score
- Sort by newest first
- Click to view full entry

#### 7. Navigation & Layout
- Top navigation with:
  - "New Entry" button
  - "Dashboard" link
  - "History" link
  - User menu with Logout
- Mobile responsive design
- Clean, minimal UI

### 🔹 User Flow
1. User visits app → Redirected to login if not authenticated
2. User signs up/logs in via Supabase Auth
3. User writes journal entry in text area
4. User clicks "Analyze & Save"
5. System calls Hugging Face API → Gets sentiment & score
6. Entry saved to Supabase with user_id and timestamp
7. Dashboard updates showing:
   - New entry in history
   - Updated mood trend chart
8. User can view all entries and mood patterns over time

### 🔹 Implementation Requirements

#### Security
- Use Supabase RLS policies for data access control
- Store API keys as Supabase secrets (not in frontend)
- Validate user authentication on all protected routes

#### API Integration
- Create Supabase Edge Function for Hugging Face API calls
- Handle API errors gracefully
- Show loading states during analysis

#### Performance
- Sentiment analysis should complete within 3 seconds
- Chart rendering should be smooth with 100+ entries
- Lazy load journal history for better performance

#### Error Handling
- Display user-friendly error messages
- Handle network failures gracefully
- Validate form inputs before submission

### 🔹 Page Structure
1. **Login/Signup Page** (`/auth`)
   - Email/password forms
   - Redirect to dashboard after auth

2. **Dashboard** (`/`) 
   - New entry form
   - Mood trend chart
   - Recent entries preview

3. **History Page** (`/history`)
   - Complete list of all entries
   - Filtering by date range
   - Entry details modal

### 🔹 Component Architecture
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── journal/
│   │   ├── EntryForm.tsx
│   │   ├── EntryList.tsx
│   │   └── EntryCard.tsx
│   ├── dashboard/
│   │   ├── MoodChart.tsx
│   │   └── StatsCards.tsx
│   └── layout/
│       ├── Navigation.tsx
│       └── Layout.tsx
├── pages/
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   └── History.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useJournalEntries.ts
│   └── useSentimentAnalysis.ts
└── utils/
    ├── supabase.ts
    └── types.ts
```

### 🔹 Environment Setup
- Add Hugging Face API key as Supabase secret
- Configure Supabase URL and anon key
- Set up proper CORS for API calls

### 🔹 Acceptance Criteria
- ✅ User can sign up and log in securely
- ✅ User can create journal entries with AI analysis
- ✅ Entries are stored in Supabase with proper RLS
- ✅ Dashboard displays mood trends over time
- ✅ History page shows all entries with sentiment data
- ✅ UI works on desktop and mobile
- ✅ No hard-coded credentials in frontend code
- ✅ Error handling for all user interactions
- ✅ Loading states for all async operations

### 🔹 Future Enhancements
- Multiple emotion detection (joy, anger, fear, etc.)
- Journal entry tagging system
- Mood streak tracking
- Export functionality (CSV/PDF)
- AI-generated insights and recommendations
- Social features (optional sharing)

---

**Instructions for AI:** Implement this mood journal app using the specified tech stack. Focus on creating a clean, functional MVP that demonstrates all core features. Prioritize user experience and data security throughout the implementation.