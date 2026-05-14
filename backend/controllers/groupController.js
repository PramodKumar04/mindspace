import Group from '../models/Group.js';
import GroupPost from '../models/GroupPost.js';
import User from '../models/User.js';

/**
 * Create a new group
 */
export const createGroup = async (req, res, next) => {
  try {
    const { name, description, category, tags, privacy } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Name, description and category are required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if slug exists in this college
    const existingGroup = await Group.findOne({ collegeId: req.user.collegeId, slug });
    if (existingGroup) {
      return res.status(400).json({ message: 'A group with this name already exists in your college' });
    }

    const group = await Group.create({
      name,
      slug,
      description,
      category,
      tags: tags || [],
      privacy: privacy || 'public',
      creatorId: req.user.userId,
      collegeId: req.user.collegeId,
      moderators: [req.user.userId],
      members: [req.user.userId],
      memberCount: 1
    });

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all groups for user's college
 */
export const getGroups = async (req, res, next) => {
  try {
    const { search, category, sort = 'newest', page = 1, limit = 10 } = req.query;
    
    const query = { 
      collegeId: req.user.collegeId,
      isActive: true,
      privacy: 'public' // Phase 1: Only public groups
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'trending') {
      sortQuery = { memberCount: -1 };
    } else if (sort === 'popular') {
      sortQuery = { memberCount: -1 };
    } else if (sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    }

    const groups = await Group.find(query)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Group.countDocuments(query);

    res.json({
      groups,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get group by ID or slug
 */
export const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      $or: [
        { _id: req.params.id },
        { slug: req.params.id }
      ],
      collegeId: req.user.collegeId,
      isActive: true
    }).populate('creatorId', 'name avatar');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json({ group });
  } catch (error) {
    // If ID is invalid format, just return not found
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Group not found' });
    }
    next(error);
  }
};

/**
 * Join a group
 */
export const joinGroup = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const userId = req.user.userId;
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    group.members.push(userId);
    group.memberCount = group.members.length;
    await group.save();

    res.json({ message: 'Successfully joined group', memberCount: group.memberCount });
  } catch (error) {
    next(error);
  }
};

/**
 * Leave a group
 */
export const leaveGroup = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const userId = req.user.userId;
    
    // Prevent creator from leaving (they should delete the group or transfer ownership - not in phase 1)
    if (group.creatorId.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Group creator cannot leave the group' });
    }

    const memberIndex = group.members.indexOf(userId);
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }

    group.members.splice(memberIndex, 1);
    group.memberCount = group.members.length;
    
    // Also remove from moderators if present
    const modIndex = group.moderators.indexOf(userId);
    if (modIndex > -1) {
      group.moderators.splice(modIndex, 1);
    }

    await group.save();

    res.json({ message: 'Successfully left group', memberCount: group.memberCount });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a post in a group
 */
export const createGroupPost = async (req, res, next) => {
  try {
    const { content, isAnonymous } = req.body;
    const { groupId } = req.params;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const group = await Group.findOne({
      _id: groupId,
      collegeId: req.user.collegeId,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Must be a member to post
    if (!group.members.includes(req.user.userId)) {
      return res.status(403).json({ message: 'You must be a member of the group to post' });
    }

    const user = await User.findById(req.user.userId);
    
    const post = await GroupPost.create({
      groupId,
      authorId: req.user.userId,
      collegeId: req.user.collegeId,
      content,
      isAnonymous: isAnonymous || false,
      authorAlias: isAnonymous ? (user.alias || 'Anonymous') : user.name
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
 * Get posts for a group
 */
export const getGroupPosts = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const posts = await GroupPost.find({
      groupId,
      collegeId: req.user.collegeId,
      isActive: true
    })
      .populate('authorId', 'name avatar alias')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await GroupPost.countDocuments({
      groupId,
      collegeId: req.user.collegeId,
      isActive: true
    });

    // Hide author info if anonymous
    const formattedPosts = posts.map(post => {
      const postObj = post.toObject();
      if (postObj.isAnonymous) {
        postObj.authorId = { name: 'Anonymous Member', alias: postObj.authorAlias };
      }
      return postObj;
    });

    res.json({
      posts: formattedPosts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle like on a group post
 */
export const toggleLikePost = async (req, res, next) => {
  try {
    const post = await GroupPost.findOne({
      _id: req.params.postId,
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

    post.likeCount = post.likes.length;
    await post.save();

    res.json({
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      likeCount: post.likeCount,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    next(error);
  }
};
