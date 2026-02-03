import { Kind, ValueNode, GraphQLScalarType } from 'graphql';
import { Types } from 'mongoose';

export const ObjectIdScalar = new GraphQLScalarType({
  name: 'ObjectId',
  description: 'Mongo ObjectId scalar type',
  serialize(value: Types.ObjectId) {
    return value?.toString();
  },
  parseValue(value: string | null | undefined) {
    // Allow null/undefined for nullable fields
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (!Types.ObjectId.isValid(value)) {
      throw new Error('Invalid ObjectId');
    }
    return new Types.ObjectId(value);
  },
  parseLiteral(ast: ValueNode) {
    // Allow null literals for nullable fields
    if (ast.kind === Kind.NULL) {
      return null;
    }
    if (ast.kind !== Kind.STRING) {
      throw new Error('Invalid ObjectId literal');
    }
    // Allow empty strings for nullable fields
    if (ast.value === '') {
      return null;
    }
    if (!Types.ObjectId.isValid(ast.value)) {
      throw new Error('Invalid ObjectId literal');
    }
    return new Types.ObjectId(ast.value);
  },
});
