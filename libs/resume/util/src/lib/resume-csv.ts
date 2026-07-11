import { Icon } from '@angular-monorepo/shared/util';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { fromPairs, groupBy } from 'lodash-es';
import Papa from 'papaparse';

import type { ResumeModel } from './resume-model';
import type { ContactDetail, Experience, Links, Position } from './paper-model';

/**
 * Flat CSV representation of a {@link ResumeModel}. Every row is a record whose
 * first column `type` selects the section; the remaining columns `a`–`f` carry
 * that section's fields (blank where unused). List-valued fields (tech stack)
 * are joined with `|`. Nested experience is flattened to
 * one row per contribution, grouped by company then position in document order.
 *
 * Layout per `type`:
 *  - header     a=field("name"|"title")  b=value
 *  - contact    icon  a=text  b=href
 *  - link       icon  a=href
 *  - education  a=school  b=period  c=detail(may contain newlines)
 *  - experience a=company b=position c=period d=techStack(`|`) e=category f=contribution
 *  - panel      a=header("ACHIEVEMENTS"|"CERTIFICATIONS")  b=item
 *  - layout     a=field("asideWidth")  b=value
 */

const HEADERS = ['type', 'icon', 'a', 'b', 'c', 'd', 'e', 'f'] as const;
type CsvRow = Record<(typeof HEADERS)[number], string>;

const LIST_SEP = '|';

/** Reverse lookup from an IconDefinition back to its `Icon` key name. */
const ICON_NAMES = new Map<IconDefinition, string>(
  (Object.entries(Icon) as [string, IconDefinition][]).map(([k, v]) => [v, k]),
);

function iconToName(icon: IconDefinition): string {
  return ICON_NAMES.get(icon) ?? '';
}

function nameToIcon(name: string): IconDefinition {
  const icon = (Icon as Record<string, IconDefinition>)[name];
  return icon ?? Icon.faLink;
}

// --- low-level CSV (Papa Parse for RFC-4180 quoting/parsing) -------------------

// Guard against CSV formula injection: a leading =, +, -, @, tab or CR makes a
// spreadsheet treat the cell as a formula on open. Prefix ' to neutralize.
// Papa Parse does not do this, so we apply it before serializing and strip it
// back off on parse to keep the round-trip value-stable.
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function guardField(value: string): string {
  return FORMULA_PREFIX.test(value) ? `'${value}` : value;
}

function unguardField(value: string): string {
  return value.length > 1 && value[0] === "'" && FORMULA_PREFIX.test(value.slice(1))
    ? value.slice(1)
    : value;
}

function serializeRows(rows: CsvRow[]): string {
  const data = rows.map((row) => HEADERS.map((h) => guardField(row[h] ?? '')));
  return Papa.unparse({ fields: [...HEADERS], data });
}

function toRecords(text: string): CsvRow[] {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return parsed.data.map(
    (cells) => fromPairs(HEADERS.map((h) => [h, unguardField(cells[h] ?? '')])) as CsvRow,
  );
}

const splitList = (value: string): string[] => (value === '' ? [] : value.split(LIST_SEP));

// --- serialize: ResumeModel -> CSV text ---------------------------------------

const row = (type: string, fields: Partial<CsvRow> = {}): CsvRow => ({
  type,
  icon: '',
  a: '',
  b: '',
  c: '',
  d: '',
  e: '',
  f: '',
  ...fields,
});

export function serializeResumeCsv(model: ResumeModel): string {
  const rows: CsvRow[] = [
    row('header', { a: 'name', b: model.header.name }),
    row('header', { a: 'title', b: model.header.title }),
    ...model.contactDetails.map((c) =>
      row('contact', { icon: iconToName(c.icon), a: c.text, b: c.href ?? '' }),
    ),
    ...model.links.map((l) => row('link', { icon: iconToName(l.icon), a: l.href })),
    ...model.education.map((e) => row('education', { a: e.school, b: e.period, c: e.detail })),
    ...model.experience.flatMap((exp) =>
      exp.positions.flatMap((pos) => {
        const base = {
          a: exp.companyName,
          b: pos.position,
          c: pos.period,
          d: pos.techStack.join(LIST_SEP),
        };
        // One row per contribution; emit a bare position row if it has none.
        return pos.contributions.length === 0
          ? [row('experience', base)]
          : pos.contributions.map((contrib) =>
              row('experience', { ...base, e: contrib.category, f: contrib.contribution }),
            );
      }),
    ),
    ...model.achievements.map((item) => row('panel', { a: 'ACHIEVEMENTS', b: item })),
    ...model.certifications.map((item) => row('panel', { a: 'CERTIFICATIONS', b: item })),
    ...(model.asideWidth !== undefined
      ? [row('layout', { a: 'asideWidth', b: String(model.asideWidth) })]
      : []),
  ];

  return serializeRows(rows);
}

// --- parse: CSV text -> ResumeModel -------------------------------------------

/** Rebuild nested experience from flat rows, preserving document order. */
function parseExperience(rows: CsvRow[]): Experience[] {
  const byCompany = groupBy(rows, (r) => r.a);
  return Object.keys(byCompany).map((companyName) => {
    const byPosition = groupBy(byCompany[companyName], (r) => r.b);
    const positions: Position[] = Object.keys(byPosition).map((positionName) => {
      const posRows = byPosition[positionName];
      const [{ c: period, d: techStack }] = posRows;
      return {
        position: positionName,
        period,
        techStack: splitList(techStack),
        contributions: posRows
          .filter((r) => r.e || r.f)
          .map((r) => ({ category: r.e, contribution: r.f })),
      };
    });
    return { companyName, positions };
  });
}

export function parseResumeCsv(text: string): ResumeModel {
  const records = toRecords(text);
  const byType = groupBy(records, (r) => r.type);
  const rowsOf = (type: string): CsvRow[] => byType[type] ?? [];

  const headers = fromPairs(rowsOf('header').map((r) => [r.a, r.b]));
  const panels = groupBy(rowsOf('panel'), (r) => r.a);
  const asideWidth = Number(rowsOf('layout').find((r) => r.a === 'asideWidth')?.b);

  const model: ResumeModel = {
    header: { name: headers['name'] ?? '', title: headers['title'] ?? '' },
    contactDetails: rowsOf('contact').map((r) => {
      const contact: ContactDetail = { icon: nameToIcon(r.icon), text: r.a };
      if (r.b) contact.href = r.b;
      return contact;
    }),
    links: rowsOf('link').map((r): Links => ({ icon: nameToIcon(r.icon), href: r.a })),
    education: rowsOf('education').map((r) => ({ school: r.a, period: r.b, detail: r.c })),
    experience: parseExperience(rowsOf('experience')),
    achievements: (panels['ACHIEVEMENTS'] ?? []).map((r) => r.b),
    certifications: (panels['CERTIFICATIONS'] ?? []).map((r) => r.b),
  };

  if (!Number.isNaN(asideWidth)) model.asideWidth = asideWidth;

  return model;
}
