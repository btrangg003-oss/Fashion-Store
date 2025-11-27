// Chart Configuration Constants

export const CHART_COLORS = {
  // Primary colors
  revenue: '#10b981',      // Green
  target: '#9ca3af',       // Gray
  retention: '#8b5cf6',    // Purple
  marketing: '#f59e0b',    // Orange
  
  // Status colors
  pending: '#6b7280',      // Gray
  processing: '#f59e0b',   // Orange
  shipping: '#3b82f6',     // Blue
  delivered: '#10b981',    // Green
  cancelled: '#ef4444',    // Red
  
  // Product categories
  hot: '#10b981',          // Green
  normal: '#3b82f6',       // Blue
  slow: '#f59e0b',         // Orange
  outOfStock: '#ef4444',   // Red
  
  // Demographics gradient
  demographicsGradient: [
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#c026d3'
  ]
};

export const CHART_CONFIG = {
  height: {
    small: 250,
    medium: 350,
    large: 450
  },
  margin: {
    top: 20,
    right: 30,
    bottom: 20,
    left: 20
  },
  animation: {
    duration: 500,
    easing: 'ease-out' as const
  }
};

export const CHART_STYLES = {
  tooltip: {
    contentStyle: {
      backgroundColor: '#1f2937',
      border: 'none',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    labelStyle: {
      color: '#f9fafb',
      fontWeight: 600,
      marginBottom: '8px'
    },
    itemStyle: {
      color: '#e5e7eb'
    }
  },
  legend: {
    wrapperStyle: {
      paddingTop: '20px'
    },
    iconType: 'circle' as const
  }
};
