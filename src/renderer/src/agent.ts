export type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string; tool?: string };

export function calculateExpression(input: string): number | null {
  const normalized = input.replace(/,/g, '.').trim();
  if (!normalized || !/^[0-9+\-*/().%\s]+$/.test(normalized)) return null;
  const tokens = normalized.match(/(?:\d+(?:\.\d+)?)|[()+\-*/%]/g);
  if (!tokens || tokens.join('') !== normalized.replace(/\s+/g, '')) return null;
  const values: number[] = [];
  const operators: string[] = [];
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };
  const apply = () => {
    const op = operators.pop();
    if (!op || values.length < 2) throw new Error('invalid expression');
    const b = values.pop()!; const a = values.pop()!;
    if (op === '+') values.push(a + b);
    else if (op === '-') values.push(a - b);
    else if (op === '*') values.push(a * b);
    else if (op === '/') { if (b === 0) throw new Error('division by zero'); values.push(a / b); }
    else { if (b === 0) throw new Error('modulo by zero'); values.push(a % b); }
  };
  try {
    let expectValue = true;
    for (const token of tokens) {
      if (/^\d/.test(token)) { values.push(Number(token)); expectValue = false; continue; }
      if (token === '(') { operators.push(token); expectValue = true; continue; }
      if (token === ')') {
        while (operators.length && operators[operators.length - 1] !== '(') apply();
        if (operators.pop() !== '(' || expectValue) throw new Error('invalid parentheses');
        expectValue = false; continue;
      }
      if (expectValue && (token === '+' || token === '-')) values.push(0);
      else if (expectValue) throw new Error('invalid operator');
      while (operators.length && operators[operators.length - 1] !== '(' && precedence[operators[operators.length - 1]] >= precedence[token]) apply();
      operators.push(token); expectValue = true;
    }
    if (expectValue) throw new Error('trailing operator');
    while (operators.length) { if (operators[operators.length - 1] === '(') throw new Error('unclosed parentheses'); apply(); }
    const result = values.length === 1 ? values[0] : NaN;
    return Number.isFinite(result) ? result : null;
  } catch { return null; }
}

export function mockAssistant(prompt: string): ChatMessage {
  const lower = prompt.toLowerCase();
  const calc = calculateExpression(prompt);
  if (calc !== null) return { id: crypto.randomUUID(), role: 'assistant', content: `Kết quả: ${calc}`, tool: 'calculator' };
  if (lower.includes('system info') || lower.includes('thông tin máy') || lower.includes('cấu hình')) {
    return { id: crypto.randomUUID(), role: 'assistant', content: 'Mình có thể dùng System Info để đọc cấu hình cơ bản của máy. Hãy mở Tools → System Info để chạy công cụ này.', tool: 'system-info' };
  }
  return { id: crypto.randomUUID(), role: 'assistant', content: `Đã nhận yêu cầu: “${prompt}”\n\nNexusAI đang chạy ở chế độ Demo AI. Bạn có thể kết nối một API tương thích OpenAI trong Settings để bật mô hình thật. Các công cụ trên máy chỉ chạy khi bạn chủ động kích hoạt và cấp quyền.` };
}
