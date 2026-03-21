import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const pdfPath = '/Users/opiagent/Downloads/Noam Shabtai CV .pdf';
  
  try {
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json({ error: "PDF file not found at " + pdfPath }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(pdfPath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Noam_Shabtai_CV.pdf"',
      },
    });
  } catch (error) {
    console.error("Error serving PDF:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
