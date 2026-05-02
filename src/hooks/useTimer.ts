import { useState, useEffect } from 'react';

export function useTimer(startTime?: string, isActive: boolean = false) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    if (!isActive || !startTime) {
      setElapsedMinutes(0);
      return;
    }

    const start = new Date(startTime).getTime();
    
    const update = () => {
      const now = new Date().getTime();
      const diff = Math.floor((now - start) / 60000);
      setElapsedMinutes(diff);
    };

    update();
    const interval = setInterval(update, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [startTime, isActive]);

  return {
    elapsedMinutes,
    status: elapsedMinutes < 60 ? 'normal' : elapsedMinutes < 90 ? 'attention' : 'overdue',
    label: elapsedMinutes < 60 
      ? `Tempo decorrido: ${elapsedMinutes}min` 
      : elapsedMinutes < 90 
        ? `Tempo decorrido: ${elapsedMinutes}min — Atenção` 
        : `Tempo decorrido: ${elapsedMinutes}min — Prazo ultrapassado`
  };
}
