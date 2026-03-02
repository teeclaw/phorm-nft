import path from "node:path";
import { chromium } from "playwright";

const projectRoot = path.resolve(".");
const inputHtml = path.join(projectRoot, "templates", "report.html");
const outputPdf = path.join(projectRoot, "report.pdf");

const browser = await chromium.launch({
  args: ["--no-sandbox", "--font-render-hinting=medium"],
});

try {
  const page = await browser.newPage();
  await page.goto(`file://${inputHtml}`, { waitUntil: "networkidle" });

  // Ensure fonts settle (best effort)
  await page.evaluate(() => document.fonts?.ready);

  await page.pdf({
    path: outputPdf,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "16mm", right: "16mm", bottom: "18mm", left: "16mm" },
  });

  console.log("Generated:", outputPdf);
} finally {
  await browser.close();
}
