import slugify from 'slugify';

import { getUniqueExistingSlug, getUniqueSlug } from './slugBuilder';

const createModel = (results: Array<any>) => ({
  findOne: jest.fn().mockImplementation(() => ({
    lean: jest.fn().mockResolvedValue(results.shift()),
  })),
});

describe('slugBuilder utils', () => {
  it('getUniqueSlug returns base slug when unique', async () => {
    const model = createModel([null]);
    const result = await getUniqueSlug({ title: 'Hello World!' }, model as any);

    expect(result).toBe(slugify('Hello World!', { lower: true, strict: true }));
    expect(model.findOne).toHaveBeenCalledWith({ slug: 'hello-world' });
  });

  it('getUniqueSlug appends counter when duplicate exists', async () => {
    const model = createModel([{ _id: '1' }, null]);
    const result = await getUniqueSlug({ title: 'Hello World!' }, model as any);

    expect(result).toBe('hello-world-1');
    expect(model.findOne).toHaveBeenCalledWith({ slug: 'hello-world' });
    expect(model.findOne).toHaveBeenCalledWith({ slug: 'hello-world-1' });
  });

  it('getUniqueExistingSlug increments numeric suffix', async () => {
    const model = createModel([{ _id: '1' }, { _id: '2' }, null]);
    const result = await getUniqueExistingSlug('hello-world-2', model as any);

    expect(result).toBe('hello-world-4');
    expect(model.findOne).toHaveBeenCalledWith({ slug: 'hello-world-2' });
    expect(model.findOne).toHaveBeenCalledWith({ slug: 'hello-world-3' });
    expect(model.findOne).toHaveBeenCalledWith({ slug: 'hello-world-4' });
  });

  it('getUniqueExistingSlug starts counter when slug already used', async () => {
    const model = createModel([{ _id: '1' }, null]);
    const result = await getUniqueExistingSlug('hello-world', model as any);

    expect(result).toBe('hello-world-1');
    expect(model.findOne).toHaveBeenCalledWith({ slug: 'hello-world' });
    expect(model.findOne).toHaveBeenCalledWith({ slug: 'hello-world-1' });
  });
});
