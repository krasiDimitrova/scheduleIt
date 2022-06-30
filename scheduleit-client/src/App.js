import "./App.css";
import { Calendar } from "./components/calendar/Calendar";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
} from "react-router-dom";
import { ContactList } from "./components/contacts/ContactList";
import { CategoryList } from "./components/categories/CategoryList";
import { InvitesList } from "./components/invites/InvitesList";
import LoginForm from "./components/auth/LoginPage";
import RegistrationForm from "./components/auth/Register";

function App() {
  return [
    <main>
      <Router>
        <nav>
          <div className="nav-wrapper">
            <div className="brand-logo">ScheduleIt</div>
            <ul id="nav-mobile" className="right hide-on-med-and-down">
              <li>
                <Link to="/calendar">Calendar</Link>
              </li>
              <li>
                <Link to="/contacts">Contacts</Link>
              </li>
              <li>
                <Link to="/categories">Categories</Link>
              </li>
              <li>
                <Link to="/invites">Invites</Link>
              </li>
              <li>
                <Link to="/logout">Logout</Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route key="register" exact path="/register" element={<Register />} />
          <Route key="login" exact path="/login" element={<Login />} />
          <Route key="main" exact path="/" element={<PrivateRoute />}>
            <Route
              key="calendar"
              exact
              path="/calendar"
              element={<CalendarHome />}
            />
            <Route
              key="contacts"
              exact
              path="/contacts"
              element={<Contacts />}
            />
            <Route
              key="categories"
              exact
              path="/categories"
              element={<Categories />}
            />
            <Route key="invites" exact path="/invites" element={<Invites />} />
            <Route key="logout" exact path="/logout" element={<Logout />} />
          </Route>
        </Routes>
      </Router>
    </main>,

    <footer className="page-footer footer-fixed">
      <div className="footer-copyright">
        <div className="container">© 2022 Krasimira Milkova</div>
      </div>
    </footer>,
  ];
}

export default App;

const PrivateRoute = () => {
  return !!sessionStorage.getItem("token") ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
};

function Register() {
  return (
    <div className="container">
      <RegistrationForm />
    </div>
  );
}

function Login() {
  sessionStorage.removeItem("token");
  return (
    <div className="container">
      <LoginForm />
    </div>
  );
}

function Logout() {
  sessionStorage.removeItem("token");
  return <Navigate to="/login" />;
}

function CalendarHome() {
  return (
    <div className="container">
      <Calendar />
    </div>
  );
}

function Contacts() {
  return (
    <div className="container">
      <ContactList />
    </div>
  );
}

function Categories() {
  return (
    <div className="container">
      <CategoryList />
    </div>
  );
}

function Invites() {
  return (
    <div className="container">
      <InvitesList />
    </div>
  );
}
