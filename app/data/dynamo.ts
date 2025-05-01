"use server";

import { currentUser } from "@clerk/nextjs/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const dynamo = DynamoDBDocumentClient.from(client);
export type TImage = {
  user_id: string;
  modifiedTime?: string;
  s3_url: string;
  image_id: string;
};

export const getImages = async (): Promise<TImage[]> => {
  const user = await currentUser();
  if (!user?.id) {
    return [];
  }

  const result = await dynamo.send(
    new QueryCommand({
      TableName: process.env.AWS_TABLE_NAME,
      KeyConditionExpression: "user_id = :uid",
      ExpressionAttributeValues: {
        ":uid": user.id,
      },
    })
  );
  return (result.Items as TImage[]) || []; // Return the items (images) for the user
};
