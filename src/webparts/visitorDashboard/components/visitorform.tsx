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

const VisitorFormPage: React.FC<IVisitorFormPageProps> = ({ context }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [hostOptions, setHostOptions] = useState<IDropdownOption[]>([]);
  // const [manualHost, setManualHost] = useState<string>(""); 
  // const [isManualHost, setIsManualHost] = useState<boolean>(false);

  const sp: SPFI = spfi().using(SPFx(context));

  const [formData, setFormData] = useState({
    name: "",
    number: "",
    purposeofvisit: "",
    email: "",
    host: "", // ✅ plain text field
    hostId: "" as string | undefined,  // 👈 allow undefined
    Department: "",
    In_x002d_time: "",
    visitdate: "",
  });

// ✅ Load hosts from "host" list (Person field)
const loadHostOptions = async () => {
  try {
    // Fetch all items from the "email" list
    const items = await sp.web.lists
      .getByTitle("host")
      .items.select("Id", "Title", "email")(); // 👈 replace "Email" if your column name is different

    console.log("Raw email list items:", items);

    // Map to dropdown options
    const options = items.map((item) => ({
      key: item.Id.toString(),              // 🔹 always a string
      text: item.email || "Unknown Host",   // 🔹 or replace Title with your column name if different
    }));

    setHostOptions(options);
    console.log("✅ Loaded host emails:", options);
  } catch (error) {
    console.error("❌ Error loading host emails:", error);
  }
};

  // ✅ Start Camera
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

  // ✅ Capture Photo
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

  // ✅ Submit Form
  const handleSubmit = async () => {
  try {
    // const hostValue = isManualHost ? manualHost : formData.host;

    await sp.web.lists.getByTitle("visitor-list").items.add({
      name: formData.name,
      number: formData.number,
      email: formData.email,
      purposeofvisit: formData.purposeofvisit,
      Department: formData.Department,
      visitdate: formData.visitdate,
      In_x002d_time: formData.In_x002d_time,
    host: formData.host,

        status: "pending", // ✅ Automatically set status to Pending
    });

    alert("Visitor added successfully!");
    navigate("/visitorlogs");
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Error submitting visitor record.");
  }
};


  // ✅ Initial Load
  useEffect(() => {
    startCamera();
    loadHostOptions();

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

        {/* Main Form */}
        <main className={styles.formContainer}>
          <h2 className={styles.heading}>Visitor Form</h2>
          <p className={styles.subheading}>
            Please fill in the visitor details below
          </p>

          <div className={styles.formWrapper}>
            <TextField
              label="Name"
               placeholder="Enter visitor name"
              value={formData.name}
              onChange={(e, val) => handleChange("name", val || "")}
              required
            />

            <TextField
              label="Contact Number"
              placeholder="Enter contact number"
              value={formData.number}
              onChange={(e, val) => handleChange("number", val || "")}
              required
            />

            <TextField
              label="Email"
               placeholder="Enter visitor email address"
              type="email"
              value={formData.email}
              onChange={(e, val) => handleChange("email", val || "")}
              required
            />

            <Dropdown
              label="Purpose of Visit"
                placeholder="Select purpose of visit"
              options={purposeOptions}
              selectedKey={formData.purposeofvisit}
              onChange={(e, option) =>
                handleChange("purposeofvisit", option?.key.toString() || "")
              }
              required
            />

            
    <Dropdown
  label="Host Email"
  placeholder="Select host"
  options={hostOptions}
  selectedKey={formData.hostId}
  onChange={(e, option) =>
    setFormData((prev) => ({
      ...prev,
      hostId: option?.key.toString() || "",
      host: option?.text || "",
    }))
  }
  required
/>


            {/* ✅ Host Dropdown */}
{/* <Dropdown
  label="Host Email"
  placeholder="Select or add host"
  options={[...hostOptions, { key: "add_new", text: "➕ Add host manually" }]}
  selectedKey={isManualHost ? "add_new" : formData.hostId} // ✅ must match option.key
  onChange={(e, option) => {
    if (option?.key === "add_new") {
      // User wants to add new host manually
      setIsManualHost(true);
      setManualHost("");
      setFormData((prev) => ({
        ...prev,
        host: "",
        hostId: "",
      }));
    } else {
      // User selected from list
      setIsManualHost(false);
      setManualHost("");
      setFormData((prev) => ({
        ...prev,
        host: option?.text || "",
        hostId: option?.key?.toString() || "", // ✅ always string
      }));
    }
  }}
  required
/> */}
{/* 
{isManualHost && (
   <TextField label="Enter Host Email"
    placeholder="Type host email" value={manualHost}
     onChange={(e, val) => setManualHost(val || "")}
      required /> 
      )} */}

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

            <PrimaryButton text="Capture Photo" onClick={capturePhoto} />

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
