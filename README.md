# 📒 Listahan App (SME Digital Ledger)

![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Listahan App** is a modern, mobile-first financial tracking application designed to digitize the traditional "blue notebook" credit system of Sari-sari stores and small businesses.

🔗 **Live Demo:** [https://listahan-app.vercel.app](https://listahan-app.vercel.app)  
👨‍💻 **Portfolio:** [Carlos Miguel Sandrino](https://carlos-miguel-sandrino-portfolio.vercel.app/)

---

## 📸 Snapshot

![Project Preview](/public/listahan-app.png)

---

## 💡 Why I Built This & Features

Small business owners often struggle with manual bookkeeping. Records get lost, calculations are prone to errors, and tracking "utang" (debts) becomes a headache. I built this to solve that.

- **Secure Authentication:** Row Level Security (RLS) ensures users can only access their own customer and transaction data.
- **Real-time Dashboard:** Instant overview of Total Collectibles and Active Customers at a glance.
- **Debounced Search:** Efficient customer filtering that doesn't spam the database with every keystroke.
- **Mobile-First Design:** Fully optimized for mobile browsers since store owners are always on-the-go.
- **Dark Mode Support:** Built-in theme switching for comfortable usage in low-light store environments.
- **Transaction History:** Detailed logs of every "Utang" and "Bayad" with proper date stamps.

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** Shadcn UI (Radix Primitives)
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod Validation
- **State/Feedback:** Sonner (Toast Notifications)

**Backend & Database:**
- **BaaS:** Supabase
- **Database:** PostgreSQL
- **Auth:** Supabase Auth

**Deployment:**
- **Hosting:** Vercel

---

## 🚀 How to Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/listahan-app.git
cd listahan-app
```
---

### 2. Install dependencies
```bash
npm install
# or
pnpm install
```
---

### 3. Set up Environment Variables

Create a .env.local file in the root directory and add your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```
---

### 4. Run the dev server

```bash
npm run dev
```
Open http://localhost:3000 to see it in action.

---

### 5. Project Structure

```bash
├── app/
│   ├── (auth)/         # Authentication pages (Login, Register)
│   ├── dashboard/      # Main dashboard and customer management
│   ├── customers/      # Customer CRUD operations
│   ├── api/            # Serverless functions
│   └── layout.tsx      # Root layout with theme provider
├── components/         # Reusable UI components
├── lib/                # Supabase client, utilities
├── types/              # TypeScript interfaces
└── public/             # Static assets
```
---

### 6. Database Schema (Supabase)

The app relies on two relational tables in Supabase:
- **customers:** Stores basic info (name, phone) and links to the user (user_id).
- **transactions:** Stores financial events (type: UTANG/BAYAD, amount) linked to a specific customer.

---

## 👤 Author

Built by **Carlos Miguel Sandrino**.

- **Portfolio:** [carlos-miguel-sandrino-portfolio.vercel.app](https://carlos-miguel-sandrino-portfolio.vercel.app/)
- **GitHub:** [@Crl0sDEV](https://github.com/Crl0sDEV)

---

*This project is for educational and portfolio purposes.*