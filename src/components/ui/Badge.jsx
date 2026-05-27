import clsx from 'clsx';

export default function Badge({ children, color = 'default', className = '' }) {
  const colors = {
    default: 'bg-surface-hover text-text-secondary',
    accent: 'bg-accent/20 text-accent-light',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colors[color], className)}>
      {children}
    </span>
  );
}
