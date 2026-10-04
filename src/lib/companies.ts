import type { Source } from "./peptides";

/**
 * The company register.
 *
 * Same discipline as the catalog, pointed at companies instead of molecules:
 * a status is a fact quoted from a fixed record, never an opinion. A company
 * with no public record is listed as "unverified", which is both true and
 * useful. We never link to a storefront; domains are stored as text so a
 * reader can recognise a vendor, and the only links on a company page go to
 * the FDA, DOJ, SEC or court record that justifies its status.
 */

export type CompanyKind =
  | "developer"
  | "manufacturer"
  | "compounder"
  | "telehealth"
  | "ruo-vendor";

export const KIND_LABEL: Record<CompanyKind, string> = {
  developer: "Developer",
  manufacturer: "Manufacturer / API",
  compounder: "Compounding pharmacy",
  telehealth: "Telehealth / clinic",
  "ruo-vendor": "Research-use vendor",
};

export const KIND_BLURB: Record<CompanyKind, string> = {
  developer: "Owns a molecule through trials and, sometimes, an approval.",
  manufacturer:
    "Makes the peptide itself, as an active ingredient or finished drug.",
  compounder:
    "Pharmacies and outsourcing facilities that compound peptides to order.",
  telehealth: "Prescribing platforms and clinics that front for compounders.",
  "ruo-vendor":
    "Sells peptides labelled for research use only. The grey market.",
};

/**
 * Status vocabulary. Each value has a proof requirement, enforced by
 * scripts/check-companies.mjs:
 *
 *   active-regulated  an approval, GMP record or securities filing
 *   under-enforcement a government record: warning letter, import alert,
 *                     criminal or civil action
 *   recall-on-record  an FDA enforcement report (recall), and nothing stronger
 *   in-litigation     a lawsuit on the record, but no government action yet
 *   ceased            a dissolution, bankruptcy or announced wind-down
 *   acquired          a completed acquisition or merger
 *   unverified        no public record located; listed because readers look
 */
export type CompanyStatus =
  | "active-regulated"
  | "under-enforcement"
  | "recall-on-record"
  | "in-litigation"
  | "ceased"
  | "acquired"
  | "unverified";

export const STATUS_LABEL: Record<CompanyStatus, string> = {
  "active-regulated": "Active, regulated",
  "under-enforcement": "Under enforcement",
  "recall-on-record": "Recall on record",
  "in-litigation": "In litigation",
  ceased: "Ceased",
  acquired: "Acquired",
  unverified: "Unverified",
};

export const STATUS_PLAIN: Record<CompanyStatus, string> = {
  "active-regulated":
    "Holds an approval, GMP standing or securities registration we can cite.",
  "under-enforcement":
    "Named in an FDA warning letter, import alert, or a DOJ/FTC action.",
  "recall-on-record":
    "Has recalled a peptide product; no stronger action on the record.",
  "in-litigation":
    "A defendant in a lawsuit on the record; no government action found.",
  ceased: "Dissolved, bankrupt or wound down, per a filing.",
  acquired: "Merged into or bought by another company, per a filing.",
  unverified:
    "No public record found either way. Not an endorsement, not an accusation.",
};

/** What a status must be able to point to. Enforced by the register check. */
export const STATUS_PROOF: Record<CompanyStatus, string> = {
  "active-regulated": "An FDA or EMA approval, or a securities filing.",
  "under-enforcement":
    "A government record: FDA warning letter, import alert, or a criminal or civil action.",
  "recall-on-record":
    "An FDA enforcement report, with no stronger record on file.",
  "in-litigation":
    "A lawsuit on the record, with no government action on file.",
  ceased: "A dissolution, bankruptcy or wind-down filing.",
  acquired: "A completed acquisition or merger filing.",
  unverified:
    "Nothing. An entry with any record at all cannot carry this status.",
};

/** Order for the register: regulated first, then by severity, unverified last. */
export const STATUS_ORDER: CompanyStatus[] = [
  "active-regulated",
  "under-enforcement",
  "in-litigation",
  "recall-on-record",
  "acquired",
  "ceased",
  "unverified",
];

export type EventKind =
  | "approval"
  | "warning-letter"
  | "import-alert"
  | "recall"
  | "lawsuit"
  | "criminal"
  | "acquisition"
  | "dissolution"
  | "delisting"
  | "filing";

export const EVENT_LABEL: Record<EventKind, string> = {
  approval: "Approval",
  "warning-letter": "Warning letter",
  "import-alert": "Import alert",
  recall: "Recall",
  lawsuit: "Lawsuit",
  criminal: "Criminal case",
  acquisition: "Acquisition",
  dissolution: "Dissolution",
  delisting: "Delisting",
  filing: "Filing",
};

/** Events that count as government enforcement. */
export const ENFORCEMENT_KINDS: EventKind[] = [
  "warning-letter",
  "import-alert",
  "criminal",
];

export type CompanyEvent = {
  date: string;
  kind: EventKind;
  summary: string;
  source: Source;
};

/** What the company itself says its products are. Not a status. */
export type Labelling = "rx" | "ruo" | "otc";

export const LABELLING_LABEL: Record<Labelling, string> = {
  rx: "Prescription / approved",
  ruo: "Research use only",
  otc: "Over the counter",
};

export type Company = {
  slug: string;
  name: string;
  aka?: string[];
  kind: CompanyKind;
  jurisdiction: string;
  status: CompanyStatus;
  /** One line: why the status, in plain words. */
  note: string;
  /** Catalog slugs this company is on record as making, selling or compounding. */
  peptides?: string[];
  /** Bare domains, rendered as text and never linked. */
  domains?: string[];
  labelling?: Labelling;
  events?: CompanyEvent[];
  /** News slugs that cover this company. */
  news?: string[];
  updated: string;
};

export const companies: Company[] = [
  {
    slug: "novo-nordisk",
    name: "Novo Nordisk A/S",
    kind: "developer",
    jurisdiction: "Denmark",
    status: "active-regulated",
    note: "Holds the approvals for semaglutide and liraglutide; cagrilintide and the CagriSema combination are investigational.",
    peptides: ["semaglutide", "liraglutide", "cagrilintide"],
    aka: ["Novo Nordisk Inc. (US)"],
    labelling: "rx",
    events: [
      {
        date: "2014-12-23",
        kind: "approval",
        summary:
          "FDA approves Saxenda (liraglutide) for chronic weight management.",
        source: {
          label: "FDA label – Saxenda (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2014/206321Orig1s000lbl.pdf",
        },
      },
      {
        date: "2021-04-21",
        kind: "recall",
        summary:
          "Class II recall of 4 products (OZEMPIC; Saxenda; ViCTOZA; Xultophy). Reason: Temperature Abuse. Status terminated.",
        source: {
          label: "FDA enforcement report D-0617-2021 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0617-2021%22",
        },
      },
      {
        date: "2021-06-04",
        kind: "approval",
        summary:
          "FDA approves Wegovy (semaglutide) for chronic weight management.",
        source: {
          label: "FDA label – Wegovy (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/215256s000lbl.pdf",
        },
      },
      {
        date: "2026-01-07",
        kind: "recall",
        summary:
          "Class II recall of 2 products (Wegovy). Reason: Presence of Particulate Matter. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0244-2026 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0244-2026%22",
        },
      },
      {
        date: "2026-10-04",
        kind: "filing",
        summary:
          "Registered with the SEC as a foreign private issuer (CIK 353278); EDGAR record checked on this date.",
        source: {
          label: "SEC EDGAR – Novo Nordisk A/S (CIK 353278)",
          href: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=353278&type=&dateb=&owner=include&count=40",
        },
      },
    ],
    news: ["fda-import-alert-66-80-september-2026"],
    updated: "2026-10-04",
  },
  {
    slug: "eli-lilly",
    name: "Eli Lilly and Company",
    kind: "developer",
    jurisdiction: "United States",
    status: "active-regulated",
    note: "Holds the tirzepatide approvals; retatrutide is investigational. Has sued sellers marketing retatrutide before approval.",
    peptides: ["tirzepatide", "retatrutide"],
    labelling: "rx",
    events: [
      {
        date: "2023-11-08",
        kind: "approval",
        summary:
          "FDA approves Zepbound (tirzepatide) for chronic weight management.",
        source: {
          label: "FDA label – Zepbound (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/217806s000lbl.pdf",
        },
      },
      {
        date: "2026-08-12",
        kind: "lawsuit",
        summary:
          "Files six lawsuits against sellers marketing retatrutide, and calls on platforms, payment companies and regulators to act.",
        source: {
          label: "Lilly release – lawsuits over retatrutide sellers (2026-08)",
          href: "https://investor.lilly.com/news-releases/news-release-details/lilly-calls-online-platforms-payment-companies-and-regulators",
        },
      },
    ],
    news: [
      "lilly-sues-six-retatrutide-sellers-august-2026",
      "retatrutide-triumph-1-phase-3-topline",
    ],
    updated: "2026-10-04",
  },
  {
    slug: "theratechnologies",
    name: "Theratechnologies Inc.",
    kind: "developer",
    jurisdiction: "Canada",
    status: "active-regulated",
    note: "Holds the tesamorelin approval (Egrifta).",
    peptides: ["tesamorelin"],
    labelling: "rx",
    events: [
      {
        date: "2010-11-10",
        kind: "approval",
        summary:
          "FDA approves Egrifta (tesamorelin) for HIV-associated lipodystrophy.",
        source: {
          label: "FDA label – Egrifta SV (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/022505s012s013lbl.pdf",
        },
      },
      {
        date: "2026-10-04",
        kind: "filing",
        summary:
          "Registered with the SEC as a foreign private issuer (CIK 1512717); EDGAR record checked on this date.",
        source: {
          label: "SEC EDGAR – Theratechnologies Inc. (CIK 1512717)",
          href: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1512717&type=&dateb=&owner=include&count=40",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "clinuvel",
    name: "Clinuvel Pharmaceuticals Ltd",
    kind: "developer",
    jurisdiction: "Australia",
    status: "active-regulated",
    note: "Holds the afamelanotide approval (Scenesse).",
    peptides: ["afamelanotide"],
    labelling: "rx",
    events: [
      {
        date: "2019-10-08",
        kind: "approval",
        summary:
          "FDA approves Scenesse (afamelanotide) for erythropoietic protoporphyria.",
        source: {
          label: "FDA label – Scenesse (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210797s000lbl.pdf",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "palatin-technologies",
    name: "Palatin Technologies, Inc.",
    kind: "developer",
    jurisdiction: "United States",
    status: "active-regulated",
    note: "Developed bremelanotide (Vyleesi) and sold the product to Cosette in 2023; continues as a melanocortin developer with recurring exchange-listing notices.",
    peptides: ["bremelanotide"],
    labelling: "rx",
    events: [
      {
        date: "2019-06-21",
        kind: "approval",
        summary:
          "FDA approves Vyleesi (bremelanotide) for HSDD in premenopausal women.",
        source: {
          label: "FDA label – Vyleesi (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210557s000lbl.pdf",
        },
      },
      {
        date: "2023-12-20",
        kind: "acquisition",
        summary:
          "Reports completion of the sale of Vyleesi to Cosette Pharmaceuticals (8-K, Item 2.01).",
        source: {
          label: "SEC 8-K – Palatin, 2023-12-20 (Item 2.01)",
          href: "https://www.sec.gov/Archives/edgar/data/911216/000165495423015795/0001654954-23-015795-index.htm",
        },
      },
      {
        date: "2026-05-18",
        kind: "delisting",
        summary:
          "Notice of failure to satisfy a continued listing standard (8-K, Item 3.01).",
        source: {
          label: "SEC 8-K – Palatin, 2026-05-18 (Item 3.01)",
          href: "https://www.sec.gov/Archives/edgar/data/911216/000149315226024219/0001493152-26-024219-index.htm",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "cosette-pharmaceuticals",
    name: "Cosette Pharmaceuticals, Inc.",
    kind: "developer",
    jurisdiction: "United States",
    status: "active-regulated",
    note: "Private company that acquired Vyleesi (bremelanotide) from Palatin in December 2023.",
    peptides: ["bremelanotide"],
    labelling: "rx",
    events: [
      {
        date: "2019-06-21",
        kind: "approval",
        summary:
          "Vyleesi (bremelanotide) approved by FDA; Cosette holds the product since its 2023 purchase from Palatin.",
        source: {
          label: "FDA label – Vyleesi (accessdata)",
          href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210557s000lbl.pdf",
        },
      },
      {
        date: "2023-12-20",
        kind: "acquisition",
        summary:
          "Acquires Vyleesi from Palatin Technologies (reported in Palatin's 8-K).",
        source: {
          label: "SEC 8-K – Palatin, 2023-12-20 (Item 2.01)",
          href: "https://www.sec.gov/Archives/edgar/data/911216/000165495423015795/0001654954-23-015795-index.htm",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "sciclone-pharmaceuticals",
    name: "SciClone Pharmaceuticals, Inc.",
    kind: "developer",
    jurisdiction: "United States",
    status: "acquired",
    note: "Marketed thymosin alpha-1 (Zadaxin) abroad; taken private by an investor consortium in October 2017.",
    peptides: ["thymosin-alpha-1"],
    labelling: "rx",
    events: [
      {
        date: "2017-10-13",
        kind: "acquisition",
        summary:
          "Reports completion of its acquisition by a consortium led by GL Capital (8-K, Item 2.01); shares delisted.",
        source: {
          label: "SEC 8-K – SciClone, 2017-10-13 (Item 2.01)",
          href: "https://www.sec.gov/Archives/edgar/data/880771/000119312517309994/0001193125-17-309994-index.htm",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "cohbar",
    name: "CohBar, Inc.",
    kind: "developer",
    jurisdiction: "United States",
    status: "acquired",
    note: "Developed a MOTS-c analog (CB4211); merged into TuHURA Biosciences and was delisted from Nasdaq in December 2023.",
    peptides: ["mots-c"],
    events: [
      {
        date: "2023-05-23",
        kind: "acquisition",
        summary:
          "Enters a merger agreement with Morphogenesis (later TuHURA Biosciences) (8-K, Item 1.01).",
        source: {
          label: "SEC 8-K – CohBar, 2023-05-23 (Item 1.01)",
          href: "https://www.sec.gov/Archives/edgar/data/1522602/000121390023042149/0001213900-23-042149-index.htm",
        },
      },
      {
        date: "2023-12-27",
        kind: "delisting",
        summary:
          "Nasdaq files Form 25 removing CohBar's securities from listing.",
        source: {
          label: "SEC EDGAR – CohBar filings (CIK 1522602)",
          href: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1522602&type=&dateb=&owner=include&count=40",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "bachem",
    name: "Bachem Holding AG",
    kind: "manufacturer",
    jurisdiction: "Switzerland",
    status: "active-regulated",
    note: "GMP peptide manufacturer and CDMO; SEC-registered ADR programme.",
    labelling: "rx",
    events: [
      {
        date: "2026-10-04",
        kind: "filing",
        summary:
          "Registered with the SEC through its ADR programme (CIK 1968378); EDGAR record checked on this date.",
        source: {
          label: "SEC EDGAR – Bachem Holding AG/ADR (CIK 1968378)",
          href: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1968378&type=&dateb=&owner=include&count=40",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "harbin-jixianglong",
    name: "Harbin Jixianglong Biotech Co., Ltd.",
    kind: "manufacturer",
    jurisdiction: "China",
    status: "under-enforcement",
    note: "GLP-1 API maker: CGMP warning letter and a recall of semaglutide labelled for compounding use.",
    peptides: ["semaglutide", "tirzepatide"],
    labelling: "ruo",
    events: [
      {
        date: "2026-03-11",
        kind: "recall",
        summary:
          "Class II recall of 2 products (Semaglutide). Reason: CGMP Deviations This recall has been initiated due to failing to complete process validati. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0379-2026 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0379-2026%22",
        },
      },
      {
        date: "2026-05-01",
        kind: "warning-letter",
        summary:
          "FDA warning letter (CGMP/API/Adulterated and Misbranded Drugs), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Harbin Jixianglong Biotech Co., Ltd. (2026-05-01)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/harbin-jixianglong-biotech-co-ltd-723330-05012026",
        },
      },
    ],
    news: ["fda-import-alert-66-80-september-2026"],
    updated: "2026-10-04",
  },
  {
    slug: "kellin-chemicals",
    name: "Kellin Chemicals Co., Ltd. (Zhangjiagang)",
    kind: "manufacturer",
    jurisdiction: "China",
    status: "under-enforcement",
    note: "API maker cited for CGMP violations.",
    events: [
      {
        date: "2025-11-06",
        kind: "warning-letter",
        summary:
          "FDA warning letter (CGMP/Active Pharmaceutical Ingredient (API)/Adulterated), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Kellin Chemicals Co., Ltd. - Zhangjiagang (2025-11-06)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/kellin-chemicals-co-ltd-716228-zhangjiagang",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "tianjin-kilo",
    name: "Tianjin Kilo Pharmaceutical Sci-tech Co., Ltd.",
    kind: "manufacturer",
    jurisdiction: "China",
    status: "under-enforcement",
    note: "API maker cited for CGMP violations and misbranding.",
    events: [
      {
        date: "2026-08-06",
        kind: "warning-letter",
        summary:
          "FDA warning letter (CGMP/Active Pharmaceutical Ingredient (API)/Adulterated/Misbranded), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Tianjin Kilo Pharmaceutical Sci-tech Co., Ltd. (2026-08-06)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/tianjin-kilo-pharmaceutical-sci-tech-co-ltd-731761-08062026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "darmerica",
    name: "Darmerica, LLC",
    kind: "manufacturer",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "US distributor of bulk peptide APIs cited for CGMP violations and misbranding.",
    peptides: ["cagrilintide", "hexarelin", "retatrutide"],
    domains: ["darmerica.com"],
    events: [
      {
        date: "2025-12-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (CGMP/Active Pharmaceutical Ingredient (API)/Adulterated/Misbranded), issued by CDER.",
        source: {
          label: "FDA warning letter – Darmerica, LLC (2025-12-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/darmerica-llc-716152-12082025",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "empower-pharmacy",
    name: "Empower Clinic Services, LLC dba Empower Pharmacy",
    kind: "compounder",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Large outsourcing facility compounding GLP-1s; CGMP and unapproved-drug warning letter in September 2026.",
    peptides: ["semaglutide", "tirzepatide"],
    labelling: "rx",
    events: [
      {
        date: "2026-09-18",
        kind: "warning-letter",
        summary:
          "FDA warning letter (CGMP/Finished Pharmaceuticals/Adulterated/Unapproved New Drug), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Empower Clinic Services, LLC dba Empower Pharmacy (2026-09-18)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/empower-clinic-services-llc-dba-empower-pharmacy-738238-09182026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "genogenix",
    name: "GenoGenix LLC",
    kind: "compounder",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Compounding pharmacy: January 2026 warning letter and a nine-product recall covering BPC-157, GHK-Cu, tesamorelin and tirzepatide.",
    peptides: [
      "epithalon",
      "retatrutide",
      "semaglutide",
      "thymosin-beta-4",
      "tirzepatide",
      "ghk-cu",
      "bpc-157",
      "tesamorelin",
      "sermorelin",
    ],
    labelling: "rx",
    events: [
      {
        date: "2025-10-15",
        kind: "recall",
        summary:
          "Class II recall of 9 products (BPC; GHK-Cu; Low Solubility Peptide Reconstitution So; Semaglutide for Injection…). Reason: Lack of Assurance of Sterility. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0051-2026 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0051-2026%22",
        },
      },
      {
        date: "2026-01-20",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Compounding Pharmacy/Adulterated Drug Products), issued by CDER.",
        source: {
          label: "FDA warning letter – GenoGenix LLC (2026-01-20)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/genogenix-llc-718739-01202026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "new-life-pharma",
    name: "New Life Pharma LLC",
    kind: "compounder",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Warning letter for CGMP violations and unapproved GLP-1 drugs, with a sterility recall.",
    peptides: ["semaglutide", "tirzepatide"],
    labelling: "rx",
    events: [
      {
        date: "2026-03-11",
        kind: "recall",
        summary:
          "Class II recall of 4 products (Semaglutide Inj; Tirzepatide Inj). Reason: Lack of Assurance of Sterility. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0392-2026 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0392-2026%22",
        },
      },
      {
        date: "2026-04-14",
        kind: "warning-letter",
        summary:
          "FDA warning letter (CGMP/Adulterated and Unapproved New Drug/Misbranded), issued by CDER.",
        source: {
          label: "FDA warning letter – New Life Pharma LLC (2026-04-14)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/new-life-pharma-llc-725661-04142026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "mile-high-compounds",
    name: "Mile High Compounds LLC",
    kind: "compounder",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Cited for selling unapproved GLP-1 drugs over the internet.",
    peptides: ["retatrutide", "semaglutide", "tirzepatide"],
    labelling: "rx",
    events: [
      {
        date: "2026-03-31",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Unapproved New Drugs Sold Over the Internet), issued by CDER.",
        source: {
          label: "FDA warning letter – Mile High Compounds LLC (2026-03-31)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/mile-high-compounds-llc-721600-03312026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "guyer-institute",
    name: "Advanced Nutriceuticals, LLC dba The Guyer Institute of Molecular Medicine",
    kind: "compounder",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Clinic-attached compounder recalling BPC-157 in 2020, then a 2021 warning letter naming BPC-157, LL-37, Selank, Semax and thymosins.",
    peptides: [
      "bpc-157",
      "ll-37",
      "selank",
      "semax",
      "thymosin-alpha-1",
      "thymosin-beta-4",
      "cjc-1295",
      "ipamorelin",
    ],
    labelling: "rx",
    events: [
      {
        date: "2020-12-23",
        kind: "recall",
        summary:
          "Class II recall of 4 products (BPC; CJC; GHRP; IPAMORELIN). Reason: Lack of Assurance of Sterility. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0128-2021 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0128-2021%22",
        },
      },
      {
        date: "2021-11-10",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Compounding Pharmacy/Adulterated Drug Products), issued by Division of Pharmaceutical Quality Operations Division III.",
        source: {
          label:
            "FDA warning letter – Advanced Nutriceuticals, LLC dba The Guyer Institute of Molecular Medicine (2021-11-10)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/advanced-nutriceuticals-llc-dba-guyer-institute-molecular-medicine-615908-11102021",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "innoveix",
    name: "Innoveix Pharmaceuticals Inc",
    kind: "compounder",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Compounder with sterility recalls and a 2022 warning letter naming sermorelin, ipamorelin and AOD-9604.",
    peptides: ["aod-9604", "ipamorelin", "sermorelin", "ghrp-2"],
    labelling: "rx",
    events: [
      {
        date: "2019-11-06",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Lyophilized Sermorelin w/ GHRP). Reason: Lack of Sterility Assurance. Status terminated.",
        source: {
          label: "FDA enforcement report D-0159-2020 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0159-2020%22",
        },
      },
      {
        date: "2021-07-28",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Compounded Lyophilized Semorelin/Ipamore). Reason: Lack of Assurance of Sterility. Status completed.",
        source: {
          label: "FDA enforcement report D-0692-2021 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0692-2021%22",
        },
      },
      {
        date: "2022-01-26",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Compounding Pharmacy/Adulterated Drug Products), issued by Office of Pharmaceutical Quality Operations, Division II.",
        source: {
          label:
            "FDA warning letter – Innoveix Pharmaceuticals Inc (2022-01-26)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/innoveix-pharmaceuticals-inc-624782-01262022",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "prorx",
    name: "ProRx LLC",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Fourteen compounded semaglutide and tirzepatide products recalled across 2024 and 2025 for lack of sterility assurance.",
    peptides: ["semaglutide", "tirzepatide"],
    labelling: "rx",
    events: [
      {
        date: "2024-09-11",
        kind: "recall",
        summary:
          "Class II recall of 7 products (SEMAGLUTIDE; Semaglutide; Semaglutide / Cyanocobalamin Injection:; TIRZEPATIDE…). Reason: Lack of Assurance of Sterility. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0650-2024 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0650-2024%22",
        },
      },
      {
        date: "2025-11-05",
        kind: "recall",
        summary:
          "Class II recall of 7 products (Semaglutide Injection; Tirzepatide Injection). Reason: Lack of Assurance of Sterility. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0114-2026 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0114-2026%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "thrive-health-solutions",
    name: "Thrive Health and Wellness, LLC dba Thrive Health Solutions",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Nine compounded GLP-1 products recalled in 2025.",
    peptides: ["cjc-1295", "semaglutide", "tirzepatide"],
    labelling: "rx",
    events: [
      {
        date: "2025-07-02",
        kind: "recall",
        summary:
          "Class II recall of 9 products (CJC; Semaglutide; Semaglutide/Cyanocobalamin Injectable; Tirzepatide Injections…). Reason: Lack of Assurance of Sterility. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0475-2025 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0475-2025%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "aequita-pharmacy",
    name: "Aequita Pharmacy",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Thirteen compounded GLP-1 products recalled in 2025 for lack of processing controls.",
    peptides: ["semaglutide", "tirzepatide"],
    labelling: "rx",
    events: [
      {
        date: "2025-08-13",
        kind: "recall",
        summary:
          "Class II recall of 13 products (Semaglutide + Cyanocobalamin; Semaglutide + Cyanocobalamin injection s; Semaglutide +Cyanocobalamin; Tirzepatide + Niacinamide). Reason: Lack of Processing Controls. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0553-2025 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0553-2025%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "apollo-care",
    name: "Apollo Care, LLC",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Eleven compounded semaglutide products recalled in August 2026 for particulate matter.",
    peptides: ["semaglutide"],
    labelling: "rx",
    events: [
      {
        date: "2026-08-19",
        kind: "recall",
        summary:
          "Class II recall of 11 products (SEMAGLUTIDE). Reason: Presence of Particulate Matter; identified as a nylon/polyamide and silk/proteinaceous-typ. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0747-2026 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0747-2026%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "boothwyn-pharmacy",
    name: "Boothwyn Pharmacy LLC",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Compounded semaglutide recalled in 2025 as subpotent.",
    peptides: ["semaglutide"],
    labelling: "rx",
    events: [
      {
        date: "2025-09-10",
        kind: "recall",
        summary:
          "Class II recall of 3 products (Semaglutide). Reason: Subpotent Drug. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0606-2025 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0606-2025%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "payless-compounders",
    name: "Payless Compounders, LLC",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Compounded semaglutide recalled in 2026 for lack of sterility assurance.",
    peptides: ["semaglutide"],
    labelling: "rx",
    events: [
      {
        date: "2026-04-22",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Semaglutide-Glycine-Cyanocobalamin Injec). Reason: Lack of Assurance of Sterility. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0471-2026 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0471-2026%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "revive-rx",
    name: "Revive Rx LLC dba Revive Rx Pharmacy",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Recalled a product labelled as tirzepatide that contained testosterone (label mix-up), 2024.",
    peptides: ["tirzepatide"],
    labelling: "rx",
    events: [
      {
        date: "2023-05-31",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Tirzepatide). Reason: Sub-potent Drug. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0771-2023 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0771-2023%22",
        },
      },
      {
        date: "2024-06-05",
        kind: "recall",
        summary:
          "Class I recall of 1 product (Tirzepatide). Reason: Labeling. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0511-2024 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0511-2024%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "tailor-made-compounding",
    name: "Tailor Made Compounding (TMC Acquisition LLC)",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Peptide compounder with recalls in 2018, 2022 and 2023, including semaglutide and sermorelin products.",
    peptides: ["tesamorelin", "semaglutide", "sermorelin"],
    aka: ["TMC Acquisitions LLC"],
    labelling: "rx",
    events: [
      {
        date: "2018-11-14",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Tesamorelin). Reason: Labeling. Status terminated.",
        source: {
          label: "FDA enforcement report D-0223-2019 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0223-2019%22",
        },
      },
      {
        date: "2022-07-20",
        kind: "recall",
        summary:
          "Class II recall of 5 products (Semaglutide/Cyanocobalamin; Sermorelin; Sermorelin/Glycine). Reason: Lack of Assurance of Sterility. Status ongoing.",
        source: {
          label: "FDA enforcement report D-1224-2022 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-1224-2022%22",
        },
      },
      {
        date: "2023-08-30",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Semaglutide/Cyanocobalamin). Reason: Lack of Assurance of Sterility. Status terminated.",
        source: {
          label: "FDA enforcement report D-1105-2023 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-1105-2023%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "wells-pharmacy-network",
    name: "Wells Pharmacy Network LLC",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Twelve sermorelin and GHRP kit recalls in January 2017.",
    peptides: ["sermorelin", "ghrp-2", "ghrp-6"],
    labelling: "rx",
    events: [
      {
        date: "2017-01-11",
        kind: "recall",
        summary:
          "Class II recall of 12 products (Sermorelin Acetate; Sermorelin Acetate/GHRP). Reason: Lack of Assurance of Sterility. Status terminated.",
        source: {
          label: "FDA enforcement report D-0386-2017 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0386-2017%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "olympia-pharmacy",
    name: "Olympia Compounding Pharmacy (Lowlite Investments, Inc.)",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Sermorelin and GHRP recalls in 2013 and 2022.",
    peptides: ["sermorelin"],
    labelling: "rx",
    events: [
      {
        date: "2013-07-17",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Sermorelin/GHRP). Reason: Lack of Assurance of Sterility. Status ongoing.",
        source: {
          label: "FDA enforcement report D-779-2013 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-779-2013%22",
        },
      },
      {
        date: "2022-03-30",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Sermorelin Acetate Lyophilized powder fo). Reason: Sub Potent. Status terminated.",
        source: {
          label: "FDA enforcement report D-0718-2022 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0718-2022%22",
        },
      },
      {
        date: "2022-05-04",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Sermorelin Acetate). Reason: CGMP Deviations. Status terminated.",
        source: {
          label: "FDA enforcement report D-0797-2022 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0797-2022%22",
        },
      },
      {
        date: "2022-06-01",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Sermorelin Acetate Lyophilized powder fo). Reason: Lack of assurance of sterility. Status completed.",
        source: {
          label: "FDA enforcement report D-0902-2022 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0902-2022%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "promise-pharmacy",
    name: "Promise Pharmacy, LLC",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Ten recalls in 2019 covering sermorelin, ipamorelin, BPC-157 and GHRP products.",
    peptides: [
      "sermorelin",
      "ghrp-2",
      "ghrp-6",
      "ipamorelin",
      "cjc-1295",
      "bpc-157",
    ],
    labelling: "rx",
    events: [
      {
        date: "2019-02-20",
        kind: "recall",
        summary:
          "Class II recall of 10 products (BPC; Ipamorelin; Ipamorelin+Modified GRF; Ipamorelin+Sermorelin…). Reason: Lack of sterility assurance. Status terminated.",
        source: {
          label: "FDA enforcement report D-0448-2019 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0448-2019%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "pharm-d-solutions",
    name: "Pharm D Solutions, LLC",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Fourteen sermorelin, GHRP-2 and ipamorelin recalls across 2018 and 2019.",
    peptides: ["sermorelin", "ipamorelin", "ghrp-2", "ghrp-6"],
    labelling: "rx",
    events: [
      {
        date: "2018-11-07",
        kind: "recall",
        summary:
          "Class II recall of 7 products (Sermorelin/GHRP; Sermorelin/Ipamorelin). Reason: Lack of Assurance of Sterility. Status terminated.",
        source: {
          label: "FDA enforcement report D-0179-2019 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0179-2019%22",
        },
      },
      {
        date: "2019-06-19",
        kind: "recall",
        summary:
          "Class II recall of 7 products (Ipamorelin Acetate; Sermorelin/GHRP; Sermorelin/Ipamorelin). Reason: Lack of Sterility Assurance. Status terminated.",
        source: {
          label: "FDA enforcement report D-1327-2019 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-1327-2019%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "krs-global-biotechnology",
    name: "KRS Global Biotechnology, Inc",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Twelve sermorelin and GHRP recalls across 2018 and 2019.",
    peptides: ["sermorelin", "ghrp-2", "ghrp-6"],
    labelling: "rx",
    events: [
      {
        date: "2018-01-17",
        kind: "recall",
        summary:
          "Class II recall of 4 products (Sermorelin; Sermorelin Acetate). Reason: Labeling. Status terminated.",
        source: {
          label: "FDA enforcement report D-0193-2018 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0193-2018%22",
        },
      },
      {
        date: "2019-10-09",
        kind: "recall",
        summary:
          "Class II recall of 8 products (Sermorelin; Sermorelin Acetate). Reason: Lack of Assurance of Sterility. Status terminated.",
        source: {
          label: "FDA enforcement report D-0093-2020 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0093-2020%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "tri-coast-pharmacy",
    name: "Tri-Coast Pharmacy",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Eight sermorelin and GHRP product recalls in 2017; the enforcement report remains open.",
    peptides: ["sermorelin", "ghrp-6", "ghrp-2"],
    labelling: "rx",
    events: [
      {
        date: "2017-01-11",
        kind: "recall",
        summary:
          "Class II recall of 8 products (Sermorelin Acetate; Sermorelin Forte; Sermorelin Forte Plus; Sermorelin GT). Reason: Lack of Assurance of Sterility. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0287-2017 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0287-2017%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "talon-compounding",
    name: "Vita Pharmacy, LLC dba Talon Compounding Pharmacy",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Sermorelin, ipamorelin and CJC-1295 recalls in 2016 and 2021.",
    peptides: ["sermorelin", "ghrp-2", "ipamorelin", "cjc-1295"],
    labelling: "rx",
    events: [
      {
        date: "2016-08-31",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Sermorelin). Reason: Lack of Assurance of Sterility. Status terminated.",
        source: {
          label: "FDA enforcement report D-1463-2016 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-1463-2016%22",
        },
      },
      {
        date: "2021-11-17",
        kind: "recall",
        summary:
          "Class II recall of 4 products (CJC; SERMORELIN ACETATE). Reason: Lack of assurance of sterility. Status terminated.",
        source: {
          label: "FDA enforcement report D-0109-2022 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0109-2022%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "carolina-infusion",
    name: "Carolina Infusion",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Semaglutide and sermorelin recalls in 2022.",
    peptides: ["sermorelin", "semaglutide"],
    labelling: "rx",
    events: [
      {
        date: "2022-09-21",
        kind: "recall",
        summary:
          "Class II recall of 4 products (Semaglutide/Cyanocobalamin; Sermorelin Acetate). Reason: Lack of Assurance of Sterility. Status completed.",
        source: {
          label: "FDA enforcement report D-1518-2022 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-1518-2022%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "vital-care-compounder",
    name: "Pharmacy Plus, Inc. dba Vital Care Compounder",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Compounded semaglutide recalls in 2022 and 2023.",
    peptides: ["semaglutide"],
    labelling: "rx",
    events: [
      {
        date: "2022-11-09",
        kind: "recall",
        summary:
          "Class II recall of 1 product (SEMAGLUTIDE INJECTION). Reason: Lack of Assurance of Sterility. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0053-2023 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0053-2023%22",
        },
      },
      {
        date: "2023-04-26",
        kind: "recall",
        summary:
          "Class II recall of 1 product (C-Semaglutide). Reason: Lack of assurance of sterility. Status ongoing.",
        source: {
          label: "FDA enforcement report D-0538-2023 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0538-2023%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "pharmacy-innovations",
    name: "Pharmacy Innovations",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Compounded semaglutide recall in 2023 after an inspection found insanitary conditions.",
    peptides: ["semaglutide"],
    labelling: "rx",
    events: [
      {
        date: "2023-02-01",
        kind: "recall",
        summary:
          "Class II recall of 1 product (SEMAGLUTIDE). Reason: Lack of Assurance of Sterility. Status terminated.",
        source: {
          label: "FDA enforcement report D-0236-2023 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0236-2023%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "farmakeio",
    name: "North American Custom Laboratories, LLC dba FarmaKeio",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Sterility recalls in 2022.",
    peptides: ["bpc-157", "sermorelin", "ipamorelin"],
    labelling: "rx",
    events: [
      {
        date: "2022-04-27",
        kind: "recall",
        summary:
          "Class II recall of 3 products (BPC; Ipamorelin Acetate/Sermorelin Acetate; Sermorelin Acetate). Reason: Lack of Assurance of Sterility. Status terminated.",
        source: {
          label: "FDA enforcement report D-0776-2022 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0776-2022%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "assurance-infusion",
    name: "Assurance Infusion",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Ipamorelin among three products recalled in 2020.",
    peptides: ["bpc-157", "ipamorelin", "cjc-1295"],
    labelling: "rx",
    events: [
      {
        date: "2020-01-22",
        kind: "recall",
        summary:
          "Class II recall of 3 products (BPC; CJC; IPAMORELIN). Reason: Lack of sterility assurance. Status terminated.",
        source: {
          label: "FDA enforcement report D-0679-2020 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0679-2020%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "pharmcore",
    name: "Pharmcore Inc.",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Ipamorelin recall in 2018.",
    peptides: ["ipamorelin"],
    labelling: "rx",
    events: [
      {
        date: "2018-09-05",
        kind: "recall",
        summary:
          "Class II recall of 2 products (Ipamorelin). Reason: Lack of assurance of sterility. Status terminated.",
        source: {
          label: "FDA enforcement report D-1153-2018 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-1153-2018%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "anderson-compounding",
    name: "Anderson Compounding Pharmacy, Inc.",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Sermorelin recalls in 2019.",
    peptides: ["sermorelin"],
    labelling: "rx",
    events: [
      {
        date: "2019-04-24",
        kind: "recall",
        summary:
          "Class II recall of 2 products (Sermorelin). Reason: Lack of sterility assurance. Status terminated.",
        source: {
          label: "FDA enforcement report D-1175-2019 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-1175-2019%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "downing-labs",
    name: "Downing Labs, LLC",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Sermorelin/GHRP recall in 2015.",
    peptides: ["sermorelin", "ghrp-2", "ghrp-6"],
    labelling: "rx",
    events: [
      {
        date: "2015-11-25",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Sermorelin/GHRP). Reason: Lack of Assurance of Sterility. Status terminated.",
        source: {
          label: "FDA enforcement report D-0364-2016 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0364-2016%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "moses-lake-pharmacy",
    name: "JD & SN Inc., dba Moses Lake Professional Pharmacy",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Sermorelin/GHRP recalls in 2015.",
    peptides: ["sermorelin", "ghrp-2", "ghrp-6"],
    labelling: "rx",
    events: [
      {
        date: "2015-11-04",
        kind: "recall",
        summary:
          "Class II recall of 3 products (SERMORELIN/GHRP). Reason: Lack of Assurance of Sterility; all sterile human compounded drugs within expiry. Status terminated.",
        source: {
          label: "FDA enforcement report D-0120-2016 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0120-2016%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "western-drug",
    name: "Western Drug",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Sermorelin recall in 2015.",
    peptides: ["sermorelin"],
    labelling: "rx",
    events: [
      {
        date: "2015-12-09",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Sermorelin Injection). Reason: Lack of Assurance of Sterility. Status terminated.",
        source: {
          label: "FDA enforcement report D-0450-2016 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0450-2016%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "dca-pharmacy",
    name: "Diabetes Corporation of America dba DCA Pharmacy",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Sermorelin recall in 2015.",
    peptides: ["sermorelin"],
    labelling: "rx",
    events: [
      {
        date: "2015-10-14",
        kind: "recall",
        summary:
          "Class II recall of 1 product (Sermorelin). Reason: Lack of Assurance of Sterility. Status terminated.",
        source: {
          label: "FDA enforcement report D-0006-2016 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-0006-2016%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "essential-wellness-pharma",
    name: "Kalman Health & Wellness, Inc. dba Essential Wellness Pharma",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Sermorelin recalls in 2015.",
    peptides: ["sermorelin"],
    labelling: "rx",
    events: [
      {
        date: "2015-11-25",
        kind: "recall",
        summary:
          "Class II recall of 3 products (Sermorelin; sermorelin). Reason: Lack of Assurance of Sterility. Status terminated.",
        source: {
          label: "FDA enforcement report D-324-2016 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-324-2016%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "compounding-pharmacy-of-america",
    name: "The Compounding Pharmacy of America",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Five sermorelin and GHRP recalls in 2015.",
    peptides: ["sermorelin", "ghrp-2", "ghrp-6"],
    labelling: "rx",
    events: [
      {
        date: "2015-09-23",
        kind: "recall",
        summary:
          "Class II recall of 5 products (Sermorelin; Sermorelin/GHRP). Reason: Lack of Assurance of Sterility; FDA inspection identified GMP violations potentially impac. Status terminated.",
        source: {
          label: "FDA enforcement report D-1629-2015 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-1629-2015%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "main-street-family-pharmacy",
    name: "Main Street Family Pharmacy, LLC",
    kind: "compounder",
    jurisdiction: "United States",
    status: "recall-on-record",
    note: "Sermorelin recalls in 2013 after adverse-reaction reports.",
    peptides: ["sermorelin"],
    labelling: "rx",
    events: [
      {
        date: "2013-12-11",
        kind: "recall",
        summary:
          "Class II recall of 4 products (Sermorelin; Sermorelin GHRP). Reason: The firm received seven reports of adverse reactions in the form of skin abscesses potenti. Status terminated.",
        source: {
          label: "FDA enforcement report D-262-2014 (openFDA)",
          href: "https://api.fda.gov/drug/enforcement.json?search=recall_number:%22D-262-2014%22",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "nativemed",
    name: "NativeMed LLC",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["nativemed.net"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label:
            "FDA warning letter – NativeMed LLC dba NativeMed (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/nativemed-llc-dba-nativemed-728287-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "hydramed",
    name: "HydraMed IV LLC",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["hydramed.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label:
            "FDA warning letter – HydraMed IV LLC dba HydraMed (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/hydramed-iv-llc-dba-hydramed-728282-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "harper-meds",
    name: "Nexus Health Solutions LLC dba Harper Meds",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["harpermeds.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Nexus Health Solutions LLC dba Harper Meds (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/nexus-health-solutions-llc-dba-harper-meds-728281-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "am-rx",
    name: "FitRX, LLC dba AM RX",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["getamrx.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label: "FDA warning letter – FitRX, LLC dba AM RX (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/fitrx-llc-dba-am-rx-728275-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "maximus",
    name: "Maximus Health, Inc.",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["maximustribe.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Maximus Health, Inc. dba Maximus (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/maximus-health-inc-dba-maximus-730095-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "altrx",
    name: "Trinity HealthCare Supply, LLC dba altRx",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["altrx.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Trinity HealthCare Supply, LLC dba altRx (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/trinity-healthcare-supply-llc-dba-altrx-728236-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "mint-med",
    name: "Glow Medispa, LLC dba Mint Med",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["mintmed.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Glow Medispa, LLC dba Mint Med (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/glow-medispa-llc-dba-mint-med-730390-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "ezra",
    name: "Ezra Holdco LLC",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["joinezra.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label: "FDA warning letter – Ezra Holdco LLC dba Ezra (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/ezra-holdco-llc-dba-ezra-730995-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "altru-telehealth",
    name: "Altru Telehealth, LLC",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["altrutelehealth.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Altru Telehealth, LLC dba Altru Telehealth (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/altru-telehealth-llc-dba-altru-telehealth-728274-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "eden",
    name: "Eden Health International Inc.",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["tryeden.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Eden Health International Inc. dba Eden (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/eden-health-international-inc-dba-eden-728279-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "drmedhealth",
    name: "Public Health Solution LLC dba DrMedHealth",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["drmedhealth.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Public Health Solution LLC dba DrMedHealth (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/public-health-solution-llc-dba-drmedhealth-728278-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "d-h-medical",
    name: "D&H Medical Services",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["dhmedicalcenter.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label: "FDA warning letter – D&H Medical Services (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/dh-medical-services-728238-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "momentum-health",
    name: "Momentum Health 360",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["liraglutide", "semaglutide", "tirzepatide"],
    domains: ["momentumhealth360.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Momentum Health 360 dba Momentum Health (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/momentum-health-360-dba-momentum-health-728286-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "amie",
    name: "Amie Health, Inc.",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["tryamie.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label: "FDA warning letter – Amie Health, Inc. dba Amie (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/amie-health-inc-dba-amie-728276-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "thrivelab",
    name: "Thrivelab Co.",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide"],
    domains: ["thrivelab.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Thrivelab Co. dba Thrivelab (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/thrivelab-co-dba-thrivelab-728294-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "viviomd",
    name: "VivioMD Group LLC",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Telehealth marketer of compounded GLP-1 drugs; June 2026 warning letter for false or misleading claims.",
    peptides: ["semaglutide", "tirzepatide"],
    domains: ["viviomd.com"],
    labelling: "rx",
    events: [
      {
        date: "2026-06-08",
        kind: "warning-letter",
        summary:
          "FDA warning letter (False & Misleading Claims/Misbranded (Telehealth)), issued by CDER.",
        source: {
          label:
            "FDA warning letter – VivioMD Group LLC dba VivioMD (2026-06-08)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/viviomd-group-llc-dba-viviomd-728295-06082026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "tex-peptides",
    name: "TXP Innovations LLC dba Tex Peptides",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "One of five sellers warned on 24 August 2026 for marketing unapproved GLP-1 and other peptides under research-use labelling.",
    peptides: [
      "bremelanotide",
      "retatrutide",
      "semaglutide",
      "tesamorelin",
      "tirzepatide",
    ],
    domains: ["texpeptide.com"],
    labelling: "ruo",
    events: [
      {
        date: "2026-08-24",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Unapproved New Drugs/Misbranded), issued by CDER.",
        source: {
          label:
            "FDA warning letter – TXP Innovations LLC dba Tex Peptides (2026-08-24)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/txp-innovations-llc-dba-tex-peptides-735067-08242026",
        },
      },
    ],
    news: ["fda-warning-letters-five-peptide-sellers-august-2026"],
    updated: "2026-10-04",
  },
  {
    slug: "royal-peptides",
    name: "Royal Peptides LLC",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Warned 24 August 2026; the letter names tirzepatide, semaglutide, retatrutide, PT-141 and tesamorelin.",
    peptides: [
      "bremelanotide",
      "ipamorelin",
      "retatrutide",
      "semaglutide",
      "tesamorelin",
      "tirzepatide",
    ],
    domains: ["royal-peptides.com"],
    labelling: "ruo",
    events: [
      {
        date: "2026-08-24",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Unapproved New Drugs/Misbranded), issued by CDER.",
        source: {
          label: "FDA warning letter – Royal Peptides LLC (2026-08-24)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/royal-peptides-llc-734884-08242026",
        },
      },
    ],
    news: ["fda-warning-letters-five-peptide-sellers-august-2026"],
    updated: "2026-10-04",
  },
  {
    slug: "nuscience-peptides",
    name: "NuScience Peptides LLC",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Warned 24 August 2026 for marketing unapproved peptides.",
    peptides: [
      "bremelanotide",
      "ipamorelin",
      "retatrutide",
      "semaglutide",
      "tesamorelin",
    ],
    domains: ["nusciencepeptides.com"],
    events: [
      {
        date: "2026-08-24",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Unapproved New Drugs/Misbranded), issued by CDER.",
        source: {
          label: "FDA warning letter – NuScience Peptides LLC (2026-08-24)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/nuscience-peptides-llc-733652-08242026",
        },
      },
    ],
    news: ["fda-warning-letters-five-peptide-sellers-august-2026"],
    updated: "2026-10-04",
  },
  {
    slug: "peptide-partners",
    name: "Peptide Partners LLC",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Warned 24 August 2026 for marketing unapproved peptides.",
    peptides: [
      "bremelanotide",
      "retatrutide",
      "semaglutide",
      "tesamorelin",
      "tirzepatide",
    ],
    labelling: "ruo",
    events: [
      {
        date: "2026-08-24",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Unapproved New Drugs/Misbranded), issued by CDER.",
        source: {
          label: "FDA warning letter – Peptide Partners LLC (2026-08-24)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/peptide-partners-llc-735063-08242026",
        },
      },
    ],
    news: ["fda-warning-letters-five-peptide-sellers-august-2026"],
    updated: "2026-10-04",
  },
  {
    slug: "peak-performance-peptides",
    name: "Peak Performance Peptides",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Warned 24 August 2026 for marketing unapproved peptides.",
    peptides: ["bremelanotide", "retatrutide", "semaglutide", "tesamorelin"],
    domains: ["pppepz.com"],
    labelling: "ruo",
    events: [
      {
        date: "2026-08-24",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Unapproved New Drugs/Misbranded), issued by CDER.",
        source: {
          label: "FDA warning letter – Peak Performance Peptides (2026-08-24)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/peak-performance-peptides-735127-08242026",
        },
      },
    ],
    news: ["fda-warning-letters-five-peptide-sellers-august-2026"],
    updated: "2026-10-04",
  },
  {
    slug: "wholesale-peptide",
    name: "Wholesale Peptide",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "June 2026 warning letter for unapproved and misbranded drugs under research-use labelling.",
    domains: ["wholesalepeptide.com"],
    labelling: "ruo",
    events: [
      {
        date: "2026-06-17",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Unapproved New Drugs/Misbranded), issued by CDER.",
        source: {
          label: "FDA warning letter – Wholesale Peptide (2026-06-17)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/wholesale-peptide-729447-06172026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "pink-pony-peptides",
    name: "Lovega LLC dba Pink Pony Peptides",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "March 2026 warning letter for unapproved drugs sold over the internet, naming retatrutide and tirzepatide.",
    peptides: ["retatrutide", "tirzepatide"],
    domains: ["pinkponypeptides.com"],
    labelling: "ruo",
    events: [
      {
        date: "2026-03-31",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Unapproved New Drugs Sold Over the Internet), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Lovega LLC dba Pink Pony Peptides (2026-03-31)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/lovega-llc-dba-pink-pony-peptides-721088-03312026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "gram-peptides",
    name: "Gram Peptides",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "March 2026 warning letter for unapproved drugs sold over the internet.",
    peptides: ["retatrutide", "tirzepatide"],
    domains: ["grampeptides.com"],
    labelling: "ruo",
    events: [
      {
        date: "2026-03-31",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Unapproved New Drugs Sold Over the Internet), issued by CDER.",
        source: {
          label: "FDA warning letter – Gram Peptides (2026-03-31)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/gram-peptides-721806-03312026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "prime-sciences",
    name: "Prime Sciences",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "March 2026 warning letter naming cagrilintide, retatrutide, semaglutide and tirzepatide.",
    peptides: ["cagrilintide", "retatrutide", "semaglutide", "tirzepatide"],
    domains: ["prime-sciences.com"],
    labelling: "ruo",
    events: [
      {
        date: "2026-03-31",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Unapproved New Drugs Sold Over the Internet), issued by CDER.",
        source: {
          label: "FDA warning letter – Prime Sciences (2026-03-31)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/prime-sciences-721805-03312026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "pinnacle-peptides",
    name: "Pinnacle Professional Research dba Pinnacle Peptides",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "December 2025 warning letter for unapproved new drugs.",
    domains: ["pinnaclepeptides.com"],
    labelling: "ruo",
    events: [
      {
        date: "2025-12-12",
        kind: "warning-letter",
        summary: "FDA warning letter (Unapproved New Drugs), issued by CDER.",
        source: {
          label:
            "FDA warning letter – Pinnacle Professional Research dba Pinnacle Peptides (2025-12-12)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/pinnacle-professional-research-dba-pinnacle-peptides-719337-12122025",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "xcel-research",
    name: "Xcel Research LLC",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "December 2024 warning letter naming cagrilintide, retatrutide, semaglutide and sermorelin.",
    peptides: ["cagrilintide", "retatrutide", "semaglutide", "sermorelin"],
    domains: ["xcelpeptides.com"],
    labelling: "ruo",
    events: [
      {
        date: "2024-12-10",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Unapproved New Drugs/Misbranded), issued by CDER.",
        source: {
          label: "FDA warning letter – Xcel Research LLC (2024-12-10)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/xcel-research-llc-694608-12102024",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "warrior-labz",
    name: "Warrior Labz SARMS",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "June 2023 warning letter naming BPC-157 and TB-500 alongside SARMs.",
    peptides: ["bpc-157", "tb-500", "thymosin-beta-4"],
    domains: ["warriorlabzsarms.com"],
    events: [
      {
        date: "2023-06-12",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Unapproved New Drugs/Misbranded), issued by CDER.",
        source: {
          label: "FDA warning letter – Warrior Labz SARMS (2023-06-12)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/warrior-labz-sarms-655280-06122023",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "biodrive",
    name: "BioDrive, Inc.",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Marketed a product as a dietary supplement; August 2026 letter cites adulteration with a GLP-1 ingredient.",
    aka: ["Dietary-supplement marketer"],
    events: [
      {
        date: "2026-08-24",
        kind: "warning-letter",
        summary:
          "FDA warning letter (Dietary Supplement/Adulterated), issued by Human Foods Program.",
        source: {
          label: "FDA warning letter – BioDrive, Inc. (2026-08-24)",
          href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/biodrive-inc-731846-08242026",
        },
      },
    ],
    updated: "2026-10-04",
  },
  {
    slug: "paradigm-peptides",
    name: "Paradigm Peptides",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "under-enforcement",
    note: "Owner sentenced to 70 months in federal prison in July 2026 for introducing unapproved drugs with intent to defraud; products sold as SARMs were found to be testosterone.",
    events: [
      {
        date: "2026-07-30",
        kind: "criminal",
        summary:
          "U.S. Attorney's Office (N.D. Ind.) announces 70-month sentence for the owner and 16 months for a co-defendant; $5 million money judgment.",
        source: {
          label: "DOJ press release – N.D. Indiana, 2026-07-30",
          href: "https://www.justice.gov/usao-ndin/pr/illinois-man-and-indiana-woman-sentenced-respectively-70-months-and-16-months-prison",
        },
      },
    ],
    news: ["paradigm-peptides-owner-sentenced-70-months"],
    updated: "2026-10-04",
  },
  {
    slug: "astra-peptides",
    name: "Astra LLC d/b/a Astra Peptides",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "in-litigation",
    note: "Named as a defendant in Eli Lilly's August 2026 lawsuits over retatrutide sold before approval. No government enforcement record found.",
    peptides: ["retatrutide"],
    events: [
      {
        date: "2026-08-12",
        kind: "lawsuit",
        summary: "Sued by Eli Lilly over the marketing of retatrutide.",
        source: {
          label: "Lilly release – lawsuits over retatrutide sellers (2026-08)",
          href: "https://investor.lilly.com/news-releases/news-release-details/lilly-calls-online-platforms-payment-companies-and-regulators",
        },
      },
    ],
    news: ["lilly-sues-six-retatrutide-sellers-august-2026"],
    updated: "2026-10-04",
  },
  {
    slug: "legendary-peptides",
    name: "Legendary Peptides",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "in-litigation",
    note: "Named as a defendant in Eli Lilly's August 2026 lawsuits over retatrutide sold before approval. No government enforcement record found.",
    peptides: ["retatrutide"],
    events: [
      {
        date: "2026-08-12",
        kind: "lawsuit",
        summary: "Sued by Eli Lilly over the marketing of retatrutide.",
        source: {
          label: "Lilly release – lawsuits over retatrutide sellers (2026-08)",
          href: "https://investor.lilly.com/news-releases/news-release-details/lilly-calls-online-platforms-payment-companies-and-regulators",
        },
      },
    ],
    news: ["lilly-sues-six-retatrutide-sellers-august-2026"],
    updated: "2026-10-04",
  },
  {
    slug: "texas-peptides",
    name: "Texas Peptides",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "in-litigation",
    note: "Named as a defendant in Eli Lilly's August 2026 lawsuits over retatrutide sold before approval. No government enforcement record found.",
    peptides: ["retatrutide"],
    events: [
      {
        date: "2026-08-12",
        kind: "lawsuit",
        summary: "Sued by Eli Lilly over the marketing of retatrutide.",
        source: {
          label: "Lilly release – lawsuits over retatrutide sellers (2026-08)",
          href: "https://investor.lilly.com/news-releases/news-release-details/lilly-calls-online-platforms-payment-companies-and-regulators",
        },
      },
    ],
    news: ["lilly-sues-six-retatrutide-sellers-august-2026"],
    updated: "2026-10-04",
  },
  {
    slug: "lone-star-peptide",
    name: "Lone Star Peptide Co.",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "in-litigation",
    note: "Named as a defendant in Eli Lilly's August 2026 lawsuits over retatrutide sold before approval. No government enforcement record found.",
    peptides: ["retatrutide"],
    events: [
      {
        date: "2026-08-12",
        kind: "lawsuit",
        summary: "Sued by Eli Lilly over the marketing of retatrutide.",
        source: {
          label: "Lilly release – lawsuits over retatrutide sellers (2026-08)",
          href: "https://investor.lilly.com/news-releases/news-release-details/lilly-calls-online-platforms-payment-companies-and-regulators",
        },
      },
    ],
    news: ["lilly-sues-six-retatrutide-sellers-august-2026"],
    updated: "2026-10-04",
  },
  {
    slug: "striker-pharmacy",
    name: "Striker Pharmacy",
    kind: "compounder",
    jurisdiction: "United States",
    status: "in-litigation",
    note: "Named as a defendant in Eli Lilly's August 2026 lawsuits over retatrutide sold before approval. No government enforcement record found.",
    peptides: ["retatrutide"],
    events: [
      {
        date: "2026-08-12",
        kind: "lawsuit",
        summary: "Sued by Eli Lilly over the marketing of retatrutide.",
        source: {
          label: "Lilly release – lawsuits over retatrutide sellers (2026-08)",
          href: "https://investor.lilly.com/news-releases/news-release-details/lilly-calls-online-platforms-payment-companies-and-regulators",
        },
      },
    ],
    news: ["lilly-sues-six-retatrutide-sellers-august-2026"],
    updated: "2026-10-04",
  },
  {
    slug: "aesthetic-envy",
    name: "Aesthetic Envy Cosmetic Centers",
    kind: "telehealth",
    jurisdiction: "United States",
    status: "in-litigation",
    note: "Named as a defendant in Eli Lilly's August 2026 lawsuits over retatrutide sold before approval. No government enforcement record found.",
    peptides: ["retatrutide"],
    events: [
      {
        date: "2026-08-12",
        kind: "lawsuit",
        summary: "Sued by Eli Lilly over the marketing of retatrutide.",
        source: {
          label: "Lilly release – lawsuits over retatrutide sellers (2026-08)",
          href: "https://investor.lilly.com/news-releases/news-release-details/lilly-calls-online-platforms-payment-companies-and-regulators",
        },
      },
    ],
    news: ["lilly-sues-six-retatrutide-sellers-august-2026"],
    updated: "2026-10-04",
  },
  {
    slug: "peptide-sciences",
    name: "Peptide Sciences",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "unverified",
    note: "Sells under research-use-only labelling. No FDA, DOJ, FTC or court record located at the time of review; listed because readers search for it.",
    domains: ["peptidesciences.com"],
    labelling: "ruo",
    updated: "2026-10-04",
  },
  {
    slug: "core-peptides",
    name: "Core Peptides",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "unverified",
    note: "Sells under research-use-only labelling. No FDA, DOJ, FTC or court record located at the time of review; listed because readers search for it.",
    domains: ["corepeptides.com"],
    labelling: "ruo",
    updated: "2026-10-04",
  },
  {
    slug: "amino-asylum",
    name: "Amino Asylum",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "unverified",
    note: "Sells under research-use-only labelling. No FDA, DOJ, FTC or court record located at the time of review; listed because readers search for it.",
    labelling: "ruo",
    updated: "2026-10-04",
  },
  {
    slug: "swiss-chems",
    name: "Swiss Chems",
    kind: "ruo-vendor",
    jurisdiction: "Unknown",
    status: "unverified",
    note: "Sells under research-use-only labelling. No FDA, DOJ, FTC or court record located at the time of review; listed because readers search for it.",
    labelling: "ruo",
    updated: "2026-10-04",
  },
  {
    slug: "limitless-life-nootropics",
    name: "Limitless Life Nootropics",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "unverified",
    note: "Sells under research-use-only labelling. No FDA, DOJ, FTC or court record located at the time of review; listed because readers search for it.",
    labelling: "ruo",
    updated: "2026-10-04",
  },
  {
    slug: "biotech-peptides",
    name: "BioTech Peptides",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "unverified",
    note: "Sells under research-use-only labelling. No FDA, DOJ, FTC or court record located at the time of review; listed because readers search for it.",
    domains: ["biotechpeptides.com"],
    labelling: "ruo",
    updated: "2026-10-04",
  },
  {
    slug: "sports-technology-labs",
    name: "Sports Technology Labs",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "unverified",
    note: "Sells under research-use-only labelling. No FDA, DOJ, FTC or court record located at the time of review; listed because readers search for it.",
    domains: ["sportstechnologylabs.com"],
    labelling: "ruo",
    updated: "2026-10-04",
  },
  {
    slug: "polaris-peptides",
    name: "Polaris Peptides",
    kind: "ruo-vendor",
    jurisdiction: "United States",
    status: "unverified",
    note: "Sells under research-use-only labelling. No FDA, DOJ, FTC or court record located at the time of review; listed because readers search for it.",
    labelling: "ruo",
    updated: "2026-10-04",
  },
  {
    slug: "particle-peptides",
    name: "Particle Peptides",
    kind: "ruo-vendor",
    jurisdiction: "Slovakia",
    status: "unverified",
    note: "Sells under research-use-only labelling. No FDA, DOJ, FTC or court record located at the time of review; listed because readers search for it.",
    labelling: "ruo",
    updated: "2026-10-04",
  },
];

export function getCompany(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}

/** Companies on record for a catalog peptide, strongest record first. */
export function companiesFor(peptideSlug: string): Company[] {
  return companies
    .filter((c) => c.peptides?.includes(peptideSlug))
    .sort(compareCompanies);
}

export function compareCompanies(a: Company, b: Company): number {
  const sa = STATUS_ORDER.indexOf(a.status);
  const sb = STATUS_ORDER.indexOf(b.status);
  if (sa !== sb) return sa - sb;
  const da = latestEvent(a)?.date ?? "";
  const db = latestEvent(b)?.date ?? "";
  if (da !== db) return db.localeCompare(da);
  return a.name.localeCompare(b.name);
}

export function latestEvent(c: Company): CompanyEvent | undefined {
  return (c.events ?? []).at(-1);
}

export type TimelineEntry = CompanyEvent & { company: Company };

/** Every event in the register, newest first. */
export function timeline(): TimelineEntry[] {
  return companies
    .flatMap((company) =>
      (company.events ?? []).map((e) => ({ ...e, company })),
    )
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        a.company.name.localeCompare(b.company.name),
    );
}

export function registerCounts() {
  const byStatus = {} as Record<CompanyStatus, number>;
  const byKind = {} as Record<CompanyKind, number>;
  for (const c of companies) {
    byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
    byKind[c.kind] = (byKind[c.kind] ?? 0) + 1;
  }
  return {
    companies: companies.length,
    events: companies.reduce((n, c) => n + (c.events?.length ?? 0), 0),
    byStatus,
    byKind,
  };
}

/** The few fields the client-side finder needs. Built on the server. */
export type FinderRow = {
  slug: string;
  name: string;
  kind: CompanyKind;
  status: CompanyStatus;
  jurisdiction: string;
  /** Lower-cased words the query is matched against. */
  keywords: string;
};

export function finderRows(): FinderRow[] {
  return companies.map((c) => ({
    slug: c.slug,
    name: c.name,
    kind: c.kind,
    status: c.status,
    jurisdiction: c.jurisdiction,
    keywords: [
      c.name,
      ...(c.aka ?? []),
      ...(c.domains ?? []),
      ...(c.peptides ?? []),
    ]
      .join(" ")
      .toLowerCase(),
  }));
}

/** Record counts by kind with first and last dates, for the summary strip. */
export function recordSummary(c: Company) {
  const out = new Map<EventKind, { n: number; first: string; last: string }>();
  for (const e of c.events ?? []) {
    const cur = out.get(e.kind);
    if (!cur) out.set(e.kind, { n: 1, first: e.date, last: e.date });
    else {
      cur.n++;
      if (e.date < cur.first) cur.first = e.date;
      if (e.date > cur.last) cur.last = e.date;
    }
  }
  return [...out.entries()].map(([kind, v]) => ({ kind, ...v }));
}

/**
 * Four series for the year chart, in fixed order. Ten event kinds are too
 * many hues; these four are the reader's real questions: did the government
 * act, did product come back, did someone sue, did the company change.
 */
export type RecordGroup = "enforcement" | "recall" | "legal" | "corporate";

export const GROUP_ORDER: RecordGroup[] = [
  "enforcement",
  "recall",
  "legal",
  "corporate",
];

export const GROUP_LABEL: Record<RecordGroup, string> = {
  enforcement: "Enforcement",
  recall: "Recalls",
  legal: "Lawsuits",
  corporate: "Corporate",
};

export const GROUP_OF: Record<EventKind, RecordGroup> = {
  "warning-letter": "enforcement",
  "import-alert": "enforcement",
  criminal: "enforcement",
  recall: "recall",
  lawsuit: "legal",
  approval: "corporate",
  acquisition: "corporate",
  dissolution: "corporate",
  delisting: "corporate",
  filing: "corporate",
};

export type YearRow = { year: string } & Record<RecordGroup, number>;

/** Records per year per group, oldest first, with empty years filled in. */
export function timelineByYear(): YearRow[] {
  const by = new Map<string, YearRow>();
  for (const e of timeline()) {
    const y = e.date.slice(0, 4);
    const row = by.get(y) ?? {
      year: y,
      enforcement: 0,
      recall: 0,
      legal: 0,
      corporate: 0,
    };
    row[GROUP_OF[e.kind]]++;
    by.set(y, row);
  }
  const years = [...by.keys()].map(Number);
  if (years.length === 0) return [];
  const out: YearRow[] = [];
  for (let y = Math.min(...years); y <= Math.max(...years); y++) {
    out.push(
      by.get(String(y)) ?? {
        year: String(y),
        enforcement: 0,
        recall: 0,
        legal: 0,
        corporate: 0,
      },
    );
  }
  return out;
}

/** Catalog peptides that appear on at least one company's record, with counts. */
export function peptideCoverage(): {
  slug: string;
  companies: number;
  byStatus: Partial<Record<CompanyStatus, number>>;
}[] {
  const by = new Map<
    string,
    { companies: number; byStatus: Partial<Record<CompanyStatus, number>> }
  >();
  for (const c of companies) {
    for (const s of c.peptides ?? []) {
      const cur = by.get(s) ?? { companies: 0, byStatus: {} };
      cur.companies++;
      cur.byStatus[c.status] = (cur.byStatus[c.status] ?? 0) + 1;
      by.set(s, cur);
    }
  }
  return [...by.entries()]
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.companies - a.companies || a.slug.localeCompare(b.slug));
}
