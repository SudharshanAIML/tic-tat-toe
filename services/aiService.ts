import { GoogleGenAI, Type } from "@google/genai";
import { Player, Difficulty, MoveResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getAiMove = async (
  board: Player[],
  difficulty: Difficulty
): Promise<MoveResponse> => {
  // If no API key is set, fallback to a random valid move (basic fail-safe)
  if (!apiKey) {
    console.warn("No API Key found, falling back to random move.");
    const availableMoves = board
      .map((cell, index) => (cell === null ? index : null))
      .filter((val): val is number => val !== null);
    
    if (availableMoves.length === 0) return { move: -1 };
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    return { move: randomMove, commentary: "I'm playing randomly because I don't have a brain (API Key) yet!" };
  }

  const modelName = 'gemini-2.5-flash';

  const boardStateString = JSON.stringify(
    board.map((cell, index) => (cell ? cell : `[${index}]`))
  );

  const prompt = `
    You are playing Tic-Tac-Toe. You are player 'O'. The opponent is 'X'.
    
    Current board state: ${boardStateString}
    
    The board array indices are 0-8. 
    Indices where you see 'X' or 'O' are taken. 
    Indices with numbers like '[0]', '[1]' are empty available spots.

    Your goal is to ${difficulty === Difficulty.HARD ? 'win the game at all costs. Block the opponent if they are about to win. Set up forks if possible.' : 'play casually. Make a valid move, but you can make mistakes.'}

    Return the index (0-8) of your next move.
    Also provide a very short, witty 1-sentence commentary on your move as 'O'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: {
              type: Type.INTEGER,
              description: "The index of the grid cell to place 'O' (0-8).",
            },
            commentary: {
              type: Type.STRING,
              description: "Short witty commentary about the move.",
            },
          },
          required: ["move"],
        },
      },
    });

    if (response.text) {
      const result = JSON.parse(response.text) as MoveResponse;
      return result;
    }
    
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("AI Move Error:", error);
    // Fallback to random move if API fails
    const availableMoves = board
      .map((cell, index) => (cell === null ? index : null))
      .filter((val): val is number => val !== null);
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    return { move: randomMove, commentary: "Thinking hurts... I'll just go here." };
  }
};