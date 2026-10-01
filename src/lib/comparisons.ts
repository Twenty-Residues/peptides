import { getPeptide, type FAQ, type Peptide, type Source } from "./peptides";

/**
 * Head-to-head comparisons. Editorial, but held to the same rule as the
 * catalog: every point of difference cites a fixed record. Most sources are
 * looked up from the two monographs by label so the pages can never cite
 * something the monographs don't, and a new record is written out in full.
 */
export type Difference = {
  aspect: string;
  a: string;
  b: string;
  source?: Source;
};

export type Comparison = {
  slug: string;
  pair: [string, string];
  /** One line, the tension between the two. */
  hook: string;
  /** 2–3 sentences. */
  summary: string;
  /** Where the evidence lands. One paragraph, no hedging. */
  verdict: string;
  differences: Difference[];
  faqs?: FAQ[];
  updated: string;
};

/** A source already cited in a monograph, found by a fragment of its label. */
function fromCatalog(slug: string, label: string): Source {
  const p = getPeptide(slug);
  if (!p) throw new Error(`comparisons: unknown peptide "${slug}"`);
  const all: (Source | undefined)[] = [
    ...p.claims.map((c) => c.source),
    p.regulatory?.source,
    ...(p.safety ?? []).map((s) => s.source),
    p.sequence?.source,
  ];
  const hit = all.find((s) => s && s.label.includes(label));
  if (!hit)
    throw new Error(`comparisons: no source matching "${label}" on ${slug}`);
  return hit;
}

const SURMOUNT_5: Source = {
  label: "Aronne et al., 2025 (NEJM, SURMOUNT-5)",
  href: "https://pubmed.ncbi.nlm.nih.gov/40353578/",
};

export const comparisons: Comparison[] = [
  {
    slug: "semaglutide-vs-tirzepatide",
    pair: ["semaglutide", "tirzepatide"],
    hook: "The only pair in the catalog with a head-to-head trial.",
    summary:
      "Both are once-weekly incretin drugs approved for obesity and type 2 diabetes. Tirzepatide adds GIP agonism to GLP-1 and, in the one direct comparison, produced more weight loss. Semaglutide has the cardiovascular-outcomes trial in obesity that tirzepatide still lacks.",
    verdict:
      "On weight, the question is settled in tirzepatide's favour: an open-label but randomized 72-week trial put the gap at roughly six and a half percentage points. On what matters beyond the scale, semaglutide is ahead, because SELECT showed a cut in heart attacks, strokes and cardiovascular death in people with obesity and no diabetes, and tirzepatide has no equivalent result yet. Pick by the outcome you care about, not by which is newer.",
    differences: [
      {
        aspect: "Receptors",
        a: "GLP-1 receptor agonist.",
        b: "Dual GIP and GLP-1 receptor agonist.",
        source: fromCatalog("tirzepatide", "Zepbound"),
      },
      {
        aspect: "Head-to-head weight loss",
        a: "Mean 13.7% body-weight loss at 72 weeks on the maximum tolerated dose.",
        b: "Mean 20.2% at 72 weeks in the same trial (SURMOUNT-5, open-label, no diabetes).",
        source: SURMOUNT_5,
      },
      {
        aspect: "Cardiovascular outcomes",
        a: "About 20% fewer major adverse cardiovascular events in obesity without diabetes (SELECT).",
        b: "No completed cardiovascular-outcomes trial in obesity at the time of review.",
        source: fromCatalog("semaglutide", "SELECT"),
      },
      {
        aspect: "Approvals",
        a: "Type 2 diabetes, chronic weight management, cardiovascular risk reduction.",
        b: "Type 2 diabetes, chronic weight management, obstructive sleep apnea in obesity.",
        source: fromCatalog("tirzepatide", "Zepbound"),
      },
      {
        aspect: "Safety profile",
        a: "Gastrointestinal effects dominate; class boxed warning for thyroid C-cell tumours.",
        b: "The same gastrointestinal profile and the same class boxed warning.",
        source: fromCatalog("tirzepatide", "Zepbound"),
      },
    ],
    faqs: [
      {
        q: "Is tirzepatide just a stronger semaglutide?",
        a: "Not quite. It is a different molecule acting on two receptors, and it did produce more weight loss in a direct comparison. But semaglutide carries the only cardiovascular-outcomes result in obesity, so the two are ahead on different questions.",
      },
      {
        q: "Was the head-to-head trial blinded?",
        a: "No. SURMOUNT-5 was open-label, which is a real limitation for a weight endpoint. The size of the gap makes it unlikely to be an artefact, but it should be read with that in mind.",
      },
    ],
    updated: "2026-10-01",
  },
  {
    slug: "tirzepatide-vs-retatrutide",
    pair: ["tirzepatide", "retatrutide"],
    hook: "An approved dual agonist against a triple agonist still in trials.",
    summary:
      "Tirzepatide hits GIP and GLP-1 receptors and is approved. Retatrutide adds glucagon-receptor activity and posted larger weight-loss numbers in Phase 2, but it is unapproved and its Phase 3 results were not yet published at review. The two have never been compared directly.",
    verdict:
      "Retatrutide's Phase 2 number is bigger, but it comes from a 48-week trial of a few hundred people, against tirzepatide's multiple Phase 3 trials, label, and real-world exposure. Cross-trial comparisons of weight loss are unreliable because populations, durations and dropout differ. The honest reading is that retatrutide is the more promising molecule and tirzepatide is the proven one, and that gap will not close until the triple agonist's pivotal data and label are public.",
    differences: [
      {
        aspect: "Receptors",
        a: "Dual GIP and GLP-1 receptor agonist.",
        b: "Triple GIP, GLP-1 and glucagon receptor agonist.",
        source: fromCatalog("retatrutide", "Structural insights"),
      },
      {
        aspect: "Best weight-loss result",
        a: "Mean 20.9% reduction at 72 weeks on the top dose vs 3.1% on placebo (SURMOUNT-1, Phase 3).",
        b: "Mean around 24.2% at 48 weeks on the top dose (Phase 2). Different trial, not directly comparable.",
        source: fromCatalog("retatrutide", "Jastreboff et al., 2023"),
      },
      {
        aspect: "Evidence stage",
        a: "Pivotal Phase 3 program complete and on the label.",
        b: "Phase 3 program complete; results not yet published at review.",
        source: fromCatalog("retatrutide", "TRIUMPH-1"),
      },
      {
        aspect: "Status",
        a: "FDA-approved (Mounjaro, Zepbound).",
        b: "Investigational. Filing for approval planned for 2027.",
        source: fromCatalog("retatrutide", "TRIUMPH-1"),
      },
      {
        aspect: "Open safety questions",
        a: "Characterized on the label: gastrointestinal effects, class thyroid warning.",
        b: "Glucagon-receptor activity puts heart rate and glucose under scrutiny; Phase 3 was designed to answer that.",
        source: fromCatalog("retatrutide", "Jastreboff et al., 2023"),
      },
    ],
    faqs: [
      {
        q: "Does retatrutide beat tirzepatide?",
        a: "Nobody knows. There is no head-to-head trial, and comparing a Phase 2 number with a Phase 3 number from a different population is the kind of thing this site exists to discourage.",
      },
    ],
    updated: "2026-10-01",
  },
  {
    slug: "cjc-1295-vs-ipamorelin",
    pair: ["cjc-1295", "ipamorelin"],
    hook: "Two different receptors, one routinely sold combination.",
    summary:
      "CJC-1295 is a long-acting GHRH analog; ipamorelin is a short-acting ghrelin-receptor agonist. They are often paired on the theory that two inputs to the pituitary add up, but that combination has never been tested in a controlled human trial. Each has a small human evidence base of its own.",
    verdict:
      "The pairing makes mechanistic sense, and nothing more than that. CJC-1295 has one human PK study showing days of elevated GH and IGF-1. Ipamorelin has a PK study and a Phase 2 trial that found it safe but ineffective for its tested indication. Neither has long-term human safety data, and the combination has none at all. Anyone describing the stack's effects is describing theory.",
    differences: [
      {
        aspect: "Receptor",
        a: "GHRH receptor (a GHRH(1-29) analog).",
        b: "Ghrelin receptor, GHS-R1a.",
        source: fromCatalog("ipamorelin", "Raun"),
      },
      {
        aspect: "Duration of action",
        a: "Days. The albumin-binding DAC group gives a half-life of roughly a week.",
        b: "Hours. Terminal half-life about two hours, with a single GH pulse.",
        source: fromCatalog("ipamorelin", "Gobburu"),
      },
      {
        aspect: "Human evidence",
        a: "One PK/PD study in healthy adults.",
        b: "A PK study in volunteers plus a placebo-controlled Phase 2 trial in post-operative ileus (no benefit, well tolerated).",
        source: fromCatalog("ipamorelin", "Beck"),
      },
      {
        aspect: "Hormonal selectivity",
        a: "Sustained GH and IGF-1 elevation; pulsatility preserved in the one study that looked.",
        b: "GH release without a matching cortisol or prolactin rise, shown preclinically.",
        source: fromCatalog("cjc-1295", "Ionescu"),
      },
      {
        aspect: "The combination",
        a: "Never tested with ipamorelin in a controlled human trial.",
        b: "Never tested with CJC-1295 in a controlled human trial.",
        source: fromCatalog("cjc-1295", "Teichman"),
      },
    ],
    faqs: [
      {
        q: "Why are they sold together?",
        a: "Because GHRH analogs and ghrelin mimetics act on different receptors and, in older physiology work on their natural counterparts, the two signals were additive on GH release. That is a reasonable hypothesis. It has not been tested as a product in people.",
      },
    ],
    updated: "2026-10-01",
  },
  {
    slug: "bpc-157-vs-tb-500",
    pair: ["bpc-157", "tb-500"],
    hook: "The recovery duo: both preclinical, for different reasons.",
    summary:
      "BPC-157 is a gastric-derived pentadecapeptide with a large rodent injury literature and almost no human data. TB-500 is a short fragment of thymosin β4 whose cited healing research was mostly done on the full protein. Both are research-only; neither has a completed human efficacy trial.",
    verdict:
      "They sit at the same evidence tier for opposite reasons. BPC-157's problem is translation: dozens of rodent studies, largely from one group, and a two-person intravenous safety pilot in humans. TB-500's problem is identity: the healing data belong to a 43-residue protein, and the seven-residue fragment sold under the name has not been tested in people at all. Of the two, BPC-157 at least has human trials now registered. Neither has earned the recovery claims attached to them.",
    differences: [
      {
        aspect: "What it is",
        a: "A synthetic 15-residue peptide derived from a protective protein in gastric juice.",
        b: "A synthetic, acetylated 7-residue fragment of thymosin β4 (Ac-LKKTETQ).",
        source: fromCatalog("tb-500", "UniProt"),
      },
      {
        aspect: "Preclinical signal",
        a: "Faster tendon, muscle and gut-lining healing in rodent injury models.",
        b: "Cell migration and angiogenesis, shown for the full-length protein, not the fragment.",
        source: fromCatalog("bpc-157", "Chang"),
      },
      {
        aspect: "Human evidence",
        a: "A two-person intravenous safety pilot; first Phase 2 RCT only recently registered.",
        b: "None for the fragment. Clinical work on thymosin β4 used the whole protein.",
        source: fromCatalog("bpc-157", "Safety of intravenous"),
      },
      {
        aspect: "Known safety",
        a: "No long-term human safety data; grey-market supply means identity and purity are not assured.",
        b: "No human safety data; angiogenesis-promoting activity is a theoretical concern.",
        source: fromCatalog("tb-500", "Goldstein et al., 2005"),
      },
    ],
    faqs: [
      {
        q: "Which has better evidence?",
        a: "Neither has human efficacy evidence. BPC-157 has far more animal data; TB-500 borrows its data from a different molecule. If you want a tie-breaker, BPC-157 is the one with registered human trials.",
      },
    ],
    updated: "2026-10-01",
  },
  {
    slug: "tesamorelin-vs-cjc-1295",
    pair: ["tesamorelin", "cjc-1295"],
    hook: "Same receptor, one approval between them.",
    summary:
      "Both are synthetic GHRH analogs that raise GH and IGF-1 through the same receptor. Tesamorelin went through two Phase 3 trials and is FDA-approved for visceral fat in HIV-associated lipodystrophy. CJC-1295 stopped at a single human PK study and has no approved use.",
    verdict:
      "This is the cleanest illustration in the catalog of what an approval adds: tesamorelin's label tells you what happens to glucose, injection sites and fluid balance over months, and that its benefit reverses on stopping. CJC-1295 raises the same hormones for longer and tells you none of that, because nobody has run the trials. A longer half-life is an engineering feature, not evidence.",
    differences: [
      {
        aspect: "Molecule",
        a: "GHRH(1-44) with an N-terminal trans-3-hexenoic acid group.",
        b: "Modified GHRH(1-29) carrying an albumin-binding DAC group.",
        source: fromCatalog("tesamorelin", "Egrifta"),
      },
      {
        aspect: "Duration",
        a: "Daily injection.",
        b: "Half-life of roughly a week; GH and IGF-1 stay raised for days after one dose.",
        source: fromCatalog("cjc-1295", "Teichman"),
      },
      {
        aspect: "Human evidence",
        a: "Two Phase 3 randomized trials.",
        b: "One PK/PD study in healthy adults.",
        source: fromCatalog("tesamorelin", "Egrifta"),
      },
      {
        aspect: "Status",
        a: "FDA-approved for visceral fat reduction in HIV-associated lipodystrophy.",
        b: "Research-only; never approved anywhere.",
        source: fromCatalog("tesamorelin", "Egrifta"),
      },
      {
        aspect: "Known safety",
        a: "Label warns of glucose intolerance, injection-site reactions and fluid retention; contraindicated in active malignancy.",
        b: "Transient injection-site reactions, headache and flushing in a small study; no long-term data.",
        source: fromCatalog("tesamorelin", "Egrifta"),
      },
    ],
    updated: "2026-10-01",
  },
  {
    slug: "selank-vs-semax",
    pair: ["selank", "semax"],
    hook: "Two Russian peptides, two different parents, one evidence problem.",
    summary:
      "Selank is a tuftsin analog registered in Russia as an anxiolytic; Semax is an ACTH fragment registered there for stroke and cognitive indications. Both carry the same Pro-Gly-Pro stabilizing tail and the same gap: a Western-indexed mechanism literature and clinical claims that rest on Russian studies no one has replicated abroad.",
    verdict:
      "They are easy to confuse and should not be. Selank's story is GABA: a positive allosteric effect on GABA-A receptors, and small clinical reports of anxiety relief without sedation. Semax's story is BDNF: raised neurotrophin signalling in animals and in treated stroke patients. Both are prescription drugs in their home market and Tier 4 by our standard, because registration in Russia is a regulatory fact, not independent evidence of efficacy.",
    differences: [
      {
        aspect: "Parent peptide",
        a: "Tuftsin (TKPR), an immune tetrapeptide, plus Pro-Gly-Pro.",
        b: "ACTH(4-7), Met-Glu-His-Phe, plus Pro-Gly-Pro.",
        source: fromCatalog("semax", "Dolotov"),
      },
      {
        aspect: "Proposed mechanism",
        a: "Allosteric modulation of GABA-A receptors.",
        b: "Up-regulation of BDNF and its receptor TrkB.",
        source: fromCatalog("selank", "Vyunova"),
      },
      {
        aspect: "Clinical use in Russia",
        a: "Anxiety disorders, including generalized anxiety and neurasthenia.",
        b: "Ischemic stroke, cognitive and cerebrovascular indications, given intranasally.",
        source: fromCatalog("semax", "Gusev"),
      },
      {
        aspect: "Strongest evidence",
        a: "A small Russian study comparing it with a benzodiazepine (Tier 4).",
        b: "Russian clinical series in stroke rehabilitation (Tier 4); mechanism in rats (Tier 3).",
        source: fromCatalog("selank", "Zozulia"),
      },
      {
        aspect: "Status",
        a: "Registered in Russia; not approved by the FDA or EMA.",
        b: "Registered in Russia; not approved by the FDA or EMA.",
        source: fromCatalog("semax", "Dolotov"),
      },
    ],
    faqs: [
      {
        q: "Are Selank and Semax the same drug?",
        a: "No. They share a stabilizing tail and a country of origin. The active cores come from different hormones, the proposed mechanisms differ, and they are registered for different conditions.",
      },
    ],
    updated: "2026-10-01",
  },
  {
    slug: "bremelanotide-vs-melanotan-ii",
    pair: ["bremelanotide", "melanotan-ii"],
    hook: "One terminal group apart, and a world of regulatory difference.",
    summary:
      "Bremelanotide and melanotan II are near-identical cyclic melanocortin agonists; they differ by a C-terminal acid versus amide. One became an FDA-approved drug for low sexual desire with a label that documents its risks. The other stayed a grey-market tanning peptide with case reports of serious harm.",
    verdict:
      "This pair shows what a development program buys. Bremelanotide's side effects are known in frequency and kind, because two Phase 3 trials measured them. Melanotan II's are known from case reports of rhabdomyolysis, priapism and changing moles, which tell you the harms exist but not how often. Structural similarity does not transfer a safety record.",
    differences: [
      {
        aspect: "Structure",
        a: "Cyclic heptapeptide ending in a free acid.",
        b: "The same cyclic heptapeptide ending in an amide.",
        source: fromCatalog("bremelanotide", "Vyleesi"),
      },
      {
        aspect: "Receptor profile",
        a: "Non-selective, but the therapeutic effect is attributed to central MC4R/MC3R.",
        b: "Broad MC1R/MC3R/MC4R agonist, which is why it tans as well as arouses.",
        source: fromCatalog("melanotan-ii", "Dorr"),
      },
      {
        aspect: "Status",
        a: "FDA-approved (Vyleesi, 2019) for HSDD in premenopausal women.",
        b: "No approved use in any jurisdiction.",
        source: fromCatalog("bremelanotide", "Vyleesi"),
      },
      {
        aspect: "Known safety",
        a: "Transient blood-pressure rise, nausea, focal hyperpigmentation; not for uncontrolled hypertension.",
        b: "Case reports of rhabdomyolysis with renal dysfunction, priapism, and darkening or atypia of moles.",
        source: fromCatalog("melanotan-ii", "MT-II toxicity"),
      },
    ],
    faqs: [
      {
        q: "Can melanotan II be used for the same purpose as bremelanotide?",
        a: "It acts on the same receptors and early Phase I work recorded sexual effects, which is how bremelanotide was discovered. But it was never developed, so there is no dose-response, frequency or long-term data, and what is sold under the name is unverified.",
      },
    ],
    updated: "2026-10-01",
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}

/** Comparisons that feature a peptide, for cross-linking from its monograph. */
export function comparisonsFor(p: Pick<Peptide, "slug">): Comparison[] {
  return comparisons.filter((c) => c.pair.includes(p.slug));
}

/** The two monographs, resolved. Throws at build if a slug is wrong. */
export function pairOf(c: Comparison): [Peptide, Peptide] {
  const [a, b] = c.pair.map((s) => {
    const p = getPeptide(s);
    if (!p) throw new Error(`comparison ${c.slug}: unknown peptide "${s}"`);
    return p;
  });
  return [a, b];
}
