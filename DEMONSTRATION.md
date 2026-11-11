# Step-by-Step System Demonstration (Assignment 3)

This document provides a guided walkthrough to demonstrate all functionalities of the **Argumentation Engine & Strategic Argumentation Web Application**.

---

## 1. Quick Launch Guide

### Start the Python Backend Server
In a terminal:
```bash
cd d:\autonomous
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Verification:* Navigate to `http://127.0.0.1:8000/api/health` in your browser. You will see:
```json
{
  "status": "healthy",
  "service": "Argumentation Engine & Strategic Argumentation",
  "version": "1.0.0"
}
```

### Start the React + Vite Frontend
In a second terminal:
```bash
cd d:\autonomous\frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 2. Walkthrough: 10 Key Demonstration Steps

### Step 1: System Dashboard & Presets Overview
1. Open `http://localhost:5173`.
2. Notice the **Dashboard**:
   - Framework statistics cards: Arguments, Attacks, Grounded Extension, Complete, Preferred, and Stable extensions.
   - Interactive Cytoscape graph canvas displaying the active framework.
3. In the sidebar or top banner, click **Example 5.10 (Manipulable)**:
   - Notice the amber alert documenting the published textbook misprint:
     *"In Example 5.10 in the book, the utilities of y and z are written with each other's argument sets. Correct utilities: u_x = 1, u_y = 0, u_z = 1."*
   - Notice the graph automatically renders $a_1 \to a_2 \to a_3 \to a_4$ and $a_3 \to a_5$, with nodes color-coded by agent ownership.

---

### Step 2: Framework Builder (Part A Requirement 1)
1. In the sidebar, click **Framework Builder**.
2. **Add an Argument:**
   - Type argument name: `a_extra`.
   - Select agent: `x`.
   - Click **Add Argument**. The node immediately appears on the Cytoscape canvas!
3. **Add an Attack:**
   - Attacker: `a_extra`.
   - Target: `a2`.
   - Click **Add Attack**. A directed arrow `a_extra -> a2` appears on the graph.
4. **Remove the Attack & Argument:**
   - In the "Active Directed Attacks" section, click the **&times;** button on `a_extra -> a2`.
   - In the argument ownership table, click the trash icon on `a_extra`.
5. **Export & Import JSON:**
   - Click **Export JSON** to download `argumentation_framework.json`.
   - The JSON contains the formal specification of arguments, directed attacks, and agent ownership.

---

### Step 3: Extension Analysis (Part A Requirements 2, 3, 4, 5)
1. In the sidebar, click **Extension Analysis**.
2. **Custom Set Evaluator ($S \subseteq A$):**
   - Click argument pills to select set $S = \{a_1, a_3\}$.
   - Click **Evaluate Set**.
   - Notice the real-time evaluation cards:
     - **Conflict-Free:** **YES** (no attacks between $a_1$ and $a_3$).
     - **Admissible:** **YES** ($S$ defends all of its arguments: $a_1$ is unattacked, and $a_1$ attacks $a_2$ which was attacking $a_3$).
     - **Complete Extension:** **YES** ($F(S) = S$).
     - **Characteristic Function $F(S)$:** Displays $F(S) = \{a_1, a_3\}$.
3. **Test a Conflicted Set:**
   - Select set $S = \{a_1, a_2\}$.
   - Click **Evaluate Set**.
   - **Conflict-Free:** **NO (Conflicted)**, because $(a_1, a_2) \in R$.
4. **Defence Checker:**
   - At the bottom of the card, select argument `a3` and set $S = \{a_1\}$.
   - Click **Test Defence**.
   - Result: **$S$ defends $a_3$** because $a_3$'s attacker $a_2$ is attacked by $a_1 \in S$!

---

### Step 4: Fixed-Point Grounded Iteration & Extension Classes (Part A Requirement 6)
1. On the same **Extension Analysis** page, scroll down to **Grounded Extension Fixed-Point Iteration (6.A)**:
   - **Step 0:** Base step $S_0 = \emptyset$.
   - **Step 1:** $F(S_0) = \{a_1\}$ (Added: $a_1$, since $a_1$ has no attackers).
   - **Step 2:** $F(S_1) = \{a_1, a_3\}$ (Added: $a_3$, since $a_1$ defends $a_3$ against $a_2$).
   - **Step 3:** $F(S_2) = \{a_1, a_3\}$ (**Fixed point reached!**).
   - Unique Grounded Extension: $\{a_1, a_3\}$.
2. Scroll to the **Extension Classes** grid:
   - **Complete Extensions (6.B):** $E_1 = \{a_1, a_3\}$.
   - **Preferred Extensions (6.C):** $P_1 = \{a_1, a_3\}$.
   - **Stable Extensions (6.C):** $S_1 = \{a_1, a_3\}$ (attacks all outside arguments $\{a_2, a_4, a_5\}$).
   - **Semi-Stable Extensions (6.C):** $SS_1 = \{a_1, a_3\}$.

---

### Step 5: Legal Caminada Labellings (Part A Requirement 6.D)
1. In the sidebar, click **Legal Labellings**.
2. Notice the list of legal complete labellings on the right.
3. Click **Labelling $L_1$**:
   - The Cytoscape graph nodes immediately change colors:
     - $a_1$: **IN (Green)**
     - $a_2$: **OUT (Red)** (attacked by $a_1 \in \text{IN}$)
     - $a_3$: **IN (Green)** (all attackers are OUT)
     - $a_4$: **OUT (Red)** (attacked by $a_3 \in \text{IN}$)
     - $a_5$: **OUT (Red)** (attacked by $a_3 \in \text{IN}$)
4. Switch presets to **3-Cycle Paradox** using the sidebar dropdown:
   - Notice the single labelling where all nodes $a, b, c$ are **UNDEC (Amber)**!

---

### Step 6: Acceptance Status Evaluator (Part A Requirement 6.E)
1. Switch back to **Example 5.10** preset.
2. In the sidebar, click **Acceptance Status**.
3. Select argument $a_1$ and semantics **Preferred**:
   - Status badge: **Skeptically Accepted (In All Extensions)**.
   - Explanation: $a_1$ is present in 1 of 1 preferred extension(s).
4. Select argument $a_2$ and semantics **Preferred**:
   - Status badge: **Rejected (In No Extensions)**.
5. Switch preset to **Nixon Diamond (2-cycle mutual attack)**:
   - Select argument `Pacifist` under **Preferred Semantics**:
   - Status badge: **Credulously Accepted (In Some Extensions)**.
   - Explanation: `Pacifist` is present in 1 of 2 preferred extensions (in $\{Quaker, Pacifist\}$, but not in $\{Republican, Hawk\}$).

---

### Step 7: Strategic Argumentation Mechanism & Disclosure Toggles (Part B Requirements 1 & 2)
1. Switch preset to **Example 5.10**.
2. In the sidebar, click **Strategic Mechanism**.
3. **Truthful Evaluation:**
   - Both agents $x, y, z$ reveal all arguments.
   - Grounded Extension: $\{a_1, a_3\}$.
   - Utilities:
     - **Agent $x$:** $u_x = 1$ (only $a_1$ accepted).
     - **Agent $y$:** $u_y = 0$.
     - **Agent $z$:** $u_z = 1$.
4. **Strategic Hiding Demonstration:**
   - In the right-hand panel under Agent $x$, click the **$a_1$** button to hide it!
   - (Or click the one-click shortcut: *"Hide a1 (Agent x gains u_x = 2)"*).
   - Watch the graph and utilities instantly update:
     - Argument $a_1$ becomes faded and dashed (hidden).
     - In the induced subgraph, $a_2$ is now unattacked $\implies a_2$ becomes IN.
     - $a_2$ defeats $a_3 \implies a_3$ becomes OUT.
     - Because $a_3$ is OUT, $a_4$ and $a_5$ are defended $\implies a_4, a_5$ become IN!
     - **Agent $x$'s utility jumps from 1 to 2!**
   - This visually demonstrates how hiding information exploits indirect self-defeat to increase an agent's payoff.

---

### Step 8: Best Reports Enumeration (Part B Requirement 2)
1. In the sidebar, click **Best Reports**.
2. Select Agent $x$ against truthful opponents $y = \{a_2\}$ and $z = \{a_3\}$.
3. Review the **All $2^{|A_x|} = 8$ Strategy Subsets Table**:
   - Subset $\{a_1, a_4, a_5\}$ (Truthful): Utility = **1** (Suboptimal).
   - Subset $\{a_4, a_5\}$ (Hide $a_1$): Utility = **2** (**Optimal!**).
   - Subset $\{a_5\}$ (Hide $a_1, a_4$): Utility = **1**.
   - Subset $\emptyset$ (Hide all): Utility = **0**.
4. The top banner explicitly announces:
   *"Agent x STRICTLY GAINS by Hiding Arguments! Truthful utility is u_i = 1, but strategically hiding arguments yields maximum utility u_i = 2."*

---

### Step 9: Theorem 5.3 & Theorem 5.4 Verification (Part B Requirements 3 & 4)
1. In the sidebar, click **Strategyproofness**.
2. **On Example 5.10:**
   - **Mechanism Status:** **NOT STRATEGYPROOF (Vulnerable)**.
   - **Theorem 5.3:** Fails! Shows counterexample card: Agent $x$ hiding $\{a_1\}$ achieves utility $+1$.
   - **Theorem 5.4:** Fails! Violating pairs found:
     - $(a_1, a_4)$ with odd path: $a_1 \to a_2 \to a_3 \to a_4$ (Length 3).
     - $(a_1, a_5)$ with odd path: $a_1 \to a_2 \to a_3 \to a_5$ (Length 3).
   - Click the violating path in the right-hand panel:
     - **The exact directed path $a_1 \to a_2 \to a_3 \to a_4$ glows magenta on the Cytoscape canvas!**
3. **Switch to Example 5.11 (Proof of Non-Necessity):**
   - Click the preset selector and choose **Example 5.11**.
   - Watch the verification outcome:
     - **Theorem 5.3 (SP):** **PASSED (STRATEGYPROOF)**! Truth-telling is dominant for all agents.
     - **Theorem 5.4:** **FAILED** (the odd path $a_1 \to a_2 \to a_3 \to a_4$ still exists!).
   - Outcome Banner reads:
     **`Category: T5.4 Failed & Strategyproof`**
     *"Theorem 5.4 condition fails, yet the framework is strategyproof! Demonstrates non-necessity of T5.4."*

---

### Step 10: Random Experiments Suite & Charts
1. In the sidebar, click **Random Experiments**.
2. View the precomputed 3,000-instance academic study:
   - Summary table shows $p = 0.15$ ($64.0\%$ SP), $p = 0.25$ ($28.1\%$ SP), and $p = 0.35$ ($11.1\%$ SP).
   - Notice the **Sufficiency Check column: EXACTLY 0 (0.0%)** instances satisfied T5.4 yet failed strategyproofness!
   - Notice the **Non-Necessity column: 834 instances** were strategyproof despite failing T5.4!
3. Switch between **Interactive (Recharts)** and **Publication (Matplotlib PNG)** tabs to inspect the generated charts.
4. Click **Download CSV** to inspect `experiments_results.csv` in Excel or Pandas.
5. Click **Download JSON** to inspect the complete structured data.
6. Test running a custom batch:
   - Change instances to `200` and click **Run Experiment Batch**.
   - The system simulates the batch and updates the figures in real-time.

---

## 3. Running Automated Tests

To run the automated test suite verifying all theoretical claims:
```bash
python -m pytest backend/tests -v
```
Output:
```
backend/tests/test_api.py::test_health PASSED
backend/tests/test_api.py::test_presets PASSED
backend/tests/test_api.py::test_framework_analyze PASSED
backend/tests/test_api.py::test_check_set_and_defence PASSED
backend/tests/test_api.py::test_strategic_endpoints PASSED
backend/tests/test_api.py::test_experiment_endpoints PASSED
backend/tests/test_engine.py::test_empty_framework PASSED
backend/tests/test_engine.py::test_single_argument_no_attacks PASSED
backend/tests/test_engine.py::test_self_attack PASSED
backend/tests/test_engine.py::test_two_cycle_mutual_attack PASSED
backend/tests/test_engine.py::test_three_cycle_paradox PASSED
backend/tests/test_engine.py::test_semi_stable_semantics_distinction PASSED
backend/tests/test_engine.py::test_soundness_extension_theorems PASSED
backend/tests/test_engine.py::test_caminada_labellings_bijection PASSED
backend/tests/test_experiments.py::test_random_instance_generator PASSED
backend/tests/test_experiments.py::test_experiment_suite_and_export PASSED
backend/tests/test_strategic.py::test_example_5_10_and_misprint_correction PASSED
backend/tests/test_strategic.py::test_example_5_11_and_non_necessity_of_t5_4 PASSED
backend/tests/test_strategic.py::test_cycles_handling_in_theorem_5_4 PASSED
backend/tests/test_strategic.py::test_even_cycles_not_odd_violators PASSED
backend/tests/test_strategic.py::test_sufficiency_guarantee PASSED

======================== 21 passed in 5.61s ========================
```
All 21 test suites pass cleanly.
