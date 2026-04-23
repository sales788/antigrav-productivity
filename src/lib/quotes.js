const QUOTES_CACHE_KEY = 'antigrav-quote';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const fallbackQuotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Little things make big days.", author: "Unknown" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" }
];

export async function getQuote() {
  // Check cache first
  try {
    const cached = JSON.parse(localStorage.getItem(QUOTES_CACHE_KEY));
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.quote;
    }
  } catch (e) { /* ignore */ }

  // Try API
  try {
    const response = await fetch('https://zenquotes.io/api/random');
    if (response.ok) {
      const data = await response.json();
      const quote = { text: data[0].q, author: data[0].a };
      localStorage.setItem(QUOTES_CACHE_KEY, JSON.stringify({ quote, timestamp: Date.now() }));
      return quote;
    }
  } catch (e) { /* fallback */ }

  // Fallback to local quotes
  const quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  localStorage.setItem(QUOTES_CACHE_KEY, JSON.stringify({ quote, timestamp: Date.now() }));
  return quote;
}
