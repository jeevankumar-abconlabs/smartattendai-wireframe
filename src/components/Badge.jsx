import './Badge.css';

const styles = {
  Verified: 'badge--verified',
  'Unknown Face': 'badge--unknown',
  'Manual Override': 'badge--override',
};

export default function Badge({ label }) {
  return (
    <span className={`badge ${styles[label] ?? 'badge--verified'}`}>
      {label}
    </span>
  );
}
