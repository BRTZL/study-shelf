import { Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import CourseShell from '@/components/shelf/CourseShell'
import Home from '@/pages/Home'
import Overview from '@/pages/Overview'
import Lessons from '@/pages/Lessons'
import Reader from '@/pages/Reader'
import Practice from '@/pages/Practice'
import Exams from '@/pages/Exams'
import ExamRun from '@/pages/ExamRun'
import Flashcards from '@/pages/Flashcards'

export default function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/c/:id" element={<CourseShell />}>
          <Route index element={<Overview />} />
          <Route path="learn" element={<Lessons />} />
          <Route path="learn/:n" element={<Reader />} />
          <Route path="practice" element={<Practice />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exams/:examId" element={<ExamRun />} />
          <Route path="cards" element={<Flashcards />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Routes>
      <Toaster position="bottom-center" />
    </TooltipProvider>
  )
}
