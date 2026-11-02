# Study Shelf

A small study portal: lessons, printable PDF guides, practice questions, mock exams and flashcards for each course. Progress is saved in the browser (localStorage, key `studyshelf:<course>:v1`).

- Vite + React + Tailwind + shadcn/ui, HashRouter and `base: './'` so it works from any path.
- Content lives in `public/courses/<id>/course.json` (+ the PDF and images). `public/courses/index.json` lists the courses.
- Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Adding a course

Generate `public/courses/<id>/course.json` with the shape in `src/lib/types.ts` (`Course`), then rebuild the manifest (the exporters in the guide pipeline do both).

```bash
npm install
npm run dev
```
