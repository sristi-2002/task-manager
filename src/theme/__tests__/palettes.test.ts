import {palettes} from '../palettes';

describe('palettes', () => {
  it('defines the same keys in both schemes', () => {
    expect(Object.keys(palettes.light).sort()).toEqual(
      Object.keys(palettes.dark).sort(),
    );
  });

  it('gives light and dark different backgrounds', () => {
    expect(palettes.light.background).not.toBe(palettes.dark.background);
  });

  it('uses hex colours throughout', () => {
    Object.values({...palettes.light, ...palettes.dark}).forEach(value => {
      expect(value).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});
