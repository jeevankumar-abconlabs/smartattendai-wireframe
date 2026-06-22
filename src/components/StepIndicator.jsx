import './StepIndicator.css';

export default function StepIndicator({ steps, current }) {
  return (
    <div className="step-indicator">
      {steps.map((step, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div className="step-indicator__item" key={step}>
            <div className={`step-indicator__circle ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
              {done ? '✓' : idx}
            </div>
            <span className={`step-indicator__label ${active ? 'active' : ''}`}>{step}</span>
            {i < steps.length - 1 && <div className={`step-indicator__line ${done ? 'done' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
}
