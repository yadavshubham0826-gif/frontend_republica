import { useScrollFadeIn } from '../hooks/useScrollFadeIn';
import '../styles/style.css';

const FadeInSection = ({ children, className = '', delay = 0, threshold = 0.1 }) => {
  const ref = useScrollFadeIn({ delay, threshold });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default FadeInSection;










