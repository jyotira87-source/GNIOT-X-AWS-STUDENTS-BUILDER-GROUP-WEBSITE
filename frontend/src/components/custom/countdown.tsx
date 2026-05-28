"use client";

import { useEffect, useMemo, useState } from "react";

function getCountdown(targetDate: Date) {
  const distance = targetDate.getTime() - new Date().getTime();
  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  return { days, hours, minutes, seconds, ended: false };
}

export function Countdown({ isoDate }: { isoDate: string }) {
  const target = useMemo(() => new Date(isoDate), [isoDate]);
  const [timeLeft, setTimeLeft] = useState(() => getCountdown(target));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getCountdown(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {[
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Min", value: timeLeft.minutes },
        { label: "Sec", value: timeLeft.seconds },
      ].map((item) => (
        <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-xl font-semibold text-slate-100">{item.value.toString().padStart(2, "0")}</p>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">{item.label}</p>
        </div>
      ))}
      {timeLeft.ended && <p className="col-span-4 text-xs text-cyan-300">Event is live now.</p>}
    </div>
  );
}
