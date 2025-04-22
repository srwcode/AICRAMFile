import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import config from './config';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';

import MainLayout from './layout/MainLayout';
import MemberLayout from './layout/MemberLayout';
import AdminLayout from './layout/AdminLayout';
import AuthLayout from './layout/AuthLayout';

import Landing from './pages/Main/Landing';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import About from './pages/Main/About';
import Contact from './pages/Main/Contact';
import Terms from './pages/Main/Terms';
import Privacy from './pages/Main/Privacy';
import Documentation from './pages/Main/Documentation';

import AdminDashboard from './pages/Admin/Dashboard';

import AdminUserIndex from './pages/Admin/users/UserIndex';
import AdminUserCreate from './pages/Admin/users/UserCreate';
import AdminUserEdit from './pages/Admin/users/UserEdit';
import AdminUserView from './pages/Admin/users/UserView';

import AdminFileIndex from './pages/Admin/files/FileIndex';
import AdminFileView from './pages/Admin/files/FileView';

import AdminOrganizationIndex from './pages/Admin/organizations/OrganizationIndex';
import AdminOrganizationCreate from './pages/Admin/organizations/OrganizationCreate';
import AdminOrganizationEdit from './pages/Admin/organizations/OrganizationEdit';
import AdminOrganizationView from './pages/Admin/organizations/OrganizationView';

import AdminAssessmentIndex from './pages/Admin/assessments/AssessmentIndex';
import AdminAssessmentCreate from './pages/Admin/assessments/AssessmentCreate';
import AdminAssessmentEdit from './pages/Admin/assessments/AssessmentEdit';
import AdminAssessmentView from './pages/Admin/assessments/AssessmentView';

import AdminResultIndex from './pages/Admin/results/ResultIndex';
import AdminResultCreate from './pages/Admin/results/ResultCreate';
import AdminResultEdit from './pages/Admin/results/ResultEdit';
import AdminResultView from './pages/Admin/results/ResultView';

import AdminMatrixIndex from './pages/Admin/matrices/MatrixIndex';
import AdminMatrixCreate from './pages/Admin/matrices/MatrixCreate';
import AdminMatrixEdit from './pages/Admin/matrices/MatrixEdit';
import AdminMatrixView from './pages/Admin/matrices/MatrixView';


import MemberDashboard from './pages/Member/Dashboard';
import MemberSettings from './pages/Member/Settings';

import MemberOrganizationIndex from './pages/Member/organizations/OrganizationIndex';
import MemberOrganizationCreate from './pages/Member/organizations/OrganizationCreate';
import MemberOrganizationEdit from './pages/Member/organizations/OrganizationEdit';
import MemberOrganizationView from './pages/Member/organizations/OrganizationView';

import MemberAssessmentIndex from './pages/Member/assessments/AssessmentIndex';
import MemberAssessmentCreate from './pages/Member/assessments/AssessmentCreate';
import MemberAssessmentEdit from './pages/Member/assessments/AssessmentEdit';
import MemberAssessmentView from './pages/Member/assessments/AssessmentView';
import MemberAssessmentClone from './pages/Member/assessments/AssessmentClone';

import MemberMatrixIndex from './pages/Member/matrices/MatrixIndex';
import MemberMatrixCreate from './pages/Member/matrices/MatrixCreate';
import MemberMatrixEdit from './pages/Member/matrices/MatrixEdit';
import MemberMatrixView from './pages/Member/matrices/MatrixView';

import MemberResultIndex from './pages/Member/results/ResultIndex';
import MemberResultView from './pages/Member/results/ResultView';


function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    
    if (!authToken) {
      if (pathname.startsWith('/admin') || pathname.startsWith('/member')) {
        navigate('/auth/signin');
      }
    } else {
      fetch(`${config.API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': authToken || ''
        }
      })
        .then((response) => response.json())
        .then((data) => {
          setUserType(data.user_type);

          if (data.user_type === 'USER') {
            if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) {
              navigate('/member');
            }
          } else if (data.user_type === 'ADMIN') {
            if (pathname.startsWith('/member') || pathname.startsWith('/auth')) {
              navigate('/admin');
            }
          } else {
            if (pathname.startsWith('/admin') || pathname.startsWith('/member')) {
              navigate('/auth/signin');
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching user type:', error);
          setUserType(null);
        });
    }
  }, [pathname, navigate]);

  if (loading) {
    return <Loader />;
  }

  let Layout;

  if (pathname.startsWith('/auth')) {
    Layout = AuthLayout;
  } else if (pathname.startsWith('/member') && userType === 'USER') {
    Layout = MemberLayout;
  } else if (pathname.startsWith('/admin') && userType === 'ADMIN') {
    Layout = AdminLayout;
  } else {
    Layout = MainLayout;
  }

  return (
    <Layout>
      <Routes>
        <Route
          index
          element={
            <>
              <PageTitle title="AI-CRAM" />
              <Landing />
            </>
          }
        />
        <Route
          path="/auth/signin"
          element={
            <>
              <PageTitle title="Signin" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <>
              <PageTitle title="Signup" />
              <SignUp />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <PageTitle title="About Us" />
              <About />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <PageTitle title="Contact Us" />
              <Contact />
            </>
          }
        />
        <Route
          path="/terms"
          element={
            <>
              <PageTitle title="Terms of Service" />
              <Terms />
            </>
          }
        />
        <Route
          path="/privacy"
          element={
            <>
              <PageTitle title="Privacy Policy" />
              <Privacy />
            </>
          }
        />
        <Route
          path="/documentation"
          element={
            <>
              <PageTitle title="Documentation" />
              <Documentation />
            </>
          }
        />
        

        

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <>
              <PageTitle title="Admin Dashboard" />
              <AdminDashboard />
            </>
          }
        />
        <Route
          path="/admin/users"
          element={
            <>
              <PageTitle title="Users" />
              <AdminUserIndex />
            </>
          }
        />
        <Route
          path="/admin/users/create"
          element={
            <>
              <PageTitle title="Create User" />
              <AdminUserCreate />
            </>
          }
        />
        <Route
          path="/admin/users/:user_id"
          element={
            <>
              <PageTitle title="User Details" />
              <AdminUserView />
            </>
          }
        />
        <Route
          path="/admin/users/:user_id/edit"
          element={
            <>
              <PageTitle title="Edit User" />
              <AdminUserEdit />
            </>
          }
        />
        <Route
          path="/admin/files"
          element={
            <>
              <PageTitle title="Files" />
              <AdminFileIndex />
            </>
          }
        />
        <Route
          path="/admin/files/:file_id"
          element={
            <>
              <PageTitle title="File Details" />
              <AdminFileView />
            </>
          }
        />
        <Route
          path="/admin/organizations"
          element={
            <>
              <PageTitle title="Organizations" />
              <AdminOrganizationIndex />
            </>
          }
        />
        <Route
          path="/admin/organizations/create"
          element={
            <>
              <PageTitle title="Create Organization" />
              <AdminOrganizationCreate />
            </>
          }
        />
        <Route
          path="/admin/organizations/:organization_id"
          element={
            <>
              <PageTitle title="Organization Details" />
              <AdminOrganizationView />
            </>
          }
        />
        <Route
          path="/admin/organizations/:organization_id/edit"
          element={
            <>
              <PageTitle title="Edit Organization" />
              <AdminOrganizationEdit />
            </>
          }
        />
        <Route
          path="/admin/assessments"
          element={
            <>
              <PageTitle title="Assessments" />
              <AdminAssessmentIndex />
            </>
          }
        />
        <Route
          path="/admin/assessments/create"
          element={
            <>
              <PageTitle title="Create Assessment" />
              <AdminAssessmentCreate />
            </>
          }
        />
        <Route
          path="/admin/assessments/:assessment_id"
          element={
            <>
              <PageTitle title="Assessment Details" />
              <AdminAssessmentView />
            </>
          }
        />
        <Route
          path="/admin/assessments/:assessment_id/edit"
          element={
            <>
              <PageTitle title="Edit Assessment" />
              <AdminAssessmentEdit />
            </>
          }
        />
        <Route
          path="/admin/results"
          element={
            <>
              <PageTitle title="Results" />
              <AdminResultIndex />
            </>
          }
        />
        <Route
          path="/admin/results/create"
          element={
            <>
              <PageTitle title="Create Result" />
              <AdminResultCreate />
            </>
          }
        />
        <Route
          path="/admin/results/:result_id"
          element={
            <>
              <PageTitle title="Result Details" />
              <AdminResultView />
            </>
          }
        />
        <Route
          path="/admin/results/:result_id/edit"
          element={
            <>
              <PageTitle title="Edit Result" />
              <AdminResultEdit />
            </>
          }
        />
        <Route
          path="/admin/matrices"
          element={
            <>
              <PageTitle title="Matrices" />
              <AdminMatrixIndex />
            </>
          }
        />
        <Route
          path="/admin/matrices/create"
          element={
            <>
              <PageTitle title="Create Matrix" />
              <AdminMatrixCreate />
            </>
          }
        />
        <Route
          path="/admin/matrices/:matrix_id"
          element={
            <>
              <PageTitle title="Matrix Details" />
              <AdminMatrixView />
            </>
          }
        />
        <Route
          path="/admin/matrices/:matrix_id/edit"
          element={
            <>
              <PageTitle title="Edit Matrix" />
              <AdminMatrixEdit />
            </>
          }
        />

        {/* Member */}
        <Route
          path="/member"
          element={
            <>
              <PageTitle title="Dashboard" />
              <MemberDashboard />
            </>
          }
        />
        <Route
          path="/member/settings"
          element={
            <>
              <PageTitle title="Account Settings" />
              <MemberSettings />
            </>
          }
        />
        <Route
          path="/member/organizations"
          element={
            <>
              <PageTitle title="Organizations" />
              <MemberOrganizationIndex />
            </>
          }
        />
        <Route
          path="/member/organizations/create"
          element={
            <>
              <PageTitle title="Create Organization" />
              <MemberOrganizationCreate />
            </>
          }
        />
        <Route
          path="/member/organizations/:organization_id"
          element={
            <>
              <PageTitle title="Organization Details" />
              <MemberOrganizationView />
            </>
          }
        />
        <Route
          path="/member/organizations/:organization_id/edit"
          element={
            <>
              <PageTitle title="Edit Organization" />
              <MemberOrganizationEdit />
            </>
          }
        />
        <Route
          path="/member/assessments"
          element={
            <>
              <PageTitle title="Assessments" />
              <MemberAssessmentIndex />
            </>
          }
        />
        <Route
          path="/member/assessments/create"
          element={
            <>
              <PageTitle title="New Assessment" />
              <MemberAssessmentCreate />
            </>
          }
        />
        <Route
          path="/member/assessments/:assessment_id"
          element={
            <>
              <PageTitle title="Assessment Details" />
              <MemberAssessmentView />
            </>
          }
        />
        <Route
          path="/member/assessments/:assessment_id/edit"
          element={
            <>
              <PageTitle title="Edit Assessment" />
              <MemberAssessmentEdit />
            </>
          }
        />
        <Route
          path="/member/assessments/:assessment_id/clone"
          element={
            <>
              <PageTitle title="Clone Assessment" />
              <MemberAssessmentClone />
            </>
          }
        />
        <Route
          path="/member/matrices"
          element={
            <>
              <PageTitle title="Matrices" />
              <MemberMatrixIndex />
            </>
          }
        />
        <Route
          path="/member/matrices/create"
          element={
            <>
              <PageTitle title="Create Matrix" />
              <MemberMatrixCreate />
            </>
          }
        />
        <Route
          path="/member/matrices/:matrix_id"
          element={
            <>
              <PageTitle title="Matrix Details" />
              <MemberMatrixView />
            </>
          }
        />
        <Route
          path="/member/matrices/:matrix_id/edit"
          element={
            <>
              <PageTitle title="Edit Matrix" />
              <MemberMatrixEdit />
            </>
          }
        />
        <Route
          path="/member/results"
          element={
            <>
              <PageTitle title="Results" />
              <MemberResultIndex />
            </>
          }
        />
        <Route
          path="/member/results/:result_id"
          element={
            <>
              <PageTitle title="Result Details" />
              <MemberResultView />
            </>
          }
        />
        
      </Routes>
    </Layout>
  );
}

export default App;
