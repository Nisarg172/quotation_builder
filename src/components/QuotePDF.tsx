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
import { TermsAndConditions } from "./TermsAndConditions";
import { CoumpanyInfo } from "@/utils/const";
import Html from "react-pdf-html";

const BORDER = "#000";
const GST_RATE = 18;

const isHTML = (str: string) => {
  if (!str) return false;
  return /<\/?[a-z][\s\S]*>/i.test(str);
};

const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    padding: 16,
    fontFamily: "Helvetica",
    lineHeight: 1.3,
    color: "#111827",
  },

  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },

  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  companyHeaderBlock: {
    width: 100,
  },

  companyName: {
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 4,
    textTransform: "uppercase",
  },

  quotationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  companyBlock: { width: "55%", lineHeight: 1.1 },

  contactSmall: { fontSize: 10 },

  rightBlock: {
    width: "40%",
    textAlign: "right",
    gap: 2,
    lineHeight: 1.1,
  },

  table: {
    width: "100%",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
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
    padding: 4,
  },

  colSr: { width: "3%" },
  colDesc: { width: "38%" },

  colImg: {
    width: "8%",
    alignItems: "center",
    justifyContent: "center",
  },

  colMake: { width: "11%" },
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

  categoryText: {
    fontWeight: "bold",
    fontSize: 10,
  },

  bold: { fontWeight: "bold" },
  center: { textAlign: "center" },
});

export default function QuotePDF({ data }: { data: QuoteData }) {
  const random5Digit = Math.floor(10000 + Math.random() * 90000);
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

  const supplyTotalGST = (data.supplyTotal * (GST_RATE / 100)).toFixed(2);
  const installationTotalGST = (
    data.installationTotal *
    (GST_RATE / 100)
  ).toFixed(2);

  const grandTotal = (
    data.supplyTotal +
    data.installationTotal +
    (data.gstOnSupply ? parseFloat(supplyTotalGST) : 0) +
    (data.gstOnInstallation ? parseFloat(installationTotalGST) : 0)
  ).toFixed(2);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}

        <View style={styles.headerTopRow}>
          <View style={styles.companyHeaderBlock}>
            {infoData.logo && (
              <Image src={infoData.logo} style={{ width: 75, height: 65 }} />
            )}
            <Text style={styles.companyName}>{infoData.companyName}</Text>
          </View>

          <Text style={styles.quotationTitle}>{data.type}</Text>
        </View>

        <View style={{ borderBottom: 1, marginBottom: 10 }} />

        {/* DETAILS */}

        <View style={styles.detailsRow}>
          <View style={styles.companyBlock}>
            {infoData?.GST && (
              <Text style={styles.contactSmall}>
                <Text style={styles.bold}>GST:</Text> {infoData.GST}
              </Text>
            )}

            <Text style={styles.contactSmall}>
              <Text style={styles.bold}>Contact:</Text> {infoData.contactName}
            </Text>

            <Text style={styles.contactSmall}>
              <Text style={styles.bold}>Phone:</Text> {infoData.contactNo}
            </Text>

            <Text style={styles.contactSmall}>
              <Text style={styles.bold}>Email:</Text> {infoData.email}
            </Text>

            <Text style={styles.contactSmall}>
              <Text style={styles.bold}>Address:</Text> {infoData.address}
            </Text>
          </View>

          <View style={styles.rightBlock}>
            <Text style={styles.bold}>
              {data.type} No: {random5Digit}
            </Text>

            <Text style={styles.bold}>
              Customer:{" "}
              <Text style={{ fontWeight: "normal" }}>
                {data.customerName || "-"}
              </Text>
            </Text>

            <Text style={styles.bold}>
              Mobile:{" "}
              <Text style={{ fontWeight: "normal" }}>
                {data.mobileNo || "-"}
              </Text>
            </Text>

            <Text style={styles.bold}>
              Address:{" "}
              <Text style={{ fontWeight: "normal" }}>
                {data.address || "-"}
              </Text>
            </Text>
          </View>
        </View>

        {/* TABLE */}

        <View style={styles.table}>
          {Object.entries(groupedItems).map(([category, items]) => (
            <View key={category}>
              <View style={styles.categoryRow}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>

              {items.map((it) => {
                srNo++;

                return (
                  <View key={srNo} style={styles.row} wrap>
                    <Text style={[styles.cell, styles.colSr, styles.center]}>
                      {srNo}
                    </Text>

                    <View style={[styles.cell, styles.colDesc]}>
                      {isHTML(it.description) ? (
                        <Html
                          stylesheet={{
                            p: { margin: 0, marginBottom: 3, fontSize: 9 },
                            strong: { fontWeight: "bold" },
                            b: { fontWeight: "bold" },
                            ul: { paddingLeft: 10 },
                            ol: { paddingLeft: 10 },
                            li: { marginBottom: 2 },
                          }}
                        >
                          {it.description}
                        </Html>
                      ) : (
                        <Text>{it.description || "-"}</Text>
                      )}
                    </View>

                    {/* IMAGE */}

                    <View style={[styles.cell, styles.colImg]}>
                      {it.image && (
                        <Image
                          src={it.image}
                          style={{ width: 40, height: 40 }}
                        />
                      )}
                    </View>

                    <Text style={[styles.cell, styles.colMake, styles.center]}>
                      {it.make || "-"}
                    </Text>

                    <Text style={[styles.cell, styles.colModel, styles.center]}>
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
                      {it.installation_amount.toFixed(2)}
                    </Text>

                    <Text
                      style={[
                        styles.cell,
                        styles.colTotal,
                        styles.center,
                        { borderRightWidth: 0 },
                      ]}
                    >
                      {(
                        it.unitRate * it.qty +
                        it.installation_amount * it.qty
                      ).toFixed(2)}
                    </Text>
                  </View>
                );
              })}
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
// // src/components/QuotePDF.tsx
// import {
//   Document,
//   Page,
//   View,
//   Text,
//   Image,
//   StyleSheet,
// } from "@react-pdf/renderer";
// import type { QuoteData, QuoteItem } from "../Types/type";
// import { TermsAndConditions } from "./TermsAndConditions";

// const BORDER = "#000";
// const GST_RATE = 18;

// const styles = StyleSheet.create({
//   page: {
//     fontSize: 9,
//     padding: 16,
//     fontFamily: "Helvetica",
//     lineHeight: 1.35,
//     color: "#111827",
//   },

//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   companyBlock: { width: "55%" },
//   companyName: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
//   contactSmall: { fontSize: 10 },
//   rightBlock: { width: "25%", textAlign: "left" },

//   table: {
//     width: "100%",
//     borderWidth: 1,
//     borderColor: BORDER,
//   },
//   row: {
//     flexDirection: "row",
//     borderBottomWidth: 1,
//     borderColor: BORDER,
//   },
//   cell: {
//     borderRightWidth: 1,
//     borderColor: BORDER,
//     padding: 4,
//     justifyContent: "center",
//   },

//   colSr: { width: "5%" },
//   colDesc: { width: "18%" },
//   colImg: { width: "10%", alignItems: "center" },
//   colMakeModel: { width: "18%" },
//   colQty: { width: "6%" },
//   colSupply: { width: "18%" },
//   colInstall: { width: "15%" },
//   colTotal: { width: "10%" },

//   groupCell: { padding: 0 },
//   groupTop: {
//     padding: 3,
//     textAlign: "center",
//     fontWeight: "bold",
//     borderBottomWidth: 1,
//     borderColor: BORDER,
//   },
//   groupBottom: { flexDirection: "row" },
//   half: {
//     width: "50%",
//     padding: 3,
//     textAlign: "center",
//     fontWeight: "bold",
//   },
//   halfWithDivider: {
//     borderRightWidth: 1,
//     borderColor: BORDER,
//   },

//   categoryRow: {
//     backgroundColor: "#f3f4f6",
//     borderBottomWidth: 1,
//     borderColor: BORDER,
//     padding: 4,
//   },
//   categoryText: { fontWeight: "bold", fontSize: 10 },

//   bold: { fontWeight: "bold" },
//   center: { textAlign: "center" },
//   right: { textAlign: "right" },
// });

// const coumpanyInfo = [{
//   id:1,
//   companyName: "Hm Technology",
//   logo: "/HM_Technology.png",
//   contactName: "Hardik Thummar",
//   contactNo: "+91 7990532661",
//   email: "sales@hmtechnology.in",
//   GST:"24BATPT0263Q1ZW",
//   address:
//     "408, Anupam Square, Nr. Althan Chowkdi, Vip Road, Althan, Surat - 395017",
// },
// {
//   id:2,
//   companyName: "Torque Innovations India",
//   logo: "/Torque_innovations_logo.png",
//   contactName: "yogeshkumar Vinubhai Nasit",
//   contactNo: "+91 8000220901",
//   email: "sales@hmtechnology.in",
//   GST:"24AWSPN6994N2ZA",
//   address:
//     "Shop No. 30, Abhinandan Residency, Sarthana Road, Jakatnaka, Surat, Gujarat 395006",
// }
// ]

// const random5Digit = Math.floor(10000 + Math.random() * 90000);

// export default function QuotePDF({ data }: { data: QuoteData }) {

//   // static info
// const infoData = coumpanyInfo.find(({id})=>id==data.coumpanyId)||coumpanyInfo[0]
//   const groupedItems = data.items.reduce<Record<string, QuoteItem[]>>(
//     (acc, item) => {
//       if (!acc[item.catagoryName]) acc[item.catagoryName] = [];
//       acc[item.catagoryName].push(item);
//       return acc;
//     },
//     {},
//   );

//   const supplyTotalGST = (data.supplyTotal * (GST_RATE / 100)).toFixed(2);
//   const installationTotalGST = (
//     data.installationTotal *
//     (GST_RATE / 100)
//   ).toFixed(2);

//   const grandTotal = (
//     data.supplyTotal +
//     data.installationTotal +
//    (data.gstOnSupply? parseFloat(supplyTotalGST):0) +
//     (data.gstOnInstallation? parseFloat(installationTotalGST):0)
//   ).toFixed(2);

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         {/* HEADER */}
//         <Text
//           style={{
//             ...styles.bold,
//             textAlign: "center",
//             fontSize: 12,
//             marginBottom: 8,
//           }}
//         >
//           {data.isPurchesOrder ? "PURCHASE ORDER" : "QUOTATION"}
//         </Text>
//         <View style={styles.headerRow}>
//           <View style={{ ...styles.companyBlock, marginTop: "-20px" }}>
//             {infoData.logo && (
//               <Image src={infoData.logo} style={{ width: 46, height: 46 }} />
//             )}
//             <Text style={styles.companyName}>{infoData.companyName}</Text>
//              <Text style={styles.contactSmall}>
//               GST: {infoData.GST}
//             </Text>
//             <Text style={styles.contactSmall}>
//               Contact: {infoData.contactName}
//             </Text>
//             <Text style={styles.contactSmall}>Phone: {infoData.contactNo}</Text>
//             <Text style={styles.contactSmall}>Email: {infoData.email}</Text>
//             <Text style={styles.contactSmall}>Address: {infoData.address}</Text>
//           </View>

//           <View style={styles.rightBlock}>
//             <Text
//               style={{
//                 ...styles.bold,
//                 textAlign: "right",
//                 marginTop: "-20px",
//                 marginBottom: 10,
//               }}
//             >
//               {data.isPurchesOrder ? "Order No:" : "Quote No:"} {random5Digit}
//             </Text>
//             {((data.gstOnSupply||data.gstOnInstallation)&&data.gstNumber)&&<Text>GST: {data.gstNumber}</Text>}
//             <Text>Customer: {data.customerName || "-"}</Text>
//             <Text>Mobile: {data.mobileNo || "-"}</Text>
//             <Text>Address: {data.address || "-"}</Text>
//           </View>
//         </View>

//         {/* TABLE */}
//         <View style={styles.table}>
//           {/* TABLE HEADER */}
//           <View
//             style={[styles.row, { backgroundColor: "#e5e7eb" }]}
//             wrap={false}
//           >
//             <Text
//               style={[styles.cell, styles.colSr, styles.bold, styles.center]}
//             >
//               Sr.
//             </Text>
//             <Text
//               style={[styles.cell, styles.colDesc, styles.bold, styles.center]}
//             >
//               Item Description
//             </Text>
//             <Text
//               style={[styles.cell, styles.colImg, styles.bold, styles.center]}
//             >
//               Image
//             </Text>

//             <View style={[styles.cell, styles.colMakeModel, styles.groupCell]}>
//               <Text style={styles.groupTop}>MAKE / MODEL</Text>
//               <View style={styles.groupBottom}>
//                 <Text style={[styles.half, styles.halfWithDivider]}>MAKE</Text>
//                 <Text style={styles.half}>MODEL</Text>
//               </View>
//             </View>

//             <Text
//               style={[styles.cell, styles.colQty, styles.bold, styles.center]}
//             >
//               Qty
//             </Text>

//             <View style={[styles.cell, styles.colSupply, styles.groupCell]}>
//               <Text style={styles.groupTop}>SUPPLY</Text>
//               <View style={styles.groupBottom}>
//                 <Text style={[styles.half, styles.halfWithDivider]}>RATE</Text>
//                 <Text style={styles.half}>AMOUNT</Text>
//               </View>
//             </View>

//             <View style={[styles.cell, styles.colInstall, styles.groupCell]}>
//               <Text style={styles.groupTop}>INSTALL</Text>
//               <View style={styles.groupBottom}>
//                 <Text style={[styles.half, styles.halfWithDivider]}>RATE</Text>
//                 <Text style={styles.half}>AMOUNT</Text>
//               </View>
//             </View>

//             <Text
//               style={[styles.cell, styles.colTotal, styles.bold, styles.center]}
//             >
//               TOTAL
//             </Text>
//           </View>

//           {/* BODY */}
//           {Object.entries(groupedItems).map(([category, items]) => (
//             <View key={category}>
//               {/* CATEGORY ROW */}
//               <View style={styles.categoryRow} wrap={false}>
//                 <Text style={styles.categoryText}>{category}</Text>
//               </View>

//               {items.map((it) => {
//                 const supply = it.unitRate * it.qty;
//                 const total = supply + it.totalInstallation;

//                 return (
//                   <View key={it.sn} style={styles.row} wrap={false}>
//                     <Text style={[styles.cell, styles.colSr, styles.center]}>
//                       {it.sn}
//                     </Text>
//                     <Text style={[styles.cell, styles.colDesc]}>
//                       {it.description}
//                     </Text>

//                     <View style={[styles.cell, styles.colImg]}>
//                       {it.image && (
//                         <Image
//                           src={it.image}
//                           style={{ width: "100%", height: "auto" }}
//                         />
//                       )}
//                     </View>

//                     <View
//                       style={[
//                         styles.cell,
//                         styles.colMakeModel,
//                         { flexDirection: "row", padding: 0 },
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           { width: "50%", padding: 4 },
//                           styles.center,
//                           styles.halfWithDivider,
//                         ]}
//                       >
//                         {it.make || "-"}
//                       </Text>
//                       <Text
//                         style={[{ width: "50%", padding: 4 }, styles.center]}
//                       >
//                         {it.makeModel || "-"}
//                       </Text>
//                     </View>

//                     <Text style={[styles.cell, styles.colQty, styles.center]}>
//                       {it.qty}
//                     </Text>

//                     <View
//                       style={[
//                         styles.cell,
//                         styles.colSupply,
//                         { flexDirection: "row", padding: 0 },
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           { width: "50%", padding: 4 },
//                           styles.right,
//                           styles.halfWithDivider,
//                         ]}
//                       >
//                         {it.unitRate.toFixed(2)}
//                       </Text>
//                       <Text
//                         style={[{ width: "50%", padding: 4 }, styles.right]}
//                       >
//                         {supply.toFixed(2)}
//                       </Text>
//                     </View>

//                     <View
//                       style={[
//                         styles.cell,
//                         styles.colInstall,
//                         { flexDirection: "row", padding: 0 },
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           { width: "50%", padding: 4 },
//                           styles.right,
//                           styles.halfWithDivider,
//                         ]}
//                       >
//                         {it.installation_amount.toFixed(2)}
//                       </Text>
//                       <Text
//                         style={[{ width: "50%", padding: 4 }, styles.right]}
//                       >
//                         {it.totalInstallation.toFixed(2)}
//                       </Text>
//                     </View>

//                     <Text style={[styles.cell, styles.colTotal, styles.right]}>
//                       {total.toFixed(2)}
//                     </Text>
//                   </View>
//                 );
//               })}
//             </View>
//           ))}
//         </View>

//         <View style={{ height: "20px" }} wrap={false}></View>
//         {/* TOTALS (never split) */}
//         <View
//           style={{
//             borderWidth: 1,
//             borderColor: "#000",
//           }}
//         >
//           {[
//             [
//               data.gstOnSupply
//                 ? `SUPPLY TOTAL + GST (${GST_RATE}%)`
//                 : "SUPPLY TOTAL",
//               data.supplyTotal,
//               supplyTotalGST,
//             ],
//             [
//               data.gstOnInstallation
//                 ? `INSTALLATION TOTAL + GST (${GST_RATE}%)`
//                 : "INSTALLATION TOTAL",
//               data.installationTotal,
//               installationTotalGST,
//             ],
//             ["GRAND TOTAL", grandTotal],
//           ].map(([label, value, gstvalue]: any) => (
//             <View key={label} style={styles.row} wrap={false}>
//               <Text
//                 style={[
//                   styles.cell,
//                   { width: "90%", textAlign: "right", fontWeight: "bold" },
//                 ]}
//               >
//                 {label}:
//               </Text>

//               <Text
//                 style={[
//                   // styles.cell,
//                   {
//                     width: "20%",
//                     textAlign: "right",
//                     fontWeight: "bold",
//                     padding: 4,
//                     justifyContent: "center",
//                   },
//                 ]}
//               >
//                 {Number(value).toFixed(2)}
//                 {label.includes("GST") && `\n+ GST (${gstvalue})`}
//               </Text>
//             </View>
//           ))}
//         </View>
//       </Page>

//       {/* TERMS PAGE */}
//       {!data.isPurchesOrder && <TermsAndConditions />}
//     </Document>
//   );
// }
