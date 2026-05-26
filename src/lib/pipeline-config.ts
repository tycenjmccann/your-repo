// Pipeline phase configuration - config-driven metadata for phase cards

export interface PhaseDisplayMeta {
  id: string;
  name: string;
  phase: number;
  type: 'app' | 'agent';
  agents: string[];
  tools: string[];
  skills: string[];
  models: string[];
  evaluationsEnabled: boolean;
}

// Tools to exclude from tool counts
const EXCLUDED_TOOLS = ['gateway', 'browser', 'invoke_team_agent'];

export const PHASE_DISPLAY_META: PhaseDisplayMeta[] = [
  {
    id: 'intake',
    name: 'Intake',
    phase: 1,
    type: 'app',
    agents: ['web-app'],
    tools: ['form-validator', 'file-upload', 'session-manager'],
    skills: ['request-parsing', 'validation'],
    models: ['Claude Sonnet 4'],
    evaluationsEnabled: false,
  },
  {
    id: 'planning',
    name: 'Planning',
    phase: 2,
    type: 'agent',
    agents: ['planner', 'architect', 'estimator', 'risk-assessor'],
    tools: ['code-search', 'dependency-analyzer', 'task-decomposer', 'priority-ranker', 'cost-estimator'],
    skills: ['decomposition', 'estimation', 'risk-analysis', 'architecture'],
    models: ['Claude Opus 4', 'Claude Sonnet 4'],
    evaluationsEnabled: true,
  },
  {
    id: 'design',
    name: 'Design',
    phase: 3,
    type: 'agent',
    agents: [
      'frontend-designer',
      'backend-designer',
      'api-designer',
      'db-designer',
      'ux-researcher',
      'accessibility-auditor',
      'design-reviewer',
      'system-architect',
    ],
    tools: [
      'figma-export',
      'component-library',
      'schema-generator',
      'api-spec-builder',
      'contrast-checker',
      'responsive-tester',
      'design-lint',
      'wireframe-tool',
      'pattern-matcher',
      'style-validator',
      'layout-engine',
      'color-picker',
    ],
    skills: [
      'ui-design',
      'api-design',
      'database-design',
      'responsive-layout',
      'accessibility',
      'design-systems',
      'prototyping',
    ],
    models: ['Claude Opus 4', 'Claude Sonnet 4'],
    evaluationsEnabled: true,
  },
  {
    id: 'development',
    name: 'Development',
    phase: 4,
    type: 'agent',
    agents: [
      'frontend-dev',
      'backend-dev',
      'fullstack-dev',
      'devops-engineer',
      'test-engineer',
      'security-engineer',
      'performance-engineer',
      'documentation-writer',
      'code-reviewer',
      'integration-specialist',
    ],
    tools: [
      'code-editor',
      'git-operations',
      'test-runner',
      'linter',
      'formatter',
      'bundler',
      'docker-builder',
      'ci-pipeline',
      'secret-scanner',
      'dependency-checker',
      'profiler',
      'debugger',
      'coverage-reporter',
      'migration-runner',
      'package-manager',
    ],
    skills: [
      'typescript',
      'react',
      'node',
      'python',
      'testing',
      'ci-cd',
      'docker',
      'security',
      'performance',
      'documentation',
    ],
    models: ['Claude Opus 4', 'Claude Sonnet 4'],
    evaluationsEnabled: true,
  },
  {
    id: 'qa',
    name: 'QA',
    phase: 5,
    type: 'agent',
    agents: [
      'qa-verifier',
      'regression-tester',
      'e2e-tester',
      'load-tester',
      'security-tester',
      'accessibility-tester',
    ],
    tools: [
      'playwright',
      'jest-runner',
      'lighthouse',
      'axe-core',
      'k6-runner',
      'zap-scanner',
      'visual-regression',
      'api-tester',
      'mutation-tester',
    ],
    skills: [
      'test-strategy',
      'automation',
      'regression',
      'performance-testing',
      'security-testing',
    ],
    models: ['Claude Sonnet 4'],
    evaluationsEnabled: true,
  },
  {
    id: 'deployment',
    name: 'Deployment',
    phase: 6,
    type: 'agent',
    agents: ['ci-agent', 'deploy-agent', 'monitor-agent'],
    tools: [
      'github-actions',
      'terraform',
      'cloudwatch',
      'rollback-manager',
      'health-checker',
      'dns-manager',
    ],
    skills: ['deployment', 'monitoring', 'rollback'],
    models: ['Claude Sonnet 4'],
    evaluationsEnabled: false,
  },
];

/**
 * Get unique tool count for a phase (excluding system tools)
 */
export function getPhaseToolCount(phase: PhaseDisplayMeta): number {
  return phase.tools.filter((t) => !EXCLUDED_TOOLS.includes(t)).length;
}

/**
 * Get agent display info for a phase
 */
export function getPhaseAgentDisplay(
  phase: PhaseDisplayMeta
): { type: 'app'; label: string } | { type: 'agent'; runtime: number; harness: number } {
  if (phase.type === 'app') {
    return { type: 'app', label: 'Web Application' };
  }
  const count = phase.agents.length;
  return {
    type: 'agent',
    runtime: count,
    harness: count,
  };
}

export const PIPELINE_PHASES = PHASE_DISPLAY_META;
