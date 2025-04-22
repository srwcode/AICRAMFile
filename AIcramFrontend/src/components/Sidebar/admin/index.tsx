import { useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Grid3x3, Building, FileChartColumn, TextSearch, CloudUpload, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between lg:justify-center gap-2 px-6 py-5.5 lg:py-6.5">

        <Link to="/" className="block" style={{ width: 'auto', height: 'auto' }}>
          <div className="font-mono tracking-tight flex items-center scale-75 origin-left lg:origin-center">
            <span className="flex items-center gap-2 font-extrabold text-white text-4xl">AI<span className="text-gray-400"> | </span>CR</span>
            <ShieldCheck strokeWidth={3} size={34} className="text-white mb-0.5 ml-0.5"/>
            <span className="font-extrabold text-white text-4xl">M</span>
          </div>
        </Link>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.8995 4.10051C16.2658 3.7342 16.2658 3.14004 15.8995 2.77373C15.5332 2.40741 14.939 2.40741 14.5727 2.77373L10 7.34647L5.42726 2.77373C5.06095 2.40741 4.46679 2.40741 4.10048 2.77373C3.73416 3.14004 3.73416 3.7342 4.10048 4.10051L8.67322 8.67326L4.10048 13.246C3.73416 13.6123 3.73416 14.2064 4.10048 14.5727C4.46679 14.939 5.06095 14.939 5.42726 14.5727L10 9.99997L14.5727 14.5727C14.939 14.939 15.5332 14.939 15.8995 14.5727C16.2658 14.2064 16.2658 13.6123 15.8995 13.246L11.3267 8.67326L15.8995 4.10051Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div>
            <ul className="mb-6 flex flex-col gap-3">
              <li>
                <NavLink
                  to="/admin"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark ${
                    pathname.includes('admin') && !pathname.startsWith('/admin/') &&
                    'bg-graydark'
                  }`}
                >
                  <LayoutDashboard  />
                  Dashboard
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/users"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark ${
                    pathname.includes('admin/users') && 'bg-graydark'
                  }`}
                >
                  <Users  />
                  Users
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/assessments"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark ${
                    pathname.includes('admin/assessments') && 'bg-graydark'
                  }`}
                >
                  <TextSearch  />
                  Assessments
                </NavLink>
              </li>
              
              <li>
                <NavLink
                  to="/admin/results"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark ${
                    pathname.includes('admin/results') &&
                    'bg-graydark'
                  }`}
                >
                  <FileChartColumn  />
                  Results
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/organizations"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark ${
                    pathname.includes('admin/organizations') &&
                    'bg-graydark'
                  }`}
                >
                  <Building  />
                  Organizations
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/matrices"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark ${
                    pathname.includes('admin/matrices') &&
                    'bg-graydark'
                  }`}
                >
                  <Grid3x3  />
                  Matrices
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/files"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark ${
                    pathname.includes('admin/files') &&
                    'bg-graydark'
                  }`}
                >
                  <CloudUpload  />
                  Files
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
