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
  let store: ResumeStore;

  beforeEach(async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(CSV));
    store = new ResumeStore();
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
});
