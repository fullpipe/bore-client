import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:8080/query',
  documents: 'src/**/*.graphql',
  generates: {
    'src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        { 'typescript-apollo-angular': { addExplicitOverride: true } },
      ],
    },
  },
  config: {
    scalars: {
      Uint: 'number',
      ID: 'number',
      Time: 'Date',
    },
  },
};

export default config;
