export async function getAIRecommendations(habits, tasks, language = 'en') {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your_openai_api_key') {
    return getDemoRecommendations(language);
  }

  const habitSummary = habits.map(h => `${h.title} (${h.category}, streak: ${h.streak || 0})`).join(', ');
  const taskSummary = tasks.map(t => `${t.title} (priority: ${t.priority}, ${t.is_completed ? 'done' : 'pending'})`).join(', ');
  
  const prompt = language === 'ru' 
    ? `Ты — AI-помощник по продуктивности. Проанализируй данные пользователя и дай 3-4 конкретных совета.

Привычки: ${habitSummary || 'нет данных'}
Задачи: ${taskSummary || 'нет данных'}

Дай краткие, практичные рекомендации на русском языке. Используй эмодзи. Формат: массив JSON объектов с полями "title" и "description".`
    : `You are a productivity AI assistant. Analyze user data and give 3-4 specific tips.

Habits: ${habitSummary || 'no data'}  
Tasks: ${taskSummary || 'no data'}

Give brief, actionable recommendations. Use emojis. Format: JSON array of objects with "title" and "description" fields.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return content.recommendations || content;
  } catch (error) {
    console.error('AI recommendation error:', error);
    return getDemoRecommendations(language);
  }
}

function getDemoRecommendations(language) {
  if (language === 'ru') {
    return [
      { title: '🎯 Фокус на приоритетах', description: 'Начните день с самой важной задачи. Выполнение сложных дел утром повышает продуктивность на 30%.' },
      { title: '⏰ Техника Помодоро', description: 'Работайте 25 минут, затем 5 минут отдыха. Каждые 4 цикла — длинный перерыв 15-30 минут.' },
      { title: '📝 Вечерний обзор', description: 'Проведите 5 минут вечером для обзора дня и планирования завтрашнего. Это улучшит вашу организованность.' },
      { title: '💪 Не ломайте цепочку', description: 'Поддерживайте серию выполнения привычек. Визуальный прогресс мотивирует продолжать.' }
    ];
  }
  return [
    { title: '🎯 Focus on Priorities', description: 'Start your day with the most important task. Completing hard tasks in the morning boosts productivity by 30%.' },
    { title: '⏰ Pomodoro Technique', description: 'Work for 25 minutes, then take a 5-minute break. Every 4 cycles, take a longer 15-30 minute break.' },
    { title: '📝 Evening Review', description: 'Spend 5 minutes each evening reviewing your day and planning tomorrow. This will improve your organization.' },
    { title: '💪 Don\'t Break the Chain', description: 'Maintain your habit streaks. Visual progress motivates you to keep going.' }
  ];
}
