```typescript
import { supabase } from '../supabase';

interface WorkflowRule {
  id: string;
  name: string;
  conditions: Record<string, any>;
  priority: number;
  reasoning: string;
}

export class WorkflowOptimizer {
  private rules: WorkflowRule[] = [];

  constructor() {
    this.loadRules();
  }

  private async loadRules() {
    const { data, error } = await supabase
      .from('workflow_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error loading workflow rules:', error);
      return;
    }

    this.rules = data;
  }

  public async optimizeWorkflow(content: any) {
    const matchedRules = this.rules.filter(rule => 
      this.evaluateConditions(content, rule.conditions)
    );

    if (matchedRules.length === 0) {
      return this.getDefaultWorkflow();
    }

    // Get the highest priority rule
    const bestRule = matchedRules[0];

    // Store the decision
    await this.storeDecision(content.id, bestRule);

    return {
      workflow: this.generateWorkflow(bestRule),
      reasoning: bestRule.reasoning,
      confidence: this.calculateConfidence(content, bestRule)
    };
  }

  private evaluateConditions(content: any, conditions: Record<string, any>): boolean {
    return Object.entries(conditions).every(([key, condition]) => {
      const value = content[key];

      if (typeof condition === 'object') {
        if (condition.min !== undefined && value < condition.min) return false;
        if (condition.max !== undefined && value > condition.max) return false;
        if (condition.equals !== undefined && value !== condition.equals) return false;
        if (condition.contains !== undefined && !value.includes(condition.contains)) return false;
      } else {
        return value === condition;
      }

      return true;
    });
  }

  private getDefaultWorkflow() {
    return {
      workflow: {
        steps: [
          { type: 'ai_generation', config: { model: 'default' } },
          { type: 'human_review', config: { reviewType: 'basic' } }
        ],
        fallback: { type: 'manual_process' }
      },
      reasoning: 'Using default workflow as no specific rules matched',
      confidence: 0.5
    };
  }

  private generateWorkflow(rule: WorkflowRule) {
    // Generate workflow steps based on the rule
    const steps = [];

    if (rule.conditions.complexity_score > 0.7) {
      steps.push(
        { type: 'human_planning', config: { depth: 'detailed' } },
        { type: 'ai_generation', config: { model: 'advanced' } },
        { type: 'human_review', config: { reviewType: 'comprehensive' } }
      );
    } else if (rule.conditions.complexity_score > 0.4) {
      steps.push(
        { type: 'ai_generation', config: { model: 'balanced' } },
        { type: 'human_review', config: { reviewType: 'standard' } }
      );
    } else {
      steps.push(
        { type: 'ai_generation', config: { model: 'fast' } },
        { type: 'human_review', config: { reviewType: 'quick' } }
      );
    }

    return {
      steps,
      fallback: { type: 'manual_process' }
    };
  }

  private calculateConfidence(content: any, rule: WorkflowRule): number {
    // Calculate confidence based on how well the content matches the rule conditions
    let matchScore = 0;
    let totalConditions = 0;

    Object.entries(rule.conditions).forEach(([key, condition]) => {
      totalConditions++;
      const value = content[key];

      if (typeof condition === 'object') {
        if (condition.min !== undefined) {
          matchScore += (value - condition.min) / (condition.max - condition.min);
        }
        // Add more condition types...
      } else {
        matchScore += value === condition ? 1 : 0;
      }
    });

    return matchScore / totalConditions;
  }

  private async storeDecision(contentId: string, rule: WorkflowRule) {
    await supabase
      .from('workflow_decisions')
      .insert({
        content_id: contentId,
        rule_id: rule.id,
        applied_at: new Date().toISOString()
      });
  }

  public async updateRule(rule: Partial<WorkflowRule> & { id: string }) {
    const { error } = await supabase
      .from('workflow_rules')
      .update(rule)
      .eq('id', rule.id);

    if (error) {
      throw new Error(`Failed to update rule: ${error.message}`);
    }

    await this.loadRules();
  }
}
```