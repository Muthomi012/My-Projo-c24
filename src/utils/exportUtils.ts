import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Transaction, PettyCashEntry, BalanceSheetItem } from '../types';
import { formatCurrency, formatDate } from './formatters';

// PDF Export Functions
export const exportToPDF = (
  title: string,
  data: any[],
  columns: string[],
  headers: string[],
  companyInfo = true
) => {
  const doc = new jsPDF();
  
  // Company Header
  if (companyInfo) {
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94); // Green color
    doc.text('Charge24 Limited', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('RECHARGE YOUR BRAND', 20, 30);
    doc.text('Ngong Lane Plaza 4th Floor - Ngong Rd.', 20, 40);
    doc.text('020 2577 111 | 0792 041 626', 20, 50);
    doc.text('info@charge24.ke | www.charge24.africa', 20, 60);
    
    // Title
    doc.setFontSize(16);
    doc.text(title, 20, 80);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 90);
  }

  // Table
  autoTable(doc, {
    head: [headers],
    body: data.map(item => columns.map(col => item[col] || '')),
    startY: companyInfo ? 100 : 20,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 197, 94], // Green color
      textColor: 255,
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
};

// Excel Export Functions
export const exportToExcel = (
  title: string,
  data: any[],
  filename?: string
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Add company info at the top
  const companyInfo = [
    ['Charge24 Limited'],
    ['RECHARGE YOUR BRAND'],
    ['Ngong Lane Plaza 4th Floor - Ngong Rd.'],
    ['020 2577 111 | 0792 041 626'],
    ['info@charge24.ke | www.charge24.africa'],
    [''],
    [title],
    [`Generated on: ${new Date().toLocaleDateString()}`],
    ['']
  ];

  // Insert company info at the beginning
  XLSX.utils.sheet_add_aoa(worksheet, companyInfo, { origin: 'A1' });
  
  // Adjust the data range
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  range.s.r = companyInfo.length;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, title);
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(blob, `${filename || title.replace(/\s+/g, '_').toLowerCase()}.xlsx`);
};

// Specific export functions for each module
export const exportPettyCashToPDF = (entries: PettyCashEntry[]) => {
  const data = entries.map(entry => ({
    date: formatDate(entry.date),
    type: entry.type === 'add' ? 'Add Money' : 'Withdraw Money',
    description: entry.description,
    amount: formatCurrency(entry.amount)
  }));

  exportToPDF(
    'Petty Cash Report',
    data,
    ['date', 'type', 'description', 'amount'],
    ['Date', 'Type', 'Description', 'Amount']
  );
};

export const exportPettyCashToExcel = (entries: PettyCashEntry[]) => {
  const data = entries.map(entry => ({
    Date: formatDate(entry.date),
    Type: entry.type === 'add' ? 'Add Money' : 'Withdraw Money',
    Description: entry.description,
    Amount: entry.amount
  }));

  exportToExcel('Petty Cash Report', data, 'petty_cash_report');
};

export const exportTransactionsToPDF = (transactions: Transaction[], title: string) => {
  const data = transactions.map(transaction => ({
    date: formatDate(transaction.date),
    category: transaction.category,
    description: transaction.description,
    amount: formatCurrency(transaction.amount)
  }));

  exportToPDF(
    title,
    data,
    ['date', 'category', 'description', 'amount'],
    ['Date', 'Category', 'Description', 'Amount']
  );
};

export const exportTransactionsToExcel = (transactions: Transaction[], title: string, filename: string) => {
  const data = transactions.map(transaction => ({
    Date: formatDate(transaction.date),
    Category: transaction.category,
    Description: transaction.description,
    Amount: transaction.amount
  }));

  exportToExcel(title, data, filename);
};

export const exportBalanceSheetToPDF = (items: BalanceSheetItem[]) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94);
  doc.text('Charge24 Limited', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('RECHARGE YOUR BRAND', 20, 30);
  doc.text('Balance Sheet', 20, 50);
  doc.text(`As of: ${new Date().toLocaleDateString()}`, 20, 60);

  let yPosition = 80;

  // Group items by category
  const categories = ['assets', 'liabilities', 'equity'];
  
  categories.forEach(category => {
    const categoryItems = items.filter(item => item.category === category);
    const categoryTotal = categoryItems.reduce((sum, item) => sum + item.amount, 0);
    
    doc.setFontSize(14);
    doc.setTextColor(34, 197, 94);
    doc.text(category.toUpperCase(), 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Group by subcategory
    const subcategories = categoryItems.reduce((acc, item) => {
      acc[item.subcategory] = (acc[item.subcategory] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(subcategories).forEach(([subcategory, amount]) => {
      doc.text(subcategory, 30, yPosition);
      doc.text(formatCurrency(amount), 150, yPosition);
      yPosition += 8;
    });
    
    doc.setFontSize(12);
    doc.text(`Total ${category}:`, 30, yPosition);
    doc.text(formatCurrency(categoryTotal), 150, yPosition);
    yPosition += 15;
  });

  doc.save('balance_sheet.pdf');
};

export const exportBalanceSheetToExcel = (items: BalanceSheetItem[]) => {
  const data = items.map(item => ({
    Category: item.category,
    Subcategory: item.subcategory,
    Amount: item.amount,
    Date: formatDate(item.date)
  }));

  exportToExcel('Balance Sheet', data, 'balance_sheet');
};