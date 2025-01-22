import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import 'dotenv/config';
import HttpProxy from '@fastify/http-proxy';

interface SteamRequest extends FastifyRequest {
  query: {
    [key: string]: string | undefined;
  };
}

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.register(HttpProxy, {
    upstream: process.env.STEAM_URL || 'http://api.steampowered.com',
    preHandler: async (request, reply) => {
      // Type assertion to SteamRequest
      const steamRequest = request as SteamRequest;

      // Log the original query parameters
      steamRequest.log.info(`Original query: ${JSON.stringify(steamRequest.query)}`);

      // Parse the incoming query string
      const originalQueryString = request.raw.url?.split('?')[1] || '';
      const parsedQuery = new URLSearchParams(originalQueryString);
      
      // Add the 'key' parameter to the query string
      parsedQuery.set('key', process.env.STEAM_API_KEY || 'null');
      
      // Construct the new URL
      const newUrl = `${request.raw.url?.split('?')[0]}?${parsedQuery.toString()}`;

      // Set the modified URL in the request
      request.raw.url = newUrl;

      // Log the modified query string for debugging
      steamRequest.log.info(`Modified query: ${parsedQuery.toString()}`);
    }
  });
};

export default root;