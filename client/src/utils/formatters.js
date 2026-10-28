export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const getStageBadgeVariant = (stage) => {
  switch (stage) {
    case 'won':
      return 'success';
    case 'lost':
      return 'danger';
    case 'proposal':
      return 'info';
    case 'qualified':
      return 'warning';
    default:
      return 'neutral';
  }
};

export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'lead':
      return 'info';
    case 'inactive':
      return 'neutral';
    default:
      return 'neutral';
  }
};
