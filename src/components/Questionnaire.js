"use client";

import { useState } from "react";

const LIKERT_OPTIONS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

const EXCERPT_1 = `Having a pet can really affect how we feel and develop emotionally in normal ways. Dogs for example often help people, kids learn how to be kind to others, control their emotions and feel good about themselves because dogs show how they feel and love to be close to people. Cats are good at helping people feel calm, comfortable and independent. They are happy to keep us company without needing constant attention. Little animals, like rabbits or guinea pigs can teach us to be patient and take care of things and be gentle while birds may help us to talk to each other and understand our emotions better because of the way they communicate and interact with us. Even animals like fish or reptiles can help reduce stress and support emotional balance by providing a peaceful presence and a sense of routine.`;

const EXCERPT_2 = `Automobiles as cultural artefacts\n\nAutomobiles can be seen as cultural artefacts as they transcend values, lifestyles, and technological advancements from a particular time. Cars, other than being a mode of transportation, often expresses the social identity, economic status and personal taste of the individual that owns the car. In Malaysia, local car models such as Perodua, have won the hearts of many Malaysians. We can see this passion towards these cars when they are modified, showing that each individual has their own taste of the same car. The evolution of cars also mirrors changes in environmental awareness, urban development, and consumer priorities. Therefore, automobiles go beyond being mere machines, as they embody cultural meanings and social practices within a society.`;

const EXCERPT_3 = `Invasive aquatic plants are plants that are non-native and they are usually introduced by humans into a new environment. Some of the common ways these species spread are through recreational boating, fishing activities and the aquarium trade (Richards, 2021). These 'alien' species can reproduce rapidly and over time pose significant threats to the native environment. For instance, Water hyacinth is one of the invasive aquatic plants found in Malaysia, whereby it is known to create dense shading and overcrowding of native aquatic plants (Ismail et al., 2019). This causes the overall biological diversity to be disrupted. Other invasive plants such as Hydrilla and Giant Salvinia can deplete oxygen levels in waterbodies, therefore reducing the water quality (Bullard, 2024). This occurs when aquatic organisms die and decompose at a large rate, therefore increasing the amounts of organic matter released into the water. The increased nutrient levels may subsequently trigger algal blooms, further degrading water quality. Apart from this, native vegetation may be dominated and outcompeted by invasive plants due to the lack of natural predators (Nahima, 2024). As native plants disappear, organisms that rely on them for food or shelter, may face greater competition among themselves, resulting in disruptions to the food web. Finally, aquatic invasive species are a serious environmental challenge that negatively affects not only the ecosystems but also humans through issues such as food insecurity and water scarcity. Hence, understanding these impacts is crucial in preventing the spread of invasive aquatic plants and protecting waterbodies for future generations.`;

export default function Questionnaire({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    age: "", institution: "", gender: "", programme: "", year_semester: "",
    english_proficiency: "", proficiency_test: "", taken_academic_writing_courses: "",
    academic_writing_frequency: "", used_ai_tools: "",
    likert_1: "", likert_2: "", likert_3: "", likert_4: "", likert_5: "", likert_6: "",
    likert_7: "", likert_8: "", likert_9: "", likert_10: "", likert_11: "", likert_12: "",
    likert_ai_1: "", likert_ai_2: "", likert_ai_3: "", likert_ai_4: "",
    open_1: "", open_2: "", open_3: "",
  });

  const u = (key, val) => setData((p) => ({ ...p, [key]: val }));

  const step0Ready = data.age && data.institution && data.gender && data.programme && data.year_semester && data.english_proficiency && data.taken_academic_writing_courses && data.academic_writing_frequency && data.used_ai_tools;
  const step1Ready = data.likert_1 && data.likert_2 && data.likert_3 && data.likert_4 && data.likert_5 && data.likert_6 && data.likert_7 && data.likert_8 && data.likert_9 && data.likert_10 && data.likert_11 && data.likert_12;
  const step2Ready = data.likert_ai_1 && data.likert_ai_2 && data.likert_ai_3 && data.likert_ai_4;

  if (step === 0) {
    return (
      <div className="container-app" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        <Header step="Step 2 of 4" title="About You" subtitle="Help us understand your background. This information is used for research purposes only." />
        <div className="card">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <Field label="Age" value={data.age} onChange={(v) => u("age", v)} placeholder="e.g. 22" />
            <Field label="Gender" value={data.gender} onChange={(v) => u("gender", v)} placeholder="e.g. Female" />
            <Field label="Institution" value={data.institution} onChange={(v) => u("institution", v)} placeholder="e.g. Universiti Malaya" />
            <Field label="Programme" value={data.programme} onChange={(v) => u("programme", v)} placeholder="e.g. B.Ed TESL" />
            <Field label="Current year / semester of study" value={data.year_semester} onChange={(v) => u("year_semester", v)} placeholder="e.g. Year 3, Semester 1" />
            <Chips label="Self-assessed proficiency in English" value={data.english_proficiency} onChange={(v) => u("english_proficiency", v)} options={["Low", "Moderate", "High", "Very High"]} />
            <Field label="Latest English proficiency test results (MUET, IELTS or TOEFL)" value={data.proficiency_test} onChange={(v) => u("proficiency_test", v)} placeholder="e.g. MUET Band 4" />
            <Chips label="Have you taken courses related to academic writing?" value={data.taken_academic_writing_courses} onChange={(v) => u("taken_academic_writing_courses", v)} options={["Yes", "No"]} />
            <Chips label="How often do you incorporate academic writing in your programme?" value={data.academic_writing_frequency} onChange={(v) => u("academic_writing_frequency", v)} options={["Weekly", "Monthly", "Rarely"]} />
            <Chips label="Have you used AI tools before? (e.g. ChatGPT, Grammarly, Gemini)" value={data.used_ai_tools} onChange={(v) => u("used_ai_tools", v)} options={["Yes", "No"]} />
          </div>
        </div>
        <div style={{ marginTop: "1.5rem" }}>
          <button className="btn-primary" disabled={!step0Ready} onClick={() => { setStep(1); window.scrollTo(0, 0); }}>Continue</button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="container-app" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        <Header step="Step 2 of 4" title="Academic Writing & HOTS" subtitle="Read each student excerpt carefully and respond to the statements based on your judgement." />
        <Excerpt title="Student Excerpt 1" text={EXCERPT_1} />
        <Likert label="As a pre-service teacher, I find the main idea of this paragraph clear." value={data.likert_1} onChange={(v) => u("likert_1", v)} />
        <Likert label="From an academic writing perspective, this paragraph would benefit from stronger supporting evidence." value={data.likert_2} onChange={(v) => u("likert_2", v)} />
        <Likert label="As a future teacher, it is not immediately clear how the different perspectives in this paragraph are intended to work together." value={data.likert_3} onChange={(v) => u("likert_3", v)} />
        <Excerpt title="Student Excerpt 2" text={EXCERPT_2} />
        <Likert label="In my view, readers might disagree about whether this paragraph meets academic expectations." value={data.likert_4} onChange={(v) => u("likert_4", v)} />
        <Likert label="As a reader of academic writing, I consider this paragraph to present a strong academic argument." value={data.likert_5} onChange={(v) => u("likert_5", v)} />
        <Likert label="This paragraph cannot be developed further as an academic argument." value={data.likert_6} onChange={(v) => u("likert_6", v)} />
        <Excerpt title="Student Excerpt 3" text={EXCERPT_3} />
        <Likert label="The way sources are referred to in this paragraph leaves room for different interpretations." value={data.likert_7} onChange={(v) => u("likert_7", v)} />
        <Likert label="In my opinion, the way sources are used in this paragraph meet the expectations for academic writing." value={data.likert_8} onChange={(v) => u("likert_8", v)} />
        <Likert label="As a future teacher, I can see how the student positions their own voice in relation to the source." value={data.likert_9} onChange={(v) => u("likert_9", v)} />
        <Likert label="There may be differing views on whether the student's position is expressed strongly enough." value={data.likert_10} onChange={(v) => u("likert_10", v)} />
        <Likert label="It is debatable how effectively the sources are used to justify the conclusion." value={data.likert_11} onChange={(v) => u("likert_11", v)} />
        <Likert label="This paragraph could reasonably be revised in more than one way to strengthen how sources are integrated." value={data.likert_12} onChange={(v) => u("likert_12", v)} />
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
          <button className="btn-secondary" onClick={() => { setStep(0); window.scrollTo(0, 0); }} style={{ flex: 1 }}>Back</button>
          <button className="btn-primary" disabled={!step1Ready} onClick={() => { setStep(2); window.scrollTo(0, 0); }} style={{ flex: 2 }}>Continue</button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="container-app" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        <Header step="Step 2 of 4" title="AI Tools & Skills" subtitle="Share your thoughts on AI tools in academic writing." />
        <Likert label="As a pre-service teacher, I believe AI tools can help me improve my HOTS in academic writing." value={data.likert_ai_1} onChange={(v) => u("likert_ai_1", v)} />
        <Likert label="As a pre-service teacher, I find AI tools easy to use for academic writing tasks." value={data.likert_ai_2} onChange={(v) => u("likert_ai_2", v)} />
        <Likert label="I have access to the necessary technology to use AI tools." value={data.likert_ai_3} onChange={(v) => u("likert_ai_3", v)} />
        <Likert label="As a future teacher, I need more guidance to analyse and evaluate texts and generate ideas in academic writing." value={data.likert_ai_4} onChange={(v) => u("likert_ai_4", v)} />
        <div className="card" style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={fls}>What type of AI feedback would be most useful for your academic writing?</label>
              <textarea value={data.open_1} onChange={(e) => u("open_1", e.target.value)} placeholder="Type your response here..." style={tas} rows={3} />
            </div>
            <div>
              <label style={fls}>What is the biggest challenge you face when analysing, evaluating or creating academic writing?</label>
              <textarea value={data.open_2} onChange={(e) => u("open_2", e.target.value)} placeholder="Type your response here..." style={tas} rows={3} />
            </div>
            <div>
              <label style={fls}>Is there anything else you would like an AI-integrated HOTS app to include?</label>
              <textarea value={data.open_3} onChange={(e) => u("open_3", e.target.value)} placeholder="Type your response here (optional)..." style={tas} rows={3} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
          <button className="btn-secondary" onClick={() => { setStep(1); window.scrollTo(0, 0); }} style={{ flex: 1 }}>Back</button>
          <button className="btn-primary" disabled={!step2Ready} onClick={() => onComplete(data)} style={{ flex: 2 }}>Submit & Continue</button>
        </div>
      </div>
    );
  }
  return null;
}

function Header({ step, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
      <p style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "0.5rem" }}>{step}</p>
      <h1 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>{title}</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>{subtitle}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={fls}>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={fis} />
    </div>
  );
}

function Chips({ label, value, onChange, options }) {
  return (
    <div>
      <label style={fls}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem" }}>
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)} style={{ padding: "0.5rem 1rem", borderRadius: "20px", fontSize: "0.85rem", border: value === o ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)", backgroundColor: value === o ? "var(--color-primary-light)" : "var(--color-surface)", color: value === o ? "var(--color-primary)" : "var(--color-text-secondary)", cursor: "pointer", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: value === o ? 600 : 400 }}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function Excerpt({ title, text }) {
  return (
    <div style={{ margin: "1.5rem 0 1rem", padding: "1.25rem", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px" }}>
      <p style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "var(--color-primary)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</p>
      <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.7, fontStyle: "italic", whiteSpace: "pre-line" }}>{text}</p>
    </div>
  );
}

function Likert({ label, value, onChange }) {
  return (
    <div className="card" style={{ marginTop: "0.75rem", padding: "1rem 1.25rem" }}>
      <p style={{ fontSize: "0.9rem", color: "var(--color-text)", marginBottom: "0.75rem", lineHeight: 1.5 }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {LIKERT_OPTIONS.map((o) => (
          <button key={o} onClick={() => onChange(o)} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "none", cursor: "pointer", textAlign: "left", backgroundColor: value === o ? "var(--color-primary-light)" : "transparent" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0, border: value === o ? "5px solid var(--color-primary)" : "2px solid var(--color-border)" }} />
            <span style={{ fontSize: "0.85rem", color: value === o ? "var(--color-primary)" : "var(--color-text-secondary)", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: value === o ? 600 : 400 }}>{o}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const fls = { display: "block", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "0.4rem" };
const fis = { display: "block", width: "100%", padding: "0.75rem 1rem", fontSize: "0.95rem", fontFamily: "Georgia, 'Times New Roman', serif", border: "1.5px solid var(--color-border)", borderRadius: "8px", backgroundColor: "var(--color-surface)", color: "var(--color-text)", outline: "none" };
const tas = { display: "block", width: "100%", padding: "0.75rem 1rem", fontSize: "0.95rem", fontFamily: "Georgia, 'Times New Roman', serif", border: "1.5px solid var(--color-border)", borderRadius: "8px", backgroundColor: "var(--color-surface)", color: "var(--color-text)", outline: "none", resize: "vertical" };