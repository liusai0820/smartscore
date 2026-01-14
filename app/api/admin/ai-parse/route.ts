import { NextRequest, NextResponse } from 'next/server';
import { parseFile } from '@/lib/file-parser';
import { extractProjectData } from '@/lib/ai-extractor';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file uploaded or invalid file format' },
        { status: 400 }
      );
    }

    // 1. Parse file to text
    // The parseFile function handles .xlsx, .xls, and .docx
    const text = await parseFile(file);

    // 2. Extract data using AI
    // The extractProjectData function calls OpenAI/OpenRouter to structure the data
    const projects = await extractProjectData(text);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('AI Parse API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
