import { Navigate } from 'react-router-dom';

/**
 * A wrapper component that checks if a user is authenticated.
 * If they are not authenticated, it redirects them to the login page.
 * If they are authenticated, it renders the protected children components.
 */
const ProtectedRoute = ({ session, children }) => {
  if (!session) {
    // Redirect to login if unauthenticated
    return <Navigate to="/login" replace />;
  }

  // Render children components if authenticated
  return children;
};

export default ProtectedRoute;
