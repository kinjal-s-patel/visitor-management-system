import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './visitorform.module.scss';
import {
  TextField,
  Dropdown,
  IDropdownOption,
  PrimaryButton
} from '@fluentui/react';
import { useNavigate } from 'react-router-dom';
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

interface IVisitorFormPageProps {
  context: any;
}

const purposeOptions: IDropdownOption[] = [
  { key: 'business', text: 'Business Meeting' },
  { key: 'personal', text: 'Personal Meeting' },
  { key: 'interview', text: 'Interview' },
  { key: 'maintenance', text: 'Maintenance' }
];

const departmentOptions: IDropdownOption[] = [
  { key: 'IT', text: 'IT' },
  { key: 'Recruitment', text: 'Recruitment' },
  { key: 'Management', text: 'Management' }
];

const VisitorFormPage: React.FC<IVisitorFormPageProps> = ({ context }) => {
  const sp: SPFI = spfi().using(SPFx(context));
  const navigate = useNavigate();

  const [hostOptions, setHostOptions] = useState<IDropdownOption[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    number: '',
    purposeofvisit: '',
    email: '',
    hostName: '',
    hostId: null as number | null,
    Department: '',
    In_x002d_time: ''
  });
  

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadHosts = async () => {
    try {
      const items = await sp.web.lists
        .getByTitle("host")
        .items
        .select("Id", "host/Id", "host/Title", "host/EMail")
        .expand("host")();

      const options = items
        .filter(item => item.host) // Only if person value exists
        .map(item => ({
          key: item.host.Id,
          text: item.host.Title,
          data: item.host
        }));

      setHostOptions(options);
    } catch (error) {
      console.error("Error loading hosts:", error);
    }
  };

  const handleSubmit = async () => {
  if (!formData.hostId) {
    alert("Please select a valid host.");
    return;
  }

  try {
    await sp.web.lists.getByTitle("visitor-list").items.add({
      Title: formData.name,
      name: formData.name,
      number: formData.number,
      purposeofvisit: formData.purposeofvisit,
      email: formData.email,
      Department: formData.Department,
      In_x002d_time: new Date(`1970-01-01T${formData.In_x002d_time}:00Z`).toISOString(), // ⬅️ FIXED
      status: 'Pending',
      visitdate: new Date().toISOString(),
      hostnameId: formData.hostId // 👈 Make sure your 'hostname' field is a Person field
    });

    alert('Visitor registered successfully');
    navigate('/');
  } catch (error) {
    console.error("Error saving visitor:", error);
    alert('Error submitting form.');
  }
};

  useEffect(() => {
    loadHosts();

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

        {/* Navigation */}
        <div className={styles.navButtons}>
          <PrimaryButton text="View Visitor" onClick={() => navigate('/visitorlogs')} />
          <PrimaryButton text="Reports" onClick={() => navigate('/reports')} />
          <PrimaryButton text="Dashboard" onClick={() => navigate('/')} />
        </div>

        {/* Main Content */}
        <main className={styles.formContainer}>
           <h2 className={styles.heading}>Visitor Form</h2>
    <p className={styles.subheading}>Please fill in the visitor details below</p>
          <div className={styles.formWrapper}>
            <TextField
  label="Name"
  placeholder="Enter full name as on ID"
  value={formData.name}
  onChange={(e, val) => handleChange('name', val || '')}
  required
/>

<TextField
  label="Contact Number"
  placeholder="Provide a valid phone number (10 digits)"
  value={formData.number}
  onChange={(e, val) => handleChange('number', val || '')}
  required
/>

<TextField
  label="Email"
  type="email"
  placeholder="Optional, for follow-up communication"
  value={formData.email}
  onChange={(e, val) => handleChange('email', val || '')}
/>

<Dropdown
  label="Purpose of Visit"
  options={purposeOptions}
  selectedKey={formData.purposeofvisit}
  onChange={(e, option) => handleChange('purposeofvisit', option?.key.toString() || '')}
  required
  placeholder="Choose the reason for visit"
/>

<Dropdown
  label="Host Name"
  placeholder="Select the person  meeting with"
  options={hostOptions}
  selectedKey={formData.hostId}
  onChange={(e, option) => {
    handleChange('hostName', option?.text || '');
    setFormData(prev => ({
      ...prev,
      hostId: Number(option?.key),
    }));
  }}
  required
/>

<Dropdown
  label="Department"
  placeholder="Department your host belongs to"
  options={departmentOptions}
  selectedKey={formData.Department}
  onChange={(e, option) => handleChange('Department', option?.key.toString() || '')}
  required
/>

<TextField
  label="In Time"
  type="time"
  value={formData.In_x002d_time}
  onChange={(e, val) => handleChange('In_x002d_time', val || '')}
  required
  placeholder="Select expected time of entry"
/>


            <div className={styles.buttonGroup}>
              <PrimaryButton text="Submit" onClick={handleSubmit} />
            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          © 2025 Visitor Management System. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default VisitorFormPage;
