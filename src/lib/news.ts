import type { ChangeLogEntry, Source } from "./peptides";

/**
 * The news desk.
 *
 * Neutrality here is structural, not tonal. Every story is forced into the
 * same three blocks — what the record establishes, what it does not, and what
 * would change the answer — and every source is graded by whether it is the
 * record itself or someone's report of it. We publish the question, not the
 * verdict.
 */

export type NewsCategory =
  | "enforcement"
  | "regulation"
  | "litigation"
  | "clinical"
  | "industry"
  | "science";

export const CATEGORY_LABEL: Record<NewsCategory, string> = {
  enforcement: "Enforcement",
  regulation: "Regulation",
  litigation: "Litigation",
  clinical: "Clinical research",
  industry: "Industry",
  science: "Science",
};

/**
 * primary   — the record itself: court filing, agency letter, trial registry,
 *             the company's own release.
 * secondary — a report about the record. Useful; never load-bearing alone.
 */
export type SourceGrade = "primary" | "secondary";

export type NewsSource = Source & {
  grade: SourceGrade;
  /** What this source is, in a few words (e.g. "DOJ press release"). */
  kind: string;
};

export type NewsStatus = "developing" | "updated" | "settled";

export const STATUS_LABEL: Record<NewsStatus, string> = {
  developing: "Developing",
  updated: "Updated",
  settled: "Settled record",
};

export type NewsStory = {
  slug: string;
  title: string;
  /** One-sentence dek. States the fact, not the take. */
  dek: string;
  category: NewsCategory;
  /** ISO date first published on peptides.info. */
  published: string;
  /** ISO date of last substantive revision. */
  updated?: string;
  status: NewsStatus;
  /** What the cited record establishes. Each line should trace to a source. */
  documented: string[];
  /** What the record does not establish — the claims circulating that it can't carry. */
  notEstablished: string[];
  /** The specific evidence that would move this story. */
  wouldChange: string;
  /** One neutral question both camps have to answer. The share hook. */
  openQuestion: string;
  /** Monograph slugs this story touches. */
  compounds: string[];
  sources: NewsSource[];
  changelog?: ChangeLogEntry[];
};

export const news: NewsStory[] = [
  {
    slug: "fda-import-alert-66-80-september-2026",
    title: "FDA widens GLP-1 import alert; adds orforglipron to the Green List",
    dek: "The September 21 revision of Import Alert 66-80 broadens detention-without-examination to more peptide product codes and names which foreign API makers have cleared FDA's bar.",
    category: "regulation",
    published: "2026-10-03",
    status: "developing",
    documented: [
      "Import Alert 66-80 (\"Detention Without Physical Examination of GLP-1 Receptor Agonist Bulk Drug Substances\") was republished September 21, 2026.",
      "FDA says that of 48 GLP-1 API sites it evaluated, 21% were noncompliant with manufacturing standards, and describes a pattern of firms registering as GLP-1 API makers, refusing records requests, then deregistering.",
      "The Green List names firms and drugs excluded from detention. Orforglipron API was added for three manufacturers in China and one in Ireland; an orforglipron drug-product intermediate was added for one Portugal-based manufacturer.",
      "Covered product codes include semaglutide, tirzepatide, liraglutide, exenatide, and dulaglutide, plus additional hormone and peptide codes.",
    ],
    notEstablished: [
      "The alert concerns bulk API entering the U.S. supply chain for compounding and manufacturing. It does not, by itself, say anything about the quality of any finished product sold to consumers.",
      "Being absent from the Green List is not a finding of noncompliance. It means FDA has not evaluated the firm against the criteria, or the firm has not applied.",
      "The alert is not a ban on GLP-1 imports. Listed firms continue to ship.",
    ],
    wouldChange:
      "A published list of the 21% noncompliant sites, or an FDA statement connecting a specific detained shipment to a named downstream seller, would turn this from supply-chain policy into a consumer-facing story.",
    openQuestion:
      "If one in five inspected GLP-1 API sites fails FDA's standard, what does that imply about the API behind products that never pass through an inspected site at all?",
    compounds: ["semaglutide", "tirzepatide"],
    sources: [
      {
        grade: "primary",
        kind: "FDA import alert",
        label: "Import Alert 66-80 (FDA, published 2026-09-21)",
        href: "https://www.accessdata.fda.gov/cms_ia/importalert_1186.html",
      },
    ],
  },
  {
    slug: "fda-warning-letters-five-peptide-sellers-august-2026",
    title: "FDA sends warning letters to five online peptide sellers in one day",
    dek: "Letters dated August 24, 2026 name NuScience Peptides, Royal Peptides, Peptide Partners, Peak Performance Peptides, and TXP Innovations. FDA says 'research use only' labels did not change its reading of intended use.",
    category: "enforcement",
    published: "2026-10-03",
    status: "settled",
    documented: [
      "All five letters are dated August 24, 2026 and allege the firms marketed unapproved new drugs and misbranded drugs under the Federal Food, Drug, and Cosmetic Act.",
      "The Royal Peptides letter names tirzepatide, semaglutide, retatrutide, SS-31 (elamipretide), PT-141, tesamorelin, and BIMORELIN.",
      "FDA's stated reasoning: despite 'for research use only' and 'not for human or animal consumption' labeling, website evidence established the products were intended as drugs for human use. It cites the sale of bacteriostatic water alongside a 'peptide guide' and 'peptide calculator.'",
      "Each firm was given 15 business days to respond with corrective steps.",
    ],
    notEstablished: [
      "A warning letter is not a court finding, a seizure, or a shutdown order. It is FDA's allegation and a demand for a response.",
      "The letters do not test or characterize the products. They say nothing about purity, identity, or contamination.",
      "Five letters on one day is a visible signal, but the letters themselves do not announce a policy change or a broader sweep.",
    ],
    wouldChange:
      "The firms' responses, a follow-up FDA action (seizure, injunction, consent decree), or a court ruling on whether the 'intended use' reading holds would each move this story.",
    openQuestion:
      "FDA's position is that a 'research use only' label is irrelevant if the surrounding context implies human use. If that reading stands, is there any way to sell a research peptide online that FDA would accept?",
    compounds: ["tirzepatide", "semaglutide", "retatrutide", "tesamorelin", "bremelanotide"],
    sources: [
      {
        grade: "primary",
        kind: "FDA warning letter",
        label: "Royal Peptides LLC — Warning Letter 734884 (FDA, 2026-08-24)",
        href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/royal-peptides-llc-734884-08242026",
      },
      {
        grade: "primary",
        kind: "FDA warning letter",
        label: "NuScience Peptides LLC — Warning Letter 733652 (FDA, 2026-08-24)",
        href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/nuscience-peptides-llc-733652-08242026",
      },
      {
        grade: "secondary",
        kind: "Law-firm analysis",
        label: "McDermott Will & Emery — Federal regulators and state boards crack down on RUO peptides",
        href: "https://www.mcdermottlaw.com/insights/federal-regulators-and-state-boards-crack-down-on-ruo-peptides/",
      },
    ],
  },
  {
    slug: "lilly-sues-six-retatrutide-sellers-august-2026",
    title: "Lilly files six lawsuits over retatrutide sold before approval",
    dek: "On August 12, 2026 Eli Lilly sued a med spa, a compounding pharmacy, and four online peptide sellers in California and Texas federal courts, and said it has referred more than 200 parties to regulators.",
    category: "litigation",
    published: "2026-10-03",
    status: "developing",
    documented: [
      "Lilly's release names six defendants: Aesthetic Envy Cosmetic Centers (N.D. Cal.), Astra LLC d/b/a Astra Peptides (W.D. Tex.), Legendary Peptides (E.D. Tex.), Striker Pharmacy (S.D. Tex.), Texas Peptides (W.D. Tex.), and Lone Star Peptide Co. (S.D. Tex.).",
      "Lilly states retatrutide is investigational, in Phase 3, and not approved for human use by any regulator anywhere.",
      "Lilly says it has referred more than 200 individuals and entities to FDA, DOJ, state attorneys general, law enforcement, and licensing boards, and reported more than 14,000 listings in over 100 countries to platforms and carriers.",
      "The release calls on payment processors, platforms, and shipping carriers to cut off sellers.",
    ],
    notEstablished: [
      "These are civil complaints filed by a company. No court has ruled. The release does not state the legal claims asserted (trademark, false advertising, or otherwise); the dockets do.",
      "Lilly's release does not allege that any defendant's product was tested and found to be something other than retatrutide. It argues the sale itself is unlawful.",
      "Nothing here addresses whether the product being sold is chemically the same as what is in Lilly's trials. That question is simply unanswered in the public record.",
    ],
    wouldChange:
      "A ruling on a motion to dismiss, a settlement, a default judgment, or any docket document characterizing the products' contents.",
    openQuestion:
      "A drugmaker is suing to stop sales of a molecule it has not yet proven safe enough to sell itself. Who is that protecting, and does the answer change if the grey-market product turns out to be real retatrutide?",
    compounds: ["retatrutide"],
    sources: [
      {
        grade: "primary",
        kind: "Company press release",
        label: "Lilly calls on online platforms, payment companies and regulators to shut down the illegal retatrutide black market (Lilly IR, 2026-08-12)",
        href: "https://investor.lilly.com/news-releases/news-release-details/lilly-calls-online-platforms-payment-companies-and-regulators",
      },
      {
        grade: "secondary",
        kind: "News report",
        label: "CNBC — Lilly sues six companies over alleged illegal sales of experimental obesity drug retatrutide",
        href: "https://www.cnbc.com/2026/08/12/lilly-lawsuits-obesity-drug-retatrutide.html",
      },
    ],
  },
  {
    slug: "paradigm-peptides-owner-sentenced-70-months",
    title: "Paradigm Peptides owner sentenced to 70 months in federal prison",
    dek: "Matthew J. Kawa pleaded guilty to introducing unapproved new drugs into interstate commerce with intent to defraud. DOJ says the company sold to 54,000 customers and that some products labeled as SARMs were testosterone.",
    category: "enforcement",
    published: "2026-10-03",
    status: "settled",
    documented: [
      "Sentencing was announced by the U.S. Attorney's Office, Northern District of Indiana, on July 30, 2026. Kawa received 70 months' prison and one year supervised release; his sister Jennifer L. Stechkober received 16 months and one year.",
      "Kawa pleaded guilty to introducing unapproved new drugs into interstate commerce with intent to defraud and mislead, and to illegally importing merchandise. Both defendants were ordered to pay $78,317.52 in restitution; a $5 million money judgment was entered against Kawa.",
      "DOJ states the business claimed FDA registration, U.S. manufacturing, and in-house testing, while in fact importing from China and India and not testing. Lab analysis found many products sold as SARMs were testosterone.",
      "DOJ states Kawa received FDA warning letters in 2020 and 2022 and continued selling; from 2019 to 2024 the business sold to more than 54,000 customers in 50 states and over 80 countries.",
    ],
    notEstablished: [
      "The charges and the reported harms center on mislabeled SARMs and false claims about origin and testing. The press release does not identify any peptide product as adulterated or mislabeled.",
      "This is one vendor. The record does not characterize the rest of the market, in either direction.",
      "DOJ's statement that customers were 'poisoned' is the U.S. Attorney's characterization of the harm reports, not a toxicology finding stated in the release.",
    ],
    wouldChange:
      "The sentencing memorandum or plea agreement, which would list the specific products and lab results, or an appeal.",
    openQuestion:
      "The decisive evidence in this case was that products were not what the label said. Every argument about peptides, for or against, assumes the vial contains the peptide. How often is that assumption actually checked, and by whom?",
    compounds: [],
    sources: [
      {
        grade: "primary",
        kind: "DOJ press release",
        label: "U.S. Attorney's Office, N.D. Ind. — Illinois Man and Indiana Woman Sentenced Respectively to 70 Months and 16 Months in Prison (2026-07-30)",
        href: "https://www.justice.gov/usao-ndin/pr/illinois-man-and-indiana-woman-sentenced-respectively-70-months-and-16-months-prison",
      },
      {
        grade: "secondary",
        kind: "News report",
        label: "CBS News — Judge sentences peptide vendor to nearly 6 years in prison",
        href: "https://www.cbsnews.com/news/peptides-seller-prison-sentence-unapproved-drugs/",
      },
    ],
  },
  {
    slug: "fda-advisory-committee-votes-six-peptides-compounding-july-2026",
    title: "FDA advisory panel recommends six peptides for the compounding list, over staff objections",
    dek: "At its July 23–24, 2026 meeting the Pharmacy Compounding Advisory Committee voted to recommend BPC-157, KPV, TB-500, MOTS-c, Semax, and Epitalon for the 503A Bulks List and against emideltide (DSIP). The vote changes nothing yet.",
    category: "regulation",
    published: "2026-10-03",
    status: "developing",
    documented: [
      "FDA's meeting page confirms the committee met July 23–24, 2026 to evaluate nominated bulk substances for the 503A Bulks List, and lists the seven substances and their proposed uses (e.g. BPC-157 for ulcerative colitis, KPV and TB-500 for wound healing, MOTS-c for obesity and osteoporosis, Epitalon for insomnia, Semax for cerebral ischemia, migraine, and trigeminal neuralgia).",
      "Reported tallies (secondary): BPC-157, KPV, and TB-500 each 8–6 with one abstention in favor; MOTS-c 7–5 with two abstentions in favor; Semax and Epitalon in favor by similar margins; emideltide rejected 7–6 with one abstention.",
      "Reported (secondary): FDA's own reviewers had recommended against including all seven.",
      "A favorable committee vote is advisory. Adding a substance to the 503A list requires FDA to accept the recommendation and complete notice-and-comment rulemaking. As of this writing none of the seven is on the list.",
    ],
    notEstablished: [
      "The vote is not an approval of any peptide for any use, and does not make compounding them legal today.",
      "A recommendation for the bulks list is a judgment about whether pharmacists may compound a substance for individual prescriptions. It is not a finding that the substance works for the nominated use.",
      "The official vote record is not on FDA's meeting page as of our review. The tallies above come from reporting, and we grade them accordingly.",
    ],
    wouldChange:
      "FDA posting the official meeting minutes or vote summary, a proposed rule adding any of the six, or a public FDA statement declining to follow the committee.",
    openQuestion:
      "An advisory panel voted narrowly to let pharmacists compound peptides that FDA's own scientists said lacked human efficacy data. Is this access winning over evidence, or evidence standards failing to keep up with what people are already using? Both camps claim this vote.",
    compounds: ["bpc-157", "kpv", "tb-500", "mots-c", "semax", "epithalon"],
    sources: [
      {
        grade: "primary",
        kind: "FDA meeting notice",
        label: "July 23–24, 2026: Meeting of the Pharmacy Compounding Advisory Committee (FDA)",
        href: "https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026",
      },
      {
        grade: "secondary",
        kind: "Trade-press report",
        label: "AJMC — FDA Panel Backs 6 Peptides for Compounding (2026-07-31)",
        href: "https://www.ajmc.com/view/fda-panel-backs-6-peptides-for-compounding",
      },
      {
        grade: "secondary",
        kind: "Trade-association report",
        label: "NCPA — FDA advisory committee nominates six peptides for pharmacies to compound (2026-07-31)",
        href: "https://ncpa.org/newsroom/qam/2026/07/31/fda-advisory-committee-nominates-six-peptides-pharmacies-compound",
      },
    ],
  },
  {
    slug: "retatrutide-triumph-1-phase-3-topline",
    title: "Retatrutide Phase 3: 28.3% mean weight loss at 80 weeks, 11.3% quit the top dose",
    dek: "Lilly's May 21, 2026 topline release for TRIUMPH-1 reports all three doses met primary and key secondary endpoints. The same release reports discontinuation for adverse events rising with dose.",
    category: "clinical",
    published: "2026-10-03",
    status: "developing",
    documented: [
      "TRIUMPH-1 (NCT05929066) is an 80-week, randomized, double-blind, placebo-controlled Phase 3 trial in adults with obesity or overweight plus at least one weight-related comorbidity, without diabetes.",
      "Efficacy-estimand mean weight change at 80 weeks: −19.0% (4 mg), −25.9% (9 mg), −28.3% (12 mg), −2.2% (placebo). The treatment-regimen estimand, which counts people who stopped, reads −17.6%, −23.7%, −25.0%, and −3.9%.",
      "45.3% of the 12 mg group lost at least 30% of body weight, versus 0.5% on placebo. In a pre-specified extension of 532 participants with BMI ≥35, the 12 mg-to-maximum-tolerated-dose arm reached −30.3% at 104 weeks.",
      "Most common adverse events at 12 mg vs placebo: nausea 42.4% vs 14.8%, diarrhea 32.0% vs 13.5%, vomiting 25.3% vs 4.8%. Dysesthesia 12.5% vs 0.9%. Discontinuation due to adverse events: 4.1%, 6.9%, 11.3% across doses vs 4.9% on placebo.",
      "Results are topline, from a company release. Lilly says full results will be presented at medical meetings and published in peer-reviewed journals.",
    ],
    notEstablished: [
      "Topline means the sponsor's summary. The trial has not been peer-reviewed, and the full adverse-event tables, dropout patterns, and subgroup results are not public.",
      "Weight loss at 80 weeks says nothing yet about what happens after stopping, cardiovascular outcomes, or safety over years. Those are separate trials (TRIUMPH-2, -3, and an outcomes study).",
      "Retatrutide is not approved anywhere. Anything sold under that name today is outside this trial and outside this evidence.",
    ],
    wouldChange:
      "Peer-reviewed publication of TRIUMPH-1, topline results from TRIUMPH-2 and -3, or a regulatory submission.",
    openQuestion:
      "The 12 mg arm produced surgery-level weight loss and more than one in ten participants stopped because of side effects. Is the right dose the one that works best or the one most people can stay on? The 4 mg arm, with a lower dropout rate than placebo, is the quiet half of this release.",
    compounds: ["retatrutide"],
    sources: [
      {
        grade: "primary",
        kind: "Company press release",
        label: "Lilly's triple agonist, retatrutide, delivered powerful weight loss in pivotal Phase 3 obesity trial (Lilly IR, 2026-05-21)",
        href: "https://investor.lilly.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-delivered-powerful-weight-loss",
      },
      {
        grade: "primary",
        kind: "Trial registry",
        label: "NCT05929066 — TRIUMPH-1 (ClinicalTrials.gov)",
        href: "https://clinicaltrials.gov/study/NCT05929066",
      },
    ],
  },
  {
    slug: "doj-charges-two-counterfeit-ozempic-scheme-september-2026",
    title: "DOJ indicts two Indian nationals over counterfeit Ozempic sold to U.S. distributors",
    dek: "An indictment announced September 29, 2026 in the Middle District of Florida alleges the pair bought fake Ozempic from unapproved Chinese suppliers between July 2023 and April 2024. An indictment is an allegation; no verdict has been reached.",
    category: "enforcement",
    published: "2026-10-05",
    status: "developing",
    documented: [
      "DOJ announced charges September 29, 2026 against Swapnadip Roy, 33, and Vicky Ramancha, 37, both Indian nationals: one count of conspiracy to commit smuggling and to defraud the United States, three counts of smuggling, and two counts of selling counterfeit drugs and holding counterfeit drugs for sale.",
      "The indictment alleges they obtained counterfeit Ozempic from unauthorized sources in China between July 2023 and April 2024, with fake boxes, inserts, pen labels, and needles, and sold it at reduced prices to distributors in the United States.",
      "DOJ and FDA both state the alleged conduct continued after FDA's December 2023 seizure of counterfeit Ozempic and public warning.",
      "DOJ states the maximum penalty is 71 years in prison per defendant, and that an indictment is only an allegation and the defendants are presumed innocent.",
    ],
    notEstablished: [
      "No court has found anything. The release does not report a trial, plea, or verdict.",
      "The releases do not say what the counterfeit pens contained, or that anyone was injured by them. The officials' statements about threats to health are the officials' characterizations, not a stated test result.",
      "The case concerns counterfeit versions of a branded, approved product. It does not address research-use peptides or compounded semaglutide, and should not be read as evidence about either, in either direction.",
      "Neither release states how much counterfeit product reached patients or how many distributors were involved.",
    ],
    wouldChange:
      "The indictment itself or later filings (lab analysis of seized pens, a plea agreement, a superseding indictment naming co-conspirators), or a verdict.",
    openQuestion:
      "The alleged fakes copied the packaging of an approved drug. When a counterfeit and a grey-market copy both depend on trusting an unverified label, where does one category end and the other begin?",
    compounds: ["semaglutide"],
    sources: [
      {
        grade: "primary",
        kind: "DOJ press release",
        label: "Two Indian Nationals Charged in Connection with Transnational Counterfeit Ozempic Scheme (DOJ Office of Public Affairs, 2026-09-29)",
        href: "https://www.justice.gov/opa/pr/two-indian-nationals-charged-connection-transnational-counterfeit-ozempic-scheme",
      },
      {
        grade: "primary",
        kind: "FDA press announcement",
        label: "FDA Investigation Leads to Charges Against Two Indian Nationals Involved in Transnational Counterfeit Drug Distribution Scheme (FDA, 2026-09-29)",
        href: "https://www.fda.gov/news-events/press-announcements/fda-investigation-leads-charges-against-two-indian-nationals-involved-transnational-counterfeit-drug",
      },
      {
        grade: "secondary",
        kind: "News report",
        label: "CNBC — Two Indian nationals charged with smuggling counterfeit Ozempic from China (2026-09-29)",
        href: "https://www.cnbc.com/2026/09/29/ozempiz-counterfeit-china-smuggling-doj.html",
      },
    ],
  },
  {
    slug: "novo-wegovy-liver-fat-step-up-easd-october-2026",
    title: "Novo: 23 of 26 semaglutide 7.2 mg participants with excess liver fat reached normal levels – in a post hoc analysis of 55 people",
    dek: "Novo Nordisk's October 1, 2026 release, tied to a presentation at EASD 2026, reports a liver-fat sub-analysis of the STEP UP trials. The company itself labels it post hoc and exploratory.",
    category: "clinical",
    published: "2026-10-05",
    status: "developing",
    documented: [
      "STEP UP and STEP UP T2D were Phase 3b randomized, double-blind, placebo-controlled trials; the pooled analysis covers 1,919 adults (semaglutide 7.2 mg n=1,312, 2.4 mg n=304, placebo n=303).",
      "The liver-fat sub-analysis included 55 participants with excess liver fat. Of 26 with baseline liver fat above 5%, 23 (88.5%) were below 5% at week 72; mean liver fat fell from 8.8% to 3.1%.",
      "Novo states the analysis was post hoc and exploratory and not a pre-specified primary or secondary endpoint of the parent trials. It was presented at EASD 2026 in Milan on October 1, 2026.",
      "The release gives no adverse-event data and does not report which dose arm the 26 participants were in.",
    ],
    notEstablished: [
      "A company release is the sponsor's summary. The analysis is not peer-reviewed and the underlying data are not public.",
      "Twenty-six participants cannot establish how often semaglutide normalizes liver fat. The headline '9 out of 10' rests on that small base.",
      "Liver fat on imaging is not liver outcomes. The release does not report fibrosis change, liver events, or longer-term follow-up, and fewer than 1% of participants met advanced-fibrosis criteria.",
      "Nothing here applies to compounded or research-use semaglutide, whose contents and dose are outside the trial.",
    ],
    wouldChange:
      "A peer-reviewed publication or poster with dose-arm breakdown and confidence intervals, or a pre-specified liver endpoint from a dedicated trial.",
    openQuestion:
      "If a small post hoc subgroup is the only place a liver signal appears, is it a hypothesis worth chasing or a result that was found because someone went looking?",
    compounds: ["semaglutide"],
    sources: [
      {
        grade: "primary",
        kind: "Company press release",
        label: "Novo's Wegovy (semaglutide) reduced liver fat to normal levels in 9 out of 10 adults with obesity and excess liver fat – EASD2026 (Novo Nordisk, 2026-10-01)",
        href: "https://www.novonordisk.com/news-and-media/news-and-ir-materials/news-details.html?id=917205",
      },
    ],
  },
];

export function getStory(slug: string): NewsStory | undefined {
  return news.find((n) => n.slug === slug);
}

/** Newest first, by last substantive date. */
export function sortedNews(): NewsStory[] {
  return [...news].sort((a, b) =>
    (b.updated ?? b.published).localeCompare(a.updated ?? a.published),
  );
}

export function newsForCompound(slug: string): NewsStory[] {
  return sortedNews().filter((n) => n.compounds.includes(slug));
}

export function primaryCount(n: NewsStory): number {
  return n.sources.filter((s) => s.grade === "primary").length;
}
