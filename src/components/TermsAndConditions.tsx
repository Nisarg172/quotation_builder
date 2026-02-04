import type { Database } from "@/Types/supabase";
import {
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";

interface Props {
  infoData: {
    id: number;
    companyName: string;
    logo: string;
    contactName: string;
    contactNo: string;
    email: string;
    GST?: string;
    address: string;
    serviceEmail:string
    serviceMo:string
    accountNo:string,
    bankName:string,
    branch:string,
    IFSC:string
},type:Database["public"]["Enums"]["bill_type"]
}

export const TermsAndConditions = ({infoData,type}:Props) => {

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
  return (
     <Page size="A4" style={styles.page}>
            <Text style={styles.tcTitle}>
              {infoData.companyName} - {type} Terms & Conditions
            </Text>
    
            <Text style={styles.tcText}>
              These Terms and Conditions govern the supply of products and services
              by {infoData.companyName}. By accepting our {type}, you agree to be bound by
              these terms.
            </Text>
    
            <Text style={styles.tcSubTitle}>1. PAYMENT OF SUPPLY & SERVICE</Text>
    
            <Text style={styles.tcText}>1. Payment Schedule:</Text>
            <Text style={styles.tcBullet}>
              • 80% Advance: Payable upon issuance of the Proforma Invoice (P.I.).
            </Text>
            <Text style={styles.tcBullet}>
              • 20% after Installation: Payable within 2 days after completion.
            </Text>
    
            <Text style={styles.tcText}>
              2. Payment Method: Demand Draft (DD) or Cheque in favour of {infoData.companyName}.
            </Text>
    
            <View style={styles.tcBankBox}>
              <Text style={styles.tcText}>Account No: {infoData.accountNo}</Text>
              <Text style={styles.tcText}>Bank Name: {infoData.bankName}</Text>
              <Text style={styles.tcText}>Branch: {infoData.branch}</Text>
              <Text style={styles.tcText}>RTGS / NEFT IFSC: {infoData.IFSC}</Text>
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
              earthquake, flood, or other natural disasters. {infoData.companyName}'s
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
              {type} or the services/products provided, the matter shall be
              referred to the court at <Text>Surat</Text>. The decision of the said court shall
              be final and binding on all parties involved.
            </Text>
    
            <Text style={styles.tcSubTitle}>Contact Us</Text>
            <Text style={styles.tcText}>Email: {infoData.serviceEmail}</Text>
            <Text style={styles.tcText}>Technical Support: {infoData.serviceMo}</Text>
          </Page>
  )
}
