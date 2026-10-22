const VARIANTS = ['primary', 'secondary'];

export default function Button({ variant = 'primary', type = 'button', className = '', ...props }) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'primary';
  const classes = ['button', `button--${safeVariant}`, className].filter(Boolean).join(' ');
  return <button type={type} className={classes} {...props} />;
}
