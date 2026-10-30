import { createSourcedDomain } from './sourced-domain.js';

const createFormationsDomain = (rooms, sourceConfiguration) => createSourcedDomain('FORMATIONS', rooms, sourceConfiguration);

export { createFormationsDomain };
