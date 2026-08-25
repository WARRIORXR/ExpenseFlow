# 💰 ExpenseFlow — Modern Smart Expense Tracker

<div align="center">

![ExpenseFlow Banner](https://img.shields.io/badge/ExpenseFlow-Smart%20Finance-6366f1?style=for-the-badge&logo=cashapp&logoColor=white)

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/ES6+-Vanilla%20JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Modern%20Design-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![jsPDF](https://img.shields.io/badge/jsPDF-Supported-E11D48?style=flat-square)](https://github.com/parallax/jsPDF)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://expense-flow-orcin.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

<p align="center">
  <strong>Take control of your personal finances with a fast, modern, and beautiful expense management application.</strong>
  <br />
  Featuring interactive visual analytics, customizable budget management, multi-currency support, dark/light themes, and export capabilities.
</p>

<p align="center">
  <a href="https://expense-flow-orcin.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀%20View%20Live%20Demo-expense--flow--orcin.vercel.app-22c55e?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

</div>

---

## 🌐 Live Demo

Explore the live application directly in your browser without any setup:

🔗 **[https://expense-flow-orcin.vercel.app/](https://expense-flow-orcin.vercel.app/)**

---

## 🌟 Highlights & Key Features

### 📊 1. Interactive Dashboard & Real-Time Analytics
- **Live Financial Snapshot**: Instant overview of Total Income, Total Expenses, Net Balance, and Savings Rate.
- **Dynamic Charts**:
  - **Category Breakdown** (Doughnut Chart) with interactive tooltips and legends.
  - **Income vs. Expense** (Bar Chart) for monthly comparisons.
  - **Daily Spending Trend** (Smooth Line Chart) over time.
- **Recent Transactions Feed**: Quick view of recent income and expense transactions with instant edit and delete actions.

### 💳 2. Comprehensive Transaction Management
- **Intuitive Entry**: Add Income or Expense entries with category picker, amount, date, tags, and notes.
- **Recurring Transactions**: Tag recurring transactions (Monthly, Weekly, Yearly) like rent, salary, or subscriptions.
- **Advanced Filtering & Search**:
  - Filter transactions by date range, transaction type, category, or search query.
  - Sort by date, amount, or category in ascending or descending order.
- **Modal Editing**: Edit existing transactions seamlessly without leaving the page.

### 🎯 3. Smart Budget Manager
- **Category-Level Budgets**: Set spending limits for individual categories (Food, Bills, Shopping, Entertainment, etc.).
- **Overall Monthly Budget**: Set an aggregate monthly limit to track total lifestyle spending.
- **Visual Progress Bars**:
  - 🟢 **Normal**: Under 80% of limit.
  - 🟡 **Warning**: Between 80% and 100% of limit.
  - 🔴 **Exceeded**: Alert state when budget is over 100%.

### 📈 4. In-Depth Reports & Export
- **Flexible Timeframes**: Analyze spending habits by Month, Quarter, or Year.
- **Top Expense Categories**: Identify your biggest spending drivers.
- **One-Click Export**:
  - 📄 **Export as PDF**: Formatted statement table powered by `jsPDF` and `jspdf-autotable`.
  - 📊 **Export as CSV**: Spreadsheet-ready file with complete transaction records.
  - 🖨️ **Print View**: Clean print-optimized layout.

### ⚙️ 5. Customization & Privacy-First Architecture
- **🎨 Dark & Light Modes**: Glassmorphic UI with CSS custom properties and smooth transitions.
- **💱 Multi-Currency Support**: Switch between **₹ (INR)**, **$ (USD)**, **€ (EUR)**, **£ (GBP)**, **¥ (JPY)**, **A$ (AUD)**, and **C$ (CAD)**.
- **🏷️ Custom Categories**: Create custom income/expense categories with custom emoji icons and color pickers.
- **🔒 100% Local & Private**: All data is securely stored in your browser's `localStorage`—no data leaves your machine.
- **💾 Backup & Restore**: Export your entire dataset to a JSON file and restore it anytime.
- **⚡ Preloaded Sample Data**: Automatically seeds realistic sample data on first launch for immediate testing.

---

## 🛠️ Tech Stack

- **Frontend Core**: Vanilla JavaScript (ES Modules, modern component-driven structure)
- **Styling**: Pure Vanilla CSS with CSS Custom Properties, Glassmorphism, Flexbox, and CSS Grid
- **Build Tool / Bundler**: [Vite](https://vitejs.dev/)
- **Charts & Visualizations**: [Chart.js](https://www.chartjs.org/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **State Management**: Reactive Custom Event Store (`Store.js`)
- **Storage**: Browser `localStorage`

---

## 📁 Project Structure

```text
expense-tracker/
├── index.html              # Main HTML entry point and app shell
├── package.json            # Project dependencies and npm scripts
├── vite.config.js          # Vite build configuration
├── .gitignore              # Git ignore rules
├── README.md               # Project documentation
└── src/
    ├── main.js             # Application entry point, router init & global listeners
    ├── components/         # Reusable UI components
    │   ├── CategoryPicker.js   # Category selector & custom category modal
    │   ├── FilterBar.js        # Transaction search and filter controls
    │   ├── Modal.js            # Reusable accessible dialog/modal
    │   ├── Sidebar.js          # Navigation sidebar & mobile drawer
    │   ├── Toast.js            # Feedback toast notification system
    │   └── TransactionForm.js  # Add/edit transaction form
    ├── pages/              # Application views / routed screens
    │   ├── AddTransaction.js   # Transaction creation view
    │   ├── BudgetManager.js    # Budget limits and progress tracker
    │   ├── Dashboard.js        # Overview dashboard with balance & charts
    │   ├── Reports.js          # Deep-dive analytics, PDF/CSV exports
    │   ├── Settings.js         # Theme, currency, categories & backup
    │   └── TransactionList.js  # Filterable transaction table
    ├── store/              # Data layer & state management
    │   ├── defaults.js         # Default categories, settings & sample data generator
    │   └── Store.js            # Central reactive store & localStorage synchronizer
    ├── styles/             # Modular CSS design system
    │   ├── animations.css      # Keyframes and micro-interactions
    │   ├── base.css            # CSS reset, typography, and utility classes
    │   ├── components.css      # Card, button, input, badge, table, modal styles
    │   ├── index.css           # Global stylesheet entry point
    │   ├── layout.css          # App layout, sidebar, topbar, responsive containers
    │   ├── pages.css           # Page-specific styling rules
    │   └── variables.css       # Design tokens, color palette, dark/light themes
    └── utils/              # Helper utilities
        ├── charts.js           # Chart.js instances and chart rendering helpers
        ├── helpers.js          # Date formatting, currency formatter, CSV/PDF/JSON export
        └── router.js           # Client-side hash router
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/WARRIORXR/ExpenseFlow.git
   cd ExpenseFlow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser to view the application.

4. **Build for production**:
   ```bash
   npm run build
   ```
   The production-ready assets will be generated in the `dist/` directory.

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 📱 Responsive & Adaptive Design

ExpenseFlow is engineered mobile-first:
- **Desktop**: Full sidebar navigation, expanded analytical cards, and multi-column grid layouts.
- **Tablet / Mobile**: Collapsible hamburger sidebar drawer, floating quick-action button (FAB), and touch-friendly controls.

---

## 🔒 Data & Privacy

- **No external server tracking**: All transactions, budgets, categories, and settings remain solely inside your browser's local storage.
- **Data Export & Import**: You can backup your entire data at any time via `Settings > Data Management > Backup JSON` and import it into any browser or device.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  Made with ❤️ for smarter personal finance management.
</div>
