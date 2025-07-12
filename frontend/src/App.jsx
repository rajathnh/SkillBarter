import React from 'react';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage'; // Import the new page
import './App.css'; // Keep this for any global styles

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        {/* For now, we are directly showing the login page */}
        {/* Later, we will use a router to show different pages */}
        <LoginPage /> 
      </main>
    </div>
  );
}

export default App;