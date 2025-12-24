// //import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Register from "./pages/Register.jsx";
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// import AdminLogin from './pages/AdminLogin';
// import AdminPanel from './pages/AdminPanel';   // path must be correct
// import './styles/global.css';
// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Navigate to="/register" />} />
//         <Route path="/register" element={<Register />} />
//       {/* admin routes */}
//         <Route path="/admin-login" element={<AdminLogin />} />
//         <Route path="/admin-panel" element={<AdminPanel />} />   {/*  this is the admin panel route */}

//       </Routes>
//     </BrowserRouter>
//   );
// }

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';



import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import './styles/global.css';
import Register from "./pages/Register.jsx";

function App() {
  return (
    <Router>
      <Routes>
       
         <Route path="/" element={<Navigate to="/register" />} />
         <Route path="/register" element={<Register />} />
     
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
