import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  ListContactMessagesResponse,
  MarkContactMessageRepliedParams,
  MarkContactMessageRepliedResponse,
  SubmitContactBody,
  SubmitContactResponse,
} from "@workspace/api-zod";
import {
  markContactMessageReplied,
  readMessages,
  saveContactMessage,
} from "../lib/contactStorage";

const router: IRouter = Router();

router.get("/contact", async (req, res) => {
  try {
    const messages = await readMessages();
    return res.status(200).json(ListContactMessagesResponse.parse(messages));
  } catch (error) {
    req.log.error({ err: error }, "Failed to load contact messages");
    return res.status(500).json({ error: "Contact messages could not be loaded." });
  }
});

router.post("/contact", async (req, res) => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Please complete every required contact field with valid information." });
  }

  try {
    const savedMessage = await saveContactMessage({
      id: randomUUID(),
      ...parsed.data,
      submittedAt: new Date().toISOString(),
      replied: false,
      repliedAt: null,
    });

    return res.status(201).json(SubmitContactResponse.parse(savedMessage));
  } catch (error) {
    req.log.error({ err: error }, "Failed to save contact message");
    return res.status(500).json({ error: "Your message could not be saved. Please try again." });
  }
});

router.patch("/contact/:id/replied", async (req, res) => {
  const parsed = MarkContactMessageRepliedParams.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: "A valid contact message ID is required." });
  }

  try {
    const updatedMessage = await markContactMessageReplied(parsed.data.id);
    if (!updatedMessage) {
      return res.status(404).json({ error: "Contact message not found." });
    }
    return res.status(200).json(MarkContactMessageRepliedResponse.parse(updatedMessage));
  } catch (error) {
    req.log.error({ err: error }, "Failed to update contact message");
    return res.status(500).json({ error: "The contact message could not be updated." });
  }
});

export default router;