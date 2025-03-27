document.getElementById('pdfInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function() {
            displayPDF(new Uint8Array(this.result));
        };
        reader.readAsArrayBuffer(file);
    }
});

async function displayPDF(pdfData) {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const pdfContainer = document.getElementById('pdfContainer');
    pdfContainer.innerHTML = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 0.5 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = { canvasContext: context, viewport: viewport };
        await page.render(renderContext).promise;

        const pageContainer = document.createElement('div');
        pageContainer.className = "page-container";

        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.className = "checkbox";
        checkbox.value = i;

        pageContainer.appendChild(checkbox);
        pageContainer.appendChild(canvas);
        pdfContainer.appendChild(pageContainer);
    }

    document.getElementById('downloadBtn').style.display = "block";
    document.getElementById('downloadBtn').onclick = () => downloadSelectedPages(pdfData);
}

async function downloadSelectedPages(originalPDFData) {
    const pdfDoc = await PDFLib.PDFDocument.load(originalPDFData);
    const newPdf = await PDFLib.PDFDocument.create();
    
    const selectedPages = [...document.querySelectorAll('.checkbox:checked')].map(cb => parseInt(cb.value));
    if (selectedPages.length === 0) return alert("No pages selected!");

    for (let pageNum of selectedPages) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
        newPdf.addPage(copiedPage);
    }

    const newPdfBytes = await newPdf.save();
    const blob = new Blob([newPdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "selected_pages.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

