import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK = {
  user: { name: "Marcus", level: 14, xp: 2340, xpNext: 3000, streak: 21, avatar: "M" },
  today: { date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) },
  readiness: 82,
  calories: { consumed: 2140, goal: 2800, protein: 168, proteinGoal: 220, carbs: 210, carbsGoal: 280, fat: 72, fatGoal: 85 },
  water: { consumed: 72, goal: 128 },
  sleep: { hours: 7.2, score: 78, bedtime: "10:48 PM", quality: "Good" },
  weight: { current: 187.4, goal: 180, change: -0.6 },
  workout: { name: "Push Day", done: false, exercises: ["Bench Press", "Incline DB", "OHP", "Lateral Raises", "Tricep Pushdown"], pr: "Bench — 225×5" },
  habits: [
    { id: 1, name: "Read Bible", icon: "✝", done: true, streak: 21 },
    { id: 2, name: "Pray", icon: "🙏", done: true, streak: 21 },
    { id: 3, name: "Vitamins", icon: "💊", done: true, streak: 9 },
    { id: 4, name: "Stretch", icon: "🧘", done: false, streak: 4 },
    { id: 5, name: "Journal", icon: "📓", done: false, streak: 0 },
    { id: 6, name: "Skin Care", icon: "✨", done: false, streak: 6 },
    { id: 7, name: "No Soda", icon: "🚫", done: true, streak: 14 },
    { id: 8, name: "8h Sleep", icon: "🌙", done: false, streak: 2 },
  ],
  quote: "Discipline is the bridge between goals and accomplishment.",
  meals: [
    { name: "Breakfast", items: ["4 Eggs", "Oatmeal", "Banana"], cal: 520, protein: 42 },
    { name: "Lunch", items: ["Chicken Rice Bowl", "Greek Yogurt"], cal: 780, protein: 68 },
    { name: "Pre-Workout", items: ["Protein Shake", "Apple"], cal: 280, protein: 30 },
  ],
  weekProgress: [
    { day: "M", cal: 2650, workout: true },
    { day: "T", cal: 2200, workout: true },
    { day: "W", cal: 2800, workout: false },
    { day: "T", cal: 2500, workout: true },
    { day: "F", cal: 2140, workout: false },
    { day: "S", cal: 0, workout: false },
    { day: "S", cal: 0, workout: false },
  ],
};

const SCREENS = ["Dashboard", "Workout", "Nutrition", "Habits", "Body", "AI Coach"];
const SCREEN_ICONS = ["⬡", "◈", "◉", "◎", "○", "✦"];

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("Dashboard");
  const [habits, setHabits] = useState(MOCK.habits);
  const [workoutDone, setWorkoutDone] = useState(false);
  const [waterOz, setWaterOz] = useState(MOCK.water.consumed);
  const [aiMsg, setAiMsg] = useState("");
  const [aiResp, setAiResp] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", text: "Hey Marcus 👊 I'm your AI coach. Ask me anything — workouts, nutrition, recovery, goals. I know your data." }
  ]);
  const chatRef = useRef(null);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [chatHistory]);

  const toggleHabit = (id) => setHabits(h => h.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const habitsDone = habits.filter(h => h.done).length;

  const sendAI = async () => {
    if (!aiMsg.trim()) return;
    const userMsg = aiMsg;
    setAiMsg("");
    setChatHistory(h => [...h, { role: "user", text: userMsg }]);
    setAiLoading(true);

    const systemData = `User: Marcus, Level 14, 21-day streak. Today: Push Day (not done). Calories: 2140/2800. Protein: 168/220g. Sleep: 7.2h score 78. Weight: 187.4 lbs (goal 180). Habits done: ${habitsDone}/8. Water: ${waterOz}/128oz. Recent PRs: Bench 225×5. Last leg day: 3 days ago.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are APEX AI, a premium fitness and life coach inside a health tracking app. You are direct, motivating, and data-driven. You speak like a real coach — not overly formal. You have access to the user's live data: ${systemData}. Keep responses concise (2-4 sentences usually). Use their name occasionally. Be specific with numbers from their data.`,
          messages: [
            ...chatHistory.filter(m => m.role !== "assistant" || chatHistory.indexOf(m) > 0).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text })),
            { role: "user", content: userMsg }
          ]
        })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text || "Try again.";
      setChatHistory(h => [...h, { role: "assistant", text }]);
    } catch {
      setChatHistory(h => [...h, { role: "assistant", text: "Connection error. Try again." }]);
    }
    setAiLoading(false);
  };

  return (
    <div style={s.root}>
      {/* BG texture */}
      <div style={s.bgNoise} />

      {/* Header */}
      <header style={s.header}>
        <div>
          <div style={s.headerGreeting}>Good {getGreeting()},</div>
          <div style={s.headerName}>{MOCK.user.name} <span style={s.streakBadge}>🔥 {MOCK.user.streak}</span></div>
        </div>
        <div style={s.xpPill}>
          <div style={s.xpLabel}>LVL {MOCK.user.level}</div>
          <div style={s.xpBar}>
            <div style={{ ...s.xpFill, width: `${(MOCK.user.xp / MOCK.user.xpNext) * 100}%` }} />
          </div>
          <div style={s.xpCount}>{MOCK.user.xp}/{MOCK.user.xpNext}</div>
        </div>
      </header>

      {/* Content */}
      <main style={s.main}>
        {screen === "Dashboard" && <Dashboard habits={habits} toggleHabit={toggleHabit} habitsDone={habitsDone} workoutDone={workoutDone} setWorkoutDone={setWorkoutDone} waterOz={waterOz} setWaterOz={setWaterOz} />}
        {screen === "Workout" && <WorkoutScreen workoutDone={workoutDone} setWorkoutDone={setWorkoutDone} />}
        {screen === "Nutrition" && <NutritionScreen waterOz={waterOz} setWaterOz={setWaterOz} />}
        {screen === "Habits" && <HabitsScreen habits={habits} toggleHabit={toggleHabit} habitsDone={habitsDone} />}
        {screen === "Body" && <BodyScreen />}
        {screen === "AI Coach" && <AIScreen chatHistory={chatHistory} aiMsg={aiMsg} setAiMsg={setAiMsg} sendAI={sendAI} aiLoading={aiLoading} chatRef={chatRef} />}
      </main>

      {/* Bottom Nav */}
      <nav style={s.nav}>
        {SCREENS.map((sc, i) => (
          <button key={sc} onClick={() => setScreen(sc)} style={{ ...s.navBtn, ...(screen === sc ? s.navActive : {}) }}>
            <span style={s.navIcon}>{SCREEN_ICONS[i]}</span>
            <span style={s.navLabel}>{sc === "AI Coach" ? "AI" : sc}</span>
          </button>
        ))}
      </nav>

      <style>{CSS}</style>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ habits, toggleHabit, habitsDone, workoutDone, setWorkoutDone, waterOz, setWaterOz }) {
  return (
    <div style={s.screen}>
      {/* Quote */}
      <div style={s.quoteCard}>
        <div style={s.quoteIcon}>"</div>
        <div style={s.quoteText}>{MOCK.quote}</div>
        <div style={s.quoteDate}>{MOCK.today.date}</div>
      </div>

      {/* Readiness */}
      <div style={s.row}>
        <ReadinessRing score={MOCK.readiness} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <MiniStat label="Sleep" value={`${MOCK.sleep.hours}h`} sub={`Score ${MOCK.sleep.score}`} color="#7c6fff" />
          <MiniStat label="Weight" value={`${MOCK.weight.current} lbs`} sub={`${MOCK.weight.change > 0 ? "+" : ""}${MOCK.weight.change} today`} color="#ff6f6f" />
          <MiniStat label="Streak" value={`${MOCK.user.streak} days`} sub="🔥 Keep going" color="#ffb347" />
        </div>
      </div>

      {/* Calories */}
      <Card title="Today's Nutrition" accent="#4fffb0">
        <div style={s.calRow}>
          <div>
            <div style={s.bigNum}>{MOCK.calories.consumed}</div>
            <div style={s.bigSub}>of {MOCK.calories.goal} kcal</div>
          </div>
          <MacroRing p={MOCK.calories.protein} c={MOCK.calories.carbs} f={MOCK.calories.fat} />
        </div>
        <MacroBar label="Protein" val={MOCK.calories.protein} goal={MOCK.calories.proteinGoal} color="#4fffb0" unit="g" />
        <MacroBar label="Carbs" val={MOCK.calories.carbs} goal={MOCK.calories.carbsGoal} color="#ffb347" unit="g" />
        <MacroBar label="Fat" val={MOCK.calories.fat} goal={MOCK.calories.fatGoal} color="#ff6f6f" unit="g" />
      </Card>

      {/* Water */}
      <Card title="Hydration" accent="#4fc3ff">
        <div style={s.waterRow}>
          <div style={s.waterInfo}>
            <span style={s.waterNum}>{waterOz}</span>
            <span style={s.waterUnit}>/ {MOCK.water.goal} oz</span>
          </div>
          <div style={s.waterBtns}>
            {[8, 16, 32].map(oz => (
              <button key={oz} onClick={() => setWaterOz(w => Math.min(w + oz, MOCK.water.goal))} style={s.waterBtn}>+{oz}oz</button>
            ))}
          </div>
        </div>
        <div style={s.waterBar}>
          <div style={{ ...s.waterFill, width: `${(waterOz / MOCK.water.goal) * 100}%` }} />
        </div>
      </Card>

      {/* Workout */}
      <Card title="Today's Workout" accent="#7c6fff">
        <div style={s.workoutHeader}>
          <div>
            <div style={s.workoutName}>{MOCK.workout.name}</div>
            <div style={s.workoutSub}>{MOCK.workout.exercises.slice(0, 3).join(" · ")} +{MOCK.workout.exercises.length - 3} more</div>
            {MOCK.workout.pr && <div style={s.prBadge}>🏆 PR: {MOCK.workout.pr}</div>}
          </div>
          <button onClick={() => setWorkoutDone(d => !d)} style={{ ...s.startBtn, background: workoutDone ? "#2a2a2a" : "#7c6fff" }}>
            {workoutDone ? "✓ Done" : "Start"}
          </button>
        </div>
      </Card>

      {/* Habits */}
      <Card title={`Habits — ${habitsDone}/${habits.length}`} accent="#ffb347">
        <div style={s.habitsGrid}>
          {habits.map(h => (
            <button key={h.id} onClick={() => toggleHabit(h.id)} style={{ ...s.habitChip, ...(h.done ? s.habitDone : {}) }}>
              <span>{h.icon}</span>
              <span style={s.habitName}>{h.name}</span>
              {h.streak > 0 && <span style={s.habitStreak}>{h.streak}🔥</span>}
            </button>
          ))}
        </div>
      </Card>

      {/* Week overview */}
      <Card title="This Week" accent="#ff6f6f">
        <div style={s.weekRow}>
          {MOCK.weekProgress.map((d, i) => (
            <div key={i} style={s.weekDay}>
              <div style={{ ...s.weekDot, background: d.workout ? "#4fffb0" : d.cal > 0 ? "#ffb347" : "#2a2a2a" }} />
              <div style={s.weekLabel}>{d.day}</div>
            </div>
          ))}
        </div>
        <div style={s.weekLegend}>
          <span><span style={{ color: "#4fffb0" }}>●</span> Workout</span>
          <span><span style={{ color: "#ffb347" }}>●</span> Rest day</span>
          <span><span style={{ color: "#2a2a2a", border: "1px solid #333" }}>●</span> Upcoming</span>
        </div>
      </Card>
    </div>
  );
}

// ─── WORKOUT ──────────────────────────────────────────────────────────────────
function WorkoutScreen({ workoutDone, setWorkoutDone }) {
  const [timer, setTimer] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [sets, setSets] = useState({
    "Bench Press": [{ w: 135, r: 10, done: false }, { w: 185, r: 8, done: false }, { w: 225, r: 5, done: false }],
    "Incline DB Press": [{ w: 70, r: 10, done: false }, { w: 75, r: 8, done: false }],
    "Overhead Press": [{ w: 95, r: 10, done: false }, { w: 115, r: 8, done: false }],
  });
  const [activeEx, setActiveEx] = useState("Bench Press");

  useEffect(() => {
    let interval;
    if (timerOn) interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerOn]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const toggleSet = (ex, i) => {
    setSets(prev => ({ ...prev, [ex]: prev[ex].map((s, j) => j === i ? { ...s, done: !s.done } : s) }));
    setTimer(0);
    setTimerOn(false);
  };

  const splits = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body", "Cardio"];

  return (
    <div style={s.screen}>
      <div style={s.splitScroll}>
        {splits.map(sp => (
          <button key={sp} style={{ ...s.splitChip, ...(sp === "Push" ? s.splitActive : {}) }}>{sp}</button>
        ))}
      </div>

      <Card title="Push Day — Today" accent="#7c6fff">
        <div style={s.timerBox}>
          <div style={s.timerDisplay}>{fmt(timer)}</div>
          <div style={s.timerBtns}>
            <button style={s.timerBtn} onClick={() => setTimerOn(t => !t)}>{timerOn ? "Pause" : "Start"}</button>
            <button style={{ ...s.timerBtn, background: "#1a1a1a" }} onClick={() => { setTimer(0); setTimerOn(false); }}>Reset</button>
          </div>
        </div>
      </Card>

      {Object.entries(sets).map(([ex, exSets]) => (
        <Card key={ex} title={ex} accent={activeEx === ex ? "#7c6fff" : "#2a2a2a"}>
          <div style={s.setTable}>
            <div style={s.setHead}>
              <span>Set</span><span>Weight</span><span>Reps</span><span>Done</span>
            </div>
            {exSets.map((st, i) => (
              <div key={i} style={{ ...s.setRow, ...(st.done ? s.setDone : {}) }}>
                <span style={s.setNum}>{i + 1}</span>
                <span>{st.w} lbs</span>
                <span>{st.r}</span>
                <button onClick={() => { toggleSet(ex, i); setActiveEx(ex); }} style={{ ...s.checkBtn, background: st.done ? "#4fffb0" : "#1a1a1a", color: st.done ? "#000" : "#666" }}>
                  {st.done ? "✓" : "○"}
                </button>
              </div>
            ))}
          </div>
          <div style={s.prNote}>PR: 225×5 · Last: 3 weeks ago</div>
        </Card>
      ))}

      <button onClick={() => setWorkoutDone(d => !d)} style={{ ...s.bigBtn, background: workoutDone ? "#2a2a2a" : "#7c6fff", marginBottom: 20 }}>
        {workoutDone ? "✓ Workout Complete" : "Finish Workout"}
      </button>
    </div>
  );
}

// ─── NUTRITION ────────────────────────────────────────────────────────────────
function NutritionScreen({ waterOz, setWaterOz }) {
  const [logInput, setLogInput] = useState("");
  const [aiEstimate, setAiEstimate] = useState(null);
  const [loading, setLoading] = useState(false);

  const estimateFood = async () => {
    if (!logInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: "You are a nutrition AI. The user describes food they ate. Return ONLY valid JSON with keys: calories (number), protein (number in g), carbs (number in g), fat (number in g), notes (short string). No markdown, no preamble.",
          messages: [{ role: "user", content: `Estimate macros for: ${logInput}` }]
        })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text || "{}";
      setAiEstimate(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch {
      setAiEstimate({ calories: "?", protein: "?", carbs: "?", fat: "?", notes: "Could not estimate." });
    }
    setLoading(false);
  };

  return (
    <div style={s.screen}>
      <Card title="AI Food Logger" accent="#4fffb0">
        <div style={s.aiNote}>Describe any meal — AI estimates your macros instantly</div>
        <textarea
          style={s.foodInput}
          placeholder={"e.g. \"Chipotle bowl with steak, white rice, guac, cheese\" or \"3 scrambled eggs with toast\""}
          value={logInput}
          onChange={e => setLogInput(e.target.value)}
          rows={3}
        />
        <button onClick={estimateFood} disabled={loading} style={{ ...s.bigBtn, background: "#4fffb0", color: "#000", marginTop: 10 }}>
          {loading ? "Estimating..." : "✦ Estimate Macros"}
        </button>
        {aiEstimate && (
          <div style={s.estimateBox}>
            <div style={s.estimateRow}>
              <EstStat label="Calories" val={aiEstimate.calories} color="#ffb347" unit="kcal" />
              <EstStat label="Protein" val={aiEstimate.protein} color="#4fffb0" unit="g" />
              <EstStat label="Carbs" val={aiEstimate.carbs} color="#4fc3ff" unit="g" />
              <EstStat label="Fat" val={aiEstimate.fat} color="#ff6f6f" unit="g" />
            </div>
            {aiEstimate.notes && <div style={s.estimateNote}>{aiEstimate.notes}</div>}
            <button style={{ ...s.bigBtn, background: "#4fffb0", color: "#000", marginTop: 10 }}>+ Add to Today</button>
          </div>
        )}
      </Card>

      <Card title="Today's Meals" accent="#4fc3ff">
        {MOCK.meals.map((m, i) => (
          <div key={i} style={s.mealItem}>
            <div style={s.mealName}>{m.name}</div>
            <div style={s.mealItems}>{m.items.join(", ")}</div>
            <div style={s.mealMacros}>{m.cal} kcal · {m.protein}g protein</div>
          </div>
        ))}
        <MacroBar label="Daily Protein" val={MOCK.calories.protein} goal={MOCK.calories.proteinGoal} color="#4fffb0" unit="g" />
        <MacroBar label="Daily Calories" val={MOCK.calories.consumed} goal={MOCK.calories.goal} color="#ffb347" unit="kcal" />
      </Card>

      <Card title="Hydration" accent="#4fc3ff">
        <div style={s.waterRow}>
          <div style={s.waterInfo}><span style={s.waterNum}>{waterOz}</span><span style={s.waterUnit}>/ {MOCK.water.goal} oz</span></div>
          <div style={s.waterBtns}>
            {[8, 16, 24, 32].map(oz => (
              <button key={oz} onClick={() => setWaterOz(w => Math.min(w + oz, 200))} style={s.waterBtn}>+{oz}</button>
            ))}
          </div>
        </div>
        <div style={s.waterBar}><div style={{ ...s.waterFill, width: `${(waterOz / MOCK.water.goal) * 100}%` }} /></div>
        <div style={s.drinkTypes}>
          {["☕ Coffee", "⚡ Energy", "🥤 Sports", "🍺 Alcohol", "🧃 Juice"].map(d => (
            <button key={d} style={s.drinkChip}>{d}</button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── HABITS ───────────────────────────────────────────────────────────────────
function HabitsScreen({ habits, toggleHabit, habitsDone }) {
  const pct = Math.round((habitsDone / habits.length) * 100);
  return (
    <div style={s.screen}>
      <Card title="Daily Score" accent="#ffb347">
        <div style={s.scoreRow}>
          <div style={s.bigScore}>{pct}%</div>
          <div style={{ flex: 1 }}>
            <div style={s.scoreBar}><div style={{ ...s.scoreFill, width: `${pct}%` }} /></div>
            <div style={s.scoreSub}>{habitsDone} of {habits.length} habits complete</div>
            <div style={s.scoreMsg}>{pct === 100 ? "🏆 Perfect day!" : pct >= 70 ? "💪 Strong day" : "Keep pushing"}</div>
          </div>
        </div>
      </Card>

      <Card title="Morning Routine" accent="#ffb347">
        {habits.slice(0, 4).map(h => (
          <HabitRow key={h.id} habit={h} toggle={() => toggleHabit(h.id)} />
        ))}
      </Card>

      <Card title="Evening Routine" accent="#7c6fff">
        {habits.slice(4).map(h => (
          <HabitRow key={h.id} habit={h} toggle={() => toggleHabit(h.id)} />
        ))}
      </Card>

      <Card title="Streak Leaderboard" accent="#4fffb0">
        {[...habits].sort((a, b) => b.streak - a.streak).slice(0, 5).map((h, i) => (
          <div key={h.id} style={s.leaderRow}>
            <span style={s.leaderRank}>#{i + 1}</span>
            <span>{h.icon}</span>
            <span style={{ flex: 1 }}>{h.name}</span>
            <span style={s.leaderStreak}>{h.streak} 🔥</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function HabitRow({ habit, toggle }) {
  return (
    <div style={s.habitRow} onClick={toggle}>
      <div style={{ ...s.habitCheck, background: habit.done ? "#4fffb0" : "transparent", borderColor: habit.done ? "#4fffb0" : "#333" }}>
        {habit.done && <span style={{ color: "#000", fontSize: 12, fontWeight: 700 }}>✓</span>}
      </div>
      <span style={{ fontSize: 18 }}>{habit.icon}</span>
      <span style={{ flex: 1, color: habit.done ? "#aaa" : "#eee", textDecoration: habit.done ? "line-through" : "none" }}>{habit.name}</span>
      {habit.streak > 0 && <span style={s.habitStreakTag}>{habit.streak}🔥</span>}
    </div>
  );
}

// ─── BODY ────────────────────────────────────────────────────────────────────
function BodyScreen() {
  const weights = [189, 188.6, 188.2, 187.8, 187.6, 187.4];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const min = 185, max = 191, range = max - min;

  return (
    <div style={s.screen}>
      <Card title="Weight Trend" accent="#ff6f6f">
        <div style={s.chartArea}>
          <svg viewBox="0 0 300 100" style={{ width: "100%", height: 100 }}>
            <defs>
              <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6f6f" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ff6f6f" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              points={weights.map((w, i) => `${(i / (weights.length - 1)) * 280 + 10},${100 - ((w - min) / range) * 80}`).join(" ")}
              fill="none" stroke="#ff6f6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          <div style={s.chartLabels}>{labels.map(l => <span key={l} style={s.chartLabel}>{l}</span>)}</div>
        </div>
        <div style={s.weightStats}>
          <div style={s.wStat}><div style={s.wVal}>187.4</div><div style={s.wLab}>Current</div></div>
          <div style={s.wStat}><div style={{ ...s.wVal, color: "#4fffb0" }}>-1.6</div><div style={s.wLab}>This week</div></div>
          <div style={s.wStat}><div style={s.wVal}>180</div><div style={s.wLab}>Goal</div></div>
          <div style={s.wStat}><div style={s.wVal}>7.4</div><div style={s.wLab}>To go</div></div>
        </div>
      </Card>

      <Card title="Measurements" accent="#4fc3ff">
        {[["Arms", "15.5 in", "+0.5"], ["Chest", "42 in", "+1.0"], ["Waist", "34 in", "-0.5"], ["Legs", "24 in", "+0.5"]].map(([k, v, d]) => (
          <div key={k} style={s.measureRow}>
            <span style={{ color: "#aaa" }}>{k}</span>
            <span style={{ fontWeight: 700 }}>{v}</span>
            <span style={{ color: d.startsWith("-") ? "#4fffb0" : "#ff6f6f", fontSize: 12 }}>{d}</span>
          </div>
        ))}
      </Card>

      <Card title="Recovery & Readiness" accent="#7c6fff">
        <div style={s.recoveryGrid}>
          {[["Soreness", "Moderate", "#ffb347"], ["Energy", "High", "#4fffb0"], ["Stress", "Low", "#4fffb0"], ["Mood", "Good", "#4fc3ff"]].map(([k, v, c]) => (
            <div key={k} style={s.recoveryItem}>
              <div style={{ ...s.recoveryVal, color: c }}>{v}</div>
              <div style={s.recoveryLab}>{k}</div>
            </div>
          ))}
        </div>
        <ReadinessRing score={MOCK.readiness} small />
      </Card>

      <Card title="Sleep History" accent="#7c6fff">
        {[["Mon", 7.5, "Good"], ["Tue", 6.8, "Fair"], ["Wed", 8.1, "Great"], ["Thu", 7.0, "Good"], ["Fri", 7.2, "Good"]].map(([day, h, q]) => (
          <div key={day} style={s.sleepRow}>
            <span style={{ color: "#666", width: 36 }}>{day}</span>
            <div style={s.sleepBar}><div style={{ ...s.sleepFill, width: `${(h / 9) * 100}%` }} /></div>
            <span style={{ width: 36 }}>{h}h</span>
            <span style={{ color: q === "Great" ? "#4fffb0" : q === "Good" ? "#4fc3ff" : "#ffb347", fontSize: 12 }}>{q}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── AI COACH ────────────────────────────────────────────────────────────────
function AIScreen({ chatHistory, aiMsg, setAiMsg, sendAI, aiLoading, chatRef }) {
  const suggestions = ["How's my protein today?", "Should I work out or rest?", "Optimize my sleep", "What should I eat tonight?"];
  return (
    <div style={{ ...s.screen, paddingBottom: 0 }}>
      <div style={s.aiHeader}>
        <div style={s.aiAvatar}>✦</div>
        <div>
          <div style={s.aiName}>APEX AI</div>
          <div style={s.aiSub}>Knows your data · Always on</div>
        </div>
        <div style={s.aiOnline} />
      </div>

      <div style={s.chatWrap} ref={chatRef}>
        {chatHistory.map((m, i) => (
          <div key={i} style={{ ...s.bubble, ...(m.role === "user" ? s.bubbleUser : s.bubbleAI) }}>
            {m.text}
          </div>
        ))}
        {aiLoading && <div style={{ ...s.bubble, ...s.bubbleAI, opacity: 0.6 }}>✦ thinking...</div>}
      </div>

      <div style={s.suggestRow}>
        {suggestions.map(q => (
          <button key={q} onClick={() => { setAiMsg(q); }} style={s.suggestChip}>{q}</button>
        ))}
      </div>

      <div style={s.chatInput}>
        <input
          style={s.chatTextInput}
          placeholder="Ask your coach..."
          value={aiMsg}
          onChange={e => setAiMsg(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendAI()}
        />
        <button onClick={sendAI} disabled={aiLoading} style={s.sendBtn}>↑</button>
      </div>
    </div>
  );
}

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────
function Card({ title, accent, children }) {
  return (
    <div style={{ ...s.card, borderLeftColor: accent }}>
      <div style={{ ...s.cardTitle, color: accent }}>{title}</div>
      {children}
    </div>
  );
}

function MacroBar({ label, val, goal, color, unit }) {
  const pct = Math.min((val / goal) * 100, 100);
  return (
    <div style={s.macroBarWrap}>
      <div style={s.macroBarLabel}>
        <span style={{ color: "#aaa" }}>{label}</span>
        <span style={{ color, fontSize: 12 }}>{val}/{goal}{unit}</span>
      </div>
      <div style={s.barTrack}><div style={{ ...s.barFill, width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

function MacroRing({ p, c, f }) {
  const total = p + c + f;
  const pPct = (p / total) * 100, cPct = (c / total) * 100;
  return (
    <div style={s.ring}>
      <svg viewBox="0 0 60 60" width="70" height="70">
        <circle cx="30" cy="30" r="24" fill="none" stroke="#1a1a1a" strokeWidth="8" />
        <circle cx="30" cy="30" r="24" fill="none" stroke="#4fffb0" strokeWidth="8"
          strokeDasharray={`${pPct * 1.508} 150.8`} strokeDashoffset="37.7" />
        <circle cx="30" cy="30" r="24" fill="none" stroke="#ffb347" strokeWidth="8"
          strokeDasharray={`${cPct * 1.508} 150.8`} strokeDashoffset={`${37.7 - pPct * 1.508}`} />
      </svg>
    </div>
  );
}

function ReadinessRing({ score, small }) {
  const r = small ? 28 : 44;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? "#4fffb0" : score >= 60 ? "#ffb347" : "#ff6f6f";
  const size = small ? 80 : 120;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a1a1a" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${(score / 100) * circ} ${circ}`}
          strokeDashoffset={circ / 4} strokeLinecap="round" />
        <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fill={color} fontSize={small ? 14 : 22} fontWeight="700">{score}</text>
      </svg>
      <div style={{ fontSize: 11, color: "#666", letterSpacing: 2 }}>READINESS</div>
    </div>
  );
}

function MiniStat({ label, value, sub, color }) {
  return (
    <div style={s.miniStat}>
      <div style={{ ...s.miniVal, color }}>{value}</div>
      <div style={s.miniLabel}>{label}</div>
      <div style={s.miniSub}>{sub}</div>
    </div>
  );
}

function EstStat({ label, val, color, unit }) {
  return (
    <div style={s.estStat}>
      <div style={{ ...s.estVal, color }}>{val}</div>
      <div style={s.estUnit}>{unit}</div>
      <div style={s.estLabel}>{label}</div>
    </div>
  );
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const BASE = "#0a0a0a";
const CARD = "#111111";
const BORDER = "#1e1e1e";

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: BASE, minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", overflowX: "hidden", color: "#eee" },
  bgNoise: { position: "fixed", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")", pointerEvents: "none", zIndex: 0 },
  header: { padding: "52px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "sticky", top: 0, background: `${BASE}ee`, backdropFilter: "blur(12px)", zIndex: 10, borderBottom: `1px solid ${BORDER}` },
  headerGreeting: { fontSize: 13, color: "#555", letterSpacing: 1 },
  headerName: { fontSize: 24, fontWeight: 700, letterSpacing: -0.5 },
  streakBadge: { fontSize: 16, marginLeft: 4 },
  xpPill: { background: "#161616", borderRadius: 10, padding: "8px 12px", minWidth: 110, border: `1px solid ${BORDER}` },
  xpLabel: { fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 4 },
  xpBar: { height: 4, background: "#1e1e1e", borderRadius: 2, marginBottom: 4 },
  xpFill: { height: "100%", background: "linear-gradient(90deg, #7c6fff, #4fffb0)", borderRadius: 2, transition: "width 0.5s" },
  xpCount: { fontSize: 10, color: "#555" },
  main: { padding: "0 0 80px", position: "relative", zIndex: 1 },
  screen: { display: "flex", flexDirection: "column", gap: 12, padding: "12px 14px" },
  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: `${BASE}f0`, backdropFilter: "blur(16px)", borderTop: `1px solid ${BORDER}`, display: "flex", padding: "8px 0 20px", zIndex: 20 },
  navBtn: { flex: 1, background: "none", border: "none", color: "#444", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "6px 0", transition: "color 0.2s" },
  navActive: { color: "#eee" },
  navIcon: { fontSize: 16 },
  navLabel: { fontSize: 9, letterSpacing: 1 },

  // Cards
  card: { background: CARD, borderRadius: 14, padding: "16px 16px", borderLeft: "2px solid transparent", animation: "fadeUp 0.3s ease" },
  cardTitle: { fontSize: 10, letterSpacing: 2.5, marginBottom: 12, fontWeight: 600 },

  // Quote
  quoteCard: { background: "linear-gradient(135deg, #161616, #111)", borderRadius: 14, padding: 18, border: `1px solid ${BORDER}`, position: "relative", overflow: "hidden" },
  quoteIcon: { fontSize: 48, color: "#1e1e1e", position: "absolute", top: 0, left: 10, fontFamily: "serif", lineHeight: 1 },
  quoteText: { fontSize: 14, lineHeight: 1.6, color: "#ccc", position: "relative" },
  quoteDate: { fontSize: 11, color: "#555", marginTop: 8, letterSpacing: 1 },

  // Row
  row: { display: "flex", gap: 10 },

  // Mini stats
  miniStat: { background: CARD, borderRadius: 12, padding: "12px 14px", flex: 1, border: `1px solid ${BORDER}` },
  miniVal: { fontSize: 18, fontWeight: 700, letterSpacing: -0.5 },
  miniLabel: { fontSize: 9, color: "#555", letterSpacing: 2, marginTop: 2 },
  miniSub: { fontSize: 11, color: "#666", marginTop: 2 },

  // Calories
  calRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  bigNum: { fontSize: 36, fontWeight: 700, letterSpacing: -2 },
  bigSub: { fontSize: 12, color: "#666" },
  ring: { display: "flex", alignItems: "center", justifyContent: "center" },

  // Macro bar
  macroBarWrap: { marginBottom: 8 },
  macroBarLabel: { display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 },
  barTrack: { height: 5, background: "#1e1e1e", borderRadius: 3 },
  barFill: { height: "100%", borderRadius: 3, transition: "width 0.5s" },

  // Water
  waterRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  waterInfo: { display: "flex", alignItems: "baseline", gap: 4 },
  waterNum: { fontSize: 32, fontWeight: 700, letterSpacing: -1 },
  waterUnit: { fontSize: 13, color: "#666" },
  waterBtns: { display: "flex", gap: 6 },
  waterBtn: { background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#4fc3ff", padding: "6px 10px", fontSize: 12, cursor: "pointer" },
  waterBar: { height: 6, background: "#1a1a1a", borderRadius: 3 },
  waterFill: { height: "100%", background: "linear-gradient(90deg, #4fc3ff, #7c6fff)", borderRadius: 3, transition: "width 0.4s" },

  // Workout card
  workoutHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  workoutName: { fontSize: 20, fontWeight: 700, letterSpacing: -0.5 },
  workoutSub: { fontSize: 12, color: "#666", marginTop: 4 },
  prBadge: { fontSize: 11, color: "#ffb347", marginTop: 6 },
  startBtn: { borderRadius: 10, border: "none", padding: "10px 20px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 },

  // Habits grid
  habitsGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  habitChip: { display: "flex", alignItems: "center", gap: 6, background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "7px 12px", cursor: "pointer", fontSize: 13, color: "#888", transition: "all 0.2s" },
  habitDone: { background: "#1a2a1a", borderColor: "#4fffb0", color: "#4fffb0" },
  habitName: { fontSize: 12 },
  habitStreak: { fontSize: 10, color: "#ffb347" },

  // Week
  weekRow: { display: "flex", justifyContent: "space-around", padding: "8px 0" },
  weekDay: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  weekDot: { width: 28, height: 28, borderRadius: "50%", border: `1px solid #2a2a2a` },
  weekLabel: { fontSize: 11, color: "#555" },
  weekLegend: { display: "flex", gap: 16, justifyContent: "center", fontSize: 11, color: "#555", marginTop: 8, flexWrap: "wrap" },

  // Workout screen
  splitScroll: { display: "flex", gap: 8, overflowX: "auto", padding: "4px 0", scrollbarWidth: "none" },
  splitChip: { background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "8px 16px", color: "#888", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  splitActive: { background: "#1e1a33", borderColor: "#7c6fff", color: "#7c6fff" },
  timerBox: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  timerDisplay: { fontSize: 36, fontWeight: 700, letterSpacing: -1, fontVariantNumeric: "tabular-nums" },
  timerBtns: { display: "flex", gap: 8 },
  timerBtn: { background: "#7c6fff", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  setTable: { display: "flex", flexDirection: "column", gap: 6 },
  setHead: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#555", letterSpacing: 2, paddingBottom: 6, borderBottom: `1px solid ${BORDER}` },
  setRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14 },
  setDone: { opacity: 0.5 },
  setNum: { width: 20, color: "#555" },
  checkBtn: { width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 },
  prNote: { fontSize: 11, color: "#555", marginTop: 8 },
  bigBtn: { width: "100%", padding: 14, borderRadius: 12, border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", letterSpacing: 0.5 },

  // Nutrition
  aiNote: { fontSize: 12, color: "#666", marginBottom: 10 },
  foodInput: { width: "100%", background: "#161616", border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12, color: "#eee", fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit" },
  estimateBox: { marginTop: 12, background: "#161616", borderRadius: 10, padding: 14, border: `1px solid #2a2a2a`, animation: "fadeUp 0.3s" },
  estimateRow: { display: "flex", justifyContent: "space-around", marginBottom: 8 },
  estimateNote: { fontSize: 12, color: "#666", textAlign: "center" },
  estStat: { textAlign: "center" },
  estVal: { fontSize: 22, fontWeight: 700, letterSpacing: -1 },
  estUnit: { fontSize: 10, color: "#666" },
  estLabel: { fontSize: 10, color: "#555", letterSpacing: 1 },
  mealItem: { paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${BORDER}` },
  mealName: { fontSize: 12, color: "#666", letterSpacing: 1, marginBottom: 4 },
  mealItems: { fontSize: 14, marginBottom: 4 },
  mealMacros: { fontSize: 12, color: "#555" },
  drinkTypes: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 },
  drinkChip: { background: "#161616", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "6px 12px", fontSize: 12, color: "#888", cursor: "pointer" },

  // Habits screen
  scoreRow: { display: "flex", alignItems: "center", gap: 16 },
  bigScore: { fontSize: 48, fontWeight: 700, letterSpacing: -2, color: "#ffb347" },
  scoreBar: { height: 6, background: "#1a1a1a", borderRadius: 3, marginBottom: 8 },
  scoreFill: { height: "100%", background: "linear-gradient(90deg, #ffb347, #ff6f6f)", borderRadius: 3 },
  scoreSub: { fontSize: 12, color: "#666" },
  scoreMsg: { fontSize: 13, color: "#aaa", marginTop: 4 },
  habitRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${BORDER}`, cursor: "pointer" },
  habitCheck: { width: 22, height: 22, borderRadius: "50%", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  habitStreakTag: { fontSize: 11, color: "#ffb347", background: "#1a1500", borderRadius: 10, padding: "2px 8px" },
  leaderRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14 },
  leaderRank: { color: "#555", width: 24, fontSize: 12 },
  leaderStreak: { color: "#ffb347", fontSize: 13 },

  // Body
  chartArea: {},
  chartLabels: { display: "flex", justifyContent: "space-between", padding: "0 10px" },
  chartLabel: { fontSize: 10, color: "#555" },
  weightStats: { display: "flex", justifyContent: "space-around", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` },
  wStat: { textAlign: "center" },
  wVal: { fontSize: 20, fontWeight: 700 },
  wLab: { fontSize: 10, color: "#555", letterSpacing: 1 },
  measureRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14 },
  recoveryGrid: { display: "flex", justifyContent: "space-around", marginBottom: 16 },
  recoveryItem: { textAlign: "center" },
  recoveryVal: { fontSize: 14, fontWeight: 700 },
  recoveryLab: { fontSize: 10, color: "#555", letterSpacing: 1, marginTop: 2 },
  sleepRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 13 },
  sleepBar: { flex: 1, height: 5, background: "#1a1a1a", borderRadius: 3 },
  sleepFill: { height: "100%", background: "#7c6fff", borderRadius: 3 },

  // AI
  aiHeader: { display: "flex", alignItems: "center", gap: 12, padding: "16px 14px 8px", background: CARD, borderRadius: 14, margin: "0 0 12px" },
  aiAvatar: { width: 44, height: 44, background: "linear-gradient(135deg, #7c6fff, #4fffb0)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 },
  aiName: { fontSize: 16, fontWeight: 700 },
  aiSub: { fontSize: 11, color: "#666" },
  aiOnline: { width: 8, height: 8, borderRadius: "50%", background: "#4fffb0", marginLeft: "auto" },
  chatWrap: { flex: 1, overflowY: "auto", minHeight: 300, maxHeight: 380, display: "flex", flexDirection: "column", gap: 10, padding: "0 14px 10px", scrollBehavior: "smooth" },
  bubble: { maxWidth: "85%", padding: "12px 16px", borderRadius: 16, fontSize: 14, lineHeight: 1.6, animation: "fadeUp 0.25s ease" },
  bubbleAI: { background: CARD, border: `1px solid ${BORDER}`, alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleUser: { background: "#1e1a33", border: `1px solid #2a2450`, alignSelf: "flex-end", borderBottomRightRadius: 4, color: "#ccc" },
  suggestRow: { display: "flex", gap: 8, overflowX: "auto", padding: "8px 14px", scrollbarWidth: "none" },
  suggestChip: { background: "#161616", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "7px 14px", fontSize: 12, color: "#888", cursor: "pointer", whiteSpace: "nowrap" },
  chatInput: { display: "flex", gap: 10, padding: "10px 14px 80px", background: `${BASE}f0` },
  chatTextInput: { flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 24, padding: "12px 18px", color: "#eee", fontSize: 14, outline: "none", fontFamily: "inherit" },
  sendBtn: { width: 44, height: 44, borderRadius: "50%", background: "#7c6fff", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", fontWeight: 700 },

  itemDate: { fontSize: 10, color: "#444", marginBottom: 3 },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body { background: #0a0a0a; overscroll-behavior: none; }
  ::-webkit-scrollbar { display: none; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  input::placeholder, textarea::placeholder { color: #444; }
  button { font-family: 'DM Sans', sans-serif; }
  select { font-family: 'DM Sans', sans-serif; color: #eee; }
`;
