import { ResumeStore } from './resume-store';

describe('ResumeStore', () => {
  let store: ResumeStore;

  beforeEach(() => {
    store = new ResumeStore();
  });

  it('seeds with blocks and a header', () => {
    expect(store.blocks().length).toBeGreaterThan(0);
    expect(store.header().name).toBeTruthy();
  });

  describe('addBlock', () => {
    it('appends an experience block with a unique id', () => {
      const before = store.blocks().length;
      store.addBlock('experience');
      const blocks = store.blocks();

      expect(blocks.length).toBe(before + 1);
      const added = blocks[blocks.length - 1];
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
});
