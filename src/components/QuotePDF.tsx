// src/components/QuotePDF.tsx
import React from "react";
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

const BORDER = "#000";
const GST_RATE = 18;

// ─────────────────────────────────────────────────────────────
// NO HYPHENATION — must be passed as a direct JSX prop, NOT in style
// ─────────────────────────────────────────────────────────────
const noHyphenation: any = (word: string): string[] => [word];

// ─────────────────────────────────────────────────────────────
// 1. HTML ENTITY DECODER
// ─────────────────────────────────────────────────────────────
const decodeEntities = (str: string): string =>
  str
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&hellip;/g, "…")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

// ─────────────────────────────────────────────────────────────
// 2. DETECT HTML
// ─────────────────────────────────────────────────────────────
const isHTML = (str: string): boolean => {
  if (!str) return false;
  return /<\/?[a-z][\s\S]*>/i.test(str);
};

// ─────────────────────────────────────────────────────────────
// 3. TOKENISER
// ─────────────────────────────────────────────────────────────
type Token =
  | { type: "open"; tag: string }
  | { type: "close"; tag: string }
  | { type: "self"; tag: string }
  | { type: "text"; value: string };

const tokenise = (html: string): Token[] => {
  const tokens: Token[] = [];
  const re = /<(\/?)([a-z][a-z0-9]*)(?:[^>]*?)(\/?)>|([^<]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m[4] !== undefined) {
      const txt = decodeEntities(m[4]);
      if (txt.trim()) tokens.push({ type: "text", value: txt });
    } else {
      const isClose = m[1] === "/";
      const tag = m[2].toLowerCase();
      const isSelf = m[3] === "/" || /^(br|hr|img|input|meta|link)$/.test(tag);
      if (isClose) {
        tokens.push({ type: "close", tag });
      } else if (isSelf) {
        tokens.push({ type: "self", tag });
      } else {
        tokens.push({ type: "open", tag });
      }
    }
  }
  return tokens;
};

// ─────────────────────────────────────────────────────────────
// 4. INLINE RENDERER
// ─────────────────────────────────────────────────────────────
interface InlineStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
}

const INLINE_TAGS = new Set([
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "span",
  "a",
  "code",
]);
const BLOCK_STOP_TAGS = new Set([
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "blockquote",
  "div",
  "td",
  "th",
]);

const renderInline = (
  tokens: Token[],
  startIdx: number,
  stopTag: string
): { parts: React.ReactNode[]; nextIdx: number } => {
  const parts: React.ReactNode[] = [];
  let i = startIdx;
  const styleStack: InlineStyle[] = [
    { bold: false, italic: false, underline: false, strike: false },
  ];

  const currentStyle = (): InlineStyle => styleStack[styleStack.length - 1];

  const textStyle = (): any => {
    const s = currentStyle();
    const result: Record<string, unknown> = { fontSize: 9 };
    if (s.bold) result.fontWeight = "bold";
    if (s.italic) result.fontStyle = "italic";
    if (s.underline) result.textDecoration = "underline";
    if (s.strike) result.textDecoration = "line-through";
    return result;
  };

  while (i < tokens.length) {
    const tok = tokens[i];

    if (tok.type === "close" && tok.tag === stopTag) {
      i++;
      break;
    }

    if (
      tok.type === "close" &&
      BLOCK_STOP_TAGS.has(tok.tag) &&
      tok.tag !== stopTag
    ) {
      break;
    }

    if (tok.type === "text") {
      // ✅ hyphenationCallback as direct prop, NOT in style
      parts.push(
        <Text
          key={`txt-${i}`}
          style={textStyle()}
          hyphenationCallback={noHyphenation}
        >
          {tok.value}
        </Text>
      );
      i++;
      continue;
    }

    if (tok.type === "self" && tok.tag === "br") {
      parts.push(
        <Text key={`br-${i}`} hyphenationCallback={noHyphenation}>
          {"\n"}
        </Text>
      );
      i++;
      continue;
    }

    if (tok.type === "open" && INLINE_TAGS.has(tok.tag)) {
      const prev = currentStyle();
      const next = { ...prev };
      if (tok.tag === "strong" || tok.tag === "b") next.bold = true;
      if (tok.tag === "em" || tok.tag === "i") next.italic = true;
      if (tok.tag === "u") next.underline = true;
      if (tok.tag === "s" || tok.tag === "strike") next.strike = true;
      styleStack.push(next);
      i++;
      continue;
    }

    if (tok.type === "close" && INLINE_TAGS.has(tok.tag)) {
      if (styleStack.length > 1) styleStack.pop();
      i++;
      continue;
    }

    i++;
  }

  return { parts, nextIdx: i };
};

// ─────────────────────────────────────────────────────────────
// 5. BLOCK RENDERER
// ─────────────────────────────────────────────────────────────
const PDF_FS = 9;

const headingFontSize = (tag: string): number => {
  const map: Record<string, number> = {
    h1: 11,
    h2: 10,
    h3: 9.5,
    h4: 9,
    h5: 9,
    h6: 9,
  };
  return map[tag] ?? PDF_FS;
};

const renderBlocks = (tokens: Token[]): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < tokens.length) {
    const tok = tokens[i];

    if (tok.type === "open") {
      const tag = tok.tag;

      // Headings h1–h6
      if (/^h[1-6]$/.test(tag)) {
        i++;
        const { parts, nextIdx } = renderInline(tokens, i, tag);
        nodes.push(
          // ✅ hyphenationCallback as direct prop
          <Text
            key={`${tag}-${i}`}
            style={{
              fontSize: headingFontSize(tag),
              fontWeight: "bold",
              marginBottom: 2,
            }}
            hyphenationCallback={noHyphenation}
          >
            {parts}
          </Text>
        );
        i = nextIdx;
        continue;
      }

      // Paragraph
      if (tag === "p") {
        i++;
        const { parts, nextIdx } = renderInline(tokens, i, "p");
        if (parts.length > 0) {
          nodes.push(
            // ✅ hyphenationCallback as direct prop
            <Text
              key={`p-${i}`}
              style={{ fontSize: PDF_FS, marginBottom: 2 }}
              hyphenationCallback={noHyphenation}
            >
              {parts}
            </Text>
          );
        }
        i = nextIdx;
        continue;
      }

      // Blockquote
      if (tag === "blockquote") {
        i++;
        const innerTokens: Token[] = [];
        let depth = 0;
        while (i < tokens.length) {
          const t = tokens[i];
          if (t.type === "open" && t.tag === "blockquote") depth++;
          if (t.type === "close" && t.tag === "blockquote") {
            if (depth === 0) {
              i++;
              break;
            }
            depth--;
          }
          innerTokens.push(t);
          i++;
        }
        nodes.push(
          <View
            key={`bq-${i}`}
            style={{
              borderLeftWidth: 2,
              borderLeftColor: "#9ca3af",
              paddingLeft: 5,
              marginBottom: 3,
            }}
          >
            {renderBlocks(innerTokens)}
          </View>
        );
        continue;
      }

      // Unordered list
      if (tag === "ul") {
        i++;
        const listItems: React.ReactNode[] = [];
        while (i < tokens.length) {
          const t = tokens[i];
          if (t.type === "close" && t.tag === "ul") {
            i++;
            break;
          }
          if (t.type === "open" && t.tag === "li") {
            i++;
            const liTokens: Token[] = [];
            let depth = 0;
            while (i < tokens.length) {
              const lt = tokens[i];
              if (lt.type === "open" && lt.tag === "li") depth++;
              if (lt.type === "close" && lt.tag === "li") {
                if (depth === 0) {
                  i++;
                  break;
                }
                depth--;
              }
              liTokens.push(lt);
              i++;
            }
            const hasNestedList = liTokens.some(
              (t) => t.type === "open" && (t.tag === "ul" || t.tag === "ol")
            );
            if (hasNestedList) {
              listItems.push(
                <View key={`li-${i}`} style={{ marginBottom: 1 }}>
                  <View style={{ flexDirection: "row" }}>
                    {/* ✅ hyphenationCallback as direct prop */}
                    <Text
                      style={{ fontSize: PDF_FS, marginRight: 4 }}
                      hyphenationCallback={noHyphenation}
                    >
                      •
                    </Text>
                    <View style={{ flex: 1 }}>{renderBlocks(liTokens)}</View>
                  </View>
                </View>
              );
            } else {
              const { parts } = renderInline(liTokens, 0, "");
              listItems.push(
                <View
                  key={`li-${i}`}
                  style={{ flexDirection: "row", marginBottom: 1 }}
                >
                  {/* ✅ hyphenationCallback as direct prop */}
                  <Text
                    style={{ fontSize: PDF_FS, marginRight: 4 }}
                    hyphenationCallback={noHyphenation}
                  >
                    •
                  </Text>
                  <Text
                    style={{ fontSize: PDF_FS, flex: 1 }}
                    hyphenationCallback={noHyphenation}
                  >
                    {parts}
                  </Text>
                </View>
              );
            }
          } else {
            i++;
          }
        }
        nodes.push(
          <View key={`ul-${i}`} style={{ paddingLeft: 5, marginBottom: 2 }}>
            {listItems}
          </View>
        );
        continue;
      }

      // Ordered list
      if (tag === "ol") {
        i++;
        const listItems: React.ReactNode[] = [];
        let counter = 1;
        while (i < tokens.length) {
          const t = tokens[i];
          if (t.type === "close" && t.tag === "ol") {
            i++;
            break;
          }
          if (t.type === "open" && t.tag === "li") {
            i++;
            const liTokens: Token[] = [];
            let depth = 0;
            while (i < tokens.length) {
              const lt = tokens[i];
              if (lt.type === "open" && lt.tag === "li") depth++;
              if (lt.type === "close" && lt.tag === "li") {
                if (depth === 0) {
                  i++;
                  break;
                }
                depth--;
              }
              liTokens.push(lt);
              i++;
            }
            const { parts } = renderInline(liTokens, 0, "");
            const num = counter++;
            listItems.push(
              <View
                key={`oli-${i}`}
                style={{ flexDirection: "row", marginBottom: 1 }}
              >
                {/* ✅ hyphenationCallback as direct prop */}
                <Text
                  style={{ fontSize: PDF_FS, marginRight: 4 }}
                  hyphenationCallback={noHyphenation}
                >
                  {num}.
                </Text>
                <Text
                  style={{ fontSize: PDF_FS, flex: 1 }}
                  hyphenationCallback={noHyphenation}
                >
                  {parts}
                </Text>
              </View>
            );
          } else {
            i++;
          }
        }
        nodes.push(
          <View key={`ol-${i}`} style={{ paddingLeft: 5, marginBottom: 2 }}>
            {listItems}
          </View>
        );
        continue;
      }

      // Table
      if (tag === "table") {
        i++;
        const rows: { cells: string[]; isHeader: boolean }[] = [];

        while (i < tokens.length) {
          const t = tokens[i];
          if (t.type === "close" && t.tag === "table") {
            i++;
            break;
          }

          if (t.type === "open" && t.tag === "tr") {
            i++;
            const cells: string[] = [];
            let isHeader = false;
            while (i < tokens.length) {
              const ct = tokens[i];
              if (ct.type === "close" && ct.tag === "tr") {
                i++;
                break;
              }
              if (ct.type === "open" && (ct.tag === "td" || ct.tag === "th")) {
                if (ct.tag === "th") isHeader = true;
                i++;
                const cellParts: string[] = [];
                let depth = 0;
                while (i < tokens.length) {
                  const xt = tokens[i];
                  if (
                    xt.type === "open" &&
                    (xt.tag === "td" || xt.tag === "th")
                  )
                    depth++;
                  if (
                    xt.type === "close" &&
                    (xt.tag === "td" || xt.tag === "th")
                  ) {
                    if (depth === 0) {
                      i++;
                      break;
                    }
                    depth--;
                  }
                  if (xt.type === "text") cellParts.push(xt.value);
                  i++;
                }
                cells.push(cellParts.join("").trim());
              } else {
                i++;
              }
            }
            if (cells.length) rows.push({ cells, isHeader });
          } else {
            i++;
          }
        }

        const colCount = Math.max(...rows.map((r) => r.cells.length), 1);
        nodes.push(
          <View
            key={`tbl-${i}`}
            style={{ borderWidth: 1, borderColor: "#000", marginBottom: 3 }}
          >
            {rows.map((row, ri) => (
              <View
                key={ri}
                style={{
                  flexDirection: "row",
                  borderBottomWidth: ri < rows.length - 1 ? 1 : 0,
                  borderColor: "#000",
                  backgroundColor: row.isHeader ? "#e5e7eb" : "transparent",
                }}
              >
                {row.cells.map((cell, ci) => (
                  // ✅ hyphenationCallback as direct prop
                  <Text
                    key={ci}
                    style={{
                      flex: 1,
                      fontSize: 8,
                      padding: 2,
                      fontWeight: row.isHeader ? "bold" : "normal",
                      borderRightWidth: ci < colCount - 1 ? 1 : 0,
                      borderColor: "#000",
                    }}
                    hyphenationCallback={noHyphenation}
                  >
                    {cell}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        );
        continue;
      }

      // HR
      if (tag === "hr") {
        nodes.push(
          <View
            key={`hr-${i}`}
            style={{
              borderBottomWidth: 0.5,
              borderColor: "#d1d5db",
              marginTop: 2,
              marginBottom: 2,
            }}
          />
        );
        i++;
        continue;
      }

      // Wrapper tags — skip and continue into children
      if (
        [
          "div",
          "section",
          "article",
          "header",
          "footer",
          "main",
          "nav",
          "aside",
          "thead",
          "tbody",
          "tfoot",
        ].includes(tag)
      ) {
        i++;
        continue;
      }

      i++;
      continue;
    }

    if (tok.type === "close") {
      i++;
      continue;
    }

    if (tok.type === "self") {
      if (tok.tag === "br") {
        nodes.push(
          <Text key={`br-${i}`} hyphenationCallback={noHyphenation}>
            {"\n"}
          </Text>
        );
      }
      if (tok.tag === "hr") {
        nodes.push(
          <View
            key={`hr-${i}`}
            style={{
              borderBottomWidth: 0.5,
              borderColor: "#d1d5db",
              marginVertical: 2,
            }}
          />
        );
      }
      i++;
      continue;
    }

    // Bare text at block level
    if (tok.type === "text") {
      const txt = tok.value.trim();
      if (txt) {
        nodes.push(
          // ✅ hyphenationCallback as direct prop
          <Text
            key={`bt-${i}`}
            style={{ fontSize: PDF_FS }}
            hyphenationCallback={noHyphenation}
          >
            {txt}
          </Text>
        );
      }
      i++;
      continue;
    }

    i++;
  }

  return nodes;
};

// ─────────────────────────────────────────────────────────────
// 6. MAIN ENTRY: renderTinyMCEContent
// ─────────────────────────────────────────────────────────────
const renderTinyMCEContent = (html: string): React.ReactNode => {
  if (!html)
    return (
      <Text style={{ fontSize: 9 }} hyphenationCallback={noHyphenation}>
        -
      </Text>
    );

  if (!isHTML(html)) {
    return (
      <Text style={{ fontSize: 9 }} hyphenationCallback={noHyphenation}>
        {decodeEntities(html)}
      </Text>
    );
  }

  const clean = html
    .replace(/\s+data-[a-z][a-z0-9-]*="[^"]*"/gi, "")
    .replace(/\s+class="[^"]*"/gi, "")
    .replace(/\s+tabindex="[^"]*"/gi, "")
    .replace(/\s+target="[^"]*"/gi, "")
    .replace(/\s+rel="[^"]*"/gi, "")
    .replace(/\s+href="[^"]*"/gi, "");

  const tokens = tokenise(clean);
  const blocks = renderBlocks(tokens);

  return <View>{blocks}</View>;
};

// ─────────────────────────────────────────────────────────────
// 7. STYLES
// ─────────────────────────────────────────────────────────────
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
  companyHeaderBlock: { width: 100 },
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
  colImg: { width: "8%", alignItems: "center", justifyContent: "center" },
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
  categoryText: { fontWeight: "bold", fontSize: 10 },
  bold: { fontWeight: "bold" },
  center: { textAlign: "center" },
});

// ─────────────────────────────────────────────────────────────
// 8. COMPONENT
// ─────────────────────────────────────────────────────────────
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
    {}
  );

  const supplyTotalGST = (data.supplyTotal * (GST_RATE / 100)).toFixed(0);
  const installationTotalGST = (
    data.installationTotal *
    (GST_RATE / 100)
  ).toFixed(0);

  const grandTotal = (
    data.supplyTotal +
    data.installationTotal +
    (data.gstOnSupply ? parseFloat(supplyTotalGST) : 0) +
    (data.gstOnInstallation ? parseFloat(installationTotalGST) : 0)
  ).toFixed(0);

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
      {/* ✅ hyphenationCallback on Page as well */}
      <Page size="A4" style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.headerTopRow}>
          <View style={styles.companyHeaderBlock}>
            {infoData.logo && (
              <Image src={infoData.logo} style={{ width: 75, height: 65 }} />
            )}
            <Text
              style={styles.companyName}
              hyphenationCallback={noHyphenation}
            >
              {infoData.companyName}
            </Text>
          </View>
          <Text
            style={styles.quotationTitle}
            hyphenationCallback={noHyphenation}
          >
            {data.type}
          </Text>
        </View>

        <View style={{ borderBottom: 1, marginBottom: 10 }} />

        {/* ── DETAILS ── */}
        <View style={styles.detailsRow}>
          <View style={styles.companyBlock}>
            {infoData?.GST && (
              <Text
                style={styles.contactSmall}
                hyphenationCallback={noHyphenation}
              >
                <Text style={styles.bold}>GST:</Text> {infoData.GST}
              </Text>
            )}
            <Text
              style={styles.contactSmall}
              hyphenationCallback={noHyphenation}
            >
              <Text style={styles.bold}>Contact:</Text> {infoData.contactName}
            </Text>
            <Text
              style={styles.contactSmall}
              hyphenationCallback={noHyphenation}
            >
              <Text style={styles.bold}>Phone:</Text> {infoData.contactNo}
            </Text>
            <Text
              style={styles.contactSmall}
              hyphenationCallback={noHyphenation}
            >
              <Text style={styles.bold}>Email:</Text> {infoData.email}
            </Text>
            <Text
              style={styles.contactSmall}
              hyphenationCallback={noHyphenation}
            >
              <Text style={styles.bold}>Address:</Text> {infoData.address}
            </Text>
          </View>

          <View style={styles.rightBlock}>
            <Text style={styles.bold} hyphenationCallback={noHyphenation}>
              {data.type} No: {random5Digit}
            </Text>
            <Text style={styles.bold} hyphenationCallback={noHyphenation}>
              Customer:{" "}
              <Text style={{ fontWeight: "normal" }}>
                {data.customerName || "-"}
              </Text>
            </Text>
            <Text style={styles.bold} hyphenationCallback={noHyphenation}>
              Mobile:{" "}
              <Text style={{ fontWeight: "normal" }}>
                {data.mobileNo || "-"}
              </Text>
            </Text>
            <Text style={styles.bold} hyphenationCallback={noHyphenation}>
              Address:{" "}
              <Text style={{ fontWeight: "normal" }}>
                {data.address || "-"}
              </Text>
            </Text>
          </View>
        </View>

        {/* ── TABLE ── */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.row}>
            <Text
              style={[styles.cell, styles.colSr, styles.bold, styles.center]}
              hyphenationCallback={noHyphenation}
            >
              #
            </Text>
            <Text
              style={[styles.cell, styles.colDesc, styles.bold]}
              hyphenationCallback={noHyphenation}
            >
              Description
            </Text>
            <Text
              style={[styles.cell, styles.colImg, styles.bold, styles.center]}
              hyphenationCallback={noHyphenation}
            >
              Img
            </Text>
            <Text
              style={[styles.cell, styles.colMake, styles.bold, styles.center]}
              hyphenationCallback={noHyphenation}
            >
              Make
            </Text>
            <Text
              style={[styles.cell, styles.colModel, styles.bold, styles.center]}
              hyphenationCallback={noHyphenation}
            >
              Model
            </Text>
            <Text
              style={[styles.cell, styles.colQty, styles.bold, styles.center]}
              hyphenationCallback={noHyphenation}
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
              hyphenationCallback={noHyphenation}
            >
              Unit Rate
            </Text>
            <Text
              style={[
                styles.cell,
                styles.colInstall,
                styles.bold,
                styles.center,
              ]}
              hyphenationCallback={noHyphenation}
            >
              Install
            </Text>
            <Text
              style={[
                styles.cell,
                styles.colTotal,
                styles.bold,
                styles.center,
                { borderRightWidth: 0 },
              ]}
              hyphenationCallback={noHyphenation}
            >
              Total
            </Text>
          </View>

          {/* Body */}
          {Object.entries(groupedItems).map(([category, items]) => (
            <View key={category}>
              <View style={styles.categoryRow}>
                <Text
                  style={styles.categoryText}
                  hyphenationCallback={noHyphenation}
                >
                  {category}
                </Text>
              </View>

              {items.map((it) => {
                srNo++;
                const rowTotal = (
                  it.unitRate * it.qty +
                  it.installation_amount * it.qty
                ).toFixed(0);

                return (
                  <View key={srNo} style={styles.row} wrap>
                    <Text
                      style={[styles.cell, styles.colSr, styles.center]}
                      hyphenationCallback={noHyphenation}
                    >
                      {srNo}
                    </Text>

                    {/* ── DESCRIPTION: TinyMCE renderer ── */}
                    <View style={[styles.cell, styles.colDesc]}>
                      {isHTML(it.description) ? (
                        renderTinyMCEContent(it.description)
                      ) : (
                        <Text
                          style={{ fontSize: 9 }}
                          hyphenationCallback={noHyphenation}
                        >
                          {it.description || "-"}
                        </Text>
                      )}
                    </View>

                    <View style={[styles.cell, styles.colImg]}>
                      {it.image && (
                        <Image
                          src={it.image}
                          style={{ width: 40, height: 40 }}
                        />
                      )}
                    </View>

                    <Text
                      style={[styles.cell, styles.colMake, styles.center]}
                      hyphenationCallback={noHyphenation}
                    >
                      {it.make || "-"}
                    </Text>
                    <Text
                      style={[styles.cell, styles.colModel, styles.center]}
                      hyphenationCallback={noHyphenation}
                    >
                      {it.makeModel || "-"}
                    </Text>
                    <Text
                      style={[styles.cell, styles.colQty, styles.center]}
                      hyphenationCallback={noHyphenation}
                    >
                      {it.qty}
                    </Text>
                    <Text
                      style={[styles.cell, styles.colSupply, styles.center]}
                      hyphenationCallback={noHyphenation}
                    >
                      {it.unitRate}
                    </Text>
                    <Text
                      style={[styles.cell, styles.colInstall, styles.center]}
                      hyphenationCallback={noHyphenation}
                    >
                      {it.installation_amount.toFixed(0)}
                    </Text>
                    <Text
                      style={[
                        styles.cell,
                        styles.colTotal,
                        styles.center,
                        { borderRightWidth: 0 },
                      ]}
                      hyphenationCallback={noHyphenation}
                    >
                      {rowTotal}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}

          {/* ── TOTALS ── */}
          <View
            style={[
              styles.row,
              { justifyContent: "flex-end", borderBottomWidth: 0 },
            ]}
          >
            <View
              style={{ width: "36%", borderLeftWidth: 1, borderColor: BORDER }}
            >
              <View style={styles.row}>
                <Text
                  style={[styles.cell, { flex: 1, fontWeight: "bold" }]}
                  hyphenationCallback={noHyphenation}
                >
                  Supply Total
                </Text>
                <Text
                  style={[
                    styles.cell,
                    { width: "40%", textAlign: "right", borderRightWidth: 0 },
                  ]}
                  hyphenationCallback={noHyphenation}
                >
                  {data.supplyTotal.toFixed(0)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text
                  style={[styles.cell, { flex: 1, fontWeight: "bold" }]}
                  hyphenationCallback={noHyphenation}
                >
                  Installation Total
                </Text>
                <Text
                  style={[
                    styles.cell,
                    { width: "40%", textAlign: "right", borderRightWidth: 0 },
                  ]}
                  hyphenationCallback={noHyphenation}
                >
                  {data.installationTotal.toFixed(0)}
                </Text>
              </View>

              {data.gstOnSupply && (
                <View style={styles.row}>
                  <Text
                    style={[styles.cell, { flex: 1, fontWeight: "bold" }]}
                    hyphenationCallback={noHyphenation}
                  >
                    GST {GST_RATE}% (Supply)
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      { width: "40%", textAlign: "right", borderRightWidth: 0 },
                    ]}
                    hyphenationCallback={noHyphenation}
                  >
                    {supplyTotalGST}
                  </Text>
                </View>
              )}

              {data.gstOnInstallation && (
                <View style={styles.row}>
                  <Text
                    style={[styles.cell, { flex: 1, fontWeight: "bold" }]}
                    hyphenationCallback={noHyphenation}
                  >
                    GST {GST_RATE}% (Install)
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      { width: "40%", textAlign: "right", borderRightWidth: 0 },
                    ]}
                    hyphenationCallback={noHyphenation}
                  >
                    {installationTotalGST}
                  </Text>
                </View>
              )}

              <View style={[styles.row, { borderBottomWidth: 0 }]}>
                <Text
                  style={[
                    styles.cell,
                    { flex: 1, fontWeight: "bold", fontSize: 10 },
                  ]}
                  hyphenationCallback={noHyphenation}
                >
                  Grand Total
                </Text>
                <Text
                  style={[
                    styles.cell,
                    {
                      width: "40%",
                      textAlign: "right",
                      fontWeight: "bold",
                      fontSize: 10,
                      borderRightWidth: 0,
                    },
                  ]}
                  hyphenationCallback={noHyphenation}
                >
                  {grandTotal}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {data.type !== "Purchase Order" && (
        <TermsAndConditions infoData={infoData} type={data.type} />
      )}
    </Document>
  );
}
