export default function InputField({ label, value, setValue, type = "text" }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label>{label}</label>
      <br />
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ padding: "10px", width: "300px" }}
      />
    </div>
  );
}
