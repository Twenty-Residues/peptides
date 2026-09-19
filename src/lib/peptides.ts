import type { Tier } from "./evidence";

export type Claim = {
  text: string;
  tier: Tier;
  /**
   * "regulatory" facts (e.g. approval status) are Tier 1 by provenance but say
   * nothing about efficacy, so they are excluded from the evidence floor.
   */
  kind?: "efficacy" | "regulatory";
  source?: { label: string; href: string };
};

/** Tiers of the efficacy claims only — what the floor badge should reflect. */
export function efficacyTiers(p: Peptide): Tier[] {
  const efficacy = p.claims.filter((c) => c.kind !== "regulatory");
  return (efficacy.length > 0 ? efficacy : p.claims).map((c) => c.tier);
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
  sequence?: string;
  tags: string[];
  claims: Claim[];
};

export const peptides: Peptide[] = [
  // ── Metabolic / GLP-1 axis ────────────────────────────────────────────────
  {
    slug: "semaglutide",
    name: "Semaglutide",
    aka: ["Ozempic", "Wegovy"],
    class: "GLP-1 receptor agonist",
    hook: "The molecule that rewrote what weight loss looks like.",
    summary:
      "A long-acting GLP-1 analog that turns down appetite and slows gastric emptying. It is FDA-approved for type 2 diabetes and chronic weight management, and it carries some of the largest randomized outcome data of any peptide in this catalog.",
    tags: ["metabolic", "GLP-1", "approved"],
    claims: [
      {
        text: "Produces clinically significant weight loss in adults with obesity (STEP 1).",
        tier: 1,
        source: {
          label: "Wilding et al., 2021 (NEJM, STEP 1)",
          href: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
        },
      },
      {
        text: "Reduces major adverse cardiovascular events in established CVD (SELECT).",
        tier: 1,
        source: {
          label: "Lincoff et al., 2023 (NEJM, SELECT)",
          href: "https://www.nejm.org/doi/full/10.1056/NEJMoa2307563",
        },
      },
    ],
  },
  {
    slug: "tirzepatide",
    name: "Tirzepatide",
    aka: ["Mounjaro", "Zepbound"],
    class: "GIP / GLP-1 dual receptor agonist",
    hook: "Two incretin receptors, one injection, up to ~21% body weight gone.",
    summary:
      "A once-weekly dual agonist that hits both the GIP and GLP-1 receptors. In its pivotal obesity trial it drove weight loss rivaling bariatric surgery, and it is FDA-approved for type 2 diabetes and obesity.",
    tags: ["metabolic", "GLP-1", "GIP", "approved"],
    claims: [
      {
        text: "Up to ~20.9% mean body-weight reduction at 72 weeks vs placebo (SURMOUNT-1).",
        tier: 1,
        source: {
          label: "Jastreboff et al., 2022 (NEJM, SURMOUNT-1)",
          href: "https://pubmed.ncbi.nlm.nih.gov/35658024/",
        },
      },
    ],
  },
  {
    slug: "retatrutide",
    name: "Retatrutide",
    aka: ["LY3437943"],
    class: "GIP / GLP-1 / glucagon triple agonist",
    hook: "The triple agonist posting the biggest weight-loss numbers yet.",
    summary:
      "An investigational once-weekly peptide that activates three metabolic receptors at once. Phase 2 data are striking, but it is not yet approved — this is late-stage clinical promise, not a settled therapy.",
    tags: ["metabolic", "GLP-1", "GIP", "glucagon", "investigational"],
    claims: [
      {
        text: "83% of participants lost ≥15% body weight at 48 weeks on the top dose (Phase 2).",
        tier: 2,
        source: {
          label: "Jastreboff et al., 2023 (NEJM, Phase 2)",
          href: "https://pubmed.ncbi.nlm.nih.gov/37366315/",
        },
      },
      {
        text: "No approved human indication; Phase 3 program ongoing.",
        tier: 1,
        kind: "regulatory",
      },
    ],
  },
  {
    slug: "aod-9604",
    name: "AOD-9604",
    aka: ["hGH fragment 176-191"],
    class: "Growth-hormone fragment",
    hook: "The 'fat-burning fragment' the clinic couldn't confirm.",
    summary:
      "A synthetic fragment of human growth hormone marketed for lipolysis. It showed fat-metabolism activity in preclinical work, but company-run human weight-loss trials failed to beat placebo — a clean example of a great story meeting hard endpoints.",
    tags: ["metabolic", "GH-fragment", "investigational"],
    claims: [
      {
        text: "Stimulates lipolysis and inhibits lipogenesis in preclinical models.",
        tier: 3,
        source: {
          label: "PubMed: AOD-9604 lipolysis",
          href: "https://pubmed.ncbi.nlm.nih.gov/?term=AOD-9604+lipolysis",
        },
      },
      {
        text: "Did not produce significant weight loss vs placebo in human trials.",
        tier: 2,
        source: {
          label: "PubMed: AOD9604 obesity trial",
          href: "https://pubmed.ncbi.nlm.nih.gov/?term=AOD9604+obesity",
        },
      },
    ],
  },

  // ── GH secretagogues / GHRH ───────────────────────────────────────────────
  {
    slug: "tesamorelin",
    name: "Tesamorelin",
    aka: ["Egrifta"],
    class: "GHRH analog",
    hook: "An FDA-approved GHRH analog that targets visceral fat.",
    summary:
      "A stabilized growth-hormone-releasing-hormone analog that raises endogenous GH pulses. It is FDA-approved to reduce excess visceral abdominal fat in adults with HIV-associated lipodystrophy, backed by controlled trials.",
    tags: ["GH-axis", "GHRH", "approved"],
    claims: [
      {
        text: "FDA-approved to reduce visceral adipose tissue in HIV lipodystrophy.",
        tier: 1,
        source: {
          label: "FDA label (EGRIFTA, accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/022505s012s013lbl.pdf",
        },
      },
    ],
  },
  {
    slug: "cjc-1295",
    name: "CJC-1295",
    aka: ["with DAC", "modified GRF (1-29)"],
    class: "Long-acting GHRH analog",
    hook: "One shot, a week of elevated GH and IGF-1.",
    summary:
      "A GHRH analog engineered to bind albumin (via a Drug Affinity Complex), stretching its action from minutes to days. A human PK study showed sustained GH and IGF-1 elevation; it remains investigational and is not approved for human use.",
    tags: ["GH-axis", "GHRH", "investigational"],
    claims: [
      {
        text: "Raised GH 2–10× and IGF-1 1.5–3× for days after a single dose in healthy adults.",
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
      },
    ],
  },
  {
    slug: "ipamorelin",
    name: "Ipamorelin",
    class: "Ghrelin-receptor / GH secretagogue",
    hook: "The selective GH pulse without the cortisol baggage.",
    summary:
      "A pentapeptide ghrelin-receptor agonist that triggers growth-hormone release with little effect on cortisol or prolactin — the selectivity that made it a research favorite. Human evidence is thin; the foundational work is preclinical.",
    tags: ["GH-axis", "secretagogue", "investigational"],
    claims: [
      {
        text: "Potent, selective GH release without significant ACTH/cortisol rise (preclinical).",
        tier: 3,
        source: {
          label: "Raun et al., 1998 (Eur J Endocrinol)",
          href: "https://pubmed.ncbi.nlm.nih.gov/9849822/",
        },
      },
    ],
  },

  // ── Repair / recovery ─────────────────────────────────────────────────────
  {
    slug: "bpc-157",
    name: "BPC-157",
    aka: ["Body Protection Compound-157"],
    class: "Gastric peptide fragment",
    hook: "The repair peptide the research world can't stop talking about.",
    summary:
      "A synthetic 15-amino-acid fragment derived from a gastric protein, studied extensively in animal models for tendon, muscle, and gut-lining repair. The preclinical signal is broad and consistent — controlled human data is the missing piece.",
    sequence: "GEPPPGKPADDAGLV",
    tags: ["repair", "gut", "investigational"],
    claims: [
      {
        text: "Accelerates tendon-to-bone and muscle healing in rodent injury models.",
        tier: 3,
        source: {
          label: "Chang et al., 2011 (J Appl Physiol)",
          href: "https://pubmed.ncbi.nlm.nih.gov/21030672/",
        },
      },
      {
        text: "No approved human indication in any major regulatory jurisdiction.",
        tier: 1,
        kind: "regulatory",
      },
    ],
  },
  {
    slug: "tb-500",
    name: "TB-500",
    aka: ["Thymosin β4 fragment"],
    class: "Actin-binding peptide",
    hook: "The migration-and-angiogenesis peptide behind the recovery hype.",
    summary:
      "A synthetic peptide related to thymosin β4 that promotes cell migration and new blood-vessel formation. Preclinical wound-healing data is encouraging; human recovery claims outrun the evidence.",
    tags: ["repair", "angiogenesis", "investigational"],
    claims: [
      {
        text: "Promotes cell migration and angiogenesis in vitro and in animal wound models.",
        tier: 3,
        source: {
          label: "Goldstein et al., 2005 (Ann N Y Acad Sci)",
          href: "https://pubmed.ncbi.nlm.nih.gov/16110805/",
        },
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
      "A naturally occurring copper-binding tripeptide (Gly-His-Lys) that upregulates collagen, elastin, and repair signaling. It has the strongest topical-skin evidence in the 'cosmeceutical peptide' category, plus a deep preclinical tissue-remodeling literature.",
    sequence: "GHK",
    tags: ["skin", "repair", "cosmetic"],
    claims: [
      {
        text: "Drives collagen/elastin synthesis and tissue remodeling across models.",
        tier: 3,
        source: {
          label: "Pickart & Margolina, 2008 (review)",
          href: "https://pubmed.ncbi.nlm.nih.gov/18644225/",
        },
      },
      {
        text: "Improves firmness and fine lines in controlled studies on aged skin (topical).",
        tier: 2,
        source: {
          label: "PubMed: GHK-Cu skin clinical",
          href: "https://pubmed.ncbi.nlm.nih.gov/?term=GHK-Cu+skin+clinical",
        },
      },
    ],
  },
  {
    slug: "kpv",
    name: "KPV",
    aka: ["α-MSH (11-13)"],
    class: "Anti-inflammatory tripeptide",
    hook: "The three-residue tail of α-MSH that calms inflammation.",
    summary:
      "A tripeptide fragment of alpha-MSH studied for anti-inflammatory activity in the gut and skin. The mechanism is intriguing and the preclinical data real; human trials are lacking.",
    sequence: "KPV",
    tags: ["anti-inflammatory", "gut", "investigational"],
    claims: [
      {
        text: "Reduces intestinal and skin inflammation in preclinical models.",
        tier: 3,
        source: {
          label: "PubMed: KPV inflammation",
          href: "https://pubmed.ncbi.nlm.nih.gov/?term=KPV+peptide+inflammation",
        },
      },
    ],
  },

  // ── Mitochondrial / longevity ─────────────────────────────────────────────
  {
    slug: "mots-c",
    name: "MOTS-c",
    class: "Mitochondrial-derived peptide",
    hook: "An 'exercise mimetic' written into your mitochondrial DNA.",
    summary:
      "A 16-amino-acid peptide encoded in mitochondrial 12S rRNA that activates AMPK and improves insulin sensitivity — the closest thing to a molecular echo of exercise. The mechanism work is elegant; human data is early and mostly associative.",
    tags: ["metabolic", "longevity", "investigational"],
    claims: [
      {
        text: "Improves insulin sensitivity and reverses diet-induced obesity in mice.",
        tier: 3,
        source: {
          label: "Lee et al., 2015 (Cell Metabolism)",
          href: "https://www.cell.com/cell-metabolism/fulltext/S1550-4131(15)00061-3",
        },
      },
      {
        text: "Plasma MOTS-c tracks with insulin sensitivity in lean humans (observational).",
        tier: 2,
        source: {
          label: "Ramanjaneya et al., 2019 (observational)",
          href: "https://pubmed.ncbi.nlm.nih.gov/29593067/",
        },
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
      "A four-amino-acid peptide reported to activate telomerase and modulate melatonin rhythms. The longevity narrative is bold, but nearly all evidence comes from older, mostly single-group Russian studies — this is frontier territory.",
    sequence: "AEDG",
    tags: ["longevity", "frontier"],
    claims: [
      {
        text: "Reported telomerase activation and lifespan effects in early studies.",
        tier: 4,
        source: {
          label: "PubMed: epitalon telomerase",
          href: "https://pubmed.ncbi.nlm.nih.gov/?term=epitalon+telomerase",
        },
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
      "A synthetic analog of the immunopeptide tuftsin, developed in Russia as an anxiolytic and studied for anxiety and cognition. Clinical use exists in its home market; rigorous international trial data is scarce.",
    tags: ["neuro", "anxiolytic", "frontier"],
    claims: [
      {
        text: "Anxiolytic and modest cognitive effects in early clinical/preclinical work.",
        tier: 4,
        source: {
          label: "PubMed: selank anxiolytic",
          href: "https://pubmed.ncbi.nlm.nih.gov/?term=selank+anxiolytic",
        },
      },
    ],
  },
  {
    slug: "semax",
    name: "Semax",
    class: "ACTH (4-10) analog",
    hook: "A nootropic ACTH fragment used clinically in Russia for stroke.",
    summary:
      "A short peptide derived from ACTH, studied for neuroprotection and cognition and used clinically in Russia (including in stroke). It modulates BDNF and dopamine signaling; Western regulatory approval and large trials are absent.",
    tags: ["neuro", "nootropic", "frontier"],
    claims: [
      {
        text: "Neuroprotective and pro-BDNF effects reported in clinical/preclinical studies.",
        tier: 4,
        source: {
          label: "PubMed: semax neuroprotection",
          href: "https://pubmed.ncbi.nlm.nih.gov/?term=semax+neuroprotective",
        },
      },
    ],
  },

  // ── Immune ────────────────────────────────────────────────────────────────
  {
    slug: "thymosin-alpha-1",
    name: "Thymosin alpha-1",
    aka: ["Thymalfasin", "Zadaxin"],
    class: "Immunomodulatory peptide",
    hook: "An immune-tuning peptide approved across ~37 countries.",
    summary:
      "A 28-amino-acid peptide that activates TLR9 and boosts T-helper and NK-cell responses. Approved in dozens of countries (not the US) for hepatitis B and vaccine enhancement, with clinical trial data in viral hepatitis and sepsis.",
    tags: ["immune", "antiviral", "approved-abroad"],
    claims: [
      {
        text: "Effective in chronic hepatitis B, alone and with interferon (clinical).",
        tier: 2,
        source: {
          label: "Billich, 2005 (review, Zadaxin)",
          href: "https://pubmed.ncbi.nlm.nih.gov/15992078/",
        },
      },
    ],
  },

  // ── Melanocortin ──────────────────────────────────────────────────────────
  {
    slug: "bremelanotide",
    name: "Bremelanotide",
    aka: ["PT-141", "Vyleesi"],
    class: "Melanocortin receptor agonist",
    hook: "The FDA-approved libido peptide that skips the vascular route.",
    summary:
      "A melanocortin-receptor agonist that acts centrally on sexual desire rather than on blood flow. It is FDA-approved (Vyleesi, 2019) for acquired hypoactive sexual desire disorder in premenopausal women, based on the two Phase 3 RECONNECT trials.",
    tags: ["melanocortin", "sexual-health", "approved"],
    claims: [
      {
        text: "FDA-approved for HSDD in premenopausal women (RECONNECT trials).",
        tier: 1,
        source: {
          label: "FDA label (VYLEESI, accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210557s000lbl.pdf",
        },
      },
    ],
  },
  {
    slug: "melanotan-ii",
    name: "Melanotan II",
    aka: ["MT-II"],
    class: "Melanocortin receptor agonist",
    hook: "The tanning-and-libido peptide that never made it to approval.",
    summary:
      "A non-selective melanocortin agonist studied for pigmentation and sexual function. Its mechanism is well characterized, but it has no regulatory approval and carries documented safety concerns — a frontier compound with real caveats.",
    tags: ["melanocortin", "pigmentation", "frontier"],
    claims: [
      {
        text: "Stimulates melanogenesis and sexual response via melanocortin receptors.",
        tier: 3,
        source: {
          label: "PubMed: melanotan II melanocortin",
          href: "https://pubmed.ncbi.nlm.nih.gov/?term=melanotan+II+melanocortin",
        },
      },
      {
        text: "No approved human indication; safety signals reported in case literature.",
        tier: 1,
        kind: "regulatory",
      },
    ],
  },
];

export function getPeptide(slug: string): Peptide | undefined {
  return peptides.find((p) => p.slug === slug);
}
