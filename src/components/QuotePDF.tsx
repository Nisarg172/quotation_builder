import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { QuoteData, QuoteItem } from "../Types/type";
import { TermsAndConditions } from "./TermsAndConditions";
import { CoumpanyInfo } from "@/utils/const";
import { Font } from "@react-pdf/renderer";


Font.register({
  family: "Calibri",
  fonts: [
    {
      src: "/fonts/calibri.ttf",
    },
    {
      src: "/fonts/calibri-bold.ttf",
      fontWeight: "bold",
    },
  ],
});
Font.registerHyphenationCallback(word => [word]);
const BORDER = "#000";
const GST_RATE = 18;

const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    padding: 16,
    fontFamily: "Helvetica",
    lineHeight: 1.35,
    color: "#111827",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  companyBlock: { width: "55%" },
  companyName: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  contactSmall: { fontSize: 10 },
  rightBlock: { width: "30%", textAlign: "left" },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: BORDER,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  cell: {
    borderRightWidth: 1,
    borderColor: BORDER,
    padding: 3,
    justifyContent: "center",
    wordBreak: "break-all"
  },

  /* UPDATED COLUMN WIDTHS */
  colSr: { width: "3%" },
  colDesc: { width: "37%" },
  colImg: { width: "10%", alignItems: "center" },
  colMake: { width: "10%" },
  colModel: { width: "10%" },
  colQty: { width: "4%" },
  colSupply: { width: "8%" },
  colInstall: { width: "8%" },
  colTotal: { width: "10%" },

  categoryRow: {
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderColor: BORDER,
    padding: 4,
  },
  categoryText: { fontWeight: "bold", fontSize: 10 },

  bold: { fontWeight: "bold" },
  center: { textAlign: "center" },
  right: { textAlign: "right" },
});

export default function QuotePDF({ data }: { data: QuoteData }) {
  let srNo = 0;
  const infoData =
    CoumpanyInfo.find(({ id }) => id == data.coumpanyId) || CoumpanyInfo[0];

  const groupedItems = data.items.reduce<Record<string, QuoteItem[]>>(
    (acc, item) => {
      if (!acc[item.catagoryName]) acc[item.catagoryName] = [];
      acc[item.catagoryName].push(item);
      return acc;
    },
    {},
  );

  const supplyTotalGST = Math.round(data.supplyTotal * GST_RATE / 100);
  const installationTotalGST = Math.round(
    data.installationTotal *
    (GST_RATE / 100)
  )

  const grandTotal = Math.round(
    data.supplyTotal +
    data.installationTotal +
    (data.gstOnSupply ? supplyTotalGST : 0) +
    (data.gstOnInstallation ? installationTotalGST : 0) +
    (data?.freight_total || 0)
  );

  const rows: any = [
    [
      data.gstOnSupply ? `SUPPLY TOTAL + GST (${GST_RATE}%)` : "SUPPLY TOTAL",
      data.supplyTotal,
      supplyTotalGST,
    ],
    [
      data.gstOnInstallation
        ? `INSTALLATION TOTAL + GST (${GST_RATE}%)`
        : "INSTALLATION TOTAL",
      data.installationTotal,
      installationTotalGST,
    ],
  ];

  // Add Freight row only if available
  if (data?.freight_total) {
    rows.push(["FREIGHT TOTAL", data.freight_total]);
  }

  
  rows.push(["GRAND TOTAL", grandTotal ]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER TITLE */}
        <Text
          style={{
            ...styles.bold,
            textAlign: "center",
            fontSize: 12,
            marginBottom: 8,
          }}
        >
          {data.type}
        </Text>

        {/* HEADER INFO */}
        <View style={styles.headerRow}>
          <View style={{ ...styles.companyBlock, marginTop: "-20px" }}>
            {infoData.logo && (
              <Image src={infoData.logo} style={{ width: 100 }} />
            )}
            <Text style={styles.companyName}>{infoData.companyName}</Text>
            {infoData?.GST && (
              <Text style={styles.contactSmall}>GST: {infoData.GST}</Text>
            )}
            <Text style={styles.contactSmall}>
              Contact: {infoData.contactName}
            </Text>
            <Text style={styles.contactSmall}>Phone: {infoData.contactNo}</Text>
            <Text style={styles.contactSmall}>Email: {infoData.email}</Text>
            <Text style={styles.contactSmall}>Address: {infoData.address}</Text>
          </View>

          <View style={styles.rightBlock}>
            <Text
              style={{
                ...styles.bold,
                textAlign: "right",
                marginTop: "-20px",
                marginBottom: 10,
              }}
            >
              {data.type} {"No: "} {data.id.split("-").at(0)}
            </Text>

            {(data.gstOnSupply || data.gstOnInstallation) && data.gstNumber && (
              <Text>GST: {data.gstNumber}</Text>
            )}

            <Text>Customer: {data.customerName || "-"}</Text>
            <Text>Mobile: {data.mobileNo || "-"}</Text>
            <Text>Address: {data?.address || "-"}</Text>
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.table}>
          {/* SINGLE LINE HEADER */}
          <View
            style={[styles.row, { backgroundColor: "#e5e7eb" }]}
            wrap={false}
          >
            <Text
              style={[styles.cell, styles.colSr, styles.bold, styles.center]}
            >
              Sr.
            </Text>
            <Text
              style={[styles.cell, styles.colDesc, styles.bold, styles.center]}
            >
              Item Description
            </Text>
            <Text
              style={[styles.cell, styles.colImg, styles.bold, styles.center]}
            >
              Image
            </Text>
            <Text
              style={[styles.cell, styles.colMake, styles.bold, styles.center]}
            >
              Make
            </Text>

            <Text
              style={[styles.cell, styles.colModel, styles.bold, styles.center]}
            >
              Model
            </Text>
            <Text
              style={[styles.cell, styles.colQty, styles.bold, styles.center]}
            >
              Qty
            </Text>
            <Text
              style={[
                styles.cell,
                styles.colSupply,
                styles.bold,
                styles.center,
              ]}
            >
              Supply Amount
            </Text>
            <Text
              style={[
                styles.cell,
                styles.colInstall,
                styles.bold,
                styles.center,
              ]}
            >
              Installation Amount
            </Text>
            <Text
              style={[styles.cell, styles.colTotal, styles.bold, styles.center,{borderRightWidth:0}]}
            >
              Total Amount
            </Text>
          </View>

          {/* BODY */}
          {Object.entries(groupedItems).map(([category, items]) => (
            <View key={category}>
              <View style={styles.categoryRow} wrap={false}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>

              {items.map((it,i) => {
                srNo++;
                return (
                  <View key={srNo} style={{...styles.row,borderBottomWidth:items.length==i+1?0:1}} wrap={false}>
                    <Text style={[styles.cell, styles.colSr, styles.center]}>
                      {srNo}
                    </Text>

                    <Text style={[styles.cell, styles.colDesc]}>
                      {it.description}
                    </Text>

                    <View style={[styles.cell, styles.colImg]}>
                      {it.image && (
                        <Image
                          src={it.image}
                          style={{ width: "100%", height: "auto" }}
                        />
                      )}
                    </View>

                    <Text style={[styles.cell, styles.colMake, styles.center]}>
                      {it.make || "-"}
                    </Text>

                    <Text
                      style={[
                        styles.cell,
                        styles.colModel,
                        styles.center,
                        { flexShrink: 1, flex: 1, flexWrap: "wrap" },
                      ]}
                    >
                      {it.makeModel || "-"}
                    </Text>

                    <Text style={[styles.cell, styles.colQty, styles.center]}>
                      {it.qty}
                    </Text>

                    <Text
                      style={[styles.cell, styles.colSupply, styles.center]}
                    >
                      {it.unitRate}
                    </Text>

                    <Text
                      style={[styles.cell, styles.colInstall, styles.center]}
                    >
                      {Math.round(it.installation_amount)}
                    </Text>

                    <Text style={[styles.cell, styles.colTotal, styles.center,{borderRightWidth:0}]}>
                      {Math.round(
                        it.unitRate * it.qty +
                        it.installation_amount * it.qty
                      )}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />

        {/* TOTALS */}
        <View style={{ borderWidth: 1, borderColor: BORDER }}>
          {rows.map(([label, value, gstvalue]: any,i:number) => (
            <View key={label} style={{...styles.row,borderBottomWidth:rows.length==i+1?0:1 }} wrap={false}>
              <Text
                style={[
                  styles.cell,
                  { width: "90%", textAlign: "right", fontWeight: "bold" },
                ]}
              >
                {label}:
              </Text>

              <Text
                style={{
                  width: "20%",
                  textAlign: "right",
                  fontWeight: "bold",
                  padding: 4,
                }}
              >
                {Math.round(Number(value))}
                {label.includes("GST") && `\n+ GST (${gstvalue})`}
              </Text>
            </View>
          ))}
        </View>
      </Page>

      {data.type !== "Purchase Order" && (
        <TermsAndConditions infoData={infoData} type={data.type} />
      )}
    </Document>
  );
}
