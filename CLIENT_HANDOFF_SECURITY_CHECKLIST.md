# 🛡️ Complete Client Turnover & Data Security Guide

This guide ensures a **100% secure, transparent, and client-owned handoff** of the **Cooperative Lending & Amortization System**. Following these steps guarantees that the client has sole administrative control and ownership over the Google Spreadsheet, automated scripts, and financial records, while completely revoking developer access.

---

## 🔒 Why This System is 100% Client-Owned & Secure

1. **Zero External Servers or Databases**:
   - The entire system operates inside the **client's own Google Workspace / Google Account**.
   - No external databases, Supabase, Firebase, AWS, or third-party servers are used.
   - All borrower identities, loan amounts, amortization records, and transaction histories reside exclusively within the client's Google Drive.

2. **Client-Owned Email Sender & Organization Branding**:
   - Email receipts and registration confirmations are dispatched via Google Apps Script's native `GmailApp.sendEmail()`.
   - Emails originate directly from the **client's logged-in Gmail/Google Workspace account**, never from a developer email or external relay service.

3. **Built-in Immutable Audit Logging**:
   - Every critical operation (Borrower Registration, Loan Creation, Payment Recording, PDF Export, Record Deletion, Filtering) automatically logs the active user's email address (`Session.getActiveUser().getEmail()`), timestamp, action code, and transaction details into the `AuditLogs` tab.

4. **Self-Contained File Architecture**:
   - The system consists solely of the Google Spreadsheet, one script engine (`Code.gs`), and twelve HTML interface files (no external servers, dependencies, or manifest file setup required):
     - `Dashboard.html` (The Main Cashier Web App Portal with KPI cards, data tables, and modal launcher)
     - `BorrowerDialog.html` (Member Registration)
     - `NewLoanDialog.html` (Loan Origination & Amortization Generation)
     - `PaymentDialog.html` (Payment Recording & Waterfall Allocation)
     - `ReminderDialog.html` (Payment Reminders & Due Date Hub)
     - `ExportPdfDialog.html` (On-Demand PDF Statement Export)
     - `EditBorrowerDialog.html` (Edit Member Information)
     - `EditLoanDialog.html` (Edit Loan Term/Rates)
     - `VoidPaymentDialog.html` (Void/Reverse Payment Transaction)
     - `FilterDialog.html` (Multi-sheet Filter Engine)
     - `DeleteLoanDialog.html` (Loan & Schedule Cascade Deletion)
     - `DeleteBorrowerDialog.html` (Borrower Cascade Deletion with Safeguards)

---

## 📋 Step-by-Step Turnover Checklist

### Step 1: Copy Spreadsheet to Client's Google Drive
1. Log in to Google Drive using the **Client's Official Google Account** (or cooperative shared administrator account).
2. Open the staging Google Sheet provided by the developer.
3. Click **File > Make a copy**.
4. Set the name to: `Cooperative Lending System (Official Master)`.
5. Choose a secure folder inside the **Client's Google Drive** and click **Make a copy**.
6. *(Note: Making a copy automatically duplicates both the spreadsheet tabs and the attached Apps Script project files).*

---

### Step 2: Verify Apps Script Project Files
1. In the new copy of the spreadsheet, click **`Extensions > Apps Script`**.
2. Confirm that the **Files** sidebar contains:
   - `Code.gs`
   - `Dashboard.html`
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
3. If setting up in a brand-new blank spreadsheet, create each file with matching names and paste the respective code from this repository.
4. Click **💾 Save project** (`Cmd + S` or `Ctrl + S`).

---

### Step 3: Transfer Ownership & Revoke Developer Access
1. Return to the Google Sheet tab in your browser.
2. Click the blue **Share** button in the top-right corner.
3. If the developer's email address is listed under **People with access**:
   - Click the dropdown menu next to the developer's name and select **Remove access** (or if the developer created the file initially, select **Transfer ownership** to the Client first, accept the confirmation, then select **Remove access** for the developer).
4. Under **General access**, ensure access is set to **Restricted** (only added cooperative staff have access).
5. Click **Save** / **Done**.

---

### Step 4: Client Authorizes Apps Script (One-Time Google Authorization)
When running Apps Script for the first time on a new copy, Google requires the logged-in administrator to grant permissions:

1. In the Google Sheet, refresh your browser tab (`F5` or `Cmd + R`).
2. Wait a few seconds for the custom menu **`☰ Menu`** to appear in the menu bar.
3. Click **`☰ Menu > ⚙️ Initialize Database Sheets`**.
4. An **"Authorization Required"** modal will pop up.
5. Click **Continue**.
6. Select your **Cooperative Google Account**.
7. If Google displays *"Google hasn't verified this app"*:
   - Click **Advanced** (bottom left of modal).
   - Click **Go to Cooperative Lending System (unsafe)**.
   *(Note: Google displays this notice for all private in-house scripts not published on the public Google Workspace Marketplace. It is completely normal and safe).*
8. Review the requested permissions:
   - *See, edit, create, and delete your Google Sheets spreadsheets* (for recording loans and payments).
   - *Send email on your behalf* (for emailing payment receipts and PDFs from your Gmail).
   - *See, edit, create, and delete only the specific Google Drive files you use with this app* (for saving exported PDFs to Drive).
9. Click **Allow**.
10. Click **`☰ Menu > ⚙️ Initialize Database Sheets`** once more to complete table setup (including the `Users` authentication table).

---

### Step 5: Deploy Standalone Web App Portal
To provide cashiers with the standalone portal link:
1. In the Apps Script editor, click **Deploy > New deployment** (or **Manage deployments**).
2. Click the gear icon (⚙️) next to *Select type* and choose **Web app**.
3. Configure the settings:
   - **Description**: `Cooperative Lending Portal v1.0`
   - **Execute as**: `Me (<client-administrator@email.com>)` *(Crucial: This grants the web app secure access to update the client's sheet without needing individual sheet edit access for cashiers).*
   - **Who has access**: `Anyone with Google account` (or `Anyone`).
4. Click **Deploy**.
5. Copy the **Web App URL**. Provide this URL to cashiers and staff for daily operations.

---

### Step 6: Cashier Account Provisioning & Password Management
1. **Initial Administrator Account**:
   - The default administrator credentials are:
     - **Username**: `admin`
     - **Password**: `password123`
2. **Adding Cashiers / Staff**:
   - For complete security, public self-registration is strictly disabled.
   - To add a cashier, open the Google Sheet and go to the **`Users`** tab.
   - Insert a new row with:
     - **User ID**: e.g., `USR-0002`
     - **Full Name**: e.g., `Maria Santos`
     - **Username**: e.g., `maria`
     - **Password**: Enter any temporary plaintext password (e.g., `maria2026`). *The system will automatically convert this to a SHA-256 hash upon Maria's first login!*
     - **Role**: `Cashier`
     - **Status**: `Active`
     - **Date Created**: `YYYY-MM-DD`
3. **Deactivating or Resetting Passwords**:
   - Set Status to `Inactive` to instantly block access.
   - To reset a password, type the new temporary password into the Password column; it will auto-hash when the staff member logs in.

---

### Step 7: Post-Handoff Verification & Acceptance
Perform this 6-point verification to confirm 100% operational readiness and privacy:

- [ ] **Spreadsheet Ownership**: Confirmed owned by the Client's Google Account.
- [ ] **Access List**: Developer's email is completely removed from the Google Drive Share menu.
- [ ] **Web App Deployment**: Deployed under the Client's account with "Execute as: Me".
- [ ] **Email Receipts**: Execute a test borrower registration or payment; verify that the email received by the borrower shows the **Client's Gmail address** as the sender.
- [ ] **Database Integrity**: All 8 tabs (`Dashboard`, `Borrowers`, `LoanTypes`, `Loans`, `Amortization`, `Payments`, `Users`, `AuditLogs`) are present with navy header formatting.
- [ ] **Audit Trail**: Open the `AuditLogs` tab and confirm that the test actions record the client's email under `User Email`.
