import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopbarUserMenu from "../../../components/TopbarUserMenu";
import "../../../css/PetOwnerAppointment.css";
import "../../../css/responsive-tables.css";
import PetOwnerSidebar from "../../../components/PetOwnerSidebar";
import { useSidebar } from "../../../components/useSidebar";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  getAvailableVets,
  getPets,
  getVetAvailableSlots,
  updateAppointment,
} from "../../../api/api";

import bellIcon from "../../../assets/Bell_Icon.png";
import userIcon from "../../../assets/Profile.png";

const PetOwnerAppointment = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { isOpen, toggle, close } = useSidebar();

  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("calendar");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [booking, setBooking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    petId: "",
    vetId: "",
    date: "",
    slot: "",
    reason: "",
    notes: "",
  });

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
      const [apptRes, petRes, vetRes] = await Promise.all([
        getAppointments(),
        getPets(),
        getAvailableVets(),
      ]);
      setAppointments(apptRes.data || []);
      setPets(petRes.data || []);
      const vetList = vetRes.data || [];
      setVets(vetList);
      setForm((prev) => ({
        ...prev,
        petId: prev.petId || petRes.data?.[0]?.id || "",
        vetId: prev.vetId || vetList?.[0]?.id || "",
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = () => {
    setEditing(null);
    setShowModal(true);
    setError("");
    setSlots([]);
    setForm((prev) => ({
      ...prev,
      petId: prev.petId || pets[0]?.id || "",
      vetId: prev.vetId || vets[0]?.id || "",
      date: "",
      slot: "",
      reason: "",
      notes: "",
    }));
  };

  const openEditModal = async (appointment) => {
    const iso = new Date(appointment.scheduledAt).toISOString();
    const date = iso.slice(0, 10);
    setEditing(appointment);
    setShowModal(true);
    setError("");
    setForm({
      petId: appointment.petId,
      vetId: appointment.vetId || "",
      date,
      slot: iso,
      reason: appointment.reason || "",
      notes: appointment.notes || "",
    });

    await fetchSlots(appointment.vetId, date);
  };

  const fetchSlots = async (vetId, date) => {
    if (!vetId || !date) {
      setSlots([]);
      return;
    }
    try {
      const res = await getVetAvailableSlots(vetId, date);
      setSlots(res.data.slots || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch available slots",
      );
      setSlots([]);
    }
  };

  const onFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "vetId" || name === "date") {
      const vetId = name === "vetId" ? value : form.vetId;
      const date = name === "date" ? value : form.date;
      setForm((prev) => ({ ...prev, slot: "" }));
      fetchSlots(vetId, date);
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!form.petId || !form.vetId || !form.slot) {
      setError("Please select pet, veterinarian, and time slot");
      return;
    }

    setBooking(true);
    setError("");
    try {
      if (editing) {
        await updateAppointment(editing.id, {
          vetId: form.vetId,
          scheduledAt: form.slot,
          reason: form.reason,
          notes: form.notes,
        });
      } else {
        await createAppointment({
          petId: form.petId,
          vetId: form.vetId,
          scheduledAt: form.slot,
          reason: form.reason,
          notes: form.notes,
        });
      }
      setShowModal(false);
      setEditing(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create appointment");
    } finally {
      setBooking(false);
    }
  };

  const cancelAppointment = async (appointment) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await deleteAppointment(appointment.id);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const vetName =
      `${a.vet?.firstName || ""} ${a.vet?.lastName || ""}`.trim() ||
      a.vet?.username ||
      "";
    const query = search.toLowerCase();
    return (
      (a.pet?.name || "").toLowerCase().includes(query) ||
      vetName.toLowerCase().includes(query) ||
      (a.status || "").toLowerCase().includes(query)
    );
  });

  const monthStart = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth(),
    1,
  );
  const daysInMonth = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth() + 1,
    0,
  ).getDate();
  const firstWeekday = monthStart.getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthLabel = calendarDate.toLocaleString([], {
    month: "long",
    year: "numeric",
  });

  const shiftMonth = (delta) => {
    setCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );
  };

  return (
    <div className="dashboard-container">
      <PetOwnerSidebar isOpen={isOpen} onClose={close} />

      {/* MAIN CONTENT */}
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
          <h2>Appointments</h2>
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
          <div className="calendar-controls">
            <div className="view-toggle">
              <button
                className={viewMode === "calendar" ? "active" : ""}
                onClick={() => setViewMode("calendar")}
              >
                Calendar View
              </button>
              <button
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
              >
                List View
              </button>
            </div>
            <div className="appointment-actions">
              <input
                type="text"
                className="apt-search"
                placeholder="Search pet, vet, or status"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="add-apt-btn" onClick={openBookingModal}>
                + Book New Appointment
              </button>
            </div>
          </div>

          {loading && (
            <p className="list-placeholder">Loading appointments...</p>
          )}
          {!loading && error && <p className="modal-error">{error}</p>}

          {!loading && viewMode === "calendar" ? (
            <div className="calendar-container">
              <div className="calendar-month-header">
                <h3>{monthLabel}</h3>
                <div className="month-nav">
                  <button onClick={() => shiftMonth(-1)}>&lt; Prev</button>
                  <button onClick={() => shiftMonth(1)}>Next &gt;</button>
                </div>
              </div>
              <div className="calendar-grid">
                {[
                  { full: "Sun", short: "S" },
                  { full: "Mon", short: "M" },
                  { full: "Tue", short: "T" },
                  { full: "Wed", short: "W" },
                  { full: "Thu", short: "T" },
                  { full: "Fri", short: "F" },
                  { full: "Sat", short: "S" },
                ].map((day) => (
                  <div key={day.full} className="weekday-label">
                    <span className="weekday-full">{day.full}</span>
                    <span className="weekday-short" aria-hidden="true">
                      {day.short}
                    </span>
                  </div>
                ))}
                {Array.from({ length: firstWeekday }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="calendar-day empty" />
                ))}
                {days.map((d) => (
                  <div key={d} className="calendar-day">
                    <span className="day-num">{d}</span>
                    <div className="day-events">
                      {filteredAppointments
                        .filter((a) => {
                          const scheduled = new Date(a.scheduledAt);
                          return (
                            scheduled.getFullYear() ===
                              calendarDate.getFullYear() &&
                            scheduled.getMonth() === calendarDate.getMonth() &&
                            scheduled.getDate() === d
                          );
                        })
                        .map((apt) => (
                          <div
                            key={apt.id}
                            className={`event-item ${(apt.status || "").toLowerCase()}`}
                            title={`${apt.pet?.name || "Pet"} - ${apt.status}`}
                          >
                            {new Date(apt.scheduledAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            {apt.pet?.name}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="list-view-container">
              <table className="appointment-table">
                <thead>
                  <tr>
                    <th>Pet</th>
                    <th>Owner</th>
                    <th>Date & Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((a) => (
                    <tr key={a.id}>
                      <td>{a.pet?.name || "-"}</td>
                      <td>
                        {`${a.owner?.firstName || ""} ${a.owner?.lastName || ""}`.trim() ||
                          a.owner?.username ||
                          "-"}
                      </td>
                      <td>{new Date(a.scheduledAt).toLocaleString()}</td>
                      <td>{a.reason || "-"}</td>
                      <td>
                        <span
                          className={`apt-status ${(a.status || "").toLowerCase()}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn-edit icon-btn"
                            onClick={() => openEditModal(a)}
                            title="Reschedule appointment"
                            aria-label="Reschedule appointment"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M4 20h4l10-10-4-4L4 16v4z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 6l4 4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                          <button
                            className="btn-remove icon-btn"
                            onClick={() => cancelAppointment(a)}
                            title="Cancel appointment"
                            aria-label="Cancel appointment"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M5 7h14M9 7V5h6v2m-8 0 1 12h8l1-12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredAppointments.length === 0 && (
            <p className="list-placeholder">
              No appointments found. Start by booking your first visit!
            </p>
          )}
        </section>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "Update Appointment" : "Book Appointment"}</h3>

            <form onSubmit={submitBooking} className="user-modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Pet</label>
                  <select
                    name="petId"
                    value={form.petId}
                    onChange={onFieldChange}
                    required
                  >
                    {pets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Veterinarian</label>
                  <select
                    name="vetId"
                    value={form.vetId}
                    onChange={onFieldChange}
                    required
                  >
                    {vets.map((v) => (
                      <option key={v.id} value={v.id}>
                        {`${v.firstName || ""} ${v.lastName || ""}`.trim() ||
                          v.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={onFieldChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Available Time Slot</label>
                <select
                  name="slot"
                  value={form.slot}
                  onChange={onFieldChange}
                  required
                >
                  <option value="">Select a slot</option>
                  {slots.map((s) => (
                    <option key={s.startsAt} value={s.startsAt}>
                      {new Date(s.startsAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  name="reason"
                  value={form.reason}
                  onChange={onFieldChange}
                  placeholder="Checkup, follow-up, vaccination"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={onFieldChange}
                  rows={3}
                />
              </div>

              {error && <p className="modal-error">{error}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                  }}
                  disabled={booking}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={booking}>
                  {booking
                    ? editing
                      ? "Updating..."
                      : "Booking..."
                    : editing
                      ? "Update Appointment"
                      : "Book Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetOwnerAppointment;
