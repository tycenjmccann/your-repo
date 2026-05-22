import { GET } from '../app/api/health/route';

describe('GET /api/health', () => {
  it('returns status ok with timestamp and uptime', async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(typeof body.timestamp).toBe('string');
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    expect(typeof body.uptime).toBe('number');
    expect(body.uptime).toBeGreaterThanOrEqual(0);
  });
});
