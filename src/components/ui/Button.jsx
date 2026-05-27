import clsx from 'clsx';

export default function Button({ children, variant = 'ghost', size = 'md', className = '', onClick, disabled, title, id }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-accent hover:bg-accent-dark text-white rounded-full hover:scale-105 active:scale-95',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg active:scale-95',
    danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg',
    icon: 'text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-hover active:scale-90',
  };
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    icon: 'p-2',
  };
  return (
    <button id={id} title={title} disabled={disabled} onClick={onClick} className={clsx(base, variants[variant], sizes[variant === 'icon' ? 'icon' : size], className)}>
      {children}
    </button>
  );
}
