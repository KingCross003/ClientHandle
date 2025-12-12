import { GoogleGenAI } from "@google/genai";
import { ProjectData, PROJECT_TYPES, PROJECT_HANDLERS } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateClientUpdate = async (data: ProjectData): Promise<string> => {
  const typeInfo = PROJECT_TYPES[data.type];
  const progress = data.progress;
  const handlerInfo = PROJECT_HANDLERS.find(h => h.name === data.projectHandler);
  const designation = handlerInfo ? handlerInfo.designation : 'Project Manager';
  
  const completedLabels = typeInfo.steps
    .filter(step => data.completedSteps.includes(step.id))
    .map(step => step.label)
    .join(', ');

  const nextSteps = typeInfo.steps
    .filter(step => !data.completedSteps.includes(step.id))
    .slice(0, 2) // Get next 2 steps
    .map(step => step.label)
    .join(', ');

  let context = `
    You are ${data.projectHandler}, a ${designation} at Anexture.
    Write a short, professional, and enthusiastic project update email snippet for a client.
    
    Client Name: ${data.clientName || 'Valued Client'}
    Project Name: ${data.projectName || 'New Project'}
    Project Type: ${typeInfo.label}
    Current Progress: ${progress}%
    Completed Items: ${completedLabels || 'Project Initialization'}
    Next Steps: ${nextSteps || 'Final Delivery'}
    Timeline/Duration: ${data.workingTime}
    Lead Designer: ${data.designer}
    Target Deadline: ${data.deadline || 'TBD'}
    Additional Notes: ${data.customNotes}
  `;

  if (data.isDelayed) {
    context += `
    IMPORTANT: The project is currently DELAYED.
    Reason for Delay: ${data.delayReason}
    Please write the message in a way that apologizes professionally for the delay, explains the reason clearly, and assures the client that the team (and designer ${data.designer}) is working hard to get back on track.
    `;
  } else {
    context += `
    The tone should be reassuring and professional. Use "I" or "We" as appropriate from Anexture.
    `;
  }

  const prompt = `
    ${context}
    
    Keep it under 80 words.
    Do not include subject lines or placeholders, just the message body.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate update. Please try again or check your API key.";
  }
};