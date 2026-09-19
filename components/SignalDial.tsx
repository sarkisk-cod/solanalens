type SignalDialProps = {
  value: number;
  label?: string;
};

export function SignalDial({ value, label = "Signal" }: SignalDialProps) {
  const radius = 37;
  const circumference = 2 * Math.PI * radius;
  const dash = (value / 100) * circumference;

  return (
    <div className="signal-dial" aria-label={`${label}: ${value} out of 100`}>
      <svg viewBox="0 0 90 90" aria-hidden="true">
        <circle className="dial-track" cx="45" cy="45" r={radius} />
        <circle
          className="dial-value"
          cx="45"
          cy="45"
          r={radius}
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="dial-copy">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
