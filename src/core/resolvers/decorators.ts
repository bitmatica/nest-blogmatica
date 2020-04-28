import { Args, ID } from '@nestjs/graphql';

export const IdInput = Args('id', { type: () => ID })
