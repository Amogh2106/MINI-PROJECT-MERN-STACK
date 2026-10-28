import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute.jsx';
import AppLayout from '../layouts/AppLayout.jsx';

import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import ContactList from '../pages/Contacts/ContactList.jsx';
import ContactDetail from '../pages/Contacts/ContactDetail.jsx';
import CompanyList from '../pages/Companies/CompanyList.jsx';
import CompanyDetail from '../pages/Companies/CompanyDetail.jsx';
import DealList from '../pages/Deals/DealList.jsx';
import DealDetail from '../pages/Deals/DealDetail.jsx';
import TaskList from '../pages/Tasks/TaskList.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="contacts" element={<ContactList />} />
        <Route path="contacts/:id" element={<ContactDetail />} />
        <Route path="companies" element={<CompanyList />} />
        <Route path="companies/:id" element={<CompanyDetail />} />
        <Route path="deals" element={<DealList />} />
        <Route path="deals/:id" element={<DealDetail />} />
        <Route path="tasks" element={<TaskList />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
