import Conversation from "../model/Conversation.js";
import Message from "../model/Message.js";
import User from "../model/User.js";

// @route GET /api/messages/conversations
// Get all conversations for the current user
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate("participants", "name email profilePic role")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/messages/:conversationId
// Get all messages for a specific conversation
export const getConversationMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate("senderId", "name profilePic")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/messages/send
// Send a message to a user (starts or continues a conversation)
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, text, conversationId } = req.body;
    let convId = conversationId;

    // If no conversationId, find or create one between sender and receiver
    if (!convId) {
      let conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user._id, receiverId],
        });
      }
      convId = conversation._id;
    }

    // Create the message
    const message = await Message.create({
      conversationId: convId,
      senderId: req.user._id,
      text,
    });

    // Update conversation lastMessage and timestamp
    await Conversation.findByIdAndUpdate(convId, {
      lastMessage: message._id,
      isActive: true,
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/messages/start/:receiverId
// Check for existing conversation or prepare to start one
export const startConversation = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    }).populate("participants", "name profilePic role bio");

    if (!conversation) {
      // Return receiver info so frontend can show who we're starting a chat with
      const receiver = await User.findById(receiverId).select("name profilePic role bio");
      return res.json({ conversation: null, receiver });
    }

    res.json({ conversation });
  } catch (error) {
    next(error);
  }
};
