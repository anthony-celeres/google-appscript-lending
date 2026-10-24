/**
 * ============================================================================
 * COOPERATIVE LENDING SYSTEM - POP-UP MODAL DIALOG EDITION
 * ============================================================================
 * Logic: Annual Diminishing Interest Amortization Engine (36 Months @ 0.75%)
 * Interface: Centered HTML Pop-up Modal Windows (480px x 520px)
 * Email: Automated Gmail Official Receipt Generation
 * ============================================================================
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Actions')
    .addItem('Register New Borrower', 'openBorrowerDialog')
    .addItem('Create New Loan & Schedule', 'openNewLoanDialog')
    .addItem('Record Payment & Issue Receipt', 'openPaymentDialog')
    .addItem('Payment Reminders & Due Date Hub', 'openReminderDialog')
    .addItem('Export Amortization PDF', 'openExportPdfDialog')
    .addSeparator()
    .addItem('Edit Borrower Info', 'openEditBorrowerDialog')
    .addItem('Edit Loan Record', 'openEditLoanDialog')
    .addItem('Void/Reverse Error Payment', 'openVoidPaymentDialog')
    .addSeparator()
    .addItem('Filter Records by Loan / Borrower', 'openFilterDialog')
    .addSeparator()
    .addItem('Delete Loan & Amortization', 'openDeleteLoanDialog')
    .addItem('Delete Borrower Record', 'openDeleteBorrowerDialog')
    .addSeparator()
    .addItem('Initialize Database Sheets', 'setupDatabaseSheets')
    .addToUi();

  try {
    updateDashboardCollectionsRadar();
  } catch (e) {}
}

/**
 * CENTER POP-UP MODAL DIALOG LAUNCHERS
 */
function openBorrowerDialog() {
  const html = HtmlService.createHtmlOutputFromFile('BorrowerDialog')
    .setWidth(480)
    .setHeight(480);
  SpreadsheetApp.getUi().showModalDialog(html, 'Register New Borrower');
}

function openNewLoanDialog() {
  const html = HtmlService.createHtmlOutputFromFile('NewLoanDialog')
    .setWidth(480)
    .setHeight(610);
  SpreadsheetApp.getUi().showModalDialog(html, 'Create Loan & Amortization Schedule');
}

function openPaymentDialog() {
  const html = HtmlService.createHtmlOutputFromFile('PaymentDialog')
    .setWidth(500)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, 'Record Payment & Issue Official Receipt');
}

function openReminderDialog() {
  const html = HtmlService.createHtmlOutputFromFile('ReminderDialog')
    .setWidth(620)
    .setHeight(580);
  SpreadsheetApp.getUi().showModalDialog(html, 'Payment Reminders & Due Date Hub');
}

function openExportPdfDialog() {
  const html = HtmlService.createHtmlOutputFromFile('ExportPdfDialog')
    .setWidth(490)
    .setHeight(610);
  SpreadsheetApp.getUi().showModalDialog(html, 'Export Amortization PDF');
}

function openEditBorrowerDialog() {
  const html = HtmlService.createHtmlOutputFromFile('EditBorrowerDialog')
    .setWidth(480)
    .setHeight(540);
  SpreadsheetApp.getUi().showModalDialog(html, 'Edit Borrower Info');
}

function openEditLoanDialog() {
  const html = HtmlService.createHtmlOutputFromFile('EditLoanDialog')
    .setWidth(500)
    .setHeight(620);
  SpreadsheetApp.getUi().showModalDialog(html, 'Edit Loan Record');
}

function openVoidPaymentDialog() {
  const html = HtmlService.createHtmlOutputFromFile('VoidPaymentDialog')
    .setWidth(500)
    .setHeight(580);
  SpreadsheetApp.getUi().showModalDialog(html, 'Void/Reverse Error Payment');
}

function openDeleteLoanDialog() {
  const html = HtmlService.createHtmlOutputFromFile('DeleteLoanDialog')
    .setWidth(480)
    .setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(html, 'Delete Loan Record');
}

function openDeleteBorrowerDialog() {
  const html = HtmlService.createHtmlOutputFromFile('DeleteBorrowerDialog')
    .setWidth(480)
    .setHeight(540);
  SpreadsheetApp.getUi().showModalDialog(html, 'Delete Borrower Record');
}

function openFilterDialog() {
  const html = HtmlService.createHtmlOutputFromFile('FilterDialog')
    .setWidth(460)
    .setHeight(490);
  SpreadsheetApp.getUi().showModalDialog(html, 'Filter Database Records');
}

/**
 * 1. INITIALIZE DATABASE TABLES
 */
function setupDatabaseSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Define base data tables first so sheet references exist before Dashboard formulas are evaluated
  const dataTables = [
    {
      name: 'Borrowers',
      headers: ['Borrower ID', 'Borrower Name', 'Address', 'Phone', 'Email', 'Date Joined']
    },
    {
      name: 'LoanTypes',
      headers: ['Type ID', 'Name'],
      data: [
        ['LT-001', 'Regular Loan'],
        ['LT-002', 'Business Loan'],
        ['LT-003', 'Emergency Loan'],
        ['LT-004', 'Educational Loan'],
        ['LT-005', 'Mid/Year End Loan'],
        ['LT-006', 'Capital Build Up Loan'],
        ['LT-007', 'Grocery Loan']
      ]
    },
    {
      name: 'Loans',
      headers: ['Loan ID', 'Borrower ID', 'Borrower Name', 'Type', 'Amount (₱)', 'Months', 'Rate (%)', 'Penalty (%)', 'Date Granted', 'Remaining Bal', 'Status']
    },
    {
      name: 'Amortization',
      headers: ['Loan ID', 'Borrower Name', 'Month #', 'Term Year', 'Month Name', 'Principal', 'Amortization', 'Interest Pay', 'Monthly Amort', 'Penalty', 'Amount Paid', 'Status']
    },
    {
      name: 'Payments',
      headers: [
        'Receipt No', 'Loan ID', 'Borrower Name', 'Date Paid',
        'Principal Paid', 'Interest Paid', 'Penalty Paid', 'Advance Paid',
        'Amount Paid', 'Principal Balance After', 'Amortization Balance After', 'Method'
      ]
    },
    {
      name: 'AuditLogs',
      headers: ['Timestamp', 'User Email', 'Action', 'Details']
    }
  ];

  dataTables.forEach(t => {
    let sheet = ss.getSheetByName(t.name);
    if (!sheet) {
      sheet = ss.insertSheet(t.name);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(t.headers);
    } else {
      sheet.getRange(1, 1, 1, t.headers.length).setValues([t.headers]);
    }

    if (t.name === 'Borrowers') {
      sheet.getRange('D:D').setNumberFormat('@');
    } else if (t.name === 'LoanTypes') {
      if (sheet.getLastRow() === 1 && t.data) {
        t.data.forEach(r => sheet.appendRow(r));
      }
    } else if (t.name === 'Amortization') {
      applyAmortizationConditionalFormatting(sheet);
    } else if (t.name === 'Payments') {
      ensurePaymentsHeaders();
    }

    sheet.getRange(1, 1, 1, t.headers.length)
      .setFontWeight('bold')
      .setBackground('#0f2b5c')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);

    // Normalize sheet column count cleanly to exact schema headers
    const curMaxCols = sheet.getMaxColumns();
    if (curMaxCols < t.headers.length) {
      sheet.insertColumnsAfter(curMaxCols, t.headers.length - curMaxCols);
    } else if (curMaxCols > t.headers.length) {
      try {
        sheet.deleteColumns(t.headers.length + 1, curMaxCols - t.headers.length);
      } catch (e) {}
    }
  });

  // Initialize Users authentication sheet for Cashier & Admin access
  getOrCreateUsersSheet();

  // Flush so all base tables exist and are committed before Dashboard references them
  SpreadsheetApp.flush();

  // 2. Setup Dashboard Sheet
  let dashSheet = ss.getSheetByName('Dashboard');
  if (!dashSheet) {
    dashSheet = ss.insertSheet('Dashboard', 0);
  }

  // Dashboard requires 7 columns (A-C: Metrics, D: Spacer, E-G: Live Collections Radar)
  const targetDashCols = 7;
  const currentDashCols = dashSheet.getMaxColumns();
  if (currentDashCols < targetDashCols) {
    dashSheet.insertColumnsAfter(currentDashCols, targetDashCols - currentDashCols);
  } else if (currentDashCols > targetDashCols) {
    try {
      dashSheet.deleteColumns(targetDashCols + 1, currentDashCols - targetDashCols);
    } catch (e) {}
  }

  const dashHeaders = ['METRIC', 'VALUE', 'REMARKS'];
  const dashData = [
    ['Total Borrowers', '=COUNTA(Borrowers!A2:A)', 'Active registered members'],
    ['Total Active Loans', '=COUNTIF(Loans!K2:K, "Active")', 'Active portfolios'],
    ['Total Outstanding Balance', '=SUM(Loans!J2:J)', 'Collectible principal'],
    ['Total Principal Collected', '=SUMIF(Payments!A2:A, "<>*[VOIDED]*", Payments!E2:E)', 'Returned capital'],
    ['Total Interest Earned', '=SUMIF(Payments!A2:A, "<>*[VOIDED]*", Payments!F2:F)', 'Net interest revenue'],
    ['Total Penalties Collected', '=SUMIF(Payments!A2:A, "<>*[VOIDED]*", Payments!G2:G)', 'Late fees revenue'],
    ['Total Money Collected', '=SUMIF(Payments!A2:A, "<>*[VOIDED]*", Payments!I2:I)', 'Gross collections (Principal + Interest + Penalties)']
  ];

  dashSheet.getRange(1, 1, 1, dashHeaders.length).setValues([dashHeaders])
    .setFontWeight('bold')
    .setBackground('#0f2b5c')
    .setFontColor('#ffffff');
  dashSheet.getRange(2, 1, dashData.length, dashHeaders.length).setValues(dashData);

  if (dashSheet.getLastRow() > dashData.length + 1) {
    dashSheet.getRange(dashData.length + 2, 1, dashSheet.getLastRow() - (dashData.length + 1), dashHeaders.length).clearContent();
  }
  dashSheet.getRange('B4:B8').setNumberFormat('₱#,##0.00');

  // Setup Live Collections Radar in Columns E to G
  const radarHeaders = ['COLLECTIONS RADAR (TODAY & THIS WEEK)', 'VALUE', 'STATUS'];
  dashSheet.getRange('E1:G1').setValues([radarHeaders])
    .setFontWeight('bold')
    .setBackground('#0f2b5c')
    .setFontColor('#ffffff');

  const radarData = [
    ['Overdue (Within Grace Period)', 0, '1 to 30 days late (₱0 penalty)'],
    ['Overdue (Past Grace Period)', 0, '31+ days late (3% penalty applied)'],
    ['Accounts Due Today', 0, 'Scheduled today'],
    ['Upcoming Due (Next 7 Days)', 0, 'Due within upcoming 7 days'],
    ['Collections Efficiency Rate', '=IF((B4+B8)>0, TEXT(B8/(B4+B8)*100, "0.0") & "%", "100%")', 'Capital recovery index']
  ];
  dashSheet.getRange('E2:G6').setValues(radarData);
  dashSheet.getRange('E1:G6').setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
  dashSheet.getRange('F2:F6').setHorizontalAlignment('center');
  dashSheet.setColumnWidth(1, 220);
  dashSheet.setColumnWidth(2, 140);
  dashSheet.setColumnWidth(3, 240);
  dashSheet.setColumnWidth(5, 270);
  dashSheet.setColumnWidth(6, 110);
  dashSheet.setColumnWidth(7, 240);
  dashSheet.setFrozenRows(1);

  // Position Dashboard as the first tab
  ss.setActiveSheet(dashSheet);
  ss.moveActiveSheet(1);

  // Compute live values for Collections Radar
  updateDashboardCollectionsRadar(dashSheet);

  // Flush to commit dashboard changes
  SpreadsheetApp.flush();

  logAudit('SETUP', 'Initialized database tables');

  try {
    SpreadsheetApp.getUi().alert('Success! Database tables initialized successfully.');
  } catch (uiErr) {
    Logger.log('Initialized database tables successfully.');
  }
}

/**
 * REFRESH LIVE COLLECTIONS RADAR ON DASHBOARD
 * Synchronizes overdue (within & past grace), due today, and upcoming due (next 7 days) counts.
 */
function updateDashboardCollectionsRadar(dashSheet) {
  try {
    if (!dashSheet) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      dashSheet = ss.getSheetByName('Dashboard');
    }
    if (!dashSheet) return;

    const activeLoans = getActiveLoansList();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let withinGrace = 0;
    let pastGrace = 0;
    let dueToday = 0;
    let upcoming7Days = 0;

    activeLoans.forEach(loan => {
      if (!loan.dueDate) return;
      const parts = String(loan.dueDate).split('-');
      if (parts.length !== 3) return;
      const due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      due.setHours(0, 0, 0, 0);

      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        const daysLate = Math.abs(diffDays);
        if (daysLate <= 30) {
          withinGrace++;
        } else {
          pastGrace++;
        }
      } else if (diffDays === 0) {
        dueToday++;
      } else if (diffDays <= 7) {
        upcoming7Days++;
      }
    });

    dashSheet.getRange('F2').setValue(withinGrace);
    dashSheet.getRange('F3').setValue(pastGrace);
    dashSheet.getRange('F4').setValue(dueToday);
    dashSheet.getRange('F5').setValue(upcoming7Days);
  } catch (err) {
    Logger.log('updateDashboardCollectionsRadar error: ' + err.message);
  }
}

/**
 * 2. PROCESS NEW BORROWER REGISTRATION
 */
function processCreateBorrower(formData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (e) {
    throw new Error('System is busy processing another request. Please try again.');
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let borrowersSheet = ss.getSheetByName('Borrowers');

    if (!borrowersSheet) {
      setupDatabaseSheets();
      borrowersSheet = ss.getSheetByName('Borrowers');
    }

    const bId = 'BOR-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
    const dateJoined = new Date().toISOString().split('T')[0];

    const phoneVal = formData.phone ? (String(formData.phone).trim().startsWith('+') ? "'" + formData.phone : formData.phone) : '';
    const emailAddr = formData.email ? String(formData.email).trim() : '';

    borrowersSheet.appendRow([
      bId,
      formData.borrowerName,
      formData.address,
      phoneVal,
      emailAddr,
      dateJoined
    ]);

    // Send automated welcome & registration confirmation email via Gmail
    let emailSent = false;
    if (emailAddr && emailAddr.includes('@')) {
      const emailSubject = 'Welcome to Saint Joseph Multipurpose Cooperative - Member Registration [' + bId + ']';
      const emailBody = 
        'SAINT JOSEPH MULTIPURPOSE COOPERATIVE\n' +
        '==========================================\n' +
        'MEMBER / BORROWER REGISTRATION CONFIRMATION\n' +
        '==========================================\n\n' +
        'Dear ' + formData.borrowerName + ',\n\n' +
        'Welcome to Saint Joseph Multipurpose Cooperative! You have been successfully registered.\n\n' +
        'REGISTRATION DETAILS:\n' +
        '------------------------------------------\n' +
        'Borrower ID:     ' + bId + '\n' +
        'Member Name:     ' + formData.borrowerName + '\n' +
        'Contact Number:  ' + (formData.phone || 'N/A') + '\n' +
        'Home Address:    ' + (formData.address || 'N/A') + '\n' +
        'Date Registered: ' + dateJoined + '\n' +
        '------------------------------------------\n\n' +
        'IMPORTANT REMINDERS:\n' +
        'Payment receipts and account statements will be dispatched to this email address.\n\n' +
        'If you have any questions or need assistance, please feel free to reply to this email.\n\n' +
        'Saint Joseph Multipurpose Cooperative';

      try {
        sendCoopEmail(emailAddr, emailSubject, emailBody, {
          name: 'Saint Joseph Multipurpose Cooperative'
        });
        emailSent = true;
      } catch (e) {
        Logger.log('Could not send registration email to ' + emailAddr + ': ' + e.message);
      }
    }

    const emailNotice = emailSent ? ' (Welcome email sent to ' + emailAddr + ')' : '';
    logAudit('CREATE_BORROWER', 'Added borrower ' + formData.borrowerName + ' (' + bId + ')' + emailNotice);
    return { success: true, borrowerId: bId, emailSent: emailSent, email: emailAddr };
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

/**
 * DUAL-ENGINE EMAIL DISPATCHER (MailApp with GmailApp fallback)
 * Guarantees reliable email dispatch across both Gmail and Google Workspace accounts
 * with zero silent drops and complete error diagnostic visibility.
 */
function sendCoopEmail(recipient, subject, body, options) {
  if (!recipient || !String(recipient).includes('@')) {
    throw new Error('Invalid email recipient: ' + recipient);
  }
  options = options || {};
  let lastErr = null;

  // 1. Primary: MailApp (Standard Google Apps Script Mail Service, lower scope requirement)
  try {
    const opts = Object.assign({}, options);
    MailApp.sendEmail(recipient, subject, body, opts);
    return { success: true, service: 'MailApp' };
  } catch (err1) {
    lastErr = err1;
    Logger.log('MailApp.sendEmail error: ' + err1.message + ', trying GmailApp fallback...');
  }

  // 2. Fallback: GmailApp (Full Gmail API service)
  try {
    const opts = Object.assign({}, options);
    GmailApp.sendEmail(recipient, subject, body, opts);
    return { success: true, service: 'GmailApp' };
  } catch (err2) {
    lastErr = err2;
    Logger.log('GmailApp.sendEmail error: ' + err2.message);
  }

  throw new Error('Email delivery failed: ' + (lastErr ? lastErr.message : 'Unknown mail error'));
}

/**
 * UNIVERSAL ROUNDING POLICY: ROUND UP TO 2 DECIMAL PLACES (CENTAVO CEILING)
 * Prevents fractional loss and guarantees exact centavo precision across all financial calculations.
 */
function roundUp2(val) {
  if (val === undefined || val === null || val === '') return 0;
  const num = (typeof val === 'number') ? val : (parseFloat(String(val).replace(/[^0-9.-]/g, '')) || 0);
  if (isNaN(num)) return 0;
  return Math.ceil(Math.round((num + Number.EPSILON) * 1000000) / 10000) / 100;
}

/**
 * 3. ANNUAL DIMINISHING AMORTIZATION ENGINE
 */
function calculateAnnualDiminishingSchedule(loanAmount, months, monthlyRatePercent, startDateInput) {
  const rate = monthlyRatePercent / 100;
  const baseMonthlyPrincipal = roundUp2(loanAmount / months);
  const schedule = [];
  
  // Safely parse startDate whether string or Date object
  let startDate;
  if (startDateInput instanceof Date) {
    startDate = startDateInput;
  } else if (typeof startDateInput === 'string' && startDateInput.includes('-')) {
    const parts = startDateInput.split('-');
    startDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else {
    startDate = new Date(startDateInput || new Date());
  }

  let currentBalance = roundUp2(loanAmount);
  let yearlyStartingBalance = roundUp2(loanAmount);
  const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const grantMonthName = monthNames[startDate.getMonth()];

  const firstPaymentDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
  const baseYear = firstPaymentDate.getFullYear();

  // 1. Initial Grant Row (Row 0 / START) matching client sample 1-to-1
  schedule.push({
    monthIndex: 0,
    termYear: 'START',
    monthName: grantMonthName,
    principal: roundUp2(loanAmount),
    amortization: 0,
    principalBalance: roundUp2(loanAmount),
    principalPayment: 0,
    interestPayment: 0,
    monthlyAmortization: 0,
    penalty: 0,
    amountPaid: 0,
    remainingBalance: roundUp2(loanAmount),
    status: 'Loan Granted (' + monthlyRatePercent + '%)'
  });

  for (let m = 1; m <= months; m++) {
    // The Borrower starts paying the next month after the loan grant date (e.g. Loan Date in April -> Payment 1 in May)
    const curDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1);
    const yearIndex = Math.floor((m - 1) / 12) + 1;
    const termStartYear = baseYear + (yearIndex - 1);
    const termEndYear = termStartYear + 1;
    const termYear = yearIndex + "YR (" + termStartYear + "-" + termEndYear + ")";
    
    if ((m - 1) % 12 === 0) {
      yearlyStartingBalance = roundUp2(loanAmount - ((yearIndex - 1) * 12 * baseMonthlyPrincipal));
      if (yearlyStartingBalance < 0) yearlyStartingBalance = 0;
    }

    // Amortization (principal installment) remains constant across all months except final month which settles exact remainder
    const isFinalMonth = (m === months);
    const amortization = isFinalMonth ? currentBalance : baseMonthlyPrincipal;
    const interestPayment = roundUp2(yearlyStartingBalance * rate);
    const monthlyAmortization = roundUp2(amortization + interestPayment);
    // Balance after deducting amortization
    const principalBalance = isFinalMonth ? 0 : roundUp2(currentBalance - amortization);

    schedule.push({
      monthIndex: m,
      termYear: termYear,
      monthName: monthNames[curDate.getMonth()],
      principal: principalBalance, // PRINCIPAL column shows ending balance
      amortization: amortization,
      principalBalance: principalBalance,
      principalPayment: amortization,
      interestPayment: interestPayment,
      monthlyAmortization: monthlyAmortization,
      penalty: 0,
      amountPaid: 0,
      remainingBalance: principalBalance,
      status: 'Pending'
    });

    currentBalance = principalBalance;
  }
  
  return schedule;
}

/**
 * 4. BACKEND API FOR BORROWERS & LOANS
 */
function getBorrowersList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Borrowers');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const header = data.shift();

  const isNewSchema = header && header[1] === 'Borrower Name';
  const emailColIdx = header ? header.indexOf('Email') : -1;

  return data
    .filter(r => r[0] && r[0].toString().trim() !== '')
    .map(r => {
      let bName = '';
      let bEmail = '';
      if (isNewSchema || r.length <= 6) {
        bName = String(r[1] || '').trim();
        bEmail = emailColIdx !== -1 ? String(r[emailColIdx] || '').trim() : String(r[4] || '').trim();
      } else {
        bName = ((r[2] || '') + ' ' + (r[1] || '')).trim() || String(r[0]);
        bEmail = emailColIdx !== -1 ? String(r[emailColIdx] || '').trim() : String(r[6] || '').trim();
      }
      return {
        id: String(r[0]),
        name: bName || String(r[0]),
        email: bEmail
      };
    });
}

function getLoanTypesList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('LoanTypes');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  data.shift();

  // Safely extract Type ID and Name regardless of whether 2, 4, or 6 columns exist
  return data
    .filter(r => r[0] && r[1] && String(r[1]).trim() !== '')
    .map(r => ({
      id: String(r[0]),
      name: String(r[1]).trim()
    }));
}

function safeParseNumber(val, defaultVal) {
  if (defaultVal === undefined) defaultVal = 0;
  if (typeof val === 'number') {
    return isNaN(val) ? defaultVal : val;
  }
  if (!val) return defaultVal;
  const clean = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? defaultVal : num;
}

function safeParseDate(val) {
  if (val instanceof Date && !isNaN(val.getTime())) {
    return new Date(val.getTime());
  }
  if (val) {
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    const parts = String(val).split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(d.getTime())) return d;
      } else if (parts[2].length === 4) {
        const p0 = parseInt(parts[0], 10);
        const p1 = parseInt(parts[1], 10);
        const p2 = parseInt(parts[2], 10);
        const d = (p0 > 12) ? new Date(p2, p1 - 1, p0) : new Date(p2, p0 - 1, p1);
        if (!isNaN(d.getTime())) return d;
      }
    }
  }
  return new Date();
}

function formatDateISO(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    d = new Date();
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function applyAmortizationConditionalFormatting(sheet) {
  if (!sheet) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    sheet = ss.getSheetByName('Amortization');
  }
  if (!sheet) return;

  sheet.clearConditionalFormatRules();

  const curHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  const statusColIdx = curHeaders.indexOf('Status') !== -1 ? (curHeaders.indexOf('Status') + 1) : 12;
  const maxRows = Math.max(sheet.getMaxRows(), 2);
  const statusRange = sheet.getRange(2, statusColIdx, maxRows - 1, 1);

  statusRange.setHorizontalAlignment('center');

  const rules = [];

  // Rule 1: Paid -> Very light pastel green (#f0fdf4), dark green text (#166534)
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Paid')
    .setBackground('#f0fdf4')
    .setFontColor('#166534')
    .setBold(true)
    .setRanges([statusRange])
    .build());

  // Rule 2: Underpaid -> Very light pastel yellow (#fef9c3), dark yellow-amber text (#854d0e)
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Underpaid')
    .setBackground('#fef9c3')
    .setFontColor('#854d0e')
    .setBold(true)
    .setRanges([statusRange])
    .build());

  // Rule 3: Overdue -> Very light pastel red (#fef2f2), dark red text (#991b1b)
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Overdue')
    .setBackground('#fef2f2')
    .setFontColor('#991b1b')
    .setBold(true)
    .setRanges([statusRange])
    .build());

  // Rule 4: Overdue prefix (e.g. 'Overdue by X days')
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextStartsWith('Overdue')
    .setBackground('#fef2f2')
    .setFontColor('#991b1b')
    .setBold(true)
    .setRanges([statusRange])
    .build());

  // Rule 5: Loan Granted (START row) -> Soft slate (#f1f5f9), slate text (#475569)
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextStartsWith('Loan Granted')
    .setBackground('#f1f5f9')
    .setFontColor('#475569')
    .setRanges([statusRange])
    .build());

  sheet.setConditionalFormatRules(rules);
}

function ensureAmortizationHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const amortSheet = ss.getSheetByName('Amortization');
  if (!amortSheet) return;
  const targetHeaders = ['Loan ID', 'Borrower Name', 'Month #', 'Term Year', 'Month Name', 'Principal', 'Amortization', 'Interest Pay', 'Monthly Amort', 'Penalty', 'Amount Paid', 'Status'];
  const curHeaders = amortSheet.getRange(1, 1, 1, Math.max(amortSheet.getLastColumn(), 1)).getValues()[0];

  // If existing sheet has Advanced column, remove it cleanly
  const advIdx = curHeaders.indexOf('Advanced');
  if (advIdx !== -1) {
    amortSheet.deleteColumn(advIdx + 1);
  }

  // Refresh headers after possible deletion
  const updatedHeaders = amortSheet.getRange(1, 1, 1, Math.max(amortSheet.getLastColumn(), 1)).getValues()[0];

  // If missing Penalty, insert before Amount Paid
  if (updatedHeaders.indexOf('Penalty') === -1 && updatedHeaders.indexOf('Amount Paid') !== -1) {
    const amtPaidColIdx = updatedHeaders.indexOf('Amount Paid');
    amortSheet.insertColumnBefore(amtPaidColIdx + 1);
    amortSheet.getRange(1, amtPaidColIdx + 1).setValue('Penalty');
    const lastRow = amortSheet.getLastRow();
    if (lastRow > 1) {
      const penRange = amortSheet.getRange(2, amtPaidColIdx + 1, lastRow - 1, 1);
      const zeros = [];
      for (let z = 0; z < lastRow - 1; z++) zeros.push([0]);
      penRange.setValues(zeros);
      penRange.setNumberFormat('₱#,##0.00');
    }
  }

  amortSheet.getRange(1, 1, 1, targetHeaders.length).setValues([targetHeaders])
    .setFontWeight('bold')
    .setBackground('#0f2b5c')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  if (amortSheet.getLastColumn() > targetHeaders.length) {
    try {
      amortSheet.deleteColumns(targetHeaders.length + 1, amortSheet.getLastColumn() - targetHeaders.length);
    } catch (e) {}
  }

  // Apply light pastel conditional formatting rules to the Status column
  applyAmortizationConditionalFormatting(amortSheet);
}

function ensureLoansPenaltyColumn() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Loans');
  if (!sheet) return;
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  if (headers.indexOf('Penalty (%)') === -1) {
    const rateIdx = headers.indexOf('Rate (%)');
    const insertAfterCol = rateIdx !== -1 ? (rateIdx + 1) : 7;
    sheet.insertColumnAfter(insertAfterCol);
    sheet.getRange(1, insertAfterCol + 1).setValue('Penalty (%)')
      .setFontWeight('bold')
      .setBackground('#0f2b5c')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');

    const lastColWithData = sheet.getLastColumn();
    if (lastColWithData > 11) {
      try {
        sheet.deleteColumns(12, lastColWithData - 11);
      } catch (e) {}
    }
  }
}

function ensurePaymentsHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Payments');
  if (!sheet) return;
  const targetHeaders = [
    'Receipt No', 'Loan ID', 'Borrower Name', 'Date Paid',
    'Principal Paid', 'Interest Paid', 'Penalty Paid', 'Advance Paid',
    'Amount Paid', 'Principal Balance After', 'Amortization Balance After', 'Method'
  ];
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const curHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  const isMatch = curHeaders.length >= targetHeaders.length && targetHeaders.every((h, i) => curHeaders[i] === h);
  if (isMatch) return;

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const allData = sheet.getDataRange().getValues();
    const oldHead = allData[0];
    const hMap = {};
    oldHead.forEach((h, idx) => { if (h) hMap[String(h).trim().toLowerCase()] = idx; });

    const getVal = (row, key, def) => {
      const idx = hMap[key];
      return (idx !== undefined && row[idx] !== undefined && row[idx] !== '') ? row[idx] : def;
    };

    const newRows = [];
    for (let r = 1; r < allData.length; r++) {
      const row = allData[r];
      if (!row[0]) continue;
      newRows.push([
        getVal(row, 'receipt no', row[0]),
        getVal(row, 'loan id', row[1] || ''),
        getVal(row, 'borrower name', row[2] || ''),
        getVal(row, 'date paid', row[3] || ''),
        safeParseNumber(getVal(row, 'principal paid', 0), 0),
        safeParseNumber(getVal(row, 'interest paid', 0), 0),
        safeParseNumber(getVal(row, 'penalty paid', 0), 0),
        safeParseNumber(getVal(row, 'advance paid', 0), 0),
        safeParseNumber(getVal(row, 'amount paid', 0), 0),
        safeParseNumber(getVal(row, 'principal balance after', getVal(row, 'balance after', 0)), 0),
        safeParseNumber(getVal(row, 'amortization balance after', 0), 0),
        String(getVal(row, 'method', 'Cash') || '').trim()
      ]);
    }

    sheet.clear();
    sheet.appendRow(targetHeaders);
    newRows.forEach(nr => sheet.appendRow(nr));
  } else {
    sheet.clear();
    sheet.appendRow(targetHeaders);
  }

  sheet.getRange(1, 1, 1, targetHeaders.length)
    .setFontWeight('bold')
    .setBackground('#0f2b5c')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');
  sheet.setFrozenRows(1);

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 5, sheet.getLastRow() - 1, 7).setNumberFormat('₱#,##0.00');
  }

  const lastColWithData = sheet.getLastColumn();
  if (lastColWithData > targetHeaders.length) {
    try {
      sheet.deleteColumns(targetHeaders.length + 1, lastColWithData - targetHeaders.length);
    } catch (e) {}
  }
}

function ensurePaymentsPenaltyColumn() {
  ensurePaymentsHeaders();
}

function getActiveLoansList() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Loans');
    if (!sheet) return [];
    if (sheet.getLastRow() <= 1) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    const headerRow = data.shift();

    // Map column headers dynamically and case-insensitively
    const headerMap = {};
    headerRow.forEach((h, idx) => {
      if (h) headerMap[String(h).trim().toLowerCase()] = idx;
    });

    const idColIdx = headerMap['loan id'] !== undefined ? headerMap['loan id'] : 0;
    const bIdColIdx = headerMap['borrower id'] !== undefined ? headerMap['borrower id'] : 1;
    const bNameColIdx = headerMap['borrower name'] !== undefined ? headerMap['borrower name'] : 2;
    const typeColIdx = headerMap['type'] !== undefined ? headerMap['type'] : 3;
    const amtColIdx = headerMap['amount (₱)'] !== undefined ? headerMap['amount (₱)'] : (headerMap['amount'] !== undefined ? headerMap['amount'] : 4);
    const mosColIdx = headerMap['months'] !== undefined ? headerMap['months'] : 5;
    const rateColIdx = headerMap['rate (%)'] !== undefined ? headerMap['rate (%)'] : (headerMap['rate'] !== undefined ? headerMap['rate'] : 6);
    const penaltyColIdx = headerMap['penalty (%)'] !== undefined ? headerMap['penalty (%)'] : (headerMap['penalty'] !== undefined ? headerMap['penalty'] : 7);
    const dateColIdx = headerMap['date granted'] !== undefined ? headerMap['date granted'] : 8;
    const balColIdx = headerMap['remaining bal'] !== undefined ? headerMap['remaining bal'] : 9;
    const statusColIdx = headerMap['status'] !== undefined ? headerMap['status'] : (headerRow.length - 1);

    // Lookup borrower email from Borrowers sheet
    const borrowersSheet = ss.getSheetByName('Borrowers');
    const borrowerEmailMap = {};
    if (borrowersSheet && borrowersSheet.getLastRow() > 1) {
      const bData = borrowersSheet.getDataRange().getValues();
      const bHeaders = bData[0];
      const bMap = {};
      bHeaders.forEach((h, idx) => {
        if (h) bMap[String(h).trim().toLowerCase()] = idx;
      });
      const bIdIdx = bMap['borrower id'] !== undefined ? bMap['borrower id'] : 0;
      const emailIdx = bMap['email'] !== undefined ? bMap['email'] : 4;
      for (let i = 1; i < bData.length; i++) {
        const bId = String(bData[i][bIdIdx] || '').trim();
        if (bId) {
          borrowerEmailMap[bId] = String(bData[i][emailIdx] || '').trim();
        }
      }
    }

    // Lookup pending amortization installments
    const amortSheet = ss.getSheetByName('Amortization');
    const amortMap = {};
    if (amortSheet && amortSheet.getLastRow() > 1) {
      const aData = amortSheet.getDataRange().getValues();
      const aHeaders = aData[0];
      const aMap = {};
      aHeaders.forEach((h, idx) => {
        if (h) aMap[String(h).trim().toLowerCase()] = idx;
      });
      const aStatusIdx = aMap['status'] !== undefined ? aMap['status'] : (aHeaders.length - 1);
      const aMonthIdx = aMap['month #'] !== undefined ? aMap['month #'] : 2;
      const aMonthNameIdx = aMap['month name'] !== undefined ? aMap['month name'] : 4;
      const aPrinPayIdx = aMap['amortization'] !== undefined ? aMap['amortization'] : (aMap['principal pay'] !== undefined ? aMap['principal pay'] : 6);
      const aIntPayIdx = aMap['interest pay'] !== undefined ? aMap['interest pay'] : 7;
      const aAmortIdx = aMap['monthly amort'] !== undefined ? aMap['monthly amort'] : 8;
      const aMonthlyAmortIdx = aAmortIdx;

      for (let j = 1; j < aData.length; j++) {
        const row = aData[j];
        const lId = String(row[0] || '').trim();
        const status = String(row[aStatusIdx] || '').trim().toLowerCase();
        const monthVal = String(row[aMonthIdx] || '').trim().toLowerCase();
        if (lId && (status === 'pending' || status === 'underpaid') && monthVal !== 'start' && monthVal !== '0') {
          const mIdx = safeParseNumber(row[aMonthIdx], 1);
          const mName = String(row[aMonthNameIdx] || '').trim();
          const iPay = roundUp2(safeParseNumber(row[aIntPayIdx], 0));
          const mAmort = roundUp2(safeParseNumber(row[aMonthlyAmortIdx], 0));
          const basePrin = roundUp2(safeParseNumber(row[aPrinPayIdx], 0));
          const effPrin = Math.max(0, roundUp2(mAmort - iPay));
          const isUnderpaid = (status === 'underpaid');

          if (!amortMap[lId]) {
            amortMap[lId] = {
              monthIndex: mIdx,
              monthName: mName,
              status: status,
              isUnderpaid: isUnderpaid,
              principalPayment: effPrin,
              interestPayment: iPay,
              monthlyAmortization: mAmort,
              basePrincipal: basePrin,
              pendingInstallments: []
            };
          }
          amortMap[lId].pendingInstallments.push({
            monthIndex: mIdx,
            monthName: mName,
            status: status,
            isUnderpaid: isUnderpaid,
            interestPayment: iPay,
            monthlyAmortization: mAmort,
            basePrincipal: basePrin,
            principalPayment: effPrin
          });
        }
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const active = [];
    for (let i = 0; i < data.length; i++) {
      const r = data[i];
      const loanId = String(r[idColIdx] || '').trim();
      const statusVal = String(r[statusColIdx] || '').trim().toLowerCase();
      const isStatusActive = (statusVal === 'active' || statusVal === 'current' || statusVal === 'ongoing' || statusVal === 'open' || statusVal === 'approved');
      if (!loanId || !isStatusActive) continue;

      const startDate = safeParseDate(r[dateColIdx]);
      const startDateStr = formatDateISO(startDate);
      const loanAmt = roundUp2(safeParseNumber(r[amtColIdx], 0));
      const loanMos = Math.max(1, parseInt(r[mosColIdx], 10) || 1);
      const loanRt = safeParseNumber(r[rateColIdx], 0);
      const dynPrincipal = roundUp2(loanAmt / loanMos);
      const dynInterest = roundUp2(loanAmt * (loanRt / 100));
      const dynAmort = roundUp2(dynPrincipal + dynInterest);

      const pendingAmort = amortMap[loanId] || {
        monthIndex: 1,
        monthName: '',
        principalPayment: dynPrincipal,
        interestPayment: dynInterest,
        monthlyAmortization: dynAmort,
        basePrincipal: dynPrincipal,
        pendingInstallments: [{
          monthIndex: 1,
          monthName: '',
          interestPayment: dynInterest,
          monthlyAmortization: dynAmort,
          basePrincipal: dynPrincipal,
          principalPayment: dynPrincipal
        }]
      };

      const monthOffset = parseInt(pendingAmort.monthIndex, 10) || 1;
      // Edge Case #4: Leap year & month-end date clamping (e.g. Jan 31 -> Feb 28/29, not March 3)
      const targetYear = startDate.getFullYear();
      const targetMonth = startDate.getMonth() + monthOffset;
      const targetDay = startDate.getDate();
      const maxDaysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const clampedDay = Math.min(targetDay, maxDaysInTargetMonth);
      let dueDate = new Date(targetYear, targetMonth, clampedDay);
      if (isNaN(dueDate.getTime())) {
        dueDate = new Date();
      }
      dueDate.setHours(0, 0, 0, 0);
      const dueDateStr = formatDateISO(dueDate);

      const diffTime = today.getTime() - dueDate.getTime();
      const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      const isOverdue = daysOverdue > 0;
      const isGracePeriod = (daysOverdue > 0 && daysOverdue <= 30);
      const isPastGracePeriod = (daysOverdue > 30);
      const graceDaysLeft = Math.max(0, 30 - daysOverdue);

      const isDueToday = (dueDate.getTime() === today.getTime());
      const diffUntilDue = dueDate.getTime() - today.getTime();
      const daysUntilDue = Math.max(0, Math.ceil(diffUntilDue / (1000 * 60 * 60 * 24)));
      const isUpcoming = (daysUntilDue > 0 && daysUntilDue <= 7);

      const penaltyRate = (penaltyColIdx !== -1 && r[penaltyColIdx] !== undefined && r[penaltyColIdx] !== '')
        ? safeParseNumber(r[penaltyColIdx], 3.0)
        : 3.0;

      // Client Confirmed Policy:
      // 1. Universal 30-day grace period for all overdue loans (whether 0.00 payment or deficit amount)
      // 2. 3% penalty takes effect ONLY after the 30-day grace period (daysOverdue > 30)
      // 3. Penalty basis is strictly the unpaid deficit (remaining monthly amortization) for underpaid rows, or full scheduled monthly for unpaid rows
      const fullScheduledMonthly = (pendingAmort.basePrincipal > 0 && pendingAmort.interestPayment > 0)
        ? roundUp2(pendingAmort.basePrincipal + pendingAmort.interestPayment)
        : roundUp2(pendingAmort.monthlyAmortization);

      const penaltyBasis = pendingAmort.isUnderpaid
        ? safeParseNumber(pendingAmort.monthlyAmortization, 0)
        : fullScheduledMonthly;

      const defaultPenalty = isPastGracePeriod
        ? roundUp2(penaltyBasis * (penaltyRate / 100))
        : 0;

      const remainingBal = (r[balColIdx] !== undefined && r[balColIdx] !== '')
        ? roundUp2(safeParseNumber(r[balColIdx], loanAmt))
        : loanAmt;

      const borrowerId = String(r[bIdColIdx] || '').trim();

      active.push({
        loanId: loanId,
        borrowerId: borrowerId,
        borrowerName: String(r[bNameColIdx] || '').trim(),
        loanType: String(r[typeColIdx] || '').trim(),
        amount: loanAmt,
        remainingBalance: remainingBal,
        email: borrowerEmailMap[borrowerId] || '',
        dateGranted: startDateStr,
        dueDate: dueDateStr,
        monthIndex: pendingAmort.monthIndex,
        monthName: pendingAmort.monthName || '',
        status: pendingAmort.status || 'pending',
        isUnderpaid: !!pendingAmort.isUnderpaid,
        expectedInterest: pendingAmort.interestPayment,
        expectedPrincipal: pendingAmort.principalPayment,
        basePrincipal: pendingAmort.basePrincipal,
        monthlyAmortization: pendingAmort.monthlyAmortization,
        fullScheduledMonthly: fullScheduledMonthly,
        pendingInstallments: pendingAmort.pendingInstallments || [],
        penaltyRate: penaltyRate,
        isOverdue: isOverdue,
        isGracePeriod: isGracePeriod,
        isPastGracePeriod: isPastGracePeriod,
        graceDaysLeft: graceDaysLeft,
        isDueToday: isDueToday,
        isUpcoming: isUpcoming,
        daysUntilDue: daysUntilDue,
        penaltyBasis: penaltyBasis,
        daysOverdue: daysOverdue,
        defaultPenalty: defaultPenalty
      });
    }

    return active;
  } catch (err) {
    Logger.log('getActiveLoansList Error: ' + err.toString() + (err.stack ? ('\n' + err.stack) : ''));
    return [];
  }
}

/**
 * 5. PROCESS NEW LOAN CREATION
 */
function processCreateLoan(formData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (e) {
    throw new Error('System is busy processing another request. Please try again.');
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const loansSheet = ss.getSheetByName('Loans');
    const amortSheet = ss.getSheetByName('Amortization');

    const loanId = 'LN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const amount = safeParseNumber(formData.amount, 0);
    const months = parseInt(String(formData.months).replace(/[^0-9]/g, ''), 10) || 0;
    const rate = safeParseNumber(formData.rate, 0);
    const startDate = safeParseDate(formData.startDate) || new Date(formData.startDate);
    const penaltyRate = formData.penaltyRate !== undefined ? safeParseNumber(formData.penaltyRate, 3.0) : 3.0;

    const schedule = calculateAnnualDiminishingSchedule(amount, months, rate, startDate);

    ensureLoansPenaltyColumn();
    const lHeaders = loansSheet.getRange(1, 1, 1, Math.max(loansSheet.getLastColumn(), 1)).getValues()[0];
    const hasPenaltyCol = lHeaders.indexOf('Penalty (%)') !== -1;

    if (hasPenaltyCol) {
      loansSheet.appendRow([
        loanId, formData.borrowerId, formData.borrowerName, formData.loanType,
        amount, months, rate, penaltyRate, formData.startDate, amount, 'Active'
      ]);
    } else {
      loansSheet.appendRow([
        loanId, formData.borrowerId, formData.borrowerName, formData.loanType,
        amount, months, rate, formData.startDate, amount, 'Active'
      ]);
    }

    ensureAmortizationHeaders();
    schedule.forEach(row => {
      amortSheet.appendRow([
        loanId,
        formData.borrowerName,
        row.monthIndex === 0 ? 'START' : row.monthIndex,
        row.termYear,
        row.monthName,
        row.principal !== undefined ? row.principal : row.principalBalance,
        row.amortization !== undefined ? row.amortization : row.principalPayment,
        row.interestPayment,
        row.monthlyAmortization,
        row.penalty !== undefined ? row.penalty : 0,
        row.amountPaid !== undefined ? row.amountPaid : 0,
        row.status || 'Pending'
      ]);
    });
    applyAmortizationConditionalFormatting(amortSheet);

    // Automatically look up borrower email and dispatch Loan Approval & Disclosure Notice with Amortization PDF
    let emailSent = false;
    let borrowerEmail = '';
    const borrowersSheet = ss.getSheetByName('Borrowers');
    if (borrowersSheet && borrowersSheet.getLastRow() > 1) {
      const bData = borrowersSheet.getDataRange().getValues();
      const bHeaders = bData[0] || [];
      const bIdIdx = bHeaders.indexOf('Borrower ID') !== -1 ? bHeaders.indexOf('Borrower ID') : 0;
      const bEmailIdx = bHeaders.indexOf('Email Address') !== -1 ? bHeaders.indexOf('Email Address') : (bHeaders.indexOf('Email') !== -1 ? bHeaders.indexOf('Email') : 4);
      
      const targetBId = String(formData.borrowerId || '').trim().toLowerCase();
      for (let i = 1; i < bData.length; i++) {
        if (String(bData[i][bIdIdx] || '').trim().toLowerCase() === targetBId) {
          borrowerEmail = String(bData[i][bEmailIdx] || '').trim();
          break;
        }
      }
    }

    if (borrowerEmail && borrowerEmail.includes('@')) {
      const firstDue = (schedule && schedule.length > 0 && schedule[0].monthName) ? schedule[0].monthName : 'Next Month';
      const initialMonthly = (schedule && schedule.length > 0) ? Number(schedule[0].monthlyAmortization || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
      const fmtAmount = Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const emailSubject = 'Loan Approval & Disclosure Notice [' + loanId + '] - Saint Joseph Multipurpose Cooperative';
      const emailBody = 
        'SAINT JOSEPH MULTIPURPOSE COOPERATIVE\n' +
        '==========================================\n' +
        'LOAN APPROVAL & DISCLOSURE STATEMENT\n' +
        '==========================================\n\n' +
        'Dear ' + formData.borrowerName + ',\n\n' +
        'We are pleased to inform you that your loan application has been approved and disbursed.\n\n' +
        'LOAN ACCOUNT DETAILS:\n' +
        '------------------------------------------\n' +
        'Loan ID:             ' + loanId + '\n' +
        'Borrower ID:         ' + formData.borrowerId + '\n' +
        'Member Name:         ' + formData.borrowerName + '\n' +
        'Loan Category:       ' + formData.loanType + '\n' +
        'Principal Amount:    PHP ' + fmtAmount + '\n' +
        'Term / Tenure:       ' + months + ' Months\n' +
        'Monthly Interest:    ' + rate + '%\n' +
        'Monthly Penalty:     ' + penaltyRate + '% (after 30-day grace period)\n' +
        'Date Granted:        ' + formData.startDate + '\n' +
        'First Due Date:      ' + firstDue + '\n' +
        'Initial Monthly Due: PHP ' + initialMonthly + '\n' +
        '------------------------------------------\n\n' +
        'Attached to this email is your official Amortization Schedule (PDF) detailing monthly due dates and principal/interest breakdowns.\n\n' +
        'IMPORTANT REMINDERS:\n' +
        '- Payments are due monthly according to your amortization schedule.\n' +
        '- Official payment receipts will be emailed upon each successful payment.\n' +
        '- If you have questions about your loan, please visit the cooperative office or reply to this email.\n\n' +
        'Saint Joseph Multipurpose Cooperative';

      const emailOpts = {
        name: 'Saint Joseph Multipurpose Cooperative'
      };

      try {
        const pdfBlob = generateAmortizationPdfBlob(loanId);
        if (pdfBlob) {
          emailOpts.attachments = [pdfBlob];
        }
      } catch (pdfErr) {
        Logger.log('Could not generate PDF attachment for new loan email: ' + pdfErr.message);
      }

      try {
        sendCoopEmail(borrowerEmail, emailSubject, emailBody, emailOpts);
        emailSent = true;
      } catch (mailErr) {
        Logger.log('Could not send loan approval email to ' + borrowerEmail + ': ' + mailErr.message);
      }
    }

    const emailNotice = emailSent ? ' (Notice & PDF emailed to ' + borrowerEmail + ')' : '';
    logAudit('CREATE_LOAN', 'Created loan ' + loanId + ' for ' + formData.borrowerName + ' (Rate: ' + rate + '%, Penalty: ' + penaltyRate + '%)' + emailNotice);
    try { updateDashboardCollectionsRadar(); } catch (e) {}
    return { success: true, loanId: loanId, emailSent: emailSent, email: borrowerEmail };
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

/**
 * 6. PROCESS PAYMENT WITH AUTOMATIC WATERFALL ALLOCATION (PENALTY -> INTEREST -> PRINCIPAL)
 */
function processRecordPayment(formData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (e) {
    throw new Error('System is busy processing another transaction. Please try again in a moment.');
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const paymentsSheet = ss.getSheetByName('Payments');
  const loansSheet = ss.getSheetByName('Loans');
  const amortSheet = ss.getSheetByName('Amortization');

  const receiptNo = 'OR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const amountPaid = safeParseNumber(formData.amountPaid, 0);
  const loanId = formData.loanId;
  const paymentDate = formData.paymentDate || new Date().toISOString().split('T')[0];

  const loanData = loansSheet.getDataRange().getValues();
  const loanHeaders = loanData[0];
  const bIdIdx = loanHeaders.indexOf('Borrower ID') !== -1 ? loanHeaders.indexOf('Borrower ID') : 1;
  const balIdx = loanHeaders.indexOf('Remaining Bal') !== -1 ? loanHeaders.indexOf('Remaining Bal') : (loanHeaders.length >= 11 ? 9 : 8);
  const nameIdx = loanHeaders.indexOf('Borrower Name') !== -1 ? loanHeaders.indexOf('Borrower Name') : 2;

  let loanRowIndex = -1;
  let borrowerId = '';
  let borrowerName = '';
  let currentBalance = 0;

  for (let i = 1; i < loanData.length; i++) {
    if (String(loanData[i][0]).trim() === String(loanId).trim()) {
      loanRowIndex = i + 1;
      borrowerId = String(loanData[i][bIdIdx] || '').trim();
      borrowerName = loanData[i][nameIdx] || '';
      currentBalance = safeParseNumber(loanData[i][balIdx], 0);
      break;
    }
  }

  if (loanRowIndex === -1) {
    throw new Error('Selected loan "' + loanId + '" was not found in the Loans database.');
  }

  // Automatically look up borrower email from the Borrowers sheet
  let borrowerEmail = (formData && formData.email) ? String(formData.email).trim() : '';
  if (!borrowerEmail && borrowerId) {
    const borrowersSheet = ss.getSheetByName('Borrowers');
    if (borrowersSheet && borrowersSheet.getLastRow() > 1) {
      const bData = borrowersSheet.getDataRange().getValues();
      const bHeaders = bData[0];
      const borIdIdx = bHeaders.indexOf('Borrower ID') !== -1 ? bHeaders.indexOf('Borrower ID') : 0;
      const borEmailIdx = bHeaders.indexOf('Email') !== -1 ? bHeaders.indexOf('Email') : (bHeaders.length <= 6 ? 4 : 6);
      for (let b = 1; b < bData.length; b++) {
        if (String(bData[b][borIdIdx]).trim() === borrowerId) {
          borrowerEmail = String(bData[b][borEmailIdx] || '').trim();
          break;
        }
      }
    }
  }

  // 1. Determine pending amortization installments for this loan
  const amortData = amortSheet.getDataRange().getValues();
  const aHeaders = amortData[0];
  const aStatusIdx = aHeaders.indexOf('Status') !== -1 ? aHeaders.indexOf('Status') : (aHeaders.length - 1);
  const aIntIdx = aHeaders.indexOf('Interest Pay') !== -1 ? aHeaders.indexOf('Interest Pay') : 7;
  const aAmortColIdx = aHeaders.indexOf('Amortization') !== -1 ? aHeaders.indexOf('Amortization') : (aHeaders.indexOf('Principal Pay') !== -1 ? aHeaders.indexOf('Principal Pay') : 6);
  const aPrinColIdx = aHeaders.indexOf('Principal') !== -1 ? aHeaders.indexOf('Principal') : (aHeaders.indexOf('Principal Bal') !== -1 ? aHeaders.indexOf('Principal Bal') : 5);
  const aMonthlyAmortIdx = aHeaders.indexOf('Monthly Amort') !== -1 ? aHeaders.indexOf('Monthly Amort') : 8;
  const aPenColIdx = aHeaders.indexOf('Penalty');
  const aAmtPaidColIdx = aHeaders.indexOf('Amount Paid') !== -1 ? aHeaders.indexOf('Amount Paid') : 10;
  const aMonthNumIdx = aHeaders.indexOf('Month #') !== -1 ? aHeaders.indexOf('Month #') : 2;

  const pendingRows = [];
  for (let j = 1; j < amortData.length; j++) {
    const lId = String(amortData[j][0] || '').trim();
    const statusVal = String(amortData[j][aStatusIdx] || '').trim();
    const mNum = String(amortData[j][aMonthNumIdx] || '').trim().toLowerCase();
    const isUnsettled = (statusVal.toLowerCase() === 'pending' || statusVal.toLowerCase() === 'underpaid');
    if (lId === String(loanId).trim() && isUnsettled && mNum !== 'start' && mNum !== '0') {
      pendingRows.push({
        sheetRowIdx: j + 1,
        dataIdx: j,
        monthNum: amortData[j][aMonthNumIdx],
        basePrincipal: safeParseNumber(amortData[j][aAmortColIdx], 0),
        interestPay: safeParseNumber(amortData[j][aIntIdx], 0),
        monthlyAmort: safeParseNumber(amortData[j][aMonthlyAmortIdx], 0),
        currentPrincipal: safeParseNumber(amortData[j][aPrinColIdx], 0),
        existingAmountPaid: aAmtPaidColIdx !== -1 ? safeParseNumber(amortData[j][aAmtPaidColIdx], 0) : 0,
        existingPenaltyPaid: aPenColIdx !== -1 ? safeParseNumber(amortData[j][aPenColIdx], 0) : 0
      });
    }
  }

  // 2. Waterfall allocation: Penalty first -> Multi-Month / Advance Installments
  const requestedPenalty = safeParseNumber(formData.penaltyPaid, 0);
  const penaltyPaid = roundUp2(Math.min(amountPaid, requestedPenalty));
  let remFunds = Math.max(0, roundUp2(amountPaid - penaltyPaid));

  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  const settledMonths = [];
  let advanceCredited = 0;
  let advanceMonthNum = '';
  let advanceNextMonthlyAmort = 0;
  const updatesToAmortSheet = [];

  if (pendingRows.length > 0) {
    const nextPendingInt = roundUp2(pendingRows[0].interestPay || 0);
    const isFullPrincipalPayoff = (remFunds >= currentBalance + nextPendingInt) || (remFunds >= currentBalance);

    if (isFullPrincipalPayoff) {
      // Early Full Payoff of entire loan principal!
      const intToPay = roundUp2(Math.min(remFunds, nextPendingInt));
      totalInterestPaid = intToPay;
      totalPrincipalPaid = currentBalance;
      remFunds = Math.max(0, roundUp2(remFunds - (intToPay + currentBalance)));
      pendingRows.forEach((r, idx) => {
        updatesToAmortSheet.push({
          type: 'full_paid',
          rowIdx: r.sheetRowIdx,
          amountPaid: idx === 0 ? roundUp2(r.existingAmountPaid + amountPaid) : r.existingAmountPaid,
          prinPaid: 0,
          penaltyPaid: idx === 0 ? roundUp2(r.existingPenaltyPaid + penaltyPaid) : r.existingPenaltyPaid
        });
        settledMonths.push('Month #' + r.monthNum);
      });
    } else {
      for (let p = 0; p < pendingRows.length; p++) {
        const row = pendingRows[p];
        if (remFunds <= 0) break;

        const schedMonthly = roundUp2(row.monthlyAmort > 0 ? row.monthlyAmort : (row.basePrincipal + row.interestPay));
        // Account for any interest already settled in a prior partial payment on this installment
        const existingNetFundsPaid = Math.max(0, roundUp2((row.existingAmountPaid || 0) - (row.existingPenaltyPaid || 0)));
        const alreadyPaidInterest = Math.min(roundUp2(row.interestPay), existingNetFundsPaid);
        const rowInterest = Math.max(0, roundUp2(row.interestPay - alreadyPaidInterest));
        const rowPrincipal = Math.max(0, roundUp2(schedMonthly - rowInterest));

      if (remFunds >= schedMonthly) {
        // FULL MONTH SETTLED!
        const isFirstSettled = (settledMonths.length === 0);
        let rowAmountPaid = schedMonthly;
        if (isFirstSettled && penaltyPaid > 0) {
          rowAmountPaid = roundUp2(rowAmountPaid + penaltyPaid);
        }

        const totalRowAmountPaid = roundUp2(row.existingAmountPaid + rowAmountPaid);
        const totalRowPenaltyPaid = roundUp2(row.existingPenaltyPaid + (isFirstSettled ? penaltyPaid : 0));

        updatesToAmortSheet.push({
          type: 'full_paid',
          rowIdx: row.sheetRowIdx,
          amountPaid: totalRowAmountPaid,
          prinPaid: rowPrincipal,
          penaltyPaid: totalRowPenaltyPaid
        });
        totalInterestPaid = roundUp2(totalInterestPaid + rowInterest);
        totalPrincipalPaid = roundUp2(totalPrincipalPaid + rowPrincipal);
        remFunds = Math.max(0, roundUp2(remFunds - schedMonthly));
        settledMonths.push('Month #' + row.monthNum);
      } else {
        // PARTIAL FUNDS REMAINING
        if (p === 0 && settledMonths.length === 0) {
          // Underpayment on the very first installment
          const intPortion = roundUp2(Math.min(remFunds, rowInterest));
          const prinPortion = Math.max(0, roundUp2(remFunds - intPortion));
          totalInterestPaid = roundUp2(totalInterestPaid + intPortion);
          totalPrincipalPaid = roundUp2(totalPrincipalPaid + prinPortion);

          // Deduct from current row's Monthly Amort so member owes the rest later
          const newMonthly = Math.max(0, roundUp2(schedMonthly - remFunds));
          const totalRowAmountPaid = roundUp2(row.existingAmountPaid + amountPaid);
          const totalRowPenaltyPaid = roundUp2(row.existingPenaltyPaid + penaltyPaid);
          updatesToAmortSheet.push({
            type: 'partial_due',
            rowIdx: row.sheetRowIdx,
            amountPaid: totalRowAmountPaid,
            newMonthlyAmort: newMonthly,
            penaltyPaid: totalRowPenaltyPaid
          });
          remFunds = 0;
        } else {
          // At least one month was fully settled, and the leftover remFunds is an ADVANCE
          // Admin rule: Amortization (Col G) remains untouched as the permanent baseline!
          // Only Monthly Amort (Col I) is updated: newMonthlyAmort = schedMonthly - remFunds
          const advanceAmount = remFunds;
          const newMonthly = Math.max(0, roundUp2(schedMonthly - advanceAmount));
          totalPrincipalPaid = roundUp2(totalPrincipalPaid + advanceAmount);

          updatesToAmortSheet.push({
            type: 'advance_reduced',
            rowIdx: row.sheetRowIdx,
            newMonthlyAmort: newMonthly,
            advanceAmount: advanceAmount
          });

          // If 1 month was settled and rest is advance, reflect total cash paid on the settled row to match Payments
          if (settledMonths.length === 1 && updatesToAmortSheet.length > 0) {
            const firstPaid = updatesToAmortSheet.find(u => u.type === 'full_paid');
            if (firstPaid) {
              firstPaid.amountPaid = roundUp2(firstPaid.amountPaid + advanceAmount);
            }
          }

          advanceCredited = advanceAmount;
          advanceMonthNum = 'Month #' + row.monthNum;
          advanceNextMonthlyAmort = newMonthly;
          remFunds = 0;
        }
        break;
      }
    }
  }

    // If all pending rows were satisfied and remFunds still remains, apply directly to principal
    if (remFunds > 0) {
      totalPrincipalPaid = roundUp2(totalPrincipalPaid + remFunds);
      remFunds = 0;
    }
  } else {
    // Fallback if no pending rows found
    const rateIdx = loanHeaders.indexOf('Rate (%)') !== -1 ? loanHeaders.indexOf('Rate (%)') : 6;
    const rateVal = safeParseNumber(loanData[loanRowIndex - 1][rateIdx], 0);
    const fallbackInt = roundUp2(currentBalance * (rateVal / 100));
    totalInterestPaid = roundUp2(Math.min(remFunds, fallbackInt));
    totalPrincipalPaid = Math.max(0, roundUp2(remFunds - totalInterestPaid));
  }

  totalInterestPaid = roundUp2(totalInterestPaid);
  totalPrincipalPaid = roundUp2(totalPrincipalPaid);

  // Client Policy (Option 2): Unpaid penalty past 30-day grace period is added to the immediate next month's installment
  let penaltyCapitalized = 0;
  let penaltyTargetMonth = '';
  if (formData.capitalizePenalty && formData.unpaidPenalty > 0) {
    penaltyCapitalized = roundUp2(safeParseNumber(formData.unpaidPenalty, 0));
  }

  // Find the immediate next pending installment for this loan to receive the capitalized penalty
  if (penaltyCapitalized > 0) {
    const fullyPaidRowIndices = new Set(updatesToAmortSheet.filter(u => u.type === 'full_paid').map(u => u.rowIdx));
    let nextPendingRow = null;
    for (let p = 0; p < pendingRows.length; p++) {
      const pr = pendingRows[p];
      if (!fullyPaidRowIndices.has(pr.sheetRowIdx)) {
        nextPendingRow = pr;
        break;
      }
    }

    if (nextPendingRow) {
      penaltyTargetMonth = nextPendingRow.monthNum;
      const existingUpd = updatesToAmortSheet.find(u => u.rowIdx === nextPendingRow.sheetRowIdx);
      if (existingUpd) {
        if (existingUpd.newMonthlyAmort !== undefined) {
          existingUpd.newMonthlyAmort = roundUp2(existingUpd.newMonthlyAmort + penaltyCapitalized);
        } else {
          existingUpd.newMonthlyAmort = roundUp2(nextPendingRow.monthlyAmort + penaltyCapitalized);
        }
        if (existingUpd.newPrincipalAmort !== undefined) {
          existingUpd.newPrincipalAmort = roundUp2(existingUpd.newPrincipalAmort + penaltyCapitalized);
        } else {
          existingUpd.newPrincipalAmort = roundUp2(nextPendingRow.basePrincipal + penaltyCapitalized);
        }
        existingUpd.addedPenalty = penaltyCapitalized;
      } else {
        updatesToAmortSheet.push({
          type: 'penalty_added_to_next',
          rowIdx: nextPendingRow.sheetRowIdx,
          addedPenalty: penaltyCapitalized,
          newPrincipalAmort: roundUp2(nextPendingRow.basePrincipal + penaltyCapitalized),
          newMonthlyAmort: roundUp2(nextPendingRow.monthlyAmort + penaltyCapitalized)
        });
      }
    }
  }

  const balanceAfter = Math.max(0, roundUp2(currentBalance - totalPrincipalPaid + penaltyCapitalized));

  // 3. Update Loans balance & status dynamically
  const lHeaders = loansSheet.getRange(1, 1, 1, Math.max(loansSheet.getLastColumn(), 1)).getValues()[0];
  const balColIdx = lHeaders.indexOf('Remaining Bal') !== -1 ? (lHeaders.indexOf('Remaining Bal') + 1) : 9;
  const statusColIdx = lHeaders.indexOf('Status') !== -1 ? (lHeaders.indexOf('Status') + 1) : 10;

  if (loanRowIndex !== -1) {
    loansSheet.getRange(loanRowIndex, balColIdx).setValue(balanceAfter);
    if (balanceAfter === 0) {
      loansSheet.getRange(loanRowIndex, statusColIdx).setValue('Fully Paid');
    }
  }

  // 4. Calculate Amortization Balance After and append record to Payments table
  ensurePaymentsHeaders();

  let amortBalanceAfter = 0;
  if (balanceAfter > 0) {
    const paidRowIndices = new Set(updatesToAmortSheet.filter(u => u.type === 'full_paid').map(u => u.rowIdx));
    for (let j = 1; j < amortData.length; j++) {
      const lId = String(amortData[j][0] || '').trim();
      const statusVal = String(amortData[j][aStatusIdx] || '').trim().toLowerCase();
      const mNum = String(amortData[j][aMonthNumIdx] || '').trim().toLowerCase();
      const isUnsettled = (statusVal === 'pending' || statusVal === 'underpaid');
      if (lId === String(loanId).trim() && isUnsettled && mNum !== 'start' && mNum !== '0') {
        const sheetRow = j + 1;
        if (!paidRowIndices.has(sheetRow)) {
          const upd = updatesToAmortSheet.find(u => u.rowIdx === sheetRow);
          if (upd && upd.newMonthlyAmort !== undefined) {
            amortBalanceAfter = roundUp2(amortBalanceAfter + upd.newMonthlyAmort);
          } else {
            amortBalanceAfter = roundUp2(amortBalanceAfter + safeParseNumber(amortData[j][aMonthlyAmortIdx], 0));
          }
        }
      }
    }
  }

  paymentsSheet.appendRow([
    receiptNo,
    loanId,
    borrowerName,
    paymentDate,
    totalPrincipalPaid,
    totalInterestPaid,
    penaltyPaid,
    advanceCredited,
    amountPaid,
    balanceAfter,
    amortBalanceAfter,
    formData.method
  ]);
  const pLastRow = paymentsSheet.getLastRow();
  paymentsSheet.getRange(pLastRow, 5, 1, 7).setNumberFormat('₱#,##0.00');

  // 5. Update Amortization sheet:
  // - Mark fully paid rows as 'Paid' and record Amount Paid and Penalty
  // - For partial / advance, update Status to 'Underpaid' and Monthly Amort (Col I) while keeping Col G Amortization intact
  // - Cascade updated Principal ending balances to subsequent pending rows
  ensureAmortizationHeaders();
  const curAHeaders = amortSheet.getRange(1, 1, 1, amortSheet.getLastColumn()).getValues()[0];
  const penColPos = curAHeaders.indexOf('Penalty') + 1;
  const amtPaidColPos = curAHeaders.indexOf('Amount Paid') + 1;
  const statusColPos = curAHeaders.indexOf('Status') + 1;
  const monthlyAmortColPos = curAHeaders.indexOf('Monthly Amort') + 1;
  const amortColPos = curAHeaders.indexOf('Amortization') !== -1 
    ? (curAHeaders.indexOf('Amortization') + 1) 
    : (curAHeaders.indexOf('Principal Pay') !== -1 ? (curAHeaders.indexOf('Principal Pay') + 1) : 7);

  updatesToAmortSheet.forEach(u => {
    if (u.type === 'full_paid') {
      if (statusColPos > 0) amortSheet.getRange(u.rowIdx, statusColPos).setValue('Paid');
      if (amtPaidColPos > 0) amortSheet.getRange(u.rowIdx, amtPaidColPos).setValue(u.amountPaid).setNumberFormat('₱#,##0.00');
      if (penColPos > 0 && u.penaltyPaid !== undefined) amortSheet.getRange(u.rowIdx, penColPos).setValue(u.penaltyPaid).setNumberFormat('₱#,##0.00');
    } else if (u.type === 'partial_due') {
      if (statusColPos > 0) amortSheet.getRange(u.rowIdx, statusColPos).setValue('Underpaid');
      if (amtPaidColPos > 0) amortSheet.getRange(u.rowIdx, amtPaidColPos).setValue(u.amountPaid).setNumberFormat('₱#,##0.00');
      if (monthlyAmortColPos > 0) amortSheet.getRange(u.rowIdx, monthlyAmortColPos).setValue(u.newMonthlyAmort).setNumberFormat('₱#,##0.00');
      if (penColPos > 0 && u.penaltyPaid !== undefined) amortSheet.getRange(u.rowIdx, penColPos).setValue(u.penaltyPaid).setNumberFormat('₱#,##0.00');
    } else if (u.type === 'advance_reduced') {
      if (monthlyAmortColPos > 0) amortSheet.getRange(u.rowIdx, monthlyAmortColPos).setValue(u.newMonthlyAmort).setNumberFormat('₱#,##0.00');
    } else if (u.type === 'penalty_added_to_next') {
      if (monthlyAmortColPos > 0) amortSheet.getRange(u.rowIdx, monthlyAmortColPos).setValue(u.newMonthlyAmort).setNumberFormat('₱#,##0.00');
      if (amortColPos > 0) amortSheet.getRange(u.rowIdx, amortColPos).setValue(u.newPrincipalAmort).setNumberFormat('₱#,##0.00');
    }
  });

  // Re-read amortization data to cascade ending Principal (Col F) accurately
  const updatedAmortData = amortSheet.getDataRange().getValues();
  let lastSettledRowSheetIdx = -1;
  for (let r = 1; r < updatedAmortData.length; r++) {
    const rId = String(updatedAmortData[r][0] || '').trim();
    if (rId !== String(loanId).trim()) continue;
    const st = String(updatedAmortData[r][aStatusIdx] || '').trim().toLowerCase();
    if (st === 'paid' || st === 'underpaid') {
      lastSettledRowSheetIdx = r + 1;
    }
  }

  if (lastSettledRowSheetIdx !== -1) {
    amortSheet.getRange(lastSettledRowSheetIdx, aPrinColIdx + 1).setValue(balanceAfter);
    let runningBal = balanceAfter;
    for (let k = lastSettledRowSheetIdx; k < updatedAmortData.length; k++) {
      const rId = String(updatedAmortData[k][0] || '').trim();
      if (rId !== String(loanId).trim()) break;
      const st = String(updatedAmortData[k][aStatusIdx] || '').trim().toLowerCase();
      if (st !== 'pending' && st !== 'underpaid') continue;

      const rowSheetIdx = k + 1;
      if (balanceAfter === 0) {
        // Edge Case #1: Loan is fully paid off early! Mark remaining rows Paid with 0 balance
        amortSheet.getRange(rowSheetIdx, aPrinColIdx + 1).setValue(0);
        amortSheet.getRange(rowSheetIdx, aStatusIdx + 1).setValue('Paid');
        amortSheet.getRange(rowSheetIdx, aAmtPaidColIdx + 1).setValue(0);
      } else {
        const curMonthly = safeParseNumber(updatedAmortData[k][aMonthlyAmortIdx], 0);
        const curInt = safeParseNumber(updatedAmortData[k][aIntIdx], 0);
        const curPrin = Math.max(0, roundUp2(curMonthly - curInt));
        let newPrincipal = Math.max(0, roundUp2(runningBal - curPrin));

        // Edge Case: If this is the last pending installment for the loan and discrepancy is minimal cents, finish at 0.00
        const isNextRowDifferentLoan = (k + 1 >= updatedAmortData.length) || (String(updatedAmortData[k + 1][0] || '').trim() !== String(loanId).trim());
        if (isNextRowDifferentLoan && Math.abs(newPrincipal) <= 0.05) {
          newPrincipal = 0;
        }

        amortSheet.getRange(rowSheetIdx, aPrinColIdx + 1).setValue(newPrincipal);
        runningBal = newPrincipal;
      }
    }
  }

  // 6. Send Gmail Official Receipt automatically to borrower's email on record with attached Amortization Schedule PDF
  let emailSent = false;
  let pdfAttached = false;
  if (borrowerEmail && borrowerEmail.includes('@')) {
    const emailSubject = 'Payment Receipt - Loan Payment [' + receiptNo + '] - Saint Joseph Multipurpose Cooperative';

    // Generate updated Amortization Schedule PDF
    let pdfBlob = null;
    try {
      pdfBlob = generateAmortizationPdfBlob(loanId);
      if (pdfBlob) pdfAttached = true;
    } catch (pdfErr) {
      Logger.log('PDF generation failed: ' + pdfErr.message);
    }

    const settledDescription = settledMonths.length > 0 
      ? settledMonths.join(' & ') 
      : (pendingRows.length > 0 ? ('Month #' + pendingRows[0].monthNum + ' (Partial)') : 'Principal Payment');

    const emailHtmlBody = 
      '<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">' +
        '<div style="background-color: #0f2b5c; padding: 18px 24px; text-align: center; color: #ffffff;">' +
          '<h2 style="margin: 0; font-size: 19px; letter-spacing: 0.5px; text-transform: uppercase;">Saint Joseph Multipurpose Cooperative</h2>' +
          '<p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">Payment Receipt & Statement of Account</p>' +
        '</div>' +
        '<div style="padding: 24px;">' +
          '<p style="margin-top: 0; font-size: 14px;">Dear <strong>' + borrowerName + '</strong>,</p>' +
          '<p style="font-size: 13.5px; line-height: 1.5; color: #334155;">' +
            'We have successfully received and processed your loan payment. Here is the breakdown of your payment:' +
          '</p>' +
          '<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">' +
            '<table style="width: 100%; font-size: 13px; border-collapse: collapse;">' +
              '<tr><td style="padding: 5px 0; color: #64748b;">Receipt No:</td><td style="padding: 5px 0; font-weight: bold; text-align: right; color: #0f2b5c;">' + receiptNo + '</td></tr>' +
              '<tr><td style="padding: 5px 0; color: #64748b;">Payment Date:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">' + paymentDate + '</td></tr>' +
              '<tr><td style="padding: 5px 0; color: #64748b;">Loan Account No:</td><td style="padding: 5px 0; font-weight: bold; text-align: right; font-family: monospace;">' + loanId + '</td></tr>' +
              '<tr><td style="padding: 5px 0; color: #64748b;">Settled Installment(s):</td><td style="padding: 5px 0; font-weight: bold; text-align: right; color: #0f766e;">' + settledDescription + '</td></tr>' +
              '<tr><td style="padding: 5px 0; color: #64748b;">Payment Method:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">' + formData.method + '</td></tr>' +
              '<tr style="border-top: 1px solid #e2e8f0;"><td style="padding: 8px 0 4px 0; color: #64748b; font-weight: bold;">Total Amount Received:</td><td style="padding: 8px 0 4px 0; font-weight: bold; font-size: 15px; color: #0f766e; text-align: right;">PHP ' + amountPaid.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</td></tr>' +
              (penaltyPaid > 0 ? ('<tr><td style="padding: 4px 0; color: #b45309;">- Late Penalty Paid:</td><td style="padding: 4px 0; font-weight: bold; color: #b45309; text-align: right;">PHP ' + penaltyPaid.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</td></tr>') : '') +
              '<tr><td style="padding: 4px 0; color: #64748b;">- Applied to Interest:</td><td style="padding: 4px 0; text-align: right;">PHP ' + totalInterestPaid.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</td></tr>' +
              '<tr><td style="padding: 4px 0; color: #64748b;">- Applied to Principal:</td><td style="padding: 4px 0; text-align: right;">PHP ' + totalPrincipalPaid.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</td></tr>' +
              (advanceCredited > 0 ? ('<tr><td style="padding: 4px 0; color: #047857; font-weight: bold;">Advance Principal Credited:</td><td style="padding: 4px 0; font-weight: bold; color: #047857; text-align: right;">PHP ' + advanceCredited.toLocaleString(undefined, {minimumFractionDigits: 2}) + '<br><span style="font-size: 11px; font-weight: normal; color: #059669;">(Credited to ' + advanceMonthNum + ' - Monthly payment reduced to PHP ' + advanceNextMonthlyAmort.toLocaleString(undefined, {minimumFractionDigits: 2}) + ')</span></td></tr>') : '') +
              (penaltyCapitalized > 0 ? ('<tr><td style="padding: 4px 0; color: #b45309; font-weight: bold;">Unpaid Penalty Added:</td><td style="padding: 4px 0; font-weight: bold; color: #b45309; text-align: right;">+ PHP ' + penaltyCapitalized.toLocaleString(undefined, {minimumFractionDigits: 2}) + '<br><span style="font-size: 11px; font-weight: normal; color: #b45309;">(Added to ' + (penaltyTargetMonth ? ('Month #' + penaltyTargetMonth) : 'next') + ' installment)</span></td></tr>') : '') +
              '<tr style="border-top: 2px solid #cbd5e1;"><td style="padding: 8px 0 4px 0; font-weight: bold; color: #0f172a;">Remaining Principal Balance:</td><td style="padding: 8px 0 4px 0; font-weight: bold; font-size: 15px; color: #0f2b5c; text-align: right;">PHP ' + balanceAfter.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</td></tr>' +
            '</table>' +
          '</div>' +
          (pdfAttached ? 
            ('<div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">' +
              '<p style="margin: 0; font-size: 13px; color: #166534; font-weight: bold;">Amortization Schedule (PDF) Attached</p>' +
              '<p style="margin: 4px 0 0 0; font-size: 12px; color: #15803d;">' +
                'Your updated 36-month Amortization Schedule and Statement of Account has been attached as a PDF (<strong>Amortization_Schedule_' + loanId + '.pdf</strong>) for your reference.' +
              '</p>' +
            '</div>') : '') +
          '<p style="font-size: 12.5px; color: #64748b; line-height: 1.5; margin-top: 20px;">' +
            'Thank you for your timely payment and continued partnership with our cooperative. If you have any inquiries, feel free to visit our office or reach out to us.' +
          '</p>' +
          '<div style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #334155;">' +
            '<strong>Saint Joseph Multipurpose Cooperative</strong>' +
          '</div>' +
        '</div>' +
      '</div>';

    const plainBody = 
      'SAINT JOSEPH MULTIPURPOSE COOPERATIVE\n' +
      '==========================================\n' +
      'RECEIPT NO: ' + receiptNo + '\n' +
      'DATE: ' + paymentDate + '\n' +
      'BORROWER: ' + borrowerName + '\n' +
      'LOAN NO: ' + loanId + '\n' +
      'SETTLED INSTALLMENT(S): ' + settledDescription + '\n\n' +
      'PAYMENT ALLOCATION BREAKDOWN:\n' +
      '------------------------------------------\n' +
      'Total Amount Received: PHP ' + amountPaid.toLocaleString(undefined, {minimumFractionDigits: 2}) + '\n' +
      (penaltyPaid > 0 ? ('Late Penalty Fee:     PHP ' + penaltyPaid.toLocaleString(undefined, {minimumFractionDigits: 2}) + '\n') : '') +
      'Applied to Interest:   PHP ' + totalInterestPaid.toLocaleString(undefined, {minimumFractionDigits: 2}) + '\n' +
      'Applied to Principal:  PHP ' + totalPrincipalPaid.toLocaleString(undefined, {minimumFractionDigits: 2}) + '\n' +
      (advanceCredited > 0 ? ('Advance Principal Credited: PHP ' + advanceCredited.toLocaleString(undefined, {minimumFractionDigits: 2}) + ' (Credited to ' + advanceMonthNum + ' - Monthly payment reduced to PHP ' + advanceNextMonthlyAmort.toLocaleString(undefined, {minimumFractionDigits: 2}) + ')\n') : '') +
      (penaltyCapitalized > 0 ? ('Unpaid Penalty Added:  + PHP ' + penaltyCapitalized.toLocaleString(undefined, {minimumFractionDigits: 2}) + ' (Added to ' + (penaltyTargetMonth ? ('Month #' + penaltyTargetMonth) : 'next') + ' installment)\n') : '') +
      'Payment Method:        ' + formData.method + '\n\n' +
      'REMAINING LOAN BALANCE: PHP ' + balanceAfter.toLocaleString(undefined, {minimumFractionDigits: 2}) + '\n' +
      '------------------------------------------\n' +
      (pdfAttached ? ('ATTACHMENT: Updated Amortization Schedule (Amortization_Schedule_' + loanId + '.pdf)\n\n') : '') +
      'Thank you for your payment!\n' +
      'Saint Joseph Multipurpose Cooperative';

    const emailOptions = {
      name: 'Saint Joseph Multipurpose Cooperative',
      htmlBody: emailHtmlBody
    };
    if (pdfBlob) {
      emailOptions.attachments = [pdfBlob];
    }

    try {
      sendCoopEmail(borrowerEmail, emailSubject, plainBody, emailOptions);
      emailSent = true;
    } catch (e) {
      Logger.log('Could not send payment receipt: ' + e.message);
    }
  }

  const logPenaltyStr = penaltyPaid > 0 ? ', Penalty: PHP ' + penaltyPaid : '';
  const logCapStr = penaltyCapitalized > 0 ? (', Capitalized Penalty: PHP ' + penaltyCapitalized + (penaltyTargetMonth ? ' added to Month #' + penaltyTargetMonth : '')) : '';
  const logSettledStr = settledMonths.length > 0 ? (' [' + settledMonths.join(', ') + ']') : '';
  const emailNotice = emailSent ? (' (Emailed receipt' + (pdfAttached ? ' & Amortization PDF' : '') + ' to ' + borrowerEmail + ')') : '';
  logAudit('RECORD_PAYMENT', 'Issued receipt ' + receiptNo + ' for PHP ' + amountPaid + ' (' + borrowerName + logSettledStr + logPenaltyStr + logCapStr + ')' + emailNotice);
  try { updateDashboardCollectionsRadar(); } catch (e) {}
  return {
    success: true,
    receiptNo: receiptNo,
    balanceAfter: balanceAfter,
    settledMonths: settledMonths,
    advanceCredited: advanceCredited,
    advanceMonthNum: advanceMonthNum,
    advanceNextMonthlyAmort: advanceNextMonthlyAmort,
    penaltyCapitalized: penaltyCapitalized,
    penaltyTargetMonth: penaltyTargetMonth,
    emailSent: emailSent,
    borrowerEmail: borrowerEmail,
    pdfAttached: pdfAttached
  };
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

/**
 * 6.5 GENERATE AMORTIZATION SCHEDULE PDF BLOB
 * Creates an official, branded PDF of the borrower's Amortization Schedule & Statement of Account
 */
function generateAmortizationPdfBlob(loanId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const amortSheet = ss.getSheetByName('Amortization');
    const loansSheet = ss.getSheetByName('Loans');
    if (!amortSheet || !loansSheet) {
      Logger.log('generateAmortizationPdfBlob: Amortization or Loans sheet not found');
      return null;
    }

    // 1. Locate loan metadata
    const loansData = loansSheet.getDataRange().getValues();
    if (loansData.length <= 1) {
      Logger.log('generateAmortizationPdfBlob: Loans sheet is empty');
      return null;
    }
    const lHeader = loansData[0] || [];
    const lMap = {};
    lHeader.forEach((h, idx) => {
      if (h) lMap[String(h).trim().toLowerCase()] = idx;
    });

    const lIdIdx = lMap['loan id'] !== undefined ? lMap['loan id'] : 0;
    const bIdIdx = lMap['borrower id'] !== undefined ? lMap['borrower id'] : 1;
    const bNameIdx = lMap['borrower name'] !== undefined ? lMap['borrower name'] : 2;
    const typeIdx = lMap['type'] !== undefined ? lMap['type'] : 3;
    const amtIdx = lMap['amount (₱)'] !== undefined ? lMap['amount (₱)'] : (lMap['amount'] !== undefined ? lMap['amount'] : 4);
    const monthsIdx = lMap['months'] !== undefined ? lMap['months'] : 5;
    const rateIdx = lMap['rate (%)'] !== undefined ? lMap['rate (%)'] : (lMap['rate'] !== undefined ? lMap['rate'] : 6);
    const penaltyIdx = lMap['penalty (%)'] !== undefined ? lMap['penalty (%)'] : (lMap['penalty'] !== undefined ? lMap['penalty'] : 7);
    const dateIdx = lMap['date granted'] !== undefined ? lMap['date granted'] : 8;
    const remBalIdx = lMap['remaining bal'] !== undefined ? lMap['remaining bal'] : 9;
    const statusIdx = lMap['status'] !== undefined ? lMap['status'] : 10;

    let loanInfo = null;
    for (let i = 1; i < loansData.length; i++) {
      if (String(loansData[i][lIdIdx]).trim().toLowerCase() === String(loanId).trim().toLowerCase()) {
        const dGranted = loansData[i][dateIdx];
        loanInfo = {
          loanId: String(loansData[i][lIdIdx]).trim(),
          borrowerId: String(loansData[i][bIdIdx] || ''),
          borrowerName: String(loansData[i][bNameIdx] || 'Borrower'),
          loanType: String(loansData[i][typeIdx] || 'Regular Loan'),
          loanAmount: safeParseNumber(loansData[i][amtIdx], 0),
          months: safeParseNumber(loansData[i][monthsIdx], 36),
          interestRate: safeParseNumber(loansData[i][rateIdx], 0.75),
          penaltyRate: safeParseNumber(loansData[i][penaltyIdx], 3.0),
          dateGranted: formatDateISO(dGranted),
          remainingBalance: safeParseNumber(loansData[i][remBalIdx], 0),
          status: String(loansData[i][statusIdx] || 'Active')
        };
        break;
      }
    }

    if (!loanInfo) {
      Logger.log('generateAmortizationPdfBlob: Loan ID "' + loanId + '" not found in Loans sheet');
      return null;
    }

    // 2. Fetch amortization rows for this loan
    const amortData = amortSheet.getDataRange().getValues();
    if (amortData.length <= 1) {
      Logger.log('generateAmortizationPdfBlob: Amortization sheet is empty');
      return null;
    }
    const aHeader = amortData[0] || [];
    const aMap = {};
    aHeader.forEach((h, idx) => {
      if (h) aMap[String(h).trim().toLowerCase()] = idx;
    });

    const aLoanIdIdx = aMap['loan id'] !== undefined ? aMap['loan id'] : 0;
    const aMonthNumIdx = aMap['month #'] !== undefined ? aMap['month #'] : 2;
    const aTermYearIdx = aMap['term year'] !== undefined ? aMap['term year'] : 3;
    const aMonthNameIdx = aMap['month name'] !== undefined ? aMap['month name'] : 4;
    const aPrinIdx = aMap['principal'] !== undefined ? aMap['principal'] : 5;
    const aAmortIdx = aMap['amortization'] !== undefined ? aMap['amortization'] : (aMap['principal pay'] !== undefined ? aMap['principal pay'] : 6);
    const aIntPayIdx = aMap['interest pay'] !== undefined ? aMap['interest pay'] : 7;
    const aMonthlyAmortIdx = aMap['monthly amort'] !== undefined ? aMap['monthly amort'] : (aMap['monthly amortization'] !== undefined ? aMap['monthly amortization'] : 8);
    const aPenIdx = aMap['penalty'] !== undefined ? aMap['penalty'] : 9;
    const aAmtPaidIdx = aMap['amount paid'] !== undefined ? aMap['amount paid'] : 10;
    const aStatusIdx = aMap['status'] !== undefined ? aMap['status'] : 11;

    const rows = [];
    let sumPrincipal = 0;
    let sumInterest = 0;
    let sumAmort = 0;
    let paidCount = 0;

    for (let j = 1; j < amortData.length; j++) {
      if (String(amortData[j][aLoanIdIdx]).trim().toLowerCase() === String(loanId).trim().toLowerCase()) {
        const pBal = safeParseNumber(amortData[j][aPrinIdx], 0);
        const pAmort = safeParseNumber(amortData[j][aAmortIdx], 0);
        const iPay = safeParseNumber(amortData[j][aIntPayIdx], 0);
        const mAmort = safeParseNumber(amortData[j][aMonthlyAmortIdx], 0);
        const pPenalty = aPenIdx !== -1 ? safeParseNumber(amortData[j][aPenIdx], 0) : 0;
        const aPaid = safeParseNumber(amortData[j][aAmtPaidIdx], 0);
        const st = String(amortData[j][aStatusIdx] || 'Pending').trim();

        sumPrincipal += pAmort;
        sumInterest += iPay;
        sumAmort += mAmort;
        if (st.toLowerCase() === 'paid') paidCount++;

        rows.push({
          monthNum: amortData[j][aMonthNumIdx],
          termYear: String(amortData[j][aTermYearIdx] || ''),
          monthName: String(amortData[j][aMonthNameIdx] || ''),
          principal: pBal,
          amortization: pAmort,
          interestPay: iPay,
          monthlyAmort: mAmort,
          penalty: pPenalty,
          amountPaid: aPaid,
          status: st
        });
      }
    }

    if (rows.length === 0) {
      Logger.log('generateAmortizationPdfBlob: No amortization schedule rows found for loan ' + loanId);
      return null;
    }

    const fmtMoney = function(val) {
      return Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    let tableRows = '';
    for (let k = 0; k < rows.length; k++) {
      const r = rows[k];
      const isStartRow = r.monthNum === 0 || String(r.monthNum).toLowerCase() === 'start' || String(r.termYear).toLowerCase() === 'start';
      if (isStartRow) {
        const startBadgeText = r.status.toLowerCase().includes('loan granted') ? r.status : ('Loan Granted (' + loanInfo.interestRate + '%)');
        tableRows += 
          '<tr style="background-color: #f1f5f9; font-weight: bold; border-bottom: 2px solid #cbd5e1;">' +
            '<td style="padding: 4px 6px; font-size: 8.5px; font-weight: bold; color: #0f2b5c; text-align: center;">START</td>' +
            '<td style="padding: 4px 6px; font-size: 8.5px; font-weight: bold; color: #0f2b5c;">' + r.monthName + '</td>' +
            '<td style="padding: 4px 6px; font-size: 8.5px; text-align: right; font-family: monospace;">PHP ' + fmtMoney(r.principal) + '</td>' +
            '<td style="padding: 4px 6px; font-size: 8.5px; text-align: center; color: #94a3b8;">-</td>' +
            '<td style="padding: 4px 6px; font-size: 8.5px; text-align: center; color: #94a3b8;">-</td>' +
            '<td style="padding: 4px 6px; font-size: 8.5px; text-align: center; color: #94a3b8;">-</td>' +
            '<td style="padding: 4px 6px; font-size: 8.5px; text-align: center; color: #94a3b8;">-</td>' +
            '<td style="padding: 4px 6px; text-align: center;"><span style="background-color: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 8px;">' + startBadgeText + '</span></td>' +
          '</tr>';
        continue;
      }

      const isYearStart = (safeParseNumber(r.monthNum, 1) - 1) % 12 === 0;
      const isPaid = r.status.toLowerCase() === 'paid';
      const isUnderpaid = r.status.toLowerCase() === 'underpaid';
      const statusBadge = isPaid
        ? '<span style="background-color: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 8px;">PAID</span>'
        : (isUnderpaid
            ? '<span style="background-color: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 8px;">UNDERPAID</span>'
            : '<span style="background-color: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 8px;">PENDING</span>');
      const rowBg = k % 2 === 1 ? '#f8fafc' : '#ffffff';

      tableRows += 
        '<tr style="background-color: ' + rowBg + '; border-bottom: 1px solid #e2e8f0;">' +
          '<td style="padding: 4px 6px; font-size: 8.5px; font-weight: bold; color: #475569; text-align: center;">' + (isYearStart ? r.termYear : '') + '</td>' +
          '<td style="padding: 4px 6px; font-size: 8.5px; font-weight: bold; color: #0f172a;">' + r.monthName + '</td>' +
          '<td style="padding: 4px 6px; font-size: 8.5px; text-align: right; font-family: monospace;">PHP ' + fmtMoney(r.principal) + '</td>' +
          '<td style="padding: 4px 6px; font-size: 8.5px; text-align: right; font-family: monospace;">PHP ' + fmtMoney(r.amortization) + '</td>' +
          '<td style="padding: 4px 6px; font-size: 8.5px; text-align: right; font-family: monospace;">PHP ' + fmtMoney(r.interestPay) + '</td>' +
          '<td style="padding: 4px 6px; font-size: 8.5px; text-align: right; font-family: monospace; font-weight: bold; color: #0f2b5c;">PHP ' + fmtMoney(r.monthlyAmort) + '</td>' +
          '<td style="padding: 4px 6px; font-size: 8.5px; text-align: right; font-family: monospace;">' + (r.amountPaid > 0 ? ('PHP ' + fmtMoney(r.amountPaid)) : '-') + '</td>' +
          '<td style="padding: 4px 6px; text-align: center;">' + statusBadge + '</td>' +
        '</tr>';
    }

    const htmlContent = 
      '<!DOCTYPE html>' +
      '<html><head><meta charset="utf-8">' +
      '<style>' +
        '@page { size: portrait; margin: 10mm 10mm 12mm 10mm; }' +
        'body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 0; background: #ffffff; }' +
        '.header { text-align: center; border-bottom: 2.5px solid #0f2b5c; padding-bottom: 10px; margin-bottom: 12px; }' +
        '.header h1 { margin: 0; color: #0f2b5c; font-size: 19px; letter-spacing: 0.5px; font-weight: 800; text-transform: uppercase; }' +
        '.header .subtitle { margin: 3px 0 0 0; font-size: 11px; font-weight: bold; color: #475569; letter-spacing: 1px; text-transform: uppercase; }' +
        '.header .tagline { margin: 2px 0 0 0; font-size: 9px; color: #64748b; }' +
        '.info-box { width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; background-color: #f8fafc; padding: 8px 12px; margin-bottom: 12px; font-size: 9.5px; box-sizing: border-box; }' +
        '.info-table { width: 100%; border-collapse: collapse; }' +
        '.info-table td { padding: 2.5px 4px; vertical-align: top; }' +
        '.label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 8.5px; }' +
        '.val { color: #0f172a; font-weight: bold; }' +
        '.schedule-table { width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 12px; }' +
        '.schedule-table th { background-color: #0f2b5c; color: #ffffff; font-size: 8.5px; font-weight: bold; padding: 5px 6px; text-transform: uppercase; border: 1px solid #0f2b5c; }' +
        '.schedule-table tr { page-break-inside: avoid; }' +
        '.schedule-table .total-row td { background-color: #f1f5f9; font-weight: bold; border-top: 2.5px solid #0f2b5c; border-bottom: 2px solid #0f2b5c; padding: 5px 6px; font-size: 9px; }' +
        '.footer-note { text-align: center; margin-top: 16px; font-size: 8px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 8px; page-break-inside: avoid; }' +
      '</style></head><body>' +
        '<div class="header">' +
          '<h1>SAINT JOSEPH MULTIPURPOSE COOPERATIVE</h1>' +
          '<div class="subtitle">Amortization Schedule & Statement of Account</div>' +
        '</div>' +
        '<div class="info-box">' +
          '<table class="info-table">' +
            '<tr>' +
              '<td style="width: 15%;" class="label">Borrower Name:</td>' +
              '<td style="width: 35%;" class="val">' + loanInfo.borrowerName.toUpperCase() + '</td>' +
              '<td style="width: 18%;" class="label">Loan Account No:</td>' +
              '<td style="width: 32%; font-family: monospace;" class="val">' + loanInfo.loanId + '</td>' +
            '</tr>' +
            '<tr>' +
              '<td class="label">Borrower ID:</td>' +
              '<td style="font-family: monospace;" class="val">' + (loanInfo.borrowerId || 'N/A') + '</td>' +
              '<td class="label">Date Granted:</td>' +
              '<td class="val">' + (loanInfo.dateGranted || 'N/A') + '</td>' +
            '</tr>' +
            '<tr>' +
              '<td class="label">Loan Product:</td>' +
              '<td class="val">' + loanInfo.loanType.toUpperCase() + '</td>' +
              '<td class="label">Loan Amount:</td>' +
              '<td style="font-family: monospace; color: #0f766e;" class="val">PHP ' + fmtMoney(loanInfo.loanAmount) + '</td>' +
            '</tr>' +
            '<tr>' +
              '<td class="label">Payment Term:</td>' +
              '<td class="val">' + loanInfo.months + ' Months</td>' +
              '<td class="label">Interest Rate:</td>' +
              '<td class="val">' + loanInfo.interestRate + '%/mo</td>' +
            '</tr>' +
            '<tr>' +
              '<td class="label">Progress:</td>' +
              '<td class="val">' +
                '<span style="color: #15803d; font-weight: bold;">' + paidCount + ' Paid</span> / ' +
                '<span style="color: #b45309; font-weight: bold;">' + Math.max(0, loanInfo.months - paidCount) + ' Remaining</span>' +
              '</td>' +
              '<td class="label">Remaining Balance:</td>' +
              '<td style="font-family: monospace; color: #0f2b5c; font-size: 11px;" class="val">PHP ' + fmtMoney(loanInfo.remainingBalance) + '</td>' +
            '</tr>' +
          '</table>' +
        '</div>' +
        '<table class="schedule-table">' +
          '<thead>' +
            '<tr>' +
              '<th style="width: 11%; text-align: center;">Term / Year</th>' +
              '<th style="width: 15%; text-align: left;">Payment Month</th>' +
              '<th style="width: 14%; text-align: right;">Principal</th>' +
              '<th style="width: 14%; text-align: right;">Amortization</th>' +
              '<th style="width: 12%; text-align: right;">Interest (' + loanInfo.interestRate + '%)</th>' +
              '<th style="width: 16%; text-align: right;">Monthly Amort</th>' +
              '<th style="width: 14%; text-align: right;">Amount Paid</th>' +
              '<th style="width: 8%; text-align: center;">Status</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            tableRows +
            '<tr class="total-row">' +
              '<td colspan="3" style="text-align: right; text-transform: uppercase; color: #0f172a; font-weight: 800;">Total Payable:</td>' +
              '<td style="text-align: right; font-family: monospace; color: #0f172a;">PHP ' + fmtMoney(sumPrincipal) + '</td>' +
              '<td style="text-align: right; font-family: monospace; color: #0f172a;">PHP ' + fmtMoney(sumInterest) + '</td>' +
              '<td style="text-align: right; font-family: monospace; color: #0f2b5c;">PHP ' + fmtMoney(sumAmort) + '</td>' +
              '<td colspan="2" style="text-align: center; color: #0f766e;">PHP ' + fmtMoney(loanInfo.remainingBalance) + ' Bal</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>' +
        '<div class="footer-note">' +
          'Generated on ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM dd, yyyy') + ' - Saint Joseph Multipurpose Cooperative' +
        '</div>' +
      '</body></html>';

    const htmlOutput = HtmlService.createHtmlOutput(htmlContent);
    const pdfBlob = htmlOutput.getAs('application/pdf');
    pdfBlob.setName('Amortization_Schedule_' + loanInfo.loanId + '.pdf');
    return pdfBlob;
  } catch (err) {
    Logger.log('Error generating Amortization PDF for ' + loanId + ': ' + err.message);
    return null;
  }
}

/**
 * EXPORT AMORTIZATION SCHEDULE PDF MODAL BACKEND
 */
function getAllLoansForPdfExport() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const loansSheet = ss.getSheetByName('Loans');
    const borrowersSheet = ss.getSheetByName('Borrowers');
    if (!loansSheet || loansSheet.getLastRow() <= 1) return { loans: [], currentUserEmail: '' };

    const lData = loansSheet.getDataRange().getValues();
    const lHeader = lData.shift();

    const lMap = {};
    lHeader.forEach((h, idx) => {
      if (h) lMap[String(h).trim().toLowerCase()] = idx;
    });

    const idIdx = lMap['loan id'] !== undefined ? lMap['loan id'] : 0;
    const bIdIdx = lMap['borrower id'] !== undefined ? lMap['borrower id'] : 1;
    const bNameIdx = lMap['borrower name'] !== undefined ? lMap['borrower name'] : 2;
    const typeIdx = lMap['type'] !== undefined ? lMap['type'] : 3;
    const amtIdx = lMap['amount (₱)'] !== undefined ? lMap['amount (₱)'] : (lMap['amount'] !== undefined ? lMap['amount'] : 4);
    const mosIdx = lMap['months'] !== undefined ? lMap['months'] : 5;
    const rtIdx = lMap['rate (%)'] !== undefined ? lMap['rate (%)'] : (lMap['rate'] !== undefined ? lMap['rate'] : 6);
    const balIdx = lMap['remaining bal'] !== undefined ? lMap['remaining bal'] : 9;
    const stIdx = lMap['status'] !== undefined ? lMap['status'] : 10;

    // Map borrower emails
    const emailMap = {};
    if (borrowersSheet && borrowersSheet.getLastRow() > 1) {
      const bData = borrowersSheet.getDataRange().getValues();
      const bH = bData.shift();
      const bMap = {};
      bH.forEach((h, idx) => {
        if (h) bMap[String(h).trim().toLowerCase()] = idx;
      });
      const bIdCol = bMap['borrower id'] !== undefined ? bMap['borrower id'] : 0;
      const bEmailCol = bMap['email'] !== undefined ? bMap['email'] : 4;
      bData.forEach(r => {
        const borId = String(r[bIdCol] || '').trim();
        if (borId) {
          emailMap[borId] = String(r[bEmailCol] || '').trim();
        }
      });
    }

    const list = [];
    for (let i = 0; i < lData.length; i++) {
      const r = lData[i];
      const loanId = String(r[idIdx] || '').trim();
      if (!loanId) continue;
      const borrowerId = String(r[bIdIdx] || '').trim();

      list.push({
        loanId: loanId,
        borrowerId: borrowerId,
        borrowerName: String(r[bNameIdx] || '').trim(),
        loanType: String(r[typeIdx] || '').trim(),
        amount: safeParseNumber(r[amtIdx], 0),
        months: safeParseNumber(r[mosIdx], 36),
        rate: safeParseNumber(r[rtIdx], 0.75),
        remainingBalance: safeParseNumber(r[balIdx], 0),
        status: String(r[stIdx] || 'Active').trim(),
        borrowerEmail: emailMap[borrowerId] || ''
      });
    }

    let userEmail = '';
    try {
      userEmail = (Session.getActiveUser() && Session.getActiveUser().getEmail()) || '';
    } catch (e) {}

    return {
      loans: list,
      currentUserEmail: userEmail
    };
  } catch (err) {
    Logger.log('getAllLoansForPdfExport error: ' + err.message);
    return { loans: [], currentUserEmail: '' };
  }
}

function processExportAmortizationPdf(formData) {
  try {
    const loanId = formData && formData.loanId ? String(formData.loanId).trim() : '';
    if (!loanId) throw new Error('Loan ID is required.');

    const pdfBlob = generateAmortizationPdfBlob(loanId);
    if (!pdfBlob) {
      throw new Error('Could not generate Amortization PDF for ' + loanId + '. Check that the loan exists in Loans and Amortization sheets.');
    }

    const base64Data = Utilities.base64Encode(pdfBlob.getBytes());
    let emailedBorrower = '';
    let emailedCustom = '';
    const emailErrors = [];

    // 1. Send directly to Borrower if requested
    if (formData.emailBorrower && formData.borrowerEmail) {
      const bEmail = String(formData.borrowerEmail).trim();
      if (bEmail.includes('@')) {
        try {
          sendCoopEmail(
            bEmail,
            'Loan Amortization Schedule [' + loanId + '] - Saint Joseph Multipurpose Cooperative',
            'Dear Valued Member,\n\nPlease find attached your official Amortization Schedule for Loan ID: ' + loanId + '.\n\nThank you for banking with Saint Joseph Multipurpose Cooperative.\n\nSaint Joseph Multipurpose Cooperative',
            {
              name: 'Saint Joseph Multipurpose Cooperative',
              attachments: [pdfBlob]
            }
          );
          emailedBorrower = bEmail;
        } catch (bErr) {
          emailErrors.push('Borrower (' + bEmail + '): ' + bErr.message);
          Logger.log('Error emailing borrower: ' + bErr.message);
        }
      }
    }

    // 2. Send directly to Staff / Custom recipient email(s) if requested
    if (formData.emailCustom && formData.customEmail) {
      const customEmailRaw = String(formData.customEmail).trim();
      const emailList = customEmailRaw.split(',').map(e => e.trim()).filter(e => e.includes('@'));
      const sentList = [];

      emailList.forEach(targetEmail => {
        try {
          sendCoopEmail(
            targetEmail,
            'Amortization Schedule PDF [' + loanId + '] - Saint Joseph Multipurpose Cooperative',
            'Hello,\n\nAttached is the requested Amortization Schedule PDF for Loan ID ' + loanId + '.\n\nSaint Joseph Multipurpose Cooperative',
            {
              name: 'Saint Joseph Multipurpose Cooperative',
              attachments: [pdfBlob]
            }
          );
          sentList.push(targetEmail);
        } catch (mailErr) {
          emailErrors.push('Staff (' + targetEmail + '): ' + mailErr.message);
          Logger.log('Error emailing ' + targetEmail + ': ' + mailErr.message);
        }
      });
      emailedCustom = sentList.join(', ');
    }

    try {
      const auditRecipients = [
        emailedBorrower ? 'borrower: ' + emailedBorrower : '',
        emailedCustom ? 'custom: ' + emailedCustom : ''
      ].filter(Boolean).join('; ');
      logAudit('EXPORT_PDF', 'Exported PDF for ' + loanId + (auditRecipients ? ' (' + auditRecipients + ')' : ''));
    } catch (auditErr) {}

    return {
      success: true,
      fileName: pdfBlob.getName(),
      pdfBase64: base64Data,
      emailedBorrower: emailedBorrower,
      emailedCustom: emailedCustom,
      emailErrors: emailErrors
    };
  } catch (err) {
    Logger.log('processExportAmortizationPdf error: ' + err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * EXPORT AMORTIZATION SCHEDULE PDF ON-DEMAND PROMPT (FALLBACK)
 */
function exportAmortizationPdfPrompt() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt('Export Amortization PDF', 'Enter Loan ID (e.g. LN-2026-1001):', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;
  const loanId = res.getResponseText().trim();
  if (!loanId) return;

  const pdfBlob = generateAmortizationPdfBlob(loanId);
  if (!pdfBlob) {
    ui.alert('Error: Loan ID "' + loanId + '" not found in Loans or Amortization table.');
    return;
  }

  const userEmail = Session.getActiveUser().getEmail();
  if (userEmail && userEmail.includes('@')) {
    try {
      sendCoopEmail(
        userEmail,
        'Amortization Schedule PDF [' + loanId + '] - Saint Joseph Multipurpose Cooperative',
        'Attached is the requested Amortization Schedule PDF for Loan ' + loanId + '.\n\nSaint Joseph Multipurpose Cooperative',
        {
          name: 'Saint Joseph Multipurpose Cooperative',
          attachments: [pdfBlob]
        }
      );
      ui.alert('Amortization Schedule PDF successfully created!\n\n• Emailed directly to: ' + userEmail);
    } catch (err) {
      ui.alert('Notice: Generated PDF, but encountered error emailing: ' + err.message);
    }
  } else {
    ui.alert('Amortization Schedule PDF successfully created for ' + loanId + '.');
  }
}

/**
 * 7. DELETE LOAN & CASCADE AMORTIZATION RECORDS
 */
function getAllLoansForDeletion() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Loans');
    if (!sheet || sheet.getLastRow() <= 1) return [];

    const data = sheet.getDataRange().getValues();
    const headerRow = data.shift();

    const headerMap = {};
    headerRow.forEach((h, idx) => {
      if (h) headerMap[String(h).trim().toLowerCase()] = idx;
    });

    const idColIdx = headerMap['loan id'] !== undefined ? headerMap['loan id'] : 0;
    const bIdColIdx = headerMap['borrower id'] !== undefined ? headerMap['borrower id'] : 1;
    const bNameColIdx = headerMap['borrower name'] !== undefined ? headerMap['borrower name'] : 2;
    const typeColIdx = headerMap['type'] !== undefined ? headerMap['type'] : 3;
    const amtColIdx = headerMap['amount (₱)'] !== undefined ? headerMap['amount (₱)'] : (headerMap['amount'] !== undefined ? headerMap['amount'] : 4);
    const balColIdx = headerMap['remaining bal'] !== undefined ? headerMap['remaining bal'] : 9;
    const statusColIdx = headerMap['status'] !== undefined ? headerMap['status'] : 10;

    const list = [];
    for (let i = 0; i < data.length; i++) {
      const r = data[i];
      const loanId = String(r[idColIdx] || '').trim();
      if (!loanId) continue;

      list.push({
        loanId: loanId,
        borrowerId: String(r[bIdColIdx] || '').trim(),
        borrowerName: String(r[bNameColIdx] || '').trim(),
        loanType: String(r[typeColIdx] || '').trim(),
        amount: safeParseNumber(r[amtColIdx], 0),
        remainingBalance: safeParseNumber(r[balColIdx], 0),
        status: String(r[statusColIdx] || 'Active').trim()
      });
    }
    return list;
  } catch (err) {
    Logger.log('getAllLoansForDeletion error: ' + err.message);
    return [];
  }
}

function processDeleteLoan(loanId) {
  if (!loanId) throw new Error('Loan ID is required');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const loansSheet = ss.getSheetByName('Loans');
  const amortSheet = ss.getSheetByName('Amortization');
  const paymentsSheet = ss.getSheetByName('Payments');

  if (!loansSheet) throw new Error('"Loans" sheet not found.');

  const targetId = String(loanId).trim();
  let borrowerName = '';

  // 1. Delete matching loan row from Loans sheet
  const loanData = loansSheet.getDataRange().getValues();
  let loanDeleted = false;
  for (let i = loanData.length - 1; i >= 1; i--) {
    if (String(loanData[i][0]).trim() === targetId) {
      borrowerName = String(loanData[i][2] || '').trim();
      loansSheet.deleteRow(i + 1);
      loanDeleted = true;
      break;
    }
  }

  if (!loanDeleted) {
    throw new Error('Loan ID "' + targetId + '" was not found in Loans sheet.');
  }

  // 2. Cascade delete all rows for this Loan ID from Amortization sheet (delete bottom-up)
  let deletedAmortRows = 0;
  if (amortSheet && amortSheet.getLastRow() > 1) {
    const amortData = amortSheet.getDataRange().getValues();
    for (let j = amortData.length - 1; j >= 1; j--) {
      if (String(amortData[j][0]).trim() === targetId) {
        amortSheet.deleteRow(j + 1);
        deletedAmortRows++;
      }
    }
  }

  // 3. Cascade delete any payment records for this Loan ID from Payments sheet
  let deletedPaymentRows = 0;
  if (paymentsSheet && paymentsSheet.getLastRow() > 1) {
    const paymentData = paymentsSheet.getDataRange().getValues();
    for (let k = paymentData.length - 1; k >= 1; k--) {
      if (String(paymentData[k][1]).trim() === targetId) {
        paymentsSheet.deleteRow(k + 1);
        deletedPaymentRows++;
      }
    }
  }

  // 4. Log Audit
  const details = 'Deleted loan ' + targetId + ' (' + borrowerName + '), removed ' + deletedAmortRows + ' amortization rows' + (deletedPaymentRows > 0 ? (' and ' + deletedPaymentRows + ' payment rows') : '');
  logAudit('DELETE_LOAN', details);

  return {
    success: true,
    loanId: targetId,
    borrowerName: borrowerName,
    deletedAmortRows: deletedAmortRows,
    deletedPaymentRows: deletedPaymentRows
  };
}

/**
 * 8. DELETE BORROWER WITH ACTIVE LOAN SAFEGUARDS & CASCADE
 */
function getBorrowersForDeletion() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const bSheet = ss.getSheetByName('Borrowers');
    const lSheet = ss.getSheetByName('Loans');
    if (!bSheet || bSheet.getLastRow() <= 1) return [];

    const bData = bSheet.getDataRange().getValues();
    bData.shift(); // remove header

    // Map loans to calculate active loans and balance
    const borrowerLoanStats = {};
    if (lSheet && lSheet.getLastRow() > 1) {
      const lData = lSheet.getDataRange().getValues();
      const lHeaders = lData.shift();
      const hMap = {};
      lHeaders.forEach((h, idx) => { if (h) hMap[String(h).trim().toLowerCase()] = idx; });
      const bIdIdx = hMap['borrower id'] !== undefined ? hMap['borrower id'] : 1;
      const bNameIdx = hMap['borrower name'] !== undefined ? hMap['borrower name'] : 2;
      const balIdx = hMap['remaining bal'] !== undefined ? hMap['remaining bal'] : 9;
      const statIdx = hMap['status'] !== undefined ? hMap['status'] : 10;

      lData.forEach(r => {
        const bId = String(r[bIdIdx] || '').trim();
        const bName = String(r[bNameIdx] || '').trim();
        const bal = safeParseNumber(r[balIdx], 0);
        const status = String(r[statIdx] || '').trim();

        const keys = [bId, bName].filter(Boolean);
        keys.forEach(k => {
          if (!borrowerLoanStats[k]) {
            borrowerLoanStats[k] = { activeLoans: 0, balance: 0, totalLoans: 0 };
          }
          borrowerLoanStats[k].totalLoans++;
          if (status === 'Active' || bal > 0) {
            borrowerLoanStats[k].activeLoans++;
            borrowerLoanStats[k].balance += bal;
          }
        });
      });
    }

    const list = [];
    bData.forEach(r => {
      const bId = String(r[0] || '').trim();
      const bName = String(r[1] || '').trim();
      if (!bId && !bName) return;

      const stats = borrowerLoanStats[bId] || borrowerLoanStats[bName] || { activeLoans: 0, balance: 0 };
      list.push({
        borrowerId: bId,
        borrowerName: bName,
        address: String(r[2] || '').trim(),
        phone: String(r[3] || '').trim(),
        email: String(r[4] || '').trim(),
        activeLoanCount: stats.activeLoans,
        totalOutstandingBalance: Math.round(stats.balance * 100) / 100
      });
    });

    return list;
  } catch (err) {
    Logger.log('getBorrowersForDeletion error: ' + err.message);
    return [];
  }
}

function processDeleteBorrower(borrowerId, cascade) {
  if (!borrowerId) throw new Error('Borrower ID is required');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const bSheet = ss.getSheetByName('Borrowers');
  const lSheet = ss.getSheetByName('Loans');
  const aSheet = ss.getSheetByName('Amortization');
  const pSheet = ss.getSheetByName('Payments');

  if (!bSheet) throw new Error('"Borrowers" sheet not found.');

  const targetId = String(borrowerId).trim();
  let borrowerName = '';

  // 1. Locate borrower row
  const bData = bSheet.getDataRange().getValues();
  let borrowerRowIndex = -1;
  for (let i = 1; i < bData.length; i++) {
    if (String(bData[i][0]).trim() === targetId || String(bData[i][1]).trim() === targetId) {
      borrowerRowIndex = i + 1;
      borrowerName = String(bData[i][1] || '').trim();
      break;
    }
  }

  if (borrowerRowIndex === -1) {
    throw new Error('Borrower "' + targetId + '" was not found in Borrowers sheet.');
  }

  // 2. Identify all loans belonging to this borrower
  const targetLoanIds = [];
  let totalActiveDebt = 0;

  if (lSheet && lSheet.getLastRow() > 1) {
    const lData = lSheet.getDataRange().getValues();
    for (let j = 1; j < lData.length; j++) {
      const rowBId = String(lData[j][1] || '').trim();
      const rowBName = String(lData[j][2] || '').trim();
      if (rowBId === targetId || (borrowerName && rowBName === borrowerName)) {
        const loanId = String(lData[j][0] || '').trim();
        if (loanId) targetLoanIds.push(loanId);
        const bal = safeParseNumber(lData[j][9], 0);
        const status = String(lData[j][10] || '').trim();
        if (status === 'Active' || bal > 0) {
          totalActiveDebt += bal;
        }
      }
    }
  }

  // 3. Safeguard check
  if (totalActiveDebt > 0 && !cascade) {
    throw new Error('Cannot delete ' + borrowerName + ': Active debt of PHP ' + totalActiveDebt.toLocaleString() + ' detected. Please enable cascade deletion.');
  }

  let deletedLoansCount = 0;
  let deletedAmortRows = 0;
  let deletedPaymentRows = 0;

  // 4. If cascade or loans exist, clean up loans, amortizations, payments bottom-up
  if (cascade && targetLoanIds.length > 0) {
    // Delete from Amortization
    if (aSheet && aSheet.getLastRow() > 1) {
      const aData = aSheet.getDataRange().getValues();
      for (let a = aData.length - 1; a >= 1; a--) {
        const lId = String(aData[a][0] || '').trim();
        const bN = String(aData[a][1] || '').trim();
        if (targetLoanIds.includes(lId) || (borrowerName && bN === borrowerName)) {
          aSheet.deleteRow(a + 1);
          deletedAmortRows++;
        }
      }
    }

    // Delete from Payments
    if (pSheet && pSheet.getLastRow() > 1) {
      const pData = pSheet.getDataRange().getValues();
      for (let p = pData.length - 1; p >= 1; p--) {
        const lId = String(pData[p][1] || '').trim();
        const bN = String(pData[p][2] || '').trim();
        if (targetLoanIds.includes(lId) || (borrowerName && bN === borrowerName)) {
          pSheet.deleteRow(p + 1);
          deletedPaymentRows++;
        }
      }
    }

    // Delete from Loans
    if (lSheet && lSheet.getLastRow() > 1) {
      const lData = lSheet.getDataRange().getValues();
      for (let l = lData.length - 1; l >= 1; l--) {
        const lId = String(lData[l][0] || '').trim();
        if (targetLoanIds.includes(lId)) {
          lSheet.deleteRow(l + 1);
          deletedLoansCount++;
        }
      }
    }
  }

  // 5. Delete borrower row from Borrowers sheet
  bSheet.deleteRow(borrowerRowIndex);

  // 6. Log audit
  const logDetails = 'Deleted borrower ' + targetId + ' (' + borrowerName + ')' + 
    (cascade ? (' [Cascade: ' + deletedLoansCount + ' loans, ' + deletedAmortRows + ' amortization rows, ' + deletedPaymentRows + ' payments]') : '');
  logAudit('DELETE_BORROWER', logDetails);

  return {
    success: true,
    borrowerId: targetId,
    borrowerName: borrowerName,
    deletedLoansCount: deletedLoansCount,
    deletedAmortRows: deletedAmortRows,
    deletedPaymentRows: deletedPaymentRows
  };
}

/**
 * 9. RECORD FILTERING ENGINE (BY LOAN ID OR BORROWER)
 */
function getFilterOptions() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const lSheet = ss.getSheetByName('Loans');
    const bSheet = ss.getSheetByName('Borrowers');

    const loans = [];
    if (lSheet && lSheet.getLastRow() > 1) {
      const lData = lSheet.getDataRange().getValues();
      lData.shift();
      lData.forEach(r => {
        const lId = String(r[0] || '').trim();
        const bName = String(r[2] || '').trim();
        const status = String(r[10] || 'Active').trim();
        if (lId) loans.push({ loanId: lId, borrowerName: bName, status: status });
      });
    }

    const borrowers = [];
    if (bSheet && bSheet.getLastRow() > 1) {
      const bData = bSheet.getDataRange().getValues();
      bData.shift();
      bData.forEach(r => {
        const bId = String(r[0] || '').trim();
        const bName = String(r[1] || '').trim();
        if (bId || bName) borrowers.push({ borrowerId: bId, borrowerName: bName });
      });
    }

    return { loans: loans, borrowers: borrowers };
  } catch (err) {
    Logger.log('getFilterOptions error: ' + err.message);
    return { loans: [], borrowers: [] };
  }
}

function applySheetFilter(filterType, filterValue) {
  if (!filterValue) throw new Error('Filter value is required');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const val = String(filterValue).trim();

  const configs = [
    {
      sheetName: 'Loans',
      colIndex: (filterType === 'loan' ? 1 : 3)
    },
    {
      sheetName: 'Amortization',
      colIndex: (filterType === 'loan' ? 1 : 2)
    },
    {
      sheetName: 'Payments',
      colIndex: (filterType === 'loan' ? 2 : 3)
    }
  ];

  configs.forEach(cfg => {
    const sheet = ss.getSheetByName(cfg.sheetName);
    if (!sheet || sheet.getLastRow() <= 1) return;

    let filter = sheet.getFilter();
    if (!filter) {
      filter = sheet.getDataRange().createFilter();
    }
    const criteria = SpreadsheetApp.newFilterCriteria()
      .whenTextEqualTo(val)
      .build();
    filter.setColumnFilterCriteria(cfg.colIndex, criteria);
  });

  logAudit('APPLY_FILTER', 'Filtered database sheets by ' + filterType + ': ' + val);
  return { success: true, filterType: filterType, filterValue: val };
}

function clearAllSheetFilters() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const targetSheets = ['Loans', 'Amortization', 'Payments'];
  targetSheets.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      const filter = sheet.getFilter();
      if (filter) {
        filter.remove();
      }
    }
  });

  logAudit('CLEAR_FILTERS', 'Removed all sheet filters');
  try {
    SpreadsheetApp.getUi().alert('Success: Sheet filters removed. All rows are now visible across Loans, Amortization, and Payments.');
  } catch (e) {
    // Suppress if called from HTML modal
  }
  return { success: true };
}

function logAudit(action, details) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = ss.getSheetByName('AuditLogs');
    if (!logSheet) {
      logSheet = ss.insertSheet('AuditLogs');
      logSheet.appendRow(['Timestamp', 'User Email', 'Action', 'Details']);
    }
    const userEmail = (Session.getActiveUser() && Session.getActiveUser().getEmail()) || 'Cashier Portal';
    logSheet.appendRow([
      new Date(),
      userEmail,
      action,
      details
    ]);
  } catch (err) {
    Logger.log('logAudit error: ' + err.message);
  }
}



/**
 * ONE-CLICK REFRESH: REPOPULATES THE "LoanTypes" TAB WITH ALL 7 LOAN TYPES
 */
function syncLoanTypesTable() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('LoanTypes');
  if (!sheet) {
    sheet = ss.insertSheet('LoanTypes');
  }
  
  sheet.clear();
  
  const headers = ['Type ID', 'Name'];
  const data = [
    ['LT-001', 'Regular Loan'],
    ['LT-002', 'Business Loan'],
    ['LT-003', 'Emergency Loan'],
    ['LT-004', 'Educational Loan'],
    ['LT-005', 'Mid/Year End Loan'],
    ['LT-006', 'Capital Build Up Loan'],
    ['LT-007', 'Grocery Loan']
  ];
  
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#0f2b5c')
    .setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  
  data.forEach(r => sheet.appendRow(r));
  
  logAudit('SYNC_LOAN_TYPES', 'Refreshed LoanTypes table with 2 columns: Type ID, Name');
  SpreadsheetApp.getUi().alert('Success! "LoanTypes" tab has been refreshed with 2 columns (Type ID, Name).');
}

/**
 * ONE-CLICK UTILITY: APPLY DARK NAVY HEADERS ACROSS ALL EXISTING SHEETS
 */
function applyDarkHeaderStyle() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tables = [
    { name: 'Dashboard', cols: 3 },
    { name: 'Borrowers', cols: 6 },
    { name: 'LoanTypes', cols: 2 },
    { name: 'Loans', cols: 11 },
    { name: 'Amortization', cols: 11 },
    { name: 'Payments', cols: 11 },
    { name: 'AuditLogs', cols: 4 }
  ];
  const darkNavy = '#0f2b5c';
  let count = 0;

  tables.forEach(t => {
    const sheet = ss.getSheetByName(t.name);
    if (sheet) {
      const colCount = Math.max(sheet.getLastColumn(), t.cols);
      sheet.getRange(1, 1, 1, colCount)
        .setFontWeight('bold')
        .setBackground(darkNavy)
        .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      if (t.name === 'Borrowers') {
        sheet.getRange('D:D').setNumberFormat('@');
      }
      count++;
    }
  });

  logAudit('STYLE_UPDATE', 'Applied dark navy headers across sheets');
  SpreadsheetApp.getUi().alert('Success! Applied darker blue headers (' + darkNavy + ') across all ' + count + ' sheets.');
}

/**
  * 8. PAYMENT REMINDERS & DUE DATE HUB BACKEND
  * Advance-Payment Aware: checks the first unpaid installment row.
  * If a client already paid for today in advance, their next due installment is in the future.
  */
function getPaymentRemindersList() {
  try {
    const activeLoans = getActiveLoansList();
    if (!activeLoans || activeLoans.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = formatDateISO(today);

    // Read AuditLogs to find last reminder timestamp for each loan
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const auditSheet = ss.getSheetByName('AuditLogs');
    const reminderHistory = {};

    if (auditSheet && auditSheet.getLastRow() > 1) {
      try {
        const auditData = auditSheet.getDataRange().getValues();
        // Scan AuditLogs from newest to oldest for speed
        for (let a = auditData.length - 1; a >= 1; a--) {
          const action = String(auditData[a][2] || '').trim();
          const details = String(auditData[a][3] || '').trim();
          if (action === 'REMINDER_SENT') {
            // Details format: "Loan ID: LN-2024-001 | To: member@email.com"
            const match = details.match(/Loan ID:\s*([A-Za-z0-9-_]+)/);
            if (match && match[1]) {
              const lId = match[1];
              if (!reminderHistory[lId]) {
                const ts = auditData[a][0];
                const dateObj = ts instanceof Date ? ts : safeParseDate(ts);
                if (!isNaN(dateObj.getTime())) {
                  const dateISO = formatDateISO(dateObj);
                  let timeStr = '';
                  try {
                    timeStr = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'yyyy-MM-dd hh:mm a');
                  } catch (e) {
                    timeStr = dateISO;
                  }
                  reminderHistory[lId] = {
                    dateISO: dateISO,
                    sentToday: (dateISO === todayISO),
                    displayStr: timeStr
                  };
                }
              }
            }
          }
        }
      } catch (auditErr) {
        Logger.log('Warning: could not scan audit history: ' + auditErr.message);
      }
    }

    const reminders = [];
    activeLoans.forEach(loan => {
      let due = safeParseDate(loan.dueDate);
      if (isNaN(due.getTime())) {
        const parts = String(loan.dueDate || '').split('-');
        if (parts.length === 3) {
          due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }
      }
      if (isNaN(due.getTime())) {
        due = new Date();
      }
      due.setHours(0, 0, 0, 0);

      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let tier = '';
      if (diffDays < 0) {
        tier = 'overdue';
      } else if (diffDays === 0) {
        tier = 'today';
      } else {
        tier = 'upcoming';
      }

      const history = reminderHistory[loan.loanId] || null;

      reminders.push({
        loanId: loan.loanId,
        borrowerId: loan.borrowerId,
        borrowerName: loan.borrowerName,
        email: loan.email || '',
        amountDue: loan.monthlyAmortization,
        dueDate: loan.dueDate,
        monthIndex: loan.monthIndex,
        monthName: loan.monthName || ('Month #' + loan.monthIndex),
        isUnderpaid: !!loan.isUnderpaid,
        tier: tier,
        daysOverdue: tier === 'overdue' ? Math.abs(diffDays) : 0,
        daysUntilDue: tier === 'upcoming' ? diffDays : 0,
        isGracePeriod: !!loan.isGracePeriod,
        isPastGracePeriod: !!loan.isPastGracePeriod,
        graceDaysLeft: loan.graceDaysLeft || 0,
        penaltyBasis: loan.penaltyBasis || loan.monthlyAmortization,
        penaltyRate: loan.penaltyRate || 3.0,
        penaltyAmount: loan.defaultPenalty || 0,
        sentToday: !!(history && history.sentToday),
        lastSentDisplay: history ? history.displayStr : ''
      });
    });

    // Sort order: Overdue first (descending days late), then Due Today, then Upcoming (ascending days until due)
    const tierWeight = { overdue: 1, today: 2, upcoming: 3 };
    reminders.sort((a, b) => {
      if (tierWeight[a.tier] !== tierWeight[b.tier]) {
        return tierWeight[a.tier] - tierWeight[b.tier];
      }
      if (a.tier === 'overdue') {
        return b.daysOverdue - a.daysOverdue;
      }
      return a.daysUntilDue - b.daysUntilDue;
    });

    return reminders;
  } catch (err) {
    Logger.log('getPaymentRemindersList error: ' + err.message);
    return [];
  }
}

function processSendPaymentReminders(selectedLoanIds) {
  try {
    if (!selectedLoanIds || selectedLoanIds.length === 0) {
      return { success: false, error: 'No loans selected.' };
    }

    const allReminders = getPaymentRemindersList();
    const idSet = new Set(selectedLoanIds.map(String));
    const toSend = allReminders.filter(r => idSet.has(String(r.loanId)));

    let sentCount = 0;
    let skippedCount = 0;
    const sentLoanIds = [];

    toSend.forEach(item => {
      if (!item.email || !item.email.includes('@')) {
        skippedCount++;
        return;
      }

      let subject = '';
      let badgeHtml = '';
      let headlineHtml = '';
      let bodyText = '';

      const fmtAmt = Number(item.amountDue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmtPenalty = Number(item.penaltyAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      if (item.tier === 'overdue') {
        subject = 'OVERDUE LOAN PAYMENT ALERT - ' + item.borrowerName + ' [' + item.loanId + ']';
        badgeHtml = '<span style="background-color: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 11px;">OVERDUE BY ' + item.daysOverdue + ' DAYS</span>';
        headlineHtml = 'Your loan installment was due on <strong>' + item.dueDate + '</strong> and is currently <strong>' + item.daysOverdue + ' days past due</strong>. An agreed late penalty of ' + item.penaltyRate + '% (PHP ' + fmtPenalty + ') has been incurred.';
        bodyText = 'Please settle your overdue installment immediately to avoid further penalty accumulation and maintain good credit standing with the cooperative.';
      } else if (item.tier === 'today') {
        subject = 'PAYMENT DUE TODAY - ' + item.borrowerName + ' [' + item.loanId + ']';
        badgeHtml = '<span style="background-color: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 11px;">DUE TODAY (' + item.dueDate + ')</span>';
        headlineHtml = 'This is a friendly notification that your loan installment is <strong>due today (' + item.dueDate + ')</strong>.';
        bodyText = 'Kindly process your payment today.';
      } else {
        subject = 'UPCOMING PAYMENT REMINDER - ' + item.borrowerName + ' [' + item.loanId + ']';
        badgeHtml = '<span style="background-color: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 11px;">DUE IN ' + item.daysUntilDue + ' DAYS</span>';
        headlineHtml = 'This is an advance reminder that your next loan installment is due in <strong>' + item.daysUntilDue + ' days</strong> on <strong>' + item.dueDate + '</strong>.';
        bodyText = 'Please keep this due date in mind for your payment planning.';
      }

      const emailHtml = 
        '<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden;">' +
          '<div style="background-color: #0f2b5c; padding: 20px 24px; text-align: center; color: #ffffff;">' +
            '<h2 style="margin: 0; font-size: 18px; letter-spacing: 0.5px; text-transform: uppercase;">Saint Joseph Multipurpose Cooperative</h2>' +
          '</div>' +
          '<div style="padding: 24px; background-color: #ffffff;">' +
            '<div style="margin-bottom: 16px;">' + badgeHtml + '</div>' +
            '<p style="margin-top: 0; font-size: 14px;">Dear <strong>' + item.borrowerName + '</strong>,</p>' +
            '<p style="font-size: 13.5px; line-height: 1.5; color: #334155;">' + headlineHtml + '</p>' +
            '<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 18px 0;">' +
              '<table style="width: 100%; font-size: 13px; border-collapse: collapse;">' +
                '<tr><td style="padding: 5px 0; color: #64748b;">Loan Account No:</td><td style="padding: 5px 0; font-weight: bold; text-align: right; font-family: monospace;">' + item.loanId + '</td></tr>' +
                '<tr><td style="padding: 5px 0; color: #64748b;">Installment Month:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">Month #' + item.monthIndex + ' (' + item.monthName + ')</td></tr>' +
                '<tr><td style="padding: 5px 0; color: #64748b;">Scheduled Due Date:</td><td style="padding: 5px 0; font-weight: bold; text-align: right; color: #0f2b5c;">' + item.dueDate + '</td></tr>' +
                '<tr style="border-top: 1px solid #e2e8f0;"><td style="padding: 8px 0 4px 0; font-weight: bold; color: #0f172a;">Regular Installment Due:</td><td style="padding: 8px 0 4px 0; font-weight: bold; font-size: 15px; color: #0f766e; text-align: right;">PHP ' + fmtAmt + '</td></tr>' +
                (item.tier === 'overdue' && item.penaltyAmount > 0 ? ('<tr><td style="padding: 4px 0; color: #b45309;">Late Penalty Fee (' + item.penaltyRate + '%):</td><td style="padding: 4px 0; font-weight: bold; color: #b45309; text-align: right;">PHP ' + fmtPenalty + '</td></tr>') : '') +
              '</table>' +
            '</div>' +
            '<p style="font-size: 13px; color: #475569; line-height: 1.5;">' + bodyText + '</p>' +
            '<p style="font-size: 11.5px; color: #94a3b8; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px;">' +
              'Note: If you have already processed this payment within the last 24 hours, please disregard this notice. Thank you for your continued partnership with Saint Joseph Multipurpose Cooperative.' +
            '</p>' +
          '</div>' +
        '</div>';

      const plainText = 
        'SAINT JOSEPH MULTIPURPOSE COOPERATIVE\n' +
        'PAYMENT NOTIFICATION\n' +
        '==========================================\n' +
        'Dear ' + item.borrowerName + ',\n\n' +
        'Loan ID: ' + item.loanId + '\n' +
        'Installment: Month #' + item.monthIndex + ' (' + item.monthName + ')\n' +
        'Due Date: ' + item.dueDate + '\n' +
        'Amount Due: PHP ' + fmtAmt + '\n' +
        (item.tier === 'overdue' ? ('Late Penalty Fee: PHP ' + fmtPenalty + ' (' + item.daysOverdue + ' days overdue)\n') : '') +
        '\n' + bodyText + '\n\n' +
        'Saint Joseph Multipurpose Cooperative';

      try {
        sendCoopEmail(item.email, subject, plainText, {
          name: 'Saint Joseph Multipurpose Cooperative',
          htmlBody: emailHtml
        });
        sentCount++;
        sentLoanIds.push(item.loanId);
        // Log individual loan audit record for instant duplication detection
        logAudit('REMINDER_SENT', 'Loan ID: ' + item.loanId + ' | To: ' + item.email + ' | Tier: ' + item.tier + ' | Due: ' + item.dueDate);
      } catch (mailErr) {
        skippedCount++;
        Logger.log('Could not send reminder to ' + item.email + ': ' + mailErr.message);
      }
    });

    logAudit('SEND_REMINDERS', 'Dispatched ' + sentCount + ' payment reminder email(s) for loans: ' + sentLoanIds.join(', '));
    return {
      success: true,
      sentCount: sentCount,
      skippedCount: skippedCount
    };
  } catch (err) {
    Logger.log('processSendPaymentReminders error: ' + err.message);
    return { success: false, error: err.message };
  }
}

/**
 * ============================================================================
 * 10. EDIT BORROWER PROFILE & CASCADE UPDATES
 * ============================================================================
 */
function getAllBorrowersForEdit() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const bSheet = ss.getSheetByName('Borrowers');
    if (!bSheet || bSheet.getLastRow() <= 1) return [];

    const data = bSheet.getDataRange().getValues();
    data.shift(); // remove header

    return data
      .filter(r => r[0] && String(r[0]).trim() !== '')
      .map(r => ({
        borrowerId: String(r[0]).trim(),
        borrowerName: String(r[1] || '').trim(),
        address: String(r[2] || '').trim(),
        phone: String(r[3] || '').trim(),
        email: String(r[4] || '').trim(),
        dateJoined: String(r[5] || '').trim()
      }));
  } catch (err) {
    Logger.log('getAllBorrowersForEdit error: ' + err.message);
    return [];
  }
}

function processUpdateBorrower(formData) {
  if (!formData || !formData.borrowerId) {
    throw new Error('Borrower ID is required.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const bSheet = ss.getSheetByName('Borrowers');
  const lSheet = ss.getSheetByName('Loans');
  const aSheet = ss.getSheetByName('Amortization');
  const pSheet = ss.getSheetByName('Payments');

  if (!bSheet) throw new Error('"Borrowers" sheet not found.');

  const targetId = String(formData.borrowerId).trim();
  const newName = String(formData.borrowerName || '').trim();
  const newAddress = String(formData.address || '').trim();
  const newPhone = String(formData.phone || '').trim();
  const newEmail = String(formData.email || '').trim();

  if (!newName) throw new Error('Borrower Name cannot be empty.');

  // 1. Locate and update Borrowers sheet
  const bData = bSheet.getDataRange().getValues();
  let oldName = '';
  let foundRow = -1;
  for (let i = 1; i < bData.length; i++) {
    if (String(bData[i][0]).trim() === targetId) {
      foundRow = i + 1;
      oldName = String(bData[i][1] || '').trim();
      break;
    }
  }

  if (foundRow === -1) {
    throw new Error('Borrower ID "' + targetId + '" not found in Borrowers sheet.');
  }

  bSheet.getRange(foundRow, 2).setValue(newName);
  bSheet.getRange(foundRow, 3).setValue(newAddress);
  bSheet.getRange(foundRow, 4).setValue(newPhone);
  bSheet.getRange(foundRow, 5).setValue(newEmail);

  let cascadedLoans = 0;
  let cascadedAmort = 0;
  let cascadedPayments = 0;

  // 2. If name changed, cascade to Loans, Amortization, and Payments sheets
  if (oldName !== newName) {
    if (lSheet && lSheet.getLastRow() > 1) {
      const lData = lSheet.getDataRange().getValues();
      for (let j = 1; j < lData.length; j++) {
        if (String(lData[j][1]).trim() === targetId || String(lData[j][2]).trim() === oldName) {
          lSheet.getRange(j + 1, 3).setValue(newName);
          cascadedLoans++;
        }
      }
    }

    if (aSheet && aSheet.getLastRow() > 1) {
      const aData = aSheet.getDataRange().getValues();
      for (let k = 1; k < aData.length; k++) {
        if (String(aData[k][1]).trim() === oldName) {
          aSheet.getRange(k + 1, 2).setValue(newName);
          cascadedAmort++;
        }
      }
    }

    if (pSheet && pSheet.getLastRow() > 1) {
      const pData = pSheet.getDataRange().getValues();
      for (let m = 1; m < pData.length; m++) {
        if (String(pData[m][2]).trim() === oldName) {
          pSheet.getRange(m + 1, 3).setValue(newName);
          cascadedPayments++;
        }
      }
    }
  }

  logAudit('EDIT_BORROWER', 'Updated profile for ' + targetId + ' (' + newName + '). Name change cascaded to ' + cascadedLoans + ' loan(s), ' + cascadedAmort + ' amort row(s), and ' + cascadedPayments + ' payment(s).');

  return {
    success: true,
    borrowerId: targetId,
    borrowerName: newName,
    cascadedLoans: cascadedLoans,
    cascadedAmort: cascadedAmort,
    cascadedPayments: cascadedPayments
  };
}

/**
 * ============================================================================
 * 11. EDIT LOAN PARAMETERS & SCHEDULE REGENERATION
 * ============================================================================
 */
function getLoanDetailsForEdit(loanId) {
  if (!loanId) return null;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lSheet = ss.getSheetByName('Loans');
  const aSheet = ss.getSheetByName('Amortization');
  const pSheet = ss.getSheetByName('Payments');
  if (!lSheet) return null;

  const targetId = String(loanId).trim();
  const lData = lSheet.getDataRange().getValues();
  const lHeader = lData[0];
  const hMap = {};
  lHeader.forEach((h, idx) => { if (h) hMap[String(h).trim().toLowerCase()] = idx; });

  let loanObj = null;
  for (let i = 1; i < lData.length; i++) {
    if (String(lData[i][0]).trim() === targetId) {
      loanObj = {
        loanId: targetId,
        borrowerId: String(lData[i][hMap['borrower id'] !== undefined ? hMap['borrower id'] : 1] || '').trim(),
        borrowerName: String(lData[i][hMap['borrower name'] !== undefined ? hMap['borrower name'] : 2] || '').trim(),
        loanType: String(lData[i][hMap['type'] !== undefined ? hMap['type'] : 3] || '').trim(),
        amount: safeParseNumber(lData[i][hMap['amount (₱)'] !== undefined ? hMap['amount (₱)'] : (hMap['amount'] !== undefined ? hMap['amount'] : 4)], 0),
        months: parseInt(lData[i][hMap['months'] !== undefined ? hMap['months'] : 5], 10) || 36,
        rate: safeParseNumber(lData[i][hMap['rate (%)'] !== undefined ? hMap['rate (%)'] : (hMap['rate'] !== undefined ? hMap['rate'] : 6)], 0.75),
        penaltyRate: safeParseNumber(lData[i][hMap['penalty (%)'] !== undefined ? hMap['penalty (%)'] : (hMap['penalty'] !== undefined ? hMap['penalty'] : 7)], 3.0),
        startDate: formatDateISO(safeParseDate(lData[i][hMap['date granted'] !== undefined ? hMap['date granted'] : 8])),
        remainingBal: safeParseNumber(lData[i][hMap['remaining bal'] !== undefined ? hMap['remaining bal'] : 9], 0),
        status: String(lData[i][hMap['status'] !== undefined ? hMap['status'] : 10] || 'Active').trim()
      };
      break;
    }
  }

  if (!loanObj) return null;

  // Check if any payments have been recorded for this loan
  let paidCount = 0;
  let totalPaidAmount = 0;
  if (pSheet && pSheet.getLastRow() > 1) {
    const pData = pSheet.getDataRange().getValues();
    for (let p = 1; p < pData.length; p++) {
      if (String(pData[p][1]).trim() === targetId) {
        paidCount++;
        totalPaidAmount += safeParseNumber(pData[p][4], 0);
      }
    }
  }

  loanObj.paidInstallmentCount = paidCount;
  loanObj.totalPaidAmount = Math.round(totalPaidAmount * 100) / 100;
  loanObj.hasPayments = paidCount > 0;

  return loanObj;
}

function processUpdateLoan(formData) {
  if (!formData || !formData.loanId) throw new Error('Loan ID is required');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lSheet = ss.getSheetByName('Loans');
  const aSheet = ss.getSheetByName('Amortization');

  if (!lSheet) throw new Error('"Loans" sheet not found');

  const targetId = String(formData.loanId).trim();
  const currentLoan = getLoanDetailsForEdit(targetId);
  if (!currentLoan) throw new Error('Loan "' + targetId + '" not found.');

  const newType = String(formData.loanType || currentLoan.loanType).trim();
  const newPenaltyRate = safeParseNumber(formData.penaltyRate, currentLoan.penaltyRate);

  // Find row in Loans sheet
  const lData = lSheet.getDataRange().getValues();
  let loanRowIdx = -1;
  for (let i = 1; i < lData.length; i++) {
    if (String(lData[i][0]).trim() === targetId) {
      loanRowIdx = i + 1;
      break;
    }
  }

  if (loanRowIdx === -1) throw new Error('Loan row not found.');

  // If payments have been recorded, only allow metadata updates (product type & penalty rate)
  if (currentLoan.hasPayments) {
    lSheet.getRange(loanRowIdx, 4).setValue(newType);
    ensureLoansPenaltyColumn();
    const lHeaders = lSheet.getRange(1, 1, 1, Math.max(lSheet.getLastColumn(), 1)).getValues()[0];
    const penCol = lHeaders.indexOf('Penalty (%)');
    if (penCol !== -1) {
      lSheet.getRange(loanRowIdx, penCol + 1).setValue(newPenaltyRate);
    }
    logAudit('EDIT_LOAN', 'Updated loan metadata for ' + targetId + ' (Type: ' + newType + ', Penalty: ' + newPenaltyRate + '%). Core terms preserved due to ' + currentLoan.paidInstallmentCount + ' recorded payments.');
    return {
      success: true,
      loanId: targetId,
      regenerated: false,
      message: 'Loan product type and penalty rate updated successfully.'
    };
  }

  // If NO payments have been made yet, allow full recalculation of schedule!
  const newAmount = safeParseNumber(formData.amount, currentLoan.amount);
  const newMonths = parseInt(formData.months, 10) || currentLoan.months;
  const newRate = safeParseNumber(formData.rate, currentLoan.rate);
  const newStartDateStr = formData.startDate || currentLoan.startDate;
  const newStartDate = safeParseDate(newStartDateStr);

  // 1. Update Loans row
  lSheet.getRange(loanRowIdx, 4).setValue(newType);
  lSheet.getRange(loanRowIdx, 5).setValue(newAmount);
  lSheet.getRange(loanRowIdx, 6).setValue(newMonths);
  lSheet.getRange(loanRowIdx, 7).setValue(newRate);

  ensureLoansPenaltyColumn();
  const lHeaders = lSheet.getRange(1, 1, 1, Math.max(lSheet.getLastColumn(), 1)).getValues()[0];
  const penCol = lHeaders.indexOf('Penalty (%)');
  if (penCol !== -1) {
    lSheet.getRange(loanRowIdx, penCol + 1).setValue(newPenaltyRate);
  }
  lSheet.getRange(loanRowIdx, 9).setValue(newStartDateStr);
  lSheet.getRange(loanRowIdx, 10).setValue(newAmount); // Reset remaining balance to new principal

  // 2. Delete existing amortization rows for this loan
  if (aSheet && aSheet.getLastRow() > 1) {
    const aData = aSheet.getDataRange().getValues();
    for (let k = aData.length - 1; k >= 1; k--) {
      if (String(aData[k][0]).trim() === targetId) {
        aSheet.deleteRow(k + 1);
      }
    }
  }

  // 3. Recalculate full schedule and append
  const schedule = calculateAnnualDiminishingSchedule(newAmount, newMonths, newRate, newStartDate);
  ensureAmortizationHeaders();
  schedule.forEach(row => {
    aSheet.appendRow([
      targetId,
      currentLoan.borrowerName,
      row.monthIndex === 0 ? 'START' : row.monthIndex,
      row.termYear,
      row.monthName,
      row.principal !== undefined ? row.principal : row.principalBalance,
      row.amortization !== undefined ? row.amortization : row.principalPayment,
      row.interestPayment,
      row.monthlyAmortization,
      row.penalty !== undefined ? row.penalty : 0,
      row.amountPaid !== undefined ? row.amountPaid : 0,
      row.status || 'Pending'
    ]);
  });
  applyAmortizationConditionalFormatting(aSheet);

  logAudit('EDIT_LOAN', 'Regenerated loan ' + targetId + ' for ' + currentLoan.borrowerName + ' (Amount: ₱' + newAmount + ', Months: ' + newMonths + ', Rate: ' + newRate + '%, Penalty: ' + newPenaltyRate + '%)');

  return {
    success: true,
    loanId: targetId,
    regenerated: true,
    message: 'Loan terms updated and entire Amortization schedule recalculated successfully.'
  };
}

/**
 * ============================================================================
 * 12. VOID / REVERSE ERRONEOUS PAYMENT & BALANCE RESTORATION
 * ============================================================================
 */
function getPaymentsForVoidList() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const pSheet = ss.getSheetByName('Payments');
    if (!pSheet || pSheet.getLastRow() <= 1) return [];

    const data = pSheet.getDataRange().getValues();
    const header = data.shift();
    const pMap = {};
    header.forEach((h, idx) => { if (h) pMap[String(h).trim().toLowerCase()] = idx; });

    const rNoIdx = pMap['receipt no'] !== undefined ? pMap['receipt no'] : 0;
    const lIdIdx = pMap['loan id'] !== undefined ? pMap['loan id'] : 1;
    const bNameIdx = pMap['borrower name'] !== undefined ? pMap['borrower name'] : 2;
    const dPaidIdx = pMap['date paid'] !== undefined ? pMap['date paid'] : 3;
    const prinPaidIdx = pMap['principal paid'] !== undefined ? pMap['principal paid'] : 4;
    const intPaidIdx = pMap['interest paid'] !== undefined ? pMap['interest paid'] : 5;
    const penPaidIdx = pMap['penalty paid'] !== undefined ? pMap['penalty paid'] : 6;
    const amtPaidIdx = pMap['amount paid'] !== undefined ? pMap['amount paid'] : 8;
    const balAfterIdx = pMap['principal balance after'] !== undefined ? pMap['principal balance after'] : (pMap['balance after'] !== undefined ? pMap['balance after'] : 9);
    const methodIdx = pMap['method'] !== undefined ? pMap['method'] : (header.length - 1);

    const list = [];
    for (let i = data.length - 1; i >= 0; i--) {
      const r = data[i];
      const rNo = String(r[rNoIdx] || '').trim();
      const lId = String(r[lIdIdx] || '').trim();
      if (!rNo || !lId) continue;

      // Skip already voided receipts
      if (String(r[methodIdx] || '').includes('VOID') || rNo.includes('[VOIDED]')) continue;

      list.push({
        receiptNo: rNo,
        loanId: lId,
        borrowerName: String(r[bNameIdx] || '').trim(),
        paymentDate: formatDateISO(safeParseDate(r[dPaidIdx])),
        amountPaid: safeParseNumber(r[amtPaidIdx], 0),
        interestPaid: safeParseNumber(r[intPaidIdx], 0),
        principalPaid: safeParseNumber(r[prinPaidIdx], 0),
        penaltyPaid: safeParseNumber(r[penPaidIdx], 0),
        balanceAfter: safeParseNumber(r[balAfterIdx], 0),
        method: String(r[methodIdx] || 'Cash').trim()
      });
    }

    return list;
  } catch (err) {
    Logger.log('getPaymentsForVoidList error: ' + err.message);
    return [];
  }
}

/**
 * RECONSTRUCT & SYNCHRONIZE LOAN AMORTIZATION SCHEDULE
 * Completely rebuilds the amortization schedule and cascades for a given loan ID
 * based on its original contractual terms and all remaining active (non-voided) payments.
 */
function recalculateLoanAmortizationSchedule(loanId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const amortSheet = ss.getSheetByName('Amortization');
  const loansSheet = ss.getSheetByName('Loans');
  const paymentsSheet = ss.getSheetByName('Payments');

  if (!amortSheet || !loansSheet) {
    throw new Error('Amortization or Loans sheet not found.');
  }

  // 1. Get loan terms from Loans sheet
  const loansData = loansSheet.getDataRange().getValues();
  const lHeaders = loansData[0];
  const lMap = {};
  lHeaders.forEach((h, idx) => { if (h) lMap[String(h).trim().toLowerCase()] = idx; });

  const idCol = lMap['loan id'] !== undefined ? lMap['loan id'] : 0;
  const bIdCol = lMap['borrower id'] !== undefined ? lMap['borrower id'] : 1;
  const bNameCol = lMap['borrower name'] !== undefined ? lMap['borrower name'] : 2;
  const typeCol = lMap['type'] !== undefined ? lMap['type'] : 3;
  const amtCol = lMap['amount (₱)'] !== undefined ? lMap['amount (₱)'] : (lMap['amount'] !== undefined ? lMap['amount'] : 4);
  const monthsCol = lMap['months'] !== undefined ? lMap['months'] : 5;
  const rateCol = lMap['rate (%)'] !== undefined ? lMap['rate (%)'] : (lMap['rate'] !== undefined ? lMap['rate'] : 6);
  const dateGrantedCol = lMap['date granted'] !== undefined ? lMap['date granted'] : 8;
  const remBalCol = lMap['remaining bal'] !== undefined ? lMap['remaining bal'] : 9;
  const statusCol = lMap['status'] !== undefined ? lMap['status'] : 10;

  let loanRowIdx = -1;
  let loanInfo = null;
  for (let i = 1; i < loansData.length; i++) {
    if (String(loansData[i][idCol]).trim() === String(loanId).trim()) {
      loanRowIdx = i + 1;
      loanInfo = {
        loanId: String(loanId).trim(),
        borrowerId: String(loansData[i][bIdCol] || '').trim(),
        borrowerName: String(loansData[i][bNameCol] || '').trim(),
        type: String(loansData[i][typeCol] || '').trim(),
        amount: safeParseNumber(loansData[i][amtCol], 0),
        months: parseInt(loansData[i][monthsCol], 10) || 12,
        rate: safeParseNumber(loansData[i][rateCol], 0),
        dateGranted: loansData[i][dateGrantedCol]
      };
      break;
    }
  }

  if (!loanInfo || loanRowIdx === -1) {
    throw new Error('Loan ID "' + loanId + '" not found in Loans sheet.');
  }

  // 2. Generate baseline diminishing schedule from original loan parameters
  const baseSchedule = calculateAnnualDiminishingSchedule(loanInfo.amount, loanInfo.months, loanInfo.rate, loanInfo.dateGranted);

  // 3. Find all valid (non-voided) payments for this loan from Payments sheet
  const validPayments = [];
  if (paymentsSheet && paymentsSheet.getLastRow() > 1) {
    const pData = paymentsSheet.getDataRange().getValues();
    const pHeaders = pData[0];
    const pMap = {};
    pHeaders.forEach((h, idx) => { if (h) pMap[String(h).trim().toLowerCase()] = idx; });

    const pRNoIdx = pMap['receipt no'] !== undefined ? pMap['receipt no'] : 0;
    const pLIdIdx = pMap['loan id'] !== undefined ? pMap['loan id'] : 1;
    const pAmtIdx = pMap['amount paid'] !== undefined ? pMap['amount paid'] : 8;
    const pPenIdx = pMap['penalty paid'] !== undefined ? pMap['penalty paid'] : 6;
    const pBalAfterIdx = pMap['principal balance after'] !== undefined ? pMap['principal balance after'] : 9;
    const pMethIdx = pMap['method'] !== undefined ? pMap['method'] : (pHeaders.length - 1);

    for (let p = 1; p < pData.length; p++) {
      const lId = String(pData[p][pLIdIdx] || '').trim();
      const rNo = String(pData[p][pRNoIdx] || '').trim();
      const meth = String(pData[p][pMethIdx] || '').trim();
      if (lId === String(loanId).trim()) {
        const isVoided = rNo.includes('[VOIDED]') || meth.toUpperCase().includes('VOID');
        if (!isVoided) {
          validPayments.push({
            receiptNo: rNo,
            amountPaid: safeParseNumber(pData[p][pAmtIdx], 0),
            penaltyPaid: safeParseNumber(pData[p][pPenIdx], 0),
            balanceAfter: safeParseNumber(pData[p][pBalAfterIdx], 0)
          });
        }
      }
    }
  }

  // 4. Replay valid payments across schedule installments
  let liveBalance = roundUp2(loanInfo.amount);

  for (let payIdx = 0; payIdx < validPayments.length; payIdx++) {
    const pay = validPayments[payIdx];
    const penaltyPaid = pay.penaltyPaid;
    let remFunds = Math.max(0, roundUp2(pay.amountPaid - penaltyPaid));

    const pendingInst = [];
    for (let s = 1; s < baseSchedule.length; s++) {
      const st = String(baseSchedule[s].status || '').toLowerCase();
      if (st === 'pending' || st === 'underpaid') {
        pendingInst.push(baseSchedule[s]);
      }
    }

    if (pendingInst.length === 0) break;

    const nextPendingInt = roundUp2(pendingInst[0].interestPayment || 0);
    const isFullPrincipalPayoff = (remFunds >= liveBalance + nextPendingInt) || (remFunds >= liveBalance);

    if (isFullPrincipalPayoff) {
      pendingInst.forEach((inst, idx) => {
        inst.status = 'Paid';
        inst.principal = 0;
        inst.amountPaid = idx === 0 ? roundUp2((inst.amountPaid || 0) + pay.amountPaid) : (inst.amountPaid || 0);
        if (idx === 0 && penaltyPaid > 0) inst.penalty = roundUp2((inst.penalty || 0) + penaltyPaid);
      });
      liveBalance = 0;
      break;
    }

    let settledCount = 0;
    for (let p = 0; p < pendingInst.length; p++) {
      if (remFunds <= 0) break;
      const row = pendingInst[p];
      const schedMonthly = roundUp2(row.monthlyAmortization > 0 ? row.monthlyAmortization : (row.amortization + row.interestPayment));
      const existingNetFundsPaid = Math.max(0, roundUp2((row.amountPaid || 0) - (row.penalty || 0)));
      const alreadyPaidInterest = Math.min(roundUp2(row.interestPayment), existingNetFundsPaid);
      const rowInterest = Math.max(0, roundUp2(row.interestPayment - alreadyPaidInterest));
      const rowPrincipal = Math.max(0, roundUp2(schedMonthly - rowInterest));

      if (remFunds >= schedMonthly) {
        row.status = 'Paid';
        row.amountPaid = roundUp2((row.amountPaid || 0) + schedMonthly + (settledCount === 0 ? penaltyPaid : 0));
        if (settledCount === 0 && penaltyPaid > 0) row.penalty = roundUp2((row.penalty || 0) + penaltyPaid);
        remFunds = Math.max(0, roundUp2(remFunds - schedMonthly));
        liveBalance = Math.max(0, roundUp2(liveBalance - rowPrincipal));
        row.principal = liveBalance;
        settledCount++;
      } else {
        if (p === 0 && settledCount === 0) {
          const intPortion = roundUp2(Math.min(remFunds, rowInterest));
          const prinPortion = Math.max(0, roundUp2(remFunds - intPortion));
          row.status = 'Underpaid';
          row.amountPaid = roundUp2((row.amountPaid || 0) + pay.amountPaid);
          if (penaltyPaid > 0) row.penalty = roundUp2((row.penalty || 0) + penaltyPaid);
          row.monthlyAmortization = Math.max(0, roundUp2(schedMonthly - remFunds));
          liveBalance = Math.max(0, roundUp2(liveBalance - prinPortion));
          row.principal = liveBalance;
          remFunds = 0;
        } else {
          const adv = remFunds;
          row.monthlyAmortization = Math.max(0, roundUp2(schedMonthly - adv));
          liveBalance = Math.max(0, roundUp2(liveBalance - adv));
          remFunds = 0;
        }
        break;
      }
    }

    if (remFunds > 0) {
      liveBalance = Math.max(0, roundUp2(liveBalance - remFunds));
      remFunds = 0;
    }

    // Option 2 replay: If this payment had capitalized penalties (balanceAfter > liveBalance), add to next pending installment
    if (pay.balanceAfter > 0 && liveBalance > 0 && pay.balanceAfter > liveBalance) {
      const capPenalty = roundUp2(pay.balanceAfter - liveBalance);
      liveBalance = pay.balanceAfter;
      if (pendingInst[settledCount]) {
        pendingInst[settledCount].amortization = roundUp2(pendingInst[settledCount].amortization + capPenalty);
        pendingInst[settledCount].monthlyAmortization = roundUp2(pendingInst[settledCount].monthlyAmortization + capPenalty);
      }
    }

    let runningBal = liveBalance;
    for (let s = 1; s < baseSchedule.length; s++) {
      const st = String(baseSchedule[s].status || '').toLowerCase();
      if (st === 'pending' || st === 'underpaid') {
        const curMonthly = safeParseNumber(baseSchedule[s].monthlyAmortization, 0);
        const curInt = safeParseNumber(baseSchedule[s].interestPayment, 0);
        const curPrin = Math.max(0, roundUp2(curMonthly - curInt));
        let newPrin = Math.max(0, roundUp2(runningBal - curPrin));
        if (s === baseSchedule.length - 1 && Math.abs(newPrin) <= 0.05) {
          newPrin = 0;
        }
        baseSchedule[s].principal = newPrin;
        runningBal = newPrin;
      }
    }
  }

  // If no valid payments remain, ensure clean original balances across all rows
  if (validPayments.length === 0) {
    liveBalance = roundUp2(loanInfo.amount);
    let runningBal = liveBalance;
    for (let s = 1; s < baseSchedule.length; s++) {
      baseSchedule[s].status = 'Pending';
      baseSchedule[s].amountPaid = 0;
      baseSchedule[s].penalty = 0;
      const curPrin = safeParseNumber(baseSchedule[s].amortization, 0);
      const newPrin = Math.max(0, roundUp2(runningBal - curPrin));
      baseSchedule[s].principal = newPrin;
      runningBal = newPrin;
    }
  }

  // 5. Update Amortization sheet in-place for this loan
  const amortData = amortSheet.getDataRange().getValues();
  const aHeaders = amortData[0];
  const aLIdCol = aHeaders.indexOf('Loan ID') !== -1 ? aHeaders.indexOf('Loan ID') : 0;
  const aPrinCol = aHeaders.indexOf('Principal') !== -1 ? aHeaders.indexOf('Principal') : 5;

  const targetRowIndices = [];
  for (let r = 1; r < amortData.length; r++) {
    if (String(amortData[r][aLIdCol]).trim() === String(loanId).trim()) {
      targetRowIndices.push(r + 1);
    }
  }

  for (let i = 0; i < targetRowIndices.length && i < baseSchedule.length; i++) {
    const rowNum = targetRowIndices[i];
    const item = baseSchedule[i];
    const rowValues = [
      item.principal !== undefined ? item.principal : item.principalBalance,
      item.amortization !== undefined ? item.amortization : 0,
      item.interestPayment || 0,
      item.monthlyAmortization || 0,
      item.penalty || 0,
      item.amountPaid || 0,
      item.status || 'Pending'
    ];
    amortSheet.getRange(rowNum, aPrinCol + 1, 1, rowValues.length).setValues([rowValues]);
    amortSheet.getRange(rowNum, aPrinCol + 1, 1, 6).setNumberFormat('₱#,##0.00');
  }

  // 6. Update Loans sheet Remaining Bal & Status
  loansSheet.getRange(loanRowIdx, remBalCol + 1).setValue(liveBalance);
  loansSheet.getRange(loanRowIdx, statusCol + 1).setValue(liveBalance === 0 ? 'Fully Paid' : 'Active');

  // 7. Format currency columns in Amortization and reapply conditional formatting
  applyAmortizationConditionalFormatting(amortSheet);

  return {
    loanId: loanId,
    restoredBalance: liveBalance,
    status: liveBalance === 0 ? 'Fully Paid' : 'Active'
  };
}

function processVoidPayment(receiptNo, voidReason) {
  if (!receiptNo) throw new Error('Receipt No is required.');
  const reason = String(voidReason || 'Cashier Correction').trim();

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (e) {
    throw new Error('System is busy processing another transaction. Please try again in a moment.');
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const pSheet = ss.getSheetByName('Payments');
    const lSheet = ss.getSheetByName('Loans');
    const aSheet = ss.getSheetByName('Amortization');

    if (!pSheet) throw new Error('"Payments" sheet not found.');

    const targetReceipt = String(receiptNo).trim();
    const pData = pSheet.getDataRange().getValues();
    const pHeaders = pData[0];
    const pMap = {};
    pHeaders.forEach((h, idx) => { if (h) pMap[String(h).trim().toLowerCase()] = idx; });

    const rNoIdx = pMap['receipt no'] !== undefined ? pMap['receipt no'] : 0;
    const lIdIdx = pMap['loan id'] !== undefined ? pMap['loan id'] : 1;
    const bNameIdx = pMap['borrower name'] !== undefined ? pMap['borrower name'] : 2;
    const dPaidIdx = pMap['date paid'] !== undefined ? pMap['date paid'] : 3;
    const prinPaidIdx = pMap['principal paid'] !== undefined ? pMap['principal paid'] : 4;
    const intPaidIdx = pMap['interest paid'] !== undefined ? pMap['interest paid'] : 5;
    const penPaidIdx = pMap['penalty paid'] !== undefined ? pMap['penalty paid'] : 6;
    const advPaidIdx = pMap['advance paid'] !== undefined ? pMap['advance paid'] : 7;
    const amtPaidIdx = pMap['amount paid'] !== undefined ? pMap['amount paid'] : 8;
    const balAfterIdx = pMap['principal balance after'] !== undefined ? pMap['principal balance after'] : (pMap['balance after'] !== undefined ? pMap['balance after'] : 9);
    const methodIdx = pMap['method'] !== undefined ? pMap['method'] : (pHeaders.length - 1);

    let pRowIdx = -1;
    let targetPayment = null;

    for (let i = 1; i < pData.length; i++) {
      if (String(pData[i][rNoIdx]).trim() === targetReceipt) {
        pRowIdx = i + 1;
        targetPayment = {
          receiptNo: targetReceipt,
          loanId: String(pData[i][lIdIdx]).trim(),
          borrowerName: String(pData[i][bNameIdx]).trim(),
          datePaid: pData[i][dPaidIdx],
          amountPaid: safeParseNumber(pData[i][amtPaidIdx], 0),
          interestPaid: safeParseNumber(pData[i][intPaidIdx], 0),
          principalPaid: safeParseNumber(pData[i][prinPaidIdx], 0),
          penaltyPaid: safeParseNumber(pData[i][penPaidIdx], 0),
          advancePaid: safeParseNumber(pData[i][advPaidIdx], 0),
          balanceAfter: safeParseNumber(pData[i][balAfterIdx], 0),
          method: String(pData[i][methodIdx] || '')
        };
        break;
      }
    }

    if (pRowIdx === -1 || !targetPayment) {
      throw new Error('Receipt "' + targetReceipt + '" not found in Payments sheet.');
    }

    if (String(targetPayment.receiptNo).includes('[VOIDED]') || String(targetPayment.method).toUpperCase().includes('VOID')) {
      throw new Error('Receipt "' + targetReceipt + '" is already marked as VOIDED.');
    }

    const loanId = targetPayment.loanId;
    const principalRestored = targetPayment.principalPaid;
    const amountVoided = targetPayment.amountPaid;

    // 1. Mark Payments row as VOIDED with detailed audit note and zero-out active amounts
    pSheet.getRange(pRowIdx, rNoIdx + 1).setValue(targetReceipt + ' [VOIDED]');
    const voidAuditNote = 'VOIDED - ' + reason + ' (Reversed: ₱' + amountVoided.toFixed(2) + ' | Prin: ₱' + principalRestored.toFixed(2) + ' | Int: ₱' + targetPayment.interestPaid.toFixed(2) + ')';
    pSheet.getRange(pRowIdx, methodIdx + 1).setValue(voidAuditNote);
    
    // Zero out numeric amounts in Payments so all spreadsheet column sums and external tools are accurate
    pSheet.getRange(pRowIdx, prinPaidIdx + 1).setValue(0).setNumberFormat('₱#,##0.00');
    pSheet.getRange(pRowIdx, intPaidIdx + 1).setValue(0).setNumberFormat('₱#,##0.00');
    pSheet.getRange(pRowIdx, penPaidIdx + 1).setValue(0).setNumberFormat('₱#,##0.00');
    if (advPaidIdx !== -1) pSheet.getRange(pRowIdx, advPaidIdx + 1).setValue(0).setNumberFormat('₱#,##0.00');
    pSheet.getRange(pRowIdx, amtPaidIdx + 1).setValue(0).setNumberFormat('₱#,##0.00');

    // Visual strike-through and muted gray text for voided row in Payments
    try {
      pSheet.getRange(pRowIdx, 1, 1, pHeaders.length)
        .setFontLine('line-through')
        .setFontColor('#94a3b8');
    } catch (e) {}

    // 2. Completely recalculate and restore the Amortization schedule and Loans balance
    const recalcRes = recalculateLoanAmortizationSchedule(loanId);
    const restoredBalance = recalcRes.restoredBalance;

    // 3. Log Audit
    logAudit('VOID_PAYMENT', 'Voided receipt ' + targetReceipt + ' for ₱' + amountVoided + ' (' + targetPayment.borrowerName + '). Reason: ' + reason + '. Restored loan balance to ₱' + restoredBalance + '.');

    // 4. Automatically look up borrower email and dispatch Official Payment Reversal Notice with updated Amortization PDF attached
    let emailSent = false;
    let borrowerEmail = '';

    // Find borrower ID from Loans sheet
    let borrowerId = '';
    if (lSheet && lSheet.getLastRow() > 1) {
      const lData = lSheet.getDataRange().getValues();
      const lHeaders = lData[0];
      const lIdCol = lHeaders.indexOf('Loan ID') !== -1 ? lHeaders.indexOf('Loan ID') : 0;
      const bIdCol = lHeaders.indexOf('Borrower ID') !== -1 ? lHeaders.indexOf('Borrower ID') : 1;
      for (let j = 1; j < lData.length; j++) {
        if (String(lData[j][lIdCol]).trim() === loanId) {
          borrowerId = String(lData[j][bIdCol] || '').trim();
          break;
        }
      }
    }

    if (borrowerId) {
      const bSheet = ss.getSheetByName('Borrowers');
      if (bSheet && bSheet.getLastRow() > 1) {
        const bData = bSheet.getDataRange().getValues();
        const bHeaders = bData[0];
        const borIdCol = bHeaders.indexOf('Borrower ID') !== -1 ? bHeaders.indexOf('Borrower ID') : 0;
        const borEmailCol = bHeaders.indexOf('Email') !== -1 ? bHeaders.indexOf('Email') : (bHeaders.indexOf('Email Address') !== -1 ? bHeaders.indexOf('Email Address') : 4);
        for (let b = 1; b < bData.length; b++) {
          if (String(bData[b][borIdCol]).trim() === borrowerId) {
            borrowerEmail = String(bData[b][borEmailCol] || '').trim();
            break;
          }
        }
      }
    }

    if (borrowerEmail && borrowerEmail.includes('@')) {
      let pdfBlob = null;
      let pdfAttached = false;
      try {
        pdfBlob = generateAmortizationPdfBlob(loanId);
        if (pdfBlob) pdfAttached = true;
      } catch (pdfErr) {
        Logger.log('PDF generation on void failed: ' + pdfErr.message);
      }

      const emailSubject = 'Payment Reversal Notice - Receipt Voided [' + targetReceipt + '] - Saint Joseph Multipurpose Cooperative';
      const formattedDatePaid = formatDateISO(safeParseDate(targetPayment.datePaid));

      const emailHtmlBody = 
        '<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">' +
          '<div style="background-color: #991b1b; padding: 18px 24px; text-align: center; color: #ffffff;">' +
            '<h2 style="margin: 0; font-size: 19px; letter-spacing: 0.5px; text-transform: uppercase;">Saint Joseph Multipurpose Cooperative</h2>' +
            '<p style="margin: 4px 0 0 0; font-size: 12px; color: #fecaca;">Official Notice of Payment Cancellation & Reversal</p>' +
          '</div>' +
          '<div style="padding: 24px;">' +
            '<p style="margin-top: 0; font-size: 14px;">Dear <strong>' + targetPayment.borrowerName + '</strong>,</p>' +
            '<p style="font-size: 13.5px; line-height: 1.5; color: #334155;">' +
              'This is an official advisory to inform you that a previously issued payment receipt has been <strong style="color:#b91c1c;">VOIDED and REVERSED</strong> by cooperative administration.' +
            '</p>' +
            '<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">' +
              '<table style="width: 100%; font-size: 13px; border-collapse: collapse;">' +
                '<tr><td style="padding: 5px 0; color: #64748b;">Voided Receipt No:</td><td style="padding: 5px 0; font-weight: bold; text-align: right; color: #991b1b; text-decoration: line-through;">' + targetReceipt + '</td></tr>' +
                '<tr><td style="padding: 5px 0; color: #64748b;">Original Payment Date:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">' + formattedDatePaid + '</td></tr>' +
                '<tr><td style="padding: 5px 0; color: #64748b;">Loan Account No:</td><td style="padding: 5px 0; font-weight: bold; text-align: right; font-family: monospace;">' + loanId + '</td></tr>' +
                '<tr><td style="padding: 5px 0; color: #64748b;">Voided Amount:</td><td style="padding: 5px 0; font-weight: bold; font-size: 14px; color: #b91c1c; text-align: right;">PHP ' + amountVoided.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</td></tr>' +
                '<tr><td style="padding: 5px 0; color: #64748b;">Reason for Reversal:</td><td style="padding: 5px 0; font-weight: bold; text-align: right; color: #0f172a;">' + reason + '</td></tr>' +
                '<tr style="border-top: 2px solid #cbd5e1;"><td style="padding: 8px 0 4px 0; font-weight: bold; color: #0f172a;">Restored Loan Balance:</td><td style="padding: 8px 0 4px 0; font-weight: bold; font-size: 15px; color: #0f2b5c; text-align: right;">PHP ' + restoredBalance.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</td></tr>' +
              '</table>' +
            '</div>' +
            '<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">' +
              '<p style="margin: 0; font-size: 12.5px; color: #92400e; line-height: 1.5;">' +
                '<strong>Account Standing Notice:</strong> The installment(s) previously covered by this voided transaction have been reverted back to <strong>Pending</strong> status on your loan statement. Please coordinate with the cashier if a corrected payment needs to be issued.' +
              '</p>' +
            '</div>' +
            (pdfAttached ? 
              ('<div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">' +
                '<p style="margin: 0; font-size: 13px; color: #166534; font-weight: bold;">Restored Amortization Schedule (PDF) Attached</p>' +
                '<p style="margin: 4px 0 0 0; font-size: 12px; color: #15803d;">' +
                  'Your corrected Amortization Schedule reflecting your restored balance is attached as a PDF (<strong>Amortization_Schedule_' + loanId + '.pdf</strong>).' +
                '</p>' +
              '</div>') : '') +
            '<p style="font-size: 12.5px; color: #64748b; line-height: 1.5; margin-top: 20px;">' +
              'If you have questions or concerns regarding this cancellation, please visit the Saint Joseph Multipurpose Cooperative office or contact us.' +
            '</p>' +
            '<div style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #334155;">' +
              '<strong>Saint Joseph Multipurpose Cooperative</strong>' +
            '</div>' +
          '</div>' +
        '</div>';

      const plainBody = 
        'SAINT JOSEPH MULTIPURPOSE COOPERATIVE\n' +
        '==========================================\n' +
        'NOTICE OF PAYMENT CANCELLATION & REVERSAL\n' +
        '==========================================\n\n' +
        'Dear ' + targetPayment.borrowerName + ',\n\n' +
        'This is to advise you that the payment transaction referenced below has been VOIDED and REVERSED by cooperative administration:\n\n' +
        'Voided Receipt No:    ' + targetReceipt + '\n' +
        'Original Date Paid:   ' + formattedDatePaid + '\n' +
        'Loan Account No:      ' + loanId + '\n' +
        'Amount Reversed:      PHP ' + amountVoided.toLocaleString(undefined, {minimumFractionDigits: 2}) + '\n' +
        'Reason for Reversal:  ' + reason + '\n\n' +
        'RESTORED LOAN BALANCE: PHP ' + restoredBalance.toLocaleString(undefined, {minimumFractionDigits: 2}) + '\n' +
        '------------------------------------------\n' +
        'The installment(s) previously covered by this transaction have returned to Pending status.\n' +
        (pdfAttached ? ('ATTACHMENT: Corrected Amortization Schedule (Amortization_Schedule_' + loanId + '.pdf)\n\n') : '') +
        'Saint Joseph Multipurpose Cooperative';

      const emailOptions = {
        name: 'Saint Joseph Multipurpose Cooperative',
        htmlBody: emailHtmlBody
      };
      if (pdfBlob) {
        emailOptions.attachments = [pdfBlob.setName('Amortization_Schedule_' + loanId + '.pdf')];
      }

      try {
        emailSent = sendCoopEmail(borrowerEmail, emailSubject, plainBody, emailOptions);
      } catch (mailErr) {
        Logger.log('Void email sending failed: ' + mailErr.message);
      }
    }

    return {
      success: true,
      receiptNo: targetReceipt,
      loanId: loanId,
      borrowerName: targetPayment.borrowerName,
      restoredBalance: restoredBalance,
      amountVoided: amountVoided,
      emailSent: emailSent,
      borrowerEmail: borrowerEmail
    };
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

/**
 * ============================================================================
 * WEB APP PORTAL BACKEND & CASHIER AUTHENTICATION
 * ============================================================================
 */

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('Cooperative Lending & Cashier Portal')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getMasterSheetUrl() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet().getUrl();
  } catch (err) {
    return '#';
  }
}

function hashPassword(password) {
  const rawBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password).trim());
  let hexString = '';
  for (let i = 0; i < rawBytes.length; i++) {
    const byte = rawBytes[i] < 0 ? rawBytes[i] + 256 : rawBytes[i];
    let hex = byte.toString(16);
    if (hex.length === 1) hex = '0' + hex;
    hexString += hex;
  }
  return hexString;
}

function getOrCreateUsersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Users');
  if (!sheet) {
    sheet = ss.insertSheet('Users');
    sheet.appendRow(['User ID', 'Full Name', 'Username', 'PasswordHash', 'Role', 'Status', 'Date Created']);
    sheet.getRange(1, 1, 1, 7)
      .setBackground('#0f2b5c')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    
    const defaultHash = hashPassword('password123');
    sheet.appendRow(['USR-0001', 'System Administrator', 'admin', defaultHash, 'Admin', 'Active', new Date().toISOString().split('T')[0]]);
  }
  return sheet;
}

function authenticateUser(username, password) {
  try {
    const sheet = getOrCreateUsersSheet();
    const data = sheet.getDataRange().getValues();
    const cleanUser = String(username).trim().toLowerCase();
    const inputPass = String(password).trim();
    const inputHash = hashPassword(inputPass);

    for (let i = 1; i < data.length; i++) {
      const rowUser = String(data[i][2]).trim().toLowerCase();
      const rowHash = String(data[i][3]).trim();
      const status = String(data[i][5]).trim();

      if (rowUser === cleanUser) {
        const isSha256 = /^[a-f0-9]{64}$/i.test(rowHash);
        const matches = isSha256 ? (rowHash.toLowerCase() === inputHash.toLowerCase()) : (rowHash === inputPass);

        if (matches) {
          if (status.toLowerCase() === 'inactive') {
            return { success: false, message: 'Account is deactivated. Please contact administrator.' };
          }

          // If the administrator entered a plain-text password in the sheet, automatically upgrade it to SHA-256 hash
          if (!isSha256) {
            try {
              sheet.getRange(i + 1, 4).setValue(inputHash);
            } catch (hashUpgradeErr) {
              Logger.log('Could not upgrade password hash: ' + hashUpgradeErr.message);
            }
          }

          return {
            success: true,
            user: {
              userId: data[i][0],
              fullName: data[i][1],
              username: data[i][2],
              role: data[i][4] || 'Cashier'
            }
          };
        }
      }
    }
    return { success: false, message: 'Invalid username or password.' };
  } catch (err) {
    return { success: false, message: 'Authentication error: ' + err.message };
  }
}

function registerUser(userData) {
  // Public registration is strictly disabled for security.
  // Cashier and Staff accounts must be provisioned directly by the Coop Administrator via the Users sheet.
  return { 
    success: false, 
    message: 'Public account registration is disabled. Cashier credentials are authorized and managed directly by the Cooperative Administrator.' 
  };
}

function getWebDashboardData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetUrl = ss.getUrl();

    const activeLoans = getActiveLoansList() || [];
    const borrowers = getBorrowersList() || [];

    let totalOutstanding = 0;
    let overdueCount = 0;
    let gracePeriodCount = 0;
    let dueTodayCount = 0;
    let upcomingDueCount = 0;

    activeLoans.forEach(l => {
      totalOutstanding += (typeof l.remainingBalance === 'number') ? l.remainingBalance : (parseFloat(l.remainingBalance) || 0);
      if (l.isPastGracePeriod) {
        overdueCount++;
      } else if (l.isGracePeriod) {
        gracePeriodCount++;
      } else if (l.isDueToday) {
        dueTodayCount++;
      } else if (l.isUpcoming) {
        upcomingDueCount++;
      }
    });

    const paymentsSheet = ss.getSheetByName('Payments');
    const recentPayments = [];
    let totalPrincipalCollected = 0;
    let totalInterestEarned = 0;
    let totalPenaltiesCollected = 0;
    let totalMoneyCollected = 0;
    let todayCollected = 0;
    let monthCollected = 0;

    if (paymentsSheet && paymentsSheet.getLastRow() > 1) {
      const pData = paymentsSheet.getDataRange().getValues();
      const todayStr = new Date().toISOString().split('T')[0];
      const curMonth = new Date().getMonth();
      const curYear = new Date().getFullYear();

      for (let i = pData.length - 1; i >= 1; i--) {
        const row = pData[i];
        const rDate = row[3];
        let rDateStr = '';
        let rowDateObj = null;

        if (rDate instanceof Date && !isNaN(rDate.getTime())) {
          rowDateObj = rDate;
          rDateStr = Utilities.formatDate(rDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        } else if (rDate) {
          rDateStr = String(rDate).split('T')[0];
          rowDateObj = new Date(rDate);
        }

        const rNo = String(row[0] || '').trim();
        const meth = String(row[11] || 'Cash').trim();
        const isVoided = rNo.includes('[VOIDED]') || meth.toUpperCase().includes('VOID');

        const prin = safeParseNumber(row[4], 0);
        const intr = safeParseNumber(row[5], 0);
        const pen = safeParseNumber(row[6], 0);
        const amt = safeParseNumber(row[8], 0);

        if (!isVoided) {
          totalPrincipalCollected += prin;
          totalInterestEarned += intr;
          totalPenaltiesCollected += pen;
          totalMoneyCollected += amt;

          if (rDateStr === todayStr) {
            todayCollected += amt;
          }
          if (rowDateObj && !isNaN(rowDateObj.getTime()) && rowDateObj.getMonth() === curMonth && rowDateObj.getFullYear() === curYear) {
            monthCollected += amt;
          }
        }

        if (recentPayments.length < 25) {
          recentPayments.push({
            receiptNo: rNo,
            loanId: String(row[1] || ''),
            borrowerName: String(row[2] || ''),
            datePaid: rDateStr,
            principalPaid: prin,
            interestPaid: intr,
            penaltyPaid: pen,
            amountPaid: amt,
            balanceAfter: safeParseNumber(row[9], 0),
            method: meth,
            isVoided: isVoided
          });
        }
      }
    }

    // 5. Fetch Recent Audit Logs (last 35 entries)
    const auditSheet = ss.getSheetByName('AuditLogs');
    const recentAuditLogs = [];
    if (auditSheet && auditSheet.getLastRow() > 1) {
      const aData = auditSheet.getDataRange().getValues();
      for (let i = aData.length - 1; i >= Math.max(1, aData.length - 35); i--) {
        const row = aData[i];
        let tStr = '';
        if (row[0] instanceof Date && !isNaN(row[0].getTime())) {
          tStr = Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
        } else if (row[0]) {
          const parsed = new Date(row[0]);
          if (!isNaN(parsed.getTime())) {
            tStr = Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
          } else {
            tStr = String(row[0]);
          }
        }
        recentAuditLogs.push({
          timestamp: tStr || 'Just now',
          user: String(row[1] || 'Cashier Portal'),
          action: String(row[2] || 'ACTION'),
          details: String(row[3] || '')
        });
      }
    }

    return {
      success: true,
      masterSheetUrl: sheetUrl,
      metrics: {
        activeLoansCount: activeLoans.length,
        totalOutstandingPrincipal: totalOutstanding,
        totalOutstandingBalance: totalOutstanding,
        totalPrincipalCollected: totalPrincipalCollected,
        totalInterestEarned: totalInterestEarned,
        totalPenaltiesCollected: totalPenaltiesCollected,
        totalMoneyCollected: totalMoneyCollected,
        todayCollected: todayCollected,
        monthCollected: monthCollected,
        overdueCount: overdueCount,
        pastGraceCount: overdueCount,
        gracePeriodCount: gracePeriodCount,
        withinGraceCount: gracePeriodCount,
        dueTodayCount: dueTodayCount,
        upcomingDueCount: upcomingDueCount,
        borrowersCount: borrowers.length
      },
      activeLoans: activeLoans,
      borrowers: borrowers,
      recentPayments: recentPayments,
      auditLogs: recentAuditLogs
    };
  } catch (err) {
    return {
      success: false,
      message: 'Failed to aggregate dashboard data: ' + err.message
    };
  }
}

/**
 * Web portal trigger to initialize/verify database sheets.
 */
function runSetupDatabase() {
  try {
    setupDatabaseSheets();
    return { success: true, message: 'Database sheets initialized and verified successfully!' };
  } catch (err) {
    return { success: false, message: 'Initialization failed: ' + err.message };
  }
}


/**
 * Returns raw HTML content for any modal dialog to render inside the Web App portal.
 */
function getDialogHtml(dialogName) {
  try {
    const validDialogs = [
      'PaymentDialog',
      'NewLoanDialog',
      'BorrowerDialog',
      'ReminderDialog',
      'ExportPdfDialog',
      'EditBorrowerDialog',
      'EditLoanDialog',
      'VoidPaymentDialog',
      'FilterDialog',
      'DeleteLoanDialog',
      'DeleteBorrowerDialog'
    ];
    if (!validDialogs.includes(dialogName)) {
      throw new Error('Invalid dialog name: ' + dialogName);
    }
    const html = HtmlService.createHtmlOutputFromFile(dialogName).getContent();
    return {
      success: true,
      html: html
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
}

/**
 * Retrieves the full amortization schedule and summary details for a specific loan to display in Dashboard.
 */
function getLoanAmortizationSchedule(loanId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const amortSheet = ss.getSheetByName('Amortization');
    const loansSheet = ss.getSheetByName('Loans');
    if (!amortSheet || !loansSheet) {
      return { success: false, message: 'Database sheets not found.' };
    }

    // 1. Locate loan metadata
    const loansData = loansSheet.getDataRange().getValues();
    const lHeader = loansData[0] || [];
    const getLCol = function(name, fallback) {
      for (let c = 0; c < lHeader.length; c++) {
        if (String(lHeader[c]).toLowerCase().includes(name.toLowerCase())) return c;
      }
      return fallback;
    };

    const lIdIdx = getLCol('loan id', 0);
    const bIdIdx = getLCol('borrower id', 1);
    const bNameIdx = getLCol('borrower name', 2);
    const typeIdx = getLCol('type', 3);
    const amtIdx = getLCol('amount', 4);
    const monthsIdx = getLCol('months', 5);
    const rateIdx = getLCol('rate', 6);
    const penaltyIdx = getLCol('penalty', 7);
    const dateIdx = getLCol('date granted', 8);
    const remBalIdx = getLCol('remaining bal', 9);
    const statusIdx = getLCol('status', 10);

    let loanInfo = null;
    for (let i = 1; i < loansData.length; i++) {
      if (String(loansData[i][lIdIdx]).trim() === String(loanId).trim()) {
        loanInfo = {
          loanId: String(loansData[i][lIdIdx]).trim(),
          borrowerId: String(loansData[i][bIdIdx] || ''),
          borrowerName: String(loansData[i][bNameIdx] || 'Borrower'),
          loanType: String(loansData[i][typeIdx] || 'Regular Loan'),
          loanAmount: safeParseNumber(loansData[i][amtIdx], 0),
          months: safeParseNumber(loansData[i][monthsIdx], 36),
          interestRate: safeParseNumber(loansData[i][rateIdx], 0.75),
          penaltyRate: safeParseNumber(loansData[i][penaltyIdx], 3.0),
          dateGranted: loansData[i][dateIdx] instanceof Date ? loansData[i][dateIdx].toISOString().split('T')[0] : String(loansData[i][dateIdx] || ''),
          remainingBalance: safeParseNumber(loansData[i][remBalIdx], 0),
          status: String(loansData[i][statusIdx] || 'Active')
        };
        break;
      }
    }

    if (!loanInfo) {
      return { success: false, message: 'Loan ID not found: ' + loanId };
    }

    // 2. Fetch amortization rows
    const amortData = amortSheet.getDataRange().getValues();
    const aHeader = amortData[0] || [];
    const getACol = function(name, fallback) {
      for (let c = 0; c < aHeader.length; c++) {
        if (String(aHeader[c]).toLowerCase().includes(name.toLowerCase())) return c;
      }
      return fallback;
    };

    const aLoanIdIdx = getACol('loan id', 0);
    const aMonthNumIdx = getACol('month #', 2);
    const aTermYearIdx = getACol('term year', 3);
    const aMonthNameIdx = getACol('month name', 4);
    const aPrinIdx = getACol('principal', 5);
    const aAmortIdx = getACol('amortization', 6);
    const aIntPayIdx = getACol('interest pay', 7);
    const aMonthlyAmortIdx = getACol('monthly amort', 8);
    const aPenIdx = getACol('penalty', 9);
    const aAmtPaidIdx = getACol('amount paid', 10);
    const aStatusIdx = getACol('status', 11);

    const rows = [];
    let sumPrincipal = 0;
    let sumInterest = 0;
    let sumAmort = 0;
    let sumAmountPaid = 0;
    let paidCount = 0;

    for (let j = 1; j < amortData.length; j++) {
      if (String(amortData[j][aLoanIdIdx]).trim() === String(loanId).trim()) {
        const pBal = safeParseNumber(amortData[j][aPrinIdx], 0);
        const pAmort = safeParseNumber(amortData[j][aAmortIdx], 0);
        const iPay = safeParseNumber(amortData[j][aIntPayIdx], 0);
        const mAmort = safeParseNumber(amortData[j][aMonthlyAmortIdx], 0);
        const pPenalty = aPenIdx !== -1 ? safeParseNumber(amortData[j][aPenIdx], 0) : 0;
        const aPaid = safeParseNumber(amortData[j][aAmtPaidIdx], 0);
        const st = String(amortData[j][aStatusIdx] || 'Pending').trim();

        const mNum = amortData[j][aMonthNumIdx];
        const isStart = mNum === 0 || String(mNum).toLowerCase() === 'start';

        if (!isStart) {
          sumPrincipal += pAmort;
          sumInterest += iPay;
          sumAmort += mAmort;
          sumAmountPaid += aPaid;
          if (st.toLowerCase() === 'paid') paidCount++;
        }

        rows.push({
          monthNum: mNum,
          termYear: String(amortData[j][aTermYearIdx] || ''),
          monthName: String(amortData[j][aMonthNameIdx] || ''),
          principal: pBal,
          amortization: pAmort,
          interestPay: iPay,
          monthlyAmort: mAmort,
          penalty: pPenalty,
          amountPaid: aPaid,
          status: st,
          isStart: isStart
        });
      }
    }

    return {
      success: true,
      loan: loanInfo,
      summary: {
        sumPrincipal: roundUp2(sumPrincipal),
        sumInterest: roundUp2(sumInterest),
        sumAmort: roundUp2(sumAmort),
        sumAmountPaid: roundUp2(sumAmountPaid),
        paidCount: paidCount,
        totalMonths: rows.filter(r => !r.isStart).length
      },
      schedule: rows
    };
  } catch (err) {
    return { success: false, message: 'Failed to fetch amortization schedule: ' + err.message };
  }
}





