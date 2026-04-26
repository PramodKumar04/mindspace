import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

function formatComment(comment) {
  const commentObj = comment.toObject ? comment.toObject() : { ...comment };
  const authorId = commentObj.author?._id || commentObj.author;
  commentObj.authorId = authorId;
  if (commentObj.isAnonymous) {
    commentObj.author = { alias: commentObj.authorAlias };
  }
  return commentObj;
}

function buildCommentTree(flat) {
  const map = new Map();
  flat.forEach((c) => {
    const formatted = { ...c, replies: [] };
    map.set(String(c._id), formatted);
  });
  const roots = [];
  for (const c of flat) {
    const node = map.get(String(c._id));
    const pid = c.parentCommentId ? String(c.parentCommentId) : null;
    if (pid && map.has(pid)) {
      map.get(pid).replies.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortReplies = (nodes) => {
    nodes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    nodes.forEach((n) => sortReplies(n.replies));
  };
  sortReplies(roots);
  return roots;
}

/**
 * Create post (Student only)
 */
export const createPost = async (req, res, next) => {
  try {
    const { title, content, isAnonymous } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = await Post.create({
      title,
      content,
      author: req.user.userId,
      authorAlias: isAnonymous ? user.alias : user.name,
      isAnonymous: isAnonymous || false,
      collegeId: req.user.collegeId
    });

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all posts for user's college
 */
export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({
      collegeId: req.user.collegeId,
      isActive: true
    })
      .populate('author', 'name alias')
      .sort({ createdAt: -1 });

    // Hide author info if anonymous
    const formattedPosts = posts.map(post => {
      const postObj = post.toObject();
      if (postObj.isAnonymous) {
        postObj.author = { alias: postObj.authorAlias };
      }
      return postObj;
    });

    res.json({ posts: formattedPosts });
  } catch (error) {
    next(error);
  }
};

/**
 * @mention autocomplete: post author + non-anonymous commenters (omit current user).
 * Anonymous authors are omitted so their user IDs are not exposed.
 */
export const getMentionCandidates = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId,
      isActive: true
    }).populate('author', 'name alias');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const byId = new Map();
    const selfId = req.user.userId.toString();

    const add = (userId, displayName) => {
      if (!userId || !displayName) return;
      const id = userId.toString();
      if (id === selfId) return;
      if (!byId.has(id)) {
        byId.set(id, { userId: id, displayName: String(displayName).trim() });
      }
    };

    const authorId = post.author?._id || post.author;
    if (!post.isAnonymous) {
      add(authorId, post.author?.name || post.authorAlias);
    } else if (authorId?.toString() === selfId) {
      add(authorId, post.authorAlias || post.author?.name);
    }

    const comments = await Comment.find({
      postId: post._id,
      isActive: true
    }).populate('author', 'name alias');

    for (const c of comments) {
      if (c.isAnonymous) continue;
      const uid = c.author?._id || c.author;
      add(uid, c.author?.name || c.authorAlias);
    }

    res.json({ candidates: [...byId.values()] });
  } catch (error) {
    next(error);
  }
};

/**
 * Get post by ID with nested comments
 */
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId,
      isActive: true
    }).populate('author', 'name alias');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await Comment.find({
      postId: post._id,
      isActive: true
    })
      .populate('author', 'name alias')
      .sort({ createdAt: 1 });

    const postObj = post.toObject();
    if (postObj.isAnonymous) {
      postObj.author = { alias: postObj.authorAlias };
    }

    const formattedComments = comments.map((comment) => formatComment(comment));
    const nestedCommentTree = buildCommentTree(formattedComments);

    res.json({
      post: postObj,
      comments: nestedCommentTree
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Like/Unlike post
 */
export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId,
      isActive: true
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user.userId;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Report post
 */
export const reportPost = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const post = await Post.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isFlagged = true;
    post.flagReason = reason;
    await post.save();

    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete post (Admin only)
 */
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isActive = false;
    await post.save();

    // Also deactivate comments
    await Comment.updateMany(
      { postId: post._id },
      { isActive: false }
    );

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};
