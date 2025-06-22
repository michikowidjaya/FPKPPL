// File: frontend/src/components/PrivateRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, isLoggedIn, onLogin }) => {
  if (!isLoggedIn) {
    // Jika tidak login, arahkan ke halaman login
    // Kita perlu meneruskan onLogin ke LoginPage jika itu yang diharapkan oleh LoginPage
    // Atau bisa juga langsung redirect tanpa prop khusus jika LoginPage menanganinya sendiri
    return <Navigate to="/login" replace />;
    // 'replace' akan mengganti entri saat ini di history stack
  }

  // Jika login, render komponen anak (halaman yang seharusnya diakses)
  return children;
};

export default PrivateRoute;