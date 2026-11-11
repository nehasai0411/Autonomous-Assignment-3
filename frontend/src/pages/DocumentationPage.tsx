import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Code2,
  GitBranch,
  HelpCircle,
  Layers,
  Network,
  ShieldAlert,
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto text-slate-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          Assignment 3 Mathematical Reference & Documentation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Formal mathematical definitions, algorithmic complexity, mechanism design principles,
          and textbook misprint documentation.
        </p>
      </div>

      {/* Misprints Box */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Documentation of Prescribed Textbook Misprints</span>
        </div>
        <div className="space-y-2 text-xs text-amber-200/90 leading-relaxed">
          <p>
            <strong>1. Example 5.10 (Page 2 Misprint):</strong> In the published text, the utilities
            of agent <em>y</em> and agent <em>z</em> were erroneously switched with each other's argument
            sets.
            <br />
            <em>Correction:</em> Under full truthfulness, Grounded Extension is {'{a1, a3}'}.
            Agent <em>x</em> owns {'{a1, a4, a5}'} &rarr; utility = 1 (a1 accepted).
            Agent <em>y</em> owns {'{a2}'} &rarr; utility = 0 (a2 is defeated by a1).
            Agent <em>z</em> owns {'{a3}'} &rarr; utility = 1 (a3 is defended against a2).
          </p>
          <p>
            <strong>2. Example 5.11 Discussion (Page 2 Misprint):</strong> In the commentary following
            Example 5.11, the text states that the argument which cancels out the indirect self-defeat is
            &alpha;₅.
            <br />
            <em>Correction:</em> The added argument is actually <strong>&alpha;₆</strong> (with attack
            &alpha;₆ &rarr; &alpha;₃). It is &alpha;₆ that directly defeats &alpha;₃, shielding &alpha;₄
            and &alpha;₅ and restoring truth-telling optimality.
          </p>
        </div>
      </div>

      {/* Part A: Argumentation Engine */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Part A: Dung's Abstract Argumentation Framework (AF)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Phan Minh Dung (1995) • First-Principles Scratch Implementation
          </p>
        </div>

        <div className="space-y-4 text-xs leading-relaxed">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              1. Definition of Framework AF = &lang;A, R&rang;
            </h3>
            <p>
              An abstract argumentation framework is a pair &lang;A, R&rang; where <em>A</em> is a finite
              set of arguments and <em>R &sube; A &times; A</em> is a binary directed defeat relation.
              If (u, v) &in; R, we say argument <em>u</em> attacks argument <em>v</em>.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              2. Conflict-Free Set (Req 2)
            </h3>
            <p>
              A subset <em>S &sube; A</em> is <strong>conflict-free</strong> if and only if there are no
              two arguments <em>u, v &in; S</em> such that <em>(u, v) &in; R</em>.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              3. Defence / Acceptability (Req 3)
            </h3>
            <p>
              An argument <em>&alpha; &in; A</em> is <strong>defended by</strong> <em>S &sube; A</em>
              if and only if for every <em>&beta; &in; A</em> such that <em>(&beta;, &alpha;) &in; R</em>,
              there exists an argument <em>&gamma; &in; S</em> such that <em>(&gamma;, &beta;) &in; R</em>.
              If &alpha; has no attackers in AF, it is defended by all sets, including ∅.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              4. Characteristic Function F(S) (Req 4)
            </h3>
            <p className="font-mono text-indigo-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              F(S) = &lcub; &alpha; &in; A &mid; &alpha; is defended by S &rcub;
            </p>
            <p className="mt-1 text-slate-400">
              The characteristic function <em>F</em> is monotonic over (2ᴬ, &sube;).
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              5. Admissibility & Complete Extensions (Req 5)
            </h3>
            <p>
              A set <em>S</em> is <strong>admissible</strong> iff <em>S</em> is conflict-free and
              <em>S &sube; F(S)</em> (S defends all of its own arguments).
              <br />
              A set <em>S</em> is a <strong>complete extension</strong> iff <em>S</em> is admissible and
              <em>F(S) = S</em> (S is a fixed point of F).
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              6. Extension Semantics (Req 6.A - 6.C)
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              <li>
                <strong className="text-emerald-400">Grounded Extension (6.A):</strong> The unique
                least fixed point of <em>F</em>, computed by iterative fixed-point algorithm:
                S₀ = ∅, Sₖ₊₁ = F(Sₖ) until Sₖ₊₁ = Sₖ.
              </li>
              <li>
                <strong className="text-blue-400">Preferred Extensions (6.C):</strong> Maximal (w.r.t.
                set inclusion) admissible sets. Always exists and every preferred extension is complete.
              </li>
              <li>
                <strong className="text-purple-400">Stable Extensions (6.C):</strong> Conflict-free sets
                attacking every argument outside them: <em>S &cup; R(S) = A</em>. May not always exist
                (e.g., odd cycle).
              </li>
              <li>
                <strong className="text-emerald-300">Semi-Stable Extensions (6.C):</strong> Complete
                extensions with inclusion-maximal range <em>S⁺ = S &cup; R(S)</em>. Always exists in
                finite AFs.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              7. Legal Labellings (Req 6.D - Caminada 2006)
            </h3>
            <p>
              A labelling is a function <em>L: A &rarr; &lcub;IN, OUT, UNDEC&rcub;</em> such that:
              <br />
              - <em>L(&alpha;) = IN</em> &hArr; &forall; &beta; &in; Att(&alpha;), L(&beta;) = OUT.
              <br />
              - <em>L(&alpha;) = OUT</em> &hArr; &exist; &beta; &in; Att(&alpha;), L(&beta;) = IN.
              <br />
              - <em>L(&alpha;) = UNDEC</em> &hArr; otherwise.
              <br />
              There is an exact 1-to-1 bijection between complete extensions and legal labellings.
            </p>
          </div>
        </div>
      </section>

      {/* Part B: Strategic Argumentation */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            Part B: Strategic Argumentation & Mechanism Design
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Iyad Rahwan & Kate Larson • Argumentation Mechanism Design (ArgMD)
          </p>
        </div>

        <div className="space-y-4 text-xs leading-relaxed">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              1. Grounded Direct Argumentation Mechanism & Utility (Req 1 & 2)
            </h3>
            <p>
              Let <em>I = &lcub;1, ..., n&rcub;</em> be a set of self-interested agents. Arguments are
              partitioned into disjoint private types <em>A = &cup;ᵢ Aᵢ</em>.
              Each agent reports a revealed subset <em>Aᵢ&deg; &sube; Aᵢ</em>.
              <br />
              The mechanism constructs the induced sub-framework <em>AF[A&deg;]</em> over
              <em>A&deg; = &cup;ᵢ Aᵢ&deg;</em> and outputs the grounded extension <em>GE(AF[A&deg;])</em>.
              <br />
              Agent utility is defined as the count of originally owned arguments accepted in the
              outcome:
            </p>
            <p className="font-mono text-emerald-300 bg-slate-950 p-2 rounded-lg border border-slate-800 my-1">
              uᵢ(A₁&deg;, ..., Aₙ&deg;) = &verbar; Aᵢ &cap; GE(AF[&cup;ⱼ Aⱼ&deg;]) &verbar;
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              2. Theorem 5.3: Strategyproofness Verification (Req 3)
            </h3>
            <p>
              A grounded direct argumentation mechanism is <strong>strategyproof</strong> iff for every
              agent <em>i</em>, revealing all of its arguments (truthfulness: <em>Aᵢ&deg; = Aᵢ</em>) is a
              best response against <em>every</em> possible combination of revealed reports by the other
              agents:
            </p>
            <p className="font-mono text-indigo-300 bg-slate-950 p-2 rounded-lg border border-slate-800 my-1">
              &forall; i &in; I, &forall; A₋ᵢ&deg; &in; &prod;_{'{'}j &ne; i{'}'} 2^(A_j), &forall; Aᵢ&deg; &sube; Aᵢ: &emsp;
              uᵢ(Aᵢ, A₋ᵢ&deg;) &ge; uᵢ(Aᵢ&deg;, A₋ᵢ&deg;)
            </p>
            <p>
              If there exists any agent and opponent profile where withholding arguments yields strictly higher
              utility, truthful revelation is not a dominant strategy, and the instance is a counterexample.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              3. Theorem 5.4: Odd-Length Directed Path Condition (Req 4)
            </h3>
            <p>
              <strong>Theorem (Rahwan & Larson):</strong> The grounded direct argumentation mechanism is
              strategyproof if in the full framework <em>AF = &lang;A, R&rang;</em>, <strong>no agent holds
              two arguments &alpha;, &beta; &in; Aᵢ with an odd-length directed path from &alpha; to &beta;</strong>.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-slate-300">
              <div>
                <strong>Handling Graph Cycles:</strong> The search is solved using Breadth-First Search (BFS)
                on the 2-layered bipartite product graph with parity states <em>(node, parity &in; &lcub;0, 1&rcub;)</em>.
                Because each state is visited at most once, cycles are naturally terminated in <em>O(&verbar;V&verbar; + &verbar;E&verbar;)</em>.
              </div>
              <div>
                <strong>Sufficiency vs Necessity:</strong> Theorem 5.4 is <strong>sufficient</strong> but
                <strong>NOT necessary</strong>. As demonstrated by Example 5.11, an instance can fail
                Theorem 5.4 (contain an odd-length path between same-agent arguments) yet remain completely
                strategyproof because the indirect defeat is canceled out by intermediate counter-defenders.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
