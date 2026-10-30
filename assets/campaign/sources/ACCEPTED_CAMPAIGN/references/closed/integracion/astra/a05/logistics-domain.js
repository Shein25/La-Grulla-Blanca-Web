import { createSourcedDomain } from './sourced-domain.js';

const createLogisticsDomain = (rooms, sourceConfiguration) => createSourcedDomain('LOGISTICS', rooms, sourceConfiguration);

export { createLogisticsDomain };
