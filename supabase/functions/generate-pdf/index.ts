import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { entries } = await req.json()

    if (!entries || entries.length === 0) {
      throw new Error('No entries provided')
    }

    // Simple PDF generation using basic HTML to PDF approach
    // In a real implementation, you might want to use a more sophisticated PDF library
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Mood Journal Export</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 20px;
          }
          .entry { 
            margin-bottom: 30px; 
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 8px;
            background: #fafafa;
          }
          .entry-date { 
            font-weight: bold; 
            color: #666;
            margin-bottom: 10px;
          }
          .entry-text { 
            margin-bottom: 15px;
            line-height: 1.8;
          }
          .entry-meta { 
            font-size: 0.9em; 
            color: #888;
            display: flex;
            gap: 15px;
          }
          .sentiment { 
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
          }
          .sentiment.positive { background: #d4edda; color: #155724; }
          .sentiment.negative { background: #f8d7da; color: #721c24; }
          .sentiment.neutral { background: #e2e3e5; color: #383d41; }
          .tags {
            margin-top: 10px;
          }
          .tag {
            display: inline-block;
            background: #e9ecef;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            margin-right: 5px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>My Mood Journal</h1>
          <p>Exported on ${new Date().toLocaleDateString()}</p>
          <p>Total entries: ${entries.length}</p>
        </div>
    `

    // Add each journal entry
    for (const entry of entries) {
      const entryDate = new Date(entry.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      const sentimentClass = entry.sentiment ? entry.sentiment.toLowerCase() : 'neutral'
      const score = entry.score ? Math.round(entry.score * 100) : 0
      
      htmlContent += `
        <div class="entry">
          <div class="entry-date">${entryDate}</div>
          <div class="entry-text">${entry.text}</div>
          <div class="entry-meta">
            <span class="sentiment ${sentimentClass}">
              ${entry.sentiment || 'Unknown'} (${score}%)
            </span>
          </div>
          ${entry.tags && entry.tags.length > 0 ? `
            <div class="tags">
              ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `
    }

    htmlContent += `
      </body>
      </html>
    `

    // For a simple implementation, we'll return the HTML
    // In production, you'd want to use a proper HTML-to-PDF converter
    
    return new Response(
      JSON.stringify({ 
        pdf: Array.from(new TextEncoder().encode(htmlContent)),
        message: "PDF generation would require additional setup. For now, returning HTML content."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating PDF:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})