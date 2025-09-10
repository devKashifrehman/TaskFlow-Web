import React, { useState } from "react";
import "./Report.css";

function Report() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000); // 4s baad hide ho jayega
  };

  return (
    <div className="report-container">
      <h2>Submit Your Report</h2>
      {!submitted ? (
        <button className="submit-btn" onClick={handleSubmit}>
          Submit Your Report
        </button>
      ) : (
        <div className="thankyou-message">
          <span>🎉</span> Thanks for submitting!
        </div>
      )}
    </div>
  );
}

export default Report;
