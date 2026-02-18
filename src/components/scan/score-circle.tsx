"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScoreCircleProps {
  score: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const sizes = {
  sm: { container: "size-20", text: "text-xl", stroke: 4, radius: 34 },
  md: { container: "size-32", text: "text-3xl", stroke: 5, radius: 56 },
  lg: { container: "size-44", text: "text-5xl", stroke: 6, radius: 78 },
};

function getScoreColor(score: number): string {
  if (score >= 90) return "text-score-good";
  if (score >= 70) return "text-score-moderate";
  return "text-score-bad";
}

function getStrokeColor(score: number): string {
  if (score >= 90) return "stroke-score-good";
  if (score >= 70) return "stroke-score-moderate";
  return "stroke-score-bad";
}

export function ScoreCircle({
  score,
  size = "md",
  animated = true,
  className,
}: ScoreCircleProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const config = sizes[size];
  const circumference = 2 * Math.PI * config.radius;
  const progress = (displayScore / 100) * circumference;
  const dashOffset = circumference - progress;

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    let frame: number;
    const duration = 1000;
    const startTime = performance.now();
    const startScore = 0;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(startScore + (score - startScore) * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score, animated]);

  const viewBoxSize = (config.radius + config.stroke) * 2;
  const center = viewBoxSize / 2;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", config.container, className)}
      role="img"
      aria-label={`Toegankelijkheidsscore: ${score} van 100`}
    >
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="size-full -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          fill="none"
          strokeWidth={config.stroke}
          className="stroke-muted"
        />
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          fill="none"
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn("transition-all duration-1000 ease-out", getStrokeColor(score))}
        />
      </svg>
      <span
        className={cn(
          "absolute font-bold tabular-nums",
          config.text,
          getScoreColor(score)
        )}
      >
        {displayScore}
      </span>
    </div>
  );
}
