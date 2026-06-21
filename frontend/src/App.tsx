import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { BooksPage } from './routes/BooksPage';
import { BookDetailPage } from './routes/BookDetailPage';
import { ChapterPage } from './routes/ChapterPage';
import { StudyChapterPage } from './routes/StudyChapterPage';
import { StudyBookPage } from './routes/StudyBookPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<BooksPage />} />
          <Route path="/books/:bookId" element={<BookDetailPage />} />
          <Route path="/books/:bookId/study" element={<StudyBookPage />} />
          <Route path="/chapters/:chapterId" element={<ChapterPage />} />
          <Route path="/chapters/:chapterId/study" element={<StudyChapterPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
