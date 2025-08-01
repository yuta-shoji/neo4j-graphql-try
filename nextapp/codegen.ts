import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:3000/api/graphql',
  documents: 'lib/graphql/queries/**/*.ts',
  generates: {
    'lib/graphql/generated/': {
      preset: 'client',
      plugins: [],
      config: {
        documentMode: 'string'
      }
    },
    'lib/graphql/generated/introspection.json': {
      plugins: ['introspection']
    }
  }
}

export default config 