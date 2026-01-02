import React, { useEffect, useState } from 'react';

export default function PSGallery({ onSelect }) {
    const [expandedId, setExpandedId] = useState(null);
    const [problemStatements, setProblemStatements] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPS = async () => {
            try {
                const res = await fetch(
                    'http://localhost:5000/api/getallproblem-statements',
                    { credentials: 'include' }
                );

                const data = await res.json();
                console.log("API RESPONSE 👉", data);

                // 🔥 IMPORTANT FIX
                if (data.problem_statements && Array.isArray(data.problem_statements)) {
                    setProblemStatements(data.problem_statements);
                } else if (Array.isArray(data)) {
                    setProblemStatements(data);
                } else {
                    throw new Error("Invalid API response");
                }

            } catch (err) {
                console.error(err);
                setError("Failed to load problem statements");
            }
        };

        fetchPS();
    }, []);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (problemStatements.length === 0) {
        return <p style={{ color: '#94a3b8' }}>No problem statements visible.</p>;
    }

    return (
        <div style={{ color: '#fff' }}>
            {problemStatements.map(ps => (
                <div key={ps.problem_statement_id}
                    style={{
                        background: '#1e293b',
                        padding: '20px',
                        marginBottom: '20px',
                        borderRadius: '10px'
                    }}
                >
                    <h3>{ps.problem_statement_id}: {ps.title}</h3>
                    <p>{ps.track}</p>
                    <p>{ps.difficulty}</p>

                    {expandedId === ps.problem_statement_id && (
                        <p>{ps.description}</p>
                    )}

                    <button
                        onClick={() =>
                            setExpandedId(
                                expandedId === ps.problem_statement_id
                                    ? null
                                    : ps.problem_statement_id
                            )
                        }
                    >
                        {expandedId === ps.problem_statement_id ? "Hide" : "View"} Details
                    </button>

                    <button
                        onClick={() => onSelect(ps)}
                        style={{ marginLeft: '10px' }}
                    >
                        Select
                    </button>
                </div>
            ))}
        </div>
    );
}
