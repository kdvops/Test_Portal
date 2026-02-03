import { Model, FilterQuery } from 'mongoose';
import slugify from 'slugify';

type ItemType = {
  title?: string;
  name?: string;
};

export const getUniqueSlug = async <T>(
  item: ItemType,
  model: Model<T>,
): Promise<string> => {
  const base = item.title !== undefined ? item.title : item.name;
  const baseSlug = slugify(base, {
    lower: true,
    strict: true,
  });

  let candidate: string = baseSlug;
  let counter = 0;
  while (true) {
    const existing = await model
      .findOne({
        slug: candidate
      } as FilterQuery<T>)
      .lean();

    if (!existing) break;
    candidate = `${baseSlug}-${++counter}`;
  }
  return candidate;
};

function isStrictNumber(str) {
  return str.trim() === str && str !== '' && !isNaN(str) && !isNaN(Number(str));
}


export const getUniqueExistingSlug = async <T>(
  defaultSlug: string,
  model: Model<T>  
): Promise<string> => {  
  const separatorIndex = defaultSlug.lastIndexOf("-");
  const lastPart = defaultSlug.slice(separatorIndex + 1)

  const base = separatorIndex > 0 && isStrictNumber(lastPart)? defaultSlug.slice(0, separatorIndex):defaultSlug;  
  let counter = isStrictNumber(lastPart)? Number(lastPart):0
  
  const baseSlug = slugify(base, {
    lower: true,
    strict: true,
  });

  let candidate: string = defaultSlug;  
  while (true) {
    const existing = await model
      .findOne({
        slug: candidate
      } as FilterQuery<T>)
      .lean();

    if (!existing) break;
    candidate = `${baseSlug}-${++counter}`;
  }
  return candidate;
};
