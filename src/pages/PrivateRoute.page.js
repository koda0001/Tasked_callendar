import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/user.context";

const PrivateRoute = (props) => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  return user ? <Outlet /> : <Navigate to={`/login?redirectTo=${encodeURI(location.pathname)}`} />;
}

export default PrivateRoute;
