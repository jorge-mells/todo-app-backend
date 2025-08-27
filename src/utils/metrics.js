import client from 'prom-client';

export const register = client.register;

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics();

