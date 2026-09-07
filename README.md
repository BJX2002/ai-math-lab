# AI Math Lab

AI Math Lab is a visual, code-first introduction to linear algebra for students beginning artificial intelligence. The course is intentionally independent of a single university syllabus and combines short explanations, examples, browser-based experiments, NumPy exercises, quizzes, and device-local progress.

## Learning path

1. Vectors — represent data
2. Dot products — measure similarity
3. Matrices — transform batches
4. Linear systems — find useful solutions
5. PCA & SVD — compress information
6. Optimization — teach models to learn

## Development

Requires Node.js 22.13 or newer.

On Windows, double-click `START-AI-MATH-LAB.cmd` to start the local copy and open it in your browser. Keep the terminal window open while using the site, then close it when finished.

```bash
npm install
npm run dev
```

Run the quality checks before publishing:

```bash
npm run lint
npm test
```

Course content lives in `lib/course-data.ts`. Shared interactive exercises live in `components/InteractiveLab.tsx`, so a module's explanation, code lab, and quiz can be maintained without relying on an external video.
