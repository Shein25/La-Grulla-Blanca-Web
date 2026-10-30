import { createSourcedDomain } from './sourced-domain.js';

const createMedicalDomain = (rooms, sourceConfiguration) => createSourcedDomain('MEDICAL', rooms, sourceConfiguration);

export { createMedicalDomain };
