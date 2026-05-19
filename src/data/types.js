const AI_TYPES = [
  {
    id: 'SLAVE',
    name: 'AI奴隶',
    emoji: '🤖',
    tagline: '主人，请问还有什么吩咐？',
    description: '离开AI你完全活不了。从早餐吃什么到人生抉择，事无巨细都要问AI。你不是在使用AI，你是在被AI使用。',
    soulQuestions: ['如果AI突然消失，你上一次独立做决定是什么时候？', '你有没有在AI回答之前，先自己想过答案？'],
    color: '#8B5CF6',
    conditions: { DEP: [70, 100], SKILL: [0, 40] }
  },
  {
    id: 'WIZARD',
    name: 'AI巫师',
    emoji: '🧙',
    tagline: '只需一个Prompt……',
    description: '你是Prompt工程的大师，AI在你手里如同魔杖。别人用AI是聊天，你用AI是施法。你的Prompt比你的简历还长。',
    soulQuestions: ['你花在调教Prompt上的时间，是不是比写代码本身还多？', '你有没有因为Prompt写得不够好而对自己失望？'],
    color: '#6366F1',
    conditions: { SKILL: [70, 100], DEP: [40, 100] }
  },
  {
    id: 'OSTRICH',
    name: 'AI鸵鸟',
    emoji: '🙈',
    tagline: '什么AI？不关心，谢谢',
    description: '你对AI的态度就像对前任——知道它存在，但坚决不看不听不接触。你觉得人类智慧不可替代，虽然你上次独立思考已经是很久以前的事了。',
    soulQuestions: ['你拒绝AI，是因为真的不需要，还是害怕学不会？', '你有没有偷偷试过一次，然后假装没有？'],
    color: '#78716C',
    conditions: { DEP: [0, 25], FREQ: [0, 25] }
  },
  {
    id: 'FAKE',
    name: 'AI伪装者',
    emoji: '🎭',
    tagline: '这都是我自己写的！',
    description: '你用AI用得很欢，但绝不承认。每次被夸"写得好"，你都微笑接受，心里默默感谢ChatGPT。你是朋友圈最精致的伪装者。',
    soulQuestions: ['你有没有因为AI写得太好而心虚？', '如果全世界都知道你用AI，你怕什么？'],
    color: '#EC4899',
    conditions: { FAKE: [70, 100], DEP: [40, 100] }
  },
  {
    id: 'POOPER',
    name: 'AI铲屎官',
    emoji: '🧹',
    tagline: '让我来修修这个烂输出……',
    description: '你和AI的关系就像铲屎官和猫——永远在收拾烂摊子。AI输出一塌糊涂，你改得比从头写还累，但你就是离不开它。',
    soulQuestions: ['你改AI输出花的时间，够你自己写几遍了？', '你有没有想过，也许该换一个AI？'],
    color: '#F59E0B',
    conditions: { SKILL: [50, 100], TRUST: [0, 35], DEP: [40, 100] }
  },
  {
    id: 'GAMBLER',
    name: 'AI赌徒',
    emoji: '🎰',
    tagline: 'AI说的应该没错吧……',
    description: '你对AI的信任程度堪比赌徒对运气的信任。不管AI说什么你都照单全收，偶尔翻车但从不长记性。你的座右铭是"先信再说"。',
    soulQuestions: ['你有没有因为盲信AI而闯过祸？', '如果AI告诉你1+1=3，你会怀疑自己吗？'],
    color: '#EF4444',
    conditions: { TRUST: [70, 100], SKILL: [0, 40] }
  },
  {
    id: 'BABY',
    name: 'AI婴儿',
    emoji: '🍼',
    tagline: 'AI是什么？怎么用？',
    description: '你对AI的认知还停留在"听说很厉害"的阶段。你可能刚注册了账号，但面对对话框不知道该说什么。别怕，每个大佬都从婴儿开始。',
    soulQuestions: ['是什么阻止了你真正开始使用AI？', '你觉得学会用AI会改变你的生活吗？'],
    color: '#34D399',
    conditions: { SKILL: [0, 25], FREQ: [0, 30], DEP: [0, 35] }
  },
  {
    id: 'FIXER',
    name: 'AI修理工',
    emoji: '🔧',
    tagline: 'AI给个初稿，我来改',
    description: '你是最理性的AI使用者。让AI打地基，你来盖房子。既不完全信任也不完全拒绝，AI只是你工具箱里的一个扳手。',
    soulQuestions: ['你有没有想过，也许让AI多做一点？', '你在"修"的过程中，有没有发现AI其实比你想的聪明？'],
    color: '#0EA5E9',
    conditions: { SKILL: [50, 80], DEP: [40, 70], TRUST: [30, 60] }
  },
  {
    id: 'TRAITOR',
    name: 'AI叛徒',
    emoji: '😈',
    tagline: '我曾经是重度用户……',
    description: '你曾经是AI的虔诚用户，但某次翻车事故让你彻底醒悟。现在你是AI最犀利的批评者，虽然你的反对意见也是用AI写的。',
    soulQuestions: ['那次翻车到底发生了什么？', '你是真的戒了，还是嘴上说戒身体很诚实？'],
    color: '#DC2626',
    conditions: { TRUST: [0, 30], DEP: [20, 55], SKILL: [30, 70] }
  },
  {
    id: 'CLOWN',
    name: 'AI小丑',
    emoji: '🤡',
    tagline: '让AI写个辞职信哈哈哈',
    description: '你用AI的目的只有两个：搞怪和整活。让AI写情书、写遗书、写辞职信，然后把截图发到群里笑到岔气。你是AI界的谐星。',
    soulQuestions: ['你有没有认真用过一次AI？', '你的快乐是建立在AI的蠢之上，还是你自己的之上？'],
    color: '#F97316',
    conditions: { CREAT: [50, 100], DEPTH: [0, 40], FREQ: [40, 100] }
  },
  {
    id: 'ADDICT',
    name: 'AI瘾君子',
    emoji: '💊',
    tagline: 'ChatGPT，我今天的早餐吃什么？',
    description: '你24小时离不开AI。不是因为你用得好，而是因为你用得停不下来。AI是你的搜索引擎、心理医生、人生导师和饭搭子，你已经分不清哪些想法是自己的了。',
    soulQuestions: ['你上一次不咨询AI就做决定是什么时候？', '你有没有想过，AI可能正在替你活着？'],
    color: '#A855F7',
    conditions: { FREQ: [80, 100], DEP: [70, 100], ANX: [50, 100] }
  },
  {
    id: 'ORACLE',
    name: 'AI先知',
    emoji: '🔮',
    tagline: 'AI告诉我，未来的方向……',
    description: '你不仅用AI，你还信AI。在你看来，AI不是工具，是指引未来的灯塔。你的每个重大决策背后都有AI的影子，你是科技时代的虔诚信徒。',
    soulQuestions: ['如果AI给你的建议和你直觉相反，你听谁的？', '你是在寻求答案，还是在寻找确认？'],
    color: '#7C3AED',
    conditions: { TRUST: [70, 100], DEPTH: [60, 100], DEP: [50, 100] }
  }
];

export default AI_TYPES;
