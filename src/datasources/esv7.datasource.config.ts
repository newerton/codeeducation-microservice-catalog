import datasource from './esv7.datasource.config.json';

export default {
  ...datasource,
  connector: 'esv6',
  index: 'catalog',
  version: 7,
  debug: process.env.APP_ENV === 'development',
  defaultSize: 50,
  configuration: {
    node: process.env.ELASTIC_SEARCH_HOST,
    requestTimeout: process.env.ELASTIC_SEARCH_REQUEST_TIMEOUT,
    pingTimeout: process.env.ELASTIC_SEARCH_PING_TIMEOUT,
  },
  indexSettings: {
    number_of_shards: 1,
    number_of_replicas: 1,
    max_ngram_diff: 7,
    analysis: {
      analyzer: {
        ngram_token_analyzer: {
          type: 'custom',
          stopwords: '_none_',
          filter: ['lowercase', 'asciifolding', 'no_stop', 'ngram_filter'],
          tokenizer: 'whitespace',
        },
      },
      filter: {
        no_stop: {
          type: 'stop',
          stopwords: '_none_',
        },
        ngram_filter: {
          type: 'nGram',
          min_gram: '2',
          max_gram: '9',
        },
      },
    },
  },
  mappingProperties: {
    docType: {
      type: 'keyword',
    },
    id: {
      type: 'keyword',
    },
    name: {
      type: 'text',
      analyzer: 'ngram_token_analyzer',
      search_analyzer: 'ngram_token_analyzer',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256,
        },
      },
    },
    description: {
      analyzer: 'ngram_token_analyzer',
      search_analyzer: 'ngram_token_analyzer',
      type: 'text',
    },
    type: {
      type: 'byte',
    },
    is_active: {
      type: 'boolean',
    },
    created_at: {
      type: 'date',
    },
    updated_at: {
      type: 'date',
    },
    categories: {
      type: 'nested',
      properties: {
        id: {type: 'keyword'},
        name: {
          type: 'text',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256,
            },
          },
        },
        is_active: {type: 'boolean'},
      },
    },
  },
};
