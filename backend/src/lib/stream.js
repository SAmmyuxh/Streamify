import {StreamChat} from "stream-chat"
import "dotenv/config"

const apikey = process.env.STREAM_API_KEY;
const apisecret = process.env.STREAM_API_SECRET;

if(!apikey || !apisecret){
    console.error("STREAM_API_KEY or STREAM_API_SECRET is missing in environment variables")
    throw new Error("Stream Chat credentials are not configured. Please set STREAM_API_KEY and STREAM_API_SECRET in your .env file");
}

const streamClient = StreamChat.getInstance(apikey, apisecret);

export const upsertStreamUser = async (userData) => {
    try {
        if (!userData || !userData.id) {
            throw new Error("Invalid user data: id is required");
        }
        
        // Ensure id is a string
        const userToUpsert = {
            id: userData.id.toString(),
            name: userData.name || "User",
        };
        
        // Only add image if it exists and is not empty
        if (userData.image && userData.image.trim()) {
            userToUpsert.image = userData.image;
        }
        
        await streamClient.upsertUsers([userToUpsert]);
        console.log(`Successfully upserted Stream user: ${userToUpsert.id} - ${userToUpsert.name}`);
        return userToUpsert;
    } catch (error) {
        console.error('Error upserting stream user:', error);
        throw error;
    }
}

export const generatestreamtoken = (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to generate token");
    }
    const userIdStr = userId.toString();
    const token = streamClient.createToken(userIdStr);
    if (!token) {
      throw new Error("Failed to generate token");
    }
    return token;
  } catch (error) {
    console.error('Error generating Stream token:', error);
    throw error;
  }
}