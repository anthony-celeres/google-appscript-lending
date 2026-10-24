# 📋 Comprehensive Quality Assurance & Manual Testing Checklist
### Cooperative Lending & Amortization System — Pop-Up Modal Dialog Edition
**Organization**: Saint Joseph Multipurpose Cooperative  
**Target Platform**: Google Sheets + Google Apps Script  
**Date**: September 2026  

---

## 📌 Testing Instructions
- Perform each test case sequentially from top to bottom.
- Check off the `[ ]` boxes once verified as `PASS`.
- Note any unexpected behaviors or observations in the Remarks column.

---

## 🤖 Automated vs. Manual Testing Scope

| Feature / Component | Testing Method | Verification Status |
| :--- | :---: | :--- |
| **36-Month Amortization Schedule Calculation** | **Automated** | ✅ **VERIFIED**: Generates exact 37 rows, constant `₱2,967` principal, diminishing yearly interest (`₱801.00`, `₱533.97`, `₱266.94`). |
| **Single Installment Waterfall Allocation** | **Automated** | ✅ **VERIFIED**: `₱3,768` allocates `₱801` interest, `₱2,967` principal, new balance `₱103,833`. |
| **Overdue Late Penalty Waterfall** | **Automated** | ✅ **VERIFIED**: Penalty paid first (`₱113.04`), interest next (`₱801`), principal remainder (`₱2,967`). |
| **Partial Advance Payment (Lessen Next Month)** | **Automated** | ✅ **VERIFIED**: `₱5,000` settles Month 1; Col G stays `₱2,967`; Col I drops from `₱3,768` to `₱2,536`. |
| **Multi-Month Advance Settlement ($N$ Months + Remainder)** | **Automated** | ✅ **VERIFIED**: Any arbitrary payment covering $N$ full months (e.g., 2, 3, 5, etc.) marks all $N$ months `Paid`; any excess remainder automatically lessens the subsequent month's `Monthly Amort` while keeping Col G baseline intact; next due date skips forward by $N$ months. |
| **Full Loan Payoff Calculation** | **Automated** | ✅ **VERIFIED**: Balance reaches `₱0.00`, marks all remaining rows `Paid`, status flips to `Fully Paid`. |
| **Google Sheets Pop-up Modals & Form Submission** | **Manual** | Requires clicking through the active Google Sheet UI. |
| **Live Gmail Dispatch & Delivery** | **Manual** | Requires checking your email inbox for live receipt delivery. |
| **Google Drive PDF File Creation** | **Manual** | Requires checking Google Drive storage and opening the generated PDF. |

---

## Phase 1: Environment Setup & Database Initialization

| ID | Test Scenario | Action Steps | Expected Result | Status | Remarks |
| **TC-01** | **Apps Script Project Files Verification** | In Google Sheets, open `Extensions > Apps Script`. Check the Files sidebar. | All 13 project files exist:<br>• `Code.gs`<br>• `Dashboard.html`<br>• `BorrowerDialog.html`<br>• `NewLoanDialog.html`<br>• `PaymentDialog.html`<br>• `ReminderDialog.html`<br>• `ExportPdfDialog.html`<br>• `EditBorrowerDialog.html`<br>• `EditLoanDialog.html`<br>• `VoidPaymentDialog.html`<br>• `FilterDialog.html`<br>• `DeleteLoanDialog.html`<br>• `DeleteBorrowerDialog.html` | [ ] | |
| **TC-02** | **One-Time Google Authorization** | Refresh sheet (`F5`). Click `☰ Menu > ⚙️ Initialize Database Sheets`. | Prompts *"Authorization Required"*. Clicking *Continue > Advanced > Go to... > Allow* completes authorization without errors. | [ ] | |
| **TC-03** | **Database Schema & Header Formatting** | After authorization, click `☰ Menu > ⚙️ Initialize Database Sheets` once more. | Exactly 8 tabs are created/verified with dark navy headers (`#0f2b5c`) and white text:<br>1. `Dashboard`<br>2. `Borrowers`<br>3. `LoanTypes`<br>4. `Loans`<br>5. `Amortization`<br>6. `Payments`<br>7. `Users`<br>8. `AuditLogs` | [ ] | |
| **TC-04** | **Default Loan Categories Catalog** | Check the `LoanTypes` sheet tab. | Contains 7 standard loan products (`LT-001 Regular Loan` through `LT-007 Grocery Loan`). | [ ] | |

---

## Phase 2: Member Registration (`👤 Register New Borrower`)

| ID | Test Scenario | Action Steps | Expected Result | Status | Remarks |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **TC-05** | **Borrower Modal Launch** | Click `☰ Menu > 👤 Register New Borrower`. | Centered modal (480×480px) opens with teal header, inputs for Name, Address, Phone, Email, and Save button. | [ ] | |
| **TC-06** | **Required Field Validation** | Leave Borrower Name blank and click *Save Borrower Record*. | Form blocks submission with HTML5 validation message prompting for required name field. | [ ] | |
| **TC-07** | **Successful Borrower Registration** | Fill in:<br>• Name: `Test Juan dela Cruz`<br>• Address: `123 Rizal Ave, Quezon City`<br>• Phone: `+63 917 555 0192`<br>• Email: *(Use your active test email)*<br>Click *Save Borrower Record*. | 1. Modal shows green success notice with generated ID `BOR-YYYY-XXX`.<br>2. Modal auto-closes.<br>3. Row appears in `Borrowers` tab with phone prefix `+` preserved.<br>4. Welcome email received in your inbox.<br>5. Entry logged in `AuditLogs`. | [ ] | |
| **TC-08** | **Secondary Member Registration** | Register a second borrower: `Maria Santos`, with address, phone, and email. | Second borrower added to `Borrowers` tab (used later to test zero-debt deletion). | [ ] | |

---

## Phase 3: Loan Origination & Amortization Schedule Engine (`➕ Create New Loan & Schedule`)

| ID | Test Scenario | Action Steps | Expected Result | Status | Remarks |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **TC-09** | **Loan Origination Modal Launch** | Click `☰ Menu > ➕ Create New Loan & Schedule`. | Modal opens (480×610px). Borrower and Loan Category dropdowns load options dynamically from sheets. | [ ] | |
| **TC-10** | **Dynamic Loan Selection & Setup** | Select:<br>• Borrower: `Test Juan dela Cruz`<br>• Category: `Regular Loan`<br>• Amount: `106800`<br>• Tenure: `36 Months (3 Years)`<br>• Rate: `0.75% per month`<br>• Penalty: `3%`<br>• Date: Choose a date 1 month prior to today.<br>Click *Generate Amortization Schedule*. | 1. Green success banner shows generated Loan ID `LN-YYYY-XXXX`.<br>2. Entry created in `Loans` tab with `Status: Active`, `Remaining Bal: ₱106,800.00`.<br>3. Action logged in `AuditLogs`. | [ ] | |
| **TC-11** | **Amortization Structure & Rate Badge** | Inspect `Amortization` sheet for the newly generated Loan ID. | 1. **Row 0 (`START`)**: Shows `Month #: START`, `Principal: ₱106,800.00`, and `Status: Loan Granted (0.75%)` *(verifies dynamic rate)*.<br>2. **Col G (`Amortization`)**: Shows fixed principal `₱2,967.00` for all 36 months.<br>3. **Col H (`Interest Pay`)**: Shows Year 1 interest `₱801.00`, Year 2 interest `₱533.97`, Year 3 interest `₱266.94`.<br>4. **Col J (`Penalty`) & Col K (`Amount Paid`)**: Initialize to `₱0.00`.<br>5. **Col L (`Status`)**: Automatically formatted with light pastel badge styles (`Paid` green `#f0fdf4`, `Underpaid` yellow `#fef9c3`, `Overdue` red `#fef2f2`, `Pending` uncolored).<br>6. Exactly 37 total rows created. | [ ] | |
| **TC-12** | **Custom Tenure & Custom Rate Test** | Create a 2nd loan for `Test Juan dela Cruz` using *Type manually* for Tenure (`15` months) and Rate (`1.25%`). | Custom inputs accept text smoothly; amortization generates 15 rows with `Loan Granted (1.25%)` in Row 0. | [ ] | |

---

## Phase 4: Payment Recording & Waterfall Allocation (`💳 Record Payment & Issue Receipt`)

| ID | Test Scenario | Action Steps | Expected Result | Status | Remarks |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **TC-13** | **Overdue Detection, Late Penalty & Total Due Card** | Click `☰ Menu > 💳 Record Payment & Issue Receipt`. Select the 1st loan (with backdated start date). | 1. Status banner turns amber: `⚠️ OVERDUE by X days!`.<br>2. Monthly Amortization card shows scheduled installment `₱3,768.00` (`₱2,967.00 + ₱801.00`).<br>3. `Apply Late Penalty (3%)` automatically checked with exact 2-decimal fee `₱113.04` (3% of scheduled monthly amort `₱3,768.00`).<br>4. `TOTAL AMOUNT TO BE PAID` dynamically computes `₱3,881.04` (`₱3,768.00 + ₱113.04`).<br>5. Input defaults to `₱3,881.04` with 2-decimal precision. | [ ] | |
| **TC-14** | **Penalty Waiver / Toggle & Dynamic Total Recalculation** | Uncheck the `Apply Late Penalty` checkbox. | 1. Penalty fee collapses to `₱0.00`.<br>2. `TOTAL AMOUNT TO BE PAID` card instantly recalculates to regular monthly amort `₱3,768.00`.<br>3. Re-checking the penalty restores the `₱113.04` fee and updates Total Due back to `₱3,881.04`. | [ ] | |
| **TC-15** | **Partial Payment / Underpayment with Late Penalty** | With penalty checked, enter an underpayment of `₱2,000.00`. | 1. Waterfall allocation:<br>• Late Penalty Paid: `₱113.04`<br>• Interest Portion Paid: `₱801.00`<br>• Principal Paid: `₱1,085.96`<br>2. `Payments` tab records `Amount Paid: ₱2,000.00`.<br>3. `Amortization` Col K (`Amount Paid`) **matches exact `₱2,000.00`** with Col J (`Penalty: ₱113.04`).<br>4. Month 1 Monthly Amort (Col I) updates to remaining due `₱1,881.04` while Col G Amortization stays `₱2,967.00`.<br>5. Month 1 **Status (Col L) updates to `Underpaid`** with light pastel yellow badge (`#fef9c3`). | [ ] | |
| **TC-16** | **Receipt Email & Statement PDF Delivery** | Check the borrower's email inbox. | 1. Email received from cooperative Gmail.<br>2. Table displays itemized breakdown (Penalty, Interest, Principal, Remaining Bal).<br>3. Attached PDF named `Amortization_Schedule_LN-YYYY-XXXX.pdf`.<br>4. PDF shows Month 1 with green `PAID` badge. | [ ] | |
| **TC-17** | **Partial Advance Payment (Lessening Next Month)** | For Month 2 (scheduled `₱3,768`), enter payment of `₱5,000.00` (no penalty). | 1. Modal displays: `✦ Advance Credited to Month #2: ₱1,232.00 (Monthly payment reduced to ₱2,536.00)`.<br>2. Submit payment.<br>3. `Payments` tab records row with columns: `Principal Paid (₱2,967)`, `Interest Paid (₱801)`, `Penalty Paid (₱0)`, `Advance Paid (₱1,232)`, `Amount Paid (₱5,000)`, `Principal Balance After`, `Amortization Balance After`.<br>4. In `Amortization`, Month 1 Col K (`Amount Paid`) **matches exact `₱5,000.00`** with green `PAID` badge.<br>5. Month 2 Col I (`Monthly Amort`) drops to `₱2,536.00` and status remains `Pending` (clean uncolored cell). | [ ] | |
| **TC-18** | **Auto-Population of Lessened Next Month** | Re-open `☰ Menu > 💳 Record Payment & Issue Receipt` and select the same loan. | 1. Payment amount input **automatically defaults to ₱2,536.00**.<br>2. Expected interest is `₱801.00`, expected principal is `₱1,735.00`. | [ ] | |
| **TC-19** | **Multi-Month & Advance Settlement ($N$ Months + Remainder)** | Enter an amount covering any multiple $N$ months (e.g. 2, 3, 5, etc.) with or without extra partial advance cash (e.g. $N \times \text{installment} + \text{extra}$). | 1. Modal previews: `✅ Covers N Full Months (Month #X to Month #Y)` plus any remainder credited to next month.<br>2. Submit payment.<br>3. **All $N$ covered months are marked `Paid`** in `Amortization`.<br>4. Original baseline `Amortization` (Col G) remains intact for all rows.<br>5. Any remaining advance credit reduces the next unpaid month's `Monthly Amort` (Col I).<br>6. Next due date skips forward by $N$ months. | [ ] | |
| **TC-20** | **Full Loan Payoff & Auto-Sweep** | Enter the exact remaining loan principal balance. | 1. **All remaining installment rows** in `Amortization` are automatically swept and marked `Paid` with `Principal: ₱0.00`.<br>2. `Loans` tab status changes to `Fully Paid` with balance `₱0.00`.<br>3. Loan no longer appears in active payment dropdown. | [ ] | |
| **TC-21** | **Overpayment Guard Warning** | In `💳 Record Payment & Issue Receipt`, enter an amount significantly higher than total remaining payoff (e.g. ₱50,000 when balance is ₱10,000). | Red alert banner appears in modal: `⚠️ Overpayment Detected: Entered amount exceeds total payoff by ₱XX,XXX.XX. Excess should be refunded.` | [ ] | |

---

## Phase 5: On-Demand PDF Statement Export (`📄 Export Amortization PDF`)

| ID | Test Scenario | Action Steps | Expected Result | Status | Remarks |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **TC-22** | **Export Dialog & Loan Metadata Preview** | Click `☰ Menu > 📄 Export Amortization PDF`. Select a loan. | Preview box displays Borrower Name, Loan Product, Principal Granted, Tenure & Rate, Remaining Balance, and Email on file. | [ ] | |
| **TC-23** | **Export Execution & Drive Link** | Check both:<br>☑️ *Send PDF directly to Borrower's Email*<br>☑️ *Save PDF to Google Drive & Email copy to my account*<br>Click *Export Amortization Schedule (PDF)*. | 1. Generates styled statement with member info, summary table, and signature blocks.<br>2. PDF saved in Google Drive.<br>3. Copies emailed to borrower and administrator.<br>4. Clickable button `📂 Open PDF in Google Drive` opens the PDF directly in a new tab. | [ ] | |

---

## Phase 6: Multi-Sheet Filter Engine (`🔍 Filter Records by Loan / Borrower`)

| ID | Test Scenario | Action Steps | Expected Result | Status | Remarks |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **TC-24** | **Filter by Loan ID** | Click `☰ Menu > 🔍 Filter Records by Loan / Borrower`. Select *By Loan ID*, choose a Loan ID, and click *Apply Sheet Filter*. | In `Loans`, `Amortization`, and `Payments`, only rows matching that specific Loan ID are shown. Other rows are hidden via native Google Sheets filter. | [ ] | |
| **TC-25** | **Filter by Borrower** | Switch mode to *By Borrower*, select `Test Juan dela Cruz`, and apply filter. | All 3 sheets simultaneously filter to show only records belonging to `Test Juan dela Cruz`. | [ ] | |
| **TC-26** | **Reset / Show All Records** | In the filter modal, click *🔄 Show All Records (Reset Filter)*. | Native filters are removed across `Loans`, `Amortization`, and `Payments`. All rows and columns are completely visible. No data is lost. | [ ] | |

---

## Phase 7: Loan Deletion Safeguards (`🗑️ Delete Loan & Amortization`)

| ID | Test Scenario | Action Steps | Expected Result | Status | Remarks |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **TC-27** | **Deletion Preview & Button Lock** | Click `☰ Menu > 🗑️ Delete Loan & Amortization`. Select the 2nd loan created in TC-12. | Card displays loan details. The red *Delete Loan & Amortization* button remains disabled. | [ ] | |
| **TC-28** | **Confirmation Checkbox Unlock** | Check *I confirm that I want to permanently delete this loan*. | Delete button turns active red. | [ ] | |
| **TC-29** | **Cascade Deletion Execution** | Click *Delete Loan & Amortization*. | 1. Matching loan row removed from `Loans`.<br>2. All corresponding installment rows removed from `Amortization`.<br>3. Related payments removed from `Payments`.<br>4. Operation logged with row counts in `AuditLogs`. | [ ] | |

---

## Phase 8: Borrower Deletion Safeguards (`🗑️ Delete Borrower Record`)

| ID | Test Scenario | Action Steps | Expected Result | Status | Remarks |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **TC-30** | **Active Debt Protection Safeguard** | Click `☰ Menu > 🗑️ Delete Borrower Record`. Select `Test Juan dela Cruz` (who still has an active loan). | Warning banner appears: `⚠️ Active Loan Balance Detected`. General confirmation checkbox alone **keeps delete button disabled** to prevent accidental debt erasure. | [ ] | |
| **TC-31** | **Cascade Borrower Deletion** | Check both:<br>☑️ *Cascade delete all loans, amortizations & payments...*<br>☑️ *I confirm that I want to delete this borrower record*<br>Click *Delete Borrower Record*. | 1. Borrower deleted from `Borrowers`.<br>2. All remaining loans, amortization schedules, and payment receipts for this member are removed.<br>3. Logged in `AuditLogs`. | [ ] | |
| **TC-32** | **Zero-Debt Borrower Deletion** | Select `Maria Santos` (registered in TC-08 with zero loans) and check the confirmation box. | Deletes cleanly without prompting for or requiring cascade confirmation. | [ ] | |

---

## Phase 9: Dashboard KPIs & Immutable Audit Trail

| ID | Test Scenario | Action Steps | Expected Result | Status | Remarks |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **TC-33** | **Real-Time Financial Dashboard KPIs** | Inspect the `Dashboard` sheet tab. | Formulas dynamically evaluate accurate sums:<br>• `Total Borrowers`: `=COUNTA(Borrowers!A2:A)`<br>• `Total Active Loans`: `=COUNTIF(Loans!K2:K, "Active")`<br>• `Total Outstanding Balance`: `=SUM(Loans!J2:J)`<br>• `Total Money Collected`: `=SUM(Payments!E2:E)`<br>• `Total Interest Earned`: `=SUM(Payments!F2:F)`<br>• `Total Principal Collected`: `=SUM(Payments!G2:G)`<br>• `Total Penalties Collected`: `=SUM(Payments!H2:H)` | [ ] | |
| **TC-34** | **Audit Trail Integrity** | Inspect the `AuditLogs` sheet tab. | Chronological audit records exist for all testing operations (`SETUP`, `CREATE_BORROWER`, `CREATE_LOAN`, `RECORD_PAYMENT`, `EXPORT_PDF`, `APPLY_FILTER`, `DELETE_LOAN`, `DELETE_BORROWER`). Each record lists timestamp, user email, and action details. | [ ] | |

---

## Phase 10: Payment Reminders Hub & Collections Radar (`🔔 Payment Reminders & Due Date Hub`)

| ID | Test Scenario | Action Steps | Expected Result | Status | Remarks |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **TC-35** | **Dashboard Collections Radar Formulas & Live Feed** | Inspect Columns E to G of the `Dashboard` sheet tab. | 1. Dark navy header `#0f2b5c`: `COLLECTIONS RADAR (TODAY & THIS WEEK)`.<br>2. `Overdue Accounts` evaluates `=COUNTIFS(Amortization!L2:L, "Pending", Amortization!C2:C, "<>START") + COUNTIFS(Amortization!L2:L, "Underpaid", Amortization!C2:C, "<>START") + COUNTIFS(Amortization!L2:L, "Overdue", Amortization!C2:C, "<>START")`.<br>3. `Accounts Due Today` evaluates `=COUNTIFS(Amortization!L2:L, "Pending", Amortization!E2:E, TEXT(TODAY(), "MMMM")) + COUNTIFS(Amortization!L2:L, "Underpaid", Amortization!E2:E, TEXT(TODAY(), "MMMM"))`.<br>4. `Upcoming (Active Portfolios)` evaluates `=COUNTIF(Loans!K2:K, "Active")`.<br>5. `Collections Efficiency Rate` evaluates `=IF(B2>0, TEXT(B5/(B4+B5)*100, "0.0") & "%", "100%")`. | [ ] | |
| **TC-36** | **Payment Reminders Hub Modal Launch & Metrics** | Click `☰ Menu > 🔔 Payment Reminders & Due Date Hub`. | Modal opens (620×580px) displaying:<br>• 4 interactive summary cards: `ALL`, `⚠️ OVERDUE`, `🔔 DUE TODAY`, `📅 UPCOMING`.<br>• Real-time counts matching active loans and upcoming deadlines. | [ ] | |
| **TC-37** | **Interactive Tab Filtering & Search Filtering** | 1. Click on the `⚠️ OVERDUE` card.<br>2. Click on the `🔔 DUE TODAY` card.<br>3. Click on the `📅 UPCOMING` card.<br>4. Type a borrower's name or loan ID in the Search box. | 1. Table dynamically filters down to only accounts in the selected tier.<br>2. Search bar performs instant substring matching across Borrower Name and Loan ID.<br>3. Status badges display accurately (`XD LATE`, `DUE TODAY`, `IN XD`). | [ ] | |
| **TC-38** | **Advance Payment Exclusion Safeguard** | Check a loan where the borrower paid in advance for the current month (e.g. settled via multi-month advance in TC-17 or TC-19). | 1. Loan is **NOT** listed under `DUE TODAY` or `OVERDUE` even if today is the calendar due date of the already-paid month.<br>2. System displays the next pending month and future due date (e.g. Month #3 or Month #6), safeguarding members from false alerts. | [ ] | |
| **TC-39** | **Select All & Individual Checkbox Selection** | 1. Click `☑️ Select All`.<br>2. Uncheck one individual row.<br>3. Re-check the individual row. | 1. Action button dynamically updates text: `Send Reminders (X Selected)`.<br>2. Button disables if 0 items are selected. | [ ] | |
| **TC-40** | **Batch Reminder Dispatch & Delivery** | With at least 1 borrower selected, click `Send Reminders (X Selected)`. | 1. Button shows spinner and disables during dispatch.<br>2. Success alert confirms `🎉 Successfully dispatched X payment reminder email(s)!`.<br>3. Member receives branded tier-specific reminder email in Gmail.<br>4. Event logged with recipient Loan IDs in `AuditLogs`. | [ ] | |

---

## 📧 Email & 📄 PDF Verbatim Content Verification Specifications

Use these full content templates and field standards when validating email notifications and PDF exports in your inbox and Google Drive.

---

### 1. Member Welcome Email Specification (Triggered in TC-01 & TC-08)

**Sender**: Active Google Account executing the system  
**Subject**: `Welcome to Saint Joseph Multipurpose Cooperative - Member Registration [BRW-2026-XXXX]`  

#### Full Verbatim Email Body (Plain Text):
```text
SAINT JOSEPH MULTIPURPOSE COOPERATIVE
==========================================
MEMBER / BORROWER REGISTRATION CONFIRMATION
==========================================

Dear [Borrower Name],

Welcome to Saint Joseph Multipurpose Cooperative! You have been successfully registered.

REGISTRATION DETAILS:
------------------------------------------
Borrower ID:     BRW-2026-XXXX
Member Name:     [Borrower Name]
Contact Number:  [Phone or N/A]
Home Address:    [Address or N/A]
Date Registered: YYYY-MM-DD
------------------------------------------

IMPORTANT REMINDERS:
Payment receipts and account statements will be dispatched to this email address.

If you have any questions or need assistance, please feel free to reply to this email.

Saint Joseph Multipurpose Cooperative
```

---

### 2. Official Payment Receipt Email Specification (Triggered in TC-15, 17, 19, 20)

**Sender Display Name**: `Saint Joseph Multipurpose Cooperative`  
**Subject**: `Payment Receipt: [Receipt No] - [Borrower Name] ([Loan ID])`  
**Attachment**: `Amortization_Schedule_[Loan ID].pdf`  

#### A. Full Plain Text Fallback Content:
```text
SAINT JOSEPH MULTIPURPOSE COOPERATIVE
==========================================
OFFICIAL RECEIPT NO: OR-2026-XXXX
DATE: YYYY-MM-DD
BORROWER: [Borrower Name]
LOAN NO: LN-2026-XXXX
SETTLED INSTALLMENT(S): Month #1 & Month #2

PAYMENT ALLOCATION BREAKDOWN:
------------------------------------------
Total Amount Received: ₱X,XXX.XX
Late Penalty Fee:     ₱XXX.XX          <-- (Only appears if late penalty applies)
Applied to Interest:   ₱X,XXX.XX
Applied to Principal:  ₱X,XXX.XX
Advance Principal Credited: ₱X,XXX.XX (Credited to Month #X — Monthly payment reduced to ₱X,XXX.XX) <-- (Only if advance remainder exists)
Payment Method:        Cash / GCash / Bank Transfer

REMAINING LOAN BALANCE: ₱XX,XXX.XX
------------------------------------------
ATTACHMENT: Updated Amortization Schedule (Amortization_Schedule_LN-2026-XXXX.pdf)

Thank you for your payment!
Saint Joseph Multipurpose Cooperative
```

#### B. Full HTML Email Layout (What displays in your Gmail inbox):
```html
┌────────────────────────────────────────────────────────────────────────┐
│               SAINT JOSEPH MULTIPURPOSE COOPERATIVE                    │  (Navy Header #0f2b5c)
│             Official Payment Receipt & Statement of Account            │
├────────────────────────────────────────────────────────────────────────┤
│ Dear [Borrower Name],                                                  │
│                                                                        │
│ We have successfully received and processed your loan payment.         │
│ Here is the official breakdown of your payment:                        │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Official Receipt No:                               OR-2026-XXXX    │ │
│ │ Payment Date:                                        YYYY-MM-DD    │ │
│ │ Loan Account No:                                   LN-2026-XXXX    │ │
│ │ Settled Installment(s):                      Month #1 & Month #2   │ │
│ │ Payment Method:                                            Cash    │ │
│ │ ────────────────────────────────────────────────────────────────── │ │
│ │ Total Amount Received:                                ₱7,536.00    │ │ (Bold Green #0f766e)
│ │ - Late Penalty Paid:                                    ₱113.04    │ │ (Amber #b45309, if any)
│ │ - Applied to Interest:                                ₱1,602.00    │ │
│ │ - Applied to Principal:                               ₱5,934.00    │ │
│ │ ✦ Advance Principal Credited:                         ₱1,232.00    │ │ (Emerald #047857, if any)
│ │   (Credited to Month #3 — Monthly payment reduced to ₱2,536.00)    │ │
│ │ ══════════════════════════════════════════════════════════════════ │ │
│ │ Remaining Principal Balance:                        ₱100,866.00    │ │ (Bold Navy #0f2b5c)
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 📎 Amortization Schedule (PDF) Attached                            │ │ (Light Green Alert Box #f0fdf4)
│ │ Your updated 36-month Amortization Schedule and Statement of       │ │
│ │ Account has been attached as a PDF (Amortization_Schedule_...pdf)  │ │
│ │ for your reference.                                                │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ Thank you for your timely payment and continued partnership with       │
│ our cooperative. If you have any inquiries, feel free to visit our     │
│ office or reach out to the Credit Committee.                           │
│                                                                        │
│ Saint Joseph Multipurpose Cooperative                                  │
└────────────────────────────────────────────────────────────────────────┘
---

### 3. Payment Reminder Email Specifications (Triggered in TC-40)

**Sender Display Name**: `Saint Joseph Multipurpose Cooperative`  

#### A. Overdue Payment Alert (`⚠️ Overdue` Tier)
- **Subject**: `⚠️ OVERDUE LOAN PAYMENT ALERT - [Borrower Name] [[Loan ID]]`
- **Badge**: `⚠️ OVERDUE BY [X] DAYS` (Red `#fee2e2` / `#b91c1c`)
- **Headline**: `Your loan installment was due on [Due Date] and is currently [X] days past due. An agreed late penalty of [Rate]% (₱[Penalty Amount]) has been incurred.`
- **Body**: `Please settle your overdue installment immediately to avoid further penalty accumulation and maintain good credit standing with the cooperative.`

#### B. Due Today Payment Notice (`🔔 Due Today` Tier)
- **Subject**: `🔔 PAYMENT DUE TODAY - [Borrower Name] [[Loan ID]]`
- **Badge**: `🔔 DUE TODAY ([Due Date])` (Amber `#fef3c7` / `#b45309`)
- **Headline**: `This is a friendly notification that your loan installment is due today ([Due Date]).`
- **Body**: `Kindly process your payment today through our cashier office, bank deposit, or GCash/Maya transfer.`

#### C. Upcoming Payment Reminder (`📅 Upcoming` Tier)
- **Subject**: `📅 UPCOMING PAYMENT REMINDER - [Borrower Name] [[Loan ID]]`
- **Badge**: `📅 DUE IN [X] DAYS` (Blue `#e0f2fe` / `#0369a1`)
- **Headline**: `This is an advance reminder that your next loan installment is due in [X] days on [Due Date].`
- **Body**: `Please keep this due date in mind for your payment planning.`

#### D. Full Email Template Structure (HTML Inbox Presentation):
```html
┌────────────────────────────────────────────────────────────────────────┐
│               SAINT JOSEPH MULTIPURPOSE COOPERATIVE                    │  (Navy Header #0f2b5c)
│                    Member Notification Service                         │
├────────────────────────────────────────────────────────────────────────┤
│ [⚠️ OVERDUE BY X DAYS / 🔔 DUE TODAY / 📅 DUE IN X DAYS]               │  (Dynamic Badge)
│                                                                        │
│ Dear [Borrower Name],                                                  │
│                                                                        │
│ [Dynamic Headline based on Overdue / Today / Upcoming Tier]            │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Loan Account No:                                   LN-2026-XXXX    │ │
│ │ Installment Month:                          Month #X (Month Name)  │ │
│ │ Scheduled Due Date:                                  YYYY-MM-DD    │ │
│ │ ────────────────────────────────────────────────────────────────── │ │
│ │ Regular Installment Due:                              ₱3,768.00    │ │ (Teal #0f766e)
│ │ Late Penalty Fee (3%):                                  ₱113.04    │ │ (Amber #b45309, if overdue)
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ [Dynamic Body instructions]                                            │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 💳 Payment Channels Accepted:                                      │ │ (Light Green Box #f0fdf4)
│ │ • Over-the-counter Cash / Check at Cooperative Main Office           │ │
│ │ • GCash / Maya E-Wallet Direct Transfer                            │ │
│ │ • Online Bank Deposit / Transfer                                   │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ Note: If you have already processed this payment within the last 24   │
│ hours, please disregard this notice.                                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4. Amortization Schedule Statement PDF Full Layout

**Filename**: `Amortization_Schedule_[Loan ID].pdf`  
**Page Geometry**: Portrait, 10mm margins, 100% printable letter/A4 sheet.  

#### Full PDF Content & Section Mapping:

```text
========================================================================================
                         SAINT JOSEPH MULTIPURPOSE COOPERATIVE
                  Amortization Schedule & Statement of Account
========================================================================================

+--------------------------------------------------------------------------------------+
| Borrower Name:    JUAN DELA CRUZ           | Loan Account No:   LN-2026-1001         |
| Borrower ID:      BRW-2026-0001            | Date Granted:      2026-03-15           |
| Loan Product:     REGULAR LOAN             | Loan Amount:       ₱106,800.00          |
| Payment Term:     36 Months                | Interest Rate:     0.75%/mo             |
| Progress:         2 Paid / 34 Remaining    | Remaining Balance: ₱100,866.00          |
+--------------------------------------------------------------------------------------+

+-------------+---------------+---------------+---------------+---------------+---------------+---------------+----------+
| TERM / YEAR | PAYMENT MONTH |   PRINCIPAL   |  AMORTIZATION | INTEREST(0.75)| MONTHLY AMORT |  AMOUNT PAID  |  STATUS  |
+-------------+---------------+---------------+---------------+---------------+---------------+---------------+----------+
|    START    |   2026-03-15  |  ₱106,800.00  |       -       |       -       |       -       |       -       |[Loan Granted(0.75%)]|
|    Year 1   |   2026-04-15  |  ₱103,833.00  |   ₱2,967.00   |    ₱801.00    |   ₱3,768.00   |   ₱3,768.00   |  [PAID]  |
|             |   2026-05-15  |  ₱100,866.00  |   ₱2,967.00   |    ₱801.00    |   ₱3,768.00   |   ₱3,768.00   |  [PAID]  |
|             |   2026-06-15  |   ₱97,899.00  |   ₱2,967.00   |    ₱801.00    |   ₱2,536.00*  |       -       |[PENDING] |
|             |   ...         |   ...         |   ₱2,967.00   |    ₱801.00    |   ₱3,768.00   |       -       |[PENDING] |
|    Year 2   |   2027-04-15  |   ₱68,229.00  |   ₱2,967.00   |    ₱533.97    |   ₱3,501.00   |       -       |[PENDING] |
|             |   ...         |   ...         |   ₱2,967.00   |    ₱533.97    |   ₱3,501.00   |       -       |[PENDING] |
|    Year 3   |   2028-04-15  |   ₱32,625.00  |   ₱2,967.00   |    ₱266.94    |   ₱3,234.00   |       -       |[PENDING] |
|             |   2029-03-15  |         ₱0.00 |   ₱2,967.00   |    ₱266.94    |   ₱3,234.00   |       -       |[PENDING] |
+-------------+---------------+---------------+---------------+---------------+---------------+---------------+----------+
| TOTAL PAYABLE:              |               |  ₱106,800.00  |   ₱19,223.16  |  ₱126,023.16  | ₱100,866.00 Bal          |
+-----------------------------+---------------+---------------+---------------+---------------+--------------------------+
  * Note: Col G (Amortization) permanently preserves baseline ₱2,967.00; Col I (Monthly Amort) shows lessened ₱2,536.00.

----------------------------------------------------------------------------------------
Generated on [Date] • Saint Joseph Multipurpose Cooperative
```

---

## 🏁 Quality Assurance Sign-Off

- **Total Test Cases**: 40
- **Passed**: ____ / 40
- **Failed**: ____ / 40
- **Tested By**: ____________________________________
- **Role / Title**: ____________________________________
- **Date Verified**: ____________________________________
