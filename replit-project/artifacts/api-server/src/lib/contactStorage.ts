import { Storage } from "@google-cloud/storage";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const CONTACT_FILE_PATH = "data/contactReceived.json";

const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export type StoredContactMessage = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  reason: "Comment" | "Question" | "Partnership" | "Opportunity" | "Other";
  message: string;
  submittedAt: string;
  replied: boolean;
  repliedAt: string | null;
};

let writeQueue = Promise.resolve();

function getContactFile() {
  const privateObjectDir = process.env.PRIVATE_OBJECT_DIR?.replace(/\/+$/, "");
  if (!privateObjectDir) {
    throw new Error("PRIVATE_OBJECT_DIR is not configured.");
  }

  const pathParts = `${privateObjectDir}/${CONTACT_FILE_PATH}`.split("/").filter(Boolean);
  const bucketName = pathParts.shift();
  if (!bucketName || pathParts.length === 0) {
    throw new Error("PRIVATE_OBJECT_DIR is not a valid App Storage path.");
  }

  return objectStorageClient.bucket(bucketName).file(pathParts.join("/"));
}

export async function readMessages() {
  const file = getContactFile();
  const [exists] = await file.exists();
  if (!exists) {
    await file.save("[]", {
      resumable: false,
      metadata: { contentType: "application/json", cacheControl: "no-cache" },
    });
    return [] as StoredContactMessage[];
  }

  const [contents] = await file.download();
  const parsed: unknown = JSON.parse(contents.toString("utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error("Stored contact data must be a JSON array.");
  }
  return (parsed as Array<StoredContactMessage & { repliedAt?: string | null }>).map((message) => ({
    ...message,
    replied: Boolean(message.replied),
    repliedAt: message.repliedAt ?? null,
  }));
}

export async function ensureContactFile() {
  const messages = await readMessages();
  await writeMessages(messages);
}

async function writeMessages(messages: StoredContactMessage[]) {
  const file = getContactFile();
  await file.save(JSON.stringify(messages, null, 2), {
    resumable: false,
    metadata: { contentType: "application/json", cacheControl: "no-cache" },
  });
}

export function saveContactMessage(message: StoredContactMessage) {
  const result = writeQueue.then(async () => {
    const messages = await readMessages();
    messages.push(message);
    await writeMessages(messages);
    return message;
  });
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export function markContactMessageReplied(id: string) {
  const result = writeQueue.then(async () => {
    const messages = await readMessages();
    const message = messages.find((item) => item.id === id);
    if (!message) {
      return null;
    }

    message.replied = true;
    message.repliedAt = new Date().toISOString();
    await writeMessages(messages);
    return message;
  });
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}