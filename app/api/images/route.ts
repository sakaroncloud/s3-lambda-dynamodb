import { currentUser } from "@clerk/nextjs/server";
import { getImages } from "@/app/data/dynamo";

export async function GET() {
  try {
    const session = await currentUser();

    if (!session)
      return new Response(JSON.stringify("Unauthorized"), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });

    const data = await getImages();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
