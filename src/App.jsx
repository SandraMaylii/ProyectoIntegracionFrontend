import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import Aprendizaje from './pages/Aprendizaje';
import AprendizajeIndividual from './components/AprendizajeIndividual'; // ✅ Ruta real
import PruebaDeteccion from './pages/PruebaDeteccion';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/aprendizaje-individual" element={<AprendizajeIndividual />} />

        <Route path="/prueba" element={<PruebaDeteccion />} />
        <Route path="/aprendizaje" element={<Aprendizaje />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
