# Cooperative Lending Web App Portal - Deployment Guide

This guide explains how to deploy the **Cashier & Admin Web Portal** so that:
1. **The Cashier / Admin gets a smooth, fast web app** featuring a **Loading Screen**, **Sign In**, live financial metric cards, and searchable data tables.
2. **The master Google Sheet remains intact and accessible** whenever you want to inspect raw cells, formulas, or audit records.
3. **Data syncs in real time**: Every transaction recorded in the Web App updates the Google Sheet immediately.

---

## Files in `webapp/` (Complete Feature Parity)

To give the Cashier and Admin **100% of the features from the raw Google Sheet**, the following files are available in `webapp/`:

| File | Purpose & Feature in Dashboard |
| :--- | :--- |
| **`Code.gs`** | **All-in-One Engine**: contains all loan amortization logic, waterfall payment allocation, user authentication, and web app handlers. |
| **`Dashboard.html`** | **The Main Command Center**: Loading screen, Sign In, KPI cards, searchable tables, row action buttons, and modal launcher. |
| **`NewLoanDialog.html`** | **New Loan & Schedule**: generates 36-month diminishing interest amortization schedules. |
| **`PaymentDialog.html`** | **Record Payment**: waterfall allocation (penalty -> interest -> principal), live status badge, and receipt generation. |
| **`BorrowerDialog.html`** | **Register Borrower**: adds member profile with phone, address, and email. |
| **`ReminderDialog.html`** | **Reminders Hub**: delinquent and grace-period accounts, due date radar, and batch reminders. |
| **`ExportPdfDialog.html`** | **Export Statement PDF**: on-demand amortization statement PDF generator and downloader. |
| **`EditBorrowerDialog.html`** | **Edit Borrower Info**: update member profile, contact numbers, and emails. |
| **`EditLoanDialog.html`** | **Edit Loan Record**: update loan category, agreed penalty rate, and terms. |
| **`VoidPaymentDialog.html`** | **Void Error Payment**: reverse mis-entered receipts with automated principal restoration. |
| **`FilterDialog.html`** | **Multi-Sheet Filter**: search and filter across Loans, Amortization, and Payments. |
| **`DeleteLoanDialog.html`** | **Delete Loan & Schedule**: cascade deletion of loan and associated amortization rows. |
| **`DeleteBorrowerDialog.html`** | **Delete Borrower Record**: safeguard borrower deletion with active loan checks. |

---

## Step-by-Step Setup in Apps Script

1. Open your master **Google Spreadsheet** in your browser.
2. Click **`Extensions > Apps Script`** from the top menu bar.
3. In the left sidebar:
   - Click **`Code.gs`**: Paste the entire code from **`webapp/Code.gs`**.
   - Click **`+` > HTML**: Add each of the HTML files above with matching names (e.g. `Dashboard`, `NewLoanDialog`, `PaymentDialog`, `BorrowerDialog`, `ReminderDialog`, `ExportPdfDialog`, `EditBorrowerDialog`, `EditLoanDialog`, `VoidPaymentDialog`, `FilterDialog`, `DeleteLoanDialog`, `DeleteBorrowerDialog`).
4. Click **Save project** (`Cmd + S` or `Ctrl + S`).
5. Click **Deploy > Manage deployments > Edit > Version: New version > Deploy**.

---

### Step 2: Deploy as a Standalone Web App
1. In the top-right corner of the Apps Script editor, click the blue **`Deploy`** button.
2. Select **`New deployment`**.
3. In the modal that appears, click the gear icon next to **Select type** and choose **`Web app`**.
4. Configure the deployment settings:
   - **Description**: `Cooperative Lending Portal v1.0`
   - **Execute as**: `Me (<your-email@gmail.com>)` *(Important: This ensures the web app can read/write data to the sheet safely).*
   - **Who has access**: `Anyone with Google account` (or `Anyone` if you want instant access without Google login).
5. Click **`Deploy`**.
6. Google will provide a **Web app URL** (e.g., `https://script.google.com/macros/s/AKfycb.../exec`).
7. **Copy this URL** - this is your dedicated Web App Portal link! Bookmark it on your browser or desktop.

---

## First-Time Login & User Management
When you or your cashier launch the Web App URL:
1. The **Loading Screen** will greet you while establishing a secure database connection.
2. The **Sign In** screen will appear:
   * **Default Admin Username**: `admin`
   * **Default Password**: `password123`
3. **Provisioning Additional Cashiers or Staff**:
   * For enterprise data security, **public self-registration is strictly disabled**.
   * To add a new cashier, loan officer, or staff member, open the Google Sheet and go to the **`Users`** tab.
   * Add a new row:
     - **User ID**: e.g., `USR-0002`
     - **Full Name**: e.g., `Maria Santos`
     - **Username**: e.g., `maria`
     - **Password**: Type any temporary plaintext password (e.g., `maria2026`). *The system will automatically convert it to a secure SHA-256 hash upon Maria's first login!*
     - **Role**: `Cashier` (or `Officer` / `Admin`)
     - **Status**: `Active`
     - **Date Created**: `YYYY-MM-DD`
   * To deactivate a user, simply change their Status to `Inactive`.
   * To reset a user's password, simply type their new temporary password into the Password column of their row. It will automatically hash upon their next login.

---

## 🔄 How the Dual-Access Workflow Works

```
                        ┌───────────────────────────────────────────────┐
                        │             MASTER GOOGLE SPREADSHEET         │
                        │       (All raw rows, formulas, audit logs)    │
                        └───────────────────────┬───────────────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        ┌───────────────────────────────┐                 ┌───────────────────────────────┐
        │    🌐 CASHIER WEB APP PORTAL  │                 │    📊 RAW GOOGLE SHEET TAB    │
        │ - Loading & Sign-up/Login     │                 │ - Direct spreadsheet access   │
        │ - Clean KPI summary cards     │                 │ - Inspect formulas & cells    │
        │ - Searchable data tables      │                 │ - Manual Excel/CSV exports    │
        │ - Instant receipt recording   │                 │ - Built-in ☰ Menu dialogs     │
        └───────────────────────────────┘                 └───────────────────────────────┘
```

* **Smooth Daily Work**: Open the Web App link for fast collections, recording payments, and searching borrower balances.
* **Inspect Raw Data**: Whenever you want to inspect raw cells or run custom spreadsheet formulas, click the **"📊 Open Master Sheet"** button at the top right of the Web App navigation bar to jump directly into the raw spreadsheet.
* **Complete Protection**: The cashier can see all necessary data (balances, due dates, loan schedules) without accidentally typing over formulas or deleting rows in the spreadsheet grid.

---

## ❓ Troubleshooting

### Error: `Failed to aggregate dashboard data: getActiveLoansList is not defined`
* **Why this happens**: The Apps Script project you deployed does not have the core financial functions from `Code.gs`. This usually occurs if:
  1. You created a separate script file from `script.google.com` instead of clicking **`Extensions > Apps Script`** from within your Google Spreadsheet.
  2. You accidentally deleted or replaced `Code.gs` with a partial file.
* **How to fix in 1 minute**:
  1. Go to your **Google Spreadsheet** > click **`Extensions > Apps Script`**.
  2. Select **`Code.gs`** in the left sidebar.
  3. Replace the entire contents with **`webapp/Code.gs`** (which contains all 3,490+ lines of the system, including `getActiveLoansList` and the web portal).
  4. Save project (`Cmd + S` or `Ctrl + S`).
  5. Click **Deploy > Manage deployments > Click Edit (pencil icon) > Version: New version > Deploy**.
  6. Refresh your web app link.

