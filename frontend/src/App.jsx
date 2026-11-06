
import { useEffect, useState } from "react";
import API from "./api";
import "./App.css";

function App() {
  // MEMBER STATES
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // TRAINER STATES
  const [trainers, setTrainers] = useState([]);
  const [trainersLoading, setTrainersLoading] = useState(true);
  const [showTrainerForm, setShowTrainerForm] = useState(false);
  const [editingTrainerId, setEditingTrainerId] = useState(null);


  // WORKOUT STATES
  const [workouts, setWorkouts] = useState([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(true);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [workoutSearch, setWorkoutSearch] = useState("");
  const [workoutStatusFilter, setWorkoutStatusFilter] = useState("All");
  const [workoutForm, setWorkoutForm] = useState({
    member: "",
    trainer: "",
    workoutName: "",
    category: "General Fitness",
    exercise: "",
    sets: 3,
    reps: 12,
    weight: 0,
    duration: 30,
    workoutDate: new Date().toISOString().slice(0, 10),
    notes: "",
    status: "Scheduled",
  });

  // NAVIGATION
  const [activePage, setActivePage] = useState("dashboard");

  // MEMBER SEARCH AND FILTERS
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // TRAINER SEARCH AND FILTERS
  const [trainerSearch, setTrainerSearch] = useState("");
  const [trainerStatusFilter, setTrainerStatusFilter] = useState("All");

  // MEMBER FORM
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    membership: "Monthly",
  });

  // TRAINER FORM
  const [trainerForm, setTrainerForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    specialization: "",
    experience: "",
    salary: "",
    status: "Active",
  });

  // RESET MEMBER FORM
  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      age: "",
      membership: "Monthly",
    });
    setEditingId(null);
  };

  // RESET TRAINER FORM
  const resetTrainerForm = () => {
    setTrainerForm({
      name: "",
      email: "",
      phone: "",
      gender: "Male",
      specialization: "",
      experience: "",
      salary: "",
      status: "Active",
    });
    setEditingTrainerId(null);
  };

  // FETCH MEMBERS
  const fetchMembers = async () => {
    try {
      const response = await API.get("/members");
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  // FETCH TRAINERS
  const fetchTrainers = async () => {
    try {
      const response = await API.get("/trainers");
      setTrainers(response.data);
    } catch (error) {
      console.error("Error fetching trainers:", error);
    } finally {
      setTrainersLoading(false);
    }
  };

  // LOAD DATA
  useEffect(() => {
    fetchMembers();
    fetchTrainers();
    fetchWorkouts();
  }, []);

  // FILTER MEMBERS
  const filteredMembers = members.filter((member) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      member.name?.toLowerCase().includes(search) ||
      member.email?.toLowerCase().includes(search) ||
      member.phone?.toString().includes(search);

    const matchesPlan =
      planFilter === "All" ||
      member.membership === planFilter;

    const memberStatus = member.status || "Active";

    const matchesStatus =
      statusFilter === "All" ||
      memberStatus === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  // FILTER TRAINERS
  const filteredTrainers = trainers.filter((trainer) => {
    const search = trainerSearch.toLowerCase();

    const matchesSearch =
      trainer.name?.toLowerCase().includes(search) ||
      trainer.email?.toLowerCase().includes(search) ||
      trainer.phone?.toString().includes(search) ||
      trainer.specialization?.toLowerCase().includes(search);

    const matchesStatus =
      trainerStatusFilter === "All" ||
      trainer.status === trainerStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // ADD OR UPDATE MEMBER
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let memberData = {
        ...form,
        age: Number(form.age),
      };

      if (editingId) {
        await API.put(`/members/${editingId}`, memberData);
        alert("Member updated successfully!");
      } else {
        const startDate = new Date();
        const endDate = new Date(startDate);

        const duration = {
          Monthly: 1,
          Quarterly: 3,
          Yearly: 12,
        };

        endDate.setMonth(
          endDate.getMonth() + duration[form.membership]
        );

        memberData = {
          ...memberData,
          startDate,
          endDate,
        };

        await API.post("/members", memberData);
        alert("Member added successfully!");
      }

      resetForm();
      setShowForm(false);
      await fetchMembers();
    } catch (error) {
      console.error("Save error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to save member"
      );
    }
  };

  // EDIT MEMBER
  const handleEdit = (member) => {
    setEditingId(member._id);

    setForm({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      age: member.age || "",
      membership: member.membership || "Monthly",
    });

    setSelectedMember(null);
    setShowForm(true);
  };

  // DELETE MEMBER
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this member?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/members/${id}`);
      alert("Member deleted successfully!");

      if (selectedMember?._id === id) {
        setSelectedMember(null);
      }

      await fetchMembers();
    } catch (error) {
      console.error("Delete error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to delete member"
      );
    }
  };

  // ADD OR UPDATE TRAINER
  const handleTrainerSubmit = async (e) => {
    e.preventDefault();

    try {
      const trainerData = {
        ...trainerForm,
        experience: Number(trainerForm.experience),
        salary: Number(trainerForm.salary),
      };

      if (editingTrainerId) {
        await API.put(
          `/trainers/${editingTrainerId}`,
          trainerData
        );
        alert("Trainer updated successfully!");
      } else {
        await API.post("/trainers", trainerData);
        alert("Trainer registered successfully!");
      }

      resetTrainerForm();
      setShowTrainerForm(false);
      await fetchTrainers();
    } catch (error) {
      console.error("Trainer save error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to save trainer"
      );
    }
  };

  // EDIT TRAINER
  const handleEditTrainer = (trainer) => {
    setEditingTrainerId(trainer._id);

    setTrainerForm({
      name: trainer.name || "",
      email: trainer.email || "",
      phone: trainer.phone || "",
      gender: trainer.gender || "Male",
      specialization: trainer.specialization || "",
      experience: trainer.experience ?? 0,
      salary: trainer.salary ?? 0,
      status: trainer.status || "Active",
    });

    setShowTrainerForm(true);
  };

  // DELETE TRAINER
  const handleDeleteTrainer = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trainer?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/trainers/${id}`);
      alert("Trainer deleted successfully!");
      await fetchTrainers();
    } catch (error) {
      console.error("Trainer delete error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to delete trainer"
      );
    }
  };


  // FETCH WORKOUTS
  const fetchWorkouts = async () => {
    try {
      setWorkoutsLoading(true);
      const response = await API.get("/workouts");
      setWorkouts(response.data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      alert(error.response?.data?.message || "Unable to load workouts.");
    } finally {
      setWorkoutsLoading(false);
    }
  };

  // RESET WORKOUT FORM
  const resetWorkoutForm = () => {
    setWorkoutForm({
      member: "",
      trainer: "",
      workoutName: "",
      category: "General Fitness",
      exercise: "",
      sets: 3,
      reps: 12,
      weight: 0,
      duration: 30,
      workoutDate: new Date().toISOString().slice(0, 10),
      notes: "",
      status: "Scheduled",
    });
    setEditingWorkoutId(null);
  };

  // ADD OR UPDATE WORKOUT
  const handleWorkoutSubmit = async (e) => {
    e.preventDefault();
    try {
      const workoutData = {
        ...workoutForm,
        member: workoutForm.member,
        trainer: workoutForm.trainer || null,
        sets: Number(workoutForm.sets),
        reps: Number(workoutForm.reps),
        weight: Number(workoutForm.weight),
        duration: Number(workoutForm.duration),
        workoutDate: new Date(workoutForm.workoutDate),
      };

      if (editingWorkoutId) {
        await API.put(`/workouts/${editingWorkoutId}`, workoutData);
        alert("Workout updated successfully!");
      } else {
        await API.post("/workouts", workoutData);
        alert("Workout created successfully!");
      }

      setShowWorkoutForm(false);
      resetWorkoutForm();
      await fetchWorkouts();
    } catch (error) {
      console.error("Workout save error:", error);
      alert(error.response?.data?.message || "Unable to save workout.");
    }
  };

  // EDIT WORKOUT
  const handleEditWorkout = (workout) => {
    setEditingWorkoutId(workout._id);
    setWorkoutForm({
      member: workout.member?._id || workout.member || "",
      trainer: workout.trainer?._id || workout.trainer || "",
      workoutName: workout.workoutName || "",
      category: workout.category || "General Fitness",
      exercise: workout.exercise || "",
      sets: workout.sets ?? 3,
      reps: workout.reps ?? 12,
      weight: workout.weight ?? 0,
      duration: workout.duration ?? 30,
      workoutDate: workout.workoutDate
        ? new Date(workout.workoutDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      notes: workout.notes || "",
      status: workout.status || "Scheduled",
    });
    setShowWorkoutForm(true);
  };

  // DELETE WORKOUT
  const handleDeleteWorkout = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workout?")) return;
    try {
      await API.delete(`/workouts/${id}`);
      alert("Workout deleted successfully!");
      await fetchWorkouts();
    } catch (error) {
      console.error("Workout delete error:", error);
      alert(error.response?.data?.message || "Unable to delete workout.");
    }
  };

  const filteredWorkouts = workouts.filter((workout) => {
    const search = workoutSearch.toLowerCase();
    const memberName = typeof workout.member === "object"
      ? workout.member?.name || ""
      : "";
    const trainerName = typeof workout.trainer === "object"
      ? workout.trainer?.name || ""
      : "";
    const matchesSearch =
      workout.workoutName?.toLowerCase().includes(search) ||
      workout.exercise?.toLowerCase().includes(search) ||
      memberName.toLowerCase().includes(search) ||
      trainerName.toLowerCase().includes(search);
    const matchesStatus =
      workoutStatusFilter === "All" || workout.status === workoutStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // NAVIGATION ITEMS
  const navigationItems = [
    { id: "dashboard", label: "▦ Dashboard" },
    { id: "members", label: "👥 Members" },
    { id: "trainers", label: "🏋 Trainers" },
    { id: "plans", label: "📋 Membership Plans" },
    { id: "workouts", label: "💪 Workout Tracking" },
    { id: "settings", label: "⚙ Settings" },
  ];

  const pageTitles = {
    dashboard: "Dashboard",
    members: "Members",
    trainers: "Trainers",
    plans: "Membership Plans",
    workouts: "Workout Tracking",
    settings: "Settings",
  };

  const pageDescriptions = {
    dashboard: "Welcome back! Here's your gym overview.",
    members: "Manage your registered gym members.",
    trainers: "Manage your gym trainers.",
    plans: "View and manage membership plans.",
    workouts: "Track gym members' workout activities.",
    settings: "Manage your gym application settings.",
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>⚡ FIT ON TRACK</h2>

        <nav>
          {navigationItems.map((item) => (
            <p
              key={item.id}
              className={
                activePage === item.id ? "active" : ""
              }
              onClick={() => {
                setActivePage(item.id);
                setSelectedMember(null);
                setShowForm(false);
                setShowTrainerForm(false);
                setShowWorkoutForm(false);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActivePage(item.id);
                  setSelectedMember(null);
                  setShowForm(false);
                  setShowTrainerForm(false);
                  setShowWorkoutForm(false);
                }
              }}
            >
              {item.label}
            </p>
          ))}
        </nav>

        <div className="sidebar-bottom">
          Gym Management System
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">

        {/* HEADER */}
        <header>
          <div>
            <h1>{pageTitles[activePage]}</h1>
            <p>{pageDescriptions[activePage]}</p>
          </div>

          {activePage === "members" && (
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              + Add Member
            </button>
          )}

          {activePage === "trainers" && (
            <button
              type="button"
              onClick={() => {
                resetTrainerForm();
                setShowTrainerForm(true);
              }}
            >
              + Add Trainer
            </button>
          )}
          {activePage === "workouts" && (
            <button
              type="button"
              onClick={() => {
                resetWorkoutForm();
                setShowWorkoutForm(true);
              }}
              disabled={members.length === 0}
              title={members.length === 0 ? "Add a member before creating a workout" : ""}
            >
              + Add Workout
            </button>
          )}
        </header>

        {/* DASHBOARD */}
        {activePage === "dashboard" && (
          <section className="stats">

            <div className="stat-card">
              <span>Total Members</span>
              <h2>{members.length}</h2>
              <small>Registered members</small>
            </div>

            <div className="stat-card">
              <span>Active Members</span>
              <h2>
                {
                  members.filter(
                    (m) => (m.status || "Active") === "Active"
                  ).length
                }
              </h2>
              <small>Currently active</small>
            </div>

            <div className="stat-card">
              <span>Trainers</span>
              <h2>{trainers.length}</h2>
              <small>Registered trainers</small>
            </div>

            <div className="stat-card">
              <span>Membership Plans</span>
              <h2>3</h2>
              <small>Available plans</small>
            </div>

          </section>
        )}

        {/* MEMBERS PAGE */}
        {activePage === "members" && (
          <section className="members-section">

            <div className="section-heading">
              <div>
                <h2>All Members</h2>
                <p>Manage your registered gym members.</p>
              </div>
            </div>

            {/* MEMBER SEARCH AND FILTERS */}
            <div className="member-filters">
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="All">All Membership Plans</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            {/* MEMBERS TABLE */}
            {loading ? (
              <p>Loading members...</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Age</th>
                      <th>Membership</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan="7">
                          {members.length === 0
                            ? "No members found. Add your first member!"
                            : "No members match your search or filters."}
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => (
                        <tr
                          key={member._id}
                          className="clickable-member-row"
                          onClick={() => setSelectedMember(member)}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" ||
                              e.key === " "
                            ) {
                              e.preventDefault();
                              setSelectedMember(member);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`View ${member.name}'s profile`}
                        >
                          <td>{member.name}</td>
                          <td>{member.email}</td>
                          <td>{member.phone}</td>
                          <td>{member.age}</td>
                          <td>
                            {member.membership || member.plan || "Not available"}
                          </td>

                          <td>
                            <span className="status">
                              {member.status || "Active"}
                            </span>
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button
                                type="button"
                                className="view-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMember(member);
                                }}
                              >
                                View
                              </button>

                              <button
                                type="button"
                                className="edit-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(member);
                                }}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(member._id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* TRAINERS PAGE */}
        {activePage === "trainers" && (
          <section className="members-section">

            <div className="section-heading">
              <div>
                <h2>All Trainers</h2>
                <p>Manage your gym trainers and their details.</p>
              </div>
            </div>

            {/* TRAINER SEARCH AND FILTERS */}
            <div className="member-filters">
              <input
                type="text"
                placeholder="Search by name, email, phone or specialization..."
                value={trainerSearch}
                onChange={(e) => setTrainerSearch(e.target.value)}
              />

              <select
                value={trainerStatusFilter}
                onChange={(e) =>
                  setTrainerStatusFilter(e.target.value)
                }
              >
                <option value="All">All Trainer Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* TRAINER TABLE */}
            {trainersLoading ? (
              <p>Loading trainers...</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Specialization</th>
                      <th>Experience</th>
                      <th>Salary</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTrainers.length === 0 ? (
                      <tr>
                        <td colSpan="8">
                          {trainers.length === 0
                            ? "No trainers found. Add your first trainer!"
                            : "No trainers match your search or filters."}
                        </td>
                      </tr>
                    ) : (
                      filteredTrainers.map((trainer) => (
                        <tr key={trainer._id}>
                          <td>{trainer.name}</td>
                          <td>{trainer.email}</td>
                          <td>{trainer.phone}</td>
                          <td>{trainer.specialization}</td>
                          <td>{trainer.experience} years</td>
                          <td>
                            ₹{Number(trainer.salary || 0).toLocaleString("en-IN")}
                          </td>
                          <td>
                            <span className="status">
                              {trainer.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                type="button"
                                className="edit-btn"
                                onClick={() => handleEditTrainer(trainer)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="delete-btn"
                                onClick={() =>
                                  handleDeleteTrainer(trainer._id)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* OTHER PAGE PLACEHOLDERS */}
        {activePage === "plans" && (
          <section className="members-section">
            <h2>Membership Plans</h2>
            <p>
              Monthly, Quarterly and Yearly membership plans
              will be managed here.
            </p>
          </section>
        )}

        {activePage === "workouts" && (
          <section className="members-section">
            <div className="workout-stats">
              <div className="stat-card">
                <span>Total Workouts</span>
                <h2>{workouts.length}</h2>
              </div>
              <div className="stat-card">
                <span>Scheduled</span>
                <h2>{workouts.filter((w) => w.status === "Scheduled").length}</h2>
              </div>
              <div className="stat-card">
                <span>Completed</span>
                <h2>{workouts.filter((w) => w.status === "Completed").length}</h2>
              </div>
            </div>

            <div className="section-heading">
              <div>
                <h2>Workout Records</h2>
                <p>Create and manage member workout sessions.</p>
              </div>
            </div>

            <div className="member-filters">
              <input
                type="text"
                placeholder="Search workout, exercise, member or trainer..."
                value={workoutSearch}
                onChange={(e) => setWorkoutSearch(e.target.value)}
              />
              <select
                value={workoutStatusFilter}
                onChange={(e) => setWorkoutStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {workoutsLoading ? (
              <p>Loading workouts...</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Workout</th>
                      <th>Member</th>
                      <th>Trainer</th>
                      <th>Exercise</th>
                      <th>Sets × Reps</th>
                      <th>Duration</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkouts.length === 0 ? (
                      <tr>
                        <td colSpan="9">
                          {workouts.length === 0
                            ? "No workouts yet. Add your first workout!"
                            : "No workouts match your search or filter."}
                        </td>
                      </tr>
                    ) : (
                      filteredWorkouts.map((workout) => (
                        <tr key={workout._id}>
                          <td>{workout.workoutName}</td>
                          <td>
                            {typeof workout.member === "object"
                              ? workout.member?.name || "Member unavailable"
                              : "Member unavailable"}
                          </td>
                          <td>
                            {typeof workout.trainer === "object"
                              ? workout.trainer?.name || "Not assigned"
                              : "Not assigned"}
                          </td>
                          <td>{workout.exercise}</td>
                          <td>{workout.sets} × {workout.reps}</td>
                          <td>{workout.duration} min</td>
                          <td>{formatDate(workout.workoutDate)}</td>
                          <td><span className="status">{workout.status}</span></td>
                          <td>
                            <div className="action-buttons">
                              <button
                                type="button"
                                className="edit-btn"
                                onClick={() => handleEditWorkout(workout)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="delete-btn"
                                onClick={() => handleDeleteWorkout(workout._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activePage === "settings" && (
          <section className="members-section">
            <h2>Settings</h2>
            <p>Application settings will be added here.</p>
          </section>
        )}

        {/* ADD / EDIT MEMBER MODAL */}
        {showForm && (
          <div
            className="modal"
            onClick={() => {
              resetForm();
              setShowForm(false);
            }}
          >
            <form
              onSubmit={handleSubmit}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>
                {editingId
                  ? "Edit Member Details"
                  : "Register New Member"}
              </h2>

              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />

              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                required
              />

              <input
                type="number"
                placeholder="Age"
                min="1"
                max="100"
                value={form.age}
                onChange={(e) =>
                  setForm({ ...form, age: e.target.value })
                }
                required
              />

              <select
                value={form.membership}
                onChange={(e) =>
                  setForm({ ...form, membership: e.target.value })
                }
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>

              <button type="submit">
                {editingId ? "Update Member" : "Register Member"}
              </button>

              <button
                type="button"
                className="cancel"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* ADD / EDIT TRAINER MODAL */}
        {showTrainerForm && (
          <div
            className="modal"
            onClick={() => {
              resetTrainerForm();
              setShowTrainerForm(false);
            }}
          >
            <form
              onSubmit={handleTrainerSubmit}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>
                {editingTrainerId
                  ? "Edit Trainer Details"
                  : "Register New Trainer"}
              </h2>

              <input
                type="text"
                placeholder="Full Name"
                value={trainerForm.name}
                onChange={(e) =>
                  setTrainerForm({
                    ...trainerForm,
                    name: e.target.value,
                  })
                }
                required
              />

              <input
                type="email"
                placeholder="Email Address"
                value={trainerForm.email}
                onChange={(e) =>
                  setTrainerForm({
                    ...trainerForm,
                    email: e.target.value,
                  })
                }
                required
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={trainerForm.phone}
                onChange={(e) =>
                  setTrainerForm({
                    ...trainerForm,
                    phone: e.target.value,
                  })
                }
                required
              />

              <select
                value={trainerForm.gender}
                onChange={(e) =>
                  setTrainerForm({
                    ...trainerForm,
                    gender: e.target.value,
                  })
                }
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="text"
                placeholder="Specialization (e.g. Strength Training)"
                value={trainerForm.specialization}
                onChange={(e) =>
                  setTrainerForm({
                    ...trainerForm,
                    specialization: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                placeholder="Experience (years)"
                min="0"
                value={trainerForm.experience}
                onChange={(e) =>
                  setTrainerForm({
                    ...trainerForm,
                    experience: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                placeholder="Monthly Salary (₹)"
                min="0"
                value={trainerForm.salary}
                onChange={(e) =>
                  setTrainerForm({
                    ...trainerForm,
                    salary: e.target.value,
                  })
                }
                required
              />

              <select
                value={trainerForm.status}
                onChange={(e) =>
                  setTrainerForm({
                    ...trainerForm,
                    status: e.target.value,
                  })
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button type="submit">
                {editingTrainerId
                  ? "Update Trainer"
                  : "Register Trainer"}
              </button>

              <button
                type="button"
                className="cancel"
                onClick={() => {
                  resetTrainerForm();
                  setShowTrainerForm(false);
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* ADD / EDIT WORKOUT MODAL */}
        {showWorkoutForm && (
          <div className="modal" onClick={() => {
            resetWorkoutForm();
            setShowWorkoutForm(false);
          }}>
            <form className="workout-form" onSubmit={handleWorkoutSubmit} onClick={(e) => e.stopPropagation()}>
              <h2>{editingWorkoutId ? "Edit Workout" : "Create Workout"}</h2>

              <label>Member</label>
              <select
                value={workoutForm.member}
                onChange={(e) => setWorkoutForm({ ...workoutForm, member: e.target.value })}
                required
              >
                <option value="">Select a member</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>

              <label>Trainer (optional)</label>
              <select
                value={workoutForm.trainer}
                onChange={(e) => setWorkoutForm({ ...workoutForm, trainer: e.target.value })}
              >
                <option value="">No trainer assigned</option>
                {trainers.filter((trainer) => trainer.status === "Active").map((trainer) => (
                  <option key={trainer._id} value={trainer._id}>{trainer.name}</option>
                ))}
              </select>

              <label>Workout Name</label>
              <input
                type="text"
                placeholder="e.g. Upper Body Strength"
                value={workoutForm.workoutName}
                onChange={(e) => setWorkoutForm({ ...workoutForm, workoutName: e.target.value })}
                required
              />

              <label>Category</label>
              <select
                value={workoutForm.category}
                onChange={(e) => setWorkoutForm({ ...workoutForm, category: e.target.value })}
              >
                {["Strength", "Cardio", "Weight Loss", "Muscle Building", "Flexibility", "General Fitness"].map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <label>Exercise</label>
              <input
                type="text"
                placeholder="e.g. Bench Press"
                value={workoutForm.exercise}
                onChange={(e) => setWorkoutForm({ ...workoutForm, exercise: e.target.value })}
                required
              />

              <div className="workout-form-grid">
                <div>
                  <label>Sets</label>
                  <input type="number" min="1" value={workoutForm.sets} onChange={(e) => setWorkoutForm({ ...workoutForm, sets: e.target.value })} required />
                </div>
                <div>
                  <label>Reps</label>
                  <input type="number" min="1" value={workoutForm.reps} onChange={(e) => setWorkoutForm({ ...workoutForm, reps: e.target.value })} required />
                </div>
                <div>
                  <label>Weight (kg)</label>
                  <input type="number" min="0" step="0.5" value={workoutForm.weight} onChange={(e) => setWorkoutForm({ ...workoutForm, weight: e.target.value })} />
                </div>
                <div>
                  <label>Duration (min)</label>
                  <input type="number" min="1" value={workoutForm.duration} onChange={(e) => setWorkoutForm({ ...workoutForm, duration: e.target.value })} required />
                </div>
              </div>

              <label>Workout Date</label>
              <input type="date" value={workoutForm.workoutDate} onChange={(e) => setWorkoutForm({ ...workoutForm, workoutDate: e.target.value })} required />

              <label>Status</label>
              <select value={workoutForm.status} onChange={(e) => setWorkoutForm({ ...workoutForm, status: e.target.value })}>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <label>Notes</label>
              <textarea rows="3" placeholder="Optional workout notes..." value={workoutForm.notes} onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })} />

              <button type="submit">{editingWorkoutId ? "Update Workout" : "Save Workout"}</button>
              <button type="button" className="cancel" onClick={() => {
                resetWorkoutForm();
                setShowWorkoutForm(false);
              }}>Cancel</button>
            </form>
          </div>
        )}

        {/* MEMBER DETAILS MODAL */}
        {selectedMember && (
          <div
            className="modal"
            onClick={() => setSelectedMember(null)}
          >
            <div
              className="member-details-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="details-close-icon"
                onClick={() => setSelectedMember(null)}
                aria-label="Close member details"
              >
                ×
              </button>

              <h2>Member Profile</h2>

              <div className="profile-avatar">
                {selectedMember.name?.charAt(0).toUpperCase()}
              </div>

              <h3>{selectedMember.name}</h3>

              <p className="profile-subtitle">
                FIT ON TRACK Member
              </p>

              <div className="member-details-grid">
                <div>
                  <span>Email Address</span>
                  <strong>
                    {selectedMember.email || "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Phone Number</span>
                  <strong>
                    {selectedMember.phone || "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Age</span>
                  <strong>
                    {selectedMember.age
                      ? `${selectedMember.age} years`
                      : "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Membership Plan</span>
                  <strong>
                    {selectedMember.membership ||
                      selectedMember.plan ||
                      "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Start Date</span>
                  <strong>
                    {formatDate(selectedMember.startDate)}
                  </strong>
                </div>

                <div>
                  <span>End Date</span>
                  <strong>
                    {formatDate(selectedMember.endDate)}
                  </strong>
                </div>

                <div>
                  <span>Membership Status</span>
                  <strong>
                    {selectedMember.status || "Active"}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="close-details-btn"
                onClick={() => setSelectedMember(null)}
              >
                Close Profile
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
