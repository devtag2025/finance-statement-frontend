const parseRules = {
  anchors: [
    // ===== INCOME & REVENUE =====
    {
      key: 'income.total',
      category: 'income',
      labels: [
        /total\s+income/i,
        /service\s+revenue/i,
        /sales\s+revenue/i,
        /other\s+sales\s+of\s+goods\s+and\s+services/i,
        /gross\s+revenue/i
      ]
    },
    {
      key: 'income.assessable',
      category: 'income',
      labels: [
        /assessable\s+income/i,
        /taxable\s+income\s+or\s+loss/i
      ]
    },

    // ===== EXPENSES =====
    {
      key: 'expenses.total',
      category: 'expenses',
      labels: [
        /total\s+expenses/i,
        /total\s+operating\s+expenses/i
      ]
    },
    {
      key: 'expenses.costOfSales',
      category: 'expenses',
      labels: [
        /cost\s+of\s+sales/i,
        /cost\s+of\s+goods\s+sold/i,
        /purchases\s+and\s+other\s+costs/i,
        /cogs/i
      ]
    },
    {
      key: 'expenses.wages',
      category: 'expenses',
      labels: [
        /wages?\s+expenses?/i,
        /salary\s+and\s+wage\s+expenses?/i,
        /total\s+salary\s+and\s+wage\s+expenses?/i,
        /salaries/i
      ]
    },
    {
      key: 'expenses.superannuation',
      category: 'expenses',
      labels: [
        /superannuation\s+expenses?/i,
        /super\s+expenses?/i,
        /superannuation\s+fund\s+payments/i,
        /allowable\s+superannuation/i
      ]
    },
    {
      key: 'expenses.rent',
      category: 'expenses',
      labels: [
        /rent\s+expenses?/i,
        /rental\s+expenses?/i
      ]
    },
    {
      key: 'expenses.repairs',
      category: 'expenses',
      labels: [
        /repairs?\s+and\s+maintenance/i,
        /repairs?\s+expenses?/i,
        /maintenance\s+expenses?/i
      ]
    },
    {
      key: 'expenses.supplies',
      category: 'expenses',
      labels: [
        /supplies\s+expenses?/i,
        /office\s+supplies/i
      ]
    },
    {
      key: 'expenses.interest',
      category: 'expenses',
      labels: [
        /interest\s+expense/i,
        /interest\s+paid/i
      ]
    },
    {
      key: 'expenses.other',
      category: 'expenses',
      labels: [
        /all\s+other\s+expenses/i,
        /miscellaneous\s+expenses?/i,
        /other\s+expenses?/i
      ]
    },
    {
      key: 'expenses.entertainment',
      category: 'expenses',
      labels: [
        /entertainment/i,
        /entertainment\s+expenses?/i
      ]
    },

    // ===== DEPRECIATION =====
    {
      key: 'depreciation.total',
      category: 'depreciation',
      labels: [
        /depreciation\s+expenses?/i,
        /total\s+depreciation/i,
        /deduction\s+for\s+certain\s+assets/i,
        /depreciation\s+expense(?!\s+(motor|building|plant|office))/i
      ]
    },
    {
      key: 'depreciation.motorVehicle',
      category: 'depreciation',
      labels: [
        /motor\s+vehicle\s+depreciation/i,
        /motor\s+vehicle\s+depn/i,
        /m\/v\s+depreciation/i
      ]
    },
    {
      key: 'depreciation.buildings',
      category: 'depreciation',
      labels: [
        /buildings?\s+depreciation/i,
        /buildings?\s+depn/i
      ]
    },
    {
      key: 'depreciation.plantEquip',
      category: 'depreciation',
      labels: [
        /plant\s*&?\s*equipment\s+depreciation/i,
        /plant\s*&?\s*equipment\s+depn/i,
        /equipment\s+depreciation/i
      ]
    },
    {
      key: 'depreciation.officeEquip',
      category: 'depreciation',
      labels: [
        /office\s+equipment\s+depreciation/i,
        /office\s+equip\.?\s+depreciation/i
      ]
    },

    // ===== PROFIT & INCOME =====
    {
      key: 'profit.beforeTax',
      category: 'profit',
      labels: [
        /profit\s+before\s+tax/i,
        /pretax\s+income/i,
        /net\s+profit\s+before\s+tax/i,
        /profit\/loss\s+before\s+income\s+tax/i,
        /operating\s+income/i,
        /total\s+profit\s+or\s+loss/i
      ]
    },
    {
      key: 'profit.net',
      category: 'profit',
      labels: [
        /net\s+income/i,
        /net\s+profit(?!\s+before)/i,
        /profit\s+after\s+tax/i
      ]
    },
    {
      key: 'profit.gross',
      category: 'profit',
      labels: [
        /gross\s+profit/i
      ]
    },
    {
      key: 'profit.operating',
      category: 'profit',
      labels: [
        /operating\s+income(?!\s+tax)/i,
        /ebit/i
      ]
    },

    // ===== TAX =====
    {
      key: 'tax.expense',
      category: 'tax',
      labels: [
        /income\s+tax\s+expense/i,
        /tax\s+expense/i,
        /income\s+tax/i
      ]
    },
    {
      key: 'tax.payable',
      category: 'tax',
      labels: [
        /tax\s+payable/i,
        /amount\s+due/i,
        /income\s+taxes?\s+payable/i
      ]
    },
    {
      key: 'tax.losses',
      category: 'tax',
      labels: [
        /tax\s+losses?\s+carried\s+forward/i,
        /losses?\s+carried\s+forward/i,
        /year\s+of\s+loss/i
      ]
    },

    // ===== DEDUCTIONS & ADDBACKS =====
    {
      key: 'deductions.nonDeductible',
      category: 'deductions',
      labels: [
        /non-deductible\s+expenses?/i,
        /non\s+deductible\s+expenses?/i,
        /total\s+non-deductible/i
      ]
    },
    {
      key: 'deductions.other',
      category: 'deductions',
      labels: [
        /other\s+deductible\s+expenses?/i,
        /allowable\s+deductions?/i,
        /total\s+other\s+deductible/i
      ]
    },

    // ===== ASSETS =====
    {
      key: 'assets.current',
      category: 'assets',
      labels: [
        /total\s+current\s+assets/i,
        /current\s+assets/i,
        /all\s+current\s+assets/i
      ]
    },
    {
      key: 'assets.total',
      category: 'assets',
      labels: [
        /total\s+assets/i
      ]
    },
    {
      key: 'assets.cash',
      category: 'assets',
      labels: [
        /^cash$/i,
        /cash\s+balance/i
      ]
    },
    {
      key: 'assets.accountsReceivable',
      category: 'assets',
      labels: [
        /accounts?\s+receivable/i,
        /trade\s+debtors?/i
      ]
    },
    {
      key: 'assets.equipment',
      category: 'assets',
      labels: [
        /equipment(?!\s+depreciation)/i,
        /plant\s+and\s+equipment(?!\s+depreciation)/i
      ]
    },
    {
      key: 'assets.accumulatedDepreciation',
      category: 'assets',
      labels: [
        /accumulated\s+deprec?\.?/i,
        /less:?\s+accumulated\s+depreciation/i
      ]
    },

    // ===== LIABILITIES =====
    {
      key: 'liabilities.current',
      category: 'liabilities',
      labels: [
        /total\s+current\s+liabilities/i,
        /current\s+liabilities/i,
        /all\s+current\s+liabilities/i
      ]
    },
    {
      key: 'liabilities.total',
      category: 'liabilities',
      labels: [
        /total\s+liabilities/i
      ]
    },
    {
      key: 'liabilities.accountsPayable',
      category: 'liabilities',
      labels: [
        /accounts?\s+payable/i,
        /trade\s+creditors?/i
      ]
    },
    {
      key: 'liabilities.notesPayable',
      category: 'liabilities',
      labels: [
        /notes?\s+payable/i,
        /long-term\s+notes?\s+payable/i
      ]
    },
    {
      key: 'liabilities.interestPayable',
      category: 'liabilities',
      labels: [
        /interest\s+payable/i
      ]
    },
    {
      key: 'liabilities.wagesPayable',
      category: 'liabilities',
      labels: [
        /wages?\s+payable/i,
        /salaries?\s+payable/i
      ]
    },
    {
      key: 'liabilities.utilitiesPayable',
      category: 'liabilities',
      labels: [
        /utilities\s+payable/i
      ]
    },

    // ===== EQUITY =====
    {
      key: 'equity.total',
      category: 'equity',
      labels: [
        /total\s+equity/i,
        /total\s+owners['']?\s+equity/i,
        /stockholders['']?\s+equity/i,
        /owners['']?\s+equity/i
      ]
    },
    {
      key: 'equity.capital',
      category: 'equity',
      labels: [
        /owners['']?\s+capital/i,
        /share\s+capital/i,
        /contributed\s+capital/i
      ]
    },
    {
      key: 'equity.retainedEarnings',
      category: 'equity',
      labels: [
        /retained\s+earnings/i,
        /accumulated\s+profit/i
      ]
    },
    {
      key: 'equity.dividends',
      category: 'equity',
      labels: [
        /dividends?\s+declared/i,
        /dividends?\s+paid/i
      ]
    },

    // ===== BUSINESS INFORMATION =====
    {
      key: 'business.abn',
      category: 'business',
      labels: [
        /\bABN\b/i,
        /australian\s+business\s+number/i
      ]
    },
    {
      key: 'business.tfn',
      category: 'business',
      labels: [
        /\bTFN\b/i,
        /tax\s+file\s+number/i
      ]
    },
    {
      key: 'business.turnover',
      category: 'business',
      labels: [
        /aggregated\s+turnover/i,
        /annual\s+turnover/i
      ]
    },

    // ===== SALARIES (Associated Persons) =====
    {
      key: 'salaries.associatedPersons',
      category: 'salaries',
      labels: [
        /salaries?\s+associated\s+persons?/i,
        /salaries?\s+directors?/i,
        /directors?['']?\s+salaries?/i
      ]
    },
    {
      key: 'superannuation.associatedPersons',
      category: 'superannuation',
      labels: [
        /superannuation\s+associated\s+persons?/i,
        /superannuation\s+directors?/i,
        /directors?['']?\s+super/i
      ]
    },

    // ===== DONATIONS =====
    {
      key: 'donations.total',
      category: 'donations',
      labels: [
        /donations?/i,
        /sponsorships?/i,
        /charitable\s+contributions?/i
      ]
    },

    // ===== PERIODS/DATES =====
    {
      key: 'period.start',
      category: 'period',
      labels: [
        /period\s+from/i,
        /year\s+from/i,
        /for\s+the\s+year\s+ended/i,
        /financial\s+year\s+start/i
      ]
    },
    {
      key: 'period.end',
      category: 'period',
      labels: [
        /period\s+to/i,
        /year\s+ended/i,
        /financial\s+year\s+end/i,
        /date\s+prepared/i
      ]
    }
  ],

  // Extended search window for better accuracy
  window: 150,

  // Enhanced number pattern - handles negatives, parentheses, currency symbols
  numberPattern: /[-(]?\$?\s*\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?\s*[)]?/,

  // Multiple date formats
  datePattern: /\b(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/i,

  // Special patterns for Australian tax documents
  abnPattern: /\b\d{2}\s?\d{3}\s?\d{3}\s?\d{3}\b/,
  tfnPattern: /\b\d{3}\s?\d{3}\s?\d{3}\b/,

  // Loss indicators (negative values in parentheses or with 'L' suffix)
  lossIndicators: /\(|\bL\b$/
};

module.exports = { parseRules };