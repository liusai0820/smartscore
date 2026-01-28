import OpenAI from 'openai'

const useOpenRouter = !!process.env.OPENROUTER_API_KEY
const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY
const baseURL = useOpenRouter ? 'https://openrouter.ai/api/v1' : process.env.OPENAI_BASE_URL

const openai = new OpenAI({
  apiKey,
  baseURL,
})

export interface ExtractedProject {
  name: string
  department: string
  presenter: string
  description: string
}

export async function extractProjectData(text: string): Promise<ExtractedProject[]> {
  if (!text || text.trim().length === 0) {
    return []
  }

  const prompt = `
You are a data extraction assistant. Your task is to extract structured project information from the provided raw text (which may be from an Excel or Word file).

Extract the following fields for each project found:
- name: The name of the project or topic.
- department: The department or unit responsible.
- presenter: The name of the person presenting or in charge.
- description: A brief description of the project (if available).

CRITICAL: You MUST preserve the exact order in which projects appear in the original text. Do not reorder, sort, or rearrange the projects in any way. The order of items in your output array must match the order they appear in the input.

Return the data strictly as a JSON object with a "projects" key containing an array of objects.
Example format:
{
  "projects": [
    { "name": "Project A", "department": "Tech", "presenter": "John", "description": "..." }
  ]
}

If a field is missing, use an empty string. Do not invent information.
If no projects are found, return { "projects": [] }.

Raw Text:
${text.slice(0, 15000)} // Truncate to avoid token limits if necessary
`

  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || (useOpenRouter ? 'openai/gpt-4o' : 'gpt-4o'),
      messages: [
        { role: 'system', content: 'You are a helpful assistant that extracts JSON data.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No content received from AI')
    }

    const parsed = JSON.parse(content)
    return parsed.projects || []
  } catch (error) {
    console.error('AI Extraction Error:', error)
    throw new Error('Failed to extract data using AI')
  }
}
