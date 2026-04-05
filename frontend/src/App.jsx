import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VoiceConsolePage from "./pages/VoiceConsolePage";
import SetupPage from "./pages/SetupPage";

function navClass({ isActive }) {
	return isActive ? "nav-link active" : "nav-link";
}

export default function App() {
	return (
		<div className="app-root">
			<header className="topbar">
				<p className="brand">AgentDesk</p>
				<nav>
					<NavLink className={navClass} to="/">
						Home
					</NavLink>
					<NavLink className={navClass} to="/voice-console">
						Voice Console
					</NavLink>
					<NavLink className={navClass} to="/setup">
						Setup
					</NavLink>
				</nav>
			</header>

			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/voice-console" element={<VoiceConsolePage />} />
				<Route path="/setup" element={<SetupPage />} />
				<Route path="*" element={<Navigate replace to="/" />} />
			</Routes>
		</div>
	);
}
