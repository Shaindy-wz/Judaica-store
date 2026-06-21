import { Link } from 'react-router-dom';
import styles from './Button.module.css';

export default function Button({ href, variant = 'primary', children, onClick, type = 'button', ...rest }) {
  const className = `${styles.button} ${styles[variant] ?? ''}`;

  if (href) {
    return (
      <Link to={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={className} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
