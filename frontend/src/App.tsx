import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import ExplorePage from "./components/pages/ExplorePage";
import HomePage from "./components/pages/HomePage";
import LandingPage from "./components/pages/LandingPage";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import AdminPage from "./components/pages/AdminPage";

export default function App() {
  const { user, authLoading } = useAuth();

  // While checking token/user info, show a loading screen
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-foreground">
        <span className="animate-pulse text-lg font-semibold">Loading...</span>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Show navbar only for logged-in users */}
        {user && <Navbar />}

        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/home" replace /> : <LandingPage />}
          />

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            {
              user?.user_type === 'admin' && <Route path="/admin" element={<AdminPage />} />
            }
          </Route>

          {/* <Route
            path="*"
            element={<Navigate to={user ? "/home" : "/"} replace />}
          /> */}
        </Routes>
      </div>
    </Router>
  );
}
