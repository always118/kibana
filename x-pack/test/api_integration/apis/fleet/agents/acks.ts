/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import expect from '@kbn/expect';
import uuid from 'uuid';

import { FtrProviderContext } from '../../../ftr_provider_context';
import { getSupertestWithoutAuth } from './services';

export default function(providerContext: FtrProviderContext) {
  const { getService } = providerContext;
  const esArchiver = getService('esArchiver');
  const esClient = getService('es');

  const supertest = getSupertestWithoutAuth(providerContext);
  let apiKey: { id: string; api_key: string };

  describe('fleet_agents_acks', () => {
    before(async () => {
      await esArchiver.loadIfNeeded('fleet/agents');

      const { body: apiKeyBody } = await esClient.security.createApiKey({
        body: {
          name: `test access api key: ${uuid.v4()}`,
        },
      });
      apiKey = apiKeyBody;
      const {
        body: { _source: agentDoc },
      } = await esClient.get({
        index: '.kibana',
        id: 'agents:agent1',
      });
      agentDoc.agents.access_api_key_id = apiKey.id;
      await esClient.update({
        index: '.kibana',
        id: 'agents:agent1',
        refresh: 'true',
        body: {
          doc: agentDoc,
        },
      });
    });
    after(async () => {
      await esArchiver.unload('fleet/agents');
    });

    it('should return a 401 if this a not a valid acks access', async () => {
      await supertest
        .post(`/api/fleet/agents/agent1/acks`)
        .set('kbn-xsrf', 'xx')
        .set('Authorization', 'ApiKey NOT_A_VALID_TOKEN')
        .send({
          action_ids: [],
        })
        .expect(401);
    });

    it('should return a 200 if this a valid acks access', async () => {
      const { body: apiResponse } = await supertest
        .post(`/api/fleet/agents/agent1/acks`)
        .set('kbn-xsrf', 'xx')
        .set(
          'Authorization',
          `ApiKey ${Buffer.from(`${apiKey.id}:${apiKey.api_key}`).toString('base64')}`
        )
        .send({
          action_ids: ['action1'],
        })
        .expect(200);

      expect(apiResponse.action).to.be('acks');
      expect(apiResponse.success).to.be(true);
    });
  });
}