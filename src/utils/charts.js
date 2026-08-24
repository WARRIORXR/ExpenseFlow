/* ============================================
   CHARTS — Chart.js Configuration Factories
   ============================================ */

import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

// Global Chart.js defaults
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#a5a5c0';
Chart.defaults.borderColor = 'rgba(99, 102, 241, 0.08)';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(10, 10, 30, 0.9)';
Chart.defaults.plugins.tooltip.titleFont = { weight: '600' };
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 10;
Chart.defaults.plugins.tooltip.borderColor = 'rgba(99, 102, 241, 0.2)';
Chart.defaults.plugins.tooltip.borderWidth = 1;

// Track chart instances for cleanup
const chartInstances = {};

/**
 * Destroy existing chart at a given canvas ID and return the context.
 */
function getCtx(canvasId) {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
    delete chartInstances[canvasId];
  }
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  return canvas.getContext('2d');
}

/**
 * Store a chart instance for later cleanup.
 */
function trackChart(canvasId, chart) {
  chartInstances[canvasId] = chart;
  return chart;
}

/**
 * Create a Doughnut/Pie chart for category breakdown.
 */
export function createCategoryPieChart(canvasId, data, currencySymbol = '₹') {
  const ctx = getCtx(canvasId);
  if (!ctx) return null;

  const total = data.reduce((s, d) => s + d.amount, 0);

  return trackChart(canvasId, new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.categoryName || d.category),
      datasets: [{
        data: data.map(d => d.amount),
        backgroundColor: data.map(d => d.color || getDefaultColor(d.category)),
        borderWidth: 0,
        hoverBorderWidth: 3,
        hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 12,
            font: { size: 12 },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const value = ctx.parsed;
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return ` ${ctx.label}: ${currencySymbol}${value.toLocaleString()} (${pct}%)`;
            },
          },
        },
      },
      animation: {
        animateRotate: true,
        duration: 800,
      },
    },
  }));
}

/**
 * Create a Bar chart for monthly comparison (income vs expense).
 */
export function createMonthlyBarChart(canvasId, monthlyData, currencySymbol = '₹') {
  const ctx = getCtx(canvasId);
  if (!ctx) return null;

  return trackChart(canvasId, new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthlyData.map(d => d.label),
      datasets: [
        {
          label: 'Income',
          data: monthlyData.map(d => d.income),
          backgroundColor: 'rgba(52, 211, 153, 0.7)',
          hoverBackgroundColor: 'rgba(52, 211, 153, 0.9)',
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
        {
          label: 'Expenses',
          data: monthlyData.map(d => d.expense),
          backgroundColor: 'rgba(248, 113, 113, 0.7)',
          hoverBackgroundColor: 'rgba(248, 113, 113, 0.9)',
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
        y: {
          grid: { color: 'rgba(99, 102, 241, 0.06)' },
          ticks: {
            font: { size: 11 },
            callback: (v) => currencySymbol + (v >= 1000 ? (v / 1000) + 'K' : v),
          },
        },
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${currencySymbol}${ctx.parsed.y.toLocaleString()}`,
          },
        },
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart',
      },
    },
  }));
}

/**
 * Create a Line chart for spending trends.
 */
export function createSpendingLineChart(canvasId, dailyData, currencySymbol = '₹') {
  const ctx = getCtx(canvasId);
  if (!ctx) return null;

  // Create gradient
  const canvas = document.getElementById(canvasId);
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)');

  return trackChart(canvasId, new Chart(ctx, {
    type: 'line',
    data: {
      labels: dailyData.map(d => d.label),
      datasets: [{
        label: 'Spending',
        data: dailyData.map(d => d.amount),
        borderColor: '#818cf8',
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#818cf8',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 10 },
            maxTicksLimit: 8,
          },
        },
        y: {
          grid: { color: 'rgba(99, 102, 241, 0.06)' },
          ticks: {
            font: { size: 11 },
            callback: (v) => currencySymbol + (v >= 1000 ? (v / 1000) + 'K' : v),
          },
          beginAtZero: true,
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` Spent: ${currencySymbol}${ctx.parsed.y.toLocaleString()}`,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart',
      },
    },
  }));
}

/**
 * Create a horizontal bar chart for category breakdown.
 */
export function createCategoryBarChart(canvasId, data, currencySymbol = '₹') {
  const ctx = getCtx(canvasId);
  if (!ctx) return null;

  return trackChart(canvasId, new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.categoryName || d.category),
      datasets: [{
        label: 'Amount',
        data: data.map(d => d.amount),
        backgroundColor: data.map(d => (d.color || getDefaultColor(d.category)) + 'cc'),
        hoverBackgroundColor: data.map(d => d.color || getDefaultColor(d.category)),
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.7,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: 'rgba(99, 102, 241, 0.06)' },
          ticks: {
            font: { size: 11 },
            callback: (v) => currencySymbol + (v >= 1000 ? (v / 1000) + 'K' : v),
          },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 12, weight: '500' } },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${currencySymbol}${ctx.parsed.x.toLocaleString()}`,
          },
        },
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart',
      },
    },
  }));
}

/**
 * Destroy all tracked charts.
 */
export function destroyAllCharts() {
  Object.keys(chartInstances).forEach(id => {
    chartInstances[id].destroy();
    delete chartInstances[id];
  });
}

/**
 * Get a default color for a category.
 */
function getDefaultColor(category) {
  const colorMap = {
    food: '#f97316',
    transport: '#3b82f6',
    entertainment: '#a855f7',
    bills: '#ef4444',
    healthcare: '#ec4899',
    shopping: '#f59e0b',
    education: '#6366f1',
    travel: '#14b8a6',
    rent: '#8b5cf6',
    utilities: '#64748b',
    salary: '#22c55e',
    freelance: '#06b6d4',
    investment: '#10b981',
    gift: '#f472b6',
    others_expense: '#78716c',
    others_income: '#a3a3a3',
  };
  return colorMap[category] || '#818cf8';
}
