export type KidsBlogSeedPost = {
  title: string
  slug: string
  category: string
  excerpt: string
  metaTitle: string
  metaDescription: string
  content: string
  publishedAt: Date
}

type Section = {
  heading?: string
  paragraphs: string[]
  bullets?: string[]
}

function buildContent(sections: Section[]): string {
  return sections
    .map((s) => {
      let html = ''
      if (s.heading) html += `<h2>${s.heading}</h2>`
      html += s.paragraphs.map((p) => `<p>${p}</p>`).join('')
      if (s.bullets?.length) {
        html += `<ul>${s.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`
      }
      return html
    })
    .join('')
}

function post(
  title: string,
  slug: string,
  category: string,
  excerpt: string,
  sections: Section[],
  daysAgo: number
): KidsBlogSeedPost {
  const publishedAt = new Date()
  publishedAt.setDate(publishedAt.getDate() - daysAgo)
  return {
    title,
    slug,
    category,
    excerpt,
    metaTitle: `${title} | MonAlo Blog`,
    metaDescription: excerpt,
    content: buildContent(sections),
    publishedAt,
  }
}

export const KIDS_BLOG_POSTS: KidsBlogSeedPost[] = [
  post(
    'Screen time boundaries without daily battles',
    'screen-time-boundaries',
    'Digital life',
    'Clear, kind limits on devices help kids feel safe — and give guardians fewer nightly arguments.',
    [
      {
        paragraphs: [
          'Most families do not need a perfect screen-time policy. They need a predictable one. When rules change every day, kids push back because the boundary feels arbitrary. When rules are consistent and explained calmly, compliance becomes easier — not effortless, but easier.',
        ],
      },
      {
        heading: 'Start with when, not how much',
        paragraphs: [
          'Begin with protected times: meals, the hour before bed, and the first 30 minutes after school. Device-free zones matter more than counting minutes for young children.',
        ],
        bullets: [
          'Charge devices outside the bedroom overnight.',
          'Use a visual timer so ending screen time is not a surprise.',
          'Offer a transition activity — snack, walk, or music — when screens turn off.',
        ],
      },
      {
        heading: 'Model what you ask for',
        paragraphs: [
          'If phones stay on the table at dinner, kids notice. Put your device away first, then invite them to do the same. You are teaching attention, not punishment.',
        ],
      },
    ],
    2
  ),
  post(
    'Homework routines that actually stick',
    'homework-routines',
    'School',
    'A short, repeatable after-school rhythm beats a long lecture about responsibility.',
    [
      {
        paragraphs: [
          'Homework struggles are rarely about intelligence. They are about energy, timing, and unclear expectations. A routine answers three questions: where, when, and how long.',
        ],
      },
      {
        heading: 'The 20-minute reset',
        paragraphs: [
          'After school, allow a brief reset — snack, movement, quiet time — before homework. Brains need downshift time, especially for younger kids.',
        ],
      },
      {
        heading: 'Same place, same start',
        paragraphs: [
          'Choose one homework spot with good light and minimal clutter. Start at roughly the same time each school day. Predictability lowers resistance.',
        ],
        bullets: [
          'Keep supplies in one bin so searching does not become procrastination.',
          'Break large assignments into two or three visible steps on paper.',
          'End with a quick review together — two minutes of praise for effort.',
        ],
      },
    ],
    4
  ),
  post(
    'Sleep schedules for school nights',
    'school-night-sleep',
    'Wellbeing',
    'Restful nights start in the afternoon — not five minutes before lights out.',
    [
      {
        paragraphs: [
          'Sleep affects mood, memory, and immune health. Guardians often focus on bedtime alone, but sleep hygiene is a whole-evening pattern.',
        ],
      },
      {
        heading: 'Work backward from wake time',
        paragraphs: [
          'Count hours backward from when your child must wake for school. Most school-age kids need 9–11 hours. That number sets bedtime — not the other way around.',
        ],
      },
      {
        heading: 'Dim the day gradually',
        paragraphs: [
          'Lower lights and noise an hour before bed. Warm baths, reading, and quiet conversation signal the nervous system to slow down.',
        ],
        bullets: [
          'Avoid intense games or stressful conversations right before sleep.',
          'Keep wake times consistent on weekends within one hour of school days.',
          'If nightmares or anxiety disrupt sleep, validate feelings and return to a calm routine.',
        ],
      },
    ],
    6
  ),
  post(
    'Helping kids with school anxiety',
    'school-anxiety',
    'Wellbeing',
    'Anxiety is information, not defiance. Learn to respond with steadiness instead of urgency.',
    [
      {
        paragraphs: [
          'Stomachaches, tears, or refusal on school mornings often mean a child feels unsafe — socially, academically, or emotionally. Dismissing worry teaches kids to hide it.',
        ],
      },
      {
        heading: 'Name it without fixing it immediately',
        paragraphs: [
          'Try: "Something about school feels hard today." Listening for five minutes can reduce panic more than a dozen reassurances.',
        ],
      },
      {
        heading: 'Small brave steps',
        paragraphs: [
          'Work with teachers on gradual exposure: visiting the classroom early, a trusted adult at drop-off, or a short note in the lunchbox. Celebrate showing up, not perfection.',
        ],
      },
    ],
    8
  ),
  post(
    'What guardians can do about bullying',
    'bullying-response',
    'Safety',
    'Believe your child, document patterns, and partner with the school — calmly and persistently.',
    [
      {
        paragraphs: [
          'Bullying is repeated harm with a power imbalance. It is not "kids being kids." Your first job is to make home a place where your child feels heard.',
        ],
      },
      {
        heading: 'Gather facts, not rumors',
        paragraphs: [
          'Write dates, locations, witnesses, and exact words used. Schools respond more effectively to specific reports than general concerns.',
        ],
        bullets: [
          'Ask what your child wants before you contact the school.',
          'Request a written follow-up plan from administrators.',
          'Seek counseling if sleep, appetite, or mood changes persist.',
        ],
      },
    ],
    10
  ),
  post(
    'Building confidence in shy kids',
    'shy-kid-confidence',
    'Growth',
    'Confidence grows from small successes, not forced performances.',
    [
      {
        paragraphs: [
          'Shyness is temperament, not a flaw. Pushing a quiet child to "speak up" can increase anxiety. Instead, create low-stakes chances to be seen and valued.',
        ],
      },
      {
        heading: 'Prepare, do not perform',
        paragraphs: [
          'Before social events, rehearse one greeting or one question they can ask. One prepared sentence is enough for many children.',
        ],
      },
      {
        heading: 'Praise process',
        paragraphs: [
          'Say "You stayed in the room even when it felt hard" rather than "You were so brave!" Process praise builds internal confidence over time.',
        ],
      },
    ],
    12
  ),
  post(
    'Picky eating without power struggles',
    'picky-eating',
    'Health',
    'Your job is to offer; their job is to decide whether to eat — within a calm structure.',
    [
      {
        paragraphs: [
          'Food battles often increase pickiness. Division of responsibility — you choose what and when, they choose whether and how much — reduces tension at the table.',
        ],
      },
      {
        heading: 'One safe food every meal',
        paragraphs: [
          'Include something your child usually accepts alongside new foods. Exposure without pressure builds curiosity over months, not one dinner.',
        ],
        bullets: [
          'Eat together when possible; kids copy more than they listen.',
          'Avoid bargaining with dessert — it teaches that vegetables are punishment.',
          'Involve kids in shopping or simple prep to increase interest.',
        ],
      },
    ],
    14
  ),
  post(
    'Morning routines that reduce chaos',
    'morning-routines',
    'Home',
    'Prepare the night before. Execute the morning with fewer decisions.',
    [
      {
        paragraphs: [
          'Morning meltdowns often come from decision fatigue and time pressure. Shift preparation to the evening: clothes, bags, lunches, and water bottles.',
        ],
      },
      {
        heading: 'A visual checklist',
        paragraphs: [
          'Young children benefit from picture charts: dress, teeth, eat, shoes, bag. Checking items builds autonomy and speed.',
        ],
      },
      {
        heading: 'Buffer time is kindness',
        paragraphs: [
          'Wake up 10–15 minutes earlier than you think you need. That margin turns forgotten socks from a crisis into a small fix.',
        ],
      },
    ],
    16
  ),
  post(
    'Talking about feelings with kids',
    'talking-about-feelings',
    'Connection',
    'Emotional vocabulary is a skill — teach it the way you teach reading.',
    [
      {
        paragraphs: [
          'Kids who can name feelings regulate faster. Start with basic words — mad, sad, scared, happy — then add nuance: disappointed, embarrassed, proud.',
        ],
      },
      {
        heading: 'Reflect before you redirect',
        paragraphs: [
          '"You seem frustrated because the tower fell" validates before problem-solving. Fixing too quickly can feel dismissive.',
        ],
      },
      {
        heading: 'Share your feelings too',
        paragraphs: [
          'Model calm language: "I felt tired after work, so I took a breath before we talked." You are showing that all feelings are manageable.',
        ],
      },
    ],
    18
  ),
  post(
    'Friendships and social skills at every age',
    'friendships-social-skills',
    'Growth',
    'Friendship skills are learned — coaching beats correcting in public.',
    [
      {
        paragraphs: [
          'Not every child needs many friends. One or two close connections can be enough. Focus on kindness, listening, and repair after conflict.',
        ],
      },
      {
        heading: 'Role-play at home',
        paragraphs: [
          'Practice sharing, joining play, and saying no politely. Scripts feel silly to adults but give kids language in the moment.',
        ],
        bullets: [
          'Arrange low-pressure playdates with clear start and end times.',
          'Debrief afterward: what went well, what was hard.',
          'Avoid forcing friendships with children who consistently exclude or hurt.',
        ],
      },
    ],
    20
  ),
  post(
    'Understanding after-school meltdowns',
    'after-school-meltdowns',
    'Wellbeing',
    'The hardest hour is often right after pickup — here is why, and what helps.',
    [
      {
        paragraphs: [
          'Many children hold it together all day at school, then fall apart at home. Home is the safe place to release stress. That is exhausting for guardians — and normal for kids.',
        ],
      },
      {
        heading: 'Lower demands first',
        paragraphs: [
          'Offer water, snack, and quiet before homework or chores. A 15-minute decompression window prevents many explosions.',
        ],
      },
      {
        heading: 'Stay boringly calm',
        paragraphs: [
          'Your steadiness is the thermostat. Short sentences and physical closeness (if they want it) beat long explanations mid-meltdown.',
        ],
      },
    ],
    22
  ),
  post(
    'Reading together at any age',
    'reading-together',
    'Learning',
    'Shared reading builds language, bond, and calm — even for tweens who say they are too old.',
    [
      {
        paragraphs: [
          'Reading aloud is not just for preschoolers. Older kids still benefit from hearing complex language and sharing stories without screens.',
        ],
      },
      {
        heading: 'Let them choose sometimes',
        paragraphs: [
          'Graphic novels, magazines, and audiobooks count. Interest drives volume; volume drives skill.',
        ],
      },
      {
        heading: 'Five minutes still counts',
        paragraphs: [
          'On busy nights, one short chapter maintains the habit. Consistency beats length.',
        ],
      },
    ],
    24
  ),
  post(
    'When kids say "I\'m bored"',
    'kids-say-bored',
    'Home',
    'Boredom is not an emergency — it can be the doorway to creativity.',
    [
      {
        paragraphs: [
          'Instant entertainment teaches kids that discomfort must be fixed immediately. A little boredom develops imagination and initiative.',
        ],
      },
      {
        heading: 'Respond without rescuing',
        paragraphs: [
          '"I wonder what you will discover" invites problem-solving. Filling every empty moment with activities removes that growth.',
        ],
        bullets: [
          'Keep open-ended materials: paper, blocks, yarn, cardboard.',
          'Rotate toys so old items feel new.',
          'Schedule unstructured outdoor time weekly.',
        ],
      },
    ],
    26
  ),
  post(
    'Resilience after disappointment',
    'resilience-disappointment',
    'Growth',
    'Lost games, failed tests, and broken plans — how to help kids bounce back.',
    [
      {
        paragraphs: [
          'Resilience is not pretending hurt does not matter. It is feeling the disappointment, learning from it, and trying again when ready.',
        ],
      },
      {
        heading: 'Validate first',
        paragraphs: [
          '"That really stings" before "You will do better next time." Order matters.',
        ],
      },
      {
        heading: 'Review with curiosity',
        paragraphs: [
          'Ask what they would keep the same and what they might change. Focus on effort and strategy, not fixed labels like "smart" or "lazy."',
        ],
      },
    ],
    28
  ),
  post(
    'Sibling rivalry — fair is not always equal',
    'sibling-rivalry',
    'Family',
    'Reduce competition by meeting each child\'s needs, not matching treats exactly.',
    [
      {
        paragraphs: [
          'Siblings compare constantly. Guardians who aim for identical treatment often increase resentment. Each child needs to feel uniquely seen.',
        ],
      },
      {
        heading: 'One-on-one time',
        paragraphs: [
          'Even 10 minutes of undivided attention weekly lowers rivalry. Label it: "This is our Tuesday walk — just us."',
        ],
      },
      {
        heading: 'Coach repair',
        paragraphs: [
          'After conflict, guide apology and restitution — a drawn picture, helping with a chore — rather than forced hugs.',
        ],
      },
    ],
    30
  ),
  post(
    'Preparing for parent-teacher meetings',
    'parent-teacher-meetings',
    'School',
    'Go in with questions, leave with one clear next step.',
    [
      {
        paragraphs: [
          'Parent-teacher conferences work best as partnerships. Arrive curious, not defensive. Teachers want progress too.',
        ],
      },
      {
        heading: 'Questions worth asking',
        paragraphs: ['What is going well? Where does my child struggle? How can we support the same goals at home?'],
        bullets: [
          'Bring your child\'s perspective without arguing in the room.',
          'Take notes; share summary with your child in age-appropriate language.',
          'Schedule follow-up if concerns are significant.',
        ],
      },
    ],
    32
  ),
  post(
    'Digital safety basics for families',
    'digital-safety-basics',
    'Digital life',
    'Privacy, kindness, and "tell a trusted adult" — the three pillars of online safety.',
    [
      {
        paragraphs: [
          'Safety conversations should start before kids have their own accounts. Frame rules as protection, not mistrust.',
        ],
      },
      {
        heading: 'What to teach early',
        paragraphs: [
          'Never share passwords, home address, or school name publicly. If something feels wrong, stop and tell an adult — no shame.',
        ],
      },
      {
        heading: 'Keep devices in shared spaces',
        paragraphs: [
          'Younger children use tablets and laptops where adults can glance over. Trust grows with demonstrated responsibility.',
        ],
      },
    ],
    34
  ),
  post(
    'Outdoor play in any weather',
    'outdoor-play-weather',
    'Health',
    'Fresh air and movement support focus, sleep, and mood — rain included.',
    [
      {
        paragraphs: [
          'Indoor days stack up in winter. Short outdoor breaks — even 15 minutes — help bodies and brains reset.',
        ],
      },
      {
        heading: 'Gear makes the difference',
        paragraphs: [
          'Proper boots, layers, and rain gear turn "miserable" into "adventure." Keep a go-bag by the door.',
        ],
      },
      {
        heading: 'Neighborhood counts as nature',
        paragraphs: [
          'Sidewalk chalk, puddle walks, and cloud watching are enough. You do not need a forest to get benefits.',
        ],
      },
    ],
    36
  ),
  post(
    'Homework help vs doing it for them',
    'homework-help-balance',
    'School',
    'Guide the process; resist finishing the product.',
    [
      {
        paragraphs: [
          'When guardians complete assignments, teachers lose accurate feedback and kids lose skill-building. Support looks like questions, not answers.',
        ],
      },
      {
        heading: 'Use guiding questions',
        paragraphs: [
          '"What is the question asking?" "Where could we look?" "What is your first step?" These build independence.',
        ],
      },
      {
        heading: 'Know when to stop',
        paragraphs: [
          'If homework exceeds reasonable time nightly, email the teacher. Chronic overload helps no one.',
        ],
      },
    ],
    38
  ),
  post(
    'Test anxiety strategies that work',
    'test-anxiety-strategies',
    'School',
    'Breathing, preparation, and reframing — practical tools before exam day.',
    [
      {
        paragraphs: [
          'Test anxiety is physical as well as mental. Racing heart and blank mind need body-based tools first.',
        ],
      },
      {
        heading: 'Before the test',
        paragraphs: [
          'Practice retrieval — flashcards, practice problems — not just re-reading notes. Sleep and breakfast matter as much as cramming.',
        ],
        bullets: [
          'Teach box breathing: in 4, hold 4, out 4.',
          'Visualize opening the paper calmly.',
          'Remind them: one test does not define them.',
        ],
      },
    ],
    40
  ),
  post(
    'Chores that teach responsibility',
    'chores-responsibility',
    'Home',
    'Start small, stay consistent, and connect chores to belonging — not payment alone.',
    [
      {
        paragraphs: [
          'Chores teach that families share work. Young kids can sort socks, feed pets, and clear plates. Teens can laundry, cook simple meals, and manage trash.',
        ],
      },
      {
        heading: 'Tie chores to community',
        paragraphs: [
          'Frame tasks as "how we take care of our home together" rather than punishment for misbehavior.',
        ],
      },
      {
        heading: 'Allowance is optional',
        paragraphs: [
          'Some families link allowance to chores; others keep them separate so contribution is not negotiable. Choose one model and stick with it.',
        ],
      },
    ],
    42
  ),
  post(
    'Healthy limits on gaming',
    'gaming-limits',
    'Digital life',
    'Games can be social and strategic — boundaries keep them from crowding out sleep and movement.',
    [
      {
        paragraphs: [
          'Not all gaming is harmful. Multiplayer games can build teamwork. Problems arise when gaming replaces sleep, homework, or face-to-face connection.',
        ],
      },
      {
        heading: 'Agree on stop signals',
        paragraphs: [
          'Finish the round, save progress, then stop — written on a family agreement. Sudden shutdowns increase conflict.',
        ],
      },
      {
        heading: 'Watch mood after play',
        paragraphs: [
          'Irritability after sessions may mean overstimulation or late-night play. Adjust timing before banning entirely.',
        ],
      },
    ],
    44
  ),
  post(
    'Back-to-school transitions',
    'back-to-school-transitions',
    'School',
    'Ease the shift with routines, visits, and honest conversations about worries.',
    [
      {
        paragraphs: [
          'New teachers, new rooms, and new expectations stack up. Start adjusting sleep and morning routines a week before school opens.',
        ],
      },
      {
        heading: 'Visit when you can',
        paragraphs: [
          'Walk the route, find lockers, meet teachers at orientation. Familiarity lowers first-day adrenaline.',
        ],
      },
      {
        heading: 'Plan a gentle first week',
        paragraphs: [
          'Light after-school schedule, favorite meals, and extra patience. Learning capacity returns once safety is established.',
        ],
      },
    ],
    46
  ),
  post(
    'Gratitude habits for kids',
    'gratitude-habits',
    'Connection',
    'Simple daily rituals that build perspective without toxic positivity.',
    [
      {
        paragraphs: [
          'Gratitude practice works when it is specific and honest — not forced thank-you performances.',
        ],
      },
      {
        heading: 'Rose, thorn, bud',
        paragraphs: [
          'At dinner, share one good thing (rose), one hard thing (thorn), and one hope (bud). Thorns keep the ritual real.',
        ],
      },
      {
        heading: 'Write it down',
        paragraphs: [
          'A shared jar of notes or a weekly journal page makes gratitude visible over time.',
        ],
      },
    ],
    48
  ),
  post(
    'When to seek a tutor',
    'when-to-get-a-tutor',
    'Learning',
    'Extra support helps when gaps persist despite consistent effort — not when one grade drops.',
    [
      {
        paragraphs: [
          'Tutoring is a tool, not a judgment. It fits when a child works hard but still cannot grasp core concepts, or when confidence collapses in one subject.',
        ],
      },
      {
        heading: 'Signs it may help',
        paragraphs: [
          'Homework takes far longer than peers, tears are frequent, or teachers note missing foundations. Early support prevents wider gaps.',
        ],
      },
      {
        heading: 'Choose the right fit',
        paragraphs: [
          'Look for tutors who build understanding, not just answers. Brief trial sessions reveal rapport.',
        ],
      },
    ],
    50
  ),
  post(
    'Mindfulness for young children',
    'mindfulness-young-children',
    'Wellbeing',
    'Short, playful practices — not silent meditation marathons.',
    [
      {
        paragraphs: [
          'Mindfulness for kids looks like noticing breath, body, and senses. Sessions of one to three minutes are enough for preschool and early elementary ages.',
        ],
      },
      {
        heading: 'Try belly buddy breathing',
        paragraphs: [
          'Place a stuffed animal on the belly; watch it rise and fall. Kids learn diaphragmatic breathing through play.',
        ],
      },
      {
        heading: 'Use everyday anchors',
        paragraphs: [
          'Mindful walking to the mailbox, listening for three sounds on the porch, or tasting the first bite of snack slowly.',
        ],
      },
    ],
    52
  ),
  post(
    'Celebrating effort over grades',
    'effort-over-grades',
    'Growth',
    'Praise what kids control — focus, persistence, strategy — to build lasting motivation.',
    [
      {
        paragraphs: [
          'When guardians celebrate only high grades, kids may avoid challenges to protect their image. Effort praise encourages trying hard things.',
        ],
      },
      {
        heading: 'Replace "You\'re so smart"',
        paragraphs: [
          'Try "You kept working when it was tricky" or "You tried a new strategy." These reinforce growth mindset.',
        ],
      },
      {
        heading: 'Discuss report cards calmly',
        paragraphs: [
          'Ask what they are proud of and what they want to improve. Make a plan together instead of delivering a lecture.',
        ],
      },
    ],
    54
  ),
  post(
    'Co-parenting and school communication',
    'co-parenting-school',
    'Family',
    'Consistent messages to teachers and kids reduce confusion across households.',
    [
      {
        paragraphs: [
          'Separated guardians still share one school story. Align on who attends conferences, how homework travels, and what both homes expect academically.',
        ],
      },
      {
        heading: 'One email thread when possible',
        paragraphs: [
          'Teachers appreciate clear primary contacts. Share summaries with the other guardian so children hear unified support.',
        ],
      },
      {
        heading: 'Keep kids out of the middle',
        paragraphs: [
          'Do not ask children to carry messages about conflict. School issues stay factual and child-focused.',
        ],
      },
    ],
    56
  ),
  post(
    'Teen independence — earning trust gradually',
    'teen-independence',
    'Teens',
    'Freedom with clear checkpoints beats all-or-nothing control.',
    [
      {
        paragraphs: [
          'Teens need practice making decisions while guardians stay available. Micromanagement pushes secrecy; blind trust skips teaching.',
        ],
      },
      {
        heading: 'Negotiate curfews and check-ins',
        paragraphs: [
          'Agree on location sharing, response times, and consequences before issues arise. Written agreements reduce nightly debates.',
        ],
      },
      {
        heading: 'Repair after mistakes',
        paragraphs: [
          'When trust breaks, define how it can be rebuilt with demonstrated responsibility — not permanent punishment.',
        ],
      },
    ],
    58
  ),
  post(
    'Building a calm home learning corner',
    'calm-learning-corner',
    'Home',
    'A dedicated, clutter-free spot signals that learning matters — and helps focus.',
    [
      {
        paragraphs: [
          'Learning corners do not require expensive furniture. A small table, good light, and minimal visual noise are enough.',
        ],
      },
      {
        heading: 'Reduce distractions',
        paragraphs: [
          'Keep TVs and consoles out of sight. Store phones in another room during homework unless truly needed for assignment.',
        ],
        bullets: [
          'Add a plant or calm color — environment affects mood.',
          'Include a timer and supply caddy so setup takes seconds.',
          'Let kids personalize with one poster or photo they choose.',
        ],
      },
      {
        heading: 'Use it for more than homework',
        paragraphs: [
          'Reading, drawing, and puzzles in the same space build positive associations with focused activity.',
        ],
      },
    ],
    60
  ),
]

export const KIDS_BLOG_CATEGORIES: Record<string, string> = Object.fromEntries(
  KIDS_BLOG_POSTS.map((p) => [p.slug, p.category])
)
