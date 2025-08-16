import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import { ViewModelProvider } from './provider/ViewModel';
import { Home } from './pages/Home';
import { SeatMap } from './pages/SeatMap';
import { Welcome } from './pages/Welcome';

export default function App() {
  return (
    <ViewModelProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/seat-map" element={<SeatMap />} />
          <Route path="/welcome" element={<Welcome />} />
        </Routes>
      </Router>
    </ViewModelProvider>
  );
}
