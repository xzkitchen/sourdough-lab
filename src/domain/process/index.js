import { SOURDOUGH_STEPS } from './sourdough-steps.js';

export const PROCESS_BY_REF = {
  'sourdough-steps': SOURDOUGH_STEPS,
};

export function getProcessSteps(processRef) {
  return PROCESS_BY_REF[processRef] || SOURDOUGH_STEPS;
}

export { SOURDOUGH_STEPS };
