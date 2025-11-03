const { toNumber } = require('../utils/num');
const { calcRules } = require('../config/calcRules');

class CalculationService {
  constructor(ruleVersion = null) {
    this.version = ruleVersion || calcRules.defaultVersion;
    this.rules = calcRules.versions[this.version];
    
    if (!this.rules) {
      throw new Error(`Invalid rule version: ${this.version}`);
    }

    this.environment = null;
    this.trace = {};
  }

  /**
   * Compute all calculations based on provided fields
   * @param {Array} fields - Array of field objects
   * @returns {Object} Calculation results with trace information
   */
  compute(fields) {
    try {
      const { dict, meta } = this.buildFieldDictionary(fields);
      
      this.environment = {
        dict,
        meta,
        results: {}
      };
      
      this.trace = {};

      // Execute all rules in order
      this.executeRules();

      return {
        ok: true,
        results: this.environment.results,
        trace: this.trace,
        errors: []
      };
    } catch (error) {
      return {
        ok: false,
        results: {},
        trace: {},
        errors: [error.message]
      };
    }
  }

  /**
   * Build a normalized dictionary from fields
   * @private
   */
  buildFieldDictionary(fields = []) {
    const dict = {};
    const meta = {}; // Track source field IDs for each key

    for (const field of fields) {
      if (!field || field.included === false) continue;

      const key = this.normalizeKey(field.key || field.label);
      if (!key) continue;

      const value = toNumber(field.value);
      if (value === null) continue;

      // Aggregate multiple fields with same label
      dict[key] = (dict[key] ?? 0) + value;
      
      if (!meta[key]) meta[key] = [];
      meta[key].push(field.id || key);
    }

    return { dict, meta };
  }

  /**
   * Normalize a field label to a consistent key format
   * @private
   */
  normalizeKey(label) {
    return String(label || '').trim().toLowerCase();
  }

  /**
   * Execute all calculation rules
   * @private
   */
  executeRules() {
    for (const [outputKey, ruleNode] of Object.entries(this.rules)) {
      const { value, used } = this.evaluateNode(ruleNode);
      
      this.environment.results[outputKey] = Number.isFinite(value) 
        ? Number(value) 
        : 0;
      
      this.trace[outputKey] = [...new Set(used)]; // Remove duplicates
    }
  }

  /**
   * Evaluate a rule node recursively
   * @private
   */
  evaluateNode(node) {
    if (!node || typeof node !== 'object') {
      return { value: 0, used: [] };
    }

    // Handle constant values
    if ('const' in node) {
      return {
        value: Number(node.const) || 0,
        used: []
      };
    }

    // Handle references to computed values
    if ('ref' in node) {
      const key = node.ref;
      return {
        value: this.environment.results[key] ?? 0,
        used: this.trace[key] ?? []
      };
    }

    // Handle direct field lookups
    if ('field' in node) {
      const key = this.normalizeKey(node.field);
      return {
        value: this.environment.dict[key] ?? 0,
        used: this.environment.meta[key] ?? []
      };
    }

    // Handle operations
    return this.evaluateOperation(node);
  }

  /**
   * Evaluate an operation node
   * @private
   */
  evaluateOperation(node) {
    const { op } = node;

    switch (op) {
      case 'sumMatch':
        return this.sumMatching(node.match);
      
      case 'avgMatch':
        return this.avgMatching(node.match);
      
      case 'countMatch':
        return this.countMatching(node.match);
      
      case 'add':
        return this.binaryOperation(node, (a, b) => a + b);
      
      case 'sub':
        return this.binaryOperation(node, (a, b) => a - b);
      
      case 'mul':
        return this.binaryOperation(node, (a, b) => a * b);
      
      case 'div':
        return this.binaryOperation(node, (a, b) => b === 0 ? 0 : a / b);
      
      case 'min':
        return this.minOperation(node);
      
      case 'max':
        return this.maxOperation(node);
      
      case 'abs':
        return this.unaryOperation(node, Math.abs);
      
      case 'percentage':
        return this.percentageOperation(node);
      
      case 'firstOf':
        return this.firstOfOperation(node);
      
      default:
        throw new Error(`Unknown operation: ${op}`);
    }
  }

  /**
   * Sum all fields matching a pattern
   * @private
   */
  sumMatching(pattern) {
    const keys = this.matchKeys(pattern);
    let sum = 0;
    const used = [];

    for (const key of keys) {
      sum += this.environment.dict[key];
      used.push(...(this.environment.meta[key] || []));
    }

    return { value: sum, used };
  }

  /**
   * Average all fields matching a pattern
   * @private
   */
  avgMatching(pattern) {
    const keys = this.matchKeys(pattern);
    
    if (keys.length === 0) {
      return { value: 0, used: [] };
    }

    let sum = 0;
    const used = [];

    for (const key of keys) {
      sum += this.environment.dict[key];
      used.push(...(this.environment.meta[key] || []));
    }

    return { value: sum / keys.length, used };
  }

  /**
   * Count fields matching a pattern
   * @private
   */
  countMatching(pattern) {
    const keys = this.matchKeys(pattern);
    const used = keys.flatMap(k => this.environment.meta[k] || []);
    
    return { value: keys.length, used };
  }

  /**
   * Find all keys matching a regex pattern
   * @private
   */
  matchKeys(pattern) {
    const regex = new RegExp(pattern);
    return Object.keys(this.environment.dict).filter(key => regex.test(key));
  }

  /**
   * Execute a binary operation (add, sub, mul, div)
   * @private
   */
  binaryOperation(node, operator) {
    const a = this.evaluateNode(node.a);
    const b = this.evaluateNode(node.b);

    return {
      value: operator(a.value, b.value),
      used: [...a.used, ...b.used]
    };
  }

  /**
   * Execute a unary operation (abs, etc.)
   * @private
   */
  unaryOperation(node, operator) {
    const operand = this.evaluateNode(node.a);

    return {
      value: operator(operand.value),
      used: operand.used
    };
  }

  /**
   * Return minimum of two values
   * @private
   */
  minOperation(node) {
    const a = this.evaluateNode(node.a);
    const b = this.evaluateNode(node.b);

    return a.value <= b.value ? a : b;
  }

  /**
   * Return maximum of two values
   * @private
   */
  maxOperation(node) {
    const a = this.evaluateNode(node.a);
    const b = this.evaluateNode(node.b);

    return a.value >= b.value ? a : b;
  }

  /**
   * Calculate percentage (value / base * 100)
   * @private
   */
  percentageOperation(node) {
    const value = this.evaluateNode(node.value);
    const base = this.evaluateNode(node.base);

    if (base.value === 0) {
      return { value: 0, used: [...value.used, ...base.used] };
    }

    return {
      value: (value.value / base.value) * 100,
      used: [...value.used, ...base.used]
    };
  }

  /**
   * Return first non-zero value from a list of options
   * @private
   */
  firstOfOperation(node) {
    const options = node.options || [];
    
    for (const option of options) {
      const result = this.evaluateNode(option);
      if (result.value !== 0) {
        return result;
      }
    }

    return { value: 0, used: [] };
  }

  /**
   * Round results to specified precision
   * @param {Object} results - Raw calculation results
   * @param {Number} precision - Decimal places
   * @returns {Object} Rounded results
   */
  roundResults(results, precision = 2) {
    const rounded = {};
    const multiplier = Math.pow(10, precision);

    for (const [key, value] of Object.entries(results)) {
      rounded[key] = Math.round((value + Number.EPSILON) * multiplier) / multiplier;
    }

    return rounded;
  }

  /**
   * Get human-readable description of a calculation
   * @param {String} key - Result key
   * @returns {String} Description
   */
  getCalculationDescription(key) {
    const rule = this.rules[key];
    if (!rule) return 'Unknown calculation';

    return this.describeNode(rule);
  }

  /**
   * Generate human-readable description of a rule node
   * @private
   */
  describeNode(node) {
    if (!node) return 'empty';
    
    if ('const' in node) return `constant ${node.const}`;
    if ('ref' in node) return `reference to ${node.ref}`;
    if ('field' in node) return `field ${node.field}`;

    switch (node.op) {
      case 'sumMatch':
        return `sum of fields matching "${node.match}"`;
      case 'avgMatch':
        return `average of fields matching "${node.match}"`;
      case 'countMatch':
        return `count of fields matching "${node.match}"`;
      case 'add':
        return `${this.describeNode(node.a)} + ${this.describeNode(node.b)}`;
      case 'sub':
        return `${this.describeNode(node.a)} - ${this.describeNode(node.b)}`;
      case 'mul':
        return `${this.describeNode(node.a)} × ${this.describeNode(node.b)}`;
      case 'div':
        return `${this.describeNode(node.a)} ÷ ${this.describeNode(node.b)}`;
      case 'min':
        return `minimum of (${this.describeNode(node.a)}, ${this.describeNode(node.b)})`;
      case 'max':
        return `maximum of (${this.describeNode(node.a)}, ${this.describeNode(node.b)})`;
      case 'percentage':
        return `${this.describeNode(node.value)} as percentage of ${this.describeNode(node.base)}`;
      case 'firstOf':
        return `first non-zero value from options`;
      default:
        return `unknown operation ${node.op}`;
    }
  }
}

module.exports = CalculationService;