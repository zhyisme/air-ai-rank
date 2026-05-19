/**
 * Micro-feedback data pool for instant answer feedback.
 * Randomly selected after each quiz answer to add personality and engagement.
 */
const FEEDBACK_POOL = [
  { emoji: '🎯', text: '扎心了！' },
  { emoji: '💡', text: '被说中了！' },
  { emoji: '😱', text: '这也太准了！' },
  { emoji: '🤔', text: '嗯……有道理' },
  { emoji: '😂', text: '笑出声了' },
  { emoji: '😏', text: '被你看穿了' },
  { emoji: '🫣', text: '别说了别说了' },
  { emoji: '👀', text: '你怎么知道' },
  { emoji: '🔥', text: '暴击！' },
  { emoji: '💫', text: '灵魂一击' },
];

export default FEEDBACK_POOL;
