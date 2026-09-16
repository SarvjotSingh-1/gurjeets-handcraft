import mongoose from 'mongoose';
import { ContactMessage } from '../models/ContactMessage.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { BUSINESS_CONFIG } from '../config/constants.js';

// In-memory store fallback if MongoDB is not connected
const memoryContactMessages = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Builds pre-filled WhatsApp URL for a contact form submission
 */
const buildContactWhatsAppUrl = ({ name, phone, subject, message }) => {
  let text = `Hello Gurjeet's Handcraft,\nI have submitted an inquiry on your website:\n\n`;
  text += `*Name:* ${name}\n`;
  text += `*Phone:* ${phone}\n`;
  text += `*Subject:* ${subject}\n`;
  text += `*Message:* ${message}\n\n`;
  text += `Looking forward to your reply. Thank you!`;

  return `${BUSINESS_CONFIG.whatsappBaseUrl}?text=${encodeURIComponent(text)}`;
};

/**
 * Submit a Contact Message
 * POST /api/v1/contact
 */
export const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name?.trim()) throw new ApiError(400, 'Name is required');
    if (!email?.trim()) throw new ApiError(400, 'Email address is required');
    if (!phone?.trim()) throw new ApiError(400, 'Phone number is required');
    if (!subject?.trim()) throw new ApiError(400, 'Subject is required');
    if (!message?.trim()) throw new ApiError(400, 'Message is required');

    const messageData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'New',
    };

    let savedMessage;

    if (isDbConnected()) {
      try {
        savedMessage = await ContactMessage.create(messageData);
      } catch (dbErr) {
        console.warn('MongoDB contact save failed, using memory store fallback:', dbErr.message);
        savedMessage = {
          ...messageData,
          _id: `mem_msg_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryContactMessages.unshift(savedMessage);
      }
    } else {
      savedMessage = {
        ...messageData,
        _id: `mem_msg_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryContactMessages.unshift(savedMessage);
    }

    const whatsAppUrl = buildContactWhatsAppUrl(savedMessage);

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          contactMessage: savedMessage,
          whatsAppUrl,
          message: 'Thank you! Your message has been received. Gurjeet will respond to you personally.',
        },
        'Contact message received successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve Contact Messages (Admin / Review)
 * GET /api/v1/contact
 */
export const getContactMessages = async (req, res, next) => {
  try {
    let messages = [];

    if (isDbConnected()) {
      try {
        messages = await ContactMessage.find().sort({ createdAt: -1 });
      } catch (dbErr) {
        console.warn('MongoDB read failed, using memory store fallback:', dbErr.message);
        messages = memoryContactMessages;
      }
    } else {
      messages = memoryContactMessages;
    }

    return res.status(200).json(
      new ApiResponse(200, messages, 'Contact messages retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};
