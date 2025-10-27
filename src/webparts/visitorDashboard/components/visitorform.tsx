import * as React from "react";
import { useState, useEffect, useRef } from "react";
import styles from "./visitorform.module.scss";
import {
  TextField,
  Dropdown,
  IDropdownOption,
  PrimaryButton,
} from "@fluentui/react";
import { useNavigate } from "react-router-dom";
import { spfi, SPFI, SPFx } from "@pnp/sp";

interface IVisitorFormPageProps {
  context: any;
}

const purposeOptions: IDropdownOption[] = [
  { key: "business", text: "Business Meeting" },
  { key: "personal", text: "Personal Meeting" },
  { key: "interview", text: "Interview" },
  { key: "maintenance", text: "Maintenance" },
];

const departmentOptions: IDropdownOption[] = [
  { key: "IT", text: "IT" },
  { key: "Recruitment", text: "Recruitment" },
  { key: "Management", text: "Management" },
];

// const hostOptions: IDropdownOption[] = [
//   { key: 1, text: "John Smith" },
//   { key: 2, text: "Priya Patel" },
//   { key: 3, text: "Amit Sharma" },
//   { key: 4, text: "Sarah Johnson" },
//   { key: 5, text: "David Lee" },
// ];

const VisitorFormPage: React.FC<IVisitorFormPageProps> = ({ context }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [hostOptions, setHostOptions] = useState<IDropdownOption[]>([]);
  const sp: SPFI = spfi().using(SPFx(context));


  const [formData, setFormData] = useState({
    name: "",
    number: "",
    purposeofvisit: "",
    email: "",
    hostId: null as number | null,
    Department: "",
    In_x002d_time: "",
    visitdate: "",
  });

  const loadHostOptions = async () => {
  try {
    const items = await sp.web.lists
      .getByTitle("host") // 👈 your list name in SharePoint
      .items.select("Id", "host")(); // fetching Id and Title columns

    const options = items.map((item) => ({
      key: item.Id,
      text: item.Title,
    }));

    setHostOptions(options);
  } catch (error) {
    console.error("Error loading host names:", error);
  }
};


  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please allow permissions.");
    }
  };

  // Capture Photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        const imageData = canvasRef.current.toDataURL("image/png");
        setPhoto(imageData);
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 🟢 Mock Submit Function (no SharePoint call)
  async function handleSubmit() {
    try {
      console.log("Mock Visitor Data Submitted:", formData);
      alert("Visitor added successfully.");
      navigate("/visitorlogs");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form.");
    }
  }

  useEffect(() => {
    startCamera();
    loadHostOptions();

    // Auto-fill date and time
    const now = new Date();
    const currentTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const currentDate = now.toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      In_x002d_time: currentTime,
      visitdate: currentDate,
    }));

    // Hide SharePoint chrome for full-page display
    const style = document.createElement("style");
    style.innerHTML = `
      #SuiteNavWrapper, #spSiteHeader, #spLeftNav, .spAppBar,
      .sp-appBar, .sp-appBar-mobile, div[data-automation-id="pageCommandBar"],
      div[data-automation-id="pageHeader"], div[data-automation-id="pageFooter"] {
        display: none !important;
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
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#fff",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "auto",
        zIndex: 9999,
      }}
    >
      <div className={styles.visitorFormPage}>
        {/* Header */}
        <header className={styles.dashboardHeader}>
          <div className={styles.dashboardHeader__left}>
            <h1 className={styles.dashboardHeader__title}>
              Visitor Management System
            </h1>
          </div>
          <div className={styles.dashboardHeader__right}>
            <span className={styles.dashboardHeader__userName}>
              Welcome, {context.pageContext.user.displayName}
            </span>
          </div>
        </header>

        {/* Navigation */}
        <div className={styles.navButtons}>
          <PrimaryButton text="View Visitor" onClick={() => navigate("/visitorlogs")} />
          <PrimaryButton text="Reports" onClick={() => navigate("/reports")} />
          <PrimaryButton text="Dashboard" onClick={() => navigate("/")} />
        </div>

        {/* Main Content */}
        <main className={styles.formContainer}>
          <h2 className={styles.heading}>Visitor Form</h2>
          <p className={styles.subheading}>
            Please fill in the visitor details below
          </p>

          <div className={styles.formWrapper}>
            <TextField
              label="Name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e, val) => handleChange("name", val || "")}
              required
            />

            <TextField
              label="Contact Number"
              placeholder="Phone number"
              value={formData.number}
              onChange={(e, val) => handleChange("number", val || "")}
              required
            />

            <TextField
              label="Email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e, val) => handleChange("email", val || "")}
            />

            <Dropdown
              label="Purpose of Visit"
              placeholder="Purpose of visit"
              options={purposeOptions}
              selectedKey={formData.purposeofvisit}
              onChange={(e, option) =>
                handleChange("purposeofvisit", option?.key.toString() || "")
              }
              required
            />

            <Dropdown
              label="Host Name"
              placeholder="Select host"
              options={hostOptions}
              selectedKey={formData.hostId}
              onChange={(e, option) =>
                setFormData((prev) => ({ ...prev, hostId: Number(option?.key) }))
              }
              required
            />

            <Dropdown
              label="Department"
              placeholder="Select department"
              options={departmentOptions}
              selectedKey={formData.Department}
              onChange={(e, option) =>
                handleChange("Department", option?.key.toString() || "")
              }
              required
            />

            <TextField
              label="Visit Date"
              type="date"
              value={formData.visitdate}
              onChange={(e, val) => handleChange("visitdate", val || "")}
              required
            />

            <TextField
              label="In Time"
              type="time"
              value={formData.In_x002d_time}
              onChange={(e, val) => handleChange("In_x002d_time", val || "")}
              required
            />

            <h3>Capture Live Photo</h3>
            <video ref={videoRef} width="320" height="240" autoPlay />
            <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }} />

            <div>
              <PrimaryButton text="Capture Photo" onClick={capturePhoto} />
            </div>

            {photo && (
              <div>
                <h4>Preview:</h4>
                <img src={photo} alt="Captured" width="320" height="240" />
              </div>
            )}

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
