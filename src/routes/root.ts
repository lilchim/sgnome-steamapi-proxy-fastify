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
      // Re-Type the interface to access arbitrary parameters
      const steamRequest = request as SteamRequest;

      steamRequest.log.info(`Original query: ${JSON.stringify(steamRequest.query)}`);

      // Parse the incoming query string
      const originalQueryString = request.raw.url?.split('?')[1] || '';
      const parsedQuery = new URLSearchParams(originalQueryString);
      
      // Inject the steam key and rewrite the url
      parsedQuery.set('key', process.env.STEAM_API_KEY || 'null');
      const newUrl = `${request.raw.url?.split('?')[0]}?${parsedQuery.toString()}`;

      request.raw.url = newUrl;
      steamRequest.log.info(`Modified query: ${parsedQuery.toString()}`);
    }
  });
};

export default root;