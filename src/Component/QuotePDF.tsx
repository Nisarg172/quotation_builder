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

const BORDER = "#000";

const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    padding: 16,
    fontFamily: "Helvetica",
    lineHeight: 1.35,
    color: "#111827",
  },

  // ===== Header info =====
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  companyBlock: { width: "55%" },
  companyName: { fontSize: 14, fontWeight: "bold", marginTop: 2, marginBottom: 4 },
  contactSmall: { fontSize: 10, lineHeight: 1.2 },
  rightBlock: { width: "45%", textAlign: "right" },

  // ===== Table base =====
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: "solid",
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  cell: {
    borderRightWidth: 1,
    borderColor: BORDER,
    padding: 4,
    justifyContent: "center",
  },

  // widths
  colSr: { width: "5%" },
  colDesc: { width: "18%" },
  colImg: { width: "10%", alignItems: "center" },
  colMakeModel: { width: "18%" },
  colQty: { width: "6%" },
  colSupply: { width: "18%" },
  colInstall: { width: "15%" },
  colTotal: { width: "10%" },

  // grouped headers
  groupCell: { padding: 0 },
  groupTop: {
    padding: 3,
    textAlign: "center",
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  groupBottom: { flexDirection: "row" },
  half: {
    width: "50%",
    padding: 3,
    textAlign: "center",
    fontWeight: "bold",
  },
  halfWithDivider: {
    borderRightWidth: 1,
    borderColor: BORDER,
  },

  // category row
  categoryRow: {
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderColor: BORDER,
    padding: 4,
  },
  categoryText: { fontWeight: "bold", fontSize: 10 },

  // text helpers
  bold: { fontWeight: "bold" },
  center: { textAlign: "center" },
  right: { textAlign: "right" },

  // terms
  termsWrap: { marginTop: 10 },
  termsTitle: { fontWeight: "bold", marginBottom: 2, color: "red" },
  term: { fontSize: 8, marginTop: 2 },
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
        <View style={styles.headerRow}>
          <View style={styles.companyBlock}>
            {infoData.logo ? (
              <Image src={infoData.logo} style={{ width: 46, height: 46 }} />
            ) : null}
            <Text style={styles.companyName}>{infoData.companyName}</Text>
            <Text style={styles.contactSmall}>Contact: {infoData.contactName}</Text>
            <Text style={styles.contactSmall}>Phone: {infoData.contactNo}</Text>
            <Text style={styles.contactSmall}>Email: {infoData.email}</Text>
            <Text style={styles.contactSmall}>Address: {infoData.address}</Text>
          </View>
          <View style={styles.rightBlock}>
            <Text style={styles.bold}>Reference / Quote No: {"1"}</Text>
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
        <View style={styles.termsWrap}>
          <Text style={styles.termsTitle}>Terms & Conditions:</Text>
          {infoData.terms.map((t, i) => (
            <Text key={i} style={styles.term}>
              {i + 1}. {t}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}
