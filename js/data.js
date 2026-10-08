const DB = (() => {
  const KEYS = {
    users: 'gabbyblog_users',
    currentUser: 'gabbyblog_current_user',
    posts: 'gabbyblog_posts',
    comments: 'gabbyblog_comments',
    likes: 'gabbyblog_likes',
    commentLikes: 'gabbyblog_comment_likes',
    savedPosts: 'gabbyblog_saved_posts',
    followers: 'gabbyblog_followers',
    notifications: 'gabbyblog_notifications',
    drafts: 'gabbyblog_drafts',
    settings: 'gabbyblog_settings',
    views: 'gabbyblog_views',
    seeded: 'gabbyblog_seeded'
  };

  function read(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function getUsers() { return read(KEYS.users) || []; }
  function saveUsers(users) { write(KEYS.users, users); }

  function getUserById(id) { return getUsers().find(u => u.id === id) || null; }
  function getUserByEmail(email) { return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null; }
  function getUserByUsername(username) { return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase()) || null; }

  function createUser(userData) {
    const users = getUsers();
    const user = { ...userData, id: Utils.generateId(), createdAt: new Date().toISOString() };
    users.push(user);
    saveUsers(users);
    return user;
  }

  function updateUser(id, updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
    saveUsers(users);
    return users[idx];
  }

  function getCurrentUser() { return read(KEYS.currentUser); }
  function setCurrentUser(user) { write(KEYS.currentUser, user); }
  function clearCurrentUser() { localStorage.removeItem(KEYS.currentUser); }

  function getPosts() { return read(KEYS.posts) || []; }
  function savePosts(posts) { write(KEYS.posts, posts); }

  function getPostById(id) { return getPosts().find(p => p.id === id) || null; }

  function getPublishedPosts() {
    return getPosts()
      .filter(p => p.status === 'published')
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }

  function getPostsByUser(userId) {
    return getPosts()
      .filter(p => p.authorId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function getPublishedPostsByUser(userId) {
    return getPosts()
      .filter(p => p.authorId === userId && p.status === 'published')
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }

  function createPost(postData) {
    const posts = getPosts();
    const post = { ...postData, id: Utils.generateId(), createdAt: new Date().toISOString() };
    posts.push(post);
    savePosts(posts);
    return post;
  }

  function updatePost(id, updates) {
    const posts = getPosts();
    const idx = posts.findIndex(p => p.id === id);
    if (idx === -1) return null;
    posts[idx] = { ...posts[idx], ...updates, updatedAt: new Date().toISOString() };
    savePosts(posts);
    return posts[idx];
  }

  function deletePost(id) {
    const posts = getPosts().filter(p => p.id !== id);
    savePosts(posts);
    const comments = getComments().filter(c => c.postId !== id);
    saveComments(comments);
    const likes = getLikes().filter(l => l.postId !== id);
    saveLikes(likes);
    const saved = getSavedPosts().filter(s => s.postId !== id);
    saveSavedPosts(saved);
  }

  function getComments() { return read(KEYS.comments) || []; }
  function saveComments(comments) { write(KEYS.comments, comments); }

  function getCommentsByPost(postId) {
    return getComments()
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  function createComment(commentData) {
    const comments = getComments();
    const comment = { ...commentData, id: Utils.generateId(), createdAt: new Date().toISOString() };
    comments.push(comment);
    saveComments(comments);
    return comment;
  }

  function updateComment(id, updates) {
    const comments = getComments();
    const idx = comments.findIndex(c => c.id === id);
    if (idx === -1) return null;
    comments[idx] = { ...comments[idx], ...updates, updatedAt: new Date().toISOString() };
    saveComments(comments);
    return comments[idx];
  }

  function deleteComment(id) {
    const comments = getComments().filter(c => c.id !== id && c.parentId !== id);
    saveComments(comments);
    const commentLikes = getCommentLikes().filter(l => l.commentId !== id);
    saveCommentLikes(commentLikes);
  }

  function getLikes() { return read(KEYS.likes) || []; }
  function saveLikes(likes) { write(KEYS.likes, likes); }

  function isPostLikedBy(postId, userId) {
    return getLikes().some(l => l.postId === postId && l.userId === userId);
  }

  function getPostLikeCount(postId) {
    return getLikes().filter(l => l.postId === postId).length;
  }

  function togglePostLike(postId, userId) {
    const likes = getLikes();
    const idx = likes.findIndex(l => l.postId === postId && l.userId === userId);
    if (idx === -1) {
      likes.push({ id: Utils.generateId(), postId, userId, createdAt: new Date().toISOString() });
      saveLikes(likes);
      return true;
    } else {
      likes.splice(idx, 1);
      saveLikes(likes);
      return false;
    }
  }

  function getCommentLikes() { return read(KEYS.commentLikes) || []; }
  function saveCommentLikes(likes) { write(KEYS.commentLikes, likes); }

  function isCommentLikedBy(commentId, userId) {
    return getCommentLikes().some(l => l.commentId === commentId && l.userId === userId);
  }

  function getCommentLikeCount(commentId) {
    return getCommentLikes().filter(l => l.commentId === commentId).length;
  }

  function toggleCommentLike(commentId, userId) {
    const likes = getCommentLikes();
    const idx = likes.findIndex(l => l.commentId === commentId && l.userId === userId);
    if (idx === -1) {
      likes.push({ id: Utils.generateId(), commentId, userId, createdAt: new Date().toISOString() });
      saveCommentLikes(likes);
      return true;
    } else {
      likes.splice(idx, 1);
      saveCommentLikes(likes);
      return false;
    }
  }

  function getSavedPosts() { return read(KEYS.savedPosts) || []; }
  function saveSavedPosts(saved) { write(KEYS.savedPosts, saved); }

  function isPostSavedBy(postId, userId) {
    return getSavedPosts().some(s => s.postId === postId && s.userId === userId);
  }

  function toggleSavePost(postId, userId) {
    const saved = getSavedPosts();
    const idx = saved.findIndex(s => s.postId === postId && s.userId === userId);
    if (idx === -1) {
      saved.push({ id: Utils.generateId(), postId, userId, savedAt: new Date().toISOString() });
      saveSavedPosts(saved);
      return true;
    } else {
      saved.splice(idx, 1);
      saveSavedPosts(saved);
      return false;
    }
  }

  function getSavedPostsForUser(userId) {
    return getSavedPosts()
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  }

  function getFollowers() { return read(KEYS.followers) || []; }
  function saveFollowers(followers) { write(KEYS.followers, followers); }

  function isFollowing(followerId, followingId) {
    return getFollowers().some(f => f.followerId === followerId && f.followingId === followingId);
  }

  function getFollowerCount(userId) {
    return getFollowers().filter(f => f.followingId === userId).length;
  }

  function getFollowingCount(userId) {
    return getFollowers().filter(f => f.followerId === userId).length;
  }

  function getFollowerIds(userId) {
    return getFollowers().filter(f => f.followingId === userId).map(f => f.followerId);
  }

  function getFollowingIds(userId) {
    return getFollowers().filter(f => f.followerId === userId).map(f => f.followingId);
  }

  function toggleFollow(followerId, followingId) {
    const followers = getFollowers();
    const idx = followers.findIndex(f => f.followerId === followerId && f.followingId === followingId);
    if (idx === -1) {
      followers.push({ id: Utils.generateId(), followerId, followingId, createdAt: new Date().toISOString() });
      saveFollowers(followers);
      return true;
    } else {
      followers.splice(idx, 1);
      saveFollowers(followers);
      return false;
    }
  }

  function getNotifications() { return read(KEYS.notifications) || []; }
  function saveNotifications(notifs) { write(KEYS.notifications, notifs); }

  function getNotificationsForUser(userId) {
    return getNotifications()
      .filter(n => n.recipientId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function getUnreadNotificationCount(userId) {
    return getNotifications().filter(n => n.recipientId === userId && !n.read).length;
  }

  function createNotification(data) {
    const notifs = getNotifications();
    const notif = { ...data, id: Utils.generateId(), read: false, createdAt: new Date().toISOString() };
    notifs.push(notif);
    saveNotifications(notifs);
    return notif;
  }

  function markNotificationRead(id) {
    const notifs = getNotifications();
    const idx = notifs.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifs[idx].read = true;
      saveNotifications(notifs);
    }
  }

  function markAllNotificationsRead(userId) {
    const notifs = getNotifications().map(n =>
      n.recipientId === userId ? { ...n, read: true } : n
    );
    saveNotifications(notifs);
  }

  function getDrafts() { return read(KEYS.drafts) || []; }
  function saveDrafts(drafts) { write(KEYS.drafts, drafts); }

  function getDraftsByUser(userId) {
    return getDrafts()
      .filter(d => d.authorId === userId)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }

  function saveDraft(draftData) {
    const drafts = getDrafts();
    const existingIdx = drafts.findIndex(d => d.id === draftData.id);
    if (existingIdx !== -1) {
      drafts[existingIdx] = { ...drafts[existingIdx], ...draftData, updatedAt: new Date().toISOString() };
    } else {
      drafts.push({ ...draftData, id: draftData.id || Utils.generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    saveDrafts(drafts);
  }

  function deleteDraft(id) {
    saveDrafts(getDrafts().filter(d => d.id !== id));
  }

  function getSettings() { return read(KEYS.settings) || {}; }
  function saveSettings(settings) { write(KEYS.settings, settings); }

  function getViews() { return read(KEYS.views) || {}; }
  function incrementView(postId) {
    const views = getViews();
    views[postId] = (views[postId] || 0) + 1;
    write(KEYS.views, views);
    return views[postId];
  }
  function getViewCount(postId) { return (getViews())[postId] || 0; }

  function searchPosts(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return getPublishedPosts().filter(p => {
      const author = getUserById(p.authorId);
      return (
        p.title.toLowerCase().includes(q) ||
        (p.subtitle || '').toLowerCase().includes(q) ||
        (p.content || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (author && author.name.toLowerCase().includes(q)) ||
        (author && author.username.toLowerCase().includes(q))
      );
    });
  }

  function getTrendingPosts(limit = 6) {
    return getPublishedPosts()
      .map(p => ({
        ...p,
        score: getPostLikeCount(p.id) * 3 + getCommentsByPost(p.id).length * 2 + getViewCount(p.id)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  function getMostCommentedPosts(limit = 6) {
    return getPublishedPosts()
      .map(p => ({ ...p, commentCount: getCommentsByPost(p.id).length }))
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, limit);
  }

  function getTopWriters(limit = 5) {
    return getUsers()
      .map(u => ({
        ...u,
        postCount: getPublishedPostsByUser(u.id).length,
        followerCount: getFollowerCount(u.id)
      }))
      .filter(u => u.postCount > 0)
      .sort((a, b) => b.followerCount - a.followerCount || b.postCount - a.postCount)
      .slice(0, limit);
  }

  function seedIfNeeded() {
    if (read(KEYS.seeded)) return;

    const now = new Date();
    const daysAgo = (n) => new Date(now - n * 86400000).toISOString();

    const users = [
      {
        id: 'u1', name: 'Amara Osei', username: 'amara_writes',
        email: 'amara@gabbyblog.io', password: 'password123',
        bio: 'Software engineer turned writer. I explore the intersection of technology and human experience. Currently based in Accra.',
        avatar: '', createdAt: daysAgo(120)
      },
      {
        id: 'u2', name: 'Marcus Chen', username: 'mchen_dev',
        email: 'marcus@gabbyblog.io', password: 'password123',
        bio: 'Full-stack developer. I write about clean code, system design, and the occasional life observation.',
        avatar: '', createdAt: daysAgo(100)
      },
      {
        id: 'u3', name: 'Priya Nair', username: 'priya_thinks',
        email: 'priya@gabbyblog.io', password: 'password123',
        bio: 'Product manager by day. Amateur philosopher by night. I write about building products people actually love.',
        avatar: '', createdAt: daysAgo(90)
      },
      {
        id: 'u4', name: 'James Okafor', username: 'james_builds',
        email: 'james@gabbyblog.io', password: 'password123',
        bio: 'Entrepreneur and startup founder. Three exits, countless lessons. Writing about what I wish someone had told me earlier.',
        avatar: '', createdAt: daysAgo(80)
      },
      {
        id: 'u5', name: 'Sofia Reyes', username: 'sofia_ux',
        email: 'sofia@gabbyblog.io', password: 'password123',
        bio: 'UX designer obsessed with accessibility and inclusive design. I believe good design should work for everyone.',
        avatar: '', createdAt: daysAgo(60)
      }
    ];
    saveUsers(users);

    const posts = [
      {
        id: 'p1', authorId: 'u1', status: 'published',
        title: 'Why Most Developers Never Get Good at Writing',
        subtitle: 'Writing well is a superpower that most engineers underestimate — and it shows.',
        category: 'Programming',
        content: `Writing is the single most underrated skill in software engineering. We spend years learning algorithms, data structures, and design patterns, but almost nobody teaches us how to communicate ideas clearly.

Think about the last technical decision made at your company. Was it the best technical decision, or was it the decision that was explained most clearly? In my experience, it is almost always the latter.

## The Real Cost of Poor Writing

Every unclear pull request description, every vague ticket, every meeting that could have been an email — these are not small inefficiencies. They compound. A team of ten engineers, each spending thirty minutes a day trying to parse ambiguous messages, loses more than a thousand hours of productivity per month.

But the cost is not just time. Poor written communication creates a culture of assumption. When instructions are unclear, people guess. When decisions are not documented, they get revisited. When context is not written down, it walks out the door the moment someone changes jobs.

## What Good Engineering Writing Looks Like

Good engineering writing has three properties: it is precise, it is brief, and it anticipates the reader's questions.

Precise means you say what you mean without wiggle room. "The API is slow" is not precise. "The API p99 latency increased from 120ms to 890ms after the deploy on Tuesday" is precise.

Brief means you cut everything that is not load-bearing. Every sentence should earn its place.

Anticipating questions means you write for the reader who doesn't have your context. The colleague who just joined, the person reviewing your PR on a Friday afternoon, the you in six months reading your own commit message.

## How to Get Better

Read more than you write. Identify writers whose work is clear and try to understand why it works. Then write something every day, even if it is just a detailed commit message.

The engineers I have seen grow the fastest are not always the best coders. They are the ones who can make other people understand what they are building. That is the real leverage.`,
        coverImage: '',
        publishedAt: daysAgo(3), createdAt: daysAgo(4)
      },
      {
        id: 'p2', authorId: 'u2', status: 'published',
        title: 'The System Design Interview Is Broken — Here Is What Actually Matters',
        subtitle: 'A candid look at how we evaluate engineers for skills they may never actually use.',
        category: 'Technology',
        content: `I have conducted over two hundred technical interviews in the last four years. Somewhere around interview one hundred and fifty, I started to wonder whether we were measuring the right things.

The system design interview — where a candidate has forty-five minutes to design Twitter or a URL shortener on a whiteboard — has become the default signal for senior engineering talent. And I think it is genuinely misleading.

## What System Design Interviews Actually Test

They test familiarity with distributed systems vocabulary. CAP theorem. Consistent hashing. Message queues. These are useful concepts, but knowing how to explain them in an interview setting and knowing how to apply them in production are very different things.

Most engineers at most companies never design systems at the scale these interviews simulate. If your system has fewer than ten million users, the correct design is almost always: use Postgres, avoid microservices, keep it boring.

## What We Should Be Testing Instead

I started asking candidates to walk me through a real pull request they were proud of. Not proud because it was clever, but proud because it solved a real problem well.

The quality of that conversation tells me more than any whiteboard exercise. I learn how they think about trade-offs. I learn whether they consider the people who will maintain their code. I learn whether they can explain a decision to someone without their context.

## The Uncomfortable Truth

The real reason system design interviews persist is not because they are accurate predictors of job performance. It is because they are easy to standardize and hard to fake without real study.

We have built a system that optimizes for a certain type of preparation rather than a certain type of thinking. The best candidates game it. The best engineers sometimes fail it.

That mismatch should bother us more than it does.`,
        coverImage: '',
        publishedAt: daysAgo(7), createdAt: daysAgo(8)
      },
      {
        id: 'p3', authorId: 'u3', status: 'published',
        title: 'Building Products for Real People: The Empathy Gap in Tech',
        subtitle: 'We have optimized for power users and forgotten everyone else.',
        category: 'Design',
        content: `When we build products at tech companies, we have a problem with our mental model of users. The people designing and building software are almost never the people who will struggle most with it.

I realized this clearly when I watched my mother try to use a "simplified" banking app that our team had spent six months building. She was the exact target demographic: someone who wanted to manage their finances without complexity. She could not figure out how to transfer money. The button was right there, we had run user research, we had done A/B tests. And she still could not find it.

## The Expert's Curse

There is a well-documented cognitive bias called the curse of knowledge. Once you know something, it becomes nearly impossible to imagine not knowing it. Product teams at technology companies are filled with people who grew up with this technology, who think in these patterns, who find intuitive what many users find baffling.

This is not a moral failure. It is a structural one.

## What Genuine Empathy Requires

It requires watching actual users, not reading about them. There is no substitute for sitting in a room with someone and watching them use your product in silence. Not guiding them, not helping them — watching where they hesitate, where they go wrong, what they try before they give up.

It requires recruiting the right users for your research. If everyone in your usability study is a tech professional, you are studying the wrong thing.

It requires disagreeing with your data sometimes. Quantitative data tells you what is happening. It rarely tells you why. And without the why, you will optimize yourself into a corner.

## The Standard Worth Setting

The products that have lasted — that have genuinely changed how people live — were built by teams that cared more about the person on the other end of the screen than the elegance of the system behind it.

That should be the standard. Not NPS scores. Not activation rates. Whether a real person, with a real problem, was helped.`,
        coverImage: '',
        publishedAt: daysAgo(5), createdAt: daysAgo(6)
      },
      {
        id: 'p4', authorId: 'u4', status: 'published',
        title: 'I Raised $2M and Still Almost Lost Everything: Startup Lessons from Year Three',
        subtitle: 'The money does not fix the problems. It amplifies them.',
        category: 'Business',
        content: `There is a version of the startup story that gets told at conferences and in press releases. The pivots are strategic. The near-failures are learning opportunities. The journey is a narrative arc with a satisfying conclusion.

I want to tell the other version.

## When the Money Arrived

We closed our seed round on a Tuesday in October. By Thursday, I had made two hiring decisions I would spend the next eighteen months regretting. The money arrived and my judgment left. I mistook the validation of investors for a signal that I understood the business. I did not.

The funding gave us runway. It also gave us the ability to make expensive mistakes at scale. We hired ahead of our learning. We built features before we understood the problem. We rented office space before we needed it because it felt like what real companies do.

## The Moment I Knew We Were In Trouble

Nine months in, we had spent sixty percent of our capital and our month-over-month growth had been flat for three months. Not declining — flat. Which sounds stable until you realize that flat is just decline with better lighting.

I stopped sleeping well. I started avoiding my own dashboard. Both of these are diagnostic signals I should have acted on faster.

## What Actually Saved Us

Not a pivot. Not a viral moment. We fired ourselves from the product decisions and spent six weeks only talking to customers. We called sixty-three of them. We asked what they would miss if we shut down tomorrow. Eleven said nothing. Forty-one said "honestly, probably nothing." Eleven said something that surprised us.

We rebuilt around those eleven answers. Within four months, we had our first profitable quarter.

## The Thing I Tell First-Time Founders Now

The money is not the milestone. The moment a customer tells someone else to use your product without being asked — that is the milestone. Everything before that is just survival.

Stay close to the people who actually use what you are building. Get further from the people who are impressed by your funding announcement. The two groups want very different things from you.`,
        coverImage: '',
        publishedAt: daysAgo(10), createdAt: daysAgo(11)
      },
      {
        id: 'p5', authorId: 'u5', status: 'published',
        title: 'Accessibility Is Not a Feature. It Is the Baseline.',
        subtitle: 'How the industry keeps getting inclusive design wrong, and why it matters more than most teams realize.',
        category: 'Design',
        content: `Every time a design team adds accessibility to their Q4 roadmap as a "nice to have," I feel something between frustration and exhaustion. Not because accessibility is hard — though it can be — but because framing it as an optional upgrade reveals a fundamental misunderstanding of what we are building and for whom.

## Who We Are Actually Designing For

The statistics are not abstract. Approximately fifteen percent of the global population lives with some form of disability. Many are permanent. Many are situational — the parent holding a baby while trying to navigate your app with one thumb, the person in bright sunlight who cannot read your low-contrast text, the commuter on a noisy bus who needs captions to watch your video.

When you design exclusively for the median, unencumbered user, you are not designing for most people. You are designing for an idealized fiction.

## Where Teams Go Wrong

The most common mistake is treating accessibility as a checklist to complete after design is done. "We will add ARIA labels and fix the color contrast before launch." This approach generates compliance without creating usability.

Real accessible design starts at the concept phase. It asks: can a person navigate this with a keyboard alone? Does this interaction make sense without visual context? If a screen reader reads this aloud, does it tell a coherent story?

These questions, asked early, do not slow down design. They improve it.

## The Side Effect Nobody Mentions

Accessible interfaces are better interfaces. The contrast ratios that help users with low vision also help everyone reading in direct sunlight. The keyboard navigation that serves users with motor impairments also serves power users who hate reaching for the mouse. Captions help non-native speakers, people in loud environments, and anyone who wants to watch a video without waking their partner.

Designing for constraint consistently produces better outcomes for everyone. That is not a coincidence. Constraints force clarity.

## The Standard We Should Hold Ourselves To

Before any product ships, someone on the team should attempt to complete its primary flow using only a keyboard. Someone should run it through a screen reader. Someone should check it in Windows High Contrast Mode.

Not to generate a report. To understand whether a person who does not experience the world the way most of your team does can actually use what you built.

If they cannot, it is not finished.`,
        coverImage: '',
        publishedAt: daysAgo(2), createdAt: daysAgo(3)
      },
      {
        id: 'p6', authorId: 'u1', status: 'published',
        title: 'The Quiet Revolution in How Africa Builds Software',
        subtitle: 'A new generation of engineers is shipping products for problems the rest of the world has not even noticed yet.',
        category: 'Technology',
        content: `Something is shifting in African software development. It is not the accelerator announcements or the funding headlines — those come and go. It is the quality of the problems being solved and the quiet competence of the people solving them.

I have been building software from Accra for eight years. I have watched the conversation about African tech move from "emerging market potential" to actual products with actual users who genuinely depend on them. The shift is not complete, but it is real.

## Building for Constraint as a Feature

The most interesting engineering I have seen in this ecosystem comes from the constraints themselves. Unreliable internet connections produce better offline-first architectures. Mobile-first populations produce genuinely mobile-first design, not desktop designs scaled down. Payment infrastructure gaps produce creative fintech that later gets adopted globally.

M-Pesa was not built because Kenyan engineers did not know about traditional banking. It was built because they understood the actual problem better than anyone coming from outside could.

## The Knowledge Transfer That Is Happening

There is now a critical mass of engineers who have worked at global technology companies and come back. Not because they could not stay, but because they see clearly what can be built, and they want to build it here.

This is producing something new: deep domain expertise combined with engineering rigor. The engineers who understand both how to build a reliable distributed system and why a smallholder farmer in Kumasi checks her phone at specific times of day — those engineers are building things that matter.

## What This Requires From the Rest of the Industry

Stop treating African technology as a charity narrative or a market opportunity to be captured from the outside. The builders are here. The problems are real and specific and understood. What is needed is more investment in infrastructure — power, connectivity, payment rails — and less condescension about what the ecosystem is capable of.

The next decade will be interesting.`,
        coverImage: '',
        publishedAt: daysAgo(14), createdAt: daysAgo(15)
      },
      {
        id: 'p7', authorId: 'u2', status: 'published',
        title: 'Stop Using .forEach When You Should Be Using .reduce',
        subtitle: 'A practical guide to the most misunderstood array method in JavaScript.',
        category: 'Programming',
        content: `I see this pattern constantly in code reviews. A developer needs to transform an array into something — an object, a different array, a single computed value — and they reach for .forEach with a variable declared outside the loop.

This works. But it is fighting the language rather than working with it.

## What forEach Actually Communicates

When I read .forEach in a codebase, I expect side effects. I expect the function to be doing something — updating state, logging, sending a request. I do not expect it to be building a return value. When a developer uses forEach to build a new object, they are sending the wrong signal to every developer who reads that code after them.

Code communicates intent. Use the method that matches what you are actually doing.

## When reduce Is Right

The .reduce method has a reputation for being hard to read. This reputation is sometimes deserved and usually earned by people who write clever one-liners instead of clear logic.

But reduce is precisely correct when you are collapsing an array into a single value. That value can be a number, a string, an object, or another array. The method's shape matches the operation.

Converting an array of objects to a lookup map by id? That is reduce. Summing a list of prices? That is reduce. Grouping items by category? That is reduce.

## The Test

Ask yourself: am I collecting a result from this array, or am I causing something to happen for each item? If you are collecting, reach for map, filter, or reduce. If you are causing effects, forEach is right.

This distinction — pure transformation versus side effects — is one of the most useful mental models I know for writing readable, predictable code. It becomes second nature quickly. And once you have it, you will see its violation everywhere.`,
        coverImage: '',
        publishedAt: daysAgo(18), createdAt: daysAgo(19)
      },
      {
        id: 'p8', authorId: 'u3', status: 'published',
        title: 'The Art of Saying No: How Product Managers Protect Their Team',
        subtitle: 'Prioritization is not a spreadsheet exercise. It is a series of hard conversations.',
        category: 'Business',
        content: `The hardest part of product management is not understanding users, writing roadmaps, or analyzing data. It is telling a VP with organizational power and genuine conviction that their idea is not the right thing to build right now.

This skill — prioritization in the political sense, not the spreadsheet sense — is what separates good product managers from great ones.

## Why No Is So Hard to Say

Product managers are often in a structurally weak position. They own decisions without owning headcount. Their authority is influence, not hierarchy. When a senior stakeholder has an idea, the path of least resistance is to validate it, plan it, and ship it. The organization rewards this in the short term.

The cost is borne later, by the team, in the form of half-finished work, lost momentum, and a roadmap nobody understands.

## What a Real No Sounds Like

The most effective version of no is not "no." It is a question: "What outcome are we trying to produce?" Followed by: "Given our current constraints, what is the highest-leverage way to produce that outcome?"

Sometimes this leads to yes — to building the thing, but smaller, or later. Sometimes it leads to a different idea entirely that achieves the same goal with less cost. Rarely does it lead to a fight, because you have moved the conversation from opinions to outcomes.

## The Team's Trust

Every time a product manager absorbs a bad request rather than pushing back, they earn a small amount of short-term goodwill and lose a larger amount of team trust. Engineers who have worked on features that went nowhere, that shipped to no one, that were deprioritized before they could be finished — they notice patterns.

The best teams I have worked with trusted their product manager to protect them from wasted work. That trust is built one difficult conversation at a time.`,
        coverImage: '',
        publishedAt: daysAgo(22), createdAt: daysAgo(23)
      }
    ];
    savePosts(posts);

    const comments = [
      { id: 'c1', postId: 'p1', authorId: 'u2', parentId: null, text: 'This hits close to home. I spent years optimizing my coding speed and almost none of that time on communication. The teams that have impressed me most were always the ones where documentation was actually readable.', createdAt: daysAgo(2) },
      { id: 'c2', postId: 'p1', authorId: 'u3', parentId: null, text: 'The bit about decisions being made by whoever explains clearest rather than whoever is technically right is a painful truth. I have seen it happen in every org I have been part of.', createdAt: daysAgo(1) },
      { id: 'c3', postId: 'p1', authorId: 'u4', parentId: 'c2', text: 'Absolutely. And the inverse is also true — technically questionable ideas get killed simply because the person proposing them cannot articulate the vision.', createdAt: daysAgo(1) },
      { id: 'c4', postId: 'p2', authorId: 'u1', parentId: null, text: 'I failed a system design round at a company I later found out was running on a single Postgres instance. The irony was not lost on me.', createdAt: daysAgo(5) },
      { id: 'c5', postId: 'p2', authorId: 'u5', parentId: null, text: 'The PR walkthrough idea is genuinely interesting. Would love to see more companies try this format and report back on whether it predicts performance better.', createdAt: daysAgo(4) },
      { id: 'c6', postId: 'p3', authorId: 'u2', parentId: null, text: 'The curse of knowledge framing is spot on. I ran a usability study last year where every single participant was in the engineering or design field. We thought we were being thorough.', createdAt: daysAgo(3) },
      { id: 'c7', postId: 'p4', authorId: 'u1', parentId: null, text: 'The detail about sixty-three customer calls is important. Most founders I know stop talking to customers the moment they raise money. That is exactly backwards.', createdAt: daysAgo(8) },
      { id: 'c8', postId: 'p5', authorId: 'u2', parentId: null, text: 'The keyboard-only navigation test is something every team should do before any launch. It takes thirty minutes and the findings are almost always embarrassing.', createdAt: daysAgo(1) },
      { id: 'c9', postId: 'p5', authorId: 'u4', parentId: 'c8', text: 'Agreed, and the embarrassment is useful. Nothing motivates a fix like a senior designer watching themselves fail their own product\'s onboarding.', createdAt: daysAgo(1) }
    ];
    saveComments(comments);

    const likes = [
      { id: 'l1', postId: 'p1', userId: 'u2', createdAt: daysAgo(2) },
      { id: 'l2', postId: 'p1', userId: 'u3', createdAt: daysAgo(2) },
      { id: 'l3', postId: 'p1', userId: 'u4', createdAt: daysAgo(1) },
      { id: 'l4', postId: 'p1', userId: 'u5', createdAt: daysAgo(1) },
      { id: 'l5', postId: 'p2', userId: 'u1', createdAt: daysAgo(5) },
      { id: 'l6', postId: 'p2', userId: 'u3', createdAt: daysAgo(5) },
      { id: 'l7', postId: 'p2', userId: 'u4', createdAt: daysAgo(4) },
      { id: 'l8', postId: 'p2', userId: 'u5', createdAt: daysAgo(3) },
      { id: 'l9', postId: 'p3', userId: 'u1', createdAt: daysAgo(4) },
      { id: 'l10', postId: 'p3', userId: 'u2', createdAt: daysAgo(3) },
      { id: 'l11', postId: 'p3', userId: 'u4', createdAt: daysAgo(2) },
      { id: 'l12', postId: 'p4', userId: 'u1', createdAt: daysAgo(9) },
      { id: 'l13', postId: 'p4', userId: 'u2', createdAt: daysAgo(8) },
      { id: 'l14', postId: 'p4', userId: 'u3', createdAt: daysAgo(7) },
      { id: 'l15', postId: 'p4', userId: 'u5', createdAt: daysAgo(6) },
      { id: 'l16', postId: 'p5', userId: 'u1', createdAt: daysAgo(1) },
      { id: 'l17', postId: 'p5', userId: 'u3', createdAt: daysAgo(1) },
      { id: 'l18', postId: 'p5', userId: 'u4', createdAt: daysAgo(1) },
      { id: 'l19', postId: 'p6', userId: 'u2', createdAt: daysAgo(12) },
      { id: 'l20', postId: 'p6', userId: 'u3', createdAt: daysAgo(11) },
      { id: 'l21', postId: 'p6', userId: 'u5', createdAt: daysAgo(10) },
      { id: 'l22', postId: 'p7', userId: 'u1', createdAt: daysAgo(16) },
      { id: 'l23', postId: 'p7', userId: 'u3', createdAt: daysAgo(15) },
      { id: 'l24', postId: 'p8', userId: 'u2', createdAt: daysAgo(20) },
      { id: 'l25', postId: 'p8', userId: 'u4', createdAt: daysAgo(19) },
      { id: 'l26', postId: 'p8', userId: 'u5', createdAt: daysAgo(18) }
    ];
    saveLikes(likes);

    const commentLikes = [
      { id: 'cl1', commentId: 'c1', userId: 'u1', createdAt: daysAgo(2) },
      { id: 'cl2', commentId: 'c1', userId: 'u3', createdAt: daysAgo(1) },
      { id: 'cl3', commentId: 'c2', userId: 'u1', createdAt: daysAgo(1) },
      { id: 'cl4', commentId: 'c4', userId: 'u2', createdAt: daysAgo(4) },
      { id: 'cl5', commentId: 'c8', userId: 'u1', createdAt: daysAgo(1) }
    ];
    saveCommentLikes(commentLikes);

    const followers = [
      { id: 'f1', followerId: 'u2', followingId: 'u1', createdAt: daysAgo(50) },
      { id: 'f2', followerId: 'u3', followingId: 'u1', createdAt: daysAgo(45) },
      { id: 'f3', followerId: 'u4', followingId: 'u1', createdAt: daysAgo(30) },
      { id: 'f4', followerId: 'u5', followingId: 'u1', createdAt: daysAgo(20) },
      { id: 'f5', followerId: 'u1', followingId: 'u2', createdAt: daysAgo(60) },
      { id: 'f6', followerId: 'u3', followingId: 'u2', createdAt: daysAgo(40) },
      { id: 'f7', followerId: 'u5', followingId: 'u2', createdAt: daysAgo(25) },
      { id: 'f8', followerId: 'u1', followingId: 'u3', createdAt: daysAgo(55) },
      { id: 'f9', followerId: 'u2', followingId: 'u3', createdAt: daysAgo(35) },
      { id: 'f10', followerId: 'u4', followingId: 'u3', createdAt: daysAgo(15) },
      { id: 'f11', followerId: 'u1', followingId: 'u4', createdAt: daysAgo(48) },
      { id: 'f12', followerId: 'u2', followingId: 'u5', createdAt: daysAgo(22) },
      { id: 'f13', followerId: 'u3', followingId: 'u5', createdAt: daysAgo(18) }
    ];
    saveFollowers(followers);

    const saved = [
      { id: 's1', postId: 'p2', userId: 'u1', savedAt: daysAgo(5) },
      { id: 's2', postId: 'p5', userId: 'u2', savedAt: daysAgo(2) },
      { id: 's3', postId: 'p4', userId: 'u3', savedAt: daysAgo(8) }
    ];
    saveSavedPosts(saved);

    const views = { p1: 312, p2: 487, p3: 261, p4: 593, p5: 178, p6: 224, p7: 341, p8: 189 };
    write(KEYS.views, views);

    write(KEYS.seeded, true);
  }

  return {
    KEYS, read, write,
    getUsers, saveUsers, getUserById, getUserByEmail, getUserByUsername, createUser, updateUser,
    getCurrentUser, setCurrentUser, clearCurrentUser,
    getPosts, savePosts, getPostById, getPublishedPosts, getPostsByUser, getPublishedPostsByUser,
    createPost, updatePost, deletePost,
    getComments, saveComments, getCommentsByPost, createComment, updateComment, deleteComment,
    getLikes, saveLikes, isPostLikedBy, getPostLikeCount, togglePostLike,
    getCommentLikes, saveCommentLikes, isCommentLikedBy, getCommentLikeCount, toggleCommentLike,
    getSavedPosts, saveSavedPosts, isPostSavedBy, toggleSavePost, getSavedPostsForUser,
    getFollowers, saveFollowers, isFollowing, getFollowerCount, getFollowingCount,
    getFollowerIds, getFollowingIds, toggleFollow,
    getNotifications, saveNotifications, getNotificationsForUser, getUnreadNotificationCount,
    createNotification, markNotificationRead, markAllNotificationsRead,
    getDrafts, saveDrafts, getDraftsByUser, saveDraft, deleteDraft,
    getSettings, saveSettings,
    getViews, incrementView, getViewCount,
    searchPosts, getTrendingPosts, getMostCommentedPosts, getTopWriters,
    seedIfNeeded
  };
})();
