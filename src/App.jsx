import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <div className="h-full min-h-screen bg-navy-900 text-slate-100 flex flex-col">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
