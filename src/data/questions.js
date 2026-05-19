const QUESTIONS = [
  {
    id: 1,
    text: '早上醒来打开手机，你会……',
    options: [
      { text: '先问AI今天穿什么、吃什么', scores: { DEP: 20, FREQ: 20 } },
      { text: '刷朋友圈，看到AI话题才想起', scores: { DEP: 5, FREQ: 5 } },
      { text: '打开AI确认昨天的对话进展', scores: { DEP: 15, FREQ: 15, SKILL: 5 } },
      { text: '关闹钟继续睡，AI是什么', scores: { DEP: -10, FREQ: -10 } }
    ]
  },
  {
    id: 2,
    text: '老板让你写一份季度报告，你会……',
    options: [
      { text: '直接丢给AI，让它生成初稿再改', scores: { DEP: 15, SKILL: 5, DEPTH: 10 } },
      { text: '自己列大纲，让AI填充细节', scores: { DEP: 5, SKILL: 15, DEPTH: 15 } },
      { text: '完全自己写，AI写的没灵魂', scores: { DEP: -10, SKILL: 5, FAKE: -10 } },
      { text: '让AI写，然后说是自己写的', scores: { DEP: 10, FAKE: 25 } }
    ]
  },
  {
    id: 3,
    text: '你用AI最常做什么？',
    options: [
      { text: '写代码/写文案/做分析', scores: { DEPTH: 20, SKILL: 10, CREAT: 5 } },
      { text: '闲聊/问生活建议/查菜谱', scores: { DEPTH: 5, FREQ: 10, TRUST: 10 } },
      { text: '让AI帮我做人生决定', scores: { DEPTH: 10, TRUST: 20, ANX: 10, DEP: 15 } },
      { text: '让AI写段子/恶搞朋友', scores: { DEPTH: -5, FREQ: 5, CREAT: 15 } }
    ]
  },
  {
    id: 4,
    text: 'AI给了你一个明显错误的回答，你会？',
    options: [
      { text: '仔细修改Prompt重新问', scores: { SKILL: 20, TRUST: 5, CREAT: 5 } },
      { text: '直接换个AI再问一遍', scores: { SKILL: 5, TRUST: -10, FREQ: 10 } },
      { text: '照用不误，AI说的应该没错', scores: { TRUST: 20, SKILL: -10, FAKE: 5 } },
      { text: '这就是为什么我不用AI', scores: { TRUST: -20, DEP: -15 } }
    ]
  },
  {
    id: 5,
    text: '朋友夸你"这篇文章写得真好"，但其实是AI写的，你会……',
    options: [
      { text: '坦白说是AI辅助的', scores: { FAKE: -10, SKILL: 5 } },
      { text: '微笑接受，深藏功与名', scores: { FAKE: 25 } },
      { text: '说"谢谢，我花了很久"', scores: { FAKE: 20, DEP: 5 } },
      { text: '我根本不会用AI写文章', scores: { FAKE: -15, DEP: -5 } }
    ]
  },
  {
    id: 6,
    text: '你对AI取代你的工作有多担心？',
    options: [
      { text: '非常担心，每天都在想', scores: { ANX: 25, DEP: 5 } },
      { text: '有点担心，但觉得还早', scores: { ANX: 10 } },
      { text: '不担心，AI是我的工具', scores: { ANX: -10, SKILL: 10, CREAT: 5 } },
      { text: '完全不担心，人类不可替代', scores: { ANX: -15, TRUST: -10 } }
    ]
  },
  {
    id: 7,
    text: '你的Prompt通常有多长？',
    options: [
      { text: '一句话搞定', scores: { SKILL: -5, DEP: 5 } },
      { text: '几句话，交代清楚背景', scores: { SKILL: 10, CREAT: 5 } },
      { text: '一大段，含角色/背景/要求/格式', scores: { SKILL: 25, CREAT: 10, DEPTH: 10 } },
      { text: 'Prompt是什么？', scores: { SKILL: -20, FREQ: -10 } }
    ]
  },
  {
    id: 8,
    text: '如果AI突然消失了，你的生活会？',
    options: [
      { text: '完全瘫痪，无法工作', scores: { DEP: 30, ANX: 10 } },
      { text: '有点不方便，但能适应', scores: { DEP: 10 } },
      { text: '没啥影响，本来就不太用', scores: { DEP: -15, FREQ: -10 } },
      { text: '更好了，终于不用修AI烂输出了', scores: { DEP: -10, SKILL: 10, TRUST: -5 } }
    ]
  },
  {
    id: 9,
    text: '你会在朋友圈晒自己用AI的成果吗？',
    options: [
      { text: '会，以会用AI为荣', scores: { FAKE: -10, CREAT: 10, SKILL: 5 } },
      { text: '不会，怕别人觉得我作弊', scores: { FAKE: 15, ANX: 5 } },
      { text: '只晒AI翻车的搞笑截图', scores: { CREAT: 15, TRUST: -5 } },
      { text: '朋友圈不聊这种事', scores: { FREQ: -5, FAKE: -5 } }
    ]
  },
  {
    id: 10,
    text: '你觉得AI最像你的什么？',
    options: [
      { text: '私人助理，随叫随到', scores: { DEP: 10, TRUST: 10, FREQ: 10 } },
      { text: '不靠谱的实习生，得盯着', scores: { SKILL: 15, TRUST: -5, CREAT: 5 } },
      { text: '塔罗牌，给人生指方向', scores: { TRUST: 20, ANX: 10, DEP: 15, DEPTH: 10 } },
      { text: '我不跟工具建立关系', scores: { DEP: -10, TRUST: -10 } }
    ]
  },
  {
    id: 11,
    text: '你同事发了一篇文章，你能一眼看出是AI写的吗？',
    options: [
      { text: '能，AI味太重了', scores: { SKILL: 15, TRUST: -5, DEP: 5 } },
      { text: '有时候能看出来', scores: { SKILL: 5 } },
      { text: '看不出来，AI写得太好了', scores: { TRUST: 15, SKILL: -5 } },
      { text: '不在乎，写得好就行', scores: { TRUST: 5, DEPTH: 5 } }
    ]
  },
  {
    id: 12,
    text: '你手机里装了几个AI相关的App？',
    options: [
      { text: '5个以上，全都要试', scores: { FREQ: 20, DEP: 15, SKILL: 10 } },
      { text: '2-3个主力', scores: { FREQ: 10, SKILL: 5 } },
      { text: '1个，够用就行', scores: { FREQ: 5 } },
      { text: '0个，我不用AI', scores: { FREQ: -15, DEP: -15 } }
    ]
  },
  {
    id: 13,
    text: '半夜三点睡不着，你会……',
    options: [
      { text: '跟AI聊天到天亮', scores: { DEP: 20, FREQ: 15, ANX: 10, FAKE: 5 } },
      { text: '让AI帮我分析为什么失眠', scores: { DEP: 15, TRUST: 15, DEPTH: 10 } },
      { text: '刷手机，但不会找AI', scores: { DEP: -5, FREQ: 0 } },
      { text: '数羊', scores: { DEP: -10, FREQ: -5 } }
    ]
  },
  {
    id: 14,
    text: '看到"AI将取代XX职业"的新闻，你会？',
    options: [
      { text: '立刻问AI我该学什么新技能', scores: { ANX: 20, DEP: 15, TRUST: 10, DEPTH: 10 } },
      { text: '焦虑一会儿，然后继续工作', scores: { ANX: 15 } },
      { text: '嗤之以鼻，标题党', scores: { ANX: -10, TRUST: -10 } },
      { text: '研究一下，看怎么利用这个趋势', scores: { CREAT: 15, SKILL: 10, ANX: -5 } }
    ]
  },
  {
    id: 15,
    text: '选一个最像你的描述：',
    options: [
      { text: '我离不开AI，但AI也离不开我', scores: { DEP: 15, SKILL: 15, CREAT: 10 } },
      { text: 'AI只是工具，我才是主宰', scores: { DEP: -5, SKILL: 10, TRUST: -5, CREAT: 5 } },
      { text: '我和AI之间，有种说不清的关系', scores: { DEP: 10, TRUST: 10, ANX: 10, DEPTH: 5 } },
      { text: '我活得好好的，不需要AI', scores: { DEP: -20, FREQ: -15, TRUST: -10 } }
    ]
  }
];

export default QUESTIONS;
