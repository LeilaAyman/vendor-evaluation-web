import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Swal from 'sweetalert2';

function AddVendor() {
  const [vendorName, setVendorName] = useState("");
  const navigate = useNavigate();

  const handleAddVendor = async (e) => {
  e.preventDefault();

  if (!vendorName.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Input',
      text: 'Please enter a vendor name.',
    });
    return;
  }

  const result = await Swal.fire({
    title: `Add "${vendorName}"?`,
    text: "Are you sure you want to add this vendor?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, add it!',
  });

  if (!result.isConfirmed) return;

  try {
    await addDoc(collection(db, "vendors"), {
      name: vendorName.trim(),
      new: true,
    });

    await Swal.fire({
      icon: 'success',
      title: 'Vendor Added',
      text: `Vendor "${vendorName}" added successfully.`,
      confirmButtonColor: '#28a745',
    });

    navigate("/dashboard");
  } catch (error) {
    console.error("Error adding vendor:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: '❌ Failed to add vendor.',
    });
  }
};

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Add New Vendor</h2>
      <form onSubmit={handleAddVendor} style={styles.form}>
        <input
          type="text"
          placeholder="Vendor Name"
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
          style={styles.input}
        />
        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.addButton}>
            Add Vendor
          </button>
          <button type="button" onClick={() => navigate("/dashboard")} style={styles.backButton}>
            ← Back to Dashboard
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "24px",
    background: "#f3f3f3",
    borderRadius: "10px",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
  },
  addButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "10px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  backButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default AddVendor;
