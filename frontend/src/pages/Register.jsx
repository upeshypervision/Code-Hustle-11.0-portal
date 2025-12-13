import { useState } from "react";

// ==========================================
// 1. DYNAMIC SCRIPT LOADER
// ==========================================
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// ==========================================
// 2. STYLES (Dark Theme & Modern UI)
// ==========================================
const styles = {
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "40px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    backgroundColor: "#1e1e24",
    color: "#e0e0e0",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    background: "linear-gradient(90deg, #0F62FE, #60a5fa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontSize: "2.5rem",
    fontWeight: "800",
  },
  sectionTitle: {
    borderLeft: "4px solid #0F62FE",
    paddingLeft: "15px",
    fontSize: "1.5rem",
    marginBottom: "20px",
    color: "#fff",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "0.9rem",
    color: "#a0a0a0",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #333",
    backgroundColor: "#2b2b36",
    color: "#fff",
    fontSize: "14px",
    transition: "border 0.3s ease",
    outline: "none",
  },
  card: {
    backgroundColor: "#2b2b36",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid #333",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  button: {
    width: "100%",
    padding: "18px",
    marginTop: "30px",
    background: "linear-gradient(135deg, #0F62FE 0%, #0043ce 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 15px rgba(15, 98, 254, 0.4)",
  },
  disabledButton: {
    background: "#444",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  hyperSection: {
    backgroundColor: "rgba(15, 98, 254, 0.1)",
    border: "1px solid rgba(15, 98, 254, 0.3)",
    padding: "25px",
    borderRadius: "12px",
    marginTop: "40px",
  },
};

// ==========================================
// 3. HELPER COMPONENTS
// ==========================================

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div style={styles.inputGroup}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={styles.input}
      onFocus={(e) => (e.target.style.borderColor = "#0F62FE")}
      onBlur={(e) => (e.target.style.borderColor = "#333")}
    />
  </div>
);

const MemberCard = ({ index, member, update }) => (
  <div style={styles.card}>
    <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#fff" }}>
      Member {index + 1} {index === 0 && <span style={{fontSize: "0.8em", color: "#0F62FE"}}>(Required)</span>}
    </h3>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
      <Input
        label="Name"
        value={member.name}
        onChange={(v) => update({ ...member, name: v })}
      />
      <Input
        label="SAP ID"
        value={member.sapid}
        onChange={(v) => update({ ...member, sapid: v })}
      />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
      <Input
        label="Email"
        value={member.email}
        onChange={(v) => update({ ...member, email: v })}
      />
      <Input
        label="Phone"
        value={member.phone}
        onChange={(v) => update({ ...member, phone: v })}
      />
    </div>
  </div>
);

// ==========================================
// 4. MAIN COMPONENT
// ==========================================

export default function Register() {
  const [loading, setLoading] = useState(false);

  // Leader State
  const [leader, setLeader] = useState({ name: "", sapid: "", email: "", phone: "" });

  // Members State (3 Slots)
  const [members, setMembers] = useState([
    { name: "", sapid: "", email: "", phone: "" },
    { name: "", sapid: "", email: "", phone: "" },
    { name: "", sapid: "", email: "", phone: "" },
  ]);

  // HyperVision State
  const [hyperId, setHyperId] = useState("");
  const [hyperSapid, setHyperSapid] = useState("");

  // --- API: SAVE PAYMENT ---
  const savePayment = (payment_id, order_id, amount, payload) => {
    fetch("http://localhost:5000/api/save-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, payment_id, order_id, amount }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("🎉 Registration Successful! Check Leader's Email.");
          window.location.reload(); // Reset form
        } else {
          alert("Payment saved but email failed. Contact support.");
        }
      })
      .catch(() => alert("Error saving payment."));
  };

  // --- API: OPEN RAZORPAY ---
  const openRazorpay = async (order_id, finalAmount, key_id, teamPayload) => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Razorpay SDK failed to load. Check internet.");
      return;
    }

    const options = {
      key: key_id,
      amount: finalAmount * 100,
      currency: "INR",
      name: "CodeHustle Hackathon",
      description: "Team Registration",
      order_id: order_id,
      handler: function (response) {
        savePayment(response.razorpay_payment_id, order_id, finalAmount, teamPayload);
      },
      prefill: {
        name: teamPayload.leader.name,
        email: teamPayload.leader.email,
        contact: teamPayload.leader.phone,
      },
      theme: { color: "#0F62FE" },
    };

    const rz = new window.Razorpay(options);
    rz.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
    });
    rz.open();
  };

  // --- VALIDATION & SUBMISSION LOGIC ---
  const handleRegister = async () => {
    // 1. Validate Leader
    if (!leader.name || !leader.sapid || !leader.email || !leader.phone) {
      alert("⚠️ Please fill all Team Leader details.");
      return;
    }

    // 2. Validate Members (Min 1 Member Required + Integrity Check)
    let filledMembersCount = 0;

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      // Check if any field is filled
      const isPartiallyFilled = m.name || m.sapid || m.email || m.phone;
      const isFullyFilled = m.name && m.sapid && m.email && m.phone;

      if (isPartiallyFilled) {
        if (!isFullyFilled) {
          alert(`⚠️ Member ${i + 1} details are incomplete. Please fill all fields or clear them.`);
          return;
        }
        filledMembersCount++;
      }
    }

    if (filledMembersCount < 1) {
      alert("⚠️ You need at least 1 Team Member besides the Leader.");
      return;
    }

    setLoading(true);

    let finalAmount = 450; // Default Fee
    let hyperMemberData = null;

    try {
      // 3. Check HyperVision Eligibility (If fields are filled)
      if (hyperId && hyperSapid) {
        console.log("🔍 Checking HyperVision Eligibility...");
        const hyperRes = await fetch("http://localhost:5000/api/validate-hypervision", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hypervision_id: hyperId, sapid: hyperSapid }),
        });

        const hyperData = await hyperRes.json();

        if (hyperData.is_hypervision) {
            console.log("✅ Discount Applied!");
            finalAmount = hyperData.amount;
            hyperMemberData = hyperData.member;
            alert(`✅ HyperVision Verified! Discounted Fee: ₹${finalAmount}`);
        } else {
            setLoading(false);
            alert("❌ Sorry, the provided ID is not a registered HyperVision member.");
            return; // STOP PROCESS
        }
      } else {
        console.log("ℹ️ No HyperVision ID provided. Proceeding with standard fee.");
      }

      // 4. Prepare Payload
      const teamPayload = {
        leader,
        members: members.filter(m => m.name), // Send only filled members
        hypervision_member: hyperMemberData,
        amount: finalAmount,
      };

      // 5. Create Order
      const orderRes = await fetch("http://localhost:5000/api/register-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamPayload),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || "Registration failed");
      }

      // 6. Open Payment Gateway
      await openRazorpay(orderData.order_id, orderData.amount, orderData.key_id, {
        ...teamPayload,
        team_id: orderData.team_id,
        password_plain: orderData.password_plain,
      });

    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>CodeHustle Registration</h1>

      {/* LEADER SECTION */}
      <h2 style={styles.sectionTitle}>Team Leader</h2>
      <div style={styles.card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <Input label="Name" value={leader.name} onChange={(v) => setLeader({ ...leader, name: v })} />
            <Input label="SAP ID" value={leader.sapid} onChange={(v) => setLeader({ ...leader, sapid: v })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <Input label="Email" value={leader.email} onChange={(v) => setLeader({ ...leader, email: v })} />
            <Input label="Phone" value={leader.phone} onChange={(v) => setLeader({ ...leader, phone: v })} />
        </div>
      </div>

      {/* MEMBERS SECTION */}
      <h2 style={styles.sectionTitle}>Team Members</h2>
      <p style={{marginBottom: "20px", color: "#aaa"}}>Fill details for at least 1 member.</p>

      {members.map((member, idx) => (
        <MemberCard
          key={idx}
          index={idx}
          member={member}
          update={(updatedMember) => {
            const newMembers = [...members];
            newMembers[idx] = updatedMember;
            setMembers(newMembers);
          }}
        />
      ))}

      {/* HYPERVISION SECTION */}
      <div style={styles.hyperSection}>
        <h2 style={{ marginTop: 0, color: "#0F62FE" }}>HyperVision Discount</h2>
        <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "15px" }}>
            If you are a HyperVision member, enter your details below for a discount.
            <br />Leave blank if not applicable.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <Input label="HyperVision ID" value={hyperId} onChange={setHyperId} placeholder="Optional" />
            <Input label="SAP ID (for verification)" value={hyperSapid} onChange={setHyperSapid} placeholder="Optional" />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
            ...styles.button,
            ...(loading ? styles.disabledButton : {})
        }}
      >
        {loading ? "Processing..." : "Register & Pay"}
      </button>
    </div>
  );
}