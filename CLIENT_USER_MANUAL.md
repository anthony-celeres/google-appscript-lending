# 📘 User & Administrator Manual - Cooperative Lending System (Pop-Up Modal Dialog Edition)

Welcome to the official **Cooperative Lending & Amortization System** developed for **Saint Joseph Multipurpose Cooperative**. This system combines Google Sheets database tables with responsive pop-up modal dialogs, an annual diminishing interest amortization engine, automated waterfall payment allocation, branded PDF statement generation, and Gmail receipts.

---

## 📑 Table of Contents
1. [System Overview & Architecture](#-system-overview--architecture)
2. [Initial Setup & One-Time Installation](#-initial-setup--one-time-installation)
3. [Main Navigation (`☰ Menu`)](#-main-navigation--menu)
4. [Step-by-Step Operational Workflows](#-step-by-step-operational-workflows)
   - [1. Register New Borrower](#1-register-new-borrower-)
   - [2. Create New Loan & Generate Amortization Schedule](#2-create-new-loan--generate-amortization-schedule-)
   - [3. Record Payment & Issue Receipt (with Waterfall Allocation)](#3-record-payment--issue-receipt-)
   - [4. Payment Reminders & Due Date Hub (with Advance-Payment Awareness)](#4-payment-reminders--due-date-hub-)
   - [5. Export Amortization Schedule PDF](#5-export-amortization-schedule-pdf-)
   - [6. Filter Records by Loan or Borrower](#6-filter-records-by-loan-or-borrower-)
   - [7. Edit Borrower Info](#7-edit-borrower-info-)
   - [8. Edit Loan Record](#8-edit-loan-record-)
   - [9. Void/Reverse Error Payment](#9-voidreverse-error-payment-)
   - [10. Delete Loan & Cascade Amortization Records](#10-delete-loan--cascade-amortization-records-)
   - [11. Delete Borrower Record (with Debt Safeguards)](#11-delete-borrower-record-)
5. [Real-Time Financial Dashboard & Collections Radar](#-real-time-financial-dashboard--collections-radar)
6. [Amortization Calculation Engine Explained](#-amortization-calculation-engine-explained)
7. [System Administration & Troubleshooting](#-system-administration--troubleshooting)

---

## 🏛️ System Overview & Architecture

The system operates directly within your Google Spreadsheet and consists of 8 structured tabs:

| Sheet Tab | Purpose & Contents | Key Columns / Schema |
| :--- | :--- | :--- |
| **`Dashboard`** | High-level executive KPI summaries and live Collections Radar. | Metric, Value, Remarks (A:C) & Collections Radar (E:G) |
| **`Borrowers`** | Master member registry with contact details. | Borrower ID, Borrower Name, Address, Phone, Email, Date Joined |
| **`LoanTypes`** | Catalog of cooperative loan products. | Type ID, Name |
| **`Loans`** | Master ledger of all disbursed loans and current balances. | Loan ID, Borrower ID, Borrower Name, Type, Amount (₱), Months, Rate (%), Penalty (%), Date Granted, Remaining Bal, Status |
| **`Amortization`** | 36-month (or custom) installment breakdown per loan with light pastel status formatting. | Loan ID, Borrower Name, Month #, Term Year, Month Name, Principal, Amortization, Interest Pay, Monthly Amort, Penalty, Amount Paid, Status |
| **`Payments`** | Official collection register with payment allocations. | Receipt No, Loan ID, Borrower Name, Date Paid, Principal Paid, Interest Paid, Penalty Paid, Advance Paid, Amount Paid, Principal Balance After, Amortization Balance After, Method |
| **`Users`** | Cashier and administrator authentication credentials and roles. | User ID, Full Name, Username, PasswordHash, Role, Status, Date Created |
| **`AuditLogs`** | Immutable security trail tracking all user actions. | Timestamp, User Email, Action, Details |

---

## 🚀 Initial Setup & One-Time Installation

1. Open your Google Spreadsheet.
2. In the top toolbar, click **`Extensions > Apps Script`**.
3. Ensure the project contains `Code.gs` and all 12 HTML interface files:
   - `Dashboard.html` (Standalone Cashier Portal & Command Center)
   - `BorrowerDialog.html`
   - `NewLoanDialog.html`
   - `PaymentDialog.html`
   - `ReminderDialog.html`
   - `ExportPdfDialog.html`
   - `EditBorrowerDialog.html`
   - `EditLoanDialog.html`
   - `VoidPaymentDialog.html`
   - `FilterDialog.html`
   - `DeleteLoanDialog.html`
   - `DeleteBorrowerDialog.html`
4. Click **Save project** (disk icon).
5. Return to the Google Sheet and refresh your browser tab (`F5` or `Cmd + R`).
6. Locate the custom **`Actions`** menu at the top right of the toolbar.
7. Click **`Actions > Initialize Database Sheets`**.
8. Follow Google's one-time prompt to authorize the script (Click **Continue > Select Account > Advanced > Go to Cooperative Lending System (unsafe) > Allow**).
9. Click **`Actions > Initialize Database Sheets`** once more. All tabs will be initialized with official dark navy headers and formula presets.

---

## Main Navigation (`Actions` Menu)

Once authorized, staff interact with the system entirely through centered modal dialogs accessed via the **`Actions`** menu:

- **`Register New Borrower`**: Register new cooperative members.
- **`Create New Loan & Schedule`**: Disburse loans and calculate amortization schedules.
- **`Record Payment & Issue Receipt`**: Collect loan payments with waterfall allocation.
- **`Payment Reminders & Due Date Hub`**: Monitor upcoming/overdue deadlines and 1-click batch email reminders.
- **`Export Amortization PDF`**: Generate and export branded statement PDFs.
- **`Edit Borrower Info`**: Modify member contact info & auto-cascade name changes across sheets.
- **`Edit Loan Record`**: Adjust loan product category, penalty rate, or recalculate amortization schedule.
- **`Void/Reverse Error Payment`**: Undo mistaken payments, restore loan balance, and revert installment rows.
- **`Filter Records by Loan / Borrower`**: Filter multiple database tabs simultaneously.
- **`Delete Loan & Amortization`**: Cascade deletion of a loan and installment schedules.
- **`Delete Borrower Record`**: Safe member deletion with debt protection rules.
- **`Initialize Database Sheets`**: Set up or verify table structures and formatting.

## 📋 Step-by-Step Operational Workflows

### 1. Register New Borrower 👤
*Registers a member into the cooperative master database and dispatches a welcome email.*

1. Click **`☰ Menu > 👤 Register New Borrower`**.
2. Complete the form fields:
   - **Borrower Full Name**: e.g., `Juan M. dela Cruz, Jr.`
   - **Home Address**: e.g., `123 Rizal Ave, Quezon City`
   - **Mobile Number**: e.g., `+63 917 555 0192` *(stored as text format to preserve leading `+` and zeroes)*.
   - **Email Address**: e.g., `juan.delacruz@example.com`
3. Click **Save Borrower Record**.
4. **What happens automatically**:
   - A unique identifier is assigned (format: `BOR-YYYY-XXX`).
   - The borrower is appended to the **`Borrowers`** tab.
   - A welcome and registration confirmation email is sent directly from your Gmail account to the borrower.
   - The registration is recorded in **`AuditLogs`**.

---

### 2. Create New Loan & Generate Amortization Schedule ➕
*Disburses a loan, records terms, and builds the full annual diminishing amortization schedule.*

1. Click **`☰ Menu > ➕ Create New Loan & Schedule`**.
2. Select or enter the loan parameters:
   - **Select Borrower**: Choose from the registered members dropdown list.
   - **Loan Category**: Select product (e.g., `Regular Loan`, `Business Loan`, `Emergency Loan`).
   - **Loan Amount (₱)**: Enter the principal granted (e.g., `106800`).
   - **Tenure**: Select term (36, 30, 24, 18, 12, 6 months) or choose *Type manually* for custom durations.
   - **Monthly Rate (%)**: Select interest rate (0.75%, 0.80%, 0.85%, 0.90%, 0.95%, 1.00%) or choose *Type manually*.
   - **Penalty Rate (%)**: Default is `3.0%` (or choose *Type manually* to specify a custom late fee percentage).
   - **Date of Loan**: Select loan origination date. Amortization payments automatically begin the following month.
3. Click **Generate Amortization Schedule**.
4. **What happens automatically**:
   - A unique Loan ID is generated (format: `LN-YYYY-XXXX`).
   - An active loan entry is added to **`Loans`**.
   - A **`START`** grant row (Row 0) is generated in **`Amortization`** with status `Loan Granted (0.75%)`.
   - All subsequent monthly installment rows are generated with exact principal, diminishing interest, and total monthly amortization amounts.
   - The transaction is logged in **`AuditLogs`**.

---

### 3. Record Payment & Issue Receipt 💳
*Applies payments with automatic waterfall allocation, sends official Gmail receipts, and attaches an updated Amortization PDF.*

1. Click **`☰ Menu > 💳 Record Payment & Issue Receipt`**.
2. Fill out the dialog following the streamlined workflow:
   - **Select Target Loan**: Choose from the active loans dropdown.
   - **Warning for Late Payments**: Real-time banner indicating **ON TIME** (green) or **OVERDUE** (amber warning with exact overdue days count).
   - **Monthly Amortization**: Dedicated reference card showing the scheduled installment due for the current month (principal + scheduled interest).
   - **Enter Amount (₱) & Payment Method**: Type the amount collected (placeholder `Enter amount (e.g. 50000)`) and select method (`Cash`, `Bank Transfer`, `GCash`, `Maya`, `Check`, or `Others` which reveals an instant text box to enter any custom method like Palawan, MLhuillier, etc.).
   - **Penalty**: Automatically checked with the agreed penalty fee if overdue. Cashiers can uncheck to waive or modify the fee amount.
   - **Total Amount to be Paid**: Dynamically sums **Monthly Amortization + Penalty** (if checked) with a 1-click **`Pay Exact Due`** button to autofill the input.
   - **Payment Date**: Defaults to today's date.
   - **Email Notice**: Real-time confirmation showing the borrower's registered email where the e-receipt will be sent.
3. Review the **Comprehensive Payment Allocation & Balance Summary**:
   - 🏷️ **Real-Time Status Badge**: Displays `ENTER AMOUNT`, `FULL LOAN PAYOFF`, `ADVANCE (X MONTHS)`, `PARTIAL ADVANCE`, `MONTHLY SETTLED`, or `PARTIAL PAYMENT`.
   - 🔶 **Late Penalty Fee Paid**: Deducted first (if applicable).
   - 🔷 **Interest Portion Paid**: Scheduled monthly interest deducted second.
   - 🟢 **Principal Reduction**: Remainder applied to reduce loan balance.
   - 📦 **Coverage Box**: Detailed multi-month settlement and forward advance credit indicators (or underpayment warning showing balance still due this month).
   - ⚠️ **Overpayment Alert**: Warns if entered amount exceeds the entire loan payoff, displaying the exact refund due to the borrower.
   - 💼 **Current Principal Balance & Estimated Remaining Balance**: Live ending principal calculation before recording.
4. Click **Issue Receipt & Update Sheet**.
5. **What happens automatically**:
   - Official Receipt No. is created (format: `OR-YYYY-XXXX`).
   - Payment record is appended to **`Payments`**, logging the collecting cashier's email.
   - The current installment row in **`Amortization`** is marked `Paid` with the paid amount and updated balance.
   - Subsequent pending rows in **`Amortization`** have their principal balances cascaded automatically.
   - The remaining balance in **`Loans`** is updated (marked `Fully Paid` when balance hits ₱0.00).
   - **Branded PDF Amortization Schedule & Statement of Account** is generated.
   - Official HTML payment receipt with breakdown + attached PDF schedule is emailed directly to the borrower.
   - The transaction is logged in **`AuditLogs`**.

---

### 4. Payment Reminders & Due Date Hub 🔔
*Monitors loan deadlines in real time with advance-payment intelligence and dispatches 1-click batch reminders.*

1. Click **`☰ Menu > 🔔 Payment Reminders & Due Date Hub`**.
2. The interactive hub modal opens (620×580px) loaded with all active loan accounts.
3. **Explore Dashboard Metric Cards**:
   - **`ALL`**: Total active portfolios.
   - **`⚠️ OVERDUE`**: Accounts where the due date has passed without settlement.
   - **`🔔 DUE TODAY`**: Accounts where installment deadline falls exactly on today's calendar date.
   - **`📅 UPCOMING`**: Accounts due within the next 7 calendar days.
4. **Smart Advance-Payment Safeguard**:
   - If a borrower already settled this month's installment in advance (e.g. paid multiple months upfront), their next pending installment is scheduled for a future month.
   - The hub **never** mistakenly alerts them as "Due Today" or "Overdue", preserving member trust.
5. **Filter & Search**:
   - Click any of the 4 cards to immediately filter the table to that specific group.
   - Type any part of a borrower's name or Loan ID into the search bar for instant client lookup.
6. **1-Click Batch Dispatch**:
   - Use **`☑️ Select All`** or select individual accounts using their checkboxes.
   - Click the action button: **`Send Reminders (X Selected)`**.
   - The system formats a tier-specific branded HTML email (Overdue alert with penalty calculation, Due Today notice, or Upcoming reminder) and dispatches it directly to each selected borrower's email via Gmail.
   - Detailed dispatch summary is displayed and logged in **`AuditLogs`**.

---

### 5. Export Amortization Schedule PDF 📄
*Generates an on-demand, print-ready official statement of account for any loan.*

1. Click **`☰ Menu > 📄 Export Amortization PDF`**.
2. Select any loan from the dropdown.
3. Review the loan preview (Borrower name, product, amount, tenure, rate, remaining balance, email).
4. Select dispatch preferences and customize recipient emails:
   - ☑️ **Send PDF directly to Borrower**: Pre-populates with borrower's email on record, but can be customized or edited directly.
   - ☑️ **Send copy to Staff / Custom Email**: Pre-populates with your logged-in email, or allows entering any custom email addresses (separated by commas).
5. Click **📄 Export & Dispatch Amortization PDF**.
6. **What happens automatically**:
   - System builds the styled cooperative statement of account with member details, summary box, full schedule table, and signature blocks.
   - Attaches the PDF directly to the specified email recipients in-memory without consuming Google Drive storage space.
   - Logs the dispatch in the `AuditLog` sheet.

---

### 6. Filter Records by Loan or Borrower 🔍
*Isolates data for a specific loan or member across multiple sheets simultaneously without altering formulas or deleting data.*

1. Click **`☰ Menu > 🔍 Filter Records by Loan / Borrower`**.
2. Choose your filter mode:
   - **📑 By Loan ID**: Choose a specific loan from the dropdown.
   - **👤 By Borrower**: Choose a specific borrower from the dropdown.
3. Click **🔍 Apply Sheet Filter**.
   - Filters are applied simultaneously across **`Loans`**, **`Amortization`**, and **`Payments`**.
4. To return to the complete database view:
   - Open the filter modal and click **🔄 Show All Records (Reset Filter)**.

---

### 7. Edit Borrower Info ✏️
*Updates member contact information and automatically cascades name changes across all database sheets.*

1. Click **`☰ Menu > ✏️ Edit Borrower Profile`**.
2. Select the member from the dropdown list.
3. Their current registered profile details (Full Name, Address, Phone, Email) are loaded into the form.
4. Modify any required fields:
   - Fix typographical errors in the member's name.
   - Update contact mobile number or registered email address.
5. Click **Save Profile Changes**.
6. **What happens automatically**:
   - The member row is updated in **`Borrowers`**.
   - If the name was modified, the system automatically cascades the new name across all matching rows in **`Loans`**, **`Amortization`**, and **`Payments`**.
   - The edit and cascade counts are permanently recorded in **`AuditLogs`**.

---

### 8. Edit Loan Record ✏️
*Modifies loan metadata or recalculates the amortization schedule with full payment integrity protection.*

1. Click **`☰ Menu > ✏️ Edit Loan Terms`**.
2. Select the target loan account from the dropdown.
3. **Smart Payment Safeguards**:
   - **If zero payments have been recorded yet**: The system unlocks all fields (Principal, Tenure, Rate, Date Granted). Editing any term safely recalculates and overwrites the entire amortization schedule without breaking sheet formatting.
   - **If payments have already been collected**: Core financial variables are automatically locked to preserve accounting integrity. Staff can still update the Loan Category and agreed Penalty Rate.
4. Click **Save & Apply Changes**.
5. The updated terms and any regenerated schedules are saved, and the action is logged in **`AuditLogs`**.

---

### 9. Void/Reverse Error Payment ↩️
*Reverses mistaken cashier payments, restores borrower loan principal, and reverts amortization status.*

1. Click **`☰ Menu > ↩️ Void / Reverse Erroneous Payment`**.
2. Select the target Official Receipt number (e.g., `OR-2026-1045`).
3. Review the receipt details (Borrower Name, Loan ID, Date Paid, Amount Collected, and Principal to be Restored).
4. Select the **Reason for Voiding** (e.g., *Cashier Mistake / Wrong Amount*, *Wrong Loan Account Selected*, *Payment Bounced / Cancelled Check*, *Duplicate Payment*).
5. Click **Confirm & Void Payment**.
6. **What happens automatically**:
   - The payment record in **`Payments`** is preserved for bookkeeping but stamped as `[VOIDED]` with the audit reason.
   - The loan's remaining principal balance in **`Loans`** is increased back by the exact principal portion paid. If the loan was previously marked `Fully Paid`, it is automatically reactivated as `Active`.
   - The most recently settled installment row in **`Amortization`** is reverted from `Paid` back to `Pending` with Amount Paid reset to ₱0.00.
   - Subsequent amortization balances are cascaded forward automatically.
   - The reversal is logged in **`AuditLogs`**.

---

### 10. Delete Loan & Cascade Amortization Records 🗑️
*Safely removes a loan and its associated installments and receipts.*

1. Click **`☰ Menu > 🗑️ Delete Loan & Amortization`**.
2. Select the target loan to delete.
3. Review the details card (Borrower, original amount, remaining balance, status).
4. Read the warning prompt and check the confirmation box:
   - ☑️ *I confirm that I want to permanently delete this loan*
5. Click **Delete Loan & Amortization**.
6. **What happens automatically**:
   - The loan row is removed from **`Loans`**.
   - All monthly installment rows for that loan are removed from **`Amortization`**.
   - Associated payment logs are cleaned up from **`Payments`**.
   - The deletion is logged with full details in **`AuditLogs`**.

---

### 11. Delete Borrower Record 🗑️
*Safely removes a member record with strict active loan safeguards.*

1. Click **`☰ Menu > 🗑️ Delete Borrower Record`**.
2. Select the borrower to delete.
3. **Debt Safeguard Protection**:
   - If the borrower has **zero active debt**, the delete button unlocks upon checking general confirmation.
   - If the borrower has **active loans or unpaid balances**, the system displays an alert and **blocks deletion** unless the cashier explicitly checks:
     - ☑️ *Cascade delete all loans, amortizations & payments for this borrower*
4. Click **Delete Borrower Record**.
5. The member and cascaded records are removed, and an audit trail is created.

---

## 📊 Real-Time Financial Dashboard & Collections Radar

The **`Dashboard`** tab provides live cooperative KPI tracking and collections monitoring computed via automated Google Sheets formulas:

### Portfolio Executive KPIs (Columns A to C)

| Metric | Formula | Description |
| :--- | :--- | :--- |
| **Total Borrowers** | `=COUNTA(Borrowers!A2:A)` | Total count of registered cooperative members. |
| **Total Active Loans** | `=COUNTIF(Loans!K2:K, "Active")` | Total number of currently active loan portfolios. |
| **Total Outstanding Balance** | `=SUM(Loans!J2:J)` | Total collectible principal remaining across all active loans. |
| **Total Money Collected** | `=SUM(Payments!E2:E)` | Gross collections (Principal + Interest + Penalties). |
| **Total Interest Earned** | `=SUM(Payments!F2:F)` | Net interest income earned by the cooperative. |
| **Total Principal Collected**| `=SUM(Payments!G2:G)` | Recovered loan capital returned to cooperative reserves. |
| **Total Penalties Collected**| `=SUM(Payments!H2:H)` | Total revenue from late payment penalty charges. |

### Live Collections Radar (Columns E to G)

Located adjacent to the KPI cards, the Collections Radar gives cashiers and committee members an instant pulse on daily deadlines:

| Radar Metric | Formula | Description |
| :--- | :--- | :--- |
| **Overdue Accounts** | `=COUNTIFS(Amortization!L2:L, "Pending", Amortization!C2:C, "<>START") + COUNTIFS(Amortization!L2:L, "Underpaid", Amortization!C2:C, "<>START") + COUNTIFS(Amortization!L2:L, "Overdue", Amortization!C2:C, "<>START")` | Accounts requiring urgent collection action. |
| **Accounts Due Today** | `=COUNTIFS(Amortization!L2:L, "Pending", Amortization!E2:E, TEXT(TODAY(), "MMMM")) + COUNTIFS(Amortization!L2:L, "Underpaid", Amortization!E2:E, TEXT(TODAY(), "MMMM"))` | Active installments due in the current calendar month/day. |
| **Upcoming (Active Portfolios)** | `=COUNTIF(Loans!K2:K, "Active")` | Overall active loan accounts currently running. |
| **Collections Efficiency Rate** | `=IF(B2>0, TEXT(B5/(B4+B5)*100, "0.0") & "%", "100%")` | Cooperative capital recovery index tracking cash collected vs. outstanding balance. |

---

## 🧮 Amortization Calculation Engine & Approved Business Rules

The system implements the cooperative's **Annual Diminishing Interest Engine** with universal 2-decimal ceiling precision:

### 1. Universal Precision & Rounding Policy (Round-Up to 2 Decimal Places)
- **Centavo Ceiling Rule**: All monetary calculations—interest payments, late penalty fees, monthly amortizations, remaining balances, and existing database records—are rounded **UP** to **two (2) decimal places** (`Math.ceil(val * 100) / 100` with epsilon guard).
- **Exact Centavo Format**: All values strictly maintain 2-decimal currency formatting (`₱#,##0.00`) across all Google Sheet cells, modal dialogs, PDF exports, and email receipts. No rounding to whole integers is performed.

### 2. Loan Amortization Schedule Engine
1. **Monthly Principal Installment (`Amortization`)**:
   $$\text{Monthly Principal} = \operatorname{ceil}_2\left( \frac{\text{Loan Amount}}{\text{Tenure (Months)}} \right)$$
   *(e.g., ₱106,800.00 granted over 36 months = ₱2,967.00 constant principal monthly installment)*.

2. **Yearly Starting Balance & Diminishing Interest**:
   - **Year 1 (Months 1–12)**: Interest is computed on the initial loan amount.
     $$\text{Monthly Interest} = \operatorname{ceil}_2(\text{Initial Loan Amount} \times \text{Monthly Rate})$$
     *(₱106,800.00 \times 0.75\% = ₱801.00 / month)*
     $$\text{Monthly Amortization (Total Due)} = \text{₱2,967.00} + \text{₱801.00} = \mathbf{₱3,768.00}$$
   - **Year 2 (Months 13–24)**: Starting balance is recalculated after deducting 12 principal payments.
     $$\text{Year 2 Balance} = \text{Initial Loan Amount} - (12 \times \text{Monthly Principal})$$
     *(₱106,800.00 - ₱35,604.00 = ₱71,196.00 \rightarrow \text{Monthly Interest} = \operatorname{ceil}_2(₱71,196.00 \times 0.75\%) = ₱533.97)*
   - **Year 3 (Months 25–36)**: Starting balance is recalculated after deducting 24 principal payments.
     $$\text{Year 3 Balance} = \text{Initial Loan Amount} - (24 \times \text{Monthly Principal})$$
     *(₱106,800.00 - ₱71,208.00 = ₱35,592.00 \rightarrow \text{Monthly Interest} = \operatorname{ceil}_2(₱35,592.00 \times 0.75\%) = ₱266.94)*

### 3. Late Penalty Calculation Basis (Universal 30-Day Grace Period & Deficit Basis)
- **Universal 30-Day Grace Period**:
  - All overdue loans (whether ₱0.00 was paid or a partial deficit remains) are granted a **30-day grace period** following the due date.
  - **Days 1 to 30 past due date**: Grace period is active — Late Penalty is strictly **`₱0.00`**.
  - **Day 31+ past due date**: The agreed **3% late penalty fee** takes effect.
- **Deficit-Based Calculation**:
  - **Full Unpaid Month (₱0.00 paid)**: 3% penalty is calculated against the scheduled Monthly Amortization:
    $$\text{Late Penalty Fee (3%)} = \operatorname{ceil}_2(\text{₱3,767.67} \times 0.03) = \mathbf{₱113.04}$$
  - **Underpaid / Deficit Installment**: 3% penalty is calculated strictly against the **unpaid deficit amount**:
    $$\text{Late Penalty Fee (3%)} = \operatorname{ceil}_2(\text{₱1,768.00} \times 0.03) = \mathbf{₱53.04}$$
- **Capitalization into Principal Balance**:
  - If the late penalty remains unpaid after 30 days from the due date, it is added to the borrower's **Principal Balance** (`Remaining Bal` on the `Loans` sheet and forward amortization balance).
  - Cashiers also have full discretion in the Payment Dialog to waive or edit the penalty fee as approved by cooperative management.

### 4. Advance Payments, Multi-Month Settlement & Excess Principal
- **Multi-Month Full Settlement (e.g., Equivalent of 2 Months)**: If a borrower pays the equivalent of 2 (or more) full installments (e.g., $2 \times ₱3,768.00 = ₱7,536.00$), **both Month 1 and Month 2 are marked `Paid`**. The next pending due date automatically skips to **Month 3**, and the member owes nothing for Month 2.
- **Partial Advance (Lessen Next Month)**: If a borrower pays an excess amount that does not cover a full month (e.g., paying ₱5,000.00 on a ₱3,768.00 schedule $\rightarrow$ $+₱1,232.00$ excess):
  - **`Amortization` (Col G)** remains **unmodified** (₱2,967.00) so administrators always have the original contractual principal schedule for reference.
  - **`Monthly Amort` (Col I)** is updated to reflect the lessened payment due next month: $₱3,768.00 - ₱1,232.00 = \mathbf{₱2,536.00}$.
  - Next month, the payment dialog and amortization statement automatically pull **₱2,536.00** as the scheduled payment.

---

## 🛠️ System Administration & Troubleshooting

### Modifying or Adding Loan Products
- Open the **`LoanTypes`** tab.
- Simply add rows with a `Type ID` (e.g., `LT-008`) and `Name` (e.g., `Appliance Loan`).
- The new category will automatically appear in the loan origination modal.

### Preserving Contact Number Formats
- The **`Borrowers`** phone column is set to plain text format (`@`).
- When manually editing phone numbers, prefix with an apostrophe (e.g., `'09175550192` or `'+639175550192`) so Google Sheets does not strip leading zeroes or `+` signs.

### Email Receipt Deliverability
- Official receipts are sent using your Google Account's Gmail quota (typically 100 emails/day for free Gmail accounts, 1,500/day for Google Workspace accounts).
- If a borrower reports not receiving an email receipt, check that their email address is spelled correctly in **`Borrowers`** and have them check their Spam/Junk folder.
- You can re-send their statement anytime using **`📄 Export Amortization PDF`**.

### Re-applying Table Header Styling
- If any headers lose their dark navy styling or formatting, run the script utility function `applyDarkHeaderStyle()` from the Apps Script editor to re-apply navy headers across all sheets.

---

## 🌐 Standalone Cashier Web App Portal & Staff Access

In addition to interacting via the Google Sheets menu, cashiers and loan officers can use the **Standalone Web App Portal**:

### 1. Dual-Access Experience
* **Cashiers**: Work directly inside the fast, streamlined Web App. They can record payments, look up borrower amortization ledgers, and trigger email reminders without needing to edit cells in the raw spreadsheet grid.
* **Administrators**: Can inspect raw formula cells, run custom spreadsheet filters, or audit financial records directly inside the master Google Sheet anytime.

### 2. Managing Cashier & Officer Accounts (`Users` Tab)
* **Public Self-Registration is Disabled**: For maximum cooperative data security, only authorized administrators can create staff accounts.
* **Default Admin Account**:
  - **Username**: `admin`
  - **Password**: `password123`
* **Adding a Cashier**:
  1. Open the Google Sheet and navigate to the **`Users`** tab.
  2. Append a row:
     - **User ID**: `USR-0002` (or next sequence)
     - **Full Name**: e.g., `Maria Santos`
     - **Username**: e.g., `maria`
     - **Password**: Enter any temporary plaintext password (e.g., `maria2026`). *The system will automatically convert this to a SHA-256 hash when Maria logs in for the first time.*
     - **Role**: `Cashier` (or `Officer` / `Admin`)
     - **Status**: `Active`
     - **Date Created**: `YYYY-MM-DD`
* **Password Resets**:
  - If a staff member forgets their password, simply type a new temporary password into the Password column of their row. It will automatically hash upon their next login.
* **Account Deactivation**:
  - To immediately revoke access for a staff member, change their **Status** from `Active` to `Inactive`. Deactivated users are blocked from logging in.

