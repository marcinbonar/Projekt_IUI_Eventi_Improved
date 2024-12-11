import { jsPDF } from 'jspdf';
import Logo from './Logo.png';
import JsBarcode from 'jsbarcode';

const useGenerateTicket = () => {
  const generateTicket = (event: any, ticketWidth: any, ticketHeight: any) => {
    const doc = new jsPDF();

    // Ticket background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(10, 10, ticketWidth, ticketHeight, 3, 3, 'F');

    // Ticket border
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.roundedRect(10, 10, ticketWidth, ticketHeight, 3, 3);

    // Adding logo
    const logo = new Image();
    logo.src = Logo;
    doc.addImage(logo, 'PNG', 15, 15, 20, 20);

    // Ticket title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const title = `Bilet na ${event.title}`;
    const titleX = ticketWidth / 2;
    doc.text(title, titleX, 30, { align: 'center' });

    // Separator line
    doc.setLineWidth(0.5);
    doc.line(15, 35, ticketWidth - 5, 35);

    // Event details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const detailStartX = 15;
    const maxTextWidth = ticketWidth - 30; // Leave margins

    const startDateText = `Data rozpoczęcia: ${event.startDate}`;
    const endDateText = `Data zakończenia: ${event.endDate}`;
    const locationText = `Lokalizacja: ${event.location}`;
    const categoryText = `Kategoria: ${event.category}`;

    doc.text(doc.splitTextToSize(startDateText, maxTextWidth), detailStartX, 50);
    doc.text(doc.splitTextToSize(endDateText, maxTextWidth), detailStartX, 60);
    doc.text(doc.splitTextToSize(locationText, maxTextWidth), detailStartX, 70);
    doc.text(doc.splitTextToSize(categoryText, maxTextWidth), detailStartX, 80);

    // Payment status
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const paymentText =
      event.paymentStatus === 'PAID_ONLINE' || event.paymentStatus === 'PAID_OFFLINE'
        ? 'Oplacono'
        : 'Nieoplacono';
    doc.setTextColor(
      event.paymentStatus === 'PAID_ONLINE' || event.paymentStatus === 'PAID_OFFLINE' ? 0 : 255,
      event.paymentStatus === 'PAID_ONLINE' || event.paymentStatus === 'PAID_OFFLINE' ? 184 : 0,
      event.paymentStatus === 'PAID_ONLINE' || event.paymentStatus === 'PAID_OFFLINE' ? 113 : 0
    );
    doc.text(paymentText, ticketWidth - 30, 90, { align: 'right' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Barcode
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, event.eventId, {
      format: 'CODE128',
      displayValue: false,
      width: 2,
      height: 30,
      margin: 0,
    });
    const barcodeData = canvas.toDataURL('image/png');
    const barcodeX = ticketWidth / 2 - 40;
    const barcodeY = ticketHeight - 40;
    doc.addImage(barcodeData, 'PNG', barcodeX, barcodeY, 80, 20);

    // Save ticket as PDF
    doc.save(`Bilet_na_${event.title}.pdf`);
  };

  return { generateTicket };
};

export default useGenerateTicket;
