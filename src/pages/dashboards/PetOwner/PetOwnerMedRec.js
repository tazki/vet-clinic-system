import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopbarUserMenu from "../../../components/TopbarUserMenu";
import "../../../css/PetOwnerMedRec.css";
import PetOwnerSidebar from "../../../components/PetOwnerSidebar";
import { useSidebar } from "../../../components/useSidebar";
import { getMedicalRecords } from "../../../api/api";

import bellIcon from "../../../assets/Bell_Icon.png";
import userIcon from "../../../assets/Profile.png";

const PetOwnerMedRec = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { isOpen, toggle, close } = useSidebar();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "pet_owner") {
      navigate("/login");
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const recordRes = await getMedicalRecords();
      setRecords(recordRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load medical records");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <PetOwnerSidebar isOpen={isOpen} onClose={close} />

      <main className="main-area">
        <header className="top-bar">
          <button
            className="hamburger-btn"
            onClick={toggle}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
          <h2>Medical Records</h2>
          <div className="top-bar-right">
            <button
              className="notif-btn"
              onClick={() => navigate("/pet-owner-notifications")}
            >
              <img src={bellIcon} alt="Notifications" />
            </button>
            <TopbarUserMenu
              avatarSrc={userIcon}
              avatarAlt="User"
              profilePath="/pet-owner-profile"
            />
          </div>
        </header>

        <section className="content-body">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ fontFamily: "Poppins", fontWeight: "600" }}>
              Health History
            </h3>
            <span
              style={{
                color: "#5f6876",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              Records are managed by veterinarians
            </span>
          </div>

          {loading && <p>Loading records...</p>}
          {error && (
            <p style={{ color: "#c62828", marginBottom: "10px" }}>{error}</p>
          )}

          {!loading && records.length === 0 ? (
            <div
              className="dashboard-welcome-card"
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "15px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              }}
            >
              <p style={{ color: "#555" }}>No medical records found yet.</p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {records.map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#255065" }}>
                        {r.pet?.name}
                      </strong>
                      <div style={{ color: "#666", fontSize: "0.85rem" }}>
                        {r.diagnosis}
                      </div>
                      <div style={{ color: "#888", fontSize: "0.8rem" }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "5px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        background:
                          r.status === "Finalized" ? "#dcfce7" : "#fef9c3",
                        color: r.status === "Finalized" ? "#166534" : "#854d0e",
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PetOwnerMedRec;
