import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ResumeStore } from './resume-store';

const CSV = `type,icon,a,b,c,d,e,f
header,,name,Leith Osborne,,,,
header,,title,Engineer,,,,
label,,experience,EXPERIENCE,,,,
label,,links,LINKS,,,,
label,,education,EDUCATION,,,,
contact,faPhone,+44,,,,,
link,faGithub,https://github.com/x,,,,,
education,,Durham,2017 - 2020,BSc,,,
experience,,OpenGamma Limited,Software Developer,JAN 2025 - PRESENT,Angular,Full UI,Owned it.
panel,,ACHIEVEMENTS,An award,,,,
`;

describe('ResumeStore', () => {
  let store: InstanceType<typeof ResumeStore>;

  beforeEach(async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(CSV));
    TestBed.configureTestingModule({ providers: [ResumeStore] });
    store = TestBed.inject(ResumeStore);
    await store.load();
  });

  it('hydrates blocks and header from CSV', () => {
    expect(store.blocks().length).toBeGreaterThan(0);
    expect(store.header().name).toBe('Leith Osborne');
  });

  it('hydrates aside sections from CSV', () => {
    expect(store.links().length).toBe(1);
    expect(store.education()[0].school).toBe('Durham');
    expect(store.rightPanel()[0].items).toEqual(['An award']);
  });

  describe('addBlock', () => {
    it('prepends an experience block with a unique id', () => {
      const before = store.blocks().length;
      store.addBlock('experience');
      const blocks = store.blocks();

      expect(blocks.length).toBe(before + 1);
      const added = blocks[0];
      expect(added.kind).toBe('experience');
      expect(added.id).toBeTruthy();
      expect(blocks.filter((b) => b.id === added.id).length).toBe(1);
    });

    it('does not touch the header', () => {
      const header = store.header();
      store.addBlock('experience');
      expect(store.header()).toBe(header);
    });
  });

  describe('removeBlock', () => {
    it('drops the block with the given id', () => {
      const id = store.blocks()[0].id;
      store.removeBlock(id);
      expect(store.blocks().some((b) => b.id === id)).toBe(false);
    });

    it('ignores an unknown id', () => {
      const before = store.blocks().length;
      store.removeBlock('does-not-exist');
      expect(store.blocks().length).toBe(before);
    });
  });

  describe('toCsv', () => {
    it('round-trips current state back to a parseable CSV', () => {
      const csv = store.toCsv();
      expect(csv).toContain('Leith Osborne');
      expect(csv).toContain('OpenGamma Limited');
    });
  });

  describe('contributions', () => {
    it('adds a contribution to a position immutably', () => {
      const id = store.blocks()[0].id;
      const before = store.blocks()[0];
      const count = before.data.positions[0].contributions.length;

      store.addContribution(id, 0);

      const after = store.blocks()[0];
      expect(after.data.positions[0].contributions.length).toBe(count + 1);
      // Previous snapshot untouched (new object references throughout the path).
      expect(after).not.toBe(before);
      expect(after.data.positions[0].contributions.length).not.toBe(before.data.positions[0].contributions.length);
    });

    it('removes a contribution by index', () => {
      const id = store.blocks()[0].id;
      store.addContribution(id, 0);
      const count = store.blocks()[0].data.positions[0].contributions.length;

      store.removeContribution(id, 0, 0);

      expect(store.blocks()[0].data.positions[0].contributions.length).toBe(count - 1);
    });

    it('reorders contributions without mutating the prior snapshot', () => {
      const id = store.blocks()[0].id;
      store.addContribution(id, 0); // ensure at least two rows
      const before = store.blocks()[0].data.positions[0].contributions;
      const firstCategory = before[0].category;

      store.moveContribution(id, 0, 0, 1);

      const after = store.blocks()[0].data.positions[0].contributions;
      expect(after).not.toBe(before);
      expect(after[1].category).toBe(firstCategory);
      // Original array order is preserved (immutability).
      expect(before[0].category).toBe(firstCategory);
    });

    it('edits contribution text and round-trips it to CSV', () => {
      const id = store.blocks()[0].id;

      store.updateContributionText(id, 0, 0, 'Rebuilt the platform');

      expect(store.blocks()[0].data.positions[0].contributions[0].contribution).toBe('Rebuilt the platform');
      expect(store.toCsv()).toContain('Rebuilt the platform');
    });
  });

  describe('setTechStack', () => {
    it('splits an edited line back into the tech stack array', () => {
      const id = store.blocks()[0].id;
      store.setTechStack(id, 0, 'Angular | TypeScript | RxJS');
      expect(store.blocks()[0].data.positions[0].techStack).toEqual(['Angular', 'TypeScript', 'RxJS']);
    });
  });

  describe('editMode', () => {
    it('sets edit mode explicitly', () => {
      store.setEditMode(true);
      expect(store.editMode()).toBe(true);
      store.setEditMode(false);
      expect(store.editMode()).toBe(false);
    });
  });
});
