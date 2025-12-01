## BudgeMon

BudgeMon is an AI-powered financial companion that turns budgeting into a gamified, pet-based experience. Users choose an AI pet personality, chat about their spending, and manage their cards, transactions, and savings through a playful mobile-style dashboard.

- **Live App**: [https://budgemon.vercel.app/](https://budgemon.vercel.app/)
- **Sleep Mode**: [https://budgemon.vercel.app/sleep](https://budgemon.vercel.app/sleep)

---

### Features

- **AI Companion Chat**
  - Choose between **Lumi** (encouraging) or **Luna** (sassy) as your budgeting buddy.
  - Log expenses and savings via natural chat phrases (e.g. “I spent $15 on lunch” or “I saved part of my salary”).
  - The companion reacts differently based on your pet choice and updates balances and transactions.

- **Personal Finance Dashboard**
  - Track your **cash balance** and **recent transactions**.
  - Add structured transactions via a dedicated **Add Transaction** flow (income/expense, category, date, optional note, and linked card).
  - Automatic updates of balances when new transactions are added.

- **Card Management**
  - Manage multiple cards with issuer, card number, cardholder name, color, and balance.
  - Add, edit, and delete cards; linked transactions can adjust individual card balances.

- **Gamified Rewards & Wardrobe**
  - Earn **in-game coins** for positive actions (e.g. saving, salary-related messages).
  - Spend coins in the **Shop** to unlock cosmetic items for your companion (hats, sunglasses, mustache, ribbons, etc.).
  - Equip/unequip wardrobe items to customize your pet’s look.

- **Leaderboard & Social Layer**
  - View a **friends leaderboard** seeded from mock data to simulate social comparison and motivation.
  - See how your progress compares with your friends’ savings/game currency.

- **Profile & Settings**
  - Access a **Profile** view to see user details and app-related information.
  - Manage aspects of your experience from a single, mobile-centric layout.

- **Sleep Mode (`/sleep`)**
  - A dedicated **Companion Sleep** view that reuses the core app but focuses on a calming, non-interactive state.
  - Shows your pet (Lumi or Luna) in a sleeping animation with a **countdown timer** (e.g. 3 hours) and a “Zzz… come back in HH:MM:SS” message.
  - Chat input and send button are visually present but disabled, encouraging users to “let their money rest” and take a break from spending.
  - Still shows your game currency and allows quick navigation back to Shop/Profile when using the main app.

---

### Tech Stack

- **Framework**: Next.js (App Router, React, client components)
- **Language**: JavaScript (React JSX)
- **Styling**: Tailwind-style utility classes in `globals.css` + component-level classes
- **Icons**: `lucide-react` for UI icons
- **Deployment**: Vercel (`https://budgemon.vercel.app/`)

---

### Project Structure (Key Files)

- `app/page.js` – Main BudgeMon experience (login, onboarding/pet selection, main dashboard, shop, card management, profile, chat, etc.).
- `app/sleep/page.js` – Sleep mode entry point; reuses `Page` with `sleepMode` enabled.
- `app/components/`
  - `LoginView.jsx` – Login screen.
  - `PetSelectionView.jsx` – Choose between Lumi and Luna.
  - `MainAppLayout.jsx` – Overall app shell and tab navigation.
  - `CompanionView.jsx` – Main companion chat and pet area.
  - `CompanionSleepView.jsx` – Sleep-mode companion with timer and disabled chat.
  - `AddTransactionView.jsx` – Form to add income/expense transactions.
  - `CardManagementView.jsx` – Add, edit, and manage cards.
  - `ShopView.jsx` – Wardrobe items and coin spending.
  - `LeaderboardView.jsx`, `ProfileView.jsx`, `ManagerView.jsx`, `PetVisual.jsx` – Supporting views and visual components.
- `app/constants/mockData.js` – Mock data for friends leaderboard, shop items, and initial transactions.
- `public/` – Assets for pets, wardrobe items, and branding (e.g. `lumi.png`, `luna.png`, `lumi-sleep-repeat.gif`, wardrobe PNGs).

---

### Getting Started (Local Development)

1. **Install dependencies**

  
   npm install
   2. **Run the development server**

  
   npm run dev
   3. **Open the app**

   - Main app: `http://localhost:3000`
   - Sleep mode: `http://localhost:3000/sleep`

The app will hot-reload as you edit files in the `app/` directory.

---

### Notes for Judges & Reviewers

- The app is optimized for a **mobile-sized viewport** inside a centered container, simulating a phone UI.
- Financial logic is **simplified and mock-based** (no real banking integrations) and is intended for **education & concept demonstration**, not real financial advice.
- The deployed version at [budgemon.vercel.app](https://budgemon.vercel.app/) mirrors the latest state of this repository for quick evaluation.