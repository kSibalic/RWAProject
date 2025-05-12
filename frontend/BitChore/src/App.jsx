import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';

import Dashboard from './pages/Admin/Dashboard';
import ManageChores from './pages/Admin/ManageChores';
import CreateChore from './pages/Admin/CreateChore';
import ManageUsers from './pages/Admin/ManageUsers';

import UserDashboard from './pages/User/UserDashboard';
import MyChores from './pages/User/MyChores';
import ViewChoreDetails from './pages/User/ViewChoreDetails';

import PrivateRoute from './routes/PrivateRoute';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />

          { /* Admin Routes */ }
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/chores" element={<ManageChores />} />
            <Route path="/admin/create-chore" element={<CreateChore />} />
            <Route path="/admin/users" element={<ManageUsers />} />
          </Route>

          { /* User Routes */ }
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/chores" element={<MyChores />} />
            <Route path="/user/chore-details/:id" element={<ViewChoreDetails />} />
          </Route>
          
        </Routes>
      </Router>
    </div>
  );
};

export default App;