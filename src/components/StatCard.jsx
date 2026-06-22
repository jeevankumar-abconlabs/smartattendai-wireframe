import './StatCard.css';

export default function StatCard({ value, label, Icon, accent }) {
  return (
    <div className={`stat-card card ${accent ? 'stat-card--accent' : ''}`}>
      <div className="stat-card__top">
        {Icon && (
          <div className={`stat-card__icon-wrap ${accent ? 'stat-card__icon-wrap--accent' : ''}`}>
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="stat-card__value">{value}</div>
      <div className={`stat-card__label ${accent ? '' : 'text-muted'}`}>{label}</div>
    </div>
  );
}
