# APEX — Personal Fitness & Life OS

A full-featured self-improvement and fitness tracking app with AI coaching.

## Features
- 🏋️ Workout tracking with sets, reps, weight, timers
- 🥗 Nutrition logging with AI macro estimation
- 🌙 Sleep & recovery tracking
- ✅ Habits & daily routines
- 📊 Body metrics & progress
- ✦ AI Coach powered by Claude

## Setup

1. Install dependencies:
   npm install

2. Start the app:
   npm start

## AI Features
The app calls the Anthropic Claude API for:
- AI macro estimation (describe any meal, get instant nutrition data)
- AI Coach chat (personalized advice based on your logged data)

The API key is handled server-side — no setup needed in development via Claude.ai artifacts.

## Tech Stack
- React 18
- Anthropic Claude API (claude-sonnet-4-20250514)
- CSS-in-JS styling
- Google Fonts (DM Sans)

## Next Steps
- Add React Native / Expo for mobile
- Add Supabase for persistent data storage
- Add Apple HealthKit integration
- Add barcode scanning (Edamam API)
- Add push notifications
