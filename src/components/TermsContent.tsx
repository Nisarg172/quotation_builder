export default function TermsContent() {
  return (
    <div className="text-sm text-gray-800 leading-relaxed space-y-4">
      {/* TITLE */}
      <h2 className="text-lg font-bold text-center">
        HM Technology - Quotation Terms & Conditions
      </h2>

      {/* INTRO */}
      <p>
        These Terms and Conditions govern the supply of products and services by
        HM Technology. By accepting our quotation, you agree to be bound by these
        terms.
      </p>

      {/* SECTION 1 */}
      <h3 className="font-semibold mt-4">
        1. PAYMENT OF SUPPLY & SERVICE
      </h3>

      <p className="font-medium">1. Payment Schedule:</p>

      <ul className="list-disc ml-6 space-y-1">
        <li>
          60% Advance: Payable upon issuance of the Proforma Invoice (P.I.).
        </li>
        <li>
          20% at Material Delivery: Payable upon delivery of materials to the site.
        </li>
        <li>
          20% after Installation: Payable within 2 days after completion.
        </li>
      </ul>

      <p>
        2. Payment Method: Demand Draft (DD) or Cheque in favour of HM TECHNOLOGY.
      </p>

      {/* BANK DETAILS */}
      <div className="border border-gray-400 rounded-md p-3 bg-gray-50">
        <p>Account No: 582001010050986</p>
        <p>Bank Name: Union Bank of India</p>
        <p>Branch: Nanpura</p>
        <p>RTGS / NEFT IFSC: UBIN0536415</p>
      </div>

      {/* SECTION 2 */}
      <h3 className="font-semibold mt-4">
        2. GOODS DELIVERY
      </h3>

      <p className="ml-4">
        <span className="font-semibold">1. Delivery Timeline:</span>{" "}
        Goods will be delivered within 3 to 25 days from the date of receipt of
        the Purchase Order (PO), or as per stock availability for specific items.
      </p>

      <p className="ml-4">
        <span className="font-semibold">2. Delivery Lot:</span>{" "}
        All goods shall be delivered in a single lot.
      </p>

      {/* SECTION 3 */}
      <h3 className="font-semibold mt-4">
        3. STANDARD WARRANTY OF PRODUCTS
      </h3>

      <p className="ml-4">
        <span className="font-semibold">1. Warranty Coverage:</span>{" "}
        Automation Products are warranted against all manufacturing defects,
        including full replacement or parts, for a period of 12 Months from the
        date of delivery.
      </p>

      <p className="ml-4">
        <span className="font-semibold">2. Warranty Exclusions:</span>{" "}
        The warranty does not cover products that are fully or partially burnt,
        tampered with, or damaged due to: High voltage, Water seepage, Abuse or
        improper use, Negligent care, Damage caused by fire, earthquake, flood, or
        other natural disasters. HM Technology's technical engineer/s' judgment and
        assessment regarding warranty claims will be final and binding on the
        buyer.
      </p>

      {/* SECTION 4 */}
      <h3 className="font-semibold mt-4">
        4. SCOPE OF BUYER
      </h3>

      <p className="ml-4">
        <span className="font-semibold">1. Power Supply:</span>{" "}
        Providing stabilized/UPS power with proper distribution and termination,
        including necessary switching and protection.
      </p>

      <p className="ml-4">
        <span className="font-semibold">2. Site Modifications:</span>{" "}
        Undertaking any required site modifications, civil works, or electrical
        work that may be identified during the execution phase.
      </p>

      <p className="ml-4">
        <span className="font-semibold">3. Internal Fittings:</span>{" "}
        Providing internal cement sheets, ACP sheet material and fittings,
        furniture, and any inside/outside wooden work, if required.
      </p>

      <p className="ml-4">
        <span className="font-semibold">4. Additional Materials:</span>{" "}
        Any materials required at the time of installation, other than those
        explicitly included in the submitted rates, will be charged extra.
      </p>

      {/* SECTION 5 */}
      <h3 className="font-semibold mt-4">
        5. JURISDICTION
      </h3>

      <p>
        In the event of any dispute arising from or in connection with this
        quotation or the services/products provided, the matter shall be referred
        to the court at <span className="font-semibold">Surat</span>. The decision
        of the said court shall be final and binding on all parties involved.
      </p>

      {/* CONTACT */}
      <h3 className="font-semibold mt-4">Contact Us</h3>
      <p>Email: servicehmtechnology@gmail.com</p>
      <p>Technical Support: +91 99041 22243</p>
    </div>
  );
}
