"use client";

import { useState } from "react";
import { courseModules } from "../lib/course-data";

const STORAGE_KEY = "ai-math-lab-progress";

export function ProgressOverview() {
  const [completed] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  const percent = Math.round((completed.length / courseModules.length) * 100);

  return (
    <aside className="progress-card" aria-label="Course progress">
      <div className="progress-copy">
        <span>YOUR PROGRESS</span>
        <strong>{completed.length} / {courseModules.length} modules</strong>
      </div>
      <div className="progress-track" aria-label={`${percent}% complete`}>
        <span style={{ width: `${percent}%` }} />
      </div>
      <b>{percent}%</b>
    </aside>
  );
}
