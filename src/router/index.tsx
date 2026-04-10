import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { AdminLayout } from "../layouts/AdminLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { FacultyPage } from "../pages/FacultyPage";
import { LeadsPage } from "../pages/LeadsPage";
import { LoginPage } from "../pages/LoginPage";
import { StudentsPage } from "../pages/StudentsPage";

const SchedulePage = lazy(() => import("../pages/SchedulePage").then((m) => ({ default: m.SchedulePage })));
const SocialPage = lazy(() => import("../pages/SocialPage").then((m) => ({ default: m.SocialPage })));

const withSuspense = (component: ReactNode) => <Suspense fallback={<div className="p-8">Loading...</div>}>{component}</Suspense>;

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/students", element: <StudentsPage /> },
          { path: "/faculty", element: <FacultyPage /> },
          { path: "/schedule", element: withSuspense(<SchedulePage />) },
          { path: "/leads", element: <LeadsPage /> },
          { path: "/social", element: withSuspense(<SocialPage />) },
        ],
      },
    ],
  },
]);
