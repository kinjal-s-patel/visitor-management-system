import * as React from 'react';
import { useState } from 'react';
import styles from './visitorform.module.scss';
import { TextField, Dropdown, IDropdownOption, PrimaryButton } from '@fluentui/react';
import { useNavigate } from 'react-router-dom';

const purposeOptions: IDropdownOption[] = [
  { key: 'business', text: 'Business Meeting' },
  { key: 'personal', text: 'Personal Meeting' },
  { key: 'interview', text: 'Interview' },
  { key: 'maintenance', text: 'Maintenance' },
];

const VisitorFormPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    purposeofvisit: '',
    email: '',
    hostName: '',
    department: '',
    inTime: ''
  });

  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('Submitted data:', formData);
  };

    React.useEffect(() => {
      const style = document.createElement("style");
      style.innerHTML = `
        #SuiteNavWrapper,
        #spSiteHeader,
        #spLeftNav,
        .spAppBar,
        .sp-appBar,
        .sp-appBar-mobile,
        div[data-automation-id="pageCommandBar"],
        div[data-automation-id="pageHeader"],
        div[data-automation-id="pageFooter"] {
          display: none !important;
          height: 0 !important;
          overflow: hidden !important;
        }
  
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          height: 100% !important;
          width: 100% !important;
          overflow: hidden !important;
          background: #fff !important;
        }
      
        #spPageCanvasContent, .CanvasComponent, .CanvasZone, .CanvasSection, .control-zone {
          width: 100vw !important;
          height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          max-width: 100vw !important;
        }
  
        .ms-FocusZone {
          overflow: hidden !important;
        }
      `;
      document.head.appendChild(style);
    }, []);

    
  return (
      <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'auto', backgroundColor: '#fff', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
    <div className={styles.visitorFormPage}>
      {/* Header */}
      <header className={styles.dashboardHeader}>
        <div className={styles.dashboardHeader__left}>
          <h1 className={styles.dashboardHeader__title}>Visitor Management System</h1>
        </div>
        <div className={styles.dashboardHeader__right}>
          <span className={styles.dashboardHeader__userName}>Welcome, John Doe</span>
        </div>
      </header>

      <div className={styles.navButtons}>
  <PrimaryButton text="View Visitor" onClick={() => navigate('/viewvisitor')} />
  <PrimaryButton text="Reports" onClick={() => navigate('/reports')} />
    <PrimaryButton text="Dashboard" onClick={() => navigate('/')} />
</div>

      {/* Main Content */}
      <main className={styles.formContainer}>
        <h2 className={styles.formTitle}>Visitor Registration Form</h2>

        <div className={styles.formWrapper}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e, val) => handleChange('name', val || '')}
            required
          />
          <TextField
            label="Contact Number"
            value={formData.contactNumber}
            onChange={(e, val) => handleChange('contactNumber', val || '')}
            required
          />
          <Dropdown
            label="Purpose of Visit"
            options={purposeOptions}
            selectedKey={formData.purposeofvisit}
            onChange={(e, option) => handleChange('purposeofvisit', option?.key.toString() || '')}
            required
          />
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e, val) => handleChange('email', val || '')}
          />
          <TextField
            label="Host Name"
            value={formData.hostName}
            onChange={(e, val) => handleChange('hostName', val || '')}
            required
          />
          <TextField
            label="Department"
            value={formData.department}
            onChange={(e, val) => handleChange('department', val || '')}
          />
          <TextField
            label="In Time"
            type="time"
            value={formData.inTime}
            onChange={(e, val) => handleChange('inTime', val || '')}
            required
          />
          <div className={styles.buttonGroup}>
  <PrimaryButton text="Submit" onClick={handleSubmit} />
</div>

         
        </div>
      </main>
    </div>
      <footer className={styles.footer}>
          © 2025 Visitor Management System. All rights reserved.
        </footer>
    </div>
  );
};

export default VisitorFormPage;
