import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as googleMaps from './google-maps';

// Mock window.google for geocodeLocation and getDirections
globalThis.window = Object.create(window);
window.google = {
  maps: {
    Geocoder: vi.fn(() => ({
      geocode: vi.fn(),
    })),
    DirectionsService: vi.fn(() => ({
      route: vi.fn(),
    })),
    TravelMode: { DRIVING: 'DRIVING' },
  },
};

describe('cleanHtmlFromInstructions', () => {
  it('removes HTML tags and decodes entities', () => {
    const html = '<b>Turn &lt;left&gt; at Main St &amp; 1st Ave</b>';
    const result = googleMaps.cleanHtmlFromInstructions(html);
    expect(result).toBe('Turn <left> at Main St & 1st Ave');
  });

  it('handles empty string', () => {
    expect(googleMaps.cleanHtmlFromInstructions('')).toBe('');
  });
});

describe('geocodeLocation', () => {
  beforeEach(() => {
    window.google.maps.Geocoder.mockImplementation(() => ({
      geocode: (opts, cb) => {
        if (opts.address === 'valid') {
          cb(
            [
              {
                geometry: { location: { lat: () => 1, lng: () => 2 } },
                formatted_address: 'Test Address',
              },
            ],
            'OK'
          );
        } else {
          cb(null, 'ZERO_RESULTS');
        }
      },
    }));
  });

  it('returns locations for valid address', async () => {
    const result = await googleMaps.geocodeLocation('valid');
    expect(result).toEqual([{ lat: 1, lng: 2, address: 'Test Address' }]);
  });

  it('throws for invalid address', async () => {
    await expect(googleMaps.geocodeLocation('invalid')).rejects.toThrow(
      'Geocoding failed: ZERO_RESULTS'
    );
  });
});

describe('getDirections', () => {
  beforeEach(() => {
    window.google.maps.DirectionsService.mockImplementation(() => ({
      route: (opts, cb) => {
        if (opts.origin === 'A' && opts.destination === 'B') {
          cb(
            {
              routes: [
                {
                  legs: [
                    {
                      start_address: 'A',
                      end_address: 'B',
                      distance: { text: '10 mi' },
                      duration: { text: '20 mins' },
                      steps: [
                        {
                          instructions: '<b>Head north</b>',
                          distance: { text: '5 mi' },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            'OK'
          );
        } else {
          cb(null, 'NOT_FOUND');
        }
      },
    }));
  });

  it('returns directions for valid route', async () => {
    const result = await googleMaps.getDirections('A', 'B');
    expect(result).toEqual({
      summary: {
        from: 'A',
        to: 'B',
        distance: '10 mi',
        duration: '20 mins',
      },
      steps: [{ instruction: 'Head north', distance: '5 mi' }],
    });
  });

  it('throws for invalid route', async () => {
    await expect(googleMaps.getDirections('X', 'Y')).rejects.toThrow(
      'Directions failed: NOT_FOUND'
    );
  });
});
