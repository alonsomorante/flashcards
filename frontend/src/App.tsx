import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BooksPage } from './routes/BooksPage';
import { BookDetailPage } from './routes/BookDetailPage';
import { ChapterPage } from './routes/ChapterPage';
import { StudyChapterPage } from './routes/StudyChapterPage';
import { StudyBookPage } from './routes/StudyBookPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<BooksPage />} />
          <Route path="/books/:bookId" element={<BookDetailPage />} />
          <Route path="/books/:bookId/study" element={<StudyBookPage />} />
          <Route path="/chapters/:chapterId" element={<ChapterPage />} />
          <Route path="/chapters/:chapterId/study" element={<StudyChapterPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
