'use client';

import React, { useState, useMemo } from 'react';

/**
 * Standard Ishihara Color Vision Plates for EPS-TOPIK Medical Screening
 */
const ISHIHARA_PLATES = [
  { id: 1, expected: "12", isDemo: true, hint: "Everyone can see 12", bgTheme: "orange-gray", numTheme: "green" },
  { id: 2, expected: "8", deficientSees: "3", hint: "Normal vision sees 8", bgTheme: "green-yellow", numTheme: "orange" },
  { id: 3, expected: "6", deficientSees: "5", hint: "Normal vision sees 6", bgTheme: "green-yellow", numTheme: "orange" },
  { id: 4, expected: "29", deficientSees: "70", hint: "Normal vision sees 29", bgTheme: "green-yellow", numTheme: "orange" },
  { id: 5, expected: "57", deficientSees: "35", hint: "Normal vision sees 57", bgTheme: "green-yellow", numTheme: "orange" },
  { id: 6, expected: "5", deficientSees: "2", hint: "Normal vision sees 5", bgTheme: "orange-brown", numTheme: "green" },
  { id: 7, expected: "3", deficientSees: "5", hint: "Normal vision sees 3", bgTheme: "orange-brown", numTheme: "green" },
  { id: 8, expected: "15", deficientSees: "17", hint: "Normal vision sees 15", bgTheme: "orange-brown", numTheme: "green" },
  { id: 9, expected: "74", deficientSees: "21", hint: "Normal vision sees 74", bgTheme: "green-yellow", numTheme: "orange" },
  { id: 10, expected: "2", deficientSees: "None", hint: "Normal vision sees 2", bgTheme: "brown-yellow", numTheme: "green" },
  { id: 11, expected: "6", deficientSees: "None", hint: "Normal vision sees 6", bgTheme: "brown-yellow", numTheme: "green" },
  { id: 12, expected: "97", deficientSees: "None", hint: "Normal vision sees 97", bgTheme: "green-yellow", numTheme: "orange" },
  { id: 13, expected: "45", deficientSees: "None", hint: "Normal vision sees 45", bgTheme: "green-yellow", numTheme: "orange" },
  { id: 14, expected: "16", deficientSees: "None", hint: "Normal vision sees 16", bgTheme: "orange-brown", numTheme: "green" },
  { id: 15, expected: "73", deficientSees: "None", hint: "Normal vision sees 73", bgTheme: "green-yellow", numTheme: "orange" }
];

// Color palettes for authentic Ishihara plates
const THEME_COLORS = {
  "orange-gray": {
    bg: ["#94a3b8", "#cbd5e1", "#64748b", "#a1a1aa", "#d4d4d8", "#78716c"],
    num: ["#ea580c", "#f97316", "#c2410c", "#fb923c", "#dc2626", "#e11d48"]
  },
  "green-yellow": {
    bg: ["#84cc16", "#65a30d", "#a3e635", "#4d7c0f", "#eab308", "#ca8a04", "#854d0e"],
    num: ["#ef4444", "#dc2626", "#ea580c", "#f87171", "#b91c1c", "#fb923c"]
  },
  "orange-brown": {
    bg: ["#d97706", "#b45309", "#ea580c", "#c2410c", "#f59e0b", "#9a3412"],
    num: ["#16a34a", "#15803d", "#22c55e", "#166534", "#4ade80", "#059669"]
  },
  "brown-yellow": {
    bg: ["#a16207", "#ca8a04", "#854d0e", "#d97706", "#eab308", "#713f12"],
    num: ["#10b981", "#059669", "#047857", "#34d399", "#0f766e"]
  }
};

/**
 * Digit point definitions for 7x5 dot matrix numbers
 */
const DIGIT_MATRICES = {
  "0": [
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1]
  ],
  "1": [
    [0,0,1,0,0],
    [0,1,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,1,1,0]
  ],
  "2": [
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1]
  ],
  "3": [
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [0,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,1,1,1,1]
  ],
  "4": [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [0,0,0,0,1]
  ],
  "5": [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,1,1,1,1]
  ],
  "6": [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1]
  ],
  "7": [
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0]
  ],
  "8": [
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1]
  ],
  "9": [
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,1,1,1,1]
  ]
};

/**
 * Deterministic pseudo-random helper
 */
function pseudoRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * IshiharaPlate Component: Renders authentic dotted plate with embedded number
 */
function IshiharaPlate({ plate, size = 300 }) {
  const dots = useMemo(() => {
    const prng = pseudoRandom(plate.id * 883 + 42);
    const result = [];
    const radius = size / 2;
    const center = radius;
    const digits = plate.expected.split("");

    const theme = THEME_COLORS[plate.bgTheme] || THEME_COLORS["green-yellow"];

    // Check if point (x, y) falls on a digit pixel
    const isNumberDot = (x, y) => {
      const relY = (y - (center - 60)) / 120; // 0..1 in height
      if (relY < 0 || relY > 1) return false;
      const row = Math.floor(relY * 7);
      if (row < 0 || row > 6) return false;

      const numDigits = digits.length;
      const totalW = numDigits === 1 ? 65 : 120;
      const startX = center - totalW / 2;
      const relX = x - startX;
      if (relX < 0 || relX > totalW) return false;

      let digitIdx = 0;
      let inDigitX = relX;
      if (numDigits === 2) {
        if (relX < 55) {
          digitIdx = 0;
          inDigitX = relX;
        } else if (relX > 65) {
          digitIdx = 1;
          inDigitX = relX - 65;
        } else {
          return false; // space between digits
        }
      }

      const col = Math.floor((inDigitX / 55) * 5);
      if (col < 0 || col > 4) return false;

      const d = digits[digitIdx];
      const mat = DIGIT_MATRICES[d];
      if (!mat) return false;
      return mat[row]?.[col] === 1;
    };

    // Generate concentric rings of dots
    const numRings = 16;
    for (let r = 1; r <= numRings; r++) {
      const ringRadius = (r / numRings) * (radius - 14);
      const circumference = 2 * Math.PI * ringRadius;
      const dotCount = Math.max(6, Math.floor(circumference / 13));

      for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * 2 * Math.PI + (prng() * 0.2);
        const jitterR = ringRadius + (prng() - 0.5) * 7;
        const x = center + jitterR * Math.cos(angle);
        const y = center + jitterR * Math.sin(angle);

        // Distance from center
        const dist = Math.hypot(x - center, y - center);
        if (dist > radius - 10) continue;

        const onNum = isNumberDot(x, y);
        const colors = onNum ? theme.num : theme.bg;
        const color = colors[Math.floor(prng() * colors.length)];
        const dotRadius = 3.5 + prng() * 4.5;

        result.push({
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
          r: Math.round(dotRadius * 10) / 10,
          color,
          onNum
        });
      }
    }

    return result;
  }, [plate, size]);

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: "#0f172a",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25), inset 0 0 15px rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "6px",
      margin: "0 auto"
    }}>
      <svg width={size - 12} height={size - 12} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={(size / 2) - 2} fill="#1e293b" />
        {dots.map((d, idx) => (
          <circle
            key={idx}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill={d.color}
            opacity={0.92}
          />
        ))}
      </svg>
    </div>
  );
}

export default function ColorVisionSection({ onBackToHome }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [inputVal, setInputVal] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const currentPlate = ISHIHARA_PLATES[currentIndex];
  const totalPlates = ISHIHARA_PLATES.length;

  const handleSelectOption = (val) => {
    const updated = { ...userAnswers, [currentPlate.id]: val };
    setUserAnswers(updated);
    setInputVal("");

    if (currentIndex < totalPlates - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleNextWithInput = () => {
    if (!inputVal.trim()) return;
    handleSelectOption(inputVal.trim());
  };

  const handleRestart = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setInputVal("");
    setIsCompleted(false);
  };

  // Evaluation
  const score = useMemo(() => {
    let correct = 0;
    ISHIHARA_PLATES.forEach((p) => {
      if (userAnswers[p.id] === p.expected) {
        correct++;
      }
    });
    return correct;
  }, [userAnswers]);

  const passed = score >= 13; // 13+ out of 15 is standard pass criteria for EPS-TOPIK

  // Quick multiple choice options for current plate
  const options = useMemo(() => {
    const opts = [currentPlate.expected];
    if (currentPlate.deficientSees && currentPlate.deficientSees !== "None" && !opts.includes(currentPlate.deficientSees)) {
      opts.push(currentPlate.deficientSees);
    }
    const distractors = ["12", "8", "6", "5", "3", "74", "29", "2", "45", "97", "16"];
    for (const d of distractors) {
      if (!opts.includes(d) && opts.length < 4) {
        opts.push(d);
      }
    }
    // Shuffle options based on plate id
    return opts.sort();
  }, [currentPlate]);

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "16px", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "18px"
      }}>
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              border: "1px solid #bfdbfe",
              padding: "6px 14px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <span>⬅</span> Home
          </button>
        )}
        <div style={{ textAlign: "center", flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
            Color Vision Test (색각 검사)
          </h2>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            Official Ishihara Assessment for EPS-TOPIK Medical
          </span>
        </div>
      </div>

      {!isCompleted ? (
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "20px 16px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
          textAlign: "center"
        }}>
          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", fontSize: "12px", fontWeight: "700", color: "#475569" }}>
            <span>Plate {currentIndex + 1} of {totalPlates}</span>
            <span style={{ color: "#2563eb" }}>{Math.round(((currentIndex + 1) / totalPlates) * 100)}%</span>
          </div>
          <div style={{ width: "100%", height: "6px", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden", marginBottom: "20px" }}>
            <div style={{
              width: `${((currentIndex + 1) / totalPlates) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #38bdf8 0%, #2563eb 100%)",
              transition: "width 0.25s ease"
            }} />
          </div>

          <p style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>
            What number do you see in the circle below?
          </p>

          {/* Dotted Ishihara Plate */}
          <div style={{ marginBottom: "22px" }}>
            <IshiharaPlate plate={currentPlate} size={280} />
          </div>

          {/* Quick Option Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", maxWidth: "380px", margin: "0 auto 16px auto" }}>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelectOption(opt)}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "2px solid #93c5fd",
                  background: "#eff6ff",
                  color: "#1e40af",
                  fontSize: "18px",
                  fontWeight: "800",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: "0 2px 6px rgba(37,99,235,0.12)"
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Manual input & Unreadable button */}
          <div style={{ display: "flex", gap: "8px", maxWidth: "380px", margin: "0 auto" }}>
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Or type number..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleNextWithInput()}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                fontWeight: "600",
                textAlign: "center"
              }}
            />
            <button
              type="button"
              onClick={handleNextWithInput}
              disabled={!inputVal.trim()}
              style={{
                backgroundColor: inputVal.trim() ? "#2563eb" : "#cbd5e1",
                color: "#ffffff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: inputVal.trim() ? "pointer" : "not-allowed"
              }}
            >
              Next ▶
            </button>
            <button
              type="button"
              onClick={() => handleSelectOption("Nothing")}
              style={{
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #fca5a5",
                padding: "10px 14px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Cannot See
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "24px 20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e2e8f0",
          textAlign: "center"
        }}>
          <div style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: passed ? "#dcfce7" : "#fee2e2",
            color: passed ? "#16a34a" : "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            margin: "0 auto 14px auto"
          }}>
            {passed ? "✓" : "⚠"}
          </div>

          <h3 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: "800", color: passed ? "#166534" : "#991b1b" }}>
            {passed ? "Normal Color Vision (정상 색각)" : "Color Vision Deficiency Detected"}
          </h3>
          <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#475569" }}>
            {passed
              ? "Congratulations! You have passed the EPS-TOPIK Ishihara Color Vision Standard."
              : "Review with an ophthalmologist. EPS-TOPIK medical examination strictly tests for red-green color blindness."}
          </p>

          <div style={{
            display: "inline-block",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "12px 28px",
            marginBottom: "24px"
          }}>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Your Score</div>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", marginTop: "2px" }}>
              {score} / {totalPlates}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: passed ? "#15803d" : "#b91c1c", marginTop: "4px" }}>
              {passed ? "ELIGIBLE FOR EPS-TOPIK" : "FURTHER MEDICAL CHECK RECOMMENDED"}
            </div>
          </div>

          {/* Breakdown table */}
          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#1e293b", fontWeight: "700" }}>
              Plate by Plate Breakdown:
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "8px" }}>
              {ISHIHARA_PLATES.map((p) => {
                const ans = userAnswers[p.id];
                const isCorrect = ans === p.expected;
                return (
                  <div
                    key={p.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: `1px solid ${isCorrect ? "#86efac" : "#fca5a5"}`,
                      backgroundColor: isCorrect ? "#f0fdf4" : "#fef2f2",
                      fontSize: "12px"
                    }}
                  >
                    <div style={{ fontWeight: "700", color: "#334155" }}>Plate #{p.id}</div>
                    <div style={{ color: isCorrect ? "#166534" : "#991b1b", marginTop: "2px" }}>
                      Seen: <strong>{ans || "—"}</strong>
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>
                      Correct: <strong>{p.expected}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRestart}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              padding: "10px 24px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
            }}
          >
            ↻ Retest Color Vision
          </button>
        </div>
      )}
    </div>
  );
}

