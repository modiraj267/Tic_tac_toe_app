import { GEMINI_API_KEY } from '@env';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent';

export const getRandomAvailableMove = (board) => {
  const availableMoves = board
    .map((cell, index) => (cell === null ? index : null))
    .filter((index) => index !== null);

  if (availableMoves.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
};

export const getComputerMove = async (board, signal) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('Gemini API key is missing. Falling back to random move.');
    return getRandomAvailableMove(board);
  }

  const prompt = `
You are playing Tic-Tac-Toe.
The human player is X.
You are O.
Choose exactly ONE valid empty cell for your move. Consider winning immediately, blocking X from winning, or taking the center/corner.

Board indexes:
0 1 2
3 4 5
6 7 8

Current board:
${JSON.stringify(board)}

Available cells:
${board
  .map((cell, index) => (cell === null ? index : null))
  .filter((i) => i !== null)
  .join(', ')}

Return ONLY the number of the cell you want to play.
Do not return explanations.
Do not return markdown.
Do not return multiple moves.
`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 },
      }),
      signal,
    });


    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (responseText) {
      const move = parseInt(responseText.trim(), 10);

      // Strict Validation
      if (Number.isInteger(move) && move >= 0 && move <= 8 && board[move] === null) {
        return move;
      }
    }

    console.warn('Invalid move returned by Gemini. Falling back to random move.');
    return getRandomAvailableMove(board);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Gemini request aborted');
      throw error;
    }
    console.error('Gemini API Request failed:', error);
    return getRandomAvailableMove(board);
  }
};
