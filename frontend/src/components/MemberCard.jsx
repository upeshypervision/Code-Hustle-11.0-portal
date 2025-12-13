import InputField from "./InputField";

export default function MemberCard({ index, member, setMember }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "15px" }}>
      <h3>Member {index + 1}</h3>

      <InputField label="Name" value={member.name} setValue={(v) => setMember({ ...member, name: v })} />
      <InputField label="SAP ID" value={member.sapid} setValue={(v) => setMember({ ...member, sapid: v })} />
      <InputField label="Email" value={member.email} setValue={(v) => setMember({ ...member, email: v })} />
      <InputField label="Phone" value={member.phone} setValue={(v) => setMember({ ...member, phone: v })} />
    </div>
  );
}
