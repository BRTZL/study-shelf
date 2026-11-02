# Study Shelf

A small study portal: lessons, printable PDF guides, practice questions, mock exams and flashcards for each course. Progress is saved in the browser (localStorage, key `studyshelf:<course>:v1`).

- Vite + React + Tailwind + shadcn/ui, HashRouter and `base: './'` so it works from any path.
- Content lives in `public/courses/<id>/course.json` (+ the PDF and images). `public/courses/index.json` lists the courses.
- Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Languages

A course can ship extra editions as `public/courses/<id>/course.<lang>.json` and list them in `langs` (e.g. MAT2039 has `en` + `tr`). Editions share ids and option order, so progress carries over; the header shows an EN/TR toggle and remembers the choice (`studyshelf:lang:<id>`).

## Adding a course

Generate `public/courses/<id>/course.json` with the shape in `src/lib/types.ts` (`Course`), then rebuild the manifest (the exporters in the guide pipeline do both).

```bash
npm install
npm run dev
```
