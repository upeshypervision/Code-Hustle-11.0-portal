import { useState } from "react";

// ==========================================
// 1. DYNAMIC SCRIPT LOADER (The Fix)
// ==========================================
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      console.log("✅ Script loaded successfully:", src);
      resolve(true);
    };
    script.onerror = () => {
      console.error("❌ Failed to load script:", src);
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// ==========================================
// 2. HELPER COMPONENTS (Moved Outside)
// ==========================================

const Input = ({ label, value, onChange, type = "text" }) => (
  <div style={{ marginBottom: "12px" }}>
    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "14px",
      }}
    />
  </div>
);

const MemberCard = ({ index, member, update }) => (
  <div
    style={{
      padding: "20px",
      border: "1px solid #e0e0e0",
      borderRadius: "10px",
      marginBottom: "20px",
      backgroundColor: "#f9f9f9",
    }}
  >
    <h3 style={{ marginTop: 0, color: "#333" }}>Member {index + 1}</h3>
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
);

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export default function Register() {
  // --- STATE MANAGEMENT ---
  const [leader, setLeader] = useState({
    name: "",
    sapid: "",
    email: "",
    phone: "",
  });

  const [members, setMembers] = useState([
    { name: "", sapid: "", email: "", phone: "" },
    { name: "", sapid: "", email: "", phone: "" },
    { name: "", sapid: "", email: "", phone: "" },
  ]);

  const [hyperId, setHyperId] = useState("");
  const [hyperSapid, setHyperSapid] = useState("");

  const [amount, setAmount] = useState(null);
  const [hyperMemberData, setHyperMemberData] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- API: CHECK HYPERVISION ---
  const checkHypervision = async () => {
    console.log("🔍 [DEBUG] Checking HyperVision Eligibility...");
    console.log("Payload:", { hypervision_id: hyperId, sapid: hyperSapid });

    if (!hyperId || !hyperSapid) {
      alert("Please enter both HyperVision ID and SAP ID");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/validate-hypervision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hypervision_id: hyperId,
          sapid: hyperSapid,
        }),
      });

      const data = await res.json();
      console.log("🔍 [DEBUG] HyperVision Response:", data);

      if (data.is_hypervision) {
        setAmount(data.amount);
        setHyperMemberData(data.member);
        alert("✅ HyperVision Verified! Discount Applied.");
      } else {
        setAmount(450);
        setHyperMemberData(null);
        alert("ℹ️ Normal Fee Applies (₹450).");
      }
    } catch (error) {
      console.error("❌ [ERROR] HyperVision Check Failed:", error);
      alert("Error checking eligibility");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: SAVE PAYMENT ---
  const savePayment = (payment_id, order_id, amount, payload) => {
    console.log("💾 [DEBUG] Saving Payment & Sending Mail...");
    console.log("Payment Details:", { payment_id, order_id, amount });

    fetch("http://localhost:5000/api/save-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        payment_id,
        order_id,
        amount,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ [DEBUG] Save Payment Response:", data);
        if (data.success) {
          alert("🎉 Registration Successful! Check Leader's Email.");
        } else {
          alert("Payment saved but email failed. Contact support.");
        }
      })
      .catch((err) => {
        console.error("❌ [ERROR] Save Payment Failed:", err);
        alert("Error saving payment.");
      });
  };

  // --- LOGIC: OPEN RAZORPAY ---
  const openRazorpay = async (order_id, amount, key_id, teamPayload) => {
    console.log("🚀 [DEBUG] Attempting to open Razorpay...");

    // 1. Load the script dynamically
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Razorpay SDK failed to load. Check your internet connection.");
      return;
    }

    // 2. Check if window.Razorpay exists
    if (!window.Razorpay) {
        console.error("❌ [ERROR] window.Razorpay is still undefined despite script load.");
        alert("Payment Gateway Error. Please refresh.");
        return;
    }

    console.log("✅ [DEBUG] Razorpay SDK loaded. Initializing options...");

    const options = {
      key: key_id,
      amount: amount * 100,
      currency: "INR",
      name: "CodeHustle Hackathon",
      description: "Team Registration",
      order_id: order_id,
      handler: function (response) {
        console.log("✅ [DEBUG] Payment Successful!", response);
        savePayment(
          response.razorpay_payment_id,
          order_id,
          amount,
          teamPayload
        );
      },
      prefill: {
        name: teamPayload.leader.name,
        email: teamPayload.leader.email,
        contact: teamPayload.leader.phone,
      },
      theme: {
        color: "#0F62FE",
      },
    };

    const rz = new window.Razorpay(options);

    rz.on('payment.failed', function (response){
        console.error("❌ [ERROR] Payment Failed:", response.error);
        alert("Payment Failed: " + response.error.description);
    });

    rz.open();
  };

  // --- LOGIC: SUBMIT FORM ---
  const submitTeam = async () => {
    console.log("📝 [DEBUG] Submit Button Clicked.");

    if (!amount) {
      alert("⚠️ Please check Eligibility first!");
      return;
    }

    const teamPayload = {
      leader,
      members,
      hypervision_member: hyperMemberData,
      amount,
    };

    console.log("📤 [DEBUG] Sending Registration Payload:", teamPayload);

    try {
      setLoading(true);
      // 1. Create Order on Backend
      const res = await fetch("http://localhost:5000/api/register-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamPayload),
      });

      const data = await res.json();
      console.log("📥 [DEBUG] Order Creation Response:", data);

      if (!data.success) {
        alert(data.error || "Registration creation failed");
        setLoading(false);
        return;
      }

      // 2. Open Payment
      console.log("🔑 [DEBUG] Opening Payment with Key:", data.key_id);

      await openRazorpay(data.order_id, data.amount, data.key_id, {
        ...teamPayload,
        team_id: data.team_id,
        password_plain: data.password_plain,
      });

    } catch (error) {
      console.error("❌ [ERROR] Submit Team Failed:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Team Registration</h1>

      {/* LEADER SECTION */}
      <h2 style={{ borderBottom: "2px solid #0F62FE", paddingBottom: "10px" }}>Team Leader</h2>
      <Input label="Name" value={leader.name} onChange={(v) => setLeader({ ...leader, name: v })} />
      <Input label="SAP ID" value={leader.sapid} onChange={(v) => setLeader({ ...leader, sapid: v })} />
      <Input label="Email" value={leader.email} onChange={(v) => setLeader({ ...leader, email: v })} />
      <Input label="Phone" value={leader.phone} onChange={(v) => setLeader({ ...leader, phone: v })} />

      {/* MEMBERS SECTION */}
      <h2 style={{ borderBottom: "2px solid #0F62FE", paddingBottom: "10px", marginTop: "40px" }}>
        Team Members
      </h2>
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
      <div style={{ backgroundColor: "#eef4ff", padding: "20px", borderRadius: "10px", marginTop: "40px" }}>
        <h2 style={{ marginTop: 0 }}>HyperVision Eligibility</h2>
        <Input label="HyperVision ID" value={hyperId} onChange={setHyperId} />
        <Input label="SAP ID" value={hyperSapid} onChange={setHyperSapid} />

        <button
          onClick={checkHypervision}
          disabled={loading}
          style={{
            padding: "10px 20px",
            marginTop: "10px",
            backgroundColor: "#444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%"
          }}
        >
          {loading ? "Checking..." : "Check Eligibility"}
        </button>

        {amount && (
          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <span style={{ fontSize: "18px" }}>Total Registration Fee: </span>
            <strong style={{ fontSize: "24px", color: "#0F62FE" }}>₹{amount}</strong>
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={submitTeam}
        disabled={loading}
        style={{
          width: "100%",
          padding: "15px",
          marginTop: "30px",
          backgroundColor: amount ? "#0F62FE" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: amount ? "pointer" : "not-allowed",
        }}
      >
        {loading ? "Processing..." : "Register & Pay"}
      </button>
    </div>
  );
}