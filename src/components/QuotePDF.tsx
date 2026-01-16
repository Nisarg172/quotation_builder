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

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  companyBlock: { width: "55%" },
  companyName: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  contactSmall: { fontSize: 10 },
  rightBlock: { width: "45%", textAlign: "right" },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: BORDER,
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

  colSr: { width: "5%" },
  colDesc: { width: "18%" },
  colImg: { width: "10%", alignItems: "center" },
  colMakeModel: { width: "18%" },
  colQty: { width: "6%" },
  colSupply: { width: "18%" },
  colInstall: { width: "15%" },
  colTotal: { width: "10%" },

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

  termsWrap: { marginTop: 10 },
  termsTitle: { fontWeight: "bold", color: "red" },
  term: { fontSize: 8, marginTop: 2 },

  // Terms Page Styles
  tcTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  tcSubTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
  },
  tcText: {
    fontSize: 9,
    marginBottom: 4,
  },
  tcBullet: {
    fontSize: 9,
    marginLeft: 10,
    marginBottom: 3,
  },
  tcBankBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
    marginTop: 6,
  },
});

// static info
const infoData = {
  companyName: "Hm Technology",
  logo: "/logo.png",
  contactName: "Hardik Thummar",
  contactNo: " +91 7990532661",
  email: "sales@hmtechnology.in",
  address:
    "408, Anupam Square, Nr. Althan Chowkdi, Vip Road, Althan, Surat - 395017",
  terms: [
    "Cabling as per planning with materials.",
    "Civil / Electrical work if required is extra.",
    "Transportation will be charged extra.",
  ],
};

const random5Digit: number = Math.floor(10000 + Math.random() * 90000);

export default function QuotePDF({ data }: { data: QuoteData }) {
  const groupedItems = data.items.reduce<Record<string, QuoteItem[]>>(
    (acc, item) => {
      if (!acc[item.catagoryName]) acc[item.catagoryName] = [];
      acc[item.catagoryName].push(item);
      return acc;
    },
    {}
  );

  const supplyTotal = data.items.reduce(
    (sum, it) => sum + it.unitRate * it.qty,
    0
  );

  const installationTotal = data.items.reduce(
    (sum, it) => sum + it.totalInstallation,
    0
  );

  const grandTotal = supplyTotal + installationTotal;

  return (
    <Document>
      {/* ================= PAGE 1 : QUOTATION ================= */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.companyBlock}>
            {infoData.logo && (
              <Image src={infoData.logo} style={{ width: 46, height: 46 }} />
            )}
            <Text style={styles.companyName}>{infoData.companyName}</Text>
            <Text style={styles.contactSmall}>
              Contact: {infoData.contactName}
            </Text>
            <Text style={styles.contactSmall}>Phone: {infoData.contactNo}</Text>
            <Text style={styles.contactSmall}>Email: {infoData.email}</Text>
            <Text style={styles.contactSmall}>Address: {infoData.address}</Text>
          </View>

          <View style={styles.rightBlock}>
            <Text style={styles.bold}>
              Reference / Quote No: {random5Digit}
            </Text>
            <Text>Customer: {data.customerName || "-"}</Text>
            <Text>Mobile: {data.mobileNo || "-"}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={{ ...styles.row, backgroundColor: "#e5e7eb" }}>
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

            <View style={[styles.cell, styles.colMakeModel, styles.groupCell]}>
              <Text style={styles.groupTop}>MAKE / MODEL</Text>
              <View style={styles.groupBottom}>
                <Text style={[styles.half, styles.halfWithDivider]}>MAKE</Text>
                <Text style={styles.half}>MODEL NO.</Text>
              </View>
            </View>

            <Text
              style={[styles.cell, styles.colQty, styles.bold, styles.center]}
            >
              Qty
            </Text>

            <View style={[styles.cell, styles.colSupply, styles.groupCell]}>
              <Text style={styles.groupTop}>SUPPLY</Text>
              <View style={styles.groupBottom}>
                <Text style={[styles.half, styles.halfWithDivider]}>
                  UNIT RATE
                </Text>
                <Text style={styles.half}>AMOUNT - I</Text>
              </View>
            </View>

            <View style={[styles.cell, styles.colInstall, styles.groupCell]}>
              <Text style={styles.groupTop}>INSTALLATION</Text>
              <View style={styles.groupBottom}>
                <Text style={[styles.half, styles.halfWithDivider]}>
                  UNIT RATE
                </Text>
                <Text style={styles.half}>AMOUNT - II</Text>
              </View>
            </View>

            <Text
              style={[styles.cell, styles.colTotal, styles.bold, styles.center]}
            >
              TOTAL
            </Text>
          </View>

          {/* Body */}
          {Object.entries(groupedItems).map(([category, items]) => (
            <View key={category}>
              <View style={styles.categoryRow}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>

              {items.map((it) => {
                const supply = it.unitRate * it.qty;
                const total = supply + it.totalInstallation;

                return (
                  <View key={it.sn} style={styles.row}>
                    <Text style={[styles.cell, styles.colSr, styles.center]}>
                      {it.sn}
                    </Text>
                    <Text style={[styles.cell, styles.colDesc]}>
                      {it.description}
                    </Text>

                    <View style={[styles.cell, styles.colImg]}>
                      {it.image && (
                        <Image
                          src={it.image}
                          style={{
                            width: "100%",
                            height: "auto",
                            paddingLeft: "1px",
                            paddingRight: "1px",
                          }}
                        />
                      )}
                    </View>

                    <View
                      style={[
                        styles.cell,
                        styles.colMakeModel,
                        { flexDirection: "row", padding: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          { width: "50%", padding: 4 },
                          styles.center,
                          styles.halfWithDivider,
                        ]}
                      >
                        {it.make || "-"}
                      </Text>
                      <Text
                        style={[{ width: "50%", padding: 4 }, styles.center]}
                      >
                        {it.makeModel || "-"}
                      </Text>
                    </View>

                    <Text style={[styles.cell, styles.colQty, styles.center]}>
                      {it.qty}
                    </Text>

                    <View
                      style={[
                        styles.cell,
                        styles.colSupply,
                        { flexDirection: "row", padding: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          { width: "50%", padding: 4 },
                          styles.right,
                          styles.halfWithDivider,
                        ]}
                      >
                        {it.unitRate.toFixed(2)}
                      </Text>
                      <Text
                        style={[{ width: "50%", padding: 4 }, styles.right]}
                      >
                        {supply.toFixed(2)}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.cell,
                        styles.colInstall,
                        { flexDirection: "row", padding: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          { width: "50%", padding: 4 },
                          styles.right,
                          styles.halfWithDivider,
                        ]}
                      >
                        {it.installation_amount_1.toFixed(2)}
                      </Text>
                      <Text
                        style={[{ width: "50%", padding: 4 }, styles.right]}
                      >
                        {it.totalInstallation.toFixed(2)}
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

          {/* Totals */}
          <View style={styles.row}>
            <Text
              style={[
                styles.cell,
                { width: "90%", textAlign: "right", fontWeight: "bold" },
              ]}
            >
              SUPPLY TOTAL:
            </Text>
            <Text
              style={[
                styles.cell,
                { width: "10%", textAlign: "right", fontWeight: "bold" },
              ]}
            >
              {supplyTotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text
              style={[
                styles.cell,
                { width: "90%", textAlign: "right", fontWeight: "bold" },
              ]}
            >
              INSTALLATION TOTAL:
            </Text>
            <Text
              style={[
                styles.cell,
                { width: "10%", textAlign: "right", fontWeight: "bold" },
              ]}
            >
              {installationTotal.toFixed(2)}
            </Text>
          </View>

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
              {grandTotal.toFixed(2)}
            </Text>
          </View>
        </View>
      </Page>

      {/* ================= PAGE 2 : TERMS & CONDITIONS ================= */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.tcTitle}>
          HM Technology - Quotation Terms & Conditions
        </Text>

        <Text style={styles.tcText}>
          These Terms and Conditions govern the supply of products and services
          by HM Technology. By accepting our quotation, you agree to be bound by
          these terms.
        </Text>

        <Text style={styles.tcSubTitle}>1. PAYMENT OF SUPPLY & SERVICE</Text>

        <Text style={styles.tcText}>1. Payment Schedule:</Text>
        <Text style={styles.tcBullet}>
          • 60% Advance: Payable upon issuance of the Proforma Invoice (P.I.).
        </Text>
        <Text style={styles.tcBullet}>
          • 20% at Material Delivery: Payable upon delivery of materials to the
          site.
        </Text>
        <Text style={styles.tcBullet}>
          • 20% after Installation: Payable within 2 days after completion.
        </Text>

        <Text style={styles.tcText}>
          2. Payment Method: Demand Draft (DD) or Cheque in favour of HM
          TECHNOLOGY.
        </Text>

        <View style={styles.tcBankBox}>
          <Text style={styles.tcText}>Account No: 582001010050986</Text>
          <Text style={styles.tcText}>Bank Name: Union Bank of India</Text>
          <Text style={styles.tcText}>Branch: Nanpura</Text>
          <Text style={styles.tcText}>RTGS / NEFT IFSC: UBIN0536415</Text>
        </View>

        <Text style={styles.tcSubTitle}>2. GOODS DELIVERY</Text>
        <Text style={styles.tcBullet}>
          <Text style={{ fontWeight: "bold" }}> 1. Delivery Timeline: </Text>{" "}
          Goods will be delivered within 3 to 25 days from the date of receipt
          of the Purchase Order (PO), or as per stock availability for specific
          items.
        </Text>
        <Text style={styles.tcBullet}>
          <Text style={{ fontWeight: "bold" }}> 2. Delivery Lot: </Text> All
          goods shall be delivered in a single lot.
        </Text>

        <Text style={styles.tcSubTitle}>3. STANDARD WARRANTY OF PRODUCTS</Text>
        <Text style={styles.tcBullet}>
          <Text style={{ fontWeight: "bold" }}>1. Warranty Coverage: </Text>{" "}
          Automation Products are warranted against all manufacturing defects,
          including full replacement or parts, for a period of 12 Months from
          the date of delivery.
        </Text>
        <Text style={styles.tcBullet}>
          <Text style={{ fontWeight: "bold" }}>2. Warranty Exclusions: </Text>
          The warranty does not cover products that are fully or partially
          burnt, tampered with, or damaged due to: High voltage, Water seepage,
          Abuse or improper use, Negligent care, Damage caused by fire,
          earthquake, flood, or other natural disasters. HM Technology's
          technical engineer/s'judgment and assessment regarding warranty claims
          will be final and binding on the buyer.
        </Text>

        <Text style={styles.tcSubTitle}>4. SCOPE OF BUYER</Text>
        <Text style={styles.tcBullet}>
          <Text style={{ fontWeight: "bold" }}>1. Power Supply: </Text>
          Providing stabilized/UPS power with proper distribution and
          termination, including necessary switching and protection.
        </Text>
        <Text style={styles.tcBullet}>
          <Text style={{ fontWeight: "bold" }}>2. Site Modifications: </Text>
          Undertaking any required site modifications, civil works, or
          electrical work that may be identified during the execution phase.
        </Text>

        <Text style={styles.tcBullet}>
          <Text style={{ fontWeight: "bold" }}>3. Internal Fittings: </Text>
          Providing internal cement sheets, ACP sheet material and fittings,
          furniture, and any inside/outside wooden work, if required
        </Text>

        <Text style={styles.tcBullet}>
          <Text style={{ fontWeight: "bold" }}>4. Additional Materials: </Text>
          Any materials required at the time of installation, other than those
          explicitly included in the submitted rates, will be charged extra.
        </Text>

        <Text style={styles.tcSubTitle}>5. JURISDICTION</Text>
        <Text style={styles.tcText}>
          In the event of any dispute arising from or in connection with this
          quotation or the services/products provided, the matter shall be
          referred to the court at <Text>Surat</Text>. The decision of the said court shall
          be final and binding on all parties involved.
        </Text>

        <Text style={styles.tcSubTitle}>Contact Us</Text>
        <Text style={styles.tcText}>Email: servicehmtechnology@gmail.com</Text>
        <Text style={styles.tcText}>Technical Support: +91 99041 22243</Text>
      </Page>
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

// const BORDER = "#000";

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
//   rightBlock: { width: "45%", textAlign: "right" },

//   table: {
//     width: "100%",
//     borderWidth: 1,
//     borderColor: BORDER,
//     flexDirection: "column",
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

//   termsWrap: { marginTop: 10 },
//   termsTitle: { fontWeight: "bold", color: "red" },
//   term: { fontSize: 8, marginTop: 2 },
// });

// // static info
// const infoData = {
//   companyName: "Hm Technology",
//   logo: "/logo.png",
//   contactName: "Hardik Thummar",
//   contactNo: " +91 7990532661",
//   email: "sales@hmtechnology.in",
//   address:
//     "408, Anupam Square, Nr. Althan Chowkdi, Vip Road, Althan, Surat - 395017",
//   terms: [
//     "Cabling as per planning with materials.",
//     "Civil / Electrical work if required is extra.",
//     "Transportation will be charged extra.",
//   ],
// };

// const random5Digit: number = Math.floor(10000 + Math.random() * 90000);

// export default function QuotePDF({ data }: { data: QuoteData }) {
//   // group by category
//   const groupedItems = data.items.reduce<Record<string, QuoteItem[]>>(
//     (acc, item) => {
//       if (!acc[item.catagoryName]) acc[item.catagoryName] = [];
//       acc[item.catagoryName].push(item);
//       return acc;
//     },
//     {}
//   );

//   // totals
//   const supplyTotal = data.items.reduce(
//     (sum, it) => sum + it.unitRate * it.qty,
//     0
//   );

//   const installationTotal = data.items.reduce(
//     (sum, it) => sum + it.totalInstallation,
//     0
//   );

//   const grandTotal = supplyTotal + installationTotal;

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         {/* Header */}
//         <View style={styles.headerRow}>
//           <View style={styles.companyBlock}>
//             {infoData.logo && (
//               <Image src={infoData.logo} style={{ width: 46, height: 46 }} />
//             )}
//             <Text style={styles.companyName}>{infoData.companyName}</Text>
//             <Text style={styles.contactSmall}>
//               Contact: {infoData.contactName}
//             </Text>
//             <Text style={styles.contactSmall}>
//               Phone: {infoData.contactNo}
//             </Text>
//             <Text style={styles.contactSmall}>
//               Email: {infoData.email}
//             </Text>
//             <Text style={styles.contactSmall}>
//               Address: {infoData.address}
//             </Text>
//           </View>

//           <View style={styles.rightBlock}>
//             <Text style={styles.bold}>Reference / Quote No: {random5Digit}</Text>
//             <Text>Customer: {data.customerName || "-"}</Text>
//             <Text>Mobile: {data.mobileNo || "-"}</Text>
//           </View>
//         </View>

//         {/* Table */}
//         <View style={styles.table}>
//           {/* Table Header */}
//           <View style={{ ...styles.row, backgroundColor: "#e5e7eb" }}>
//             <Text style={[styles.cell, styles.colSr, styles.bold, styles.center]}>
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
//                 <Text style={styles.half}>MODEL NO.</Text>
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
//                 <Text style={[styles.half, styles.halfWithDivider]}>
//                   UNIT RATE
//                 </Text>
//                 <Text style={styles.half}>AMOUNT - I</Text>
//               </View>
//             </View>

//             <View style={[styles.cell, styles.colInstall, styles.groupCell]}>
//               <Text style={styles.groupTop}>INSTALLATION</Text>
//               <View style={styles.groupBottom}>
//                 <Text style={[styles.half, styles.halfWithDivider]}>
//                   UNIT RATE
//                 </Text>
//                 <Text style={styles.half}>AMOUNT - II</Text>
//               </View>
//             </View>

//             <Text
//               style={[styles.cell, styles.colTotal, styles.bold, styles.center]}
//             >
//               TOTAL
//             </Text>
//           </View>

//           {/* Body */}
//           {Object.entries(groupedItems).map(([category, items]) => (
//             <View key={category}>
//               <View style={styles.categoryRow}>
//                 <Text style={styles.categoryText}>{category}</Text>
//               </View>

//               {items.map((it) => {
//                 const supply = it.unitRate * it.qty;
//                 const total = supply + it.totalInstallation;

//                 return (
//                   <View key={it.sn} style={styles.row}>
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
//                           style={{ width: "100%", height: "auto", paddingLeft:"1px", paddingRight:"1px" }}
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
//                       <Text style={[{ width: "50%", padding: 4 }, styles.right]}>
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
//                         {it.installation_amount_1.toFixed(2)}
//                       </Text>
//                       <Text style={[{ width: "50%", padding: 4 }, styles.right]}>
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

//           {/* Totals */}
//           <View style={styles.row}>
//             <Text
//               style={[
//                 styles.cell,
//                 { width: "90%", textAlign: "right", fontWeight: "bold" },
//               ]}
//             >
//               SUPPLY TOTAL:
//             </Text>
//             <Text
//               style={[
//                 styles.cell,
//                 { width: "10%", textAlign: "right", fontWeight: "bold" },
//               ]}
//             >
//               {supplyTotal.toFixed(2)}
//             </Text>
//           </View>

//           <View style={styles.row}>
//             <Text
//               style={[
//                 styles.cell,
//                 { width: "90%", textAlign: "right", fontWeight: "bold" },
//               ]}
//             >
//               INSTALLATION TOTAL:
//             </Text>
//             <Text
//               style={[
//                 styles.cell,
//                 { width: "10%", textAlign: "right", fontWeight: "bold" },
//               ]}
//             >
//               {installationTotal.toFixed(2)}
//             </Text>
//           </View>

//           <View style={styles.row}>
//             <Text
//               style={[
//                 styles.cell,
//                 { width: "90%", textAlign: "right", fontWeight: "bold" },
//               ]}
//             >
//               GRAND TOTAL:
//             </Text>
//             <Text
//               style={[
//                 styles.cell,
//                 { width: "10%", textAlign: "right", fontWeight: "bold" },
//               ]}
//             >
//               {grandTotal.toFixed(2)}
//             </Text>
//           </View>
//         </View>

//         {/* Terms */}
//         <View style={styles.termsWrap}>
//           <Text style={styles.termsTitle}>Terms & Conditions:</Text>
//           {infoData.terms.map((t, i) => (
//             <Text key={i} style={styles.term}>
//               {i + 1}. {t}
//             </Text>
//           ))}
//         </View>
//       </Page>
//     </Document>
//   );
// }
