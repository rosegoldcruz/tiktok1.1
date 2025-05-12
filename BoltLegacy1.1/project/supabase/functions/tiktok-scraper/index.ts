import puppeteer from "npm:puppeteer@22.3.0";
import { PDFDocument, StandardFonts } from "npm:pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ScrapingResult {
  url: string;
  title: string;
  content: string;
  category: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Start from the main help page
    await page.goto("https://ads.tiktok.com/help/article/tiktok-business-center?lang=en", {
      waitUntil: "networkidle0",
    });

    // Extract all article URLs
    const articles = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/help/article/"]'));
      return links.map(link => ({
        url: link.href,
        title: link.textContent?.trim() || "",
      }));
    });

    const results: ScrapingResult[] = [];

    // Process each article
    for (const article of articles) {
      try {
        await page.goto(article.url, { waitUntil: "networkidle0" });
        
        const data = await page.evaluate(() => {
          const content = document.querySelector('.article-content')?.textContent || "";
          const category = document.querySelector('.breadcrumb')?.textContent || "Uncategorized";
          return { content, category };
        });

        results.push({
          url: article.url,
          title: article.title,
          content: data.content,
          category: data.category,
        });

        // Create PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        page.drawText(article.title, {
          x: 50,
          y: page.getHeight() - 50,
          font,
          size: 20,
        });

        page.drawText(data.content, {
          x: 50,
          y: page.getHeight() - 100,
          font,
          size: 12,
          maxWidth: page.getWidth() - 100,
        });

        // Save PDF to temporary storage
        const pdfBytes = await pdfDoc.save();
        await Deno.writeFile(`/tmp/${article.title.replace(/[^a-z0-9]/gi, '_')}.pdf`, pdfBytes);

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error processing article ${article.url}:`, error);
      }
    }

    await browser.close();

    // Create index file
    const categories = [...new Set(results.map(r => r.category))];
    let indexContent = "# TikTok Documentation Index\n\n";
    
    for (const category of categories) {
      indexContent += `\n## ${category}\n\n`;
      const categoryArticles = results.filter(r => r.category === category);
      for (const article of categoryArticles) {
        indexContent += `- [${article.title}](${article.url})\n`;
      }
    }

    await Deno.writeFile("/tmp/index.md", new TextEncoder().encode(indexContent));

    return new Response(
      JSON.stringify({
        message: "Scraping completed",
        stats: {
          totalUrls: articles.length,
          successful: results.length,
          failed: articles.length - results.length,
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to scrape TikTok documentation",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});