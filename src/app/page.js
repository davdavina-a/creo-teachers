"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import Questionnaire from "../components/Questionnaire";
import DiagnosticWriting from "../components/DiagnosticWriting";
import SkillProfile from "../components/SkillProfile";

export default function Home() {
  const [screen, setScreen] = useState("consent");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [diagnosticResult, setDiagnosticResult] = useState(null);

  if (screen === "consent") {
    return <ConsentScreen onAgree={() => setScreen("signup")} onDisagree={() => setScreen("declined")} />;
  }

  if (screen === "declined") {
    return (
      <div className="container-app" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Thank you for your time</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>You have chosen not to participate. You may close this page. If you change your mind, you can return at any time.</p>
          <button className="btn-secondary" onClick={() => setScreen("consent")}>Go back</button>
        </div>
      </div>
    );
  }

  if (screen === "signup") {
    const handleSignUp = async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) { setError(signUpError.message); setLoading(false); return; }
        if (data.user) {
          const anonId = "P" + String(Math.floor(Math.random() * 9000) + 1000);
          await supabase.from("profiles").insert({ id: data.user.id, email, full_name: fullName, anonymous_id: anonId, consent_given: true, consent_date: new Date().toISOString() });
          const skills = ["Identifying a main idea and supporting statements","Acknowledging different perspectives","Meeting academic expectations","Strength of academic argument","Source interpretation","Use of sources","Student voice in relation to sources","Justification of ideas","Integration of sources for justification"];
          await supabase.from("skill_levels").insert(skills.map((s) => ({ user_id: data.user.id, skill_area: s, level: "Not assessed" })));
        }
        setScreen("check-email");
      } catch (err) { setError("Something went wrong. Please try again."); }
      setLoading(false);
    };
    return (
      <div className="container-app" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={stepLabel}>Step 1 of 4</p>
          <h1 style={headingStyle}>Create your account</h1>
          <p style={subtextStyle}>Your data will be stored securely and identified by an anonymous code, not your name.</p>
        </div>
        <div className="card">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div><label style={labelStyle}>Full name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Siti Aminah" style={inputStyle} /></div>
            <div><label style={labelStyle}>Email address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. yourname@university.edu.my" style={inputStyle} /></div>
            <div><label style={labelStyle}>Create a password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" style={inputStyle} /><p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.35rem" }}>You will use this to log back in later.</p></div>
            {error && <div style={errorStyle}>{error}</div>}
            <button className="btn-primary" onClick={handleSignUp} disabled={loading || !email || !password || !fullName}>{loading ? "Creating account..." : "Create account"}</button>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--color-text-secondary)", marginTop: "1.5rem" }}>Already have an account?{" "}<span onClick={() => { setScreen("login"); setError(""); }} style={linkStyle}>Log in</span></p>
      </div>
    );
  }

  if (screen === "login") {
    const handleLogin = async () => {
      setLoading(true);
      setError("");
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) { setError(loginError.message); setLoading(false); return; }
      setUserId(data.user.id);
      // Check if user already completed questionnaire
      const { data: profile } = await supabase.from("profiles").select("questionnaire_data").eq("id", data.user.id).single();
      if (profile?.questionnaire_data) {
        // Check if diagnostic is done
        const { data: submissions } = await supabase.from("writing_submissions").select("ai_feedback").eq("user_id", data.user.id).eq("submission_type", "diagnostic").limit(1);
        if (submissions && submissions.length > 0) {
          setDiagnosticResult(submissions[0].ai_feedback);
          setScreen("dashboard");
        } else {
          setScreen("diagnostic");
        }
      } else {
        setScreen("questionnaire");
      }
      setLoading(false);
    };
    return (
      <div className="container-app" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={headingStyle}>Welcome back</h1>
          <p style={subtextStyle}>Log in to continue your writing journey.</p>
        </div>
        <div className="card">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div><label style={labelStyle}>Email address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. yourname@university.edu.my" style={inputStyle} /></div>
            <div><label style={labelStyle}>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" style={inputStyle} /></div>
            {error && <div style={errorStyle}>{error}</div>}
            <button className="btn-primary" onClick={handleLogin} disabled={loading || !email || !password}>{loading ? "Logging in..." : "Log in"}</button>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--color-text-secondary)", marginTop: "1.5rem" }}>Don't have an account?{" "}<span onClick={() => { setScreen("signup"); setError(""); }} style={linkStyle}>Sign up</span></p>
      </div>
    );
  }

  if (screen === "check-email") {
    return (
      <div className="container-app" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
        <div className="card" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.5rem" }}>✉</div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Check your email</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>We've sent a confirmation link to:</p>
          <p style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "1.25rem" }}>{email}</p>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Click the link in the email to activate your account, then come back here and log in.</p>
          <button className="btn-primary" onClick={() => { setScreen("login"); setError(""); }}>Go to login</button>
        </div>
      </div>
    );
  }

  if (screen === "questionnaire") {
    return <Questionnaire onComplete={async (data) => {
      if (userId) {
        await supabase.from("profiles").update({ questionnaire_data: data }).eq("id", userId);
      }
      setScreen("diagnostic");
      window.scrollTo(0, 0);
    }} />;
  }

  if (screen === "diagnostic") {
    return <DiagnosticWriting onComplete={async ({ writing, wordCount, prompt, result }) => {
      setDiagnosticResult(result);
      if (userId) {
        await supabase.from("writing_submissions").insert({ user_id: userId, submission_type: "diagnostic", prompt, response: writing, word_count: wordCount, ai_feedback: result });
        for (const skill of result.skills) {
          await supabase.from("skill_levels").update({ level: skill.level, updated_at: new Date().toISOString() }).eq("user_id", userId).eq("skill_area", skill.area);
        }
      }
      setScreen("skill-profile");
      window.scrollTo(0, 0);
    }} />;
  }

  if (screen === "skill-profile") {
    return <SkillProfile result={diagnosticResult} onContinue={() => setScreen("dashboard")} />;
  }

  if (screen === "dashboard") {
    return (
      <div className="container-app" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✓</div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Welcome to Crēo Teachers</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>Your personalised exercises and learning path are coming in the next phase.</p>
        </div>
      </div>
    );
  }

  return null;
}

// ── Styles ──
const stepLabel = { fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "0.5rem" };
const headingStyle = { fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "1.5rem", fontWeight: 700 };
const subtextStyle = { color: "var(--color-text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" };
const labelStyle = { display: "block", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "0.4rem" };
const inputStyle = { display: "block", width: "100%", padding: "0.75rem 1rem", fontSize: "0.95rem", fontFamily: "Georgia, 'Times New Roman', serif", border: "1.5px solid var(--color-border)", borderRadius: "8px", backgroundColor: "var(--color-surface)", color: "var(--color-text)", outline: "none" };
const errorStyle = { padding: "0.75rem 1rem", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", color: "var(--color-danger)", fontSize: "0.85rem" };
const linkStyle = { color: "var(--color-primary)", cursor: "pointer", textDecoration: "underline" };

// ── Consent Screen ──
function ConsentScreen({ onAgree, onDisagree }) {
  return (
    <div className="container-app" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={stepLabel}>Research Study</p>
        <h1 style={headingStyle}>Crēo Teachers</h1>
        <p style={subtextStyle}>Participant Information Sheet</p>
      </div>
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <Section title="Research Title"><p>Developing an AI-Integrated Application for Enhancing Higher-Order Thinking Skills (HOTs) in Academic Writing among Malaysian Pre-Service English Teachers</p></Section>
        <Divider />
        <Section title="Introduction"><p>You are invited to participate in a study evaluating a mobile application designed to support academic writing as part of a Master of Education (Research) programme at Universiti Malaya. Before you decide whether to participate, it is important that you understand why the study is being carried out and what your participation will involve. Please read the following information carefully. If anything is unclear or if you would like more information, please contact the researcher.</p></Section>
        <Divider />
        <Section title="Purpose"><p>This study aims to evaluate the effectiveness of a mobile application in supporting higher-order thinking skills in academic writing.</p></Section>
        <Divider />
        <Section title="Study Procedure"><p>If you agree to participate in this study, you will be asked to take part in the use of a mobile application.</p><p style={{ marginTop: "0.75rem" }}>You will be asked to use a mobile application designed for academic writing tasks. These tasks may include critical, argumentative, problem-solving or persuasive writing activities. Your interaction with the application will be recorded automatically by the system for research purposes. You will also be asked to provide basic contact information (e.g., name and email address or phone number) if you consent to be contacted for a follow-up interview or focus group. This stage will take approximately 30–45 minutes, depending on your frequency of use.</p><p style={{ marginTop: "0.75rem" }}>Participation during this stage is completed online.</p></Section>
        <Divider />
        <Section title="Participation in the Study"><p>You have been invited to participate because you are a pre-service English teacher enrolled in a teacher education programme at a Malaysian public university.</p><p style={{ marginTop: "0.75rem" }}>Your participation in this study is entirely voluntary. You may choose not to participate or to withdraw from the study at any time without any penalty or negative consequences.</p><p style={{ marginTop: "0.75rem" }}>Your decision will not affect your academic standing or relationship with your university or lecturers.</p></Section>
        <Divider />
        <Section title="Benefit to Participants"><p>Participants will not receive an honorarium at this stage of the research study. Instead, participants may benefit from:</p><ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}><li>Increased awareness of higher-order thinking skills in academic writing</li><li>Exposure to an AI-supported learning application</li><li>Contribution to the improvement of teaching and learning tools for pre-service English teachers</li></ul></Section>
        <Divider />
        <Section title="Risk to Participants"><p>This study involves minimal risk. The activities are similar to normal academic writing and reflection tasks. Some participants may experience mild fatigue or discomfort when completing writing tasks or discussing their experiences. You may take breaks or stop participating at any time.</p><p style={{ marginTop: "0.75rem" }}>If you feel uncomfortable or distressed at any point, you may withdraw immediately. If further support is needed, you are encouraged to seek assistance from your university's student counselling services.</p></Section>
        <Divider />
        <Section title="Confidentiality"><p>All information collected in this study will be kept strictly confidential.</p><ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}><li>Your name and personal details will not appear in any reports or publications.</li><li>A unique code will be used instead of your name to identify your data.</li><li>Audio recordings will be used only for research analysis and will be securely stored.</li><li>Only the researcher and supervisor will have access to the data.</li><li>All data will be stored securely and will be destroyed after the required retention period of 5 years.</li></ul><p style={{ marginTop: "0.75rem" }}>Data collected through the mobile application will undergo appropriate security measures to protect your privacy. By signing the consent form or clicking "I agree," you authorise the collection, analysis, and use of the data for this research study.</p></Section>
        <Divider />
        <Section title="Complaints"><p>Should you have any concerns or questions about the research project which you do not wish to discuss with the researchers, you may contact:</p><div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "var(--color-bg)", borderRadius: "8px", fontSize: "0.9rem" }}><p style={{ fontWeight: 600, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>University of Malaya Research Ethics Committee (UMREC)</p><p style={{ marginTop: "0.4rem" }}>Tel: 03-79677022 (ext.: 2369)</p><p>Email: <a href="mailto:umrec@um.edu.my">umrec@um.edu.my</a></p><p style={{ marginTop: "0.4rem" }}>Level 6, Kompleks Pengurusan Penyelidikan dan Inovasi (KPPI), Universiti Malaya, 50603 Kuala Lumpur, Malaysia</p></div></Section>
        <Divider />
        <Section title="Researcher"><div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem" }}><div style={{ padding: "1rem", backgroundColor: "var(--color-bg)", borderRadius: "8px" }}><p style={{ fontWeight: 600, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>Researcher</p><p style={{ marginTop: "0.25rem" }}>Davina Anne Rajah</p><p><a href="mailto:u2004425@siswa.um.edu.my">u2004425@siswa.um.edu.my</a></p><p>Faculty of Education, Universiti Malaya</p></div><div style={{ padding: "1rem", backgroundColor: "var(--color-bg)", borderRadius: "8px" }}><p style={{ fontWeight: 600, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>Supervisor</p><p style={{ marginTop: "0.25rem" }}>Dr. Ali Sorayyaei Azar</p><p><a href="mailto:azarsorrayaie@um.edu.my">azarsorrayaie@um.edu.my</a></p><p>Faculty of Education, Universiti Malaya</p></div></div></Section>
      </div>
      <div style={{ padding: "1.25rem", backgroundColor: "var(--color-primary-light)", borderRadius: "12px", marginBottom: "1rem", fontSize: "0.9rem", lineHeight: 1.5 }}>By clicking "I Agree" below you are indicating that you are at least 18 years old, have read and understood this consent form and agree to participate in this research study.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}><button className="btn-primary" onClick={onAgree}>I Agree</button><button className="btn-secondary" onClick={onDisagree}>I Disagree</button></div>
      <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: "1.5rem" }}>Please save or print a copy of this page for your records.</p>
    </div>
  );
}

function Section({ title, children }) {
  return (<div><h2 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "0.6rem" }}>{title}</h2><div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>{children}</div></div>);
}

function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "1.25rem 0" }} />;
}