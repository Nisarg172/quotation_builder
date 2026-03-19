import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TextRun,
  ImageRun,
  AlignmentType,
  VerticalAlign,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import type { QuoteData, QuoteItem } from "../Types/type";
import { CoumpanyInfo } from "@/utils/const";

const GST_RATE = 18;

// ✅ FONT SETTINGS
const FONT_FAMILY = "Calibri";
const FONT_SIZE = 24; // 12pt

const CELL_PADDING = {
  top: 150,
  bottom: 150,
  left: 120,
  right: 120,
};

const getImageBuffer = async (url: string) => {
  const res = await fetch(url);
  return await res.arrayBuffer();
};

export default async function generateQuoteWord(data: QuoteData) {
  let srNo = 0;
  const random5Digit = Math.floor(10000 + Math.random() * 90000);

  const infoData =
    CoumpanyInfo.find(({ id }) => id == data.coumpanyId) || CoumpanyInfo[0];

  // ================= GROUP =================
  const groupedItems = data.items.reduce<Record<string, QuoteItem[]>>(
    (acc, item) => {
      if (!acc[item.catagoryName]) acc[item.catagoryName] = [];
      acc[item.catagoryName].push(item);
      return acc;
    },
    {}
  );

  // ================= HEADER =================
  let logoParagraph = new Paragraph("");

  if (infoData.logo) {
    try {
      const buffer = await getImageBuffer(infoData.logo);
      logoParagraph = new Paragraph({
        children: [
          new ImageRun({
            data: buffer,
            transformation: { width: 120, height: 120 },
            type: "jpg",
          }),
        ],
      });
    } catch {}
  }

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            margins: CELL_PADDING,
            children: [logoParagraph],
          }),
          new TableCell({
            width: { size: 75, type: WidthType.PERCENTAGE },
            margins: CELL_PADDING,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: infoData.companyName,
                    bold: true,
                    size: 28,
                  }),
                ],
              }),
              new Paragraph(`GST: ${infoData.GST || "-"}`),
              new Paragraph(`Contact: ${infoData.contactName}`),
              new Paragraph(`Phone: ${infoData.contactNo}`),
              new Paragraph(`Email: ${infoData.email}`),
              new Paragraph(`Address: ${infoData.address}`),
            ],
          }),
        ],
      }),
    ],
  });

  // ================= TABLE =================
  const columnWidths = [5, 35, 12, 10, 10, 5, 8, 8, 7];

  const createCell = (
    text: any,
    i: number,
    align = AlignmentType.CENTER
  ) =>
    new TableCell({
      width: { size: columnWidths[i], type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      margins: CELL_PADDING,
      children: [
        new Paragraph({
          alignment: align,
          children: [
            new TextRun({
              text: String(text),
            }),
          ],
        }),
      ],
    });

  const tableRows: TableRow[] = [];

  const headers = [
    "Sr",
    "Description",
    "Image",
    "Make",
    "Model",
    "Qty",
    "Supply",
    "Install",
    "Total",
  ];

  tableRows.push(
    new TableRow({
      children: headers.map((h, i) =>
        createCell(h, i, AlignmentType.CENTER)
      ),
    })
  );

  for (const [category, items] of Object.entries(groupedItems)) {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 9,
            margins: CELL_PADDING,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: category,
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    for (const it of items) {
      srNo++;

      let imageCell;

      if (it.image) {
        try {
          const buffer = await getImageBuffer(it.image);
          imageCell = new TableCell({
            margins: CELL_PADDING,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new ImageRun({
                    data: buffer,
                    transformation: { width: 80, height: 60 },
                    type: "jpg",
                  }),
                ],
              }),
            ],
          });
        } catch {
          imageCell = createCell("-", 2);
        }
      } else {
        imageCell = createCell("-", 2);
      }

      tableRows.push(
        new TableRow({
          children: [
            createCell(srNo, 0),
            createCell(it.description, 1, AlignmentType.LEFT as any),
            imageCell,
            createCell(it.make || "-", 3),
            createCell(it.makeModel || "-", 4),
            createCell(it.qty, 5),
            createCell(it.unitRate, 6, AlignmentType.RIGHT as any),
            createCell(it.installation_amount, 7, AlignmentType.RIGHT as any ),
            createCell(
              it.unitRate * it.qty +
                it.installation_amount * it.qty,
              8,
              AlignmentType.RIGHT as any 
            ),
          ],
        })
      );
    }
  }

  const mainTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
    rows: tableRows,
  });

  // ================= TOTAL =================
  const rows: any = [
    [
      data.gstOnSupply ? `SUPPLY TOTAL + GST (${GST_RATE}%)` : "SUPPLY TOTAL",
      data.supplyTotal,
      (data.supplyTotal * (GST_RATE / 100)).toFixed(2),
    ],
    [
      data.gstOnInstallation
        ? `INSTALLATION TOTAL + GST (${GST_RATE}%)`
        : "INSTALLATION TOTAL",
      data.installationTotal,
      (data.installationTotal * (GST_RATE / 100)).toFixed(2),
    ],
  ];

  if (data?.freight_total) {
    rows.push(["FREIGHT TOTAL", data.freight_total]);
  }

  const grandTotal =
    data.supplyTotal +
    data.installationTotal +
    (data.gstOnSupply ? data.supplyTotal * (GST_RATE / 100) : 0) +
    (data.gstOnInstallation
      ? data.installationTotal * (GST_RATE / 100)
      : 0) +
    (data?.freight_total || 0);

  rows.push(["GRAND TOTAL", grandTotal]);

  const totalTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([label, value, gstvalue]: any) => {
      return new TableRow({
        children: [
          new TableCell({
            columnSpan: 7,
            margins: CELL_PADDING,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${label}:`,
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            columnSpan: 2,
            margins: CELL_PADDING,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: Number(value).toFixed(2),
                    bold: true,
                  }),
                ],
              }),
              ...(label.includes("GST") && gstvalue
                ? [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({
                          text: `+ GST (${gstvalue})`,
                        }),
                      ],
                    }),
                  ]
                : []),
            ],
          }),
        ],
      });
    }),
  });

  // ================= DOCUMENT =================
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            size: FONT_SIZE,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 200, right: 200, bottom: 200, left: 200 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Quotation No: ${random5Digit}`,
                bold: true,
                size: 24,
              }),
            ],
          }),
          headerTable,
          new Paragraph(""),          
          new Paragraph(`Customer: ${data.customerName || "-"}`),
          new Paragraph(`Mobile: ${data.mobileNo || "-"}`),
          new Paragraph(`Address: ${data.address || "-"}`),
          new Paragraph(""),
          mainTable,
          new Paragraph(""),
          totalTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${data.type}.docx`);
}