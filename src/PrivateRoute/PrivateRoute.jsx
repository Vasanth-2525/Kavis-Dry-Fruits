import { Navigate } from "react-router-dom";
import { useStore } from "../Context/StoreContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useStore(); 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
