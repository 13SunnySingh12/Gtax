// JSDoc typedefs (plain-JS project per TRD — no TS build step). These document
// the API shapes the frontend consumes; editors use them for autocompletion.

/**
 * @typedef {Object} Income
 * @property {string} id
 * @property {string} source
 * @property {number} amount
 * @property {string} incomeDate  ISO date
 * @property {string|null} notes
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Receipt
 * @property {string} id
 * @property {string} fileUrl
 * @property {'pending'|'processing'|'done'|'failed'} ocrStatus
 * @property {string|null} ocrRawText
 */

/**
 * @typedef {Object} Expense
 * @property {string} id
 * @property {number} amount
 * @property {string|null} vendor
 * @property {string} expenseDate
 * @property {string|null} category
 * @property {string|null} aiSuggestedCategory
 * @property {boolean} isDeductible
 * @property {string|null} deductionReason
 * @property {string} createdAt
 * @property {Receipt|null} receipt
 */

/**
 * @typedef {Object} SlabBreakdown
 * @property {number} fromAmount
 * @property {number|null} toAmount
 * @property {number} ratePercent
 * @property {number} taxableInSlab
 * @property {number} taxForSlab
 */

/**
 * @typedef {Object} TaxEstimate
 * @property {number} totalIncome
 * @property {number} deductibleExpenses
 * @property {number} standardDeduction
 * @property {number} taxableIncome
 * @property {number} estimatedTax
 * @property {string} financialYearLabel
 * @property {SlabBreakdown[]} breakdown
 */

/**
 * @typedef {Object} Deadline
 * @property {string} id
 * @property {string} title
 * @property {string|null} description
 * @property {string} dueDate
 * @property {string|null} applicableTo
 */

export {};
