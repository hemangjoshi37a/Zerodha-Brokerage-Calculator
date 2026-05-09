import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '@/lib/api';
import { Download, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ExportReport: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const generatePDF = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    
    try {
      // Fetch all required data for the report
      const [historyRes, statsRes, insightsRes] = await Promise.all([
        api.get('/history'),
        api.get('/stats'),
        api.get('/insights')
      ]);

      const trades = historyRes.data;
      const stats = statsRes.data;
      const insightsData = insightsRes.data;

      // Initialize PDF (A4 size, portrait)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // -- COLORS & STYLES --
      const primaryColor: [number, number, number] = [34, 197, 94]; // Emerald 500
      const secondaryColor: [number, number, number] = [30, 41, 59]; // Slate 800
      const textColor: [number, number, number] = [71, 85, 105]; // Slate 600

      // -- PAGE 1: COVER & SUMMARY --
      
      // Header Background
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('BROKERAGE QUANT', 20, 30);
      
      // Subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Comprehensive Trading Analytics Report', 20, 40);

      // Report Metadata
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(10);
      const generatedDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      doc.text(`Generated on: ${generatedDate}`, 20, 65);
      doc.text(`Total Trades Analyzed: ${stats.total_trades}`, 20, 72);

      // Summary Dashboard
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(20, 85, 170, 45, 3, 3, 'FD');

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Summary', 25, 95);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const formatCurrency = (val: number) => `Rs. ${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
      
      doc.text(`Net P&L:`, 25, 105);
      doc.setFont('helvetica', 'bold');
      if (stats.total_net_profit >= 0) {
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      } else {
        doc.setTextColor(239, 68, 68); // Red
      }
      doc.text(formatCurrency(stats.total_net_profit), 60, 105);
      
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Charges:`, 110, 105);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(stats.total_charges), 145, 105);

      // Charge Breakdown
      doc.setFont('helvetica', 'normal');
      doc.text(`Brokerage:`, 25, 115);
      doc.text(formatCurrency(stats.charge_breakdown?.brokerage || 0), 60, 115);
      
      doc.text(`STT / CTT:`, 110, 115);
      doc.text(formatCurrency(stats.charge_breakdown?.stt_ctt || 0), 145, 115);

      doc.text(`Exchange Txn:`, 25, 125);
      doc.text(formatCurrency(stats.charge_breakdown?.txn_charges || 0), 60, 125);
      
      doc.text(`GST & Stamp:`, 110, 125);
      const gstStamp = (stats.charge_breakdown?.gst || 0) + (stats.charge_breakdown?.stamp_duty || 0);
      doc.text(formatCurrency(gstStamp), 145, 125);

      // AI Insights Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AI Trading Insights', 20, 150);
      
      let yPos = 160;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      if (insightsData.insights && insightsData.insights.length > 0) {
        insightsData.insights.forEach((insight: any) => {
          // Wrap text to fit page width
          const lines = doc.splitTextToSize(`• ${insight.text}`, 170);
          doc.text(lines, 20, yPos);
          yPos += (lines.length * 5) + 5;
        });
      } else {
        doc.text("No insights available. Add more trades.", 20, yPos);
      }

      // -- PAGE 2: TRADE HISTORY TABLE --
      doc.addPage();
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Trade History', 20, 20);

      const tableColumn = ["Date", "Segment", "Buy", "Sell", "Qty", "Charges", "Net P&L"];
      const tableRows: any[] = [];

      trades.forEach((trade: any) => {
        const tradeData = [
          new Date(trade.created_at).toLocaleDateString('en-IN'),
          trade.segment.replace('_', ' ').toUpperCase(),
          trade.buy_price.toFixed(2),
          trade.sell_price.toFixed(2),
          trade.quantity,
          trade.total_charges.toFixed(2),
          trade.net_profit.toFixed(2)
        ];
        tableRows.push(tradeData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'striped',
        headStyles: { fillColor: secondaryColor },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { top: 30 },
        didDrawPage: function (data) {
          // Footer
          const str = "Page " + doc.internal.getCurrentPageInfo().pageNumber;
          doc.setFontSize(8);
          doc.text(str, data.settings.margin.left, pageHeight - 10);
        }
      });

      // Save PDF
      doc.save(`Brokerage_Quant_Report_${generatedDate.replace(/ /g, '_')}.pdf`);
      setExportSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setExportSuccess(false), 3000);
      
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-black/40 rounded-xl border border-white/10 shrink-0">
            <FileText size={32} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Export PDF Report</h3>
            <p className="text-sm text-gray-400">
              Generate a professional, multi-page document containing your P&L summary, AI insights, and complete trade log.
            </p>
          </div>
        </div>
        
        <Button 
          onClick={generatePDF} 
          disabled={isExporting}
          className={`shrink-0 w-full md:w-auto transition-all duration-300 ${
            exportSuccess 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
          }`}
          size="lg"
        >
          {isExporting ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating PDF...</>
          ) : exportSuccess ? (
            <><CheckCircle className="mr-2 h-5 w-5" /> Downloaded!</>
          ) : (
            <><Download className="mr-2 h-5 w-5" /> Download Report</>
          )}
        </Button>
      </div>
    </div>
  );
};
