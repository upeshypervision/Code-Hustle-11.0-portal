import { useState } from 'react';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/admin/AdminSidebar';
import RoundManagement from '../components/admin/RoundManagement';
import ProblemStatements from '../components/admin/ProblemStatements';
import AddParticipant from '../components/admin/AddParticipant';
import EditTeams from '../components/admin/EditTeams';
import ViewSubmissions from '../components/admin/ViewSubmissions';

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('rounds');

  const renderContent = () => {
    switch (activeSection) {
      case 'rounds':
        return <RoundManagement />;
      case 'problem-statements':
        return <ProblemStatements />;
      case 'add-participant':
        return <AddParticipant />;
      case 'edit-teams':
        return <EditTeams />;
      case 'submissions':
        return <ViewSubmissions />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar
        userInfo={
          <>
            Role: <strong>Admin</strong> · Hypervision
          </>
        }
        isAdmin={true}
      />

      <div className="admin-layout">
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <main className="admin-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
