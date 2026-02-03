import { Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('DateTime', () => Date)
export class DateTimeScalar {
  description = 'Fecha y hora en formato ISO8601';

  parseValue(value: string): Date {
    return new Date(value);
  }

  serialize(value: Date): string {
    if (!(value instanceof Date)) {
      throw new Error(`Valor DateTime inválido: ${value}`);
    }
    return value.toISOString();
  }

  parseLiteral(ast: ValueNode): Date | null {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null;
  }
}