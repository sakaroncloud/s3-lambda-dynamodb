"use server";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { currentUser } from "@clerk/nextjs/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function getObjectUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });
  const signedUrl = await getSignedUrl(s3Client, command);

  return signedUrl;
}

export async function getUploadUrl(contentType: string) {
  const user = await currentUser();
  if (!user?.id) {
    return {
      error: "User not logged in",
    };
  }

  const key = user.id + "/" + uuidv4();
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });
  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 600, // seconds (10 minutes)
    });

    return {
      signedUrl,
      key,
      user_id: user?.id,
    };
  } catch {
    return {
      error: "Oops!, Cannot get uploadUrl",
    };
  }
}

export async function deleteS3Object(user_id: string, image_id: string) {
  const key = user_id + "/" + image_id;
  try {
    const data = await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
      })
    );
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete object" };
  }
}

export async function uploadObject(signedUrl: string, file: File) {
  try {
    const response = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
    const s3_url = signedUrl.split("?")[0];

    if (!response.ok) {
      return {
        error: "Something went wrong",
      };
    }

    // Also save in dynamodb

    return {
      s3_url,
      success: "Uploaded Successfully",
    };
  } catch (e) {
    return {
      error: "Unable to upload",
    };
  }
}
