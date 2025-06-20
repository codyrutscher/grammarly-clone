import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, ArrowLeft, BookOpen, PenTool, GraduationCap } from 'lucide-react';
import { SignupPage } from './SignupPage';
import { useNavigate } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Ultimate Guide to Writing Essays Under Pressure: A Student\'s Survival Kit',
    excerpt: 'Learn how to tackle last-minute essays with confidence and produce quality work even when time is running out.',
    content: `As a student, we've all been there – staring at a blank document at 2 AM with an essay due in the morning. While procrastination isn't ideal, sometimes life happens. Here's your survival guide for writing essays under pressure.

**1. Don't Panic – Create a Quick Plan**
Take 10 minutes to outline your essay. Even under pressure, a basic structure will save you time and prevent rambling.

**2. Use the Pomodoro Technique**
Work in 25-minute focused bursts with 5-minute breaks. This keeps your mind sharp and prevents burnout.

**3. Start with What You Know**
Begin with the points you're most confident about. This builds momentum and confidence.

**4. Use AI Tools Wisely**
Tools like StudyWrite can help catch grammar errors and suggest improvements while you focus on content.

**5. Edit as You Go**
Don't wait until the end to proofread. Quick fixes during writing prevent major revision sessions later.

**6. Embrace "Good Enough"**
Perfect is the enemy of done. Aim for a solid B+ paper rather than getting stuck trying to write an A+ masterpiece.

**7. Have a Backup Plan**
Always have your sources ready and know your professor's extension policy. Sometimes asking for help is better than submitting poor work.

Remember: The best essay is the one that gets submitted. These pressure situations also teach valuable skills like working under deadlines and prioritizing – skills you'll use throughout your career.`,
    author: 'Sarah Chen',
    date: '2024-01-15',
    readTime: '6 min read',
    category: 'Study Tips',
    tags: ['essay writing', 'time management', 'study tips']
  },
  {
    id: '2',
    title: 'Why Grammar Actually Matters (And It\'s Not Just Your English Teacher Being Picky)',
    excerpt: 'Discover how proper grammar impacts your academic success, career prospects, and personal credibility.',
    content: `"Grammar doesn't matter as long as people understand what I mean." If you've ever thought this, you're not alone – but you might be surprised by how much grammar actually impacts your success as a student and beyond.

**The Academic Reality Check**
Professors notice grammar errors, and they affect your grades more than you think. A study by the University of Michigan found that papers with frequent grammar errors received grades 10-15% lower than grammatically correct papers with similar content.

**First Impressions Matter**
Your writing is often the first impression you make on professors, potential employers, and colleagues. Poor grammar can overshadow brilliant ideas.

**It's About Clarity, Not Perfection**
Good grammar isn't about following arbitrary rules – it's about clear communication. When your grammar is off, your readers spend mental energy decoding your message instead of engaging with your ideas.

**The Career Connection**
LinkedIn research shows that professionals with error-free profiles receive 14% more profile views. In job applications, 58% of hiring managers say they immediately discarded resumes with grammar errors.

**Building Confidence**
When you're confident in your grammar, you're more likely to participate in class discussions, send emails to professors, and apply for opportunities. It's a confidence multiplier.

**The Good News**
You don't need to memorize every grammar rule. Focus on the most common errors:
- Subject-verb agreement
- Comma usage
- Apostrophes
- Run-on sentences
- Homophones (there/their/they're)

Tools like StudyWrite can help catch these errors while you focus on developing your ideas. Think of grammar as the foundation that lets your brilliant thoughts shine through clearly.`,
    author: 'Marcus Rodriguez',
    date: '2024-01-12',
    readTime: '5 min read',
    category: 'Writing Skills',
    tags: ['grammar', 'writing skills', 'academic success']
  },
  {
    id: '3',
    title: 'From Procrastination to Productivity: How I Finally Conquered My Writing Anxiety',
    excerpt: 'A personal journey of overcoming writing anxiety and developing a sustainable writing routine that actually works.',
    content: `Two years ago, I would rather clean my entire dorm room than start a writing assignment. The blank page felt like a judgment, and every sentence I wrote seemed terrible. If this sounds familiar, you're not alone – and there is hope.

**Understanding Writing Anxiety**
Writing anxiety isn't just "being lazy." It's a real psychological response that can include:
- Perfectionism paralysis
- Fear of judgment
- Imposter syndrome
- Overwhelm with the writing process

**My Breakthrough Moment**
Everything changed when I realized I was trying to write and edit simultaneously. I was critiquing every sentence as I wrote it, which made writing feel impossible.

**The Strategies That Actually Worked**

**1. Separate Writing from Editing**
I now write terrible first drafts on purpose. My only goal is getting ideas on paper. The editing comes later.

**2. The 15-Minute Rule**
I commit to writing for just 15 minutes. Usually, I keep going, but even if I don't, I've made progress.

**3. Change Your Environment**
I discovered I write better in the library's quiet study rooms than in my chaotic dorm. Find your ideal writing space.

**4. Write Before You Research**
I now write what I already know first, then research to fill gaps. This prevents research from becoming procrastination.

**5. Use Technology as a Safety Net**
Tools like StudyWrite help me worry less about grammar and spelling, so I can focus on ideas.

**6. Celebrate Small Wins**
Every paragraph completed is progress. I learned to acknowledge these victories instead of focusing on what's left to do.

**The Mindset Shift**
I stopped viewing writing as a test of my intelligence and started seeing it as a conversation with my reader. This single shift reduced my anxiety by 80%.

**Your Writing Anxiety Toolkit**
- Start with brain dumps, not perfect sentences
- Set tiny, achievable goals
- Write at your peak energy time
- Find an accountability partner
- Remember: every writer struggles with the blank page

Writing anxiety is conquerable. You don't need to eliminate it completely – you just need to work with it instead of against it.`,
    author: 'Emma Thompson',
    date: '2024-01-10',
    readTime: '7 min read',
    category: 'Mental Health',
    tags: ['writing anxiety', 'productivity', 'mental health', 'study habits']
  },
  {
    id: '4',
    title: 'The Art of Academic Research: Finding Sources That Don\'t Suck',
    excerpt: 'Master the skill of finding credible, relevant sources that will actually strengthen your arguments.',
    content: `Let's be honest – most of us have been guilty of using the first three Google results for our research papers. But finding quality sources doesn't have to be a nightmare, and it can actually make your writing so much stronger.

**Why Source Quality Matters**
Your arguments are only as strong as the evidence supporting them. Weak sources = weak papers, regardless of how well you write.

**The Source Hierarchy (From Best to Worst)**

**Tier 1: Peer-Reviewed Academic Sources**
- Scholarly journals
- Academic books
- Conference proceedings
- University press publications

**Tier 2: Professional and Government Sources**
- Government reports and statistics
- Professional organization publications
- Established news organizations
- Think tank reports

**Tier 3: General Sources (Use Sparingly)**
- General websites
- Blogs (unless from recognized experts)
- Wikipedia (great for background, terrible for citations)

**Research Strategies That Actually Work**

**1. Start with Your Library's Database**
Your tuition pays for access to amazing databases. Use them! JSTOR, ProQuest, and subject-specific databases are goldmines.

**2. Use Google Scholar Strategically**
It's like Google, but for academic sources. Pro tip: Look for sources with high citation counts.

**3. Follow the Citation Trail**
Found one great source? Check its bibliography for more gems. Academic sources often cite the best work in their field.

**4. Use Keywords Like a Pro**
Instead of searching "climate change effects," try "anthropogenic climate change impacts" or "global warming consequences." Academic language gets better results.

**5. Check the Date**
For most topics, sources older than 10 years are getting stale. For rapidly changing fields like technology, stick to the last 5 years.

**Red Flags to Avoid**
- No author listed
- No publication date
- Extreme bias or emotional language
- No citations or references
- Websites ending in .com for academic topics

**The 15-Minute Source Evaluation**
For each source, ask:
1. Who wrote this and what are their credentials?
2. When was it published?
3. What's the publication's reputation?
4. Does it cite other credible sources?
5. Is the tone professional and objective?

**Making Research Easier**
- Use citation managers like Zotero or Mendeley
- Take notes as you read, not after
- Save PDFs with descriptive filenames
- Create a research log to track what you've searched

Remember: Good research takes time upfront but saves hours of revision later. Your professors can tell the difference between a paper backed by solid sources and one thrown together from random websites.`,
    author: 'David Park',
    date: '2024-01-08',
    readTime: '8 min read',
    category: 'Research Skills',
    tags: ['research', 'academic sources', 'study skills', 'citations']
  },
  {
    id: '5',
    title: 'Peer Review That Actually Helps: How to Give and Receive Feedback Like a Pro',
    excerpt: 'Transform peer review from awkward obligation into a powerful tool for improving your writing.',
    content: `Peer review sessions often feel like awkward encounters where everyone says "looks good" and calls it a day. But when done right, peer review can dramatically improve your writing and help you develop critical thinking skills.

**Why Peer Review Often Fails**
- Fear of hurting feelings
- Not knowing what to look for
- Focusing only on grammar and spelling
- Giving vague feedback like "good job"

**The Mindset Shift**
Think of peer review as collaborative problem-solving, not criticism. You're helping each other become better writers.

**How to Give Helpful Feedback**

**1. Read the Whole Piece First**
Get the big picture before diving into details. What is the writer trying to accomplish?

**2. Focus on Higher-Order Concerns First**
- Is the thesis clear and arguable?
- Does the evidence support the claims?
- Is the organization logical?
- Are there gaps in reasoning?

**3. Use the "I" Statement Technique**
Instead of "This paragraph is confusing," try "I'm having trouble following the connection between these two ideas."

**4. Be Specific**
Instead of "needs more detail," say "Can you provide an example of what you mean by 'significant impact'?"

**5. Ask Questions**
"What evidence supports this claim?" or "How does this paragraph connect to your thesis?"

**How to Receive Feedback Like a Champion**

**1. Don't Defend – Listen**
Your first instinct might be to explain what you meant, but if readers are confused, that's valuable information.

**2. Look for Patterns**
If multiple readers mention the same issue, it's probably worth addressing.

**3. Consider the Source**
Is this feedback coming from someone in your target audience? Weight it accordingly.

**4. You Don't Have to Use Every Suggestion**
Feedback is data, not commands. Use what serves your purpose.

**The Peer Review Checklist**

**Big Picture Questions:**
- What is the main argument?
- Is it convincing?
- What questions do I still have?

**Organization:**
- Does the introduction hook me and preview the argument?
- Do paragraphs flow logically?
- Does the conclusion feel satisfying?

**Evidence and Analysis:**
- Are claims supported with evidence?
- Is the analysis clear and thorough?
- Are counterarguments addressed?

**Clarity:**
- Are there confusing sentences?
- Is the tone appropriate for the audience?
- Are technical terms explained?

**Creating a Positive Peer Review Culture**
- Start with what's working well
- Ask permission before giving major feedback
- Focus on the writing, not the writer
- Offer specific suggestions, not just problems

**Digital Tools for Better Peer Review**
- Google Docs for collaborative commenting
- StudyWrite for catching technical errors
- Slack or Discord for ongoing discussion

Remember: The goal isn't to tear apart someone's work – it's to help them communicate their ideas more effectively. Good peer review makes everyone a better writer and critical thinker.`,
    author: 'Aisha Patel',
    date: '2024-01-05',
    readTime: '6 min read',
    category: 'Collaboration',
    tags: ['peer review', 'feedback', 'collaboration', 'writing improvement']
  },
  {
    id: '6',
    title: 'Citation Styles Decoded: MLA, APA, Chicago, and When to Use What',
    excerpt: 'Finally understand the differences between citation styles and master the one you need most.',
    content: `If you've ever wondered why we have so many citation styles and when to use which one, you're not alone. Here's your guide to the big three citation styles and how to choose the right one.

**Why Do Citation Styles Exist?**
Different academic disciplines have different needs. Scientists want publication dates upfront (hence APA), while literature scholars care more about page numbers for quotes (hello, MLA).

**MLA (Modern Language Association)**

**When to Use:** English, literature, foreign languages, and other humanities courses.

**Key Features:**
- Author-page number in-text citations: (Smith 45)
- Works Cited page (not References or Bibliography)
- Minimal punctuation in citations
- Present tense when discussing literature

**Example:**
In-text: According to Smith, "writing is thinking on paper" (23).
Works Cited: Smith, John. *The Art of Writing*. University Press, 2023.

**APA (American Psychological Association)**

**When to Use:** Psychology, social sciences, education, and some business courses.

**Key Features:**
- Author-date in-text citations: (Smith, 2023)
- References page
- Emphasis on publication dates
- Past tense for research findings

**Example:**
In-text: Smith (2023) argued that writing improves critical thinking.
References: Smith, J. (2023). *The psychology of writing*. Academic Press.

**Chicago Style**

**When to Use:** History, philosophy, religion, and some literature courses.

**Key Features:**
- Two systems: Notes-Bibliography and Author-Date
- Footnotes or endnotes for citations
- More detailed publication information

**Example:**
Footnote: ¹John Smith, *Historical Writing Methods* (Chicago: University Press, 2023), 45.

**Quick Decision Guide**

**Choose MLA if:**
- You're analyzing literature or texts
- Your professor assigns it (obviously)
- You're in a humanities course

**Choose APA if:**
- You're citing scientific research
- You're in psychology, education, or social sciences
- You're writing about current research findings

**Choose Chicago if:**
- You're writing history papers
- Your professor specifically requests it
- You're doing archival research

**Common Mistakes to Avoid**

**1. Mixing Styles**
Pick one style and stick with it throughout your paper.

**2. Forgetting In-Text Citations**
Every source in your bibliography needs to be cited in your text.

**3. Inconsistent Formatting**
Pay attention to punctuation, capitalization, and spacing.

**4. Wrong Information**
Double-check author names, publication dates, and page numbers.

**Tools to Make Citations Easier**
- Zotero or Mendeley for automatic citation generation
- Purdue OWL for style guides
- EasyBib or Citation Machine for quick citations
- StudyWrite for catching citation formatting errors

**Pro Tips**
- Always check your professor's preferences first
- When in doubt, ask your librarian
- Keep track of sources as you research, not after
- Learn one style really well before tackling others

**The Big Picture**
Citation styles might seem arbitrary, but they're tools for clear communication within academic communities. Master the one you use most, and the others will become easier to learn.

Remember: The goal of citations isn't to torture students – it's to give credit where it's due and help readers find your sources. Once you understand that purpose, the rules start making more sense.`,
    author: 'Jordan Kim',
    date: '2024-01-03',
    readTime: '7 min read',
    category: 'Academic Skills',
    tags: ['citations', 'MLA', 'APA', 'Chicago', 'academic writing']
  },
  {
    id: '7',
    title: 'The Science of Productive Study Sessions: What Actually Works',
    excerpt: 'Evidence-based strategies for studying more effectively and retaining information longer.',
    content: `Forget everything you think you know about studying. Most "common sense" study advice is actually counterproductive. Here's what science tells us about learning effectively.

**The Myths We Need to Bust**

**Myth 1: Longer Study Sessions Are Better**
Reality: Your brain's attention span peaks at about 25-45 minutes. After that, you're just going through the motions.

**Myth 2: Highlighting and Re-reading Work**
Reality: These create the illusion of learning without actual retention. You feel productive, but you're not actually learning.

**Myth 3: You Should Study in the Same Place Every Time**
Reality: Varying your study locations actually improves retention by creating multiple retrieval cues.

**What Actually Works: Evidence-Based Strategies**

**1. Spaced Repetition**
Review material at increasing intervals: 1 day, 3 days, 1 week, 2 weeks, 1 month. This fights the forgetting curve.

**2. Active Recall**
Instead of re-reading notes, test yourself. Close your book and try to explain the concept out loud. This is uncomfortable but incredibly effective.

**3. The Feynman Technique**
Explain concepts in simple terms as if teaching a child. If you can't simplify it, you don't really understand it.

**4. Interleaving**
Mix different types of problems or topics in one study session instead of focusing on one thing. This improves your ability to distinguish between concepts.

**5. Elaborative Interrogation**
Ask yourself "why" and "how" questions about the material. Connect new information to what you already know.

**The Optimal Study Session Structure**

**Before You Start (5 minutes):**
- Clear your space of distractions
- Set a specific goal for the session
- Have water and a snack ready

**The Session (25-45 minutes):**
- Start with the most challenging material
- Take notes by hand, not laptop
- Use active recall techniques
- Ask yourself questions about the material

**Break Time (10-15 minutes):**
- Move your body
- Get fresh air if possible
- Avoid screens and social media
- Hydrate

**Repeat 2-3 cycles, then take a longer break**

**The Environment That Boosts Learning**

**Temperature:** Slightly cool (68-72°F) keeps you alert
**Lighting:** Natural light when possible, bright artificial light otherwise
**Sound:** Silence or instrumental music; lyrics distract from verbal learning
**Seating:** Comfortable but not too comfortable; you want to stay alert

**Technology: Friend or Foe?**

**Helpful Tech:**
- Apps like Anki for spaced repetition
- Forest or Freedom for blocking distractions
- StudyWrite for checking your written work
- Noise-canceling headphones

**Harmful Tech:**
- Social media (obviously)
- Notifications from any app
- YouTube "study with me" videos with chat
- Multitasking between study and entertainment

**The Recovery Protocol**
What you do after studying matters too:
- Sleep within 3 hours of learning for memory consolidation
- Light exercise helps with retention
- Avoid alcohol, which impairs memory formation
- Review material right before sleep

**Measuring Your Progress**
Track these metrics:
- How much you can recall without looking at notes
- How quickly you can solve practice problems
- How well you can explain concepts to others
- Your performance on practice tests

**The 80/20 Rule for Studying**
Focus 80% of your time on active techniques (recall, practice problems, teaching others) and only 20% on passive techniques (reading, highlighting, listening to lectures).

Remember: Studying harder isn't always better. Studying smarter, based on how your brain actually learns, will get you better results with less stress and time investment.`,
    author: 'Dr. Lisa Chang',
    date: '2024-01-01',
    readTime: '9 min read',
    category: 'Study Science',
    tags: ['study techniques', 'learning science', 'productivity', 'memory']
  },
  {
    id: '8',
    title: 'Digital Note-Taking Revolution: Apps, Methods, and What Actually Works',
    excerpt: 'Navigate the world of digital note-taking tools and find the system that works for your learning style.',
    content: `The note-taking landscape has exploded with digital options, but more choices don't always mean better results. Here's how to choose and use digital note-taking tools effectively.

**The Great Debate: Digital vs. Handwritten**

**Science Says:** Handwriting activates different brain regions and generally leads to better comprehension and retention. But digital notes have advantages too.

**When Digital Wins:**
- Searchable notes across all subjects
- Easy to share and collaborate
- Multimedia integration (images, audio, links)
- Backup and sync across devices
- Faster typing for lengthy lectures

**When Handwritten Wins:**
- Better retention for complex concepts
- No battery or tech failures
- Easier to draw diagrams and equations
- Less temptation for distractions
- Better for visual learners

**The Digital Note-Taking Landscape**

**Notion: The Swiss Army Knife**
*Best for:* Students who want everything in one place
*Pros:* Databases, templates, project management
*Cons:* Steep learning curve, can be overwhelming
*Student verdict:* "Powerful but takes time to set up properly"

**Obsidian: The Knowledge Web**
*Best for:* Students who love connecting ideas
*Pros:* Linking between notes, graph view, plugins
*Cons:* Complex interface, requires setup time
*Student verdict:* "Amazing for research projects and thesis work"

**OneNote: The Digital Binder**
*Best for:* Students who want familiar organization
*Pros:* Free, integrates with Office, good handwriting support
*Cons:* Can be slow, limited formatting options
*Student verdict:* "Reliable but not exciting"

**Roam Research: The Thought Processor**
*Best for:* Students doing research or creative work
*Pros:* Bi-directional linking, daily notes, block references
*Cons:* Expensive, steep learning curve
*Student verdict:* "Life-changing if you stick with it"

**Apple Notes/Google Keep: The Simple Solutions**
*Best for:* Students who want quick and easy
*Pros:* Fast, syncs everywhere, voice notes
*Cons:* Limited organization, basic formatting
*Student verdict:* "Perfect for quick thoughts, limited for serious study"

**The Hybrid Approach That Actually Works**

Many successful students use a combination:
- **Handwritten notes during lectures** (better retention)
- **Digital notes for research** (searchable, linkable)
- **Apps for quick capture** (voice memos, photos of whiteboards)
- **Digital tools for review** (flashcards, spaced repetition)

**Note-Taking Methods That Work Digitally**

**1. The Cornell Method (Digital Version)**
Create templates with sections for:
- Main notes (right column)
- Keywords/questions (left column)
- Summary (bottom)

**2. The Outline Method**
Use bullet points and indentation:
- Main topic
  - Subtopic
    - Supporting detail
    - Another detail
  - Another subtopic

**3. The Mapping Method**
Use mind mapping apps like MindMeister or XMind to create visual connections between concepts.

**4. The Charting Method**
Create tables to compare information:
| Theory | Key Points | Examples | Criticisms |

**Optimization Tips for Digital Notes**

**1. Develop a Consistent Naming System**
Example: "PSYC101_Week3_LearningTheories_2024-01-15"

**2. Use Tags Strategically**
Create a tagging system: #exam, #assignment, #review, #important

**3. Link Related Notes**
Connect related concepts across different subjects and time periods.

**4. Regular Review and Cleanup**
Schedule weekly sessions to organize and review your notes.

**5. Backup Everything**
Use cloud storage and export important notes regularly.

**The Mobile Note-Taking Strategy**

For capturing ideas on the go:
- Voice recordings for complex thoughts
- Photos of interesting articles or whiteboards
- Quick text notes for sudden insights
- Location-based reminders for context

**Common Digital Note-Taking Mistakes**

**1. App Hopping**
Constantly switching between apps instead of mastering one system.

**2. Over-Organization**
Spending more time organizing than actually studying.

**3. Digital Hoarding**
Saving everything without reviewing or processing.

**4. Ignoring Handwriting Benefits**
Going completely digital when handwriting would be more effective.

**5. No Backup Strategy**
Losing months of work due to app failures or account issues.

**The Bottom Line**
The best note-taking system is the one you'll actually use consistently. Start simple, experiment gradually, and remember that the goal is learning, not having the perfect digital setup.

Consider starting with a basic app and upgrading as your needs become clearer. And don't forget – sometimes a simple pen and paper is still the best tool for the job.`,
    author: 'Alex Rivera',
    date: '2023-12-28',
    readTime: '8 min read',
    category: 'Digital Tools',
    tags: ['note-taking', 'digital tools', 'apps', 'productivity', 'study methods']
  },
  {
    id: '9',
    title: 'Group Projects That Don\'t Suck: A Student\'s Guide to Collaborative Success',
    excerpt: 'Transform group projects from dreaded assignments into opportunities for learning and networking.',
    content: `Group projects have a terrible reputation among students, and honestly, it's often deserved. But when done right, they can be some of the most valuable learning experiences in college. Here's how to make them work.

**Why Group Projects Exist (And Why Professors Love Them)**
- Real-world work is collaborative
- Different perspectives improve outcomes
- Teaches project management skills
- Develops communication abilities
- Prepares you for team-based careers

**The Common Group Project Disasters**

**The Ghost:** Disappears after the first meeting, resurfaces the day before it's due
**The Controller:** Wants to do everything themselves, then complains about workload
**The Procrastinator:** Always has excuses, creates stress for everyone
**The Perfectionist:** Holds up progress with endless revisions
**The Free Rider:** Contributes minimally but expects equal credit

**Setting Your Group Up for Success**

**1. Establish Ground Rules Early**
In your first meeting, discuss:
- Communication preferences (email, Slack, text)
- Meeting frequency and format
- Response time expectations
- Quality standards
- Consequences for not meeting deadlines

**2. Create a Team Charter**
Document your agreements:
- Project goals and vision
- Individual roles and responsibilities
- Timeline with milestones
- Decision-making process
- Conflict resolution plan

**3. Choose Roles Based on Strengths**
Common roles:
- Project Manager (coordinates, tracks progress)
- Researcher (finds and evaluates sources)
- Writer (drafts and edits content)
- Designer (handles visuals and formatting)
- Presenter (leads presentation preparation)

**Communication Strategies That Work**

**Regular Check-ins**
Schedule brief weekly meetings (even 15 minutes) to:
- Share progress updates
- Identify roadblocks
- Adjust timelines if needed
- Maintain accountability

**Digital Collaboration Tools**
- **Slack or Discord:** Real-time communication
- **Google Workspace:** Collaborative documents
- **Trello or Asana:** Project management
- **Calendly:** Easy meeting scheduling
- **StudyWrite:** Collaborative editing and feedback

**The "No Surprises" Rule**
If you're struggling with your part, communicate early. It's better to ask for help or extension than to let the team down at the last minute.

**Dealing with Problem Team Members**

**The Diplomatic Approach:**
1. Address issues privately first
2. Focus on behaviors, not personality
3. Offer solutions, not just complaints
4. Document conversations

**Sample Conversation:**
"Hey [Name], I noticed you missed our last two meetings. Is everything okay? We really need your input on the research section. Can we find a time that works better for you?"

**When to Involve the Professor**
- Repeated failure to communicate
- Significantly unequal contribution
- Disrespectful or unprofessional behavior
- Academic dishonesty

**Managing Different Work Styles**

**Early Birds vs. Night Owls**
Use asynchronous communication and flexible deadlines when possible.

**Detail-Oriented vs. Big Picture**
Assign detail people to editing and fact-checking, big picture people to planning and vision.

**Introverts vs. Extroverts**
Give introverts time to process before meetings, let extroverts talk through ideas.

**Quality Control Strategies**

**1. Peer Review Process**
Everyone reviews everyone else's work before submission.

**2. Integration Sessions**
Meet to combine individual parts and ensure consistency.

**3. Practice Presentations**
Run through presentations multiple times with feedback.

**4. Final Quality Check**
Designate one person to do a final review of the entire project.

**Presentation Best Practices**

**Preparation:**
- Rehearse transitions between speakers
- Time your presentation accurately
- Prepare for potential questions
- Have backup plans for technical issues

**During the Presentation:**
- Introduce all team members
- Acknowledge individual contributions
- Present as a unified team
- Support each other during Q&A

**Learning from the Experience**

**After the project, reflect on:**
- What worked well?
- What would you do differently?
- What skills did you develop?
- How can you be a better team member next time?

**Building Your Network**
Good group project partners often become:
- Study partners for other classes
- Professional connections
- Friends and collaborators
- References for jobs and internships

**The Long-Term Perspective**
Group projects teach skills you'll use throughout your career:
- Project management
- Conflict resolution
- Cross-functional collaboration
- Leadership and followership
- Communication across different styles

Remember: The goal isn't just to get a good grade – it's to develop the collaborative skills that will make you valuable in any career. Approach group projects as opportunities to practice these skills in a relatively low-stakes environment.

When you encounter difficult team members, think of it as practice for dealing with challenging colleagues in your future job. The patience and diplomacy you develop now will serve you well later.`,
    author: 'Taylor Johnson',
    date: '2023-12-25',
    readTime: '10 min read',
    category: 'Collaboration',
    tags: ['group projects', 'teamwork', 'collaboration', 'communication', 'project management']
  },
  {
    id: '10',
    title: 'The Hidden Psychology of Procrastination: Why We Do It and How to Beat It',
    excerpt: 'Understand the real reasons behind procrastination and develop strategies that actually work long-term.',
    content: `Procrastination isn't a character flaw or a time management problem – it's an emotional regulation issue. Once you understand the psychology behind it, you can develop strategies that actually work.

**The Procrastination Paradox**
We procrastinate on things that are important to us, not things we don't care about. The more something matters, the more likely we are to avoid it. Why? Because the stakes feel higher.

**The Real Reasons We Procrastinate**

**1. Fear of Failure**
"If I don't try my best, I can't really fail." This protects our ego but sabotages our success.

**2. Fear of Success**
Success brings expectations and responsibilities. Sometimes failure feels safer.

**3. Perfectionism**
"If I can't do it perfectly, why start?" This all-or-nothing thinking paralyzes action.

**4. Task Aversion**
The task feels boring, difficult, or overwhelming, so we avoid the negative emotions associated with it.

**5. Lack of Self-Efficacy**
"I don't think I can do this well, so why try?" Low confidence becomes a self-fulfilling prophecy.

**The Procrastination Cycle**

1. **Avoidance:** We delay starting the task
2. **Guilt:** We feel bad about not starting
3. **Increased Pressure:** Deadline approaches, stress increases
4. **Crisis Mode:** We rush to complete the task
5. **Relief:** Task is done, but quality suffered
6. **Reinforcement:** We "succeeded" despite procrastinating, reinforcing the pattern

**Breaking the Cycle: Strategies That Actually Work**

**1. The Two-Minute Rule**
If something takes less than two minutes, do it now. For bigger tasks, commit to just two minutes of work. Often, starting is the hardest part.

**2. Implementation Intentions**
Instead of "I'll work on my essay," say "After I finish breakfast on Tuesday, I'll spend 30 minutes outlining my essay in the library."

**3. Temptation Bundling**
Pair a task you need to do with something you enjoy. "I can only listen to my favorite podcast while doing research for my paper."

**4. The Pomodoro Technique**
Work for 25 minutes, then take a 5-minute break. This makes large tasks feel manageable.

**5. Environmental Design**
Make it easier to do the right thing and harder to do the wrong thing. Study in the library where you can't access your gaming console.

**Cognitive Strategies for Procrastination**

**Reframe Your Self-Talk:**
- Instead of "I have to," say "I choose to"
- Instead of "I should," say "I want to"
- Instead of "This is terrible," say "This is challenging"

**Use the 10-10-10 Rule:**
How will you feel about this decision in 10 minutes, 10 months, and 10 years?

**Practice Self-Compassion:**
Treat yourself with the same kindness you'd show a good friend. Self-criticism fuels procrastination.

**The Emotional Regulation Approach**

**Identify Your Procrastination Triggers:**
- What emotions come up when you think about the task?
- What time of day do you procrastinate most?
- What environments make procrastination more likely?

**Develop Coping Strategies:**
- Deep breathing for anxiety
- Movement breaks for restlessness
- Social support for isolation
- Rewards for motivation

**The "Good Enough" Philosophy**
Perfect is the enemy of done. Aim for "good enough" first drafts that you can improve later.

**Technology and Procrastination**

**Helpful Apps:**
- Forest (gamifies focus time)
- Freedom (blocks distracting websites)
- RescueTime (tracks how you spend time)
- StudyWrite (makes writing less intimidating)

**Digital Minimalism:**
- Turn off non-essential notifications
- Use website blockers during work time
- Keep your phone in another room
- Create separate user accounts for work and play

**The Social Dimension**

**Body Doubling:**
Work alongside others, even if you're doing different tasks. The presence of others can increase accountability.

**Accountability Partners:**
Regular check-ins with someone who cares about your success.

**Study Groups:**
Even if you're working on individual projects, being around productive people is motivating.

**Long-Term Strategies**

**Build Systems, Not Goals:**
Instead of "I want to write better," create a system: "I write for 30 minutes every morning after coffee."

**Track Leading Indicators:**
Don't just track outcomes (grades), track behaviors (hours studied, drafts completed).

**Celebrate Small Wins:**
Acknowledge progress, not just completion. This builds momentum and positive associations.

**When to Seek Help**
If procrastination is significantly impacting your academic performance, relationships, or mental health, consider:
- Counseling services at your school
- Academic coaching
- Time management workshops
- Therapy for underlying anxiety or depression

**The Bigger Picture**
Procrastination often signals that something deeper is going on – perfectionism, fear, overwhelm, or lack of clarity about your goals. Address these root causes, and the procrastination often resolves naturally.

Remember: You're not lazy or broken. You're human, dealing with complex emotions around performance and self-worth. Be patient with yourself as you develop new habits and ways of thinking.

The goal isn't to never procrastinate again – it's to procrastinate less and recover more quickly when you do. Progress, not perfection.`,
    author: 'Dr. Michael Chen',
    date: '2023-12-22',
    readTime: '11 min read',
    category: 'Psychology',
    tags: ['procrastination', 'psychology', 'productivity', 'mental health', 'self-improvement']
  }
];

export default function BlogPage() {
  const [showSignupPage, setShowSignupPage] = useState(false);

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <button className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6" onClick={handleClick}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to StudyWrite
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              StudyWrite Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Writing tips, study strategies, and academic insights from a student's perspective
            </p>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                {/* Category Badge */}
                <div className="flex items-center mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {post.category === 'Study Tips' && <BookOpen className="w-3 h-3 mr-1" />}
                    {post.category === 'Writing Skills' && <PenTool className="w-3 h-3 mr-1" />}
                    {post.category === 'Academic Skills' && <GraduationCap className="w-3 h-3 mr-1" />}
                    {!['Study Tips', 'Writing Skills', 'Academic Skills'].includes(post.category) && <BookOpen className="w-3 h-3 mr-1" />}
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  <Link
                    to={`/blog/${post.id}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {post.readTime}
                  </span>
                  <Link
                    to={`/blog/${post.id}`}
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-50 dark:bg-blue-900/20 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Improve Your Writing?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of students who are already writing better with StudyWrite's AI-powered assistance.
          </p>
          <button
            onClick={() => setShowSignupPage(true)}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupPage
        isOpen={showSignupPage}
        onClose={() => setShowSignupPage(false)}
        onSwitchToLogin={() => setShowSignupPage(false)}
      />
    </div>
  );
} 