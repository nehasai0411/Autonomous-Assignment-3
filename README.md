# Argumentation Engine & Strategic Argumentation (Assignment 3)

An academic, full-stack, mathematically rigorous web application implementing **Dung's Abstract Argumentation Framework (AF)** semantics and **Multi-Agent Strategic Argumentation Mechanisms**.

Built strictly from first principles without black-box argumentation libraries.

---

## 1. Project Overview

This project satisfies all requirements of **Academic Assignment 3**:

1. **Part A – Argumentation Engine:**
   - Formal framework representation: $AF = \langle A, R \rangle$.
   - Conflict-free sets, acceptability/defence checking, characteristic function $F(S)$, admissibility, and complete extension verification.
   - Exact computation of **Grounded** (iterative fixed-point), **Complete**, **Preferred** (maximal admissible), **Stable** (conflict-free sets attacking all outside arguments), and **Semi-Stable** (complete extensions with inclusion-maximal ranges) extensions.
   - Caminada (2006) legal **IN / OUT / UNDEC** labellings with exact complete extension bijection.
   - Acceptance status determination (**Skeptically Accepted**, **Credulously Accepted**, **Rejected**) under any selectable semantics.

2. **Part B – Strategic Argumentation:**
   - Multi-agent argumentation setting where agents privately own disjoint subsets of arguments $A = \bigcup_i A_i$.
   - **Grounded Direct Mechanism:** Evaluates the grounded extension of the graph induced by the union of revealed argument reports $A^\circ = \bigcup_i A_i^\circ$.
   - **Agent Utility:** Number of an agent's originally owned arguments accepted in the grounded extension: $u_i = |A_i \cap GE(AF[A^\circ])|$.
   - **Best Reports:** Full enumeration of all $2^{|A_i|}$ subsets an agent could reveal, identifying optimal disclosure strategies against fixed opponent reports.
   - **Theorem 5.3 (Strategyproofness Verification):** Exhaustively tests whether truth-telling is weakly dominant against all opponent strategy combinations; captures explicit counterexamples where strategic hiding increases utility.
   - **Theorem 5.4 (Odd-Length Path Condition):** Graph-theoretic condition verifying that no agent holds two arguments with an odd-length directed path between them. Implements Breadth-First Search (BFS) with parity states $(node, \text{parity} \in \{0, 1\})$ to handle arbitrary cycles.
   - Demonstrates that Theorem 5.4 is **sufficient but not necessary** for strategyproofness.

3. **Empirical Study & Random Experiments:**
   - Generation of 1,000 random graphs per probability $p \in \{0.15, 0.25, 0.35\}$ (3,000 instances total), each with 3 agents and 6–8 arguments.
   - Records strategyproofness fractions and Theorem 5.4 satisfaction rates.
   - Empirically verifies zero instances satisfying T5.4 yet failing strategyproofness (100% sufficiency).
   - Documents and explains instances that are strategyproof despite failing Theorem 5.4 (non-necessity).
   - Generates CSV/JSON datasets and publication-quality Matplotlib figures.

4. **Corrected Textbook Misprints:**
   - **Example 5.10:** Corrects the published misprint where utilities of agents $y$ and $z$ were swapped with each other's argument sets.
   - **Example 5.11:** Corrects the discussion misprint where the text named $\alpha_5$ instead of $\alpha_6$ as the argument canceling the indirect self-defeat.

---

## 2. Tech Stack

- **Backend:**
  - Python 3.11+
  - FastAPI (REST API)
  - Pydantic v2 (Validation & Schemas)
  - Uvicorn (ASGI Server)
  - Pytest (Comprehensive unit & property testing)
  - Pandas & NumPy (Data processing & CSV export)
  - Matplotlib (Publication-quality figures)
  - HTTPX (API integration testing)
- **Frontend:**
  - React 19 + TypeScript + Vite 8
  - Tailwind CSS v4
  - Cytoscape.js (Interactive graph canvas with custom styles & path tracing)
  - Recharts (Interactive empirical bar & stacked charts)
  - Lucide React (Icons)

---

## 3. Directory Structure

```
autonomous/
├── backend/
│   ├── engine/
│   │   ├── __init__.py
│   │   ├── framework.py          # Part A: Dung AF, extensions, labellings, acceptance
│   │   ├── strategic.py          # Part B: Grounded mechanism, utilities, T5.3 & T5.4
│   │   ├── presets.py            # Prescribed examples (5.10, 5.11) & benchmarks
│   │   └── experiments.py        # Random graph generation, evaluation, plotting
│   ├── api/
│   │   ├── __init__.py
│   │   ├── schemas.py            # Pydantic request & response models
│   │   └── routes.py             # REST API endpoints
│   ├── tests/
│   │   ├── test_engine.py        # Unit tests for Part A semantics & theorems
│   │   ├── test_strategic.py     # Unit tests for Part B, book examples & parity BFS
│   │   ├── test_experiments.py   # Unit tests for random generator & exporters
│   │   └── test_api.py           # Integration tests for FastAPI endpoints
│   ├── main.py                   # FastAPI server entry point
│   ├── run_full_experiments.py   # Script to run 3,000 instance academic study
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GraphViewer.tsx   # Cytoscape.js directed graph visualizer
│   │   │   ├── Navbar.tsx        # Top navigation & status bar
│   │   │   └── Sidebar.tsx       # Sidebar navigation for 10 pages
│   │   ├── context/
│   │   │   └── FrameworkContext.tsx # Central framework & agent state management
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx            # Overview & metric cards
│   │   │   ├── FrameworkBuilder.tsx     # Add/remove args, attacks, assign agents
│   │   │   ├── ExtensionAnalysis.tsx    # Step-by-step checks & extension classes
│   │   │   ├── LabellingsPage.tsx       # Caminada legal labellings visualizer
│   │   │   ├── AcceptanceStatusPage.tsx # Argument acceptance evaluator
│   │   │   ├── StrategicArgPage.tsx     # Grounded mechanism & disclosure toggles
│   │   │   ├── BestReportsPage.tsx      # All 2^|Ai| reports comparison table
│   │   │   ├── StrategyproofnessPage.tsx# Interactive T5.3 & T5.4 path inspector
│   │   │   ├── ExperimentsPage.tsx      # Configurable empirical experiments
│   │   │   └── DocumentationPage.tsx    # Mathematical theory & misprint guide
│   │   ├── services/
│   │   │   └── api.ts            # Typed REST API client
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript type definitions
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── data/
│   ├── experiments_results.csv   # 3,000-instance empirical dataset
│   ├── experiments_results.json  # Complete statistical summaries
│   └── charts/
│       ├── strategyproofness_by_p.png
│       ├── theorem_comparison.png
│       └── outcome_distribution.png
├── README.md
├── REPORT.md
└── DEMONSTRATION.md
```

---

## 4. Setup & Execution Instructions

### Prerequisites
- Python 3.11+
- Node.js v18+ and npm v9+

### Backend Setup
1. Open a terminal in the project root:
   ```bash
   cd d:\autonomous
   ```
2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt httpx
   ```
3. Run the automated Pytest test suite:
   ```bash
   python -m pytest backend/tests -v
   ```
4. Start the FastAPI backend server:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The backend API will be available at `http://127.0.0.1:8000`.
   Interactive Swagger documentation is at `http://127.0.0.1:8000/docs`.

### Frontend Setup
1. Open a second terminal:
   ```bash
   cd d:\autonomous\frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

### Running Academic Experiments
To execute the complete 3,000-instance academic study ($p \in \{0.15, 0.25, 0.35\}$, 1,000 graphs each) and regenerate all CSV, JSON, and Matplotlib charts:
```bash
python -m backend.run_full_experiments
```

---

## 5. Summary of Experimental Results (3,000 Graphs)

| Attack Prob ($p$) | Strategyproof % (T5.3) | T5.4 Satisfied % | T5.4 Satisfied & Fail SP (Sufficiency Check) | T5.4 Failed & Still SP (Non-Necessity) |
|---|---|---|---|---|
| **$p = 0.15$** | **64.0%** (640 / 1000) | 16.7% (167 / 1000) | **0 (0.0%)** | **473 (47.3%)** |
| **$p = 0.25$** | **28.1%** (281 / 1000) | 2.7% (27 / 1000)   | **0 (0.0%)** | **254 (25.4%)** |
| **$p = 0.35$** | **11.1%** (111 / 1000) | 0.4% (4 / 1000)    | **0 (0.0%)** | **107 (10.7%)** |

**Key Takeaways:**
1. **Sufficiency Verified:** Across all 3,000 graphs, zero instances satisfied Theorem 5.4 yet failed strategyproofness ($0 / 3000 = 0.0\%$).
2. **Non-Necessity Verified:** In 834 of 3,000 instances (27.8%), Theorem 5.4 failed (an odd-length directed path existed between arguments owned by the same agent) yet the mechanism remained strictly strategyproof.
3. **Attack Density Impact:** As attack density increases from $p=0.15$ to $p=0.35$, odd attack paths proliferate rapidly, increasing manipulation opportunities and dropping strategyproofness from $64.0\%$ to $11.1\%$.
