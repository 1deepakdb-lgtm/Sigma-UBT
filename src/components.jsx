import { useNavigate } from "react-router-dom";
import { LOGO, logout, currentUser } from "./utils";

export function Header({ title = "Sigma UBT" }) {
  const navigate = useNavigate();
  const user = currentUser();
  
  function out() {
    logout();
    navigate("/");
  }
  
  return (
    <header className="app-header">
      <div className="header-left">
        <img src={LOGO} alt="Sigma Education" className="header-logo" />
        <div>
          <div className="header-title">{title}</div>
          <div className="header-subtitle">{user?.role ? user.role.toUpperCase() : "UBT"}</div>
        </div>
      </div>
      <button className="danger-btn" onClick={out}>Logout</button>
    </header>
  );
}

export function Guard({ role, children }) {
  const user = currentUser();
  if (!user || user.role !== role) return null;
  return children;
}

export function PageCard({ icon, title, text, onClick }) {
  return (
    <div className="dashboard-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="dashboard-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}