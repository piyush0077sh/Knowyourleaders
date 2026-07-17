# KnowYourLeaders — Civic Transparency & MP Accountability Platform

An interactive, premium web application built with **Next.js**, **React**, **TypeScript**, and **MongoDB** (with local JSON fallback) designed to track the performance, election promises, and MPLAD budget utilization of Members of Parliament in India. 

Multilingual out-of-the-box (English, Hindi, Tamil) and fully optimized for accessibility (WCAG AA compliance).

---

## 🌟 Premium Features

### 1. Interactive Geographic Map (`/explore`)
- **Interactive State Map**: Responsive SVG-based map of Indian states color-coded by execution score tiers.
- **State Details Panel**: Dynamic sidebar listing tracked constituencies, representatives, and parties in the hovered or selected state.
- **Execution Score Tiers**:
  - 🟢 **High Execution (≥ 65%)** — Delivered on the majority of verified promises.
  - 🟡 **Medium Execution (50% - 64%)** — Active implementation under way.
  - 🔴 **Low Execution (< 50%)** — Observed delays or misleading statements.

### 2. Representative Comparison Desk (`/compare`)
- **Side-by-Side MP Comparison**: Select up to 3 constituencies to compare representatives' performance.
- **Custom Visual Analytics**:
  - SVG bar charts illustrating Promise vs Execution and Work vs Impact scores.
  - Custom horizontal stacked bars representing precise status distribution.
  - MPLAD budget utilization progress meters (₹25.0 Crore term tracking).
- **Responsive Mobile Layout**: Automatically stacks comparison profiles vertically on mobile devices.

### 3. Rich Constituency Detail Dashboard (`/constituency/[id]`)
- **SVG Radial Performance Gauges**: Animated circular progress indicators mapping out execution and work impact ratings.
- **Segmented Status Bar**: Visual overview of promises categorized by their progress.
- **Card-Based Promise Ledger**: Interactive rows with left accent borders matching their categories (e.g. Governance, Healthcare, Infrastructure).
- **Expandable Impact Summaries**: Inline descriptions detailing the exact implementation status, expandable on click.
- **Slide-In Evidence Drawer**: Access verified source links, publisher details, dates, source types, and verification notes.
- **Decision-Maker Directory**: District collector and commissioner contacts to encourage citizen feedback.
- **MPLAD Project Funding Ledger**: Sanctioned budgets, implementing agencies, and status updates for local works.

### 4. Interactive Citizen Audit Form
- **Correction Submissions**: Send correction notes and upload supporting evidence directly from any promise card.
- **Data Safety**: Inputs are captured and processed via a Next.js API route (`/api/constituencies/[id]`), saving to MongoDB or a local `corrections.json` file.

---

## 🛠️ Technical Architecture

- **Frontend**: Next.js App Router, React 19, TypeScript, Vanilla CSS (dynamic HSL color system, glassmorphism card filters, and keyframe animations).
- **Backend / API**: Next.js Server Components and Route Handlers.
- **Database Layer**: MongoDB (via Mongoose) with a resilient local JSON file fallback (`src/data/app-ingest.v1.json`) if MongoDB environment variables are absent.
- **Localization (i18n)**: Persistent cookie/URL-based language selector supporting English (`en`), Hindi (`hi`), and Tamil (`ta`).

---

## 📁 Repository Structure

```
├── next-app/                      # Next.js Application Root
│   ├── src/
│   │   ├── app/                   # App Router Pages & API Routes
│   │   │   ├── api/               # GET & POST endpoints for constituencies & corrections
│   │   │   ├── compare/           # Representative Comparison Page
│   │   │   ├── constituency/      # Constituency Detail Page
│   │   │   └── explore/           # State Map Explorer Page
│   │   ├── components/            # Reusable UI Components
│   │   │   ├── Header.tsx         # Mobile-responsive Navigation bar
│   │   │   ├── IndiaMap.tsx       # Interactive SVG map component
│   │   │   ├── ConstituencyCompare.tsx    # Comparison Desk Component
│   │   │   ├── ConstituencyDashboard.tsx  # Homepage search & cards
│   │   │   └── ConstituencyDetail.tsx     # MP profile & promise ledger
│   │   ├── data/                  # Locale JSONs, seed data, and raw datasets
│   │   └── lib/                   # Database logic (db.ts) and translation engine (i18n.ts)
│   ├── package.json
│   └── tsconfig.json
├── backend/                       # Legacy Backend (if applicable)
├── frontend/                      # Legacy Frontend MVP v1.2 (Vanilla HTML/JS/CSS)
├── playwright.config.js           # End-to-End Testing config
└── README.md                      # Project root documentation
```

---

## 🚀 Getting Started

No database setup is required to test the application; it runs out-of-the-box using the local mock data engine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm or yarn

### Installation & Run

1. Navigate to the Next.js app directory:
   ```bash
   cd next-app
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔧 Database Configuration

To connect the application to a production MongoDB database:

1. Create a `.env.local` file inside the `next-app` directory.
2. Add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/knowyourleaders
   ```
3. Restart your Next.js server. The application will automatically seed the cluster and transition from the local JSON files to the active database.

---

## ♿ Accessibility Compliance (WCAG AA)

- **Touch Target Size**: Minimum interactive dimensions are strictly kept at **44×44px** to ensure mobile and touch usability.
- **Focus Indicators**: Standardized visible focus outline (`2px solid #3b82f6` with `2px offset`) for keyboard navigation.
- **Aria Roles**: Proper usage of landmark tags (`<header>`, `<main>`, `<nav>`, `<footer>`) and dialog overlays (`role="dialog"` with focus trap).
- **Reduced Motion**: Respects browser preference (`prefers-reduced-motion`) and silences decorative slide/drawer transitions accordingly.