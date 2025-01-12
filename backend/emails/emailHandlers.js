import { mailtrapClient, sender } from "../lib/mailtrap.js";
import { createWelcomeEmailTemplate } from "./emailTemplate.js";
export const sendWelcomeEmail = async (name, email, profileUrl) => {
  const reciptant = [{ email: email }];
  try {
    const response = await mailtrapClient.send({
      to: reciptant,
      from: sender,
      subject: "Welcome to LinkedIn",
      html: createWelcomeEmailTemplate(name, profileUrl),
      category: "welcome",
    });
    console.log("Welcome email send succesffully", response);
  } catch (error) {
    throw new Error(error);
  }
};

export const sendCommentNotificationEmail = async (
  reciptantEmail,
  reciptantName,
  commentorName,
  postUrl,
  commentContent
) => {
  const reciptant = [{ email: reciptantEmail }];
  try {
    const response = await mailtrapClient.send({
      to: reciptant,
      from: sender,
      subject: "New Comment on Your Post",
      html: createCommentNotificationEmailTemplate(
        reciptantName,
        commentorName,
        postUrl,
        commentContent
      ),
      category: "comment",
    });
    console.log("Comment notification email send succesffully", response);
  } catch (error) {
    throw new Error(error);
  }
};

export const sendConnectionAccpetedEmail = async (
  senderEmail,
  senderName,
  reciptantName,
  profileUrl
) => {
  const reciptant = [{ email: senderEmail }];
  try {
    const response = await mailtrapClient.send({
      to: reciptant,
      from: sender,
      subject: `${reciptantName} accepted your connection request`,
      html: createConnectionAcceptedEmailTemplate(
        senderName,
        reciptantName,
        profileUrl
      ),
      category: "connectionAccpeted",
    });
    console.log("Connection request email send succesffully", response);
  } catch (error) {
    throw new Error(error);
  }
};
