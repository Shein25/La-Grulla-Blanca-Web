import { createSourcedDomain } from './sourced-domain.js';

const createArchiveDomain = (rooms, sourceConfiguration) => createSourcedDomain('ARCHIVE', rooms, sourceConfiguration);

export { createArchiveDomain };
