// app/api/recommend-skills/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your .env.local
});

export async function POST(request: NextRequest) {
  try {
    const { profession } = await request.json();

    if (!profession || typeof profession !== 'string') {
      return NextResponse.json(
        { error: 'Profession is required and must be a string' },
        { status: 400 }
      );
    }

    // Updated prompt to handle any profession, including non-technical (e.g., marketing, teaching, healthcare)
    // Emphasizes mix of technical (if applicable), soft, and domain-specific skills
    const prompt = `
      Based on the profession: "${profession}", recommend 10-15 key skills that are most relevant for someone in this role.
      Include a balanced mix: domain-specific skills, technical tools (if applicable), and soft skills (e.g., communication, leadership).
      For non-technical professions, focus on professional competencies, interpersonal skills, and industry knowledge.
      Return ONLY a JSON array of skill names as strings, like: ["Skill 1", "Skill 2", ...].
      Do not include any explanations or additional text.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or 'gpt-4o-mini' for cost-efficiency
      messages: [
        { role: 'system', content: 'You are a career advisor specializing in skill recommendations for all professions, from technical to creative, managerial, and service-oriented roles.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.3, // Low temperature for consistent, focused outputs
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON array from the response
    let recommendedSkills: string[];
    try {
      recommendedSkills = JSON.parse(response);
      if (!Array.isArray(recommendedSkills) || recommendedSkills.length === 0) {
        throw new Error('Invalid response format');
      }
      // Limit to 15 skills max
      recommendedSkills = recommendedSkills.slice(0, 15);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ skills: recommendedSkills });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}