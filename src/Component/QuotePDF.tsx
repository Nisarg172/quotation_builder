// src/components/QuotePDF.tsx
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { QuoteData, QuoteItem } from "../Types/type";

// Professional color scheme
const COLORS = {
  primary: "#1e40af",      // Blue
  secondary: "#64748b",    // Slate
  accent: "#f8fafc",       // Light gray
  border: "#e2e8f0",      // Light border
  text: {
    primary: "#0f172a",     // Dark slate
    secondary: "#475569",   // Medium slate
    muted: "#64748b",       // Light slate
  },
  background: {
    header: "#f1f5f9",      // Very light blue
    category: "#e0f2fe",    // Light blue
    total: "#fef3c7",       // Light yellow
  }
};

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    padding: 24,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
    color: COLORS.text.primary,
    backgroundColor: "#ffffff",
  },

  // ===== Header Section =====
  headerContainer: {
    backgroundColor: COLORS.background.header,
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  headerRowMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  companyBlock: { 
    width: "60%",
    paddingRight: 20,
  },
  companyName: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: COLORS.primary,
    marginBottom: 8,
  },
  companySubtitle: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginBottom: 12,
    fontStyle: "italic",
  },
  contactInfo: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 6,
  },
  contactRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.text.secondary,
    width: 50,
  },
  contactValue: {
    fontSize: 9,
    color: COLORS.text.primary,
    flex: 1,
  },
  rightBlock: { 
    width: "38%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 6,
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  quoteInfo: {
    marginBottom: 8,
  },
  quoteLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.text.secondary,
  },
  quoteValue: {
    fontSize: 11,
    color: COLORS.text.primary,
    marginTop: 2,
  },

  // ===== Table Styling =====
  tableContainer: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  table: {
    width: "100%",
    flexDirection: "column",
    border: `2px solid ${COLORS.border}`,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    minHeight: 35,
  },
  rowEven: {
    backgroundColor: COLORS.accent,
  },
  cell: {
    borderRightWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCell: {
    backgroundColor: COLORS.primary,
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "center",
  },

  // Column widths
  colSr: { width: "6%" },
  colDesc: { width: "20%" },
  colImg: { width: "8%" },
  colMakeModel: { width: "18%" },
  colQty: { width: "6%" },
  colSupply: { width: "16%" },
  colInstall: { width: "16%" },
  colTotal: { width: "10%" },

  // Grouped headers
  groupCell: { 
    padding: 0,
    backgroundColor: COLORS.primary,
  },
  groupTop: {
    padding: 6,
    textAlign: "center",
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    color: "#ffffff",
    fontSize: 8,
  },
  groupBottom: { 
    flexDirection: "row",
  },
  half: {
    width: "50%",
    padding: 4,
    textAlign: "center",
    fontWeight: "bold",
    color: "#ffffff",
    fontSize: 7,
  },
  halfWithDivider: {
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  // Category styling
  categoryRow: {
    backgroundColor: COLORS.background.category,
    borderBottomWidth: 2,
    borderColor: COLORS.primary,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 16,
    height: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryText: { 
    fontWeight: "bold", 
    fontSize: 12,
    color: COLORS.primary,
  },

  // Text utilities
  bold: { fontWeight: "bold" },
  center: { textAlign: "center" },
  right: { textAlign: "right" },
  left: { textAlign: "left" },

  // Product image
  productImage: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  noImage: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.accent,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 6,
    color: COLORS.text.muted,
  },

  // Total section
  totalSection: {
    marginTop: 16,
    backgroundColor: COLORS.background.total,
    padding: 16,
    borderRadius: 8,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  grandTotalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },

  // Terms section
  termsContainer: {
    marginTop: 20,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  termItem: {
    fontSize: 9,
    marginBottom: 6,
    color: COLORS.text.primary,
    lineHeight: 1.4,
  },
  termNumber: {
    fontWeight: "bold",
    color: COLORS.primary,
  },
});

// Static company info
const infoData = {
  companyName: "Hm Technology",
  logo: "/logo.png",
  contactName: "Hardik Thummar",
  contactNo: "9876543210",
  address:
    "408, ANUPAM SQUARE, NR. ALTHAN CHOWKDI, VIP ROAD, ALTHAN, SURAT - 395017",
  email: "hm.technology@hotmail.com",
  terms: [
    "Cabling as per planning with materials (for all devices, interfacing etc.)",
    "Required Site Modification, Civil works, Electrical if any may realize at the time of execution, Furniture work if any.",
    "Color work of gate as per your choice.",
    "Transportation of all product will be extra as per actual from Surat.",
  ],
};


export default function QuotePDF({ data }: { data: QuoteData }) {
  console.log('========>',data)
  // ✅ group items by category
  const groupedItems = data.items.reduce<Record<string, QuoteItem[]>>(
    (acc, item) => {
      if (!acc[item.catagoryName]) acc[item.catagoryName] = [];
      acc[item.catagoryName].push(item);
      return acc;
    },
    {}
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ===== Company / Quote Info ===== */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRowMain}>
            <View style={styles.companyBlock}>
              {infoData.logo ? (
                <Image src={infoData.logo} style={{ width: 60, height: 60 }} />
              ) : (
                <View style={{ width: 60, height: 60, backgroundColor: COLORS.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>HM</Text>
                </View>
              )}
              
              <Text style={styles.companyName}>{infoData.companyName}</Text>
              <Text style={styles.companySubtitle}>Professional Technology Solutions</Text>
              
              <View style={styles.contactInfo}>
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Contact:</Text>
                  <Text style={styles.contactValue}>{infoData.contactName}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Phone:</Text>
                  <Text style={styles.contactValue}>{infoData.contactNo}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Email:</Text>
                  <Text style={styles.contactValue}>{infoData.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Address:</Text>
                  <Text style={styles.contactValue}>{infoData.address}</Text>
                </View>
              </View>
            </View>

            <View style={styles.rightBlock}>
              <Text style={styles.quoteTitle}>QUOTATION</Text>
              
              <View style={styles.quoteInfo}>
                <Text style={styles.quoteLabel}>Quote Number:</Text>
                <Text style={styles.quoteValue}>QT-2024-{String(Date.now()).slice(-6)}</Text>
              </View>
              
              <View style={styles.quoteInfo}>
                <Text style={styles.quoteLabel}>Date:</Text>
                <Text style={styles.quoteValue}>{new Date().toLocaleDateString('en-IN')}</Text>
              </View>
              
              <View style={styles.quoteInfo}>
                <Text style={styles.quoteLabel}>Customer:</Text>
                <Text style={styles.quoteValue}>{data.customerName || "N/A"}</Text>
              </View>
              
              <View style={styles.quoteInfo}>
                <Text style={styles.quoteLabel}>Mobile:</Text>
                <Text style={styles.quoteValue}>{data.mobileNo || "N/A"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ===== Table ===== */}
        <View style={styles.table}>
          {/* Header */}
          <View style={{ ...styles.row, backgroundColor: "lightgray" }}>
            <Text style={[styles.cell, styles.colSr, styles.center, styles.bold]}>Sr.</Text>
            <Text style={[styles.cell, styles.colDesc, styles.center, styles.bold]}>Item Description</Text>
            <Text style={[styles.cell, styles.colImg, styles.center, styles.bold]}>Image</Text>

            {/* MAKE / MODEL */}
            <View style={[styles.cell, styles.colMakeModel, styles.groupCell]}>
              <Text style={styles.groupTop}>MAKE / MODEL</Text>
              <View style={styles.groupBottom}>
                <Text style={[styles.half, styles.halfWithDivider]}>MAKE</Text>
                <Text style={styles.half}>MODEL NO.</Text>
              </View>
            </View>

            <Text style={[styles.cell, styles.colQty, styles.center, styles.bold]}>Qty</Text>

            {/* SUPPLY */}
            <View style={[styles.cell, styles.colSupply, styles.groupCell]}>
              <Text style={styles.groupTop}>SUPPLY</Text>
              <View style={styles.groupBottom}>
                <Text style={[styles.half, styles.halfWithDivider]}>UNIT RATE</Text>
                <Text style={styles.half}>AMOUNT - I</Text>
              </View>
            </View>

            {/* INSTALLATION */}
            <View style={[styles.cell, styles.colInstall, styles.groupCell]}>
              <Text style={styles.groupTop}>INSTALLATION</Text>
              <View style={styles.groupBottom}>
                <Text style={[styles.half, styles.halfWithDivider]}>AMOUNT - II</Text>
                <Text style={styles.half}>AMOUNT - III</Text>
              </View>
            </View>

            <Text style={[styles.cell, styles.colTotal, styles.center, styles.bold]}>
              TOTAL (I+II+III)
            </Text>
          </View>

          {/* Body rows grouped by category */}
          {Object.entries(groupedItems).map(([category, items]) => (
            <View key={category}>
              {/* Category Row */}
              <View style={styles.categoryRow}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>

              {items.map((it) => {
                const supply = it.unitRate * it.qty;
                const total = supply + it.installation_amount_1 + it.installation_amount_2;
                return (
                  <View key={it.sn} style={styles.row}>
                    <Text style={[styles.cell, styles.colSr, styles.center]}>{it.sn}</Text>
                    <Text style={[styles.cell, styles.colDesc]}>{it.description}</Text>
                    <View style={[styles.cell, styles.colImg]}>
                      {it.image ? <Image src={it.image} style={{ width: 28, height: 28 }} /> : null}
                    </View>

                    {/* MAKE + MODEL */}
                    <View style={[styles.cell, styles.colMakeModel, { flexDirection: "row", padding: 0 }]}>
                      <Text style={[{ width: "50%", padding: 4 }, styles.center, styles.halfWithDivider]}>
                        {it.make || "-"}
                      </Text>
                      <Text style={[{ width: "50%", padding: 4 }, styles.center]}>
                        {it.makeModel || "-"}
                      </Text>
                    </View>

                    <Text style={[styles.cell, styles.colQty, styles.center]}>{String(it.qty)}</Text>

                    {/* SUPPLY */}
                    <View style={[styles.cell, styles.colSupply, { flexDirection: "row", padding: 0 }]}>
                      <Text style={[{ width: "50%", padding: 4 }, styles.right, styles.halfWithDivider]}>
                        {it.unitRate.toFixed(2)}
                      </Text>
                      <Text style={[{ width: "50%", padding: 4 }, styles.right]}>
                        {supply.toFixed(2)}
                      </Text>
                    </View>

                    {/* INSTALLATION */}
                    <View style={[styles.cell, styles.colInstall, { flexDirection: "row", padding: 0 }]}>
                      <Text style={[{ width: "50%", padding: 4 }, styles.right, styles.halfWithDivider]}>
                        {it.installation_amount_1.toFixed(2)}
                      </Text>
                      <Text style={[{ width: "50%", padding: 4 }, styles.right]}>
                        {it.installation_amount_2.toFixed(2)}
                      </Text>
                    </View>

                    <Text style={[styles.cell, styles.colTotal, styles.right]}>
                      {total.toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}

          {/* Grand total */}
          <View style={styles.row}>
            <Text
              style={[
                styles.cell,
                { width: "90%", textAlign: "right", fontWeight: "bold" },
              ]}
            >
              GRAND TOTAL:
            </Text>
            <Text
              style={[
                styles.cell,
                { width: "10%", textAlign: "right", fontWeight: "bold" },
              ]}
            >
              {data.grandTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          {infoData.terms.map((t, i) => (
            <Text key={i} style={styles.termItem}>
              <Text style={styles.termNumber}>{i + 1}.</Text> {t}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}
