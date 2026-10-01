import type { Tier } from "./evidence";

/** A verifiable citation. `href` must point to a fixed record (PMID/PMCID/DOI/
 *  label), never a search query. */
export type Source = { label: string; href: string };

export type Claim = {
  text: string;
  tier: Tier;
  /**
   * "regulatory" facts (e.g. approval status) are Tier 1 by provenance but say
   * nothing about efficacy, so they are excluded from the evidence floor.
   */
  kind?: "efficacy" | "regulatory";
  source?: Source;
};

/** Regulatory posture — stated as fact, per VOICE.md (replaces "dosage"). */
export type Regulatory = {
  status: "approved" | "approved-abroad" | "research-only" | "withdrawn";
  /** Plain-language detail: what/where it's approved, or why it isn't. */
  detail: string;
  source?: Source;
};

/** Amino-acid sequence, structured so modified / non-natural peptides are
 *  represented honestly rather than as a misleading one-letter string. */
export type Sequence = {
  /** One-letter or three-letter representation, whichever is correct. */
  residues: string;
  /** Modifications / caveats (acylation, D-amino acids, undisclosed, etc.). */
  note?: string;
  source?: Source;
};

export type Safety = { text: string; source?: Source };
export type FAQ = { q: string; a: string };
export type ChangeLogEntry = { date: string; note: string };

/** Tiers of the efficacy claims only — what the floor badge should reflect. */
export function efficacyTiers(p: Peptide): Tier[] {
  const efficacy = p.claims.filter((c) => c.kind !== "regulatory");
  return (efficacy.length > 0 ? efficacy : p.claims).map((c) => c.tier);
}

/**
 * Examine-style "research snapshot": quantities computed from the entry so the
 * evidence base is legible at a glance and can never drift from the data.
 */
export type Snapshot = {
  /** Distinct cited sources across claims + regulatory + safety. */
  references: number;
  /** Efficacy claims backed by human data (tier 1–2). */
  humanClaims: number;
  /** Total efficacy claims. */
  totalClaims: number;
  /** Strongest tier any efficacy claim reaches (the floor badge). */
  floor: Tier | null;
};

export function snapshot(p: Peptide): Snapshot {
  const hrefs = new Set<string>();
  for (const c of p.claims) if (c.source) hrefs.add(c.source.href);
  if (p.regulatory?.source) hrefs.add(p.regulatory.source.href);
  for (const s of p.safety ?? []) if (s.source) hrefs.add(s.source.href);
  if (p.sequence?.source) hrefs.add(p.sequence.source.href);

  const efficacy = p.claims.filter((c) => c.kind !== "regulatory");
  const tiers = efficacy.map((c) => c.tier);
  return {
    references: hrefs.size,
    humanClaims: efficacy.filter((c) => c.tier <= 2).length,
    totalClaims: efficacy.length,
    floor: tiers.length ? (Math.min(...tiers) as Tier) : null,
  };
}

export type Peptide = {
  slug: string;
  name: string;
  aka?: string[];
  class: string;
  /** One-line copywriter hook — bold but never overreaching. */
  hook: string;
  /** 2–3 sentence honest summary: mechanism + what it's studied for + status. */
  summary: string;
  /** Accessible "how it works" — one short paragraph. */
  mechanism?: string;
  sequence?: Sequence;
  regulatory?: Regulatory;
  safety?: Safety[];
  faqs?: FAQ[];
  tags: string[];
  claims: Claim[];
  /** Placeholder byline until the reviewer is named (user-owned). */
  reviewedBy?: string;
  /** ISO date of last substantive review — drives "Last updated" + schema. */
  updated?: string;
  changelog?: ChangeLogEntry[];
};

/**
 * Everything a catalog card or search result needs, and nothing else. The
 * catalog explorer is a client component, so whatever it receives is
 * serialized into the page; sending the full monographs there roughly
 * tripled the payload. Build with `cardData(p)` on the server.
 */
export type CardData = {
  slug: string;
  name: string;
  aka: string[];
  class: string;
  hook: string;
  summary: string;
  tags: string[];
  /** Strongest efficacy tier (the badge). */
  floor: Tier | null;
  humanClaims: number;
  totalClaims: number;
  references: number;
  regulatory: Regulatory["status"] | null;
};

export function cardData(p: Peptide): CardData {
  const snap = snapshot(p);
  return {
    slug: p.slug,
    name: p.name,
    aka: p.aka ?? [],
    class: p.class,
    hook: p.hook,
    summary: p.summary,
    tags: p.tags,
    floor: snap.floor,
    humanClaims: snap.humanClaims,
    totalClaims: snap.totalClaims,
    references: snap.references,
    regulatory: p.regulatory?.status ?? null,
  };
}

/** Date of the sourced-review pass that verified every entry below. */
const REVIEWED = "2026-09-19";
const VERIFIED_LOG: ChangeLogEntry[] = [
  {
    date: REVIEWED,
    note: "Sourced review – every claim checked against primary literature; sequence, regulatory status, safety, and FAQs added.",
  },
];

export const peptides: Peptide[] = [
  // ── Metabolic / GLP-1 axis ────────────────────────────────────────────────
  {
    slug: "semaglutide",
    name: "Semaglutide",
    aka: ["Ozempic", "Wegovy", "Rybelsus"],
    class: "GLP-1 receptor agonist",
    hook: "The molecule that rewrote what weight loss looks like.",
    summary:
      "A long-acting GLP-1 analog that turns down appetite and slows gastric emptying. It is FDA-approved for type 2 diabetes and chronic weight management, and it carries some of the largest randomized outcome data of any peptide in this catalog.",
    mechanism:
      "Semaglutide mimics GLP-1, a gut hormone released after eating. It boosts glucose-dependent insulin release, slows how fast the stomach empties, and acts on appetite centers in the hypothalamus – so you feel full sooner and stay full longer. A fatty-acid chain lets it bind albumin in the blood, stretching its action to about a week per dose.",
    sequence: {
      residues:
        "GLP-1(7-37) backbone with Aib8, Arg34, and a C18 di-acid on Lys26",
      note: "A modified analog of human GLP-1, not a natural sequence: Aib at position 8 resists DPP-4, and the acylation on Lys26 binds albumin for a ~1-week half-life. Not cleanly representable as plain one-letter code.",
      source: {
        label: "FDA label – Ozempic (accessdata)",
        href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2017/209637lbl.pdf",
      },
    },
    regulatory: {
      status: "approved",
      detail:
        "FDA-approved: Ozempic (type 2 diabetes, 2017), Rybelsus (oral, type 2 diabetes, 2019), and Wegovy (chronic weight management, 2021; cardiovascular risk reduction added 2024).",
      source: {
        label: "FDA label – Ozempic (accessdata)",
        href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2017/209637lbl.pdf",
      },
    },
    safety: [
      {
        text: "Most common effects are gastrointestinal – nausea, vomiting, diarrhea – usually easing over time. The label carries a boxed warning for thyroid C-cell tumors (seen in rodents) and contraindicates use with a personal or family history of medullary thyroid carcinoma or MEN 2.",
        source: {
          label: "FDA label – Wegovy (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/215256s000lbl.pdf",
        },
      },
    ],
    faqs: [
      {
        q: "Is semaglutide the same as Ozempic and Wegovy?",
        a: "Yes – those are brand names for semaglutide at different doses and indications. Ozempic and Rybelsus are for type 2 diabetes; Wegovy is dosed for weight management.",
      },
      {
        q: "Does the weight come back if you stop?",
        a: "Trials show much of the lost weight tends to return after stopping, because the appetite effects depend on continued dosing. It is studied as an ongoing therapy, not a short course.",
      },
    ],
    tags: ["metabolic", "GLP-1", "approved"],
    claims: [
      {
        text: "Produced ~14.9% mean body-weight loss vs ~2.4% on placebo over 68 weeks in adults with obesity (STEP 1).",
        tier: 1,
        source: {
          label: "Wilding et al., 2021 (NEJM, STEP 1)",
          href: "https://pubmed.ncbi.nlm.nih.gov/33567185/",
        },
      },
      {
        text: "Cut major adverse cardiovascular events by ~20% in patients with cardiovascular disease and obesity but not diabetes (SELECT).",
        tier: 1,
        source: {
          label: "Lincoff et al., 2023 (NEJM, SELECT)",
          href: "https://pubmed.ncbi.nlm.nih.gov/37952131/",
        },
      },
    ],
    updated: REVIEWED,
    changelog: VERIFIED_LOG,
  },
  {
    slug: "tirzepatide",
    name: "Tirzepatide",
    aka: ["Mounjaro", "Zepbound"],
    class: "GIP / GLP-1 dual receptor agonist",
    hook: "Two incretin receptors, one injection, up to ~21% body weight gone.",
    summary:
      "A once-weekly dual agonist that hits both the GIP and GLP-1 receptors. In its pivotal obesity trial it drove weight loss rivaling bariatric surgery, and it is FDA-approved for type 2 diabetes, obesity, and obstructive sleep apnea.",
    mechanism:
      "Tirzepatide activates two gut-hormone receptors at once – GIP and GLP-1 – which together improve insulin response, blunt appetite, and slow gastric emptying. Adding GIP to the GLP-1 effect appears to amplify the metabolic response. A C20 fatty-acid chain gives it a ~5-day half-life.",
    sequence: {
      residues:
        "39-residue GIP-based backbone with Aib at positions 2 and 13, a C20 di-acid on Lys20, and a C-terminal amide",
      note: "A synthetic dual agonist containing non-natural residues and acylation – not representable as plain one-letter code.",
      source: {
        label: "FDA label – Mounjaro (accessdata)",
        href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/215866s000lbl.pdf",
      },
    },
    regulatory: {
      status: "approved",
      detail:
        "FDA-approved: Mounjaro (type 2 diabetes, 2022) and Zepbound (chronic weight management, 2023; moderate-to-severe obstructive sleep apnea in obesity, 2024).",
      source: {
        label: "FDA label – Zepbound (accessdata)",
        href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/217806s000lbl.pdf",
      },
    },
    safety: [
      {
        text: "Dose-related gastrointestinal effects (nausea, diarrhea, constipation) predominate. It carries the same class boxed warning for thyroid C-cell tumors and the same MTC/MEN 2 contraindication as GLP-1 agonists.",
        source: {
          label: "FDA label – Zepbound (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/217806s000lbl.pdf",
        },
      },
    ],
    faqs: [
      {
        q: "How is tirzepatide different from semaglutide?",
        a: "Semaglutide activates one receptor (GLP-1); tirzepatide activates two (GIP and GLP-1). In trials the dual mechanism has produced larger average weight loss.",
      },
    ],
    tags: ["metabolic", "GLP-1", "GIP", "approved"],
    claims: [
      {
        text: "Produced ~20.9% mean body-weight reduction at 72 weeks on the top dose vs ~3.1% on placebo (SURMOUNT-1).",
        tier: 1,
        source: {
          label: "Jastreboff et al., 2022 (NEJM, SURMOUNT-1)",
          href: "https://pubmed.ncbi.nlm.nih.gov/35658024/",
        },
      },
      {
        text: "FDA-approved for type 2 diabetes, chronic weight management, and obstructive sleep apnea in obesity.",
        tier: 1,
        kind: "regulatory",
        source: {
          label: "FDA label – Zepbound (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/217806s000lbl.pdf",
        },
      },
    ],
    updated: REVIEWED,
    changelog: VERIFIED_LOG,
  },
  {
    slug: "retatrutide",
    name: "Retatrutide",
    aka: ["LY3437943"],
    class: "GIP / GLP-1 / glucagon triple agonist",
    hook: "The triple agonist posting the biggest weight-loss numbers yet.",
    summary:
      "An investigational once-weekly peptide that activates three metabolic receptors at once. Phase 2 data are striking, but it is not yet approved – this is late-stage clinical promise, not a settled therapy.",
    mechanism:
      "Retatrutide adds glucagon-receptor activity to the GIP + GLP-1 combination. The glucagon arm is thought to raise energy expenditure on top of the appetite and insulin effects of the other two – a three-receptor bet on bigger metabolic swings.",
    sequence: {
      residues:
        "39-residue engineered peptide on a GIP-like backbone, with Aib substitutions and a C20 fatty-diacid side chain on a lysine linker",
      note: "Lilly's published structure (LY3437943). Described rather than spelled out: not letter-verified against a primary sequence database.",
      source: {
        label: "Doggrell, 2023 (Expert Opin Investig Drugs)",
        href: "https://pubmed.ncbi.nlm.nih.gov/37086147/",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Not approved anywhere as of 2026. The Phase 3 TRIUMPH program is complete, and Eli Lilly has said it plans to file for approval in Q1 2027.",
      source: {
        label: "ClinicalTrials.gov – TRIUMPH-1 (NCT05929066)",
        href: "https://clinicaltrials.gov/study/NCT05929066",
      },
    },
    safety: [
      {
        text: "In the Phase 2 trial, adverse events were mostly gastrointestinal and dose-related. The glucagon-receptor activity draws attention to heart rate and glucose, which the Phase 3 program was designed to characterize.",
        source: {
          label: "Jastreboff et al., 2023 (NEJM, Phase 2)",
          href: "https://pubmed.ncbi.nlm.nih.gov/37366315/",
        },
      },
    ],
    faqs: [
      {
        q: "Can I get retatrutide?",
        a: "Not as an approved medicine – it remains investigational. Any material sold as retatrutide outside a clinical trial is unapproved and unverified.",
      },
    ],
    tags: ["metabolic", "GLP-1", "GIP", "glucagon", "investigational"],
    claims: [
      {
        text: "83% of participants lost ≥15% body weight and mean loss reached ~24.2% at 48 weeks on the top dose in a Phase 2 RCT.",
        tier: 2,
        source: {
          label: "Jastreboff et al., 2023 (NEJM, Phase 2)",
          href: "https://pubmed.ncbi.nlm.nih.gov/37366315/",
        },
      },
      {
        text: "Triple agonism at the GLP-1, GIP, and glucagon receptors distinguishes it mechanistically from dual agonists.",
        tier: 3,
        source: {
          label: "Structural insights into retatrutide (PMC)",
          href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11255275/",
        },
      },
      {
        text: "No approved indication as of 2026; Phase 3 complete, filing planned for Q1 2027.",
        tier: 1,
        kind: "regulatory",
        source: {
          label: "ClinicalTrials.gov – TRIUMPH-1 (NCT05929066)",
          href: "https://clinicaltrials.gov/study/NCT05929066",
        },
      },
    ],
    updated: REVIEWED,
    changelog: VERIFIED_LOG,
  },
  {
    slug: "aod-9604",
    name: "AOD-9604",
    aka: ["hGH fragment 176-191"],
    class: "Growth-hormone fragment",
    hook: "The ‘fat-burning fragment’ the clinic couldn’t confirm.",
    summary:
      "A synthetic fragment of human growth hormone marketed for lipolysis. It showed fat-metabolism activity in preclinical work, but company-run human weight-loss trials failed to beat placebo – a clean example of a great story meeting hard endpoints.",
    mechanism:
      "AOD-9604 copies the tail end of growth hormone (residues 176–191) that is linked to fat breakdown, without the parts that drive growth or affect blood sugar and IGF-1. In animals it nudged fat metabolism; in people that signal did not translate into meaningful weight loss.",
    sequence: {
      residues: "YLRIVQCRSVEGSCGF",
      note: "The hGH 176–191 fragment with an added N-terminal tyrosine. Secondary-sourced – not letter-verified against a primary sequence database.",
    },
    regulatory: {
      status: "research-only",
      detail:
        "Never approved as a drug. The obesity program failed its larger placebo-controlled trial and was discontinued in the late 2000s; it later appeared as a cosmetic/food-additive ingredient.",
      source: {
        label: "AOD-9604 Metabolic – review (PubMed)",
        href: "https://pubmed.ncbi.nlm.nih.gov/15134286/",
      },
    },
    safety: [
      {
        text: "Reported as well-tolerated in trials; the defining limitation was lack of efficacy on hard endpoints, not toxicity. No long-term human safety data exist.",
        source: {
          label: "AOD-9604 Metabolic – review (PubMed)",
          href: "https://pubmed.ncbi.nlm.nih.gov/15134286/",
        },
      },
    ],
    faqs: [
      {
        q: "Does AOD-9604 burn fat?",
        a: "In animals it shifted fat metabolism. In the company-run human obesity trials it did not produce significant weight loss against placebo, which is why the drug program was shelved. The preclinical signal is real; the human result is negative.",
      },
      {
        q: "Does AOD-9604 affect blood sugar or IGF-1 like growth hormone does?",
        a: "No. The fragment keeps the lipolytic region of growth hormone and drops the parts responsible for growth, IGF-1 release, and insulin resistance. That selectivity was the whole design rationale.",
      },
    ],
    tags: ["metabolic", "GH-fragment", "investigational"],
    claims: [
      {
        text: "Stimulated lipolysis and inhibited lipogenesis in preclinical models without affecting IGF-1 or blood glucose.",
        tier: 3,
        source: {
          label: "Ng et al., 2000 (Horm Res)",
          href: "https://pubmed.ncbi.nlm.nih.gov/11146367/",
        },
      },
      {
        text: "Did not produce statistically significant weight loss versus placebo in human obesity trials.",
        tier: 2,
        source: {
          label: "AOD-9604 Metabolic – review (PubMed)",
          href: "https://pubmed.ncbi.nlm.nih.gov/15134286/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [...VERIFIED_LOG, { date: "2026-10-01", note: "Added FAQs." }],
  },

  // ── GH secretagogues / GHRH ───────────────────────────────────────────────
  {
    slug: "tesamorelin",
    name: "Tesamorelin",
    aka: ["Egrifta", "Egrifta SV"],
    class: "GHRH analog",
    hook: "An FDA-approved GHRH analog that targets visceral fat.",
    summary:
      "A stabilized growth-hormone-releasing-hormone analog that raises the body's own GH pulses. It is FDA-approved to reduce excess visceral abdominal fat in adults with HIV-associated lipodystrophy, backed by controlled trials – the best-evidenced GH-axis peptide here.",
    mechanism:
      "Tesamorelin is a protected copy of GHRH, the hormone that tells the pituitary to release growth hormone. An added acyl cap on the N-terminus shields it from rapid breakdown, so it drives natural GH pulses rather than replacing GH directly. More GH in turn mobilizes visceral fat.",
    sequence: {
      residues:
        "Human GHRH(1-44) with an N-terminal trans-3-hexenoyl cap and C-terminal amide",
      note: "The acyl cap protects against DPP-4 cleavage and is the load-bearing structural feature.",
      source: {
        label: "FDA label – Egrifta SV (accessdata)",
        href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/022505s012s013lbl.pdf",
      },
    },
    regulatory: {
      status: "approved",
      detail:
        "FDA-approved (2010) to reduce excess visceral abdominal fat in adults with HIV-associated lipodystrophy. Marketed as Egrifta / Egrifta SV.",
      source: {
        label: "FDA label – Egrifta SV (accessdata)",
        href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/022505s012s013lbl.pdf",
      },
    },
    safety: [
      {
        text: "The label warns of glucose intolerance and diabetes, injection-site reactions, and possible fluid retention; it is contraindicated in active malignancy and pregnancy. Visceral-fat benefit reverses if the drug is stopped.",
        source: {
          label: "FDA label – Egrifta SV (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/022505s012s013lbl.pdf",
        },
      },
    ],
    faqs: [
      {
        q: "Is tesamorelin a growth hormone?",
        a: "No – it prompts your own pituitary to release growth hormone, rather than being GH itself. That is why it is described as a GHRH analog.",
      },
    ],
    tags: ["GH-axis", "GHRH", "approved"],
    claims: [
      {
        text: "FDA-approved to reduce visceral adipose tissue in HIV-associated lipodystrophy, based on two Phase 3 randomized trials.",
        tier: 1,
        source: {
          label: "FDA label – Egrifta SV (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/022505s012s013lbl.pdf",
        },
      },
      {
        text: "Visceral-fat reduction reverses after discontinuation, so benefit depends on continued use.",
        tier: 1,
        source: {
          label: "FDA label – Egrifta SV (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/022505s012s013lbl.pdf",
        },
      },
    ],
    updated: REVIEWED,
    changelog: VERIFIED_LOG,
  },
  {
    slug: "cjc-1295",
    name: "CJC-1295",
    aka: ["CJC-1295 with DAC"],
    class: "Long-acting GHRH analog",
    hook: "One shot, a week of elevated GH and IGF-1.",
    summary:
      "A GHRH analog engineered to bind albumin (via a Drug Affinity Complex, or DAC), stretching its action from minutes to days. A human PK study showed sustained GH and IGF-1 elevation; it remains investigational and is not approved for human use. Note the DAC-free version is a different, short-acting molecule.",
    mechanism:
      "CJC-1295 is a modified GHRH(1-29) fragment. The DAC – an albumin-binding chemical group – latches onto a blood protein so the peptide circulates for days instead of minutes, producing a long, low 'bleed' of growth-hormone release. Remove the DAC and you get 'modified GRF 1-29', which acts for only about half an hour.",
    sequence: {
      residues:
        "Modified GRF(1-29): D-Ala2, Gln8, Ala15, Leu27 substitutions, plus a DAC albumin-binding group",
      note: "'CJC-1295 with DAC' (long-acting) and DAC-free 'modified GRF 1-29' (~30-minute action) are two distinct molecules that are often conflated.",
      source: {
        label: "Teichman et al., 2006 (J Clin Endocrinol Metab)",
        href: "https://pubmed.ncbi.nlm.nih.gov/16352683/",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Not approved for human use in any jurisdiction; investigational only. There is no long-term human safety data.",
      source: {
        label: "Teichman et al., 2006 (J Clin Endocrinol Metab)",
        href: "https://pubmed.ncbi.nlm.nih.gov/16352683/",
      },
    },
    faqs: [
      {
        q: "What's the difference between CJC-1295 with and without DAC?",
        a: "The DAC (Drug Affinity Complex) binds albumin and extends action to several days. Without it, 'modified GRF 1-29' works for roughly 30 minutes. They are not interchangeable, despite often being sold under the same 'CJC-1295' name.",
      },
    ],
    safety: [
      {
        text: "In the single-dose and repeat-dose human PK study, the most common adverse events were transient injection-site reactions, headache, and flushing; no serious drug-related events were reported in the small cohorts studied.",
        source: {
          label: "Teichman et al., 2006 (J Clin Endocrinol Metab)",
          href: "https://pubmed.ncbi.nlm.nih.gov/16352683/",
        },
      },
      {
        text: "Continuous stimulation preserved pulsatile GH secretion rather than flattening it, which argues against a crude override of the axis, though it says nothing about months or years of use.",
        source: {
          label: "Ionescu & Frohman, 2006 (J Clin Endocrinol Metab)",
          href: "https://pubmed.ncbi.nlm.nih.gov/17018654/",
        },
      },
      {
        text: "There are no long-term human safety data. Sustained elevation of GH and IGF-1 is the same exposure that raises theoretical concerns around glucose handling and tumour growth with any GH-axis therapy.",
        source: {
          label: "Teichman et al., 2006 (J Clin Endocrinol Metab)",
          href: "https://pubmed.ncbi.nlm.nih.gov/16352683/",
        },
      },
    ],
    tags: ["GH-axis", "GHRH", "investigational"],
    claims: [
      {
        text: "Raised GH 2–10× (for ≥6 days) and IGF-1 1.5–3× (for 9–11 days) after a single dose in healthy adults; half-life ~6–8 days.",
        tier: 2,
        source: {
          label: "Teichman et al., 2006 (J Clin Endocrinol Metab)",
          href: "https://pubmed.ncbi.nlm.nih.gov/16352683/",
        },
      },
      {
        text: "No approved human indication.",
        tier: 1,
        kind: "regulatory",
        source: {
          label: "Teichman et al., 2006 (J Clin Endocrinol Metab)",
          href: "https://pubmed.ncbi.nlm.nih.gov/16352683/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [
      ...VERIFIED_LOG,
      {
        date: "2026-10-01",
        note: "Added safety section citing the human PK studies.",
      },
    ],
  },
  {
    slug: "ipamorelin",
    name: "Ipamorelin",
    class: "Ghrelin-receptor / GH secretagogue",
    hook: "The selective GH pulse without the cortisol baggage.",
    summary:
      "A pentapeptide ghrelin-receptor agonist that triggers growth-hormone release with little effect on cortisol or prolactin – the selectivity that made it a research favorite. It works by a different mechanism than the GHRH analogs. Human data are modest but real: a PK study in volunteers and one placebo-controlled surgical trial that found it safe but no better than placebo.",
    mechanism:
      "Ipamorelin acts on the ghrelin receptor (GHS-R1a), the same 'hunger hormone' receptor that stimulates growth-hormone secretion – a distinct route from GHRH analogs like tesamorelin. Its appeal in early studies was selectivity: a clean GH pulse without a matching rise in cortisol or prolactin.",
    sequence: {
      residues: "Aib-His-D-2-Nal-D-Phe-Lys-NH₂",
      note: "A pentapeptide with non-natural residues (Aib, D-2-naphthylalanine, D-Phe), so it has no valid one-letter representation – shown in three-letter form.",
      source: {
        label: "Raun et al., 1998 (Eur J Endocrinol)",
        href: "https://pubmed.ncbi.nlm.nih.gov/9849822/",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Not approved; investigational. Explored for post-operative ileus but never reached approval; no long-term human safety data.",
      source: {
        label: "Raun et al., 1998 (Eur J Endocrinol)",
        href: "https://pubmed.ncbi.nlm.nih.gov/9849822/",
      },
    },
    safety: [
      {
        text: "Seven days of twice-daily intravenous ipamorelin was well tolerated in a placebo-controlled surgical trial: adverse-event rates were no higher than placebo in post-operative patients.",
        source: {
          label: "Beck et al., 2014 (Int J Colorectal Dis)",
          href: "https://pubmed.ncbi.nlm.nih.gov/25331030/",
        },
      },
      {
        text: "The selectivity claim – GH release without a matching cortisol or prolactin rise – rests on preclinical work and has not been formally characterized in people over time. No long-term human safety data exist.",
        source: {
          label: "Raun et al., 1998 (Eur J Endocrinol)",
          href: "https://pubmed.ncbi.nlm.nih.gov/9849822/",
        },
      },
    ],
    faqs: [
      {
        q: "Has ipamorelin ever been tested in people?",
        a: "Yes, more than most research peptides. A human PK study mapped its GH response, and a Phase 2 placebo-controlled trial tested it for post-surgical gut recovery. It was well tolerated but did not beat placebo, and the program did not continue.",
      },
      {
        q: "How is ipamorelin different from CJC-1295 or tesamorelin?",
        a: "Different receptor. Ipamorelin mimics ghrelin at the GHS-R1a receptor; CJC-1295 and tesamorelin are GHRH analogs. They are often paired on the theory that the two signals add, but that combination has not been tested in a controlled human trial.",
      },
    ],
    tags: ["GH-axis", "secretagogue", "investigational"],
    claims: [
      {
        text: "Selective GH release with little effect on ACTH, cortisol, or prolactin in preclinical models.",
        tier: 3,
        source: {
          label: "Raun et al., 1998 (Eur J Endocrinol)",
          href: "https://pubmed.ncbi.nlm.nih.gov/9849822/",
        },
      },
      {
        text: "Acts as a ghrelin-receptor (GHS-R1a) agonist – a different mechanism from the GHRH analogs.",
        tier: 3,
        source: {
          label: "Raun et al., 1998 (Eur J Endocrinol)",
          href: "https://pubmed.ncbi.nlm.nih.gov/9849822/",
        },
      },
      {
        text: "Produced a single, dose-dependent GH pulse in healthy volunteers, with a terminal half-life of about two hours.",
        tier: 2,
        source: {
          label: "Gobburu et al., 1999 (Pharm Res)",
          href: "https://pubmed.ncbi.nlm.nih.gov/10496658/",
        },
      },
      {
        text: "Did not shorten time to first tolerated meal versus placebo in a Phase 2 trial of postoperative ileus after bowel resection (n=114).",
        tier: 2,
        source: {
          label: "Beck et al., 2014 (Int J Colorectal Dis)",
          href: "https://pubmed.ncbi.nlm.nih.gov/25331030/",
        },
      },
      {
        text: "No approved human indication; remains investigational.",
        tier: 1,
        kind: "regulatory",
        source: {
          label: "Raun et al., 1998 (Eur J Endocrinol)",
          href: "https://pubmed.ncbi.nlm.nih.gov/9849822/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [
      ...VERIFIED_LOG,
      {
        date: "2026-10-01",
        note: "Added the human PK study and the Phase 2 ileus RCT as Tier 2 claims; added safety and FAQs.",
      },
    ],
  },

  // ── Repair / recovery ─────────────────────────────────────────────────────
  {
    slug: "bpc-157",
    name: "BPC-157",
    aka: ["Body Protection Compound-157"],
    class: "Synthetic pentadecapeptide (gastric-derived)",
    hook: "The repair peptide the research world can't stop talking about.",
    summary:
      "A synthetic 15-amino-acid peptide described as a partial sequence of a protein from gastric juice, studied widely in animal models for tendon, muscle, and gut-lining repair. The preclinical signal is broad but comes largely from one research group – controlled human data is the missing piece.",
    mechanism:
      "In animal work, BPC-157 appears to promote healing by encouraging new blood-vessel growth and modulating growth-factor and nitric-oxide signaling at injury sites. The parent 'Body Protection Compound' protein is not well characterized in protein databases, so the peptide is best described as a synthetic fragment.",
    sequence: {
      residues: "GEPPPGKPADDAGLV",
      note: "A 15-residue synthetic peptide (note the three consecutive prolines). No UniProt entry exists for the isolated peptide, so the sequence is secondary-sourced – not letter-verified against a primary database.",
    },
    regulatory: {
      status: "research-only",
      detail:
        "Not approved for human use in any major jurisdiction. A Phase 2 trial for acute hamstring injury is registered but has no efficacy results yet.",
      source: {
        label: "Safety of intravenous BPC-157 in humans (PubMed)",
        href: "https://pubmed.ncbi.nlm.nih.gov/40131143/",
      },
    },
    safety: [
      {
        text: "No long-term human safety data exist; the only human exposure of note is a two-person intravenous safety pilot. Because supply is grey-market, identity and purity are not assured.",
        source: {
          label: "Safety of intravenous BPC-157 in humans (PubMed)",
          href: "https://pubmed.ncbi.nlm.nih.gov/40131143/",
        },
      },
    ],
    faqs: [
      {
        q: "Does BPC-157 heal injuries in people?",
        a: "That hasn't been shown. The healing evidence is from rodent and in-vitro studies, mostly from a single research group. No completed placebo-controlled human efficacy trial exists yet.",
      },
    ],
    tags: ["repair", "gut", "investigational"],
    claims: [
      {
        text: "Accelerated tendon, muscle, and gut-lining healing in rodent injury models.",
        tier: 3,
        source: {
          label: "Chang et al., 2011 (J Appl Physiol) – via PMC",
          href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6271067/",
        },
      },
      {
        text: "No completed placebo-controlled human efficacy trial; the first Phase 2 RCT is only recently registered.",
        tier: 4,
        source: {
          label: "Safety of intravenous BPC-157 in humans (PubMed)",
          href: "https://pubmed.ncbi.nlm.nih.gov/40131143/",
        },
      },
      {
        text: "No approved human indication in any major regulatory jurisdiction.",
        tier: 1,
        kind: "regulatory",
        source: {
          label: "Safety of intravenous BPC-157 in humans (PubMed)",
          href: "https://pubmed.ncbi.nlm.nih.gov/40131143/",
        },
      },
    ],
    updated: REVIEWED,
    changelog: VERIFIED_LOG,
  },
  {
    slug: "tb-500",
    name: "TB-500",
    aka: ["Thymosin β4 fragment"],
    class: "Synthetic actin-binding fragment of thymosin β4",
    hook: "The migration-and-angiogenesis peptide behind the recovery hype.",
    summary:
      "A short synthetic peptide (Ac-LKKTETQ) taken from the actin-binding motif of thymosin β4. Most of the cited healing research actually used the full 43-amino-acid thymosin β4 protein – not this fragment – a distinction the recovery marketing tends to blur.",
    mechanism:
      "The LKKTET motif in thymosin β4 binds actin and is linked to cell migration, new blood-vessel formation, and wound repair. TB-500 isolates that motif as a small peptide, but it is chemically distinct from the full protein and behaves differently in the body.",
    sequence: {
      residues: "Ac-LKKTETQ",
      note: "A synthetic ~7-residue N-acetylated fragment of thymosin β4 (full protein: 43 residues, UniProt P62328). TB-500 and native thymosin β4 are not interchangeable.",
      source: {
        label: "UniProt – thymosin β4 (P62328)",
        href: "https://www.uniprot.org/uniprotkb/P62328/entry",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Not approved for human use. (Full-length thymosin β4 has been studied clinically for eye conditions, but that is the whole protein, not the TB-500 fragment.)",
      source: {
        label: "UniProt – thymosin β4 (P62328)",
        href: "https://www.uniprot.org/uniprotkb/P62328/entry",
      },
    },
    safety: [
      {
        text: "No human safety data exist for the fragment. Its angiogenesis-promoting activity is a theoretical concern that has not been characterized in people.",
        source: {
          label: "Goldstein et al., 2005 (Ann N Y Acad Sci)",
          href: "https://pubmed.ncbi.nlm.nih.gov/16110805/",
        },
      },
    ],
    faqs: [
      {
        q: "Is TB-500 the same as thymosin β4?",
        a: "No. TB-500 is a small synthetic fragment (Ac-LKKTETQ); thymosin β4 is the full 43-amino-acid protein. Most healing studies used the full protein, so their results don't automatically apply to TB-500.",
      },
    ],
    tags: ["repair", "angiogenesis", "investigational"],
    claims: [
      {
        text: "Full-length thymosin β4 promotes cell migration and angiogenesis in vitro and in animal wound models.",
        tier: 3,
        source: {
          label: "Goldstein et al., 2005 (Ann N Y Acad Sci)",
          href: "https://pubmed.ncbi.nlm.nih.gov/16110805/",
        },
      },
      {
        text: "TB-500 is a synthetic Ac-LKKTETQ fragment of thymosin β4, not the native protein.",
        tier: 1,
        source: {
          label: "UniProt – thymosin β4 (P62328)",
          href: "https://www.uniprot.org/uniprotkb/P62328/entry",
        },
      },
      {
        text: "No human clinical trial has tested the TB-500 fragment itself for recovery or injury.",
        tier: 4,
        source: {
          label: "Goldstein et al., 2012 (Expert Opin Biol Ther)",
          href: "https://pubmed.ncbi.nlm.nih.gov/22074294/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [
      ...VERIFIED_LOG,
      {
        date: "2026-10-01",
        note: "Cited the no-human-trial claim to the 2012 thymosin β4 review, whose trial list covers only the full protein.",
      },
    ],
  },
  {
    slug: "ghk-cu",
    name: "GHK-Cu",
    aka: ["Copper tripeptide-1"],
    class: "Copper-binding tripeptide",
    hook: "The copper peptide that actually earned its place in skincare.",
    summary:
      "A naturally occurring tripeptide (Gly-His-Lys) that chelates copper and upregulates collagen, elastin, and repair signaling. It has the strongest human (topical) evidence of the 'cosmeceutical peptide' group – though those trials are small and short – plus a deep preclinical tissue-remodeling literature.",
    mechanism:
      "GHK grabs a copper(II) ion to form the active GHK-Cu complex, first isolated from human plasma in the 1970s. In skin and cell studies this complex switches on genes for collagen, elastin, and wound repair, and helps remodel damaged tissue.",
    sequence: {
      residues: "GHK",
      note: "The active species is the 1:1 GHK–Cu²⁺ chelate, not the bare peptide.",
      source: {
        label: "Pickart & Margolina, 2018 (review, PMC)",
        href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6073405/",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Used as a cosmetic ingredient, where efficacy claims are unregulated; it has no drug approval for anti-aging. Injectable 'research' GHK-Cu is research-only.",
      source: {
        label: "Pickart & Margolina, 2018 (review, PMC)",
        href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6073405/",
      },
    },
    safety: [
      {
        text: "Topical use is generally well tolerated. The honest caveat is on evidence, not toxicity: the anti-aging trials are few, small, short, and often industry-linked.",
        source: {
          label: "Pickart & Margolina, 2018 (review, PMC)",
          href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6073405/",
        },
      },
    ],
    faqs: [
      {
        q: "Does GHK-Cu really work on skin?",
        a: "There is real controlled human evidence for topical use – better than most 'peptide' skincare – but the trials are small and short-term, so treat it as promising rather than proven.",
      },
    ],
    tags: ["skin", "repair", "cosmetic", "investigational"],
    claims: [
      {
        text: "Upregulates collagen, elastin, and repair/remodeling gene programs across cell and tissue models.",
        tier: 3,
        source: {
          label: "Pickart & Margolina, 2018 (review, PMC)",
          href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6073405/",
        },
      },
      {
        text: "Topical GHK-Cu improved skin density and reduced fine lines vs vehicle over ~12 weeks in small controlled studies.",
        tier: 2,
        source: {
          label: "ClinicalTrials.gov – cosmetic GHK study (NCT03103906)",
          href: "https://clinicaltrials.gov/study/NCT03103906",
        },
      },
    ],
    updated: REVIEWED,
    changelog: VERIFIED_LOG,
  },
  {
    slug: "kpv",
    name: "KPV",
    aka: ["α-MSH (11-13)"],
    class: "Anti-inflammatory tripeptide",
    hook: "The three-residue tail of α-MSH that calms inflammation.",
    summary:
      "A tripeptide from the tail end of alpha-MSH, studied for anti-inflammatory activity in the gut and skin. Its mechanism appears to run largely independent of melanocortin receptors; the preclinical data are real, but human trials are absent.",
    mechanism:
      "Despite coming from α-MSH, KPV's anti-inflammatory effect looks receptor-independent: it is taken into cells by the PepT1 transporter and dampens NF-κB and related inflammatory signaling from the inside, rather than acting as a melanocortin-receptor agonist.",
    sequence: {
      residues: "KPV",
      note: "The C-terminal tripeptide of α-MSH (residues 11–13).",
      source: {
        label: "Dalmasso et al., 2008 (Gastroenterology)",
        href: "https://pubmed.ncbi.nlm.nih.gov/18061177/",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Not approved for human use anywhere; research-only. Low production cost has driven grey-market availability well ahead of any clinical validation.",
      source: {
        label: "Dalmasso et al., 2008 (Gastroenterology)",
        href: "https://pubmed.ncbi.nlm.nih.gov/18061177/",
      },
    },
    faqs: [
      {
        q: "Does KPV work through the melanocortin receptors like α-MSH?",
        a: "Evidence suggests mostly not – its anti-inflammatory action appears to be receptor-independent, via cellular uptake and NF-κB inhibition. All of this is preclinical so far.",
      },
    ],
    safety: [
      {
        text: "No human safety data exist for KPV itself. Its appeal in reviews is precisely that it keeps the anti-inflammatory activity of α-MSH while dropping the pigmentary effect, but that profile has only been shown in cells and animals.",
        source: {
          label: "Brzoska et al., 2008 (Endocr Rev)",
          href: "https://pubmed.ncbi.nlm.nih.gov/18612139/",
        },
      },
    ],
    tags: ["anti-inflammatory", "gut", "investigational"],
    claims: [
      {
        text: "Reduced colitis in mouse models; taken up via the PepT1 transporter and suppresses NF-κB inflammatory signaling.",
        tier: 3,
        source: {
          label: "Dalmasso et al., 2008 (Gastroenterology)",
          href: "https://pubmed.ncbi.nlm.nih.gov/18061177/",
        },
      },
      {
        text: "Anti-inflammatory activity appears largely independent of melanocortin receptors.",
        tier: 3,
        source: {
          label: "Getting et al., 2003 (dissecting α-MSH, PubMed)",
          href: "https://pubmed.ncbi.nlm.nih.gov/12750433/",
        },
      },
      {
        text: "No human clinical trials have been conducted; all efficacy evidence is preclinical.",
        tier: 4,
        source: {
          label: "Brzoska et al., 2008 (Endocr Rev)",
          href: "https://pubmed.ncbi.nlm.nih.gov/18612139/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [
      ...VERIFIED_LOG,
      {
        date: "2026-10-01",
        note: "Added safety section; cited the no-human-trials claim to the Endocrine Reviews overview.",
      },
    ],
  },

  // ── Mitochondrial / longevity ─────────────────────────────────────────────
  {
    slug: "mots-c",
    name: "MOTS-c",
    class: "Mitochondrial-derived peptide",
    hook: "An ‘exercise mimetic’ written into your mitochondrial DNA.",
    summary:
      "A 16-amino-acid peptide encoded within mitochondrial DNA that activates AMPK and improves insulin sensitivity – the closest thing to a molecular echo of exercise. The mechanism work is elegant and Western peer-reviewed; human data is early and mostly associative.",
    mechanism:
      "MOTS-c is encoded inside the mitochondrial 12S rRNA gene. It activates AMPK – a master energy sensor – shifting cells toward glucose use and metabolic stress resistance, which is why it is described as an 'exercise mimetic'. Most administered-peptide data is from mice; human work is correlational.",
    sequence: {
      residues: "MRWQEMGYIFYPRKLR",
      note: "A 16-residue peptide encoded in mitochondrial 12S rRNA; no standard modifications.",
      source: {
        label: "Lee et al., 2015 (Cell Metabolism)",
        href: "https://pubmed.ncbi.nlm.nih.gov/25738459/",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Not an approved drug in any jurisdiction; research-only. There is no interventional human safety data on administered MOTS-c.",
      source: {
        label: "Lee et al., 2015 (Cell Metabolism)",
        href: "https://pubmed.ncbi.nlm.nih.gov/25738459/",
      },
    },
    safety: [
      {
        text: "No interventional human safety data exist for administered MOTS-c. The human findings to date measure the body's own MOTS-c, which rises with exercise, not the effect of injecting it.",
        source: {
          label: "Reynolds et al., 2021 (Nat Commun)",
          href: "https://pubmed.ncbi.nlm.nih.gov/33473109/",
        },
      },
      {
        text: "Mice given MOTS-c into old age tolerated intermittent treatment, but rodent tolerability is a weak guide to human safety, and the senior authors hold a commercial interest in the molecule.",
        source: {
          label: "Reynolds et al., 2021 (Nat Commun)",
          href: "https://pubmed.ncbi.nlm.nih.gov/33473109/",
        },
      },
    ],
    faqs: [
      {
        q: "Is MOTS-c really an exercise mimetic?",
        a: "In mice, yes in the narrow sense: it activates AMPK, improves insulin sensitivity, and raised physical performance even when started late in life. In people, exercise raises natural MOTS-c levels, which is an association, not evidence that taking it reproduces exercise.",
      },
      {
        q: "Has MOTS-c been given to humans in a trial?",
        a: "Not as MOTS-c itself in a published trial. A modified analog was taken into early-phase testing by a biotech company, but those results do not transfer to the native peptide.",
      },
    ],
    tags: ["metabolic", "longevity", "investigational"],
    claims: [
      {
        text: "Activated AMPK and improved insulin sensitivity, reversing diet-induced obesity in mice.",
        tier: 3,
        source: {
          label: "Lee et al., 2015 (Cell Metabolism)",
          href: "https://pubmed.ncbi.nlm.nih.gov/25738459/",
        },
      },
      {
        text: "Plasma MOTS-c levels tracked with insulin sensitivity in lean but not obese people (cross-sectional).",
        tier: 2,
        source: {
          label: "Cataldo et al., 2018 (J Investig Med)",
          href: "https://pubmed.ncbi.nlm.nih.gov/29593067/",
        },
      },
      {
        text: "Intermittent treatment begun late in life increased physical capacity in old mice; in humans, exercise raised endogenous MOTS-c in muscle and blood.",
        tier: 3,
        source: {
          label: "Reynolds et al., 2021 (Nat Commun)",
          href: "https://pubmed.ncbi.nlm.nih.gov/33473109/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [
      ...VERIFIED_LOG,
      {
        date: "2026-10-01",
        note: "Added safety and FAQs; added the 2021 healthspan study.",
      },
    ],
  },
  {
    slug: "epithalon",
    name: "Epithalon",
    aka: ["Epitalon", "AEDG"],
    class: "Pineal tetrapeptide",
    hook: "The telomerase peptide riding decades of Russian longevity claims.",
    summary:
      "A four-amino-acid peptide reported to activate telomerase and modulate melatonin rhythms. There is a published in-vitro telomerase result, but the lifespan and clinical-longevity claims come almost entirely from older, mostly single-group Russian studies – genuine frontier territory.",
    mechanism:
      "Epithalon (Ala-Glu-Asp-Gly) is a synthetic version of a pineal-gland extract. In cultured human cells it has been reported to switch on telomerase, the enzyme that maintains chromosome-protecting telomeres – the basis of the longevity narrative, which remains far from established in people.",
    sequence: {
      residues: "AEDG",
      note: "A synthetic pineal tetrapeptide.",
      source: {
        label: "Khavinson et al., 2003 (Bull Exp Biol Med)",
        href: "https://pubmed.ncbi.nlm.nih.gov/12937682/",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Not approved by any major regulator; not a registered pharmaceutical even in Russia. Research-only, with no modern controlled human safety data.",
      source: {
        label: "Khavinson et al., 2003 (Bull Exp Biol Med)",
        href: "https://pubmed.ncbi.nlm.nih.gov/12937682/",
      },
    },
    faqs: [
      {
        q: "Does epithalon extend lifespan?",
        a: "That claim rests on decades-old, mostly single-group studies and has not been independently replicated at scale. Treat it as an open question, not a demonstrated effect.",
      },
    ],
    safety: [
      {
        text: "No modern, controlled human safety data exist. The long-term clinical reports come from the originating Russian group and are not placebo-controlled by contemporary standards.",
        source: {
          label: "Anisimov & Khavinson, 2010 (Biogerontology)",
          href: "https://pubmed.ncbi.nlm.nih.gov/19830585/",
        },
      },
      {
        text: "Telomerase activation is a double-edged mechanism: the same enzyme that lengthens telomeres is reactivated in most cancers. Rodent studies from the originating group report fewer tumours, not more, but the question is unresolved in people.",
        source: {
          label: "Araj et al., 2025 (Int J Mol Sci)",
          href: "https://pubmed.ncbi.nlm.nih.gov/40141333/",
        },
      },
    ],
    tags: ["longevity", "frontier", "investigational"],
    claims: [
      {
        text: "Induced telomerase (hTERT) activity and telomere elongation in cultured human somatic cells.",
        tier: 3,
        source: {
          label: "Khavinson et al., 2003 (Bull Exp Biol Med)",
          href: "https://pubmed.ncbi.nlm.nih.gov/12937682/",
        },
      },
      {
        text: "Reported lifespan and age-marker effects in rodents and small Russian cohorts; not independently replicated at scale.",
        tier: 4,
        source: {
          label: "Anisimov & Khavinson, 2010 (Biogerontology)",
          href: "https://pubmed.ncbi.nlm.nih.gov/19830585/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [
      ...VERIFIED_LOG,
      {
        date: "2026-10-01",
        note: "Added safety section; cited the longevity claim to the originating group's review.",
      },
    ],
  },

  // ── Neuro / cognition ─────────────────────────────────────────────────────
  {
    slug: "selank",
    name: "Selank",
    class: "Tuftsin-derived heptapeptide",
    hook: "A Russian anxiolytic peptide with no sedation on the label.",
    summary:
      "A synthetic analog of the immunopeptide tuftsin, developed in Russia as an anxiolytic and studied for anxiety and cognition. It is a registered prescription drug in its home market; rigorous international trial data is scarce.",
    mechanism:
      "Selank extends the natural tetrapeptide tuftsin with a Pro-Gly-Pro tail that makes it more stable. It is reported to influence GABA/serotonin signaling and enkephalin turnover, producing anxiety relief without the sedation associated with benzodiazepines – chiefly in Russian studies.",
    sequence: {
      residues: "TKPRPGP",
      note: "Tuftsin (TKPR) plus a stabilizing Pro-Gly-Pro tail. Widely reported but secondary-sourced.",
    },
    regulatory: {
      status: "approved-abroad",
      detail:
        "Registered as a prescription anxiolytic in Russia. Not approved by the FDA or EMA.",
      source: {
        label: "Zozulia et al., 2008 (Selank in GAD, PubMed)",
        href: "https://pubmed.ncbi.nlm.nih.gov/18454096/",
      },
    },
    faqs: [
      {
        q: "Is Selank proven to treat anxiety?",
        a: "It is used clinically in Russia and small studies there report anxiolytic effects, but it has not been validated in large independent Western trials.",
      },
    ],
    safety: [
      {
        text: "In the Russian clinical literature it is described as free of sedation, dependence, and withdrawal, the usual liabilities of GABAergic anxiolytics. Those reports are small and not independently replicated.",
        source: {
          label: "Zozulia et al., 2008 (Selank in GAD, PubMed)",
          href: "https://pubmed.ncbi.nlm.nih.gov/18454096/",
        },
      },
      {
        text: "The proposed mechanism is allosteric modulation of GABA-A receptors, which means interactions with benzodiazepines and other GABAergic drugs are plausible and have not been systematically studied in people.",
        source: {
          label: "Vyunova et al., 2018 (Protein Pept Lett)",
          href: "https://pubmed.ncbi.nlm.nih.gov/30255741/",
        },
      },
    ],
    tags: ["neuro", "anxiolytic", "frontier", "approved-abroad"],
    claims: [
      {
        text: "Comparable anxiolytic effect to a benzodiazepine, with added anti-asthenic effects, in a small Russian study of generalized anxiety and neurasthenia.",
        tier: 4,
        source: {
          label: "Zozulia et al., 2008 (Selank in GAD, PubMed)",
          href: "https://pubmed.ncbi.nlm.nih.gov/18454096/",
        },
      },
      {
        text: "Registered as a prescription anxiolytic in Russia; not approved by the FDA or EMA.",
        tier: 1,
        kind: "regulatory",
        source: {
          label: "Zozulia et al., 2008 (Selank in GAD, PubMed)",
          href: "https://pubmed.ncbi.nlm.nih.gov/18454096/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [
      ...VERIFIED_LOG,
      { date: "2026-10-01", note: "Added safety section." },
    ],
  },
  {
    slug: "semax",
    name: "Semax",
    class: "ACTH (4-10) analog",
    hook: "A nootropic ACTH fragment used clinically in Russia for stroke.",
    summary:
      "A short peptide derived from ACTH, studied for neuroprotection and cognition and used clinically in Russia (including in stroke). It modulates BDNF and dopamine signaling; the mechanism work is Western-indexed, but the clinical efficacy data is overwhelmingly Russian and unreplicated abroad.",
    mechanism:
      "Semax is ACTH(4-7) with a Pro-Gly-Pro tail that removes the hormone activity and adds stability. In animal work it raises BDNF and TrkB signaling – pathways tied to neuron survival and plasticity – the mechanistic basis for its nootropic and neuroprotective reputation.",
    sequence: {
      residues: "MEHFPGP",
      note: "ACTH(4-7) (Met-Glu-His-Phe) plus a stabilizing Pro-Gly-Pro tail.",
      source: {
        label: "Dolotov et al., 2006 (Neuroscience)",
        href: "https://pubmed.ncbi.nlm.nih.gov/16996037/",
      },
    },
    regulatory: {
      status: "approved-abroad",
      detail:
        "Registered in Russia as an intranasal drug for cognitive/cerebrovascular indications and stroke. Not approved by the FDA or EMA.",
      source: {
        label: "Dolotov et al., 2006 (Neuroscience)",
        href: "https://pubmed.ncbi.nlm.nih.gov/16996037/",
      },
    },
    faqs: [
      {
        q: "Is Semax an approved stroke treatment?",
        a: "In Russia it is used clinically, including in stroke care. It has not been approved or validated in large Western randomized trials.",
      },
    ],
    safety: [
      {
        text: "Decades of Russian clinical use, including in stroke patients, have not produced reports of serious drug-related harm, but that record consists of open or lightly controlled studies rather than formal pharmacovigilance.",
        source: {
          label: "Gusev et al., 2018 (Zh Nevrol Psikhiatr)",
          href: "https://pubmed.ncbi.nlm.nih.gov/29798983/",
        },
      },
      {
        text: "Semax raises circulating BDNF in treated patients. Growth-factor elevation is the mechanism behind its claimed benefits and also the reason long-term effects outside the Russian data are an open question.",
        source: {
          label: "Gusev et al., 2018 (Zh Nevrol Psikhiatr)",
          href: "https://pubmed.ncbi.nlm.nih.gov/29798983/",
        },
      },
    ],
    tags: ["neuro", "nootropic", "frontier", "approved-abroad"],
    claims: [
      {
        text: "Regulated BDNF and TrkB expression in rat hippocampus – the mechanistic basis for its nootropic claims.",
        tier: 3,
        source: {
          label: "Dolotov et al., 2006 (Neuroscience)",
          href: "https://pubmed.ncbi.nlm.nih.gov/16996037/",
        },
      },
      {
        text: "Neuroprotective and pro-cognitive effects reported in Russian clinical studies; not independently replicated in Western RCTs.",
        tier: 4,
        source: {
          label: "Gusev et al., 2018 (Zh Nevrol Psikhiatr)",
          href: "https://pubmed.ncbi.nlm.nih.gov/29798983/",
        },
      },
      {
        text: "Registered in Russia as an intranasal drug; not approved by the FDA or EMA.",
        tier: 1,
        kind: "regulatory",
        source: {
          label: "Dolotov et al., 2006 (Neuroscience)",
          href: "https://pubmed.ncbi.nlm.nih.gov/16996037/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [
      ...VERIFIED_LOG,
      {
        date: "2026-10-01",
        note: "Added safety section; cited the Russian stroke data.",
      },
    ],
  },

  // ── Immune ────────────────────────────────────────────────────────────────
  {
    slug: "thymosin-alpha-1",
    name: "Thymosin alpha-1",
    aka: ["Thymalfasin", "Zadaxin"],
    class: "Immunomodulatory peptide",
    hook: "An immune-tuning peptide approved across dozens of countries.",
    summary:
      "A 28-amino-acid peptide that boosts T-helper and NK-cell responses. Approved in dozens of countries (not the US) for chronic hepatitis and as a vaccine adjuvant, with randomized trial data in viral hepatitis and severe sepsis – the best-replicated of the immune/longevity group.",
    mechanism:
      "Thymosin alpha-1 is the acetylated N-terminal fragment of prothymosin alpha. It nudges the immune system toward a Th1 (antiviral) response and enhances T-cell and natural-killer-cell activity, partly through Toll-like-receptor signaling – useful where immunity is blunted, as in chronic infection.",
    sequence: {
      residues: "Ac-SDAAVDTSSEITTKDLKEKKEVVEEAEN",
      note: "The acetylated N-terminal 28 residues of prothymosin alpha; the N-acetylation is required for activity.",
      source: {
        label: "UniProt – prothymosin alpha (P06454)",
        href: "https://www.uniprot.org/uniprotkb/P06454/entry",
      },
    },
    regulatory: {
      status: "approved-abroad",
      detail:
        "Approved in dozens of countries (as Zadaxin / thymalfasin) for chronic hepatitis B/C and as a vaccine adjuvant. Not FDA-approved in the United States.",
      source: {
        label: "Naylor, 1999 (Expert Opin Investig Drugs)",
        href: "https://pubmed.ncbi.nlm.nih.gov/15992078/",
      },
    },
    safety: [
      {
        text: "Generally well tolerated in trials. The clinical evidence base is real but heterogeneous, with some studies limited by design quality – read meta-analyses with that caveat.",
        source: {
          label: "Wu et al., 2013 (ETASS, Critical Care)",
          href: "https://pubmed.ncbi.nlm.nih.gov/23327199/",
        },
      },
    ],
    faqs: [
      {
        q: "Is thymosin alpha-1 FDA-approved?",
        a: "No – it is approved in many other countries (as Zadaxin) but not in the United States, where it remains investigational.",
      },
    ],
    tags: ["immune", "antiviral", "approved-abroad"],
    claims: [
      {
        text: "Studied in chronic viral hepatitis, alone and combined with interferon.",
        tier: 2,
        source: {
          label: "Naylor, 1999 (Expert Opin Investig Drugs)",
          href: "https://pubmed.ncbi.nlm.nih.gov/15992078/",
        },
      },
      {
        text: "Improved immune measures and 28-day outcomes in severe sepsis in a multicenter randomized trial (ETASS).",
        tier: 2,
        source: {
          label: "Wu et al., 2013 (ETASS, Critical Care)",
          href: "https://pubmed.ncbi.nlm.nih.gov/23327199/",
        },
      },
    ],
    updated: REVIEWED,
    changelog: VERIFIED_LOG,
  },

  // ── Melanocortin ──────────────────────────────────────────────────────────
  {
    slug: "bremelanotide",
    name: "Bremelanotide",
    aka: ["PT-141", "Vyleesi"],
    class: "Melanocortin receptor agonist",
    hook: "The FDA-approved libido peptide that skips the vascular route.",
    summary:
      "A cyclic melanocortin-receptor agonist that acts centrally on sexual desire rather than on blood flow. It is FDA-approved (Vyleesi, 2019) for acquired hypoactive sexual desire disorder in premenopausal women, based on two Phase 3 trials. Structurally it is the near-twin of melanotan II – differing by a C-terminal acid.",
    mechanism:
      "Bremelanotide is a non-selective melanocortin agonist, but its therapeutic effect is attributed to central MC4R/MC3R activity in brain circuits governing sexual desire – a fundamentally different route from blood-flow drugs like the PDE5 inhibitors.",
    sequence: {
      residues: "Ac-Nle-cyclo(Asp-His-D-Phe-Arg-Trp-Lys)-OH",
      note: "A cyclic lactam heptapeptide with N-acetylation, non-natural Nle, and a D-Phe. It differs from melanotan II only by a C-terminal free acid (vs amide).",
      source: {
        label: "FDA label – Vyleesi (accessdata)",
        href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210557s000lbl.pdf",
      },
    },
    regulatory: {
      status: "approved",
      detail:
        "FDA-approved (Vyleesi, 2019) for acquired, generalized hypoactive sexual desire disorder (HSDD) in premenopausal women.",
      source: {
        label: "FDA label – Vyleesi (accessdata)",
        href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210557s000lbl.pdf",
      },
    },
    safety: [
      {
        text: "The label documents transient increases in blood pressure and decreases in heart rate after each dose, plus nausea and focal hyperpigmentation; it is not for people with uncontrolled hypertension or known cardiovascular disease.",
        source: {
          label: "FDA label – Vyleesi (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210557s000lbl.pdf",
        },
      },
    ],
    faqs: [
      {
        q: "How is bremelanotide different from melanotan II?",
        a: "They share almost the same structure, but bremelanotide ends in a free acid and was refined toward central MC4R activity – becoming an FDA-approved drug. Melanotan II stayed broad-spectrum (including MC1R tanning), unapproved, and carries the safety concerns.",
      },
    ],
    tags: ["melanocortin", "sexual-health", "approved"],
    claims: [
      {
        text: "FDA-approved for HSDD in premenopausal women, based on two Phase 3 trials (RECONNECT).",
        tier: 1,
        source: {
          label: "FDA label – Vyleesi (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210557s000lbl.pdf",
        },
      },
      {
        text: "Acts centrally as a melanocortin (MC4R/MC3R) agonist rather than on vascular blood flow.",
        tier: 1,
        source: {
          label: "FDA label – Vyleesi (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210557s000lbl.pdf",
        },
      },
    ],
    updated: REVIEWED,
    changelog: VERIFIED_LOG,
  },
  {
    slug: "melanotan-ii",
    name: "Melanotan II",
    aka: ["MT-II"],
    class: "Melanocortin receptor agonist",
    hook: "The tanning-and-libido peptide that never made it to approval.",
    summary:
      "A broad-spectrum melanocortin agonist studied for pigmentation and sexual function. Its mechanism is well characterized, but it has no regulatory approval and carries documented safety concerns from unregulated use – a frontier compound with real caveats.",
    mechanism:
      "Melanotan II is a potent full agonist across MC1R, MC3R, MC4R, and MC5R. MC1R activation drives melanin production (tanning); MC3R/MC4R activity affects appetite and sexual response. That receptor breadth – especially MC1R – is what separates it from the central-MC4R-weighted bremelanotide.",
    sequence: {
      residues: "Ac-Nle-cyclo(Asp-His-D-Phe-Arg-Trp-Lys)-NH₂",
      note: "A cyclic lactam heptapeptide; identical to bremelanotide except for a C-terminal amide (vs free acid).",
      source: {
        label: "Dorr et al., 1996 (Life Sci, Phase I)",
        href: "https://pubmed.ncbi.nlm.nih.gov/8637402/",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "No regulatory approval for human use in any major jurisdiction; sold only as an unlicensed grey-market injectable. Only early Phase I and small pigmentation studies were ever conducted.",
      source: {
        label: "Dorr et al., 1996 (Life Sci, Phase I)",
        href: "https://pubmed.ncbi.nlm.nih.gov/8637402/",
      },
    },
    safety: [
      {
        text: "Documented adverse events from unregulated use include rhabdomyolysis with renal dysfunction, priapism, and darkening or atypia of moles, with case reports of melanoma. These are case-report grade – real signals, not established frequencies – compounded by contamination risk from unlicensed supply.",
        source: {
          label: "Case report: MT-II toxicity and rhabdomyolysis (PubMed)",
          href: "https://pubmed.ncbi.nlm.nih.gov/23121206/",
        },
      },
    ],
    faqs: [
      {
        q: "Is Melanotan II safe for tanning?",
        a: "It is unapproved, and case reports link it to serious harms – rhabdomyolysis, priapism, and changes to moles including melanoma. Dermatologists caution against it.",
      },
    ],
    tags: ["melanocortin", "pigmentation", "frontier", "investigational"],
    claims: [
      {
        text: "A broad-spectrum α-MSH analog and potent agonist at MC1R/MC3R/MC4R, driving pigmentation and sexual response (early human Phase I).",
        tier: 2,
        source: {
          label: "Dorr et al., 1996 (Life Sci, Phase I)",
          href: "https://pubmed.ncbi.nlm.nih.gov/8637402/",
        },
      },
      {
        text: "Systemic toxicity including rhabdomyolysis and renal dysfunction has been reported after injection.",
        tier: 2,
        source: {
          label: "Case report: MT-II toxicity and rhabdomyolysis (PubMed)",
          href: "https://pubmed.ncbi.nlm.nih.gov/23121206/",
        },
      },
      {
        text: "No approved human indication in any jurisdiction.",
        tier: 1,
        kind: "regulatory",
        source: {
          label: "Dorr et al., 1996 (Life Sci, Phase I)",
          href: "https://pubmed.ncbi.nlm.nih.gov/8637402/",
        },
      },
    ],
    updated: REVIEWED,
    changelog: VERIFIED_LOG,
  },
  // ── Added 2026-10-01: a deliberate widening, one batch per browse gap ──
  {
    slug: "liraglutide",
    name: "Liraglutide",
    aka: ["Saxenda", "Victoza"],
    class: "GLP-1 receptor agonist",
    hook: "The daily GLP-1 that proved the class before semaglutide.",
    summary:
      "A once-daily acylated GLP-1 analog, FDA-approved for type 2 diabetes (2010) and chronic weight management (2014). It delivers less weight loss than its weekly successors but carries a completed cardiovascular-outcomes trial and a long safety record. Now largely a generic-era benchmark.",
    mechanism:
      "Liraglutide is native GLP-1 with a fatty-acid chain attached, so it binds albumin and survives about a day instead of minutes. It slows gastric emptying, raises glucose-dependent insulin release, and acts on appetite circuits in the brain – the same mechanism semaglutide later stretched to a weekly schedule.",
    sequence: {
      residues: "HAEGTFTSDVSSYLEGQAAKEFIAWLVRGRG",
      note: "GLP-1(7-37) with Lys34→Arg and a C16 palmitoyl chain on Lys26 via a γ-glutamyl spacer.",
      source: {
        label: "FDA label – Saxenda (accessdata)",
        href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2014/206321Orig1s000lbl.pdf",
      },
    },
    regulatory: {
      status: "approved",
      detail:
        "FDA-approved as Victoza for type 2 diabetes (2010) and as Saxenda for chronic weight management (2014). Generic liraglutide is now available.",
      source: {
        label: "FDA label – Saxenda (accessdata)",
        href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2014/206321Orig1s000lbl.pdf",
      },
    },
    safety: [
      {
        text: "Nausea, diarrhea and constipation lead the adverse-event list and fade for most people. The label carries the class boxed warning for thyroid C-cell tumors seen in rodents, and contraindicates use with a personal or family history of medullary thyroid carcinoma or MEN 2.",
        source: {
          label: "FDA label – Saxenda (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2014/206321Orig1s000lbl.pdf",
        },
      },
      {
        text: "In the LEADER outcomes trial, serious adverse events were no more frequent than placebo over a median of nearly four years, the longest controlled exposure for any GLP-1 agonist at the time.",
        source: {
          label: "Marso et al., 2016 (NEJM, LEADER)",
          href: "https://pubmed.ncbi.nlm.nih.gov/27295427/",
        },
      },
    ],
    faqs: [
      {
        q: "Why choose liraglutide over semaglutide?",
        a: "Usually cost or availability: it is older and generic. On weight loss it is clearly weaker. On cardiovascular protection in type 2 diabetes it has its own positive outcomes trial, so it is not a lesser drug on every axis.",
      },
      {
        q: "Is the daily injection a disadvantage?",
        a: "For adherence, yes, compared with weekly agents. Pharmacologically the daily schedule just reflects a shorter half-life; the receptor and the effects are the same.",
      },
    ],
    tags: ["metabolic", "GLP-1", "approved"],
    claims: [
      {
        text: "Produced 8.0% mean body-weight loss vs 2.6% on placebo over 56 weeks in adults without diabetes (SCALE).",
        tier: 1,
        source: {
          label: "Pi-Sunyer et al., 2015 (NEJM, SCALE)",
          href: "https://pubmed.ncbi.nlm.nih.gov/26132939/",
        },
      },
      {
        text: "Reduced major adverse cardiovascular events (hazard ratio 0.87) in type 2 diabetes at high cardiovascular risk (LEADER).",
        tier: 1,
        source: {
          label: "Marso et al., 2016 (NEJM, LEADER)",
          href: "https://pubmed.ncbi.nlm.nih.gov/27295427/",
        },
      },
      {
        text: "FDA-approved for type 2 diabetes and for chronic weight management.",
        tier: 1,
        kind: "regulatory",
        source: {
          label: "FDA label – Saxenda (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2014/206321Orig1s000lbl.pdf",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [{ date: "2026-10-01", note: "Entry added." }],
  },
  {
    slug: "cagrilintide",
    name: "Cagrilintide",
    aka: ["NN9838", "CagriSema (with semaglutide)"],
    class: "Long-acting amylin analog",
    hook: "The amylin half of the next weight-loss combination.",
    summary:
      "A once-weekly, lipidated analog of amylin, the pancreatic satiety hormone. Alone it produced weight loss comparable to liraglutide in Phase 2; paired with semaglutide as CagriSema it reached the low twenties in Phase 3. It is not approved in any form.",
    mechanism:
      "Amylin is co-released with insulin and signals fullness through the brainstem, slowing gastric emptying and suppressing glucagon. Cagrilintide is a stabilized, fatty-acid-linked version built to last a week. Its appeal is additivity: amylin and GLP-1 act on different receptors, so the combination can outdo either alone.",
    sequence: {
      residues:
        "37-residue amylin analog with stabilizing substitutions and a C20 fatty-diacid side chain",
      note: "Described rather than spelled out: the exact substitutions are in the sponsor's chemistry papers and have not been letter-verified here.",
      source: {
        label: "Lau et al., 2021 (Lancet, Phase 2)",
        href: "https://pubmed.ncbi.nlm.nih.gov/34798060/",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Investigational. Neither cagrilintide alone nor the CagriSema combination is approved anywhere as of this review; Phase 3 results for the combination were published in 2025.",
      source: {
        label: "Garvey et al., 2025 (NEJM, REDEFINE 1)",
        href: "https://pubmed.ncbi.nlm.nih.gov/40544433/",
      },
    },
    safety: [
      {
        text: "Gastrointestinal events, mainly nausea, were more common than placebo at every dose in Phase 2, along with injection-site reactions; discontinuation rates were similar across groups.",
        source: {
          label: "Lau et al., 2021 (Lancet, Phase 2)",
          href: "https://pubmed.ncbi.nlm.nih.gov/34798060/",
        },
      },
      {
        text: "In the Phase 3 combination trial, gastrointestinal adverse events affected about four in five participants on CagriSema versus two in five on placebo, mostly transient and mild to moderate.",
        source: {
          label: "Garvey et al., 2025 (NEJM, REDEFINE 1)",
          href: "https://pubmed.ncbi.nlm.nih.gov/40544433/",
        },
      },
    ],
    faqs: [
      {
        q: "Is cagrilintide a GLP-1 drug?",
        a: "No. It mimics amylin, a different hormone with a different receptor. That is exactly why it is being paired with semaglutide: the two signals add rather than overlap.",
      },
      {
        q: "How much does cagrilintide add to semaglutide?",
        a: "In REDEFINE 1 the combination produced about 20% weight loss at 68 weeks against 3% on placebo. The trial also ran each drug alone, and the combination beat both arms.",
      },
    ],
    tags: ["metabolic", "amylin", "investigational"],
    claims: [
      {
        text: "Produced 6.0% to 10.8% mean weight loss across doses vs 3.0% on placebo over 26 weeks, and beat liraglutide at the top dose (Phase 2).",
        tier: 2,
        source: {
          label: "Lau et al., 2021 (Lancet, Phase 2)",
          href: "https://pubmed.ncbi.nlm.nih.gov/34798060/",
        },
      },
      {
        text: "Combined with semaglutide (CagriSema), produced 20.4% mean weight loss vs 3.0% on placebo at 68 weeks in a Phase 3 trial of 3,417 adults.",
        tier: 2,
        source: {
          label: "Garvey et al., 2025 (NEJM, REDEFINE 1)",
          href: "https://pubmed.ncbi.nlm.nih.gov/40544433/",
        },
      },
      {
        text: "No approved indication in any jurisdiction.",
        tier: 1,
        kind: "regulatory",
        source: {
          label: "Garvey et al., 2025 (NEJM, REDEFINE 1)",
          href: "https://pubmed.ncbi.nlm.nih.gov/40544433/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [{ date: "2026-10-01", note: "Entry added." }],
  },
  {
    slug: "sermorelin",
    name: "Sermorelin",
    aka: ["GHRH(1-29)", "Geref"],
    class: "GHRH analog",
    hook: "The once-approved GHRH analog that lives on in compounding.",
    summary:
      "The shortest fragment of growth-hormone-releasing hormone that keeps full activity. It was an FDA-approved diagnostic and pediatric treatment (Geref) until the manufacturer discontinued it in 2008, and it is now widely compounded for adult use that was never on the label. The pediatric evidence is real; the adult anti-aging use is not studied.",
    mechanism:
      "Sermorelin is the first 29 residues of native GHRH(1-44). It binds the GHRH receptor on pituitary somatotrophs and triggers a physiological pulse of growth hormone, subject to the body's own feedback – which is the argument made for it over injecting GH directly.",
    sequence: {
      residues: "YADAIFTNSYRKVLGQLSARKLLQDIMSR-NH₂",
      note: "Human GHRH(1-29) amide, unmodified. Tesamorelin and CJC-1295 are both built on this backbone.",
      source: {
        label: "Prakash & Goa, 1999 (BioDrugs review)",
        href: "https://pubmed.ncbi.nlm.nih.gov/18031173/",
      },
    },
    regulatory: {
      status: "withdrawn",
      detail:
        "Approved in the US as Geref for diagnosis and then treatment of pediatric growth hormone deficiency; the manufacturer discontinued it in 2008 for reasons unrelated to safety or effectiveness. No approved product exists today, and compounded sermorelin is unapproved.",
      source: {
        label: "Prakash & Goa, 1999 (BioDrugs review)",
        href: "https://pubmed.ncbi.nlm.nih.gov/18031173/",
      },
    },
    safety: [
      {
        text: "In the pediatric program the main adverse effects were injection-site reactions and transient flushing; no serious drug-related harm emerged in the trials reviewed. Adult, long-term, or anti-aging use has no controlled safety data.",
        source: {
          label: "Prakash & Goa, 1999 (BioDrugs review)",
          href: "https://pubmed.ncbi.nlm.nih.gov/18031173/",
        },
      },
    ],
    faqs: [
      {
        q: "Is sermorelin FDA-approved?",
        a: "It was. The approved product was withdrawn from the market in 2008 for commercial reasons, so what is prescribed today is compounded and unapproved. The approval covered children with growth hormone deficiency, not adults.",
      },
      {
        q: "Does it work for anti-aging in adults?",
        a: "That has not been tested in a controlled trial. It reliably raises growth hormone, which is a different thing from improving an outcome.",
      },
    ],
    tags: ["GH-axis", "GHRH", "frontier"],
    claims: [
      {
        text: "Increased height velocity over 12 months in prepubertal children with idiopathic GH deficiency, with limited data suggesting the effect persists to 36 months.",
        tier: 2,
        source: {
          label: "Prakash & Goa, 1999 (BioDrugs review)",
          href: "https://pubmed.ncbi.nlm.nih.gov/18031173/",
        },
      },
      {
        text: "Produces a rapid, relatively specific GH response used diagnostically for GH deficiency.",
        tier: 2,
        source: {
          label: "Prakash & Goa, 1999 (BioDrugs review)",
          href: "https://pubmed.ncbi.nlm.nih.gov/18031173/",
        },
      },
      {
        text: "Formerly FDA-approved (Geref) for pediatric GH deficiency; discontinued in 2008, no approved product today.",
        tier: 1,
        kind: "regulatory",
        source: {
          label: "Prakash & Goa, 1999 (BioDrugs review)",
          href: "https://pubmed.ncbi.nlm.nih.gov/18031173/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [{ date: "2026-10-01", note: "Entry added." }],
  },
  {
    slug: "ghrp-2",
    name: "GHRP-2",
    aka: ["Pralmorelin", "KP-102"],
    class: "Ghrelin-receptor / GH secretagogue",
    hook: "The GH-releasing peptide that became a diagnostic test in Japan.",
    summary:
      "A synthetic hexapeptide from the growth-hormone-releasing-peptide family that acts on the ghrelin receptor. It produces a strong GH pulse in children and adults, strong enough that Japan uses it as a stimulation test for GH deficiency. It has never been approved as a treatment anywhere.",
    mechanism:
      "GHRP-2 is a ghrelin-receptor (GHS-R1a) agonist that acts directly on pituitary somatotrophs and on the hypothalamus. Given with GHRH the two signals are synergistic, which is the physiological basis for the secretagogue-plus-GHRH combinations now sold in grey markets.",
    sequence: {
      residues: "D-Ala-D-2-Nal-Ala-Trp-D-Phe-Lys-NH₂",
      note: "A hexapeptide with three D-amino acids and a naphthylalanine, so no one-letter form applies.",
      source: {
        label: "Pihoker et al., 1995 (J Clin Endocrinol Metab)",
        href: "https://pubmed.ncbi.nlm.nih.gov/7559885/",
      },
    },
    regulatory: {
      status: "approved-abroad",
      detail:
        "Used in Japan as a GH stimulation test (pralmorelin) for diagnosing adult GH deficiency. Not approved as a treatment anywhere, and not approved in any form by the FDA or EMA.",
      source: {
        label: "Kinoshita et al., 2013 (Endocr J)",
        href: "https://pubmed.ncbi.nlm.nih.gov/23079545/",
      },
    },
    safety: [
      {
        text: "Single diagnostic doses have been well tolerated in children and adults, including intranasally. Nothing is known about long-term or repeated use, and secretagogues of this family also stimulate ACTH and cortisol.",
        source: {
          label: "Pihoker et al., 1995 (J Clin Endocrinol Metab)",
          href: "https://pubmed.ncbi.nlm.nih.gov/7559885/",
        },
      },
    ],
    faqs: [
      {
        q: "Is GHRP-2 approved?",
        a: "Only as a one-off diagnostic test in Japan. There is no approved therapeutic use of GHRP-2 anywhere, and the diagnostic record says nothing about what repeated dosing does.",
      },
    ],
    tags: ["GH-axis", "secretagogue", "approved-abroad"],
    claims: [
      {
        text: "Produced GH responses in children equal to GHRH and synergistic with it; intranasal doses were effective and well tolerated.",
        tier: 2,
        source: {
          label: "Pihoker et al., 1995 (J Clin Endocrinol Metab)",
          href: "https://pubmed.ncbi.nlm.nih.gov/7559885/",
        },
      },
      {
        text: "As a stimulation test, produced higher peak GH than the insulin tolerance test with high sensitivity and specificity for severe adult GH deficiency.",
        tier: 2,
        source: {
          label: "Kinoshita et al., 2013 (Endocr J)",
          href: "https://pubmed.ncbi.nlm.nih.gov/23079545/",
        },
      },
      {
        text: "Used as a diagnostic agent in Japan; no approved therapeutic indication anywhere.",
        tier: 1,
        kind: "regulatory",
        source: {
          label: "Kinoshita et al., 2013 (Endocr J)",
          href: "https://pubmed.ncbi.nlm.nih.gov/23079545/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [{ date: "2026-10-01", note: "Entry added." }],
  },
  {
    slug: "ghrp-6",
    name: "GHRP-6",
    class: "Ghrelin-receptor / GH secretagogue",
    hook: "The unnatural peptide that led researchers to ghrelin.",
    summary:
      "The original growth-hormone-releasing peptide, a synthetic hexapeptide designed in the 1980s before anyone knew what receptor it hit. The hunt for that receptor produced ghrelin. It releases GH in people by every route tested, raises cortisol as well, and was never developed as a drug.",
    mechanism:
      "GHRP-6 is a ghrelin-receptor (GHS-R1a) agonist. It was built by trial and error from enkephalin fragments; its receptor was cloned in 1996 and the natural ligand, ghrelin, was found in 1999. It stimulates GH directly at the pituitary and through the hypothalamus, and in people it also stimulates ACTH and cortisol and provokes hunger.",
    sequence: {
      residues: "His-D-Trp-Ala-Trp-D-Phe-Lys-NH₂",
      note: "A hexapeptide with two D-amino acids, so no one-letter form applies.",
      source: {
        label: "Bowers, 2001 (J Clin Endocrinol Metab review)",
        href: "https://pubmed.ncbi.nlm.nih.gov/11297568/",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Never approved in any jurisdiction. A research tool with a short human-study record in the 1990s, now sold in grey markets.",
      source: {
        label: "Bowers, 2001 (J Clin Endocrinol Metab review)",
        href: "https://pubmed.ncbi.nlm.nih.gov/11297568/",
      },
    },
    safety: [
      {
        text: "In healthy men it raised ACTH and cortisol overnight alongside GH, the opposite of GHRH, which blunts cortisol. That is the clearest difference from ipamorelin, and the reason 'selective' secretagogues were developed.",
        source: {
          label: "Frieboes et al., 1995 (Neuroendocrinology)",
          href: "https://pubmed.ncbi.nlm.nih.gov/7617137/",
        },
      },
      {
        text: "No long-term human safety data exist. The hunger-promoting effect of ghrelin-receptor agonists is well documented and is a feature, not a side effect, of the mechanism.",
        source: {
          label: "Bowers, 2001 (J Clin Endocrinol Metab review)",
          href: "https://pubmed.ncbi.nlm.nih.gov/11297568/",
        },
      },
    ],
    faqs: [
      {
        q: "How does GHRP-6 differ from ipamorelin?",
        a: "Same receptor, different selectivity. GHRP-6 raises cortisol and prolactin along with GH in human studies; ipamorelin was engineered to avoid that, at least in preclinical work. GHRP-6 is also the stronger appetite stimulant.",
      },
    ],
    tags: ["GH-axis", "secretagogue", "investigational"],
    claims: [
      {
        text: "Raised overnight GH, ACTH and cortisol and increased stage 2 sleep in healthy men (placebo-controlled).",
        tier: 2,
        source: {
          label: "Frieboes et al., 1995 (Neuroendocrinology)",
          href: "https://pubmed.ncbi.nlm.nih.gov/7617137/",
        },
      },
      {
        text: "Given orally to short-statured children, produced a GH response comparable to intravenous GHRH.",
        tier: 2,
        source: {
          label: "Bellone et al., 1995 (Eur J Endocrinol)",
          href: "https://pubmed.ncbi.nlm.nih.gov/7581965/",
        },
      },
      {
        text: "Acts at the ghrelin receptor; its discovery led to the identification of GHS-R and of ghrelin itself.",
        tier: 3,
        source: {
          label: "Bowers, 2001 (J Clin Endocrinol Metab review)",
          href: "https://pubmed.ncbi.nlm.nih.gov/11297568/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [{ date: "2026-10-01", note: "Entry added." }],
  },
  {
    slug: "hexarelin",
    name: "Hexarelin",
    aka: ["Examorelin"],
    class: "Ghrelin-receptor / GH secretagogue",
    hook: "The potent secretagogue with a heart story that never left the lab.",
    summary:
      "A methylated analog of GHRP-6 and one of the strongest peptide GH secretagogues tested in people. Human studies mapped its GH, prolactin and cortisol effects in detail in the 1990s and early 2000s. The cardioprotective claims that circulate rest on isolated rat hearts.",
    mechanism:
      "Hexarelin is GHRP-6 with a methyl group on the tryptophan, making it more stable and more potent. It acts at the ghrelin receptor to release GH, and in people also drives ACTH and cortisol, apparently through vasopressin. A separate cardiac binding site (CD36) is proposed to explain its effects on heart tissue in animals.",
    sequence: {
      residues: "His-D-2-Me-Trp-Ala-Trp-D-Phe-Lys-NH₂",
      note: "GHRP-6 with 2-methyl-D-tryptophan in position 2. Three-letter form; no one-letter equivalent.",
      source: {
        label: "Maccario et al., 2002 (Eur J Endocrinol)",
        href: "https://pubmed.ncbi.nlm.nih.gov/11888836/",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Never approved in any jurisdiction. Studied as a diagnostic test of pituitary reserve and as an experimental secretagogue; no therapeutic program reached registration.",
      source: {
        label: "Korbonits et al., 1999 (Clin Endocrinol)",
        href: "https://pubmed.ncbi.nlm.nih.gov/10469018/",
      },
    },
    safety: [
      {
        text: "Single doses in healthy volunteers raise ACTH and cortisol as well as GH and prolactin, and produce a small acute rise in appetite. Repeated daily injections blunted the GH response within a day, an early sign of tachyphylaxis.",
        source: {
          label: "Maccario et al., 2002 (Eur J Endocrinol)",
          href: "https://pubmed.ncbi.nlm.nih.gov/11888836/",
        },
      },
      {
        text: "No long-term human safety data exist. The cardiac effects reported in animals have not been examined in people.",
        source: {
          label: "Torsello et al., 2001 (Endocrine)",
          href: "https://pubmed.ncbi.nlm.nih.gov/11322492/",
        },
      },
    ],
    faqs: [
      {
        q: "Is hexarelin good for the heart?",
        a: "In isolated rat hearts it protected against damage from calcium deprivation, independently of GH. No human study has tested a cardiac outcome. That is a hypothesis with a mechanism, not a benefit.",
      },
    ],
    tags: ["GH-axis", "secretagogue", "investigational"],
    claims: [
      {
        text: "Two or three daily injections raised 24-hour GH secretion in healthy men without changing IGF-1, prolactin, ACTH or cortisol over one day.",
        tier: 2,
        source: {
          label: "Maccario et al., 2002 (Eur J Endocrinol)",
          href: "https://pubmed.ncbi.nlm.nih.gov/11888836/",
        },
      },
      {
        text: "Produced higher peak GH than insulin-induced hypoglycemia as a test of pituitary reserve in patients with pituitary disease.",
        tier: 2,
        source: {
          label: "Korbonits et al., 1999 (Clin Endocrinol)",
          href: "https://pubmed.ncbi.nlm.nih.gov/10469018/",
        },
      },
      {
        text: "Protected isolated rat hearts from calcium-paradox damage, an effect GH itself did not reproduce.",
        tier: 3,
        source: {
          label: "Torsello et al., 2001 (Endocrine)",
          href: "https://pubmed.ncbi.nlm.nih.gov/11322492/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [{ date: "2026-10-01", note: "Entry added." }],
  },
  {
    slug: "afamelanotide",
    name: "Afamelanotide",
    aka: ["Scenesse", "Melanotan I", "[Nle4, D-Phe7]-α-MSH"],
    class: "Melanocortin receptor agonist",
    hook: "The tanning peptide that became an orphan drug for light intolerance.",
    summary:
      "A stabilized α-MSH analog that darkens skin through MC1R. It is FDA-approved (Scenesse, 2019) as an implant for erythropoietic protoporphyria, a rare disorder where sunlight causes severe pain. It is the molecule grey-market 'melanotan I' claims to be.",
    mechanism:
      "Two substitutions make α-MSH resistant to breakdown and more potent at the melanocortin-1 receptor on melanocytes. The result is eumelanin production without UV exposure. In protoporphyria the extra pigment and the receptor's antioxidant effects raise the threshold for phototoxic reactions.",
    sequence: {
      residues: "Ac-Ser-Tyr-Ser-Nle-Glu-His-D-Phe-Arg-Trp-Gly-Lys-Pro-Val-NH₂",
      note: "α-MSH with Met4→Nle and Phe7→D-Phe; linear, 13 residues.",
      source: {
        label: "FDA label – Scenesse (accessdata)",
        href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210797s000lbl.pdf",
      },
    },
    regulatory: {
      status: "approved",
      detail:
        "FDA-approved (Scenesse, 2019) as a subcutaneous implant to increase pain-free light exposure in adults with erythropoietic protoporphyria; approved by the EMA in 2014.",
      source: {
        label: "FDA label – Scenesse (accessdata)",
        href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210797s000lbl.pdf",
      },
    },
    safety: [
      {
        text: "The label lists implant-site reactions, nausea, headache and skin hyperpigmentation, and recommends full-body skin examination because the drug darkens existing moles and may make skin cancers harder to spot.",
        source: {
          label: "FDA label – Scenesse (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210797s000lbl.pdf",
        },
      },
      {
        text: "In the two pivotal trials adverse events were mostly mild and serious events were not judged drug-related. The approved product is a controlled-release implant; injectable 'melanotan I' sold online has none of that safety record.",
        source: {
          label: "Langendonk et al., 2015 (NEJM)",
          href: "https://pubmed.ncbi.nlm.nih.gov/26132941/",
        },
      },
    ],
    faqs: [
      {
        q: "Is afamelanotide the same as melanotan II?",
        a: "No. Afamelanotide is a linear α-MSH analog selective enough for MC1R to be approved as a drug. Melanotan II is a cyclic, broad-spectrum agonist that also hits MC4R, which is why it affects libido, and it was never approved.",
      },
      {
        q: "Can it be used for cosmetic tanning?",
        a: "It is approved only for erythropoietic protoporphyria and supplied as an implant through specialist centers. Cosmetic use is off-label and the online 'melanotan I' market is unregulated.",
      },
    ],
    tags: ["melanocortin", "pigmentation", "approved"],
    claims: [
      {
        text: "Increased pain-free sunlight exposure and reduced phototoxic reactions versus placebo in two randomized trials in erythropoietic protoporphyria.",
        tier: 1,
        source: {
          label: "Langendonk et al., 2015 (NEJM)",
          href: "https://pubmed.ncbi.nlm.nih.gov/26132941/",
        },
      },
      {
        text: "FDA-approved for erythropoietic protoporphyria in adults.",
        tier: 1,
        kind: "regulatory",
        source: {
          label: "FDA label – Scenesse (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210797s000lbl.pdf",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [{ date: "2026-10-01", note: "Entry added." }],
  },
  {
    slug: "ll-37",
    name: "LL-37",
    aka: ["Cathelicidin", "hCAP18 (37-residue fragment)"],
    class: "Human antimicrobial peptide",
    hook: "Your own antimicrobial peptide, now tested on wounds that won’t close.",
    summary:
      "The only human cathelicidin, a 37-residue peptide cut from the hCAP18 precursor in skin, airways and immune cells. It kills microbes, recruits immune cells and promotes vessel growth. As a topical drug it has been through a Phase 2b trial in venous leg ulcers that missed its primary endpoint and a small diabetic-foot trial that did not.",
    mechanism:
      "LL-37 is an amphipathic helix that disrupts bacterial membranes directly and, at lower concentrations, signals to host cells: it is chemotactic for neutrophils and monocytes, drives angiogenesis and keratinocyte migration, and modulates inflammation in both directions depending on context. That breadth is why it is studied for wounds, infection and, experimentally, cancer.",
    sequence: {
      residues: "LLGDFFRKSKEKIGKEFKRIVQRIKDFLRNLVPRTES",
      note: "Residues 134–170 of the CAMP gene product hCAP18 (UniProt P49913).",
      source: {
        label: "UniProt – cathelicidin / hCAP18 (P49913)",
        href: "https://www.uniprot.org/uniprotkb/P49913/entry",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Not approved in any jurisdiction. A topical formulation has reached Phase 2b; intratumoral injection has been in Phase 1.",
      source: {
        label: "Mahlapuu et al., 2021 (Wound Repair Regen, Phase 2b)",
        href: "https://pubmed.ncbi.nlm.nih.gov/34687253/",
      },
    },
    safety: [
      {
        text: "Topical LL-37 was tolerated across a 148-patient placebo-controlled trial without a safety signal that stopped development.",
        source: {
          label: "Mahlapuu et al., 2021 (Wound Repair Regen, Phase 2b)",
          href: "https://pubmed.ncbi.nlm.nih.gov/34687253/",
        },
      },
      {
        text: "A Phase 1 intratumoral program in melanoma produced a detailed case report of widespread blistering skin toxicity, a reminder that an immune-activating peptide can activate immunity where you did not intend.",
        source: {
          label: "Dolkar et al., 2018 (J Cutan Pathol)",
          href: "https://pubmed.ncbi.nlm.nih.gov/29665030/",
        },
      },
      {
        text: "Excess LL-37 is implicated in rosacea and psoriasis, so systemic or high-dose use carries a plausible pro-inflammatory risk. No systemic human safety data exist.",
        source: {
          label: "Dürr et al., 2006 (Biochim Biophys Acta review)",
          href: "https://pubmed.ncbi.nlm.nih.gov/16716248/",
        },
      },
    ],
    faqs: [
      {
        q: "Did LL-37 work for leg ulcers?",
        a: "Not on the trial's primary endpoint. Across all 148 patients healing was no better than placebo. A post-hoc look at the largest wounds found an effect, which is a reason to run another trial, not a result.",
      },
      {
        q: "Is injectable LL-37 sold online the same thing?",
        a: "Chemically it may be. The human data are for a topical cream on chronic wounds and for intratumoral injection in a trial setting. Systemic injection has no human evidence at all.",
      },
    ],
    tags: ["immune", "repair", "anti-inflammatory", "investigational"],
    claims: [
      {
        text: "Did not improve healing of hard-to-heal venous leg ulcers versus placebo in the full population of a Phase 2b RCT; a post-hoc subgroup with large wounds improved.",
        tier: 2,
        source: {
          label: "Mahlapuu et al., 2021 (Wound Repair Regen, Phase 2b)",
          href: "https://pubmed.ncbi.nlm.nih.gov/34687253/",
        },
      },
      {
        text: "Increased granulation tissue in mildly infected diabetic foot ulcers versus placebo cream in a small double-blind RCT.",
        tier: 2,
        source: {
          label: "Miranda et al., 2023 (Arch Dermatol Res)",
          href: "https://pubmed.ncbi.nlm.nih.gov/37480520/",
        },
      },
      {
        text: "Kills bacteria by membrane disruption and acts as a chemoattractant and angiogenic signal in vitro and in animals.",
        tier: 3,
        source: {
          label: "Dürr et al., 2006 (Biochim Biophys Acta review)",
          href: "https://pubmed.ncbi.nlm.nih.gov/16716248/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [{ date: "2026-10-01", note: "Entry added." }],
  },
  {
    slug: "thymosin-beta-4",
    name: "Thymosin β4",
    aka: ["Tβ4", "RGN-259 (eye drops)", "Timbetasin"],
    class: "Actin-sequestering regenerative peptide",
    hook: "The full-length protein the recovery fragment borrows its name from.",
    summary:
      "A 43-residue peptide found in nearly every human cell, where it holds actin monomers in reserve and, when released at injury, drives cell migration and repair. It has been through controlled eye trials and is in Phase 3 for dry eye and neurotrophic keratopathy. The grey-market 'TB-500' is a seven-residue fragment of it, not this molecule.",
    mechanism:
      "Thymosin β4 binds G-actin, controlling the pool available to build the cytoskeleton. After injury it is released by platelets and immune cells, promotes migration of keratinocytes, endothelial and progenitor cells, reduces inflammation and myofibroblast scarring, and supports new vessel growth. The eye is the organ where that biology has come closest to a drug.",
    sequence: {
      residues: "Ac-SDKPDMAEIEKFDKSKLKKTETQEKNPLPSKETIEQEKQAGES",
      note: "43 residues, N-acetylated. The LKKTET motif (residues 17–22) is the actin-binding site that TB-500 copies.",
      source: {
        label: "UniProt – thymosin β4 (P62328)",
        href: "https://www.uniprot.org/uniprotkb/P62328/entry",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Not approved in any jurisdiction. The ophthalmic formulation (RGN-259) has completed Phase 2 and entered Phase 3 for dry eye and neurotrophic keratopathy.",
      source: {
        label: "Sosne, 2018 (Expert Opin Biol Ther)",
        href: "https://pubmed.ncbi.nlm.nih.gov/30063853/",
      },
    },
    safety: [
      {
        text: "In the controlled dry-eye trial, safety measures including visual acuity, intraocular pressure and corneal sensitivity showed no concern. Those are local, short-course data; systemic use in people has no safety record.",
        source: {
          label: "Sosne & Ousler, 2015 (Clin Ophthalmol, Phase 2)",
          href: "https://pubmed.ncbi.nlm.nih.gov/26056426/",
        },
      },
      {
        text: "Its angiogenic and migratory activity is the basis of a theoretical tumor-promotion concern that has not been resolved either way in humans.",
        source: {
          label: "Goldstein et al., 2012 (Expert Opin Biol Ther)",
          href: "https://pubmed.ncbi.nlm.nih.gov/22074294/",
        },
      },
    ],
    faqs: [
      {
        q: "Is thymosin β4 the same as TB-500?",
        a: "No. Thymosin β4 is the whole 43-residue protein studied in the eye trials. TB-500 is a synthetic seven-residue fragment with no human trials of its own. Results for one do not transfer to the other.",
      },
      {
        q: "Did the dry-eye trial succeed?",
        a: "Partly. The Phase 2 trial missed both primary endpoints but improved several secondary measures, which was enough to justify Phase 3. Until those read out, the honest status is promising and unproven.",
      },
    ],
    tags: ["repair", "angiogenesis", "investigational"],
    claims: [
      {
        text: "Missed both primary endpoints (discomfort, inferior corneal staining) but improved several secondary measures in a 72-patient placebo-controlled Phase 2 dry-eye trial.",
        tier: 2,
        source: {
          label: "Sosne & Ousler, 2015 (Clin Ophthalmol, Phase 2)",
          href: "https://pubmed.ncbi.nlm.nih.gov/26056426/",
        },
      },
      {
        text: "Promotes cell migration, angiogenesis and wound repair and reduces scarring in animal models of skin, eye, heart and brain injury.",
        tier: 3,
        source: {
          label: "Goldstein et al., 2012 (Expert Opin Biol Ther)",
          href: "https://pubmed.ncbi.nlm.nih.gov/22074294/",
        },
      },
      {
        text: "Phase 3 trials in dry eye and neurotrophic keratopathy are ongoing; no result has been published at review.",
        tier: 4,
        source: {
          label: "Sosne, 2018 (Expert Opin Biol Ther)",
          href: "https://pubmed.ncbi.nlm.nih.gov/30063853/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [{ date: "2026-10-01", note: "Entry added." }],
  },
  {
    slug: "dihexa",
    name: "Dihexa",
    aka: ["PNB-0408", "N-hexanoic-Tyr-Ile-(6)-aminohexanoic amide"],
    class: "Angiotensin IV analog",
    hook: "A nootropic whose key mechanism paper has been retracted.",
    summary:
      "An orally active, brain-penetrant analog of angiotensin IV developed as a cognitive enhancer. It reversed drug-induced memory deficits in rats and improved an Alzheimer's mouse model, but the paper tying it to the HGF/c-Met growth pathway was retracted in 2025 and the original rat study carries a journal Notice of Concern. There are no human data.",
    mechanism:
      "Dihexa is built from the three-residue core of angiotensin IV, capped and stabilized so it survives digestion and crosses the blood-brain barrier. Its developers attributed its synapse-building effect to activation of hepatocyte growth factor and its receptor c-Met; that specific claim now rests on a retracted paper. Independent work in mice points instead at PI3K/AKT signalling and reduced neuroinflammation.",
    sequence: {
      residues: "N-hexanoic-Tyr-Ile-(6)-aminohexanoic amide",
      note: "A capped tripeptide-like molecule: hexanoyl N-terminus, Tyr-Ile, and a 6-aminohexanoic amide C-terminus.",
      source: {
        label: "McCoy et al., 2013 (J Pharmacol Exp Ther)",
        href: "https://pubmed.ncbi.nlm.nih.gov/23055539/",
      },
    },
    regulatory: {
      status: "research-only",
      detail:
        "Never approved or entered human trials in any jurisdiction. Preclinical only, and sold in grey markets on the strength of rodent data.",
      source: {
        label: "McCoy et al., 2013 (J Pharmacol Exp Ther)",
        href: "https://pubmed.ncbi.nlm.nih.gov/23055539/",
      },
    },
    safety: [
      {
        text: "No human safety data of any kind exist. If the proposed HGF/c-Met mechanism is real, it is a pathway that drives tumor growth and metastasis when over-activated, which is a serious theoretical concern for chronic use.",
        source: {
          label:
            "Benoist et al., 2014 – retraction notice (J Pharmacol Exp Ther)",
          href: "https://pubmed.ncbi.nlm.nih.gov/40312093/",
        },
      },
      {
        text: "The originating group's foundational rat study was the subject of a 2021 journal Notice of Concern, which weakens the preclinical base the grey market relies on.",
        source: {
          label:
            "Notice of Concern on McCoy et al., 2013 (J Pharmacol Exp Ther)",
          href: "https://pubmed.ncbi.nlm.nih.gov/34551989/",
        },
      },
    ],
    faqs: [
      {
        q: "Is dihexa stronger than BDNF?",
        a: "That popular claim comes from an in-vitro potency comparison in the developer's own work, part of a literature now under a Notice of Concern and a retraction. It has never been measured in a person.",
      },
      {
        q: "Has dihexa been tested in humans?",
        a: "No. Every result is from rats or mice. There is no pharmacokinetic, safety or efficacy data in people.",
      },
    ],
    tags: ["neuro", "nootropic", "frontier", "investigational"],
    claims: [
      {
        text: "Reversed scopolamine-induced memory deficits and increased hippocampal synaptogenesis in rats (study now under a Notice of Concern).",
        tier: 3,
        source: {
          label: "McCoy et al., 2013 (J Pharmacol Exp Ther)",
          href: "https://pubmed.ncbi.nlm.nih.gov/23055539/",
        },
      },
      {
        text: "Restored spatial learning and reduced neuroinflammation in APP/PS1 Alzheimer's-model mice via PI3K/AKT signalling (independent group).",
        tier: 3,
        source: {
          label: "Sun et al., 2021 (Brain Sci)",
          href: "https://pubmed.ncbi.nlm.nih.gov/34827486/",
        },
      },
      {
        text: "The claim that its effects depend on HGF/c-Met activation rests on a paper retracted in 2025.",
        tier: 4,
        source: {
          label:
            "Benoist et al., 2014 – retraction notice (J Pharmacol Exp Ther)",
          href: "https://pubmed.ncbi.nlm.nih.gov/40312093/",
        },
      },
    ],
    updated: "2026-10-01",
    changelog: [{ date: "2026-10-01", note: "Entry added." }],
  },
];

export function getPeptide(slug: string): Peptide | undefined {
  return peptides.find((p) => p.slug === slug);
}
