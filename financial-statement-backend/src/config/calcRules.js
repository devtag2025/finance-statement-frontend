const calcRules = {
  defaultVersion: 'v1',
  
  versions: {
    v1: {
      // ===== INCOME CALCULATIONS =====
      'income.total': {
        op: 'firstOf',
        options: [
          { field: 'income.total' },
          { op: 'sumMatch', match: '^income\\.' }
        ],
        description: 'Total income from all sources'
      },

      'income.assessable': {
        op: 'firstOf',
        options: [
          { field: 'income.assessable' },
          { field: 'income.total' }
        ],
        description: 'Assessable income for tax purposes'
      },

      // ===== EXPENSE CALCULATIONS =====
      'expenses.total': {
        op: 'firstOf',
        options: [
          { field: 'expenses.total' },
          { op: 'sumMatch', match: '^expenses\\.' }
        ],
        description: 'Total expenses'
      },

      'expenses.deductible': {
        op: 'sub',
        a: { ref: 'expenses.total' },
        b: { ref: 'expenses.nonDeductible' },
        description: 'Total deductible expenses'
      },

      'expenses.nonDeductible': {
        op: 'firstOf',
        options: [
          { field: 'deductions.nondeductible' },
          { const: 0 }
        ],
        description: 'Non-deductible expenses'
      },

      'expenses.operating': {
        op: 'add',
        a: { ref: 'expenses.wages' },
        b: { op: 'add',
             a: { ref: 'depreciation.total' },
             b: { ref: 'expenses.other' } },
        description: 'Total operating expenses'
      },

      'expenses.wages': {
        op: 'firstOf',
        options: [
          { field: 'expenses.wages' },
          { op: 'sumMatch', match: 'wages|salaries' }
        ],
        description: 'Total wages and salaries'
      },

      'expenses.rent': {
        op: 'sumMatch',
        match: 'rent',
        description: 'Rent expenses'
      },

      'expenses.superannuation': {
        op: 'firstOf',
        options: [
          { field: 'expenses.superannuation' },
          { op: 'sumMatch', match: 'super' }
        ],
        description: 'Superannuation expenses'
      },

      'expenses.repairs': {
        op: 'sumMatch',
        match: 'repair',
        description: 'Repairs and maintenance'
      },

      'expenses.other': {
        op: 'firstOf',
        options: [
          { field: 'expenses.other' },
          { const: 0 }
        ],
        description: 'Other expenses'
      },

      // ===== DEPRECIATION =====
      'depreciation.total': {
        op: 'firstOf',
        options: [
          { field: 'depreciation.total' },
          { op: 'sumMatch', match: '^depreciation\\.' }
        ],
        description: 'Total depreciation'
      },

      'depreciation.motorVehicle': {
        op: 'sumMatch',
        match: 'depreciation\\.motorvehicle',
        description: 'Motor vehicle depreciation'
      },

      'depreciation.buildings': {
        op: 'sumMatch',
        match: 'depreciation\\.buildings',
        description: 'Buildings depreciation'
      },

      'depreciation.equipment': {
        op: 'sumMatch',
        match: 'depreciation\\.(plant|office)',
        description: 'Equipment depreciation'
      },

      // ===== PROFIT CALCULATIONS =====
      'profit.gross': {
        op: 'firstOf',
        options: [
          { field: 'profit.gross' },
          { op: 'sub',
            a: { field: 'income.total' },
            b: { field: 'expenses.costofsales' } }
        ],
        description: 'Gross profit'
      },

      'profit.operating': {
        op: 'firstOf',
        options: [
          { field: 'profit.operating' },
          { op: 'sub',
            a: { ref: 'profit.gross' },
            b: { ref: 'expenses.operating' } }
        ],
        description: 'Operating profit'
      },

      'profit.beforeTax': {
        op: 'firstOf',
        options: [
          { field: 'profit.beforetax' },
          { op: 'sub',
            a: { ref: 'income.total' },
            b: { ref: 'expenses.total' } }
        ],
        description: 'Profit before tax'
      },

      'profit.net': {
        op: 'firstOf',
        options: [
          { field: 'profit.net' },
          { op: 'sub',
            a: { ref: 'profit.beforeTax' },
            b: { ref: 'tax.expense' } }
        ],
        description: 'Net profit after tax'
      },

      // ===== TAX CALCULATIONS =====
      'tax.addbacks': {
        op: 'firstOf',
        options: [
          { field: 'deductions.nondeductible' },
          { const: 0 }
        ],
        description: 'Tax addbacks (non-deductible expenses)'
      },

      'tax.deductions': {
        op: 'firstOf',
        options: [
          { field: 'deductions.other' },
          { const: 0 }
        ],
        description: 'Other allowable deductions'
      },

      'tax.taxableIncome': {
        op: 'add',
        a: { op: 'sub',
             a: { ref: 'profit.beforeTax' },
             b: { ref: 'tax.deductions' } },
        b: { ref: 'tax.addbacks' },
        description: 'Taxable income (Profit - Deductions + Addbacks)'
      },

      'tax.expense': {
        op: 'firstOf',
        options: [
          { field: 'tax.expense' },
          { const: 0 }
        ],
        description: 'Income tax expense'
      },

      'tax.payable': {
        op: 'firstOf',
        options: [
          { field: 'tax.payable' },
          { ref: 'tax.expense' }
        ],
        description: 'Tax payable'
      },

      'tax.lossCarryForward': {
        op: 'firstOf',
        options: [
          { field: 'tax.losses' },
          { const: 0 }
        ],
        description: 'Tax losses carried forward'
      },

      // ===== BALANCE SHEET CALCULATIONS =====
      'assets.current': {
        op: 'firstOf',
        options: [
          { field: 'assets.current' },
          { op: 'sumMatch', match: '^assets\\.(cash|accountsreceivable|supplies)' }
        ],
        description: 'Current assets'
      },

      'assets.total': {
        op: 'firstOf',
        options: [
          { field: 'assets.total' },
          { op: 'add',
            a: { ref: 'assets.current' },
            b: { ref: 'assets.nonCurrent' } }
        ],
        description: 'Total assets'
      },

      'assets.nonCurrent': {
        op: 'sub',
        a: { op: 'firstOf',
             options: [
               { field: 'assets.equipment' },
               { const: 0 }
             ] },
        b: { op: 'firstOf',
             options: [
               { field: 'assets.accumulateddepreciation' },
               { const: 0 }
             ] },
        description: 'Net non-current assets'
      },

      'liabilities.current': {
        op: 'firstOf',
        options: [
          { field: 'liabilities.current' },
          { op: 'sumMatch', match: '^liabilities\\.(accountspayable|wagespayable|taxpayable)' }
        ],
        description: 'Current liabilities'
      },

      'liabilities.total': {
        op: 'firstOf',
        options: [
          { field: 'liabilities.total' },
          { op: 'add',
            a: { ref: 'liabilities.current' },
            b: { op: 'sumMatch', match: 'liabilities\\.notespayable' } }
        ],
        description: 'Total liabilities'
      },

      'equity.total': {
        op: 'firstOf',
        options: [
          { field: 'equity.total' },
          { op: 'sub',
            a: { ref: 'assets.total' },
            b: { ref: 'liabilities.total' } }
        ],
        description: 'Total equity (Assets - Liabilities)'
      },

      // ===== FINANCIAL RATIOS =====
      'ratio.currentRatio': {
        op: 'div',
        a: { ref: 'assets.current' },
        b: { ref: 'liabilities.current' },
        description: 'Current ratio (liquidity measure)'
      },

      'ratio.debtToEquity': {
        op: 'div',
        a: { ref: 'liabilities.total' },
        b: { ref: 'equity.total' },
        description: 'Debt to equity ratio'
      },

      'ratio.profitMargin': {
        op: 'percentage',
        value: { ref: 'profit.net' },
        base: { ref: 'income.total' },
        description: 'Net profit margin percentage'
      },

      'ratio.grossMargin': {
        op: 'percentage',
        value: { ref: 'profit.gross' },
        base: { ref: 'income.total' },
        description: 'Gross profit margin percentage'
      },

      'ratio.expenseRatio': {
        op: 'percentage',
        value: { ref: 'expenses.total' },
        base: { ref: 'income.total' },
        description: 'Expense to income ratio'
      },

      'ratio.returnOnAssets': {
        op: 'percentage',
        value: { ref: 'profit.net' },
        base: { ref: 'assets.total' },
        description: 'Return on assets (ROA)'
      },

      'ratio.returnOnEquity': {
        op: 'percentage',
        value: { ref: 'profit.net' },
        base: { ref: 'equity.total' },
        description: 'Return on equity (ROE)'
      },

      // ===== KEY PERFORMANCE INDICATORS =====
      'kpi.revenuePerExpenseDollar': {
        op: 'div',
        a: { ref: 'income.total' },
        b: { ref: 'expenses.total' },
        description: 'Revenue generated per dollar of expense'
      },

      'kpi.depreciationRate': {
        op: 'percentage',
        value: { ref: 'depreciation.total' },
        base: { ref: 'assets.nonCurrent' },
        description: 'Depreciation as % of non-current assets'
      },

      'kpi.wageCostRatio': {
        op: 'percentage',
        value: { ref: 'expenses.wages' },
        base: { ref: 'income.total' },
        description: 'Wages as percentage of revenue'
      }
    }
  },

  // Metadata about calculations
  metadata: {
    v1: {
      name: 'Australian Financial Statements & Tax Returns v1',
      description: 'Comprehensive calculations for Australian company tax returns and financial statements',
      categories: [
        'Income',
        'Expenses',
        'Depreciation',
        'Profit',
        'Tax',
        'Balance Sheet',
        'Financial Ratios',
        'KPIs'
      ],
      compatibleDocuments: [
        'Company Tax Return (ATO)',
        'Income Statement',
        'Balance Sheet',
        'Statement of Retained Earnings'
      ]
    }
  }
};

module.exports = { calcRules };